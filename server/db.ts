import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as gameSchema from "@shared/game-schema";
import dotenv from 'dotenv';

// Load environment variables from .env.local if it exists
try {
  dotenv.config({ path: '.env.local' });
} catch (error) {
  console.warn('No .env.local file found, using default environment variables');
}

// Combine all schemas
type Schema = typeof schema & typeof gameSchema;

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Validate environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set in your environment variables or .env.local file.\n" +
    "Please ensure you have set up your database connection string correctly."
  );
}

// Log database host for debugging (without credentials)
try {
  const url = new URL(databaseUrl);
  console.log(`🔗 Connecting to database at: ${url.hostname}`);
} catch (e) {
  console.warn('⚠️ Could not parse DATABASE_URL');
}

// Create database pool with connection timeout
export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  connectionTimeoutMillis: 10000, // 10 second timeout
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  // Don't crash the app on connection errors
});

// Test the connection on startup
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    const hostname = databaseUrl ? new URL(databaseUrl).hostname : 'unknown';
    throw new Error(
      `Failed to connect to the database. Please check your DATABASE_URL and ensure the database is running.\n` +
      `Current database host: ${hostname}`
    );
  }
}

// Create Drizzle instance with all schemas
export const db = drizzle(pool, { 
  schema: { 
    ...schema, 
    ...gameSchema 
  } as Schema,
  logger: process.env.NODE_ENV === 'development' 
    ? { logQuery: (query, params) => console.log('SQL:', query, params) } 
    : false
});

// Test the database connection when this module is loaded
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch(console.error);
}

// Export database types
export type Database = typeof db;

// Extend Drizzle types with our schema
declare module 'drizzle-orm' {
  interface PgTableWithColumns<TableConfig> {
    $with: {
      [K in keyof Schema]: PgTableWithColumns<TableConfig>;
    };
  }
}

// Helper function to safely access query builder
function getQueryBuilder() {
  const query: Record<string, any> = {};
  
  // Add all tables from both schemas
  for (const [key, table] of Object.entries({ ...schema, ...gameSchema })) {
    if (typeof table === 'object' && table !== null && 'name' in table) {
      query[key] = (db as any).query[key] || {};
    }
  }
  
  return query;
}

// Add query builder extensions
Object.defineProperty(db, 'query', {
  value: getQueryBuilder(),
  enumerable: true,
  configurable: true
});

// Export utility functions
export const dbUtils = {
  // Add any database utility functions here
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return db.transaction(callback);
  }
};