import { Router } from 'express';

const router = Router();

// Mock endpoints for client testing
router.get('/next-prompt', (req, res) => {
  console.log('[DEBUG] GET /game/next-prompt called');
  res.json({
    prompt: {
      id: '1',
      text: 'If you could have dinner with anyone in the world, who would it be and why?',
      type: 'open',
      level: 1,
      intensity: 1,
      packId: '1'
    }
  });
});

router.get('/activity', (req, res) => {
  console.log('[DEBUG] GET /game/activity called');
  res.json({
    id: '1',
    title: 'Take a walk',
    description: 'Take a short 5-minute walk around your space.',
    duration: 5
  });
});

router.get('/reflection', (req, res) => {
  console.log('[DEBUG] GET /game/reflection called');
  res.json({
    id: '1',
    question: 'What are you grateful for today?',
    description: 'Take a moment to reflect on the things you appreciate in your life.'
  });
});

router.get('/unlockable-packs', (req, res) => {
  console.log('[DEBUG] GET /game/unlockable-packs called');
  res.json([
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
  ]);
});

router.get('/progress', (req, res) => {
  console.log('[DEBUG] GET /game/progress called');
  res.json({
    level: 1,
    intensity: 1,
    isGroupMode: false,
    promptsAnswered: 0
  });
});

// Simple POST endpoints
router.post('/complete-activity', (req, res) => {
  console.log('[DEBUG] POST /game/complete-activity called');
  res.json({ success: true });
});
router.post('/complete-reflection', (req, res) => {
  console.log('[DEBUG] POST /game/complete-reflection called');
  res.json({ success: true });
});
router.post('/unlock-pack', (req, res) => {
  console.log('[DEBUG] POST /game/unlock-pack called');
  res.json({ success: true });
});
router.post('/update-progress', (req, res) => {
  console.log('[DEBUG] POST /game/update-progress called');
  res.json({ success: true });
});
router.post('/answer', (req, res) => {
  console.log('[DEBUG] POST /game/answer called');
  res.json({ success: true });
});

export default router;
