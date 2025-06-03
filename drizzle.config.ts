import { defineConfig } from 'drizzle-kit';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Generate migrations for all tables
  schemaFilter: ['public'],
  // Generate verbose migration files
  verbose: true,
  // Always ask for confirmation before applying migrations
  strict: true
});
