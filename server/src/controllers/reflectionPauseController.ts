import { Request, Response } from 'express';
import { db } from '../db';
import { reflectionPauses } from '../db/schema/reflectionPauses';
import { eq, and } from 'drizzle-orm';

// Get all reflection pauses
export const getAllReflectionPauses = async (req: Request, res: Response) => {
  try {
    const allPauses = await db.select().from(reflectionPauses);
    return res.json(allPauses);
  } catch (error) {
    console.error('Error fetching reflection pauses:', error);
    return res.status(500).json({ error: 'Failed to fetch reflection pauses' });
  }
};

// Get reflection pause by ID
export const getReflectionPauseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pause = await db.select().from(reflectionPauses).where(eq(reflectionPauses.id, id));
    
    if (pause.length === 0) {
      return res.status(404).json({ error: 'Reflection pause not found' });
    }
    
    return res.json(pause[0]);
  } catch (error) {
    console.error('Error fetching reflection pause:', error);
    return res.status(500).json({ error: 'Failed to fetch reflection pause' });
  }
};

// Get random reflection pause
export const getRandomReflectionPause = async (req: Request, res: Response) => {
  try {
    const { deck, theme } = req.query;
    
    let query = db.select().from(reflectionPauses).where(eq(reflectionPauses.isActive, true));
    
    // If deck is specified, filter by deck
    if (deck) {
      query = query.where(
        and(
          eq(reflectionPauses.deckSpecific, true),
          eq(reflectionPauses.deck, String(deck))
        )
      );
    } else {
      // If no deck specified, get non-deck-specific pauses
      query = query.where(eq(reflectionPauses.deckSpecific, false));
    }
    
    // If theme is specified, filter by theme
    if (theme) {
      query = query.where(eq(reflectionPauses.theme, String(theme)));
    }
    
    const pauses = await query;
    
    if (pauses.length === 0) {
      return res.status(404).json({ error: 'No reflection pauses found' });
    }
    
    // Get a random reflection pause
    const randomIndex = Math.floor(Math.random() * pauses.length);
    return res.json(pauses[randomIndex]);
  } catch (error) {
    console.error('Error fetching random reflection pause:', error);
    return res.status(500).json({ error: 'Failed to fetch random reflection pause' });
  }
};

// Create a new reflection pause
export const createReflectionPause = async (req: Request, res: Response) => {
  try {
    const {
      question,
      description,
      theme,
      followUpQuestions,
      durationSeconds,
      deckSpecific,
      deck,
      imageUrl
    } = req.body;
    
    // Validate required fields
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Validate deck if deckSpecific is true
    if (deckSpecific && !deck) {
      return res.status(400).json({ error: 'Deck is required when deckSpecific is true' });
    }
    
    const newReflectionPause = await db.insert(reflectionPauses).values({
      question,
      description,
      theme,
      followUpQuestions: followUpQuestions || [],
      durationSeconds: durationSeconds || '120',
      deckSpecific: deckSpecific || false,
      deck: deckSpecific ? deck : null,
      imageUrl,
      isActive: true
    }).returning();
    
    return res.status(201).json(newReflectionPause[0]);
  } catch (error) {
    console.error('Error creating reflection pause:', error);
    return res.status(500).json({ error: 'Failed to create reflection pause' });
  }
};

// Update a reflection pause
export const updateReflectionPause = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      question,
      description,
      theme,
      followUpQuestions,
      durationSeconds,
      deckSpecific,
      deck,
      imageUrl,
      isActive
    } = req.body;
    
    // Check if reflection pause exists
    const existingPause = await db.select().from(reflectionPauses).where(eq(reflectionPauses.id, id));
    
    if (existingPause.length === 0) {
      return res.status(404).json({ error: 'Reflection pause not found' });
    }
    
    // Update the reflection pause
    const updatedPause = await db.update(reflectionPauses)
      .set({
        question: question !== undefined ? question : existingPause[0].question,
        description: description !== undefined ? description : existingPause[0].description,
        theme: theme !== undefined ? theme : existingPause[0].theme,
        followUpQuestions: followUpQuestions !== undefined ? followUpQuestions : existingPause[0].followUpQuestions,
        durationSeconds: durationSeconds !== undefined ? durationSeconds : existingPause[0].durationSeconds,
        deckSpecific: deckSpecific !== undefined ? deckSpecific : existingPause[0].deckSpecific,
        deck: deck !== undefined ? deck : existingPause[0].deck,
        imageUrl: imageUrl !== undefined ? imageUrl : existingPause[0].imageUrl,
        isActive: isActive !== undefined ? isActive : existingPause[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(reflectionPauses.id, id))
      .returning();
    
    return res.json(updatedPause[0]);
  } catch (error) {
    console.error('Error updating reflection pause:', error);
    return res.status(500).json({ error: 'Failed to update reflection pause' });
  }
};

// Delete a reflection pause (soft delete by setting isActive to false)
export const deleteReflectionPause = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if reflection pause exists
    const existingPause = await db.select().from(reflectionPauses).where(eq(reflectionPauses.id, id));
    
    if (existingPause.length === 0) {
      return res.status(404).json({ error: 'Reflection pause not found' });
    }
    
    // Soft delete by setting isActive to false
    await db.update(reflectionPauses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(reflectionPauses.id, id));
    
    return res.json({ message: 'Reflection pause deleted successfully' });
  } catch (error) {
    console.error('Error deleting reflection pause:', error);
    return res.status(500).json({ error: 'Failed to delete reflection pause' });
  }
};
