/**
 * This script imports R-Rated dares from a CSV file.
 * 
 * CSV format:
 * type,intensity,text
 * R-Rated Dare,1,"Share an awkward dating story that you've never told anyone"
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
    const headers = lines[0].split(',');
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle quoted values that may contain commas
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue); // Add the last value
      
      // Create object from headers and values
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].trim();
        const value = values[j]?.trim() || '';
        
        // Remove surrounding quotes if present
        obj[header] = value.replace(/^"(.*)"$/, '$1');
        
        // Convert intensity to number
        if (header === 'intensity') {
          obj[header] = parseInt(obj[header]);
        }
      }
      
      result.push(obj);
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
      body: JSON.stringify({ challenges: dares })
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