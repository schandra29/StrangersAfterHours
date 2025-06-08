import { db } from '../db';
import { prompts } from '../../shared/schema';
import { sql } from 'drizzle-orm';

async function checkPrompts() {
  try {
    console.log('Fetching prompts from the database...');
    
    // Get total count of prompts
    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(prompts);
    
    console.log(`Total prompts in database: ${totalCount[0].count}`);
    
    // Get count by level
    const byLevel = await db
      .select({
        level: prompts.level,
        count: sql<number>`count(*)`
      })
      .from(prompts)
      .groupBy(prompts.level);
    
    console.log('\nPrompts by level:');
    byLevel.forEach(row => {
      console.log(`- Level ${row.level}: ${row.count} prompts`);
    });
    
    // Get count by intensity
    const byIntensity = await db
      .select({
        intensity: prompts.intensity,
        count: sql<number>`count(*)`
      })
      .from(prompts)
      .groupBy(prompts.intensity);
    
    console.log('\nPrompts by intensity:');
    byIntensity.forEach(row => {
      console.log(`- Intensity ${row.intensity}: ${row.count} prompts`);
    });
    
    // Get count by type
    const byType = await db
      .select({
        type: prompts.type,
        count: sql<number>`count(*)`
      })
      .from(prompts)
      .groupBy(prompts.type);
    
    console.log('\nPrompts by type:');
    byType.forEach(row => {
      console.log(`- Type ${row.type}: ${row.count} prompts`);
    });
    
    // Get a few sample prompts
    const samplePrompts = await db
      .select()
      .from(prompts)
      .limit(5);
    
    console.log('\nSample prompts:');
    samplePrompts.forEach((prompt: any, index: number) => {
      console.log(`\nPrompt #${index + 1}:`);
      console.log(`- Text: ${prompt.text}`);
      console.log(`- Level: ${prompt.level}`);
      console.log(`- Intensity: ${prompt.intensity}`);
      console.log(`- Type: ${prompt.type}`);
      console.log(`- Category: ${prompt.category}`);
    });
    
  } catch (error) {
    console.error('Error checking prompts:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
checkPrompts();
