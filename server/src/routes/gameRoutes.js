import { Router } from 'express';
import { db } from '../../db/index.js';
import { mockAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Get next prompt
router.get('/next-prompt', mockAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get a random prompt for testing
    const prompt = {
      id: '1',
      text: 'If you could have dinner with anyone in the world, who would it be and why?',
      type: 'open',
      level: 1,
      intensity: 1,
      packId: '1'
    };
    
    return res.json({ prompt });
  } catch (error) {
    console.error('Error getting next prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity break
router.get('/activity', mockAuth, async (req, res) => {
  try {
    // Return a mock activity break for testing
    const activity = {
      id: '1',
      title: 'Take a walk',
      description: 'Take a short 5-minute walk around your space.',
      duration: 5
    };
    
    return res.json(activity);
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reflection
router.get('/reflection', mockAuth, async (req, res) => {
  try {
    // Return a mock reflection for testing
    const reflection = {
      id: '1',
      question: 'What are you grateful for today?',
      description: 'Take a moment to reflect on the things you appreciate in your life.'
    };
    
    return res.json(reflection);
  } catch (error) {
    console.error('Error getting reflection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unlockable packs
router.get('/unlockable-packs', mockAuth, async (req, res) => {
  try {
    // Return mock unlockable packs for testing
    const packs = [
      {
        id: '1',
        name: 'Deep Connections',
        description: 'Questions that help build deeper connections',
        isUnlocked: true
      },
      {
        id: '2',
        name: 'Fun & Games',
        description: 'Lighter questions for a fun mood',
        isUnlocked: false
      }
    ];
    
    return res.json(packs);
  } catch (error) {
    console.error('Error getting unlockable packs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user progress
router.get('/progress', mockAuth, async (req, res) => {
  try {
    // Return mock progress for testing
    const progress = {
      level: 1,
      intensity: 1,
      isGroupMode: false,
      promptsAnswered: 0
    };
    
    return res.json(progress);
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple POST endpoints for completing activities 
router.post('/complete-activity', mockAuth, async (req, res) => {
  res.json({ success: true });
});

router.post('/complete-reflection', mockAuth, async (req, res) => {
  res.json({ success: true });
});

router.post('/unlock-pack', mockAuth, async (req, res) => {
  res.json({ success: true });
});

router.post('/update-progress', mockAuth, async (req, res) => {
  res.json({ success: true });
});

router.post('/answer', mockAuth, async (req, res) => {
  res.json({ success: true });
});

export default router;
