import { db } from '../server/src/db/index.js';
import { activityBreaks, reflectionPauses, prompts, gameSessions } from '../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Starting Game Flow Test');

// Test data for our activity breaks and reflection pauses
async function seedTestData() {
  console.log('\n📝 Seeding test data...');
  
  // Create activity breaks if none exist
  const existingBreaks = await db.select({ count: sql`count(*)` }).from(activityBreaks);
  if (parseInt(existingBreaks[0].count) === 0) {
    console.log('  - Adding activity breaks');
    await db.insert(activityBreaks).values([
      {
        id: uuidv4(),
        title: 'Test Activity Break 1',
        description: 'This is a test activity break',
        duration: 30,
        deckSpecific: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Test Activity Break 2',
        description: 'This is another test activity break',
        duration: 45,
        deckSpecific: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  } else {
    console.log(`  - ${existingBreaks[0].count} activity breaks already exist`);
  }
  
  // Create reflection pauses if none exist
  const existingPauses = await db.select({ count: sql`count(*)` }).from(reflectionPauses);
  if (parseInt(existingPauses[0].count) === 0) {
    console.log('  - Adding reflection pauses');
    await db.insert(reflectionPauses).values([
      {
        id: uuidv4(),
        title: 'Test Reflection Pause 1',
        description: 'This is a test reflection pause',
        duration: 60,
        deckSpecific: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Test Reflection Pause 2',
        description: 'This is another test reflection pause',
        duration: 90,
        deckSpecific: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  } else {
    console.log(`  - ${existingPauses[0].count} reflection pauses already exist`);
  }
  
  // Check if we have prompts
  const existingPrompts = await db.select({ count: sql`count(*)` }).from(prompts);
  console.log(`  - ${existingPrompts[0].count} prompts available`);
  
  if (parseInt(existingPrompts[0].count) < 20) {
    console.log('  ⚠️ Warning: Less than 20 prompts available. This may affect testing.');
  }
  
  console.log('✅ Test data seeding complete');
}

// Create a test game session
async function createTestSession() {
  console.log('\n🎮 Creating test game session...');
  
  const sessionId = uuidv4();
  await db.insert(gameSessions).values({
    id: sessionId,
    code: 'TEST123',
    hostId: 'test-user',
    currentDeck: 'Strangers',
    currentLevel: '1',
    promptCount: '0',
    promptsShown: '0',
    isActive: true,
    nextActivityBreakAfter: '4', // Activity break after every 4 prompts
    nextReflectionAfter: '10', // Reflection pause after every 10 prompts
    soloPromptCount: '0',
    groupPromptCount: '0',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log(`  - Created session with ID: ${sessionId}`);
  return sessionId;
}

// Simulate getting the next content
async function getNextContent(sessionId: string, promptsShown: number) {
  console.log(`\n🔄 Getting content #${promptsShown + 1}...`);
  
  // Get the game session
  const session = await db.select().from(gameSessions).where(eq(gameSessions.id, sessionId));
  if (session.length === 0) {
    throw new Error('Session not found');
  }
  
  const gameSession = session[0];
  
  // Check if it's time for an activity break
  if (promptsShown > 0 && promptsShown % 4 === 0) {
    console.log('  - Activity break should appear (every 4 prompts)');
    const activityBreak = await db.select().from(activityBreaks).where(eq(activityBreaks.isActive, true)).limit(1);
    
    if (activityBreak.length > 0) {
      console.log(`  ✅ Got activity break: "${activityBreak[0].title}"`);
      return { type: 'activity-break', content: activityBreak[0] };
    } else {
      console.log('  ❌ No activity breaks available');
    }
  }
  
  // Check if it's time for a reflection pause
  if (promptsShown > 0 && promptsShown % 10 === 0) {
    console.log('  - Reflection pause should appear (every 10 prompts)');
    const reflectionPause = await db.select().from(reflectionPauses).where(eq(reflectionPauses.isActive, true)).limit(1);
    
    if (reflectionPause.length > 0) {
      console.log(`  ✅ Got reflection pause: "${reflectionPause[0].title}"`);
      return { type: 'reflection-pause', content: reflectionPause[0] };
    } else {
      console.log('  ❌ No reflection pauses available');
    }
  }
  
  // Otherwise, get a prompt
  console.log('  - Regular prompt should appear');
  const prompt = await db.select().from(prompts).where(eq(prompts.isActive, true)).limit(1);
  
  if (prompt.length > 0) {
    console.log(`  ✅ Got prompt: "${prompt[0].text}"`);
    return { type: 'prompt', content: prompt[0] };
  } else {
    console.log('  ❌ No prompts available');
    return null;
  }
}

// Simulate completing an activity break
async function completeActivityBreak(sessionId: string, activityBreakId: string) {
  console.log(`\n🏁 Completing activity break: ${activityBreakId}`);
  
  // Update the game session
  await db.update(gameSessions)
    .set({
      activityBreaksCompleted: sql`activity_breaks_completed + 1`,
      updatedAt: new Date()
    })
    .where(eq(gameSessions.id, sessionId));
  
  console.log('  ✅ Activity break completed');
}

// Simulate completing a reflection pause
async function completeReflectionPause(sessionId: string, reflectionPauseId: string) {
  console.log(`\n🏁 Completing reflection pause: ${reflectionPauseId}`);
  
  // Update the game session
  await db.update(gameSessions)
    .set({
      reflectionPausesCompleted: sql`reflection_pauses_completed + 1`,
      updatedAt: new Date()
    })
    .where(eq(gameSessions.id, sessionId));
  
  console.log('  ✅ Reflection pause completed');
}

// Run the full game flow test
async function runGameFlowTest() {
  try {
    // Seed test data
    await seedTestData();
    
    // Create a test session
    const sessionId = await createTestSession();
    
    // Simulate 20 content interactions
    let promptsShown = 0;
    
    for (let i = 0; i < 20; i++) {
      const content = await getNextContent(sessionId, promptsShown);
      
      if (!content) {
        console.log('❌ No content available. Stopping test.');
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
        console.log(`  - Prompt #${promptsShown} completed`);
        
        // Update the game session
        await db.update(gameSessions)
          .set({
            promptsShown: String(promptsShown),
            updatedAt: new Date()
          })
          .where(eq(gameSessions.id, sessionId));
      }
    }
    
    console.log('\n✅ Game flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during game flow test:', error);
  }
}

// Run the test
runGameFlowTest()
  .then(() => {
    console.log('🏁 Test script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
