import { db } from '../server/db';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Define types for our seed data
type Activity = {
  name: string;
  description: string;
  duration: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type PromptPack = {
  name: string;
  description: string;
  unlockThreshold: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const seedActivities: Activity[] = [
  {
    name: 'Bollywood Charades',
    description: 'Act out a Bollywood movie title without speaking. Others guess within 30 seconds!',
    duration: 30
  },
  {
    name: 'Festival Memory Mashup',
    description: 'Share a festival memory in one word. The group creates a fun story from the words!',
    duration: 45
  },
  {
    name: 'Song Swap',
    description: 'Name a song that lifts your mood. No explanations needed!',
    duration: 30
  },
  {
    name: 'Street Food Swap',
    description: 'Name a street food you\'d bring to a party. Group votes on the most tempting one!',
    duration: 30
  },
  {
    name: 'Dialogue Mashup',
    description: 'Deliver a famous Bollywood dialogue in a funny accent!',
    duration: 30
  },
  {
    name: 'Rapid-Fire Q&A',
    description: 'Answer 30 seconds of rapid yes/no questions!',
    duration: 30
  },
  {
    name: 'Guess the Festival',
    description: 'Describe a festival in three clues. Others guess which one it is!',
    duration: 45
  },
  {
    name: 'Memory Chain',
    description: 'Build a chain of related words. Don\'t break it!',
    duration: 30
  },
  {
    name: 'Cultural Swap',
    description: 'Share one cultural item you\'d gift the group.',
    duration: 30
  },
  {
    name: 'Soundtrack Challenge',
    description: 'Hum or whistle a song for 10 seconds. Others guess it!',
    duration: 30
  }
];

const seedPromptPacks: Omit<PromptPack, 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Spicy Bollywood Challenges',
    description: 'Dare to take on these Bollywood-inspired dares!',
    unlockThreshold: 10,
    isActive: true
  },
  {
    name: 'Festival Frenzy',
    description: 'Celebrate with these festival-themed prompts!',
    unlockThreshold: 20,
    isActive: true
  }
];

// Helper function to add timestamps to seed data
function withTimestamps<T extends Activity | PromptPack>(items: T[]): (T & { createdAt: Date; updatedAt: Date })[] {
  const now = new Date();
  return items.map(item => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }));
}

console.log('🚀 Starting seed script...');

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Add error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('\nEnvironment Variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'postgresql://' + process.env.DATABASE_URL.split('@')[1] : 'Not set'}`);
console.log(`- Current directory: ${process.cwd()}`);
console.log(`- __dirname: ${__dirname}`);
console.log(`- __filename: ${__filename}`);

// Test database connection before proceeding
async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log(`- Connection string: ${process.env.DATABASE_URL ? 'postgresql://' + process.env.DATABASE_URL.split('@')[1] : 'Not set'}`);
  
  console.log('🔍 Testing database connection...');
  
  // Add type assertion to ensure DATABASE_URL is defined
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined in environment variables');
    return false;
  }
  
  console.log(`- Connection string: postgresql://${dbUrl.split('@')[1]}`);
  
  let client;
  try {
    console.log('🔄 Creating database pool...');
    // Test connection with a timeout
    const connectionPromise = pool.connect();
    console.log('⏳ Attempting to connect to database...');
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );
    
    client = await Promise.race([connectionPromise, timeoutPromise]) as any;
    console.log('✅ Successfully connected to the database');
    
    // Test a simple query
    console.log('⚡ Running test query...');
    const result = await client.query('SELECT NOW() as now, current_database() as db, current_user as user');
    console.log('⏱️  Database time:', result.rows[0].now);
    console.log(`💾 Database: ${result.rows[0].db}`);
    console.log(`👤 User: ${result.rows[0].user}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to the database:');
    console.error(error);
    
    // Log environment info (without sensitive data)
    console.log('\nEnvironment Info:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- DATABASE_URL: ${dbUrl ? 'postgresql://' + dbUrl.split('@')[1] : 'Not set'}`);
    
    return false;
  } finally {
    if (client) {
      console.log('🔌 Releasing database connection...');
      await client.release();
      console.log('✅ Database connection released');
    }
  }
}

// Define types for seed data
type Timestamped<T> = T & {
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    console.log('1️⃣ Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('❌ Cannot proceed with seeding: Database connection failed');
    }
    console.log('✅ Database connection test passed');
    
    // Start a transaction for data integrity
    console.log('\n🚀 Starting database transaction...');
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data
      console.log('\n🧹 Clearing existing data...');
      await client.query('TRUNCATE TABLE prompts, activities, prompt_packs RESTART IDENTITY CASCADE');
      console.log('  - Cleared all tables');

      // Seed activities
      console.log('\n📝 Seeding activities...');
      const activitiesToInsert = withTimestamps(seedActivities);
      console.log(`  - Prepared ${activitiesToInsert.length} activities`);
      
      for (const activity of activitiesToInsert) {
        await client.query({
          text: `
            INSERT INTO activities 
            (name, description, duration, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `,
          values: [
            activity.name, 
            activity.description, 
            activity.duration, 
            activity.createdAt, 
            activity.updatedAt
          ]
        });
      }
      console.log(`  - Successfully inserted ${activitiesToInsert.length} activities`);

      // Seed prompt packs
      console.log('\n🎁 Seeding prompt packs...');
      const promptPacksToInsert = withTimestamps(seedPromptPacks);
      console.log(`  - Prepared ${promptPacksToInsert.length} prompt packs`);
      
      for (const pack of promptPacksToInsert) {
        await client.query({
          text: `
            INSERT INTO prompt_packs 
            (name, description, unlock_threshold, is_active, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
          `,
          values: [
            pack.name, 
            pack.description, 
            pack.unlockThreshold,
            pack.isActive, 
            pack.createdAt, 
            pack.updatedAt
          ]
        });
      }
      console.log(`  - Successfully inserted ${promptPacksToInsert.length} prompt packs`);

      // Commit the transaction
      await client.query('COMMIT');
      console.log('\n✅ Seeding completed successfully!');
      
      return {
        activities: activitiesToInsert.length,
        promptPacks: promptPacksToInsert.length
      };
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('❌ Error during seeding, rolled back transaction');
      throw error;
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  seed()
    .then((result) => {
      console.log('✅ Seeding completed successfully!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seed };
