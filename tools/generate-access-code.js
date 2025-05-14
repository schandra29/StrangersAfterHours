/**
 * This script generates a random access code and adds it to the database
 * Usage: node tools/generate-access-code.js [DESCRIPTION] [MAX_USAGES]
 * 
 * Example:
 *   node tools/generate-access-code.js "Beta tester group 2"
 *   node tools/generate-access-code.js "Limited access for review" 3
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import fetch from 'node-fetch';

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

async function generateAndInsertCode() {
  const [,, description = "Generated access code", maxUsages = 5] = process.argv;
  
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }
  
  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Generate a unique code
    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = generateRandomCode();
      isUnique = !(await checkCodeExists(pool, code));
    }
    
    console.log(`Generated unique access code: ${code}`);
    
    // Insert the new code into the database
    const result = await pool.query(
      `INSERT INTO access_codes 
       (code, description, is_active, max_usages) 
       VALUES ($1, $2, TRUE, $3) 
       RETURNING *`,
      [code, description, parseInt(maxUsages, 10)]
    );
    
    const newCode = result.rows[0];
    
    console.log(`
Access Code Created:
===================
Code:         ${newCode.code}
Description:  ${newCode.description || "N/A"}
Max Usages:   ${newCode.max_usages}
Created:      ${new Date(newCode.created_at).toLocaleString()}
    `);
    
  } catch (error) {
    console.error("Error generating access code:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the function
generateAndInsertCode();