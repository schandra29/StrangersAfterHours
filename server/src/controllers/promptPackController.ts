import { Request, Response } from 'express';
import { db } from '../db';
import { promptPacks } from '../db/schema/promptPacks';
import { userUnlockedPacks } from '../db/schema/promptPacks';
import { promptPackPrompts } from '../db/schema/prompts';
import { prompts } from '../db/schema/prompts';
import { eq, and, inArray } from 'drizzle-orm';

// Get all prompt packs
export const getAllPromptPacks = async (req: Request, res: Response) => {
  try {
    const allPacks = await db.select().from(promptPacks);
    return res.json(allPacks);
  } catch (error) {
    console.error('Error fetching prompt packs:', error);
    return res.status(500).json({ error: 'Failed to fetch prompt packs' });
  }
};

// Get prompt pack by ID
export const getPromptPackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pack = await db.select().from(promptPacks).where(eq(promptPacks.id, id));
    
    if (pack.length === 0) {
      return res.status(404).json({ error: 'Prompt pack not found' });
    }
    
    return res.json(pack[0]);
  } catch (error) {
    console.error('Error fetching prompt pack:', error);
    return res.status(500).json({ error: 'Failed to fetch prompt pack' });
  }
};

// Get prompts in a pack
export const getPromptsInPack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if pack exists
    const pack = await db.select().from(promptPacks).where(eq(promptPacks.id, id));
    
    if (pack.length === 0) {
      return res.status(404).json({ error: 'Prompt pack not found' });
    }
    
    // Get prompt IDs in this pack
    const promptIds = await db.select({
      promptId: promptPackPrompts.promptId
    })
    .from(promptPackPrompts)
    .where(eq(promptPackPrompts.packId, id));
    
    if (promptIds.length === 0) {
      return res.json([]);
    }
    
    // Get the actual prompts
    const packPrompts = await db.select()
      .from(prompts)
      .where(inArray(prompts.id, promptIds.map(p => p.promptId)));
    
    return res.json(packPrompts);
  } catch (error) {
    console.error('Error fetching prompts in pack:', error);
    return res.status(500).json({ error: 'Failed to fetch prompts in pack' });
  }
};

// Create a new prompt pack
export const createPromptPack = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      theme,
      unlockAfterPrompts,
      deck,
      imageUrl,
      isPremium
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const newPromptPack = await db.insert(promptPacks).values({
      name,
      description,
      theme,
      unlockAfterPrompts: unlockAfterPrompts || '10',
      deck,
      imageUrl,
      isPremium: isPremium || false,
      isActive: true,
      promptCount: '0'
    }).returning();
    
    return res.status(201).json(newPromptPack[0]);
  } catch (error) {
    console.error('Error creating prompt pack:', error);
    return res.status(500).json({ error: 'Failed to create prompt pack' });
  }
};

// Add a prompt to a pack
export const addPromptToPack = async (req: Request, res: Response) => {
  try {
    const { packId, promptId } = req.body;
    
    // Validate required fields
    if (!packId || !promptId) {
      return res.status(400).json({ error: 'Pack ID and Prompt ID are required' });
    }
    
    // Check if pack exists
    const pack = await db.select().from(promptPacks).where(eq(promptPacks.id, packId));
    
    if (pack.length === 0) {
      return res.status(404).json({ error: 'Prompt pack not found' });
    }
    
    // Check if prompt exists
    const prompt = await db.select().from(prompts).where(eq(prompts.id, promptId));
    
    if (prompt.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    // Check if prompt is already in pack
    const existingRelation = await db.select()
      .from(promptPackPrompts)
      .where(
        and(
          eq(promptPackPrompts.packId, packId),
          eq(promptPackPrompts.promptId, promptId)
        )
      );
    
    if (existingRelation.length > 0) {
      return res.status(400).json({ error: 'Prompt is already in this pack' });
    }
    
    // Add prompt to pack
    await db.insert(promptPackPrompts).values({
      packId,
      promptId
    });
    
    // Update prompt count in pack
    const promptCount = await db.select({ count: db.fn.count() })
      .from(promptPackPrompts)
      .where(eq(promptPackPrompts.packId, packId));
    
    await db.update(promptPacks)
      .set({ 
        promptCount: String(promptCount[0].count),
        updatedAt: new Date()
      })
      .where(eq(promptPacks.id, packId));
    
    return res.json({ message: 'Prompt added to pack successfully' });
  } catch (error) {
    console.error('Error adding prompt to pack:', error);
    return res.status(500).json({ error: 'Failed to add prompt to pack' });
  }
};

// Remove a prompt from a pack
export const removePromptFromPack = async (req: Request, res: Response) => {
  try {
    const { packId, promptId } = req.params;
    
    // Check if relation exists
    const existingRelation = await db.select()
      .from(promptPackPrompts)
      .where(
        and(
          eq(promptPackPrompts.packId, packId),
          eq(promptPackPrompts.promptId, promptId)
        )
      );
    
    if (existingRelation.length === 0) {
      return res.status(404).json({ error: 'Prompt is not in this pack' });
    }
    
    // Remove prompt from pack
    await db.delete(promptPackPrompts)
      .where(
        and(
          eq(promptPackPrompts.packId, packId),
          eq(promptPackPrompts.promptId, promptId)
        )
      );
    
    // Update prompt count in pack
    const promptCount = await db.select({ count: db.fn.count() })
      .from(promptPackPrompts)
      .where(eq(promptPackPrompts.packId, packId));
    
    await db.update(promptPacks)
      .set({ 
        promptCount: String(promptCount[0].count),
        updatedAt: new Date()
      })
      .where(eq(promptPacks.id, packId));
    
    return res.json({ message: 'Prompt removed from pack successfully' });
  } catch (error) {
    console.error('Error removing prompt from pack:', error);
    return res.status(500).json({ error: 'Failed to remove prompt from pack' });
  }
};

// Update a prompt pack
export const updatePromptPack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      theme,
      unlockAfterPrompts,
      deck,
      imageUrl,
      isPremium,
      isActive
    } = req.body;
    
    // Check if prompt pack exists
    const existingPack = await db.select().from(promptPacks).where(eq(promptPacks.id, id));
    
    if (existingPack.length === 0) {
      return res.status(404).json({ error: 'Prompt pack not found' });
    }
    
    // Update the prompt pack
    const updatedPack = await db.update(promptPacks)
      .set({
        name: name !== undefined ? name : existingPack[0].name,
        description: description !== undefined ? description : existingPack[0].description,
        theme: theme !== undefined ? theme : existingPack[0].theme,
        unlockAfterPrompts: unlockAfterPrompts !== undefined ? unlockAfterPrompts : existingPack[0].unlockAfterPrompts,
        deck: deck !== undefined ? deck : existingPack[0].deck,
        imageUrl: imageUrl !== undefined ? imageUrl : existingPack[0].imageUrl,
        isPremium: isPremium !== undefined ? isPremium : existingPack[0].isPremium,
        isActive: isActive !== undefined ? isActive : existingPack[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(promptPacks.id, id))
      .returning();
    
    return res.json(updatedPack[0]);
  } catch (error) {
    console.error('Error updating prompt pack:', error);
    return res.status(500).json({ error: 'Failed to update prompt pack' });
  }
};

// Delete a prompt pack (soft delete by setting isActive to false)
export const deletePromptPack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if prompt pack exists
    const existingPack = await db.select().from(promptPacks).where(eq(promptPacks.id, id));
    
    if (existingPack.length === 0) {
      return res.status(404).json({ error: 'Prompt pack not found' });
    }
    
    // Soft delete by setting isActive to false
    await db.update(promptPacks)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(promptPacks.id, id));
    
    return res.json({ message: 'Prompt pack deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt pack:', error);
    return res.status(500).json({ error: 'Failed to delete prompt pack' });
  }
};

// Get unlocked packs for a user
export const getUserUnlockedPacks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const unlockedPacks = await db.select({
      pack: promptPacks,
      unlockedAt: userUnlockedPacks.unlockedAt
    })
    .from(userUnlockedPacks)
    .innerJoin(promptPacks, eq(userUnlockedPacks.packId, promptPacks.id))
    .where(eq(userUnlockedPacks.userId, userId));
    
    return res.json(unlockedPacks);
  } catch (error) {
    console.error('Error fetching user unlocked packs:', error);
    return res.status(500).json({ error: 'Failed to fetch user unlocked packs' });
  }
};

// Unlock a pack for a user
export const unlockPackForUser = async (req: Request, res: Response) => {
  try {
    const { userId, packId } = req.body;
    
    // Validate required fields
    if (!userId || !packId) {
      return res.status(400).json({ error: 'User ID and Pack ID are required' });
    }
    
    // Check if pack exists
    const pack = await db.select().from(promptPacks).where(eq(promptPacks.id, packId));
    
    if (pack.length === 0) {
      return res.status(404).json({ error: 'Prompt pack not found' });
    }
    
    // Check if already unlocked
    const existingUnlock = await db.select()
      .from(userUnlockedPacks)
      .where(
        and(
          eq(userUnlockedPacks.userId, userId),
          eq(userUnlockedPacks.packId, packId)
        )
      );
    
    if (existingUnlock.length > 0) {
      return res.status(400).json({ error: 'Pack is already unlocked for this user' });
    }
    
    // Unlock the pack
    await db.insert(userUnlockedPacks).values({
      userId,
      packId
    });
    
    return res.json({ message: 'Pack unlocked successfully' });
  } catch (error) {
    console.error('Error unlocking pack for user:', error);
    return res.status(500).json({ error: 'Failed to unlock pack for user' });
  }
};
