import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config({ path: '.env.local' });

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  try {
    // Run migrations from the migrations folder
    await migrate(db, { 
      migrationsFolder: path.join(__dirname, '../drizzle/migrations') 
    });
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sql.end();
    process.exit(0);
  }
}

// Run the migrations
runMigrations().catch(console.error);
