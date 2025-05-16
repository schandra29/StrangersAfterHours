/**
 * This script directly imports R-rated dares to the database using the database connection.
 * It will clean up the data formatting and ensure the dares are correctly imported.
 * 
 * Usage:
 * 1. Edit the new-r-rated-dares.csv file with your dares
 * 2. Run: node execute-db-import-dares.js
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
  
  const dares = [];
  
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
    const dare = {
      text: text,
      type: "R-Rated Dare",
      intensity: 1, // Assign intensity level 1 to make it accessible at all intensity levels
      isCustom: false,
      userId: null
    };
    
    dares.push(dare);
  }
  
  return dares;
}

// Function to clear existing R-rated dares
async function clearExistingRRatedDares() {
  try {
    const client = await pool.connect();
    try {
      console.log('Clearing existing R-rated dares...');
      const result = await client.query("DELETE FROM challenges WHERE type = 'R-Rated Dare'");
      console.log(`Cleared ${result.rowCount} existing R-rated dares.`);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error clearing existing R-rated dares:', error);
    return false;
  }
}

// Function to import dares
async function importDares(dares) {
  try {
    const client = await pool.connect();
    try {
      console.log(`Importing ${dares.length} R-rated dares...`);
      
      let importedCount = 0;
      
      // Use a transaction to ensure all imports succeed or fail together
      await client.query('BEGIN');
      
      for (const dare of dares) {
        const query = `
          INSERT INTO challenges (type, text, intensity, is_custom, user_id)
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        const values = [
          dare.type,
          dare.text,
          dare.intensity,
          dare.isCustom,
          dare.userId
        ];
        
        await client.query(query, values);
        importedCount++;
      }
      
      await client.query('COMMIT');
      console.log(`Successfully imported ${importedCount} R-rated dares.`);
      return importedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during import, transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing R-rated dares:', error);
    return 0;
  }
}

// Main function
async function main() {
  const daresPath = path.resolve(__dirname, 'new-r-rated-dares.csv');
  
  console.log(`Importing R-rated dares from ${daresPath}`);
  
  try {
    const dares = parseCSV(daresPath);
    console.log(`Found ${dares.length} R-rated dares in the CSV file.`);
    
    // Log a sample dare to verify the parsing
    if (dares.length > 0) {
      console.log('Sample R-rated dare:', JSON.stringify(dares[0]));
      
      // Clear existing R-rated dares
      const cleared = await clearExistingRRatedDares();
      
      if (cleared) {
        // Import the new R-rated dares
        const importedCount = await importDares(dares);
        console.log(`Import completed. ${importedCount} R-rated dares imported.`);
      } else {
        console.error('Failed to clear existing R-rated dares. Import aborted.');
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