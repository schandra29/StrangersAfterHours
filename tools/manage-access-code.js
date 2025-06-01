/**
 * This script allows management of access codes (activate/deactivate or change max usages)
 * Usage: 
 *   node tools/manage-access-code.js activate CODE
 *   node tools/manage-access-code.js deactivate CODE
 *   node tools/manage-access-code.js set-max-usages CODE 10
 * 
 * Example:
 *   node tools/manage-access-code.js deactivate STRANGERS
 *   node tools/manage-access-code.js set-max-usages ABC123 15
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;

async function manageAccessCode() {
  const [,, action, code, value] = process.argv;
  
  if (!action || !code) {
    console.error(`
Usage:
  node tools/manage-access-code.js activate CODE
  node tools/manage-access-code.js deactivate CODE
  node tools/manage-access-code.js set-max-usages CODE 10
`);
    process.exit(1);
  }
  
  if (action === 'set-max-usages' && !value) {
    console.error('Error: Max usages value is required for set-max-usages action');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }
  
  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Check if the code exists
    const checkResult = await pool.query(
      'SELECT * FROM access_codes WHERE code = $1',
      [code]
    );
    
    if (checkResult.rows.length === 0) {
      console.error(`Error: Access code '${code}' not found`);
      process.exit(1);
    }
    
    const existingCode = checkResult.rows[0];
    
    // Perform the requested action
    switch (action) {
      case 'activate':
        await pool.query(
          'UPDATE access_codes SET is_active = TRUE WHERE code = $1',
          [code]
        );
        console.log(`Access code '${code}' activated successfully`);
        break;
        
      case 'deactivate':
        await pool.query(
          'UPDATE access_codes SET is_active = FALSE WHERE code = $1',
          [code]
        );
        console.log(`Access code '${code}' deactivated successfully`);
        break;
        
      case 'set-max-usages':
        const maxUsages = parseInt(value, 10);
        if (isNaN(maxUsages) || maxUsages < 0) {
          console.error('Error: Max usages must be a non-negative number');
          process.exit(1);
        }
        
        await pool.query(
          'UPDATE access_codes SET max_usages = $1 WHERE code = $2',
          [maxUsages, code]
        );
        console.log(`Max usages for access code '${code}' set to ${maxUsages}`);
        break;
        
      default:
        console.error(`Error: Unknown action '${action}'`);
        process.exit(1);
    }
    
    // Display updated code information
    const updatedResult = await pool.query(
      'SELECT * FROM access_codes WHERE code = $1',
      [code]
    );
    
    const updatedCode = updatedResult.rows[0];
    const status = updatedCode.is_active ? "ACTIVE" : "INACTIVE";
    const usageLimit = updatedCode.max_usages === null ? "∞" : updatedCode.max_usages;
    const usagePercent = updatedCode.max_usages === null ? 
      "--" : 
      Math.round((updatedCode.usage_count / updatedCode.max_usages) * 100) + "%";
    
    console.log(`
Updated Access Code:
===================
Code:         ${updatedCode.code}
Description:  ${updatedCode.description || "N/A"}
Status:       ${status}
Usage:        ${updatedCode.usage_count} / ${usageLimit} (${usagePercent})
Created:      ${new Date(updatedCode.created_at).toLocaleString()}
    `);
    
  } catch (error) {
    console.error("Error managing access code:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the function
manageAccessCode();