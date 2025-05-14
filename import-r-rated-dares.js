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
    
    // Skip the header row (index 0)
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract ID and text from the CSV format
      const match = line.match(/^(\d+),(?:"([^"]*)"|(.*))$/);
      
      if (match) {
        const id = match[1];
        // Match[2] is for quoted text, match[3] is for unquoted text
        const text = match[2] || match[3];
        
        if (text) {
          // Create a challenge object with default values
          result.push({
            text: text,
            type: "R-Rated Dare",
            intensity: Math.min(Math.ceil(parseInt(id) / 33), 3) // Distribute intensities: 1-33 -> 1, 34-66 -> 2, 67-100 -> 3
          });
        }
      }
    }
    
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
  
  const dares = parseCSV(filePath);
  
  if (dares.length === 0) {
    console.error('No dares found in the file or file format is incorrect.');
    console.log('Please ensure the CSV file has headers: type,intensity,text');
    return;
  }
  
  await importDares(dares);
}

// Execute the main function
main();