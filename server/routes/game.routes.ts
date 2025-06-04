import { Router } from 'express';
import { GameService } from '../services/game.service';
import { authenticateJWT, mockAuth } from '../middleware/auth.middleware';

// Use mock auth for development, real auth for production
const auth = process.env.NODE_ENV === 'development' ? mockAuth : authenticateJWT;
import { db } from '../db';
import { promptPacks, reflectionPauses } from '../../src/lib/db/schema';
import { gameProgress, userUnlockedPacks } from '../../shared/game-schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

/**
 * @route GET /api/game/next-prompt
 * @desc Get the next prompt for the user
 */
router.get('/next-prompt', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the last prompt type from query params
    const lastPromptType = req.query.lastPromptType as string | undefined;
    
    // Initialize user progress if not exists
    await GameService.initializeUserProgress(userId);
    
    // Get next prompt
    const prompt = await GameService.getNextPrompt(userId, lastPromptType);
    
    if (!prompt) {
      return res.status(404).json({ message: 'No prompts available' });
    }

    res.json({
      prompt,
      type: prompt.type
    });
  } catch (error) {
    console.error('Error getting next prompt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/game/answer
 * @desc Record a prompt answer and check for unlocks
 */
router.post('/answer', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { promptId, answer } = req.body;
    
    if (!promptId) {
      return res.status(400).json({ message: 'Prompt ID is required' });
    }

    // Record the answer and check for unlocks
    const result = await GameService.recordPromptAnswered(userId);
    
    // Check if we should show an activity break (every 4 prompts)
    const shouldShowActivity = result.unlockedPacks.length > 0 || 
      (result.nextMilestone && result.nextMilestone % 4 === 0);
    
    // Check if we should show a reflection (every 10 prompts)
    const shouldShowReflection = result.nextMilestone && result.nextMilestone % 10 === 0;

    res.json({
      success: true,
      unlocks: {
        packs: result.unlockedPacks,
        nextMilestone: result.nextMilestone
      },
      shouldShowActivity,
      shouldShowReflection
    });
  } catch (error) {
    console.error('Error recording answer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/game/activity
 * @desc Get a random activity
 */
router.get('/activity', auth, async (req, res) => {
  try {
    const activity = await GameService.getRandomActivity();
    
    if (!activity) {
      return res.status(404).json({ message: 'No activities available' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/game/reflection
 * @desc Get a random reflection pause question
 */
router.get('/reflection', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get a random reflection pause using the GameService
    const reflection = await GameService.getRandomReflection();

    if (!reflection) {
      return res.status(404).json({ message: 'No reflection pauses available' });
    }

    res.json(reflection);
  } catch (error) {
    console.error('Error getting reflection pause:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/game/complete-activity
 * @desc Record that a user completed an activity break
 */
router.post('/complete-activity', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { activityId } = req.body;
    if (!activityId) {
      return res.status(400).json({ message: 'Activity ID is required' });
    }

    // Record the activity completion
    // For now, we'll just return success
    // In a full implementation, we would track this in the database

    res.json({
      success: true,
      message: 'Activity completed successfully'
    });
  } catch (error) {
    console.error('Error completing activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/game/complete-reflection
 * @desc Record that a user completed a reflection pause
 */
router.post('/complete-reflection', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { reflectionId, answer } = req.body;
    if (!reflectionId) {
      return res.status(400).json({ message: 'Reflection ID is required' });
    }

    // Record the reflection completion
    // For now, we'll just return success
    // In a full implementation, we would store the answer in the database

    res.json({
      success: true,
      message: 'Reflection completed successfully'
    });
  } catch (error) {
    console.error('Error completing reflection:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/game/unlockable-packs
 * @desc Get all unlockable packs for a user
 */
router.get('/unlockable-packs', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all prompt packs
    const allPacks = await db.select().from(promptPacks);
    
    // Get user's unlocked packs
    const userUnlocks = await db
      .select()
      .from(userUnlockedPacks)
      .where(eq(userUnlockedPacks.userId, userId.toString()));
      
    // Mark which packs are already unlocked
    const packsWithUnlockStatus = allPacks.map(pack => ({
      ...pack,
      isUnlocked: userUnlocks.some(unlock => unlock.packId === pack.id)
    }));

    res.json(packsWithUnlockStatus);
  } catch (error) {
    console.error('Error getting unlockable packs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/game/unlock-pack
 * @desc Unlock a prompt pack for a user
 */
router.post('/unlock-pack', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { packId } = req.body;
    if (!packId) {
      return res.status(400).json({ message: 'Pack ID is required' });
    }

    // Check if pack exists
    const pack = await db
      .select()
      .from(promptPacks)
      .where(eq(promptPacks.id, packId))
      .limit(1);

    if (!pack || pack.length === 0) {
      return res.status(404).json({ message: 'Pack not found' });
    }

    // Check if already unlocked
    const existingUnlock = await db
      .select()
      .from(userUnlockedPacks)
      .where(
        and(
          eq(userUnlockedPacks.userId, userId.toString()),
          eq(userUnlockedPacks.packId, packId.toString())
        )
      );

    if (existingUnlock && existingUnlock.length > 0) {
      return res.json({
        success: true,
        message: 'Pack was already unlocked',
        pack: pack[0]
      });
    }

    // Unlock the pack
    await db.insert(userUnlockedPacks).values({
      userId: userId.toString(),
      packId: packId.toString(),
      unlockedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Pack unlocked successfully',
      pack: pack[0]
    });
  } catch (error) {
    console.error('Error unlocking pack:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/game/progress
 * @desc Get the user's game progress
 */
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user's game progress
    const progress = await db
      .select()
      .from(gameProgress)
      .where(eq(gameProgress.userId, userId))
      .limit(1);

    if (!progress || progress.length === 0) {
      // Create new progress record if it doesn't exist
      const newProgress = await db
        .insert(gameProgress)
        .values({
          userId,
          level: 1,
          intensity: 1,
          promptsAnswered: 0,
          isGroupMode: false,
          lastPlayedAt: new Date()
        })
        .returning();

      return res.json(newProgress[0]);
    }

    res.json(progress[0]);
  } catch (error) {
    console.error('Error getting game progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/game/update-progress
 * @desc Update the user's game progress
 */
router.post('/update-progress', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { level, intensity, isGroupMode } = req.body;
    
    // Get user's current progress
    const currentProgress = await db
      .select()
      .from(gameProgress)
      .where(eq(gameProgress.userId, userId))
      .limit(1);

    if (!currentProgress || currentProgress.length === 0) {
      // Create new progress record
      const newProgress = await db
        .insert(gameProgress)
        .values({
          userId,
          level: level ?? 1,
          intensity: intensity ?? 1,
          promptsAnswered: 0,
          isGroupMode: isGroupMode ?? false,
          lastPlayedAt: new Date()
        })
        .returning();

      return res.json(newProgress[0]);
    }

    // Update existing progress
    const updatedProgress = await db
      .update(gameProgress)
      .set({
        level: level ?? currentProgress[0].level,
        intensity: intensity ?? currentProgress[0].intensity,
        isGroupMode: isGroupMode !== undefined ? isGroupMode : currentProgress[0].isGroupMode,
        lastPlayedAt: new Date()
      })
      .where(eq(gameProgress.userId, userId))
      .returning();

    res.json(updatedProgress[0]);
  } catch (error) {
    console.error('Error updating game progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
