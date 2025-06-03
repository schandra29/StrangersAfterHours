import express from 'express';
import {
  getAllActivityBreaks,
  getActivityBreakById,
  getRandomActivityBreak,
  createActivityBreak,
  updateActivityBreak,
  deleteActivityBreak
} from '../controllers/activityBreakController.js';

const router = express.Router();

/**
 * @route GET /api/activity-breaks
 * @desc Get all activity breaks
 * @access Public
 */
router.get('/', getAllActivityBreaks);

/**
 * @route GET /api/activity-breaks/random
 * @desc Get a random activity break
 * @access Public
 */
router.get('/random', getRandomActivityBreak);

/**
 * @route GET /api/activity-breaks/:id
 * @desc Get activity break by ID
 * @access Public
 */
router.get('/:id', getActivityBreakById);

/**
 * @route POST /api/activity-breaks
 * @desc Create a new activity break
 * @access Admin
 */
router.post('/', createActivityBreak);

/**
 * @route PUT /api/activity-breaks/:id
 * @desc Update an activity break
 * @access Admin
 */
router.put('/:id', updateActivityBreak);

/**
 * @route DELETE /api/activity-breaks/:id
 * @desc Delete an activity break (soft delete)
 * @access Admin
 */
router.delete('/:id', deleteActivityBreak);

export default router;
