/**
 * This script formats and imports prompts from a CSV file.
 * It handles cleaning, standardizing formatting, and ensuring consistent structure.
 * 
 * Usage:
 * node tools/format-and-import-prompts.js tools/full-template.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if file argument is provided
if (process.argv.length < 3) {
  console.error('Please provide a CSV file path');
  console.error('Usage: node format-and-import-prompts.js your-prompts.csv');
  process.exit(1);
}

const csvFilePath = process.argv[2];

/**
 * Formats text properly by:
 * - Removing extra whitespace
 * - Ensuring proper capitalization
 * - Making sure punctuation is consistent
 */
function formatPromptText(text) {
  // Remove extra whitespace
  let formatted = text.trim().replace(/\s+/g, ' ');
  
  // Ensure it starts with a capital letter
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  
  // Ensure it ends with proper punctuation
  if (!['?', '.', '!'].includes(formatted.slice(-1))) {
    formatted += '?';
  }
  
  return formatted;
}

/**
 * Parse and clean the CSV file, ensuring consistent format
 */
function parseAndCleanCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Verify header
  const header = lines[0];
  if (!header.includes('level') || !header.includes('intensity') || !header.includes('text')) {
    console.error('CSV file does not have the expected header structure');
    process.exit(1);
  }
  
  const prompts = [];
  let lineNumber = 0;
  
  for (let i = 1; i < lines.length; i++) {
    lineNumber = i + 1; // +1 for human-readable line numbers
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Parse CSV with proper handling of quoted fields
    const fields = parseCSVLine(lines[i]);
    
    // Validate fields
    if (fields.length < 3) {
      console.warn(`Warning: Line ${lineNumber} has insufficient fields: ${lines[i]}`);
      continue;
    }
    
    // Extract and validate level
    const level = parseInt(fields[0]);
    if (isNaN(level) || level < 1 || level > 3) {
      console.warn(`Warning: Line ${lineNumber} has invalid level: ${fields[0]}`);
      continue;
    }
    
    // Extract and validate intensity
    const intensity = parseInt(fields[1]);
    if (isNaN(intensity) || intensity < 1 || intensity > 3) {
      console.warn(`Warning: Line ${lineNumber} has invalid intensity: ${fields[1]}`);
      continue;
    }
    
    // Extract and format text
    let text = fields[2];
    text = formatPromptText(text);
    
    // Extract or assign category
    let category = fields[3] ? fields[3] : getLevelName(level);
    
    const prompt = {
      level,
      intensity,
      text,
      category,
      isCustom: false,
      userId: null
    };
    
    prompts.push(prompt);
  }
  
  return prompts;
}

/**
 * Parse a CSV line handling quoted fields properly
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField.replace(/^"(.*)"$/, '$1')); // Remove surrounding quotes if present
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField.replace(/^"(.*)"$/, '$1'));
  
  return fields;
}

/**
 * Get level name from level number
 */
function getLevelName(level) {
  switch (level) {
    case 1: return "Icebreaker";
    case 2: return "Getting to Know You";
    case 3: return "Deeper Dive";
    default: return "Icebreaker";
  }
}

/**
 * Verify distribution of prompts to ensure we have adequate coverage
 */
function verifyDistribution(prompts) {
  const distribution = {};
  
  for (let level = 1; level <= 3; level++) {
    distribution[level] = {};
    for (let intensity = 1; intensity <= 3; intensity++) {
      const count = prompts.filter(p => p.level === level && p.intensity === intensity).length;
      distribution[level][intensity] = count;
    }
  }
  
  console.log('Prompt distribution:');
  for (let level = 1; level <= 3; level++) {
    for (let intensity = 1; intensity <= 3; intensity++) {
      console.log(`Level ${level}, Intensity ${intensity}: ${distribution[level][intensity]} prompts`);
    }
  }
  
  // Check if any combination has less than ideal amount
  let hasIssues = false;
  for (let level = 1; level <= 3; level++) {
    for (let intensity = 1; intensity <= 3; intensity++) {
      if (distribution[level][intensity] < 90) {
        console.warn(`Warning: Level ${level}, Intensity ${intensity} has only ${distribution[level][intensity]} prompts. Ideally, it should have at least 90.`);
        hasIssues = true;
      }
    }
  }
  
  if (!hasIssues) {
    console.log('Distribution looks good! All level/intensity combinations have sufficient prompts.');
  }
  
  return distribution;
}

/**
 * Remove duplicates by text comparison (case insensitive)
 */
function removeDuplicates(prompts) {
  const seen = new Set();
  const uniquePrompts = [];
  
  for (const prompt of prompts) {
    const lowerText = prompt.text.toLowerCase();
    if (!seen.has(lowerText)) {
      seen.add(lowerText);
      uniquePrompts.push(prompt);
    }
  }
  
  console.log(`Removed ${prompts.length - uniquePrompts.length} duplicate prompts.`);
  return uniquePrompts;
}

/**
 * Import prompts to the server
 */
async function importPrompts(prompts) {
  // Split prompts into batches of 100 to avoid large payloads
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    batches.push(prompts.slice(i, i + batchSize));
  }
  
  console.log(`Importing ${prompts.length} prompts in ${batches.length} batches...`);
  
  let totalImported = 0;
  
  // Import each batch sequentially
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Importing batch ${i + 1}/${batches.length} (${batch.length} prompts)...`);
    
    // Make the API request
    const requestData = JSON.stringify(batch);
    
    // Create a Promise for the HTTP request
    const importBatch = new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/import/prompts/import',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (err) {
              reject(new Error(`Failed to parse response: ${data}`));
            }
          } else {
            reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.write(requestData);
      req.end();
    });
    
    try {
      const result = await importBatch;
      console.log(`Successfully imported batch ${i + 1}: ${result.count} prompts`);
      totalImported += result.count;
    } catch (err) {
      console.error(`Error importing batch ${i + 1}:`, err.message);
    }
  }
  
  return totalImported;
}

// Main execution
async function main() {
  try {
    console.log(`Processing file: ${csvFilePath}`);
    
    // Parse the CSV file
    const rawPrompts = parseAndCleanCSV(csvFilePath);
    console.log(`Parsed ${rawPrompts.length} prompts from CSV`);
    
    // Remove duplicates
    const uniquePrompts = removeDuplicates(rawPrompts);
    
    // Verify distribution
    verifyDistribution(uniquePrompts);
    
    // Optional: Save to a JSON file as a backup
    const jsonFilePath = path.join(path.dirname(csvFilePath), 'formatted-prompts.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(uniquePrompts, null, 2));
    console.log(`Saved formatted JSON backup to ${jsonFilePath}`);
    
    // Ask for confirmation
    console.log('\nReady to import prompts to the database.');
    console.log('Press Enter to continue or Ctrl+C to cancel...');
    
    // Wait for user confirmation
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
    
    // Import the prompts
    const importedCount = await importPrompts(uniquePrompts);
    console.log(`Successfully imported ${importedCount} prompts.`);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();