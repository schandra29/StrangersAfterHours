/**
 * This script imports prompts from our CSV file, with proper formatting.
 * 
 * Usage:
 * 1. Edit the new-prompts.csv file with your prompts
 * 2. Run: node import-prompts.js
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
  
  const prompts = [];
  
  // Start from line 1 (skipping the header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Parse CSV row - handle quoted values correctly
    let parts = [];
    let inQuotes = false;
    let currentValue = '';
    let escapeNext = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (escapeNext) {
        currentValue += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      
      if (char === ',' && !inQuotes) {
        parts.push(currentValue);
        currentValue = '';
        continue;
      }
      
      currentValue += char;
    }
    
    // Don't forget the last part
    parts.push(currentValue);
    
    if (parts.length < 4) {
      console.warn(`Skipping line ${i+1}: Not enough columns`);
      continue;
    }
    
    const level = parseInt(parts[0]);
    const intensity = parseInt(parts[1]);
    const text = parts[2];
    const category = parts[3];
    
    if (isNaN(level) || isNaN(intensity)) {
      console.warn(`Skipping line ${i+1}: Invalid level or intensity`);
      continue;
    }
    
    // Create a prompt object with all required fields
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

// Function to import prompts to the API
async function importPrompts(prompts) {
  try {
    console.log(`Attempting to import ${prompts.length} prompts...`);
    
    const response = await fetch('http://localhost:5000/api/prompts/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompts),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Successfully imported ${result.count} prompts.`);
  } catch (error) {
    console.error('Error importing prompts:', error);
  }
}

// Main function
async function main() {
  const promptsPath = path.resolve(__dirname, 'new-prompts.csv');
  
  console.log(`Importing prompts from ${promptsPath}`);
  
  try {
    const prompts = parseCSV(promptsPath);
    console.log(`Found ${prompts.length} prompts in the CSV file.`);
    
    // Log a sample prompt to verify the parsing
    if (prompts.length > 0) {
      console.log('Sample prompt:', JSON.stringify(prompts[0]));
      await importPrompts(prompts);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();