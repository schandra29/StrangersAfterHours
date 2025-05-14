/**
 * This script pushes the database schema to the database
 * Usage: node tools/push-db.js
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;

// This is a simple script to push the schema directly to the database
// For production, you should use proper migrations
async function pushDb() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }
  
  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Push all tables
  console.log("Creating tables...");
  
  try {
    // Create tables in correct order
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        level INTEGER NOT NULL,
        intensity INTEGER NOT NULL,
        category TEXT NOT NULL,
        is_custom BOOLEAN DEFAULT FALSE NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        text TEXT NOT NULL,
        intensity INTEGER NOT NULL,
        is_custom BOOLEAN DEFAULT FALSE NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        current_level INTEGER DEFAULT 1 NOT NULL,
        current_intensity INTEGER DEFAULT 1 NOT NULL,
        is_drinking_game BOOLEAN DEFAULT FALSE NOT NULL,
        used_prompt_ids JSONB DEFAULT '[]' NOT NULL,
        created_at TEXT NOT NULL,
        total_time_spent INTEGER DEFAULT 0,
        prompts_answered INTEGER DEFAULT 0,
        full_house_moments INTEGER DEFAULT 0,
        level_stats JSONB DEFAULT '{}'
      );
      
      CREATE TABLE IF NOT EXISTS access_codes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        usage_count INTEGER DEFAULT 0 NOT NULL,
        max_usages INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);
    
    console.log("Tables created successfully");
    
    // Create a default access code
    await pool.query(`
      INSERT INTO access_codes (code, description, is_active, max_usages)
      VALUES ('STRANGERS', 'Initial release access code', TRUE, 100)
      ON CONFLICT (code) DO NOTHING;
    `);
    
    console.log("Default access code created");
    
  } catch (error) {
    console.error("Error pushing schema:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

pushDb();