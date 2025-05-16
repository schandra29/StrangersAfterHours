/**
 * This script imports prompts directly to the database using the existing API.
 * It doesn't require admin privileges.
 * 
 * Usage:
 * 1. Edit the new-prompts.csv file with your prompts
 * 2. Run: node direct-import-prompts.js
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
    
    // Split by comma, but respect quoted values
    let parts = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      
      if (char === ',' && !inQuotes) {
        parts.push(currentValue.trim());
        currentValue = '';
        continue;
      }
      
      currentValue += char;
    }
    
    // Don't forget the last part
    parts.push(currentValue.trim());
    
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

// Function to import a single prompt
async function importPrompt(prompt) {
  try {
    const response = await fetch('http://localhost:5000/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error importing prompt "${prompt.text.substring(0, 30)}...":`, error.message);
    return false;
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
      
      // Import each prompt individually
      console.log('Starting to import prompts one by one...');
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < prompts.length; i++) {
        const success = await importPrompt(prompts[i]);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
        // Log progress every 10 prompts
        if ((i + 1) % 10 === 0 || i === prompts.length - 1) {
          console.log(`Progress: ${i + 1}/${prompts.length} prompts processed (${successCount} succeeded, ${failCount} failed)`);
        }
      }
      
      console.log(`\nImport complete! ${successCount} prompts imported successfully, ${failCount} prompts failed.`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();