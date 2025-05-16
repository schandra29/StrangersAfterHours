/**
 * This script imports prompts from full-template.csv more efficiently.
 * 
 * Usage: node optimized-import.js
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
  console.log(`Reading file: ${filePath}`);
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n');
  
  const prompts = [];
  let skippedLines = 0;
  
  // Start from line 1 (skipping the header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Simple CSV parsing for level,intensity,text,category format
    const firstComma = line.indexOf(',');
    const secondComma = line.indexOf(',', firstComma + 1);
    
    if (firstComma === -1 || secondComma === -1) {
      skippedLines++;
      continue;
    }
    
    const level = parseInt(line.substring(0, firstComma).trim());
    const intensity = parseInt(line.substring(firstComma + 1, secondComma).trim());
    
    // Extract the text and category
    const remaining = line.substring(secondComma + 1);
    let text = '';
    let category = '';
    
    // Find the last comma that's not inside quotes
    let lastComma = -1;
    let inQuotes = false;
    for (let j = 0; j < remaining.length; j++) {
      if (remaining[j] === '"') inQuotes = !inQuotes;
      if (remaining[j] === ',' && !inQuotes) lastComma = j;
    }
    
    if (lastComma !== -1) {
      text = remaining.substring(0, lastComma).trim();
      category = remaining.substring(lastComma + 1).trim();
    } else {
      text = remaining.trim();
      category = 'Icebreaker'; // Default category
    }
    
    // Remove surrounding quotes if present
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.substring(1, text.length - 1);
    }
    if (category.startsWith('"') && category.endsWith('"')) {
      category = category.substring(1, category.length - 1);
    }
    
    if (isNaN(level) || isNaN(intensity)) {
      console.warn(`Skipping line ${i+1}: Invalid level or intensity`);
      skippedLines++;
      continue;
    }
    
    // Create a prompt object
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
  
  console.log(`Parsed ${prompts.length} prompts, skipped ${skippedLines} lines`);
  return prompts;
}

// Function to clear and import prompts in one transaction
async function clearAndImportPrompts(prompts) {
  const client = await pool.connect();
  try {
    console.log('Starting transaction...');
    await client.query('BEGIN');
    
    // Clear existing prompts
    console.log('Clearing existing prompts...');
    const clearResult = await client.query('DELETE FROM prompts');
    console.log(`Cleared ${clearResult.rowCount} existing prompts.`);
    
    // Prepare batch insert query
    const insertPromptBatch = async (batch) => {
      const valueStrings = [];
      const values = [];
      let valueIndex = 1;
      
      for (const prompt of batch) {
        valueStrings.push(`($${valueIndex}, $${valueIndex+1}, $${valueIndex+2}, $${valueIndex+3}, $${valueIndex+4}, $${valueIndex+5})`);
        values.push(
          prompt.level,
          prompt.intensity,
          prompt.text,
          prompt.category,
          prompt.isCustom,
          prompt.userId
        );
        valueIndex += 6;
      }
      
      const query = `
        INSERT INTO prompts (level, intensity, text, category, is_custom, user_id)
        VALUES ${valueStrings.join(',')}
      `;
      
      await client.query(query, values);
    };
    
    // Import prompts in batches
    const BATCH_SIZE = 50;
    console.log(`Importing ${prompts.length} prompts in batches of ${BATCH_SIZE}...`);
    
    for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
      const batch = prompts.slice(i, i + BATCH_SIZE);
      await insertPromptBatch(batch);
      console.log(`Imported batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(prompts.length/BATCH_SIZE)}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Transaction committed successfully!');
    return prompts.length;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during import, transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Main function
async function main() {
  const csvPath = path.resolve(__dirname, 'tools/full-template.csv');
  
  try {
    console.log(`Importing prompts from ${csvPath}`);
    const prompts = parseCSV(csvPath);
    
    if (prompts.length > 0) {
      console.log('Sample prompt:', JSON.stringify(prompts[0]));
      
      const importedCount = await clearAndImportPrompts(prompts);
      console.log(`Import completed successfully! ${importedCount} prompts imported.`);
    } else {
      console.error('No prompts found to import!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

main();