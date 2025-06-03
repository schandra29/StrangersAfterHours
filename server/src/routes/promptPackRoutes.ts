import express from 'express';
import {
  getAllPromptPacks,
  getPromptPackById,
  getPromptsInPack,
  createPromptPack,
  addPromptToPack,
  removePromptFromPack,
  updatePromptPack,
  deletePromptPack,
  getUserUnlockedPacks,
  unlockPackForUser
} from '../controllers/promptPackController.js';

const router = express.Router();

/**
 * @route GET /api/prompt-packs
 * @desc Get all prompt packs
 * @access Public
 */
router.get('/', getAllPromptPacks);

/**
 * @route GET /api/prompt-packs/:id
 * @desc Get prompt pack by ID
 * @access Public
 */
router.get('/:id', getPromptPackById);

/**
 * @route GET /api/prompt-packs/:id/prompts
 * @desc Get prompts in a pack
 * @access Public
 */
router.get('/:id/prompts', getPromptsInPack);

/**
 * @route POST /api/prompt-packs
 * @desc Create a new prompt pack
 * @access Admin
 */
router.post('/', createPromptPack);

/**
 * @route POST /api/prompt-packs/add-prompt
 * @desc Add a prompt to a pack
 * @access Admin
 */
router.post('/add-prompt', addPromptToPack);

/**
 * @route DELETE /api/prompt-packs/:packId/prompts/:promptId
 * @desc Remove a prompt from a pack
 * @access Admin
 */
router.delete('/:packId/prompts/:promptId', removePromptFromPack);

/**
 * @route PUT /api/prompt-packs/:id
 * @desc Update a prompt pack
 * @access Admin
 */
router.put('/:id', updatePromptPack);

/**
 * @route DELETE /api/prompt-packs/:id
 * @desc Delete a prompt pack (soft delete)
 * @access Admin
 */
router.delete('/:id', deletePromptPack);

/**
 * @route GET /api/prompt-packs/user/:userId
 * @desc Get unlocked packs for a user
 * @access Public
 */
router.get('/user/:userId', getUserUnlockedPacks);

/**
 * @route POST /api/prompt-packs/unlock
 * @desc Unlock a pack for a user
 * @access Public
 */
router.post('/unlock', unlockPackForUser);

export default router;
