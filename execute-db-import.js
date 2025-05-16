/**
 * This script directly imports prompts to the database using the database connection.
 * It will clean up the data formatting and ensure the prompts are correctly imported.
 * 
 * Usage:
 * 1. Edit the new-prompts.csv file with your prompts
 * 2. Run: node execute-db-import.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current file directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    prompts.push(prompt);
  }
  
  return prompts;
}

// Function to clear existing prompts
async function clearExistingPrompts() {
  try {
    const client = await pool.connect();
    try {
      console.log('Clearing existing prompts...');
      const result = await client.query('DELETE FROM prompts');
      console.log(`Cleared ${result.rowCount} existing prompts.`);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error clearing existing prompts:', error);
    return false;
  }
}

// Function to import prompts
async function importPrompts(prompts) {
  try {
    const client = await pool.connect();
    try {
      console.log(`Importing ${prompts.length} prompts...`);
      
      let importedCount = 0;
      
      // Use a transaction to ensure all imports succeed or fail together
      await client.query('BEGIN');
      
      for (const prompt of prompts) {
        const query = `
          INSERT INTO prompts (level, intensity, text, category, is_custom, user_id)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        const values = [
          prompt.level,
          prompt.intensity,
          prompt.text,
          prompt.category,
          prompt.isCustom,
          prompt.userId
        ];
        
        await client.query(query, values);
        importedCount++;
      }
      
      await client.query('COMMIT');
      console.log(`Successfully imported ${importedCount} prompts.`);
      return importedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during import, transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing prompts:', error);
    return 0;
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
      
      // Clear existing prompts
      const cleared = await clearExistingPrompts();
      
      if (cleared) {
        // Import the new prompts
        const importedCount = await importPrompts(prompts);
        console.log(`Import completed. ${importedCount} prompts imported.`);
      } else {
        console.error('Failed to clear existing prompts. Import aborted.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

main();