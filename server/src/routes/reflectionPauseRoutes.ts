import express from 'express';
import {
  getAllReflectionPauses,
  getReflectionPauseById,
  getRandomReflectionPause,
  createReflectionPause,
  updateReflectionPause,
  deleteReflectionPause
} from '../controllers/reflectionPauseController.js';

const router = express.Router();

/**
 * @route GET /api/reflection-pauses
 * @desc Get all reflection pauses
 * @access Public
 */
router.get('/', getAllReflectionPauses);

/**
 * @route GET /api/reflection-pauses/random
 * @desc Get a random reflection pause
 * @access Public
 */
router.get('/random', getRandomReflectionPause);

/**
 * @route GET /api/reflection-pauses/:id
 * @desc Get reflection pause by ID
 * @access Public
 */
router.get('/:id', getReflectionPauseById);

/**
 * @route POST /api/reflection-pauses
 * @desc Create a new reflection pause
 * @access Admin
 */
router.post('/', createReflectionPause);

/**
 * @route PUT /api/reflection-pauses/:id
 * @desc Update a reflection pause
 * @access Admin
 */
router.put('/:id', updateReflectionPause);

/**
 * @route DELETE /api/reflection-pauses/:id
 * @desc Delete a reflection pause (soft delete)
 * @access Admin
 */
router.delete('/:id', deleteReflectionPause);

export default router;
