import express from 'express';
import activityBreakRoutes from './activityBreakRoutes.js';
import reflectionPauseRoutes from './reflectionPauseRoutes.js';
import promptPackRoutes from './promptPackRoutes.js';
import gameSessionRoutes from './gameSessionRoutes.js';
import gameRoutes from './gameRoutes.js';

const router = express.Router();

// Mount routes
router.use('/activity-breaks', activityBreakRoutes);
router.use('/reflection-pauses', reflectionPauseRoutes);
router.use('/prompt-packs', promptPackRoutes);
router.use('/game-sessions', gameSessionRoutes);
router.use('/game', gameRoutes); // Add new game routes

export default router;
