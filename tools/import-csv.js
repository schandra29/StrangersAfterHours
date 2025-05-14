/**
 * This script imports prompts from a CSV file.
 * 
 * The expected CSV format is:
 * level,intensity,text,category
 * 1,1,"If you could have dinner with any historical figure, who would it be and why?","Icebreaker"
 * 
 * Usage:
 * 1. Create a CSV file with your prompts
 * 2. Run: node import-csv.js your-prompts.csv
 * 3. The script will convert them to JSON and then use the API to import them
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
  console.error('Usage: node import-csv.js your-prompts.csv');
  process.exit(1);
}

const csvFilePath = process.argv[2];

// Read and parse the CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  
  const prompts = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Handle quoted fields with commas inside them
    let fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField); // Add the last field
    
    // Remove quotes from fields
    fields = fields.map(field => {
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.substring(1, field.length - 1);
      }
      return field;
    });
    
    const prompt = {
      level: parseInt(fields[0]),
      intensity: parseInt(fields[1]),
      text: fields[2],
      category: fields[3] || getLevelName(parseInt(fields[0])), // Use default category if not provided
      isCustom: false,
      userId: null
    };
    
    prompts.push(prompt);
  }
  
  return prompts;
}

// Helper function to get level name from level number
function getLevelName(level) {
  switch (level) {
    case 1: return "Icebreaker";
    case 2: return "Getting to Know You";
    case 3: return "Deeper Dive";
    default: return "Icebreaker";
  }
}

// Import the prompts using the API
async function importPrompts(prompts) {
  // Split prompts into batches of 100 to avoid large payloads
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    batches.push(prompts.slice(i, i + batchSize));
  }
  
  console.log(`Importing ${prompts.length} prompts in ${batches.length} batches...`);
  
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
    } catch (err) {
      console.error(`Error importing batch ${i + 1}:`, err.message);
    }
  }
}

// Main execution
try {
  // Parse the CSV file
  const prompts = parseCSV(csvFilePath);
  console.log(`Parsed ${prompts.length} prompts from CSV`);
  
  // Optional: Save to a JSON file as a backup
  const jsonFilePath = path.join(path.dirname(csvFilePath), path.basename(csvFilePath, '.csv') + '.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify({ prompts }, null, 2));
  console.log(`Saved JSON backup to ${jsonFilePath}`);
  
  // Import the prompts
  importPrompts(prompts).then(() => {
    console.log('Import process completed');
  }).catch(err => {
    console.error('Import process failed:', err);
  });
  
} catch (err) {
  console.error('Error:', err.message);
}