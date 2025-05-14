const { db } = require('./server/db');
const { eq, like } = require('drizzle-orm');
const { challenges } = require('./shared/schema');

async function fixChallenges() {
  try {
    // Find all challenges with the pattern "number,text"
    const brokenChallenges = await db
      .select()
      .from(challenges)
      .where(like(challenges.text, '%,"%'));

    console.log(`Found ${brokenChallenges.length} challenges to fix`);

    // Update each challenge to remove the numbering
    for (const challenge of brokenChallenges) {
      const originalText = challenge.text;
      // Extract just the text part after the number and quotes
      const fixedText = originalText.replace(/^\d+,"/, '').replace(/"$/, '');
      
      await db
        .update(challenges)
        .set({ text: fixedText })
        .where(eq(challenges.id, challenge.id));
      
      console.log(`Fixed challenge ${challenge.id}: "${originalText}" -> "${fixedText}"`);
    }

    console.log('Challenge cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing challenges:', error);
    process.exit(1);
  }
}

fixChallenges();
