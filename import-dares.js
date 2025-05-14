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
  
  const challenges = [];
  
  // Start from line 1 (skipping the header)
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Get the text of the dare
    const text = lines[i].trim();
    if (!text) continue;
    
    // Create a challenge object with all required fields
    const challenge = {
      text: text.replace(/^"|"$/g, ''), // Remove quotes if present
      type: "Dare",
      // Assign random intensity between 1-3
      intensity: Math.floor(Math.random() * 3) + 1,
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