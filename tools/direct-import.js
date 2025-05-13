// Import the prompts directly using fetch

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the sample CSV file
const csvPath = path.join(__dirname, 'sample-prompts.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

// Skip header row
const prompts = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Simple parsing for our known CSV format
  const parts = line.split(',');
  if (parts.length >= 3) {
    const level = parseInt(parts[0]);
    const intensity = parseInt(parts[1]);
    
    // Extract the text which might contain commas and be in quotes
    let text = parts.slice(2).join(',');
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
    }
    
    // Extract category if available
    let category;
    if (text.includes('","')) {
      const lastQuotePos = text.lastIndexOf('","');
      category = text.substring(lastQuotePos + 3, text.length - 1);
      text = text.substring(0, lastQuotePos);
    } else {
      // Default category based on level
      switch (level) {
        case 1: category = "Icebreaker"; break;
        case 2: category = "Getting to Know You"; break;
        case 3: category = "Deeper Dive"; break;
        default: category = "Icebreaker";
      }
    }
    
    prompts.push({
      text,
      level,
      intensity,
      category,
      isCustom: false,
      userId: null
    });
  }
}

console.log(`Parsed ${prompts.length} prompts from CSV`);

// Function to import prompts in batches
async function importPrompts() {
  const batchSize = 10; // Import 10 at a time to avoid issues
  let imported = 0;
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    console.log(`Importing batch ${i/batchSize + 1}/${Math.ceil(prompts.length/batchSize)}...`);
    
    try {
      const response = await fetch('http://localhost:5000/api/import/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts: batch }),
      });
      
      const data = await response.json();
      imported += data.count || 0;
      
      console.log(`Batch imported: ${data.count} prompts`);
    } catch (err) {
      console.error('Error importing batch:', err);
    }
    
    // Small delay to not overwhelm the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Total imported: ${imported} prompts`);
}

importPrompts().catch(err => {
  console.error('Import failed:', err);
});