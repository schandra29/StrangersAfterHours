import { db } from '.';
import { prompts, type NewPrompt, activityBreaks, type NewActivityBreak, reflectionPauses, type NewReflectionPause, promptPacks, type NewPromptPack } from './schema';

// Sample prompts data
const samplePrompts: NewPrompt[] = [
  // Level 1 - Icebreaker (Mild)
  {
    text: "What's your favorite way to spend a weekend?",
    level: 1,
    intensity: 1,
    isGroup: false,
    isIndian: false,
  },
  {
    text: "If you could have dinner with any historical figure, who would it be and why?",
    level: 1,
    intensity: 1,
    isGroup: true,
    isIndian: false,
  },
  {
    text: "What's your go-to comfort food?",
    level: 1,
    intensity: 1,
    isGroup: false,
    isIndian: true,
  },
  
  // Add more prompts for different levels and intensities
  // This is just a sample - you should expand this with more prompts
];

export async function seedPrompts() {
  console.log('🌱 Seeding database with sample prompts...');
  
  try {
    // Clear existing data
    await db.delete(prompts);
    
    // Insert new prompts
    const insertedPrompts = await db
      .insert(prompts)
      .values(samplePrompts)
      .returning();
    
    console.log(`✅ Seeded ${insertedPrompts.length} prompts`);
    return insertedPrompts;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Activity Breaks seed data
const sampleActivityBreaks: NewActivityBreak[] = [
  {
    title: "30-Second Dance Party",
    description: "Everyone stand up and dance like nobody's watching for 30 seconds! Let loose and have fun!",
    durationSeconds: 30,
    isActive: true
  },
  {
    title: "Quick Stretch",
    description: "Stand up, reach for the sky, then touch your toes. Repeat 3 times while taking deep breaths.",
    durationSeconds: 40,
    isActive: true
  },
  {
    title: "Rock Paper Scissors Tournament",
    description: "Pair up with the person closest to you and play best of 3 Rock Paper Scissors!",
    durationSeconds: 45,
    isActive: true
  },
  {
    title: "Mirror Game",
    description: "Pair up! One person makes movements, the other mirrors them exactly. Switch roles halfway through.",
    durationSeconds: 60,
    isActive: true
  },
  {
    title: "Group High-Fives",
    description: "Everyone must high-five everyone else in the group before time runs out!",
    durationSeconds: 30,
    isActive: true
  }
];

// Reflection Pauses seed data
const sampleReflectionPauses: NewReflectionPause[] = [
  {
    question: "What has been your favorite moment in the game so far?",
    description: "Take a moment to reflect on the conversations and connections made.",
    durationSeconds: 90,
    isActive: true
  },
  {
    question: "Have any responses surprised you? Why?",
    description: "Think about what you've learned about others that you didn't expect.",
    durationSeconds: 90,
    isActive: true
  },
  {
    question: "What's one thing you'll remember from today's conversations?",
    description: "Consider what has been most meaningful to you.",
    durationSeconds: 120,
    isActive: true
  },
  {
    question: "How has your perception of someone changed during this game?",
    description: "Reflect on new perspectives you've gained.",
    durationSeconds: 90,
    isActive: true
  },
  {
    question: "What's one question you wish had been asked?",
    description: "Think about what you're curious to know about others.",
    durationSeconds: 90,
    isActive: true
  }
];

// Prompt Packs seed data
const samplePromptPacks: NewPromptPack[] = [
  {
    name: "Childhood Memories",
    description: "Questions about your earliest memories and growing up years",
    unlockCondition: "Complete 10 prompts to unlock",
    isActive: true
  },
  {
    name: "Future Dreams",
    description: "Explore aspirations, goals, and visions of the future",
    unlockCondition: "Complete 20 prompts to unlock",
    isActive: true
  },
  {
    name: "Philosophical Thoughts",
    description: "Deeper questions about life, beliefs, and values",
    unlockCondition: "Complete 30 prompts to unlock",
    isActive: true
  }
];

// Seed functions for activity breaks
export async function seedActivityBreaks() {
  console.log('🌱 Seeding database with activity breaks...');
  
  try {
    // Clear existing data
    await db.delete(activityBreaks);
    
    // Insert new activity breaks
    const insertedBreaks = await db
      .insert(activityBreaks)
      .values(sampleActivityBreaks)
      .returning();
    
    console.log(`✅ Seeded ${insertedBreaks.length} activity breaks`);
    return insertedBreaks;
  } catch (error) {
    console.error('Error seeding activity breaks:', error);
    throw error;
  }
}

// Seed functions for reflection pauses
export async function seedReflectionPauses() {
  console.log('🌱 Seeding database with reflection pauses...');
  
  try {
    // Clear existing data
    await db.delete(reflectionPauses);
    
    // Insert new reflection pauses
    const insertedPauses = await db
      .insert(reflectionPauses)
      .values(sampleReflectionPauses)
      .returning();
    
    console.log(`✅ Seeded ${insertedPauses.length} reflection pauses`);
    return insertedPauses;
  } catch (error) {
    console.error('Error seeding reflection pauses:', error);
    throw error;
  }
}

// Seed functions for prompt packs
export async function seedPromptPacks() {
  console.log('🌱 Seeding database with prompt packs...');
  
  try {
    // Clear existing data
    await db.delete(promptPacks);
    
    // Insert new prompt packs
    const insertedPacks = await db
      .insert(promptPacks)
      .values(samplePromptPacks)
      .returning();
    
    console.log(`✅ Seeded ${insertedPacks.length} prompt packs`);
    return insertedPacks;
  } catch (error) {
    console.error('Error seeding prompt packs:', error);
    throw error;
  }
}

// Main seed function
export async function seedDatabase() {
  console.log('🌱 Starting database seeding process...');
  
  try {
    // Seed all data types
    await seedPrompts();
    await seedActivityBreaks();
    await seedReflectionPauses();
    await seedPromptPacks();
    
    console.log('✅ All seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error in seeding process:', error);
    throw error;
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
