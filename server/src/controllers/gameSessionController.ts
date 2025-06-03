import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { gameSessions, gamePlayers, sessionActivityBreaks, sessionReflectionPauses } from '../db/schema/gameSessions.js';
import { prompts } from '../db/schema/prompts.js';
import { activityBreaks } from '../db/schema/activityBreaks.js';
import { reflectionPauses } from '../db/schema/reflectionPauses.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Generate a random 6-character code for game sessions
const generateGameCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Create a new game session
export const createGameSession = async (req: Request, res: Response) => {
  try {
    const { hostId, currentDeck = '1', currentLevel = '1' } = req.body;
    
    // Validate required fields
    if (!hostId) {
      return res.status(400).json({ error: 'Host ID is required' });
    }
    
    // Generate a unique game code
    let code = generateGameCode();
    let codeExists = true;
    
    // Make sure the code is unique
    while (codeExists) {
      const existingCode = await db.select()
        .from(gameSessions)
        .where(eq(gameSessions.code, code));
      
      if (existingCode.length === 0) {
        codeExists = false;
      } else {
        code = generateGameCode();
      }
    }
    
    // Create the game session
    const newSession = await db.insert(gameSessions).values({
      id: uuidv4(),
      code,
      hostId,
      currentDeck,
      currentLevel,
      promptCount: '0',
      promptsShown: '0',
      isActive: true,
      nextActivityBreakAfter: '4', // Activity break after every 4 prompts
      nextReflectionAfter: '10', // Reflection pause after every 10 prompts
      soloPromptCount: '0',
      groupPromptCount: '0'
    }).returning();
    
    // Add the host as a player
    await db.insert(gamePlayers).values({
      gameId: newSession[0].id,
      userId: hostId,
      score: '0'
    });
    
    return res.status(201).json(newSession[0]);
  } catch (error) {
    console.error('Error creating game session:', error);
    return res.status(500).json({ error: 'Failed to create game session' });
  }
};

// Get game session by ID
export const getGameSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
    
    if (session.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    return res.json(session[0]);
  } catch (error) {
    console.error('Error fetching game session:', error);
    return res.status(500).json({ error: 'Failed to fetch game session' });
  }
};

// Get game session by code
export const getGameSessionByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const session = await db.select().from(gameSessions).where(eq(gameSessions.code, code));
    
    if (session.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    return res.json(session[0]);
  } catch (error) {
    console.error('Error fetching game session by code:', error);
    return res.status(500).json({ error: 'Failed to fetch game session' });
  }
};

// Join a game session
export const joinGameSession = async (req: Request, res: Response) => {
  try {
    const { gameId, userId } = req.body;
    
    // Validate required fields
    if (!gameId || !userId) {
      return res.status(400).json({ error: 'Game ID and User ID are required' });
    }
    
    // Check if game exists and is active
    const game = await db.select().from(gameSessions).where(
      and(
        eq(gameSessions.id, gameId),
        eq(gameSessions.isActive, true)
      )
    );
    
    if (game.length === 0) {
      return res.status(404).json({ error: 'Game session not found or not active' });
    }
    
    // Check if user is already in the game
    const existingPlayer = await db.select()
      .from(gamePlayers)
      .where(
        and(
          eq(gamePlayers.gameId, gameId),
          eq(gamePlayers.userId, userId)
        )
      );
    
    if (existingPlayer.length > 0) {
      // Update last active time
      await db.update(gamePlayers)
        .set({ lastActive: new Date() })
        .where(
          and(
            eq(gamePlayers.gameId, gameId),
            eq(gamePlayers.userId, userId)
          )
        );
      
      return res.json({ message: 'Already joined this game session' });
    }
    
    // Add player to game
    await db.insert(gamePlayers).values({
      gameId,
      userId,
      score: '0'
    });
    
    return res.json({ message: 'Successfully joined game session' });
  } catch (error) {
    console.error('Error joining game session:', error);
    return res.status(500).json({ error: 'Failed to join game session' });
  }
};

// Get players in a game session
export const getGamePlayers = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    
    const players = await db.select({
      userId: gamePlayers.userId,
      score: gamePlayers.score,
      joinedAt: gamePlayers.joinedAt,
      lastActive: gamePlayers.lastActive
    })
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, gameId))
    .orderBy(desc(gamePlayers.score));
    
    return res.json(players);
  } catch (error) {
    console.error('Error fetching game players:', error);
    return res.status(500).json({ error: 'Failed to fetch game players' });
  }
};

// Get next prompt for a game session
export const getNextPrompt = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { alternatePromptTypes = 'true' } = req.query;
    
    // Check if game exists and is active
    const game = await db.select().from(gameSessions).where(
      and(
        eq(gameSessions.id, gameId),
        eq(gameSessions.isActive, true)
      )
    );
    
    if (game.length === 0) {
      return res.status(404).json({ error: 'Game session not found or not active' });
    }
    
    const gameSession = game[0];
    const promptsShown = parseInt(gameSession.promptsShown);
    const nextActivityBreak = parseInt(gameSession.nextActivityBreakAfter);
    const nextReflection = parseInt(gameSession.nextReflectionAfter);
    
    // Check if it's time for an activity break
    if (promptsShown > 0 && promptsShown % nextActivityBreak === 0) {
      // Get a random activity break that hasn't been shown yet
      const shownBreaks = await db.select({
        activityBreakId: sessionActivityBreaks.activityBreakId
      })
      .from(sessionActivityBreaks)
      .where(eq(sessionActivityBreaks.sessionId, gameId));
      
      const shownBreakIds = shownBreaks.map((b: { activityBreakId: string }) => b.activityBreakId);
      
      // Create base query
      const baseQuery = db.select().from(activityBreaks);
      
      // Apply filters
      const filters = [eq(activityBreaks.isActive, true)];
      
      // If there are shown breaks, exclude them
      if (shownBreakIds.length > 0) {
        filters.push(sql`${activityBreaks.id} NOT IN (${shownBreakIds.join(', ')})`);  
      }
      
      // Filter by deck if needed
      if (gameSession.currentDeck) {
        filters.push(
          sql`(${activityBreaks.deckSpecific} = false OR (${activityBreaks.deckSpecific} = true AND ${activityBreaks.deck} = ${gameSession.currentDeck}))`
        );
      }
      
      // Execute query with all filters
      const availableBreaks = await baseQuery.where(and(...filters)).limit(1);
      
      if (availableBreaks.length > 0) {
        const activityBreak = availableBreaks[0];
        
        // Record that this break was shown
        await db.insert(sessionActivityBreaks).values({
          sessionId: gameId,
          activityBreakId: activityBreak.id,
          shownAt: new Date(),
          completed: false
        });
        
        // Update game session
        await db.update(gameSessions)
          .set({
            lastActivityBreakAt: new Date(),
            activityBreaksShown: String(parseInt(gameSession.activityBreaksShown) + 1),
            updatedAt: new Date()
          })
          .where(eq(gameSessions.id, gameId));
        
        return res.json({
          type: 'activity-break',
          content: activityBreak
        });
      }
    }
    
    // Check if it's time for a reflection pause
    if (promptsShown > 0 && promptsShown % nextReflection === 0) {
      // Get a random reflection pause that hasn't been shown yet
      const shownPauses = await db.select({
        reflectionPauseId: sessionReflectionPauses.reflectionPauseId
      })
      .from(sessionReflectionPauses)
      .where(eq(sessionReflectionPauses.sessionId, gameId));
      
      const shownPauseIds = shownPauses.map((p: { reflectionPauseId: string }) => p.reflectionPauseId);
      
      // Create base query
      const baseQuery = db.select().from(reflectionPauses);
      
      // Apply filters
      const filters = [eq(reflectionPauses.isActive, true)];
      
      // If there are shown pauses, exclude them
      if (shownPauseIds.length > 0) {
        filters.push(sql`${reflectionPauses.id} NOT IN (${shownPauseIds.join(', ')})`);  
      }
      
      // Filter by deck if needed
      if (gameSession.currentDeck) {
        filters.push(
          sql`(${reflectionPauses.deckSpecific} = false OR (${reflectionPauses.deckSpecific} = true AND ${reflectionPauses.deck} = ${gameSession.currentDeck}))`
        );
      }
      
      // Execute query with all filters
      const availablePauses = await baseQuery.where(and(...filters)).limit(1);
      
      if (availablePauses.length > 0) {
        const reflectionPause = availablePauses[0];
        
        // Record that this pause was shown
        await db.insert(sessionReflectionPauses).values({
          sessionId: gameId,
          reflectionPauseId: reflectionPause.id,
          shownAt: new Date(),
          completed: false
        });
        
        // Update game session
        await db.update(gameSessions)
          .set({
            lastReflectionAt: new Date(),
            reflectionPausesShown: String(parseInt(gameSession.reflectionPausesShown) + 1),
            updatedAt: new Date()
          })
          .where(eq(gameSessions.id, gameId));
        
        return res.json({
          type: 'reflection-pause',
          content: reflectionPause
        });
      }
    }
    
    // Determine if we should get a solo or group prompt to alternate between them
    let nextPromptIsGroup = false;
    
    if (alternatePromptTypes === 'true') {
      if (gameSession.lastPromptType === 'solo' || gameSession.lastPromptType === null) {
        nextPromptIsGroup = true;
      }
    } else {
      // If not alternating, use a random type
      nextPromptIsGroup = Math.random() < 0.5;
    }
    
    // Get prompts already shown in this session
    const shownPrompts = await db.select({
      promptId: sql`DISTINCT prompt_id`
    })
    .from(sql`player_responses`)
    .where(sql`game_id = ${gameId}`);
    
    // Safely type the map function for TypeScript
    const shownPromptIds = shownPrompts.map((p: any) => p.promptId as string);
    
    // Get a random prompt based on the session state and prompt type
    // Create base query
    const baseQuery = db.select().from(prompts);
    
    // Apply filters
    const filters = [
      eq(prompts.isActive, true),
      eq(prompts.level, gameSession.currentLevel),
      eq(prompts.deck, gameSession.currentDeck),
      eq(prompts.isGroup, nextPromptIsGroup)
    ];
    
    // Exclude already shown prompts
    if (shownPromptIds.length > 0) {
      filters.push(sql`${prompts.id} NOT IN (${shownPromptIds.join(', ')})`);
    }
    
    // Execute query with all filters
    const availablePrompts = await baseQuery.where(and(...filters)).orderBy(sql`RANDOM()`).limit(10);
    
    if (availablePrompts.length === 0) {
      // If no prompt found with the specific type, try again without the group/solo restriction
      const fallbackFilters = [
        eq(prompts.isActive, true),
        eq(prompts.level, gameSession.currentLevel),
        eq(prompts.deck, gameSession.currentDeck)
      ];
      
      if (shownPromptIds.length > 0) {
        fallbackFilters.push(sql`${prompts.id} NOT IN (${shownPromptIds.join(', ')})`);  
      }
      
      const anyPrompts = await db.select().from(prompts)
        .where(and(...fallbackFilters))
        .orderBy(sql`RANDOM()`)
        .limit(1);
    
      if (anyPrompts.length === 0) {
        return res.status(404).json({ error: 'No more prompts available' });
      }
      
      const prompt = anyPrompts[0];
      const isGroup = prompt.isGroup;
      
      // Update game session
      await db.update(gameSessions)
        .set({
          currentPromptId: prompt.id,
          promptsShown: String(promptsShown + 1),
          lastPromptType: isGroup ? 'group' : 'solo',
          soloPromptCount: isGroup ? gameSession.soloPromptCount : String(parseInt(gameSession.soloPromptCount) + 1),
          groupPromptCount: isGroup ? String(parseInt(gameSession.groupPromptCount) + 1) : gameSession.groupPromptCount,
          updatedAt: new Date()
        })
        .where(eq(gameSessions.id, gameId));
        
      return res.json({
        type: 'prompt',
        content: prompt
      });
    }
    
    // If we have prompts with the preferred type
    const prompt = availablePrompts[0];
    const isGroup = prompt.isGroup;
    
    // Update game session
    await db.update(gameSessions)
      .set({
        currentPromptId: prompt.id,
        promptsShown: String(promptsShown + 1),
        lastPromptType: isGroup ? 'group' : 'solo',
        soloPromptCount: isGroup ? gameSession.soloPromptCount : String(parseInt(gameSession.soloPromptCount) + 1),
        groupPromptCount: isGroup ? String(parseInt(gameSession.groupPromptCount) + 1) : gameSession.groupPromptCount,
        updatedAt: new Date()
      })
      .where(eq(gameSessions.id, gameId));
    
    return res.json({
      type: 'prompt',
      content: prompt
    });
  } catch (error) {
    console.error('Error getting next prompt:', error);
    return res.status(500).json({ error: 'Failed to get next prompt' });
  }
};

// Mark activity break as completed
export const completeActivityBreak = async (req: Request, res: Response) => {
  try {
    const { sessionId, activityBreakId } = req.params;
    
    // Check if the activity break is in the session
    const sessionBreak = await db.select()
      .from(sessionActivityBreaks)
      .where(
        and(
          eq(sessionActivityBreaks.sessionId, sessionId),
          eq(sessionActivityBreaks.activityBreakId, activityBreakId)
        )
      );
    
    if (sessionBreak.length === 0) {
      return res.status(404).json({ error: 'Activity break not found in this session' });
    }
    
    // Mark as completed
    await db.update(sessionActivityBreaks)
      .set({
        completed: true,
        completedAt: new Date()
      })
      .where(
        and(
          eq(sessionActivityBreaks.sessionId, sessionId),
          eq(sessionActivityBreaks.activityBreakId, activityBreakId)
        )
      );
    
    return res.json({ message: 'Activity break marked as completed' });
  } catch (error) {
    console.error('Error completing activity break:', error);
    return res.status(500).json({ error: 'Failed to complete activity break' });
  }
};

// Mark reflection pause as completed
export const completeReflectionPause = async (req: Request, res: Response) => {
  try {
    const { sessionId, reflectionPauseId } = req.params;
    
    // Check if the reflection pause is in the session
    const sessionPause = await db.select()
      .from(sessionReflectionPauses)
      .where(
        and(
          eq(sessionReflectionPauses.sessionId, sessionId),
          eq(sessionReflectionPauses.reflectionPauseId, reflectionPauseId)
        )
      );
    
    if (sessionPause.length === 0) {
      return res.status(404).json({ error: 'Reflection pause not found in this session' });
    }
    
    // Mark as completed
    await db.update(sessionReflectionPauses)
      .set({
        completed: true,
        completedAt: new Date()
      })
      .where(
        and(
          eq(sessionReflectionPauses.sessionId, sessionId),
          eq(sessionReflectionPauses.reflectionPauseId, reflectionPauseId)
        )
      );
    
    return res.json({ message: 'Reflection pause marked as completed' });
  } catch (error) {
    console.error('Error completing reflection pause:', error);
    return res.status(500).json({ error: 'Failed to complete reflection pause' });
  }
};

// End a game session
export const endGameSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if game exists
    const game = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
    
    if (game.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    // End the game session
    await db.update(gameSessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(gameSessions.id, id));
    
    return res.json({ message: 'Game session ended successfully' });
  } catch (error) {
    console.error('Error ending game session:', error);
    return res.status(500).json({ error: 'Failed to end game session' });
  }
};
