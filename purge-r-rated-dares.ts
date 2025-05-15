/**
 * This script purges all existing R-Rated dares and reimports them from the template file.
 * This ensures R-Rated dares exist in a separate silo from regular dares with no spillover.
 */

import { db } from './server/db';
import { eq } from 'drizzle-orm';
import { challenges } from './shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface Dare {
  text: string;
  type: string;
  intensity: number;
  isCustom: boolean;
  userId: number | null;
}

/**
 * Deletes all existing R-Rated dares from the database
 */
async function purgeRRatedDares() {
  try {
    console.log('===== PURGING EXISTING R-RATED DARES =====');
    
    // Count existing R-Rated dares before deletion
    const rRatedDares = await db
      .select()
      .from(challenges)
      .where(eq(challenges.type, 'R-Rated Dare'));
      
    console.log(`Found ${rRatedDares.length} existing R-Rated dares`);
    
    // Delete all R-Rated dares
    const deleteResult = await db
      .delete(challenges)
      .where(eq(challenges.type, 'R-Rated Dare'))
      .returning({ id: challenges.id });
    
    console.log(`Successfully deleted ${deleteResult.length} R-Rated dares`);
    
    // Verify deletion
    const remainingDares = await db
      .select()
      .from(challenges)
      .where(eq(challenges.type, 'R-Rated Dare'));
      
    console.log(`Remaining R-Rated dares: ${remainingDares.length}`);
    
    return deleteResult.length;
  } catch (error) {
    console.error('Error purging R-Rated dares:', error);
    throw error;
  }
}

/**
 * Parses the R-Rated dares CSV file and returns an array of dare objects
 */
function parseCSV(filePath: string): Dare[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    console.log(`Found ${lines.length} lines in the CSV file`);
    
    // Skip the header row (index 0)
    const result: Dare[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Extract ID and text from the CSV format
      const match = line.match(/^(\d+),\s*(?:"([^"]*)"|([^,]*))$/);
      
      if (match) {
        const id = match[1];
        // Match[2] is for quoted text, match[3] is for unquoted text
        const text = match[2] || match[3];
        
        if (text) {
          // Create a challenge object with default values
          result.push({
            text: text.trim(),
            type: "R-Rated Dare",
            intensity: Math.min(Math.ceil(parseInt(id) / 33), 3), // Distribute intensities: 1-33 -> 1, 34-66 -> 2, 67-100 -> 3
            isCustom: false,
            userId: null
          });
        } else {
          console.warn(`Line ${i+1} has no text content: "${line}"`);
        }
      } else {
        console.warn(`Line ${i+1} did not match expected format: "${line}"`);
        
        // Attempt to salvage the line using a more lenient approach
        const parts = line.split(',');
        if (parts.length >= 2) {
          const id = parts[0].trim();
          // Join the rest of the parts and remove quotes if present
          let text = parts.slice(1).join(',').trim();
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
          }
          
          if (/^\d+$/.test(id) && text) {
            console.log(`Salvaged line ${i+1}: ID=${id}, Text="${text}"`);
            result.push({
              text: text.trim(),
              type: "R-Rated Dare",
              intensity: Math.min(Math.ceil(parseInt(id) / 33), 3),
              isCustom: false,
              userId: null
            });
          }
        }
      }
    }
    
    console.log(`Successfully parsed ${result.length} R-Rated dares out of ${lines.length-1} entries`);
    return result;
  } catch (err) {
    console.error('Error parsing CSV:', err);
    return [];
  }
}

/**
 * Imports R-Rated dares directly to the database
 */
async function importDares(dares: Dare[]) {
  try {
    console.log(`Importing ${dares.length} R-Rated dares directly to database...`);
    
    // Insert all dares in one batch
    const result = await db.insert(challenges).values(dares).returning({ id: challenges.id });
    
    console.log(`Successfully imported ${result.length} R-Rated dares.`);
    return result.length;
  } catch (err) {
    console.error('Failed to import dares:', err);
    throw err;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get the current file's directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const filePath = path.join(__dirname, 'r-rated-dares-template.csv');
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      console.log('Please edit r-rated-dares-template.csv with your R-Rated dares and try again.');
      return;
    }
    
    console.log('===== R-RATED DARES CLEANUP AND IMPORT PROCESS =====');
    console.log(`Reading from file: ${filePath}`);
    
    // First purge existing R-Rated dares
    await purgeRRatedDares();
    
    // Parse the CSV file
    const dares = parseCSV(filePath);
    
    if (dares.length === 0) {
      console.error('No dares found in the file or file format is incorrect.');
      console.log('Please ensure the CSV file has headers in the first row with columns:');
      console.log('  Dare ID,Dare Text');
      console.log('And data rows like:');
      console.log('  1,"Give the person to your left a lap dance for 30 seconds."');
      return;
    }
    
    // Log some diagnostic information
    console.log('\nSample dares to be imported:');
    for (let i = 0; i < Math.min(3, dares.length); i++) {
      console.log(`  ${i+1}. "${dares[i].text}" (Intensity: ${dares[i].intensity})`);
    }
    console.log(`  ...and ${dares.length - 3} more dares\n`);
    
    // Import dares directly to the database
    await importDares(dares);
    
    // Verify the import
    const finalDares = await db
      .select()
      .from(challenges)
      .where(eq(challenges.type, 'R-Rated Dare'));
      
    console.log(`Final count of R-Rated dares in database: ${finalDares.length}`);
    
    console.log('\nImport process completed successfully.');
    console.log('================================================');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Execute the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});