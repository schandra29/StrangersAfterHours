/**
 * This script imports R-rated dares from our CSV file.
 * 
 * Usage:
 * 1. Edit the new-r-rated-dares.csv file with your dares
 * 2. Run: node import-r-rated-dares-fixed.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get current file directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to parse the CSV file
function parseCSV(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n');
  
  const challenges = [];
  
  // Start from line 1 (skipping the header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // The CSV has format: Dare ID,Dare text
    // We need to parse the CSV correctly to extract the text
    const match = line.match(/^(\d+),(.+)$/);
    
    if (!match) {
      console.warn(`Warning: Line ${i+1} doesn't match expected format`);
      continue;
    }
    
    // Extract the text portion (which might be quoted)
    let text = match[2].trim();
    
    // Remove surrounding quotes if present
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.substring(1, text.length - 1);
    }
    
    // Create a challenge object with all required fields - be sure to mark it as R-Rated
    const challenge = {
      text: text,
      type: "R-Rated Dare",
      intensity: 1, // Assign intensity level 1 to make it accessible at all intensity levels
      isCustom: false,
      userId: null
    };
    
    challenges.push(challenge);
  }
  
  return challenges;
}

// Function to import challenges to the API
async function importDares(dares) {
  try {
    console.log(`Attempting to import ${dares.length} R-rated dares...`);
    
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
    console.log(`Successfully imported ${result.count} R-rated dares.`);
  } catch (error) {
    console.error('Error importing R-rated dares:', error);
  }
}

// Main function
async function main() {
  const templatePath = path.resolve(__dirname, 'new-r-rated-dares.csv');
  
  console.log(`Importing R-rated dares from ${templatePath}`);
  
  try {
    const dares = parseCSV(templatePath);
    console.log(`Found ${dares.length} R-rated dares in the CSV file.`);
    
    // Log a sample dare to verify the parsing
    if (dares.length > 0) {
      console.log('Sample R-rated dare:', JSON.stringify(dares[0]));
      await importDares(dares);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();