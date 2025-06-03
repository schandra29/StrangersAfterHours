import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type Database = PostgresJsDatabase<typeof schema>;
export type DatabasePool = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var db: Database | undefined;
  // eslint-disable-next-line no-var
  var sql: DatabasePool | undefined;
}

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a connection pool if it doesn't exist
const pool = globalThis.sql || postgres(databaseUrl, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create the Drizzle instance with the schema if it doesn't exist
const db: Database = globalThis.db || drizzle(pool, { schema });

// In development, store the connection in the global object to avoid multiple connections during hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.sql = pool;
  globalThis.db = db;
}

// Export the raw pool for cases where you need it
export const sql = pool;

// Export the database client
export { db };

// Helper function to close the database connection
export async function closeConnection() {
  await pool.end();
}

// Test the database connection
export async function testConnection() {
  try {
    const result = await pool`SELECT version()`;
    return {
      success: true,
      version: result[0]?.version || 'Unknown',
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
