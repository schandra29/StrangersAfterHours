import { db } from '.';
import { prompts, type NewPrompt } from './schema';

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

// Add more seed functions for other tables

// Main seed function
export async function seedDatabase() {
  try {
    await seedPrompts();
    // Add other seed function calls here
    console.log('🌱 Database seeding completed successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
