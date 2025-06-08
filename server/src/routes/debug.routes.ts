import { Router } from 'express';
import { db } from '../../db.js';
import { prompts } from '../../../shared/schema.js';
import { sql } from 'drizzle-orm';

const router = Router();

// Debug route to list all prompts
router.get('/prompts', async (req, res) => {
  try {
    const allPrompts = await db.select().from(prompts).limit(50);
    res.json({
      count: allPrompts.length,
      prompts: allPrompts
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

export default router;
