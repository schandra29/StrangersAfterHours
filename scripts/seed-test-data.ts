import dotenv from 'dotenv';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Console colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  fg: {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    white: '\x1b[37m',
  }
};

// Create log file for output
const logFile = fs.createWriteStream('./scripts/seed-test-data.log', { flags: 'w' });

// Helper function to log to both console and file
function log(message: string) {
  try {
    // Force output to console
    process.stdout.write(`${message}\n`);
    // Also write to log file
    logFile.write(`${message}\n`);
  } catch (error) {
    // If there's an error writing to the log file, at least try to write to console
    console.error('Error writing to log:', error);
  }
}

// Create Supabase client for database operations
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Add a header to the log output
log(`${colors.bright}${colors.fg.cyan}🌱 TEST DATA SEEDING SCRIPT${colors.reset}`);
log(`${colors.fg.yellow}This script will seed test data for activity breaks and reflection pauses${colors.reset}`);
log(`${colors.fg.white}Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'Not set'}${colors.reset}`);
log(`${colors.fg.white}Supabase URL: ${supabaseUrl}${colors.reset}`);
log(`${colors.fg.white}Time: ${new Date().toISOString()}${colors.reset}\n`);

// Sample activity breaks data
const activityBreaks = [
  {
    id: uuidv4(),
    title: 'Quick Dance Party',
    description: 'Everyone stands up and dances to a song for 60 seconds',
    duration_seconds: '60',
    is_active: true,
    activity_type: 'physical',
    difficulty: '1',
    instructions: 'Play your favorite upbeat song and dance like nobody is watching!',
    min_players: '2',
    deck_specific: false
  },
  {
    id: uuidv4(),
    title: 'Tongue Twisters',
    description: 'Take turns saying challenging tongue twisters',
    duration_seconds: '60',
    is_active: true,
    activity_type: 'verbal',
    difficulty: '2',
    instructions: 'Each player must try to say "She sells seashells by the seashore" three times fast',
    min_players: '2',
    deck_specific: false
  },
  {
    id: uuidv4(),
    title: 'Quick Stretch',
    description: 'Everyone stands up and does a quick stretch routine',
    duration_seconds: '45',
    is_active: true,
    activity_type: 'physical',
    difficulty: '1',
    instructions: 'Reach for the sky, touch your toes, and do a few jumping jacks',
    min_players: '1',
    deck_specific: false
  },
  {
    id: uuidv4(),
    title: 'Word Association',
    description: 'Go around the circle playing word association',
    duration_seconds: '90',
    is_active: true,
    activity_type: 'mental',
    difficulty: '1',
    instructions: 'Start with a word and each person must say a related word quickly',
    min_players: '3',
    deck_specific: false
  }
];

// Sample reflection pauses data
const reflectionPauses = [
  {
    id: uuidv4(),
    question: 'What has been your favorite moment of the game so far?',
    description: 'Take a moment to reflect on the highlights',
    duration_seconds: '120',
    is_active: true,
    theme: 'gratitude',
    follow_up_questions: ['Why was this moment special?', 'How did it make you feel?'],
    deck_specific: false
  },
  {
    id: uuidv4(),
    question: 'What have you learned about someone in the group that surprised you?',
    description: 'Reflect on new discoveries about your friends',
    duration_seconds: '120',
    is_active: true,
    theme: 'discovery',
    follow_up_questions: ['How has this changed your perspective?'],
    deck_specific: false
  },
  {
    id: uuidv4(),
    question: 'If you could ask the group one question that everyone must answer honestly, what would it be?',
    description: 'Think about what you're curious to know',
    duration_seconds: '120',
    is_active: true,
    theme: 'curiosity',
    follow_up_questions: ['Why is this important to you?'],
    deck_specific: false
  }
];

// Function to seed activity breaks
async function seedActivityBreaks() {
  log(`${colors.bright}${colors.fg.blue}🏃 SEEDING ACTIVITY BREAKS${colors.reset}`);
  
  try {
    // First check if the table already has data
    const { data: existingBreaks, error: checkError } = await supabase
      .from('activity_breaks')
      .select('id')
      .limit(10);
    
    if (checkError) {
      log(`${colors.fg.red}❌ Error checking activity_breaks table: ${checkError.message}${colors.reset}`);
      throw checkError;
    }
    
    if (existingBreaks && existingBreaks.length > 0) {
      log(`${colors.fg.yellow}⚠️ Found ${existingBreaks.length} existing activity breaks${colors.reset}`);
      log(`${colors.fg.yellow}⚠️ Skipping seeding to avoid duplicates${colors.reset}`);
      return existingBreaks;
    }
    
    // Insert activity breaks
    const { data, error } = await supabase
      .from('activity_breaks')
      .insert(activityBreaks)
      .select();
    
    if (error) {
      log(`${colors.fg.red}❌ Error seeding activity breaks: ${error.message}${colors.reset}`);
      throw error;
    }
    
    log(`${colors.fg.green}✓ Successfully seeded ${data?.length || 0} activity breaks${colors.reset}`);
    
    return data || [];
  } catch (error) {
    log(`${colors.fg.red}❌ Error in seedActivityBreaks: ${error instanceof Error ? error.message : JSON.stringify(error)}${colors.reset}`);
    throw error;
  }
}

// Function to seed reflection pauses
async function seedReflectionPauses() {
  log(`${colors.bright}${colors.fg.blue}🧘 SEEDING REFLECTION PAUSES${colors.reset}`);
  
  try {
    // First check if the table already has data
    const { data: existingPauses, error: checkError } = await supabase
      .from('reflection_pauses')
      .select('id')
      .limit(10);
    
    if (checkError) {
      log(`${colors.fg.red}❌ Error checking reflection_pauses table: ${checkError.message}${colors.reset}`);
      throw checkError;
    }
    
    if (existingPauses && existingPauses.length > 0) {
      log(`${colors.fg.yellow}⚠️ Found ${existingPauses.length} existing reflection pauses${colors.reset}`);
      log(`${colors.fg.yellow}⚠️ Skipping seeding to avoid duplicates${colors.reset}`);
      return existingPauses;
    }
    
    // Insert reflection pauses
    const { data, error } = await supabase
      .from('reflection_pauses')
      .insert(reflectionPauses)
      .select();
    
    if (error) {
      log(`${colors.fg.red}❌ Error seeding reflection pauses: ${error.message}${colors.reset}`);
      throw error;
    }
    
    log(`${colors.fg.green}✓ Successfully seeded ${data?.length || 0} reflection pauses${colors.reset}`);
    
    return data || [];
  } catch (error) {
    log(`${colors.fg.red}❌ Error in seedReflectionPauses: ${error instanceof Error ? error.message : JSON.stringify(error)}${colors.reset}`);
    throw error;
  }
}

// Main function to run the seeding
async function seedTestData() {
  try {
    log(`${colors.bright}${colors.fg.green}▶️ STARTING TEST DATA SEEDING${colors.reset}\n`);
    
    // Seed activity breaks
    await seedActivityBreaks();
    
    // Seed reflection pauses
    await seedReflectionPauses();
    
    log(`\n${colors.bright}${colors.fg.green}✅ SEEDING COMPLETE${colors.reset}`);
    return true;
  } catch (error) {
    log(`\n${colors.bright}${colors.fg.red}❌ SEEDING FAILED${colors.reset}`);
    log(`Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    return false;
  }
}

// Run the seeding
seedTestData()
  .then(() => {
    // Make sure all output is flushed before exiting
    logFile.end(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    log(`\n${colors.bright}${colors.fg.red}❌ UNEXPECTED ERROR${colors.reset}`);
    if (error instanceof Error) {
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
    } else {
      log(`Unknown error: ${JSON.stringify(error)}`);
    }
    // Make sure all output is flushed before exiting
    logFile.end(() => {
      process.exit(1);
    });
  });
