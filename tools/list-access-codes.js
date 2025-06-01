/**
 * This script lists all access codes in the database with their usage statistics
 * Usage: node tools/list-access-codes.js
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;

async function listAccessCodes() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }
  
  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Fetching access codes...");
    
    const result = await pool.query(`
      SELECT 
        id, 
        code, 
        description, 
        is_active, 
        usage_count, 
        max_usages, 
        created_at
      FROM 
        access_codes
      ORDER BY 
        created_at DESC;
    `);
    
    if (result.rows.length === 0) {
      console.log("No access codes found");
      return;
    }
    
    console.log("Access Codes:");
    console.log("=============");
    
    for (const code of result.rows) {
      const status = code.is_active ? "ACTIVE" : "INACTIVE";
      const usageLimit = code.max_usages === null ? "∞" : code.max_usages;
      const usagePercent = code.max_usages === null ? 
        "--" : 
        Math.round((code.usage_count / code.max_usages) * 100) + "%";
      
      console.log(`
Code:         ${code.code}
Description:  ${code.description || "N/A"}
Status:       ${status}
Usage:        ${code.usage_count} / ${usageLimit} (${usagePercent})
Created:      ${new Date(code.created_at).toLocaleString()}
      `);
    }
    
  } catch (error) {
    console.error("Error fetching access codes:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the function
listAccessCodes();