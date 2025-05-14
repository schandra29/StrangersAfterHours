/**
 * This script imports dares from our template CSV file.
 * 
 * Usage:
 * 1. Edit the dares-template.csv file with your dares
 * 2. Run: node import-dares.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get current file directory (equivalent to __dirname in CommonJS)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to parse the CSV file
function parseCSV(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  const challenges = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Handle quoted values with commas inside them
    const values = [];
    let currentValue = '';
    let inQuote = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add the last value
    
    const challenge = {};
    for (let j = 0; j < headers.length; j++) {
      challenge[headers[j].trim()] = values[j].replace(/^"|"$/g, '').trim();
    }
    
    // Convert intensity to number
    challenge.intensity = parseInt(challenge.intensity, 10);
    
    // Add default values needed for the database
    challenge.isCustom = false;
    challenge.userId = null;
    
    challenges.push(challenge);
  }
  
  return challenges;
}

// Function to import challenges to the API
async function importDares(dares) {
  try {
    const response = await fetch('http://localhost:5000/api/challenges/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dares),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Successfully imported ${result.count} dares.`);
  } catch (error) {
    console.error('Error importing dares:', error);
  }
}

// Main function
async function main() {
  const templatePath = path.resolve(__dirname, 'dares-template.csv');
  
  console.log(`Importing dares from ${templatePath}`);
  
  try {
    const dares = parseCSV(templatePath);
    console.log(`Found ${dares.length} dares in the CSV file.`);
    
    if (dares.length > 0) {
      await importDares(dares);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();