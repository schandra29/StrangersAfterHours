import dotenv from 'dotenv';
import { db } from '../server/src/db/index.js';
import { activityBreaks } from '../server/src/db/schema/activityBreaks.js';
import { reflectionPauses } from '../server/src/db/schema/reflectionPauses.js';
import { gameSessions, gamePlayers, sessionActivityBreaks, sessionReflectionPauses } from '../server/src/db/schema/gameSessions.js';
import { prompts } from '../server/src/db/schema/prompts.js';
import { eq, and, sql, not, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Create log file for output
const logFile = fs.createWriteStream('./scripts/game-flow-verification.log', { flags: 'w' });

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

// Console colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },

  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

// Create Supabase client for database operations
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Add a header to the log output
log(`${colors.bright}${colors.fg.cyan}🧪 GAME FLOW VERIFICATION SCRIPT${colors.reset}`);
log(`${colors.fg.yellow}This script will verify the game flow for activity breaks and reflection pauses${colors.reset}`);
log(`${colors.fg.white}Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'Not set'}${colors.reset}`);
log(`${colors.fg.white}Time: ${new Date().toISOString()}${colors.reset}\n`);



// Seed test data for activity breaks and reflection pauses
async function seedTestData() {
  log(`${colors.bright}${colors.fg.blue}📝 SEEDING TEST DATA${colors.reset}`);
  
  try {
    // Check if we already have test data
    const existingActivityBreaks = await db.select({ count: sql<number>`count(*)` }).from(activityBreaks);
    const existingReflectionPauses = await db.select({ count: sql<number>`count(*)` }).from(reflectionPauses);
  
    log(`Existing activity breaks: ${existingActivityBreaks[0].count}`);
    log(`Existing reflection pauses: ${existingReflectionPauses[0].count}`);
      
    if (existingActivityBreaks[0].count === 0) {
      // Create test activity breaks
      log(`${colors.fg.blue}Creating test activity breaks...${colors.reset}`);
      await db.insert(activityBreaks).values([
        {
          title: 'Test Activity Break 1',
          description: 'This is a test activity break for all decks',
          duration: 30,
          deckSpecific: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Test Activity Break 2',
          description: 'This is a test activity break for the Strangers deck',
          duration: 45,
          deckSpecific: true,
          deck: 'Strangers',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      log(`${colors.fg.green}✓ Created 2 activity breaks${colors.reset}`);
    } else {
      log(`${colors.fg.green}✓ Found ${existingActivityBreaks[0].count} existing activity breaks${colors.reset}`);
    }
  } catch (error) {
    log(`${colors.fg.red}❌ Error seeding test data:${colors.reset}`, error);
    throw error;
  }
  
  // Check if we already have reflection pauses
  const existingReflectionPauses = await db.select({ count: sql<number>`count(*)` }).from(reflectionPauses);
  
  if (existingReflectionPauses[0].count === 0) {
    // Create test reflection pauses
    await db.insert(reflectionPauses).values([
      {
        title: 'Test Reflection Pause 1',
        description: 'This is a test reflection pause for all decks',
        duration: 60,
        deckSpecific: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Test Reflection Pause 2',
        description: 'This is a test reflection pause for the Strangers deck',
        duration: 90,
        deckSpecific: true,
        deck: 'Strangers',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    log(`${colors.fg.blue}Creating test reflection pauses...${colors.reset}`);
    log(`${colors.fg.green}✓ Created 2 reflection pauses${colors.reset}`);
  } else {
    log(`${colors.fg.green}✓ Found ${existingReflectionPauses[0].count} existing reflection pauses${colors.reset}`);
  }
  
  // Check if we have prompts
  const existingPrompts = await db.select({ count: sql`count(*)` }).from(prompts);
  const promptCount = parseInt(existingPrompts[0].count);
  
  log(`${colors.fg.green}✓ Found ${promptCount} existing prompts${colors.reset}`);
  
  if (promptCount < 20) {
    log(`${colors.fg.yellow}⚠️ Warning: Less than 20 prompts available. This may affect testing.${colors.reset}`);
  }
  
  if (existingActivityBreaks[0].count > 0 && existingReflectionPauses[0].count > 0) {
    log(`${colors.fg.green}✅ Test data already exists, skipping seed${colors.reset}\n`);
    return;
  }
  
  return {
    activityBreaks: existingActivityBreaks[0].count || 2,
    reflectionPauses: existingReflectionPauses[0].count || 2,
    prompts: promptCount
  };
}

// Create a test game session
async function createTestSession() {
  log(`${colors.bright}${colors.fg.blue}🎮 CREATING TEST SESSION${colors.reset}`);
  
  try {
    const sessionId = uuidv4();
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await db.insert(gameSessions).values({
      id: sessionId,
      code: sessionCode,
      hostId: 'test-user',
      currentDeck: 'Strangers',
      currentLevel: '1',
      promptCount: '0',
      promptsShown: '0',
      activityBreaksShown: '0',
      reflectionPausesShown: '0',
      activityBreaksCompleted: '0',
      reflectionPausesCompleted: '0',
      soloPromptCount: '0',
      groupPromptCount: '0',
      nextActivityBreakAfter: '4', // Activity break after every 4 prompts
      nextReflectionAfter: '10', // Reflection pause after every 10 prompts
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    log(`${colors.fg.green}✓ Created session with ID: ${sessionId} and code: ${sessionCode}${colors.reset}`);
    
    // Add a test player
    await db.insert(gamePlayers).values({
      id: uuidv4(),
      sessionId: sessionId,
      userId: 'test-user',
      name: 'Test Player',
      isHost: true,
      joinedAt: new Date()
    });
    
    log(`${colors.fg.green}✓ Added test player to session${colors.reset}`);
    
    log(`${colors.fg.green}✅ Test session created with ID: ${sessionId}${colors.reset}\n`);
    
    return sessionId;
  } catch (error) {
    log(`${colors.fg.red}❌ Error creating test session:${colors.reset}`, error);
    throw error;
  }
}

// Simulate getting the next content
async function getNextContent(sessionId: string, promptsShown: number) {
  log(`${colors.bright}${colors.fg.blue}🔄 GETTING NEXT CONTENT${colors.reset} (Prompts shown: ${promptsShown})`);
  log(`Session ID: ${sessionId}`);
  
  try {
    // Get the game session
    const session = await db.select().from(gameSessions).where(eq(gameSessions.id, sessionId));
  
    if (!session || session.length === 0) {
      log(`${colors.fg.red}❌ Session not found${colors.reset}`);
      return null;
    }
    
    const gameSession = session[0];
    const nextActivityBreak = parseInt(gameSession.nextActivityBreakAfter || '4');
    const nextReflection = parseInt(gameSession.nextReflectionAfter || '10');
    
    log(`${colors.dim}Session settings: Activity break every ${nextActivityBreak} prompts, Reflection pause every ${nextReflection} prompts${colors.reset}`);
    
    // Check if it's time for an activity break
    if (promptsShown > 0 && promptsShown % 4 === 0) {
      log(`${colors.fg.cyan}🏃‍♂️ Time for an activity break!${colors.reset}`);
      
      // Get shown activity break IDs
      const shownActivityBreakIds = await db
        .select({ id: sessionActivityBreaks.activityBreakId })
        .from(sessionActivityBreaks)
        .where(eq(sessionActivityBreaks.sessionId, sessionId));
    
      log(`Previously shown activity breaks: ${shownActivityBreakIds.length}`);
      
      // Get an activity break that hasn't been shown yet
      const availableActivityBreaks = await db
        .select()
        .from(activityBreaks)
        .where(
          shownActivityBreakIds.length > 0
            ? not(inArray(activityBreaks.id, shownActivityBreakIds.map(a => a.id)))
            : sql`1=1`
        )
        .limit(1);
    
      if (availableActivityBreaks.length === 0) {
        log(`${colors.fg.yellow}⚠️ No available activity breaks, using fallback${colors.reset}`);
      }
      
      const activityBreak = availableActivityBreaks[0];
      log(`${colors.fg.green}✅ Selected activity break: ${activityBreak.title}${colors.reset}\n`);
      
      // Record that this break was shown
      await db.insert(sessionActivityBreaks).values({
        id: uuidv4(),
        sessionId: sessionId,
        activityBreakId: activityBreak.id,
        shownAt: new Date(),
        completed: false
      });
      
      // Update game session
      await db.update(gameSessions)
        .set({
          lastActivityBreakAt: new Date(),
          activityBreaksShown: sql`activity_breaks_shown + 1`,
          updatedAt: new Date()
        })
        .where(eq(gameSessions.id, sessionId));
      
      return { type: 'activity-break', content: activityBreak };
    }
    
    // Check if it's time for a reflection pause
    else if (promptsShown > 0 && promptsShown % 10 === 0) {
      log(`${colors.fg.magenta}🤔 Time for a reflection pause!${colors.reset}`);
      
      // Get shown reflection pause IDs
      const shownReflectionPauseIds = await db
        .select({ id: sessionReflectionPauses.reflectionPauseId })
        .from(sessionReflectionPauses)
        .where(eq(sessionReflectionPauses.sessionId, sessionId));
    
      log(`Previously shown reflection pauses: ${shownReflectionPauseIds.length}`);
      
      // Get a reflection pause that hasn't been shown yet
      const availableReflectionPauses = await db
        .select()
        .from(reflectionPauses)
        .where(
          shownReflectionPauseIds.length > 0
            ? not(inArray(reflectionPauses.id, shownReflectionPauseIds.map(r => r.id)))
            : sql`1=1`
        )
        .limit(1);
    
      if (availableReflectionPauses.length === 0) {
        log(`${colors.fg.yellow}⚠️ No available reflection pauses, using fallback${colors.reset}`);
      }
      
      const reflectionPause = availableReflectionPauses[0];
      log(`${colors.fg.green}✅ Selected reflection pause: ${reflectionPause.title}${colors.reset}\n`);
      
      // Record that this pause was shown
      await db.insert(sessionReflectionPauses).values({
        id: uuidv4(),
        sessionId: sessionId,
        reflectionPauseId: reflectionPause.id,
        shownAt: new Date(),
        completed: false
      });
      
      // Update game session
      await db.update(gameSessions)
        .set({
          lastReflectionAt: new Date(),
          reflectionPausesShown: sql`reflection_pauses_shown + 1`,
          updatedAt: new Date()
        })
        .where(eq(gameSessions.id, sessionId));
      
      return { type: 'reflection-pause', content: reflectionPause };
    }
    
    // Otherwise, get a prompt
    else {
      log(`${colors.fg.yellow}💬 Getting a regular prompt${colors.reset}`);
      
      // Get a random prompt
      const availablePrompts = await db
        .select()
        .from(prompts)
        .limit(1);
    
      if (availablePrompts.length === 0) {
        log(`${colors.fg.red}❌ No prompts available${colors.reset}`);
        return null;
      }
      
      const prompt = availablePrompts[0];
      log(`${colors.fg.green}✅ Prompt found: "${prompt.text}"${colors.reset}`);
      
      return { type: 'prompt', content: prompt };
    }
  } catch (error) {
    log(`${colors.fg.red}❌ Error getting next content:${colors.reset}`, error);
    throw error;
  }
}

// Simulate completing an activity break
async function completeActivityBreak(sessionId: string, activityBreakId: string) {
  log(`${colors.bright}${colors.fg.blue}✓ COMPLETING ACTIVITY BREAK${colors.reset}`);
  
  try {
    // Mark the activity break as completed
    await db.update(sessionActivityBreaks)
      .set({
        completed: true,
        completedAt: new Date()
      })
      .where(
        and(
          eq(sessionActivityBreaks.sessionId, sessionId),
          eq(sessionActivityBreaks.activityBreakId, activityBreakId)
        )
      );
    
    // Update the game session
    await db.update(gameSessions)
      .set({
        activityBreaksCompleted: sql`activity_breaks_completed + 1`,
        updatedAt: new Date()
      })
      .where(eq(gameSessions.id, sessionId));
    
    log(`${colors.fg.green}✓ Activity break completed${colors.reset}`);
  } catch (error) {
    log(`${colors.fg.red}❌ Error completing activity break:${colors.reset}`, error);
    throw error;
  }
}

// Simulate completing a reflection pause
async function completeReflectionPause(sessionId: string, reflectionPauseId: string) {
  log(`${colors.bright}${colors.fg.blue}✓ COMPLETING REFLECTION PAUSE${colors.reset}`);
  
  try {
    // Mark the reflection pause as completed
    await db.update(sessionReflectionPauses)
      .set({
        completed: true,
        completedAt: new Date()
      })
      .where(
        and(
          eq(sessionReflectionPauses.sessionId, sessionId),
          eq(sessionReflectionPauses.reflectionPauseId, reflectionPauseId)
        )
      );
    
    // Update the game session
    await db.update(gameSessions)
      .set({
        reflectionPausesCompleted: sql`reflection_pauses_completed + 1`,
        updatedAt: new Date()
      })
      .where(eq(gameSessions.id, sessionId));
    
    log(`${colors.fg.green}✓ Reflection pause completed${colors.reset}`);
  } catch (error) {
    log(`${colors.fg.red}❌ Error completing reflection pause:${colors.reset}`, error);
    throw error;
  }
}

// Run the full game flow test
async function runGameFlowTest() {
  try {
    // Seed test data if needed
    await seedTestData();
  
    // Create a test session
    const sessionId = await createTestSession();
  
    if (!sessionId) {
      log(`${colors.fg.red}❌ Failed to create test session${colors.reset}`);
      return;
    }
    
    let promptsShown = 0;
    
    log(`${colors.bright}${colors.fg.yellow}🎮 SIMULATING GAME PLAY${colors.reset}\n`);
    log(`${colors.fg.yellow}Will simulate 20 content interactions to verify activity breaks and reflection pauses${colors.reset}`);
    
    for (let i = 0; i < 20; i++) {
      const content = await getNextContent(sessionId, promptsShown);
      
      if (!content) {
        log(`${colors.fg.red}❌ No content available. Stopping test.${colors.reset}`);
        break;
      }
      
      // Handle the content based on type
      if (content.type === 'activity-break') {
        await completeActivityBreak(sessionId, content.content.id);
      } else if (content.type === 'reflection-pause') {
        await completeReflectionPause(sessionId, content.content.id);
      } else {
        // For prompts, just increment the counter
        promptsShown++;
        
        // Update the game session
        await db.update(gameSessions)
          .set({
            promptsShown: String(promptsShown),
            updatedAt: new Date()
          })
          .where(eq(gameSessions.id, sessionId));
        
        log(`${colors.fg.green}✓ Prompt #${promptsShown} completed${colors.reset}`);
      }
    }
    
    // Get final session state
    const finalSession = await db.select().from(gameSessions).where(eq(gameSessions.id, sessionId));
    
    log(`\n${colors.bright}${colors.fg.green}✅ GAME FLOW TEST COMPLETED${colors.reset}`);
    log(`${colors.fg.green}Final session state:${colors.reset}`);
    log(`  - Prompts shown: ${finalSession[0].promptsShown}`);
    log(`  - Activity breaks shown: ${finalSession[0].activityBreaksShown}`);
    log(`  - Activity breaks completed: ${finalSession[0].activityBreaksCompleted}`);
    log(`  - Reflection pauses shown: ${finalSession[0].reflectionPausesShown}`);
    log(`  - Reflection pauses completed: ${finalSession[0].reflectionPausesCompleted}`);
    
    // Verify expected counts
    const expectedActivityBreaks = Math.floor(parseInt(finalSession[0].promptsShown) / 4);
    const expectedReflectionPauses = Math.floor(parseInt(finalSession[0].promptsShown) / 10);
    
    log(`\n${colors.bright}${colors.fg.cyan}📊 VERIFICATION RESULTS${colors.reset}`);
    
    if (parseInt(finalSession[0].activityBreaksShown) === expectedActivityBreaks) {
      log(`${colors.fg.green}✓ Activity breaks appear correctly every 4 prompts${colors.reset}`);
    } else {
      log(`${colors.fg.red}❌ Activity breaks count mismatch: Expected ${expectedActivityBreaks}, got ${finalSession[0].activityBreaksShown}${colors.reset}`);
    }
    
    if (parseInt(finalSession[0].reflectionPausesShown) === expectedReflectionPauses) {
      log(`${colors.fg.green}✓ Reflection pauses appear correctly every 10 prompts${colors.reset}`);
    } else {
      log(`${colors.fg.red}❌ Reflection pauses count mismatch: Expected ${expectedReflectionPauses}, got ${finalSession[0].reflectionPausesShown}${colors.reset}`);
    }
    
    if (parseInt(finalSession[0].activityBreaksCompleted) === parseInt(finalSession[0].activityBreaksShown)) {
      log(`${colors.fg.green}✓ All activity breaks were completed successfully${colors.reset}`);
    } else {
      log(`${colors.fg.red}❌ Not all activity breaks were completed: ${finalSession[0].activityBreaksCompleted}/${finalSession[0].activityBreaksShown}${colors.reset}`);
    }
    
    if (parseInt(finalSession[0].reflectionPausesCompleted) === parseInt(finalSession[0].reflectionPausesShown)) {
      log(`${colors.fg.green}✓ All reflection pauses were completed successfully${colors.reset}`);
    } else {
      log(`${colors.fg.red}❌ Not all reflection pauses were completed: ${finalSession[0].reflectionPausesCompleted}/${finalSession[0].reflectionPausesShown}${colors.reset}`);
    }
    
    // Close the log file
    logFile.end();
  } catch (error) {
    log(`\n${colors.bright}${colors.fg.red}❌ VERIFICATION FAILED${colors.reset}`);
    if (error instanceof Error) {
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
    } else {
      log(`Unknown error: ${error}`);
    }
    // Force output to be flushed before exiting
    setTimeout(() => process.exit(1), 100);
  }
}

// Run the test
log(`${colors.bright}${colors.fg.green}▶️ STARTING VERIFICATION${colors.reset}`);
log(`Time: ${new Date().toISOString()}`);
log(`Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'Not set'}`);
log(`Supabase URL: ${supabaseUrl}`);
log('');

runGameFlowTest()
  .then(() => {
    log(`\n${colors.bright}${colors.fg.green}✅ VERIFICATION COMPLETE${colors.reset}`);
    log(`Check the log file at ./scripts/game-flow-verification.log for detailed results`);
    // Make sure all output is flushed before exiting
    logFile.end(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    log(`\n${colors.bright}${colors.fg.red}❌ VERIFICATION FAILED${colors.reset}`);
    if (error instanceof Error) {
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
    } else {
      log(`Unknown error: ${error}`);
    }
    log(`Check the log file at ./scripts/game-flow-verification.log for detailed results`);
    // Make sure all output is flushed before exiting
    logFile.end(() => {
      process.exit(1);
    });
  });
