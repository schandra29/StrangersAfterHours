import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test the database connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper to run queries with better error handling
export async function query<T = any>(
  text: string,
  params?: any[],
  errorMessage = 'Database error'
): Promise<{ rows: T[]; rowCount: number }> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    client.release();
  }
}

// Initialize database schema
export async function initDb() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        text TEXT NOT NULL,
        level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 3),
        intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 3),
        is_group BOOLEAN DEFAULT FALSE,
        is_indian_context BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_prompts_level_intensity 
      ON prompts(level, intensity, is_group, is_active);

      CREATE INDEX IF NOT EXISTS idx_prompts_active 
      ON prompts(is_active);
    `, [], 'Failed to create tables');
    
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}
