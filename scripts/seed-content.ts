import { db } from '../server/src/db/index.js';
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
type ActivityBreak = {
  title: string;
  description: string;
  duration: number;
  deckSpecific: boolean;
  deck?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type ReflectionPause = {
  title: string;
  description: string;
  duration: number;
  deckSpecific: boolean;
  deck?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

// Seed data for activity breaks
const seedActivityBreaks: ActivityBreak[] = [
  {
    title: 'Bollywood Charades',
    description: 'Act out a Bollywood movie title without speaking. Others guess within 30 seconds!',
    duration: 30,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Festival Memory Mashup',
    description: 'Share a festival memory in one word. The group creates a fun story from the words!',
    duration: 45,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Song Swap',
    description: 'Name a song that lifts your mood. No explanations needed!',
    duration: 30,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Street Food Swap',
    description: 'Name a street food you\'d bring to a party. Group votes on the most tempting one!',
    duration: 30,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Dialogue Mashup',
    description: 'Deliver a famous Bollywood dialogue in a funny accent!',
    duration: 30,
    deckSpecific: false,
    isActive: true
  },
  // Deck-specific activity breaks
  {
    title: 'Stranger Icebreaker',
    description: 'Share one unusual fact about yourself that no one in the room knows.',
    duration: 45,
    deckSpecific: true,
    deck: 'Strangers',
    isActive: true
  },
  {
    title: 'Friend Circle',
    description: 'Everyone stands in a circle. Take turns sharing one thing you appreciate about the person to your right.',
    duration: 60,
    deckSpecific: true,
    deck: 'Friends',
    isActive: true
  },
  {
    title: 'BFF Challenge',
    description: 'How well do you know each other? Write down your answers to 3 questions about each other and compare!',
    duration: 90,
    deckSpecific: true,
    deck: 'BFFs',
    isActive: true
  }
];

// Seed data for reflection pauses
const seedReflectionPauses: ReflectionPause[] = [
  {
    title: 'Conversation Highlights',
    description: 'Take a moment to reflect on the most interesting thing you\'ve learned about someone else so far.',
    duration: 60,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Surprising Discoveries',
    description: 'What has surprised you the most about the conversations you\'ve had so far?',
    duration: 60,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Connection Points',
    description: 'Reflect on any unexpected connections or similarities you\'ve discovered with others in the group.',
    duration: 60,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Growth Moment',
    description: 'Has any conversation made you reconsider a perspective or opinion you held? Take a moment to reflect.',
    duration: 90,
    deckSpecific: false,
    isActive: true
  },
  {
    title: 'Conversation Wish',
    description: 'Is there a topic you\'re hoping will come up in future prompts? What are you curious to learn about others?',
    duration: 60,
    deckSpecific: false,
    isActive: true
  },
  // Deck-specific reflection pauses
  {
    title: 'Stranger to Friend',
    description: 'Reflect on how your perception of others has changed since the beginning of the game.',
    duration: 60,
    deckSpecific: true,
    deck: 'Strangers',
    isActive: true
  },
  {
    title: 'Friendship Depth',
    description: 'Consider how these conversations might deepen your existing friendships. What new dimensions have you discovered?',
    duration: 60,
    deckSpecific: true,
    deck: 'Friends',
    isActive: true
  },
  {
    title: 'BFF Bonds',
    description: 'Even with your closest friends, there\'s always more to learn. What new insights have you gained about each other?',
    duration: 60,
    deckSpecific: true,
    deck: 'BFFs',
    isActive: true
  }
];

// Helper function to add timestamps to seed data
function withTimestamps<T extends ActivityBreak | ReflectionPause>(items: T[]): (T & { createdAt: Date; updatedAt: Date })[] {
  const now = new Date();
  return items.map(item => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }));
}

async function seedContentTypes() {
  console.log('🌱 Starting content type seeding...');
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? `postgresql://${process.env.DATABASE_URL.split('@')[1]}` : 'Not set'
  });
  
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data
      console.log('\n🧹 Clearing existing content type data...');
      try {
        await client.query('TRUNCATE TABLE activity_breaks, reflection_pauses RESTART IDENTITY CASCADE');
        console.log('  - Cleared activity breaks and reflection pauses tables');
      } catch (error) {
        console.warn('  - Tables may not exist yet, continuing with seeding');
      }

      // Seed activity breaks
      console.log('\n🏃‍♂️ Seeding activity breaks...');
      const activityBreaksToInsert = withTimestamps(seedActivityBreaks);
      console.log(`  - Prepared ${activityBreaksToInsert.length} activity breaks`);
      
      for (const activityBreak of activityBreaksToInsert) {
        await client.query({
          text: `
            INSERT INTO activity_breaks 
            (title, description, duration, deck_specific, deck, is_active, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `,
          values: [
            activityBreak.title, 
            activityBreak.description, 
            activityBreak.duration,
            activityBreak.deckSpecific,
            activityBreak.deck || null,
            activityBreak.isActive,
            activityBreak.createdAt, 
            activityBreak.updatedAt
          ]
        });
      }
      console.log(`  - Successfully inserted ${activityBreaksToInsert.length} activity breaks`);

      // Seed reflection pauses
      console.log('\n🧘‍♀️ Seeding reflection pauses...');
      const reflectionPausesToInsert = withTimestamps(seedReflectionPauses);
      console.log(`  - Prepared ${reflectionPausesToInsert.length} reflection pauses`);
      
      for (const reflectionPause of reflectionPausesToInsert) {
        await client.query({
          text: `
            INSERT INTO reflection_pauses 
            (title, description, duration, deck_specific, deck, is_active, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `,
          values: [
            reflectionPause.title, 
            reflectionPause.description, 
            reflectionPause.duration,
            reflectionPause.deckSpecific,
            reflectionPause.deck || null,
            reflectionPause.isActive,
            reflectionPause.createdAt, 
            reflectionPause.updatedAt
          ]
        });
      }
      console.log(`  - Successfully inserted ${reflectionPausesToInsert.length} reflection pauses`);

      // Commit the transaction
      await client.query('COMMIT');
      console.log('\n✅ Content type seeding completed successfully!');
      
      return {
        activityBreaks: activityBreaksToInsert.length,
        reflectionPauses: reflectionPausesToInsert.length
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
    console.error('❌ Error seeding content types:', error);
    process.exit(1);
  }
}

// Always run the seed function
console.log('Script starting...');
seedContentTypes()
  .then((result) => {
    console.log('✅ Content type seeding completed successfully!', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Content type seeding failed:', error);
    process.exit(1);
  });
