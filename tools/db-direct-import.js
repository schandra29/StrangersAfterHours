/**
 * This script imports prompts directly to the database
 * Usage: node db-direct-import.js full-template.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import readline from 'readline';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Determine which CSV file to use
const csvFileName = process.argv[2] || 'full-template.csv';
const csvPath = path.join(__dirname, csvFileName);
console.log(`Using CSV file: ${csvPath}`);

// Parse CSV file with proper handling of quotes
async function parseCSV(filePath) {
  const prompts = [];
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  // Skip header row
  let isFirstLine = true;
  
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    
    if (!line.trim()) continue;
    
    // Handle CSV parsing with quoted fields
    let fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField); // Add the last field
    
    // Remove quotes from fields
    fields = fields.map(field => {
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.substring(1, field.length - 1);
      }
      return field;
    });
    
    if (fields.length >= 3) {
      const level = parseInt(fields[0]);
      const intensity = parseInt(fields[1]);
      const text = fields[2];
      let category = fields[3];
      
      // Default category if not provided
      if (!category) {
        switch (level) {
          case 1: category = "Icebreaker"; break;
          case 2: category = "Getting to Know You"; break;
          case 3: category = "Deeper Dive"; break;
          default: category = "Icebreaker";
        }
      }
      
      prompts.push({
        level,
        intensity,
        text,
        category,
        isCustom: false,
        userId: null
      });
    }
  }
  
  return prompts;
}

// Import prompts to database
async function importPrompts(prompts) {
  console.log(`Importing ${prompts.length} prompts...`);
  
  // Clear existing prompts
  await pool.query('DELETE FROM prompts');
  
  // Import in batches to avoid statement size limits
  const batchSize = 50;
  let successCount = 0;
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, Math.min(i + batchSize, prompts.length));
    console.log(`Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(prompts.length/batchSize)} (${batch.length} prompts)...`);
    
    try {
      const values = batch.map((p, idx) => 
        `(${i + idx + 1}, '${p.text.replace(/'/g, "''")}', ${p.level}, ${p.intensity}, '${p.category.replace(/'/g, "''")}', ${p.isCustom}, ${p.userId === null ? 'NULL' : p.userId})`
      ).join(',');
      
      const query = `INSERT INTO prompts (id, text, level, intensity, category, "isCustom", "userId") VALUES ${values}`;
      await pool.query(query);
      successCount += batch.length;
    } catch (err) {
      console.error(`Error importing batch:`, err.message);
    }
  }
  
  console.log(`Successfully imported ${successCount} prompts.`);
}

// Main function
async function main() {
  try {
    const prompts = await parseCSV(csvPath);
    console.log(`Parsed ${prompts.length} prompts from CSV.`);
    
    await importPrompts(prompts);
    
    // Close the database connection
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();