import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from '../src/lib/db/schema';

dotenv.config({ path: '.env.local' });

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(connectionString);
const db = drizzle(sql, { schema });

// Sample prompts data
const testPrompts = [
  // Level 1 - Icebreaker (Mild)
  {
    text: 'What was your first impression of the people here tonight?',
    level: 1,
    intensity: 1,
    isGroup: false,
    isIndian: false,
  },
  {
    text: 'Share a childhood memory that shaped who you are today.',
    level: 2,
    intensity: 2,
    isGroup: false,
    isIndian: false,
  },
  {
    text: 'What is one thing you would change about your upbringing if you could?',
    level: 3,
    intensity: 3,
    isGroup: false,
    isIndian: false,
  },
  {
    text: 'As a group, share your favorite festival memory.',
    level: 1,
    intensity: 1,
    isGroup: true,
    isIndian: true,
  },
  // Add more sample prompts as needed
];

async function main() {
  console.log('🚀 Initializing database...');
  
  try {
    // Check if we already have prompts
    const existingPrompts = await db.select().from(schema.prompts).limit(1);
    
    if (existingPrompts.length > 0) {
      console.log('✅ Database already contains data. Skipping seed.');
      return;
    }
    
    // Insert test prompts
    console.log('🌱 Seeding database with sample prompts...');
    const result = await db.insert(schema.prompts).values(testPrompts).returning();
    
    console.log(`✅ Seeded ${result.length} prompts`);
    console.log('🚀 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sql.end();
    process.exit(0);
  }
}

// Run the main function
main().catch(console.error);
