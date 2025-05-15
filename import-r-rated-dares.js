/**
 * This script imports R-Rated dares from a CSV file.
 * 
 * CSV format:
 * text
 * "Share an awkward dating story that you've never told anyone"
 * 
 * Usage:
 * 1. Edit the r-rated-dares-template.csv file with your dares
 * 2. Run: node import-r-rated-dares.js
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

/**
 * Parses a CSV file and returns an array of objects representing each row
 */
function parseCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    console.log(`Found ${lines.length} lines in the CSV file`);
    
    // Skip the header row (index 0)
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Extract ID and text from the CSV format - handles more formats
      // This regex is more flexible for various CSV formats
      const match = line.match(/^(\d+),\s*(?:"([^"]*)"|([^,]*))$/);
      
      if (match) {
        const id = match[1];
        // Match[2] is for quoted text, match[3] is for unquoted text
        const text = match[2] || match[3];
        
        if (text) {
          // Create a challenge object with default values
          result.push({
            text: text.trim(),
            type: "R-Rated Dare",
            intensity: Math.min(Math.ceil(parseInt(id) / 33), 3) // Distribute intensities: 1-33 -> 1, 34-66 -> 2, 67-100 -> 3
          });
        } else {
          console.warn(`Line ${i+1} has no text content: "${line}"`);
        }
      } else {
        console.warn(`Line ${i+1} did not match expected format: "${line}"`);
        
        // Attempt to salvage the line using a more lenient approach
        const parts = line.split(',');
        if (parts.length >= 2) {
          const id = parts[0].trim();
          // Join the rest of the parts and remove quotes if present
          let text = parts.slice(1).join(',').trim();
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
          }
          
          if (/^\d+$/.test(id) && text) {
            console.log(`Salvaged line ${i+1}: ID=${id}, Text="${text}"`);
            result.push({
              text: text.trim(),
              type: "R-Rated Dare",
              intensity: Math.min(Math.ceil(parseInt(id) / 33), 3)
            });
          }
        }
      }
    }
    
    console.log(`Successfully parsed ${result.length} R-Rated dares out of ${lines.length-1} entries`);
    return result;
  } catch (err) {
    console.error('Error parsing CSV:', err);
    return [];
  }
}

/**
 * Imports dares to the backend API
 */
async function importDares(dares) {
  try {
    console.log(`Importing ${dares.length} R-Rated dares...`);
    
    const response = await fetch('http://localhost:5000/api/challenges/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dares) // Send the array directly, not as a property
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`Successfully imported ${result.count} R-Rated dares.`);
  } catch (err) {
    console.error('Failed to import dares:', err);
  }
}

/**
 * Main function
 */
async function main() {
  // Get the current file's directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const filePath = path.join(__dirname, 'r-rated-dares-template.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.log('Please edit r-rated-dares-template.csv with your R-Rated dares and try again.');
    return;
  }
  
  console.log('===== R-RATED DARES IMPORT PROCESS =====');
  console.log(`Reading from file: ${filePath}`);
  
  // Check if file content is valid
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const firstChar = content.trim().charAt(0);
    if (!/[a-zA-Z0-9]/.test(firstChar)) {
      console.error('Warning: File may contain invalid characters at the beginning');
      // Try to display useful diagnostic info
      console.log('First 50 characters:', content.substring(0, 50).replace(/\n/g, '\\n'));
      console.log('File encoding might not be UTF-8');
    }
  } catch (err) {
    console.error('Error reading file:', err.message);
    return;
  }
  
  const dares = parseCSV(filePath);
  
  if (dares.length === 0) {
    console.error('No dares found in the file or file format is incorrect.');
    console.log('Please ensure the CSV file has headers in the first row with columns:');
    console.log('  Dare ID,Dare Text');
    console.log('And data rows like:');
    console.log('  1,"Give the person to your left a lap dance for 30 seconds."');
    return;
  }
  
  // Log some diagnostic information
  console.log('\nSample dares to be imported:');
  for (let i = 0; i < Math.min(3, dares.length); i++) {
    console.log(`  ${i+1}. "${dares[i].text}" (Intensity: ${dares[i].intensity})`);
  }
  console.log(`  ...and ${dares.length - 3} more dares\n`);
  
  await importDares(dares);
  
  console.log('\nImport process completed.');
  console.log('===================================');
}

// Execute the main function
main();