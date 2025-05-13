// Import challenges from a CSV file

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine which CSV file to use
const csvFileName = process.argv[2] || 'challenges-template.csv';
const csvPath = path.join(__dirname, csvFileName);
console.log(`Using CSV file: ${csvPath}`);
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

// Skip header row
const challenges = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Simple parsing for our known CSV format
  const parts = line.split(',');
  if (parts.length >= 3) {
    // Extract the type (might be in quotes)
    let type = parts[0];
    if (type.startsWith('"') && type.endsWith('"')) {
      type = type.slice(1, -1);
    }
    
    const intensity = parseInt(parts[1]);
    
    // Extract the text which might contain commas and be in quotes
    let text = parts.slice(2).join(',');
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
    }
    
    challenges.push({
      type,
      intensity,
      text,
      isCustom: false,
      userId: null
    });
  }
}

console.log(`Parsed ${challenges.length} challenges from CSV`);

// Function to import challenges in batches
async function importChallenges() {
  const batchSize = 10; // Import 10 at a time to avoid issues
  let imported = 0;
  
  for (let i = 0; i < challenges.length; i += batchSize) {
    const batch = challenges.slice(i, i + batchSize);
    console.log(`Importing batch ${i/batchSize + 1}/${Math.ceil(challenges.length/batchSize)}...`);
    
    try {
      const response = await fetch('http://localhost:5000/api/import/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challenges: batch }),
      });
      
      const data = await response.json();
      imported += data.count || 0;
      
      console.log(`Batch imported: ${data.count} challenges`);
    } catch (err) {
      console.error('Error importing batch:', err);
    }
    
    // Small delay to not overwhelm the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Total imported: ${imported} challenges`);
}

importChallenges().catch(err => {
  console.error('Import failed:', err);
});