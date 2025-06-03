import express from 'express';
import {
  createGameSession,
  getGameSessionById,
  getGameSessionByCode,
  joinGameSession,
  getGamePlayers,
  getNextPrompt,
  completeActivityBreak,
  completeReflectionPause,
  endGameSession
} from '../controllers/gameSessionController.js';

const router = express.Router();

/**
 * @route POST /api/game-sessions
 * @desc Create a new game session
 * @access Public
 */
router.post('/', createGameSession);

/**
 * @route GET /api/game-sessions/:id
 * @desc Get game session by ID
 * @access Public
 */
router.get('/:id', getGameSessionById);

/**
 * @route GET /api/game-sessions/code/:code
 * @desc Get game session by code
 * @access Public
 */
router.get('/code/:code', getGameSessionByCode);

/**
 * @route POST /api/game-sessions/join
 * @desc Join a game session
 * @access Public
 */
router.post('/join', joinGameSession);

/**
 * @route GET /api/game-sessions/:gameId/players
 * @desc Get players in a game session
 * @access Public
 */
router.get('/:gameId/players', getGamePlayers);

/**
 * @route GET /api/game-sessions/:gameId/next-prompt
 * @desc Get next prompt for a game session
 * @access Public
 */
router.get('/:gameId/next-prompt', getNextPrompt);

/**
 * @route POST /api/game-sessions/:sessionId/activity-breaks/:activityBreakId/complete
 * @desc Mark activity break as completed
 * @access Public
 */
router.post('/:sessionId/activity-breaks/:activityBreakId/complete', completeActivityBreak);

/**
 * @route POST /api/game-sessions/:sessionId/reflection-pauses/:reflectionPauseId/complete
 * @desc Mark reflection pause as completed
 * @access Public
 */
router.post('/:sessionId/reflection-pauses/:reflectionPauseId/complete', completeReflectionPause);

/**
 * @route POST /api/game-sessions/:id/end
 * @desc End a game session
 * @access Public
 */
router.post('/:id/end', endGameSession);

export default router;
