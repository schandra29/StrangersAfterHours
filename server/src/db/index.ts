import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Export schema for use in other files
export * from './schema';
