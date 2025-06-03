import { Request, Response } from 'express';
import { db } from '../db';
import { activityBreaks } from '../db/schema/activityBreaks';
import { eq, and } from 'drizzle-orm';

// Get all activity breaks
export const getAllActivityBreaks = async (req: Request, res: Response) => {
  try {
    const allBreaks = await db.select().from(activityBreaks);
    return res.json(allBreaks);
  } catch (error) {
    console.error('Error fetching activity breaks:', error);
    return res.status(500).json({ error: 'Failed to fetch activity breaks' });
  }
};

// Get activity break by ID
export const getActivityBreakById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activityBreak = await db.select().from(activityBreaks).where(eq(activityBreaks.id, id));
    
    if (activityBreak.length === 0) {
      return res.status(404).json({ error: 'Activity break not found' });
    }
    
    return res.json(activityBreak[0]);
  } catch (error) {
    console.error('Error fetching activity break:', error);
    return res.status(500).json({ error: 'Failed to fetch activity break' });
  }
};

// Get random activity break
export const getRandomActivityBreak = async (req: Request, res: Response) => {
  try {
    const { deck } = req.query;
    
    let query = db.select().from(activityBreaks).where(eq(activityBreaks.isActive, true));
    
    // If deck is specified, filter by deck
    if (deck) {
      query = query.where(
        and(
          eq(activityBreaks.deckSpecific, true),
          eq(activityBreaks.deck, String(deck))
        )
      );
    } else {
      // If no deck specified, get non-deck-specific breaks
      query = query.where(eq(activityBreaks.deckSpecific, false));
    }
    
    const breaks = await query;
    
    if (breaks.length === 0) {
      return res.status(404).json({ error: 'No activity breaks found' });
    }
    
    // Get a random activity break
    const randomIndex = Math.floor(Math.random() * breaks.length);
    return res.json(breaks[randomIndex]);
  } catch (error) {
    console.error('Error fetching random activity break:', error);
    return res.status(500).json({ error: 'Failed to fetch random activity break' });
  }
};

// Create a new activity break
export const createActivityBreak = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      activityType,
      difficulty,
      instructions,
      durationSeconds,
      minPlayers,
      maxPlayers,
      deckSpecific,
      deck,
      imageUrl
    } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    // Validate deck if deckSpecific is true
    if (deckSpecific && !deck) {
      return res.status(400).json({ error: 'Deck is required when deckSpecific is true' });
    }
    
    const newActivityBreak = await db.insert(activityBreaks).values({
      title,
      description,
      activityType: activityType || 'physical',
      difficulty: difficulty || '1',
      instructions,
      durationSeconds: durationSeconds || '60',
      minPlayers: minPlayers || '2',
      maxPlayers: maxPlayers || null,
      deckSpecific: deckSpecific || false,
      deck: deckSpecific ? deck : null,
      imageUrl,
      isActive: true
    }).returning();
    
    return res.status(201).json(newActivityBreak[0]);
  } catch (error) {
    console.error('Error creating activity break:', error);
    return res.status(500).json({ error: 'Failed to create activity break' });
  }
};

// Update an activity break
export const updateActivityBreak = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      activityType,
      difficulty,
      instructions,
      durationSeconds,
      minPlayers,
      maxPlayers,
      deckSpecific,
      deck,
      imageUrl,
      isActive
    } = req.body;
    
    // Check if activity break exists
    const existingBreak = await db.select().from(activityBreaks).where(eq(activityBreaks.id, id));
    
    if (existingBreak.length === 0) {
      return res.status(404).json({ error: 'Activity break not found' });
    }
    
    // Update the activity break
    const updatedBreak = await db.update(activityBreaks)
      .set({
        title: title !== undefined ? title : existingBreak[0].title,
        description: description !== undefined ? description : existingBreak[0].description,
        activityType: activityType !== undefined ? activityType : existingBreak[0].activityType,
        difficulty: difficulty !== undefined ? difficulty : existingBreak[0].difficulty,
        instructions: instructions !== undefined ? instructions : existingBreak[0].instructions,
        durationSeconds: durationSeconds !== undefined ? durationSeconds : existingBreak[0].durationSeconds,
        minPlayers: minPlayers !== undefined ? minPlayers : existingBreak[0].minPlayers,
        maxPlayers: maxPlayers !== undefined ? maxPlayers : existingBreak[0].maxPlayers,
        deckSpecific: deckSpecific !== undefined ? deckSpecific : existingBreak[0].deckSpecific,
        deck: deck !== undefined ? deck : existingBreak[0].deck,
        imageUrl: imageUrl !== undefined ? imageUrl : existingBreak[0].imageUrl,
        isActive: isActive !== undefined ? isActive : existingBreak[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(activityBreaks.id, id))
      .returning();
    
    return res.json(updatedBreak[0]);
  } catch (error) {
    console.error('Error updating activity break:', error);
    return res.status(500).json({ error: 'Failed to update activity break' });
  }
};

// Delete an activity break (soft delete by setting isActive to false)
export const deleteActivityBreak = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if activity break exists
    const existingBreak = await db.select().from(activityBreaks).where(eq(activityBreaks.id, id));
    
    if (existingBreak.length === 0) {
      return res.status(404).json({ error: 'Activity break not found' });
    }
    
    // Soft delete by setting isActive to false
    await db.update(activityBreaks)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(activityBreaks.id, id));
    
    return res.json({ message: 'Activity break deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity break:', error);
    return res.status(500).json({ error: 'Failed to delete activity break' });
  }
};
