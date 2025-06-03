import { Router } from 'express';
import { GameService } from '../services/game.service';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/game/next-prompt
 * @desc Get the next prompt for the user
 */
router.get('/next-prompt', authenticateJWT, async (req, res) => {
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
router.post('/answer', authenticateJWT, async (req, res) => {
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
router.get('/activity', authenticateJWT, async (req, res) => {
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

export default router;
