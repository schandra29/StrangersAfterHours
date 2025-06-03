import { db } from "../db";
import { eq, and, lte, or, isNull, sql, asc, inArray } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

// Import tables from schema
import { prompts } from "@shared/schema";
import { activities, promptPacks, userProgress } from "@shared/game-schema";

// Define types based on the schema
type Prompt = InferSelectModel<typeof prompts>;
type Activity = InferSelectModel<typeof activities>;
type PromptPack = InferSelectModel<typeof promptPacks>;
type UserProgress = InferSelectModel<typeof userProgress>;

// Extend the database types to include our new tables
declare module '../db' {
  interface Database {
    userProgress: typeof userProgress;
    promptPacks: typeof promptPacks;
  }
}

export class GameService {
  /**
   * Get next prompt based on game state
   */
  static async getNextPrompt(userId: number, lastPromptType?: string): Promise<Prompt | null> {
    // Get user progress
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId)
    });

    // Determine next prompt type (alternate between solo and group)
    const nextType = lastPromptType === 'solo' ? 'group' : 'solo';

    // Build query for next prompt
    const query = db.select()
      .from(prompts)
      .where(and(
        eq(prompts.isActive, true),
        eq(prompts.type, nextType as any),
        // Only include unlocked packs
        or(
          isNull(prompts.packId),
          progress?.unlockedPacks?.length ? 
            inArray(prompts.packId, progress.unlockedPacks.map(Number)) :
            sql`FALSE`
        )
      ))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    const [nextPrompt] = await query;
    return nextPrompt || null;
  }

  /**
   * Get a random activity
   */
  static async getRandomActivity(): Promise<Activity | null> {
    const [activity] = await db.select()
      .from(activities)
      .where(eq(activities.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    
    return activity || null;
  }

  /**
   * Record prompt answered and check for unlocks
   */
  static async recordPromptAnswered(userId: number): Promise<{
    unlockedPacks: PromptPack[];
    nextMilestone: number | null;
  }> {
    // Start transaction
    return db.transaction(async (tx) => {
      // Get and lock user progress
      const [progress] = await tx.update(userProgress)
        .set({
          promptsAnswered: sql`${userProgress.promptsAnswered} + 1`,
          updatedAt: new Date()
        })
        .where(eq(userProgress.userId, userId))
        .returning();

      if (!progress) {
        throw new Error('User progress not found');
      }

      // Check for unlockable packs
      const unlockablePacks = await tx.select()
        .from(promptPacks)
        .where(and(
          eq(promptPacks.isActive, true),
          lte(promptPacks.unlockThreshold, progress.promptsAnswered + 1),
          sql`NOT (${promptPacks.id} = ANY(${progress.unlockedPacks || []}::int[]))`
        ));

      // Unlock any packs that should be unlocked
      const unlockedPacks: PromptPack[] = [];
      for (const pack of unlockablePacks) {
        await tx.update(userProgress)
          .set({
            unlockedPacks: sql`array_append(${userProgress.unlockedPacks}, ${pack.id})`,
            updatedAt: new Date()
          })
          .where(eq(userProgress.userId, userId));
        
        unlockedPacks.push(pack);
      }

      // Calculate next milestone (next unlock threshold)
      const nextMilestone = await (tx as any).query.promptPacks.findFirst({
        where: and(
          // @ts-ignore - isActive is dynamically added
          eq(promptPacks.isActive, true),
          sql`${promptPacks.unlockThreshold} > ${progress.promptsAnswered + 1}`
        ),
        orderBy: [asc(promptPacks.unlockThreshold)]
      });

      return {
        unlockedPacks,
        nextMilestone: nextMilestone?.unlockThreshold || null
      };
    });
  }

  /**
   * Initialize user progress
   */
  static async initializeUserProgress(userId: number): Promise<void> {
    await db.insert(userProgress)
      .values({
        userId,
        promptsAnswered: 0,
        unlockedPacks: [],
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoNothing();
  }
}
