/**
 * This script formats existing prompts in the database to ensure consistent formatting.
 * It directly updates the database records without deleting or adding new records.
 * 
 * Usage:
 * node tools/format-existing-prompts.js
 */

import { Pool } from 'pg';

// Environment variables are automatically loaded in Replit

// Create a connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Formats text properly by:
 * - Removing extra whitespace
 * - Ensuring proper capitalization
 * - Making sure punctuation is consistent
 */
function formatPromptText(text) {
  if (!text) return text;
  
  // Remove extra whitespace
  let formatted = text.trim().replace(/\s+/g, ' ');
  
  // Ensure it starts with a capital letter
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  
  // Ensure it ends with proper punctuation
  if (formatted.length > 0 && !['?', '.', '!'].includes(formatted.slice(-1))) {
    formatted += '?';
  }
  
  return formatted;
}

/**
 * Get level name from level number
 */
function getLevelName(level) {
  switch (level) {
    case 1: return "Icebreaker";
    case 2: return "Getting to Know You";
    case 3: return "Deeper Dive";
    default: return "Icebreaker";
  }
}

/**
 * Format categories to match level names
 */
function formatCategory(category, level) {
  if (!category || category.trim() === '') {
    return getLevelName(level);
  }
  
  // Ensure proper capitalization for category
  return category.trim().charAt(0).toUpperCase() + category.trim().slice(1);
}

/**
 * Update all existing prompts with proper formatting
 */
async function formatExistingPrompts() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Get all prompts
    const { rows: prompts } = await client.query('SELECT id, text, level, category FROM prompts');
    console.log(`Found ${prompts.length} prompts to format`);
    
    // Track statistics
    let updated = 0;
    let unchanged = 0;
    let categoryCorrected = 0;
    
    // Update each prompt with proper formatting
    for (const prompt of prompts) {
      const formattedText = formatPromptText(prompt.text);
      const formattedCategory = formatCategory(prompt.category, prompt.level);
      
      if (formattedText !== prompt.text || formattedCategory !== prompt.category) {
        await client.query(
          'UPDATE prompts SET text = $1, category = $2 WHERE id = $3',
          [formattedText, formattedCategory, prompt.id]
        );
        
        if (formattedText !== prompt.text) {
          updated++;
          console.log(`Updated prompt #${prompt.id}: "${prompt.text}" → "${formattedText}"`);
        }
        
        if (formattedCategory !== prompt.category) {
          categoryCorrected++;
          console.log(`Corrected category for prompt #${prompt.id}: "${prompt.category}" → "${formattedCategory}"`);
        }
      } else {
        unchanged++;
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log(`
Format results:
- ${updated} prompts had text formatting corrected
- ${categoryCorrected} prompts had category formatting corrected
- ${unchanged} prompts were already properly formatted
- ${prompts.length} total prompts processed
    `);
    
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error formatting prompts:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Main execution
async function main() {
  try {
    console.log('Starting prompt formatting process...');
    await formatExistingPrompts();
    console.log('Prompt formatting completed successfully');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

main();