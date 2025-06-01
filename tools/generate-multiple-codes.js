/**
 * This script generates multiple access codes at once
 * Usage: node tools/generate-multiple-codes.js [COUNT] [DESCRIPTION] [MAX_USAGES]
 * 
 * Example:
 *   node tools/generate-multiple-codes.js 25 "Tester access code" 5
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;

// Generate a random code using characters that are easy to read and type
function generateRandomCode(length = 6) {
  // Using characters that are less likely to be confused with each other
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

async function checkCodeExists(pool, code) {
  const result = await pool.query(
    'SELECT id FROM access_codes WHERE code = $1',
    [code]
  );
  return result.rows.length > 0;
}

async function generateAndInsertCodes() {
  const [,, countStr = "25", description = "Tester access code", maxUsagesStr = "5"] = process.argv;
  
  const count = parseInt(countStr, 10);
  const maxUsages = parseInt(maxUsagesStr, 10);
  
  if (isNaN(count) || count <= 0) {
    console.error("Error: Count must be a positive number");
    process.exit(1);
  }
  
  if (isNaN(maxUsages) || maxUsages <= 0) {
    console.error("Error: Max usages must be a positive number");
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }
  
  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log(`Generating ${count} access codes...`);
    
    const generatedCodes = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a unique code
      let code;
      let isUnique = false;
      
      while (!isUnique) {
        code = generateRandomCode();
        isUnique = !(await checkCodeExists(pool, code));
      }
      
      // Insert the new code into the database
      const result = await pool.query(
        `INSERT INTO access_codes 
         (code, description, is_active, max_usages) 
         VALUES ($1, $2, TRUE, $3) 
         RETURNING code`,
        [code, `${description} #${i+1}`, maxUsages]
      );
      
      generatedCodes.push(result.rows[0].code);
      process.stdout.write(`.`); // Show progress
    }
    
    console.log("\nGenerated codes:");
    console.log("================");
    
    generatedCodes.forEach((code, index) => {
      console.log(`${index+1}. ${code}`);
    });
    
    console.log(`\n${count} access codes generated successfully, each with ${maxUsages} max usages.`);
    
  } catch (error) {
    console.error("Error generating access codes:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the function
generateAndInsertCodes();