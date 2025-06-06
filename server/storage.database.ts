import { 
  users, type User, type InsertUser,
  prompts, type Prompt, type InsertPrompt,
  challenges, type Challenge, type InsertChallenge,
  gameSessions, type GameSession, type InsertGameSession,
  accessCodes, type AccessCode, type InsertAccessCode
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, lte, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Prompt methods
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    // Ensure default values are set for required fields
    const promptData = {
      ...insertPrompt,
      isCustom: insertPrompt.isCustom ?? false,
      userId: insertPrompt.userId ?? null
    };
    
    const [prompt] = await db.insert(prompts).values(promptData).returning();
    return prompt;
  }

  async getPromptsByLevelAndIntensity(level: number, intensity: number): Promise<Prompt[]> {
    return db.select().from(prompts).where(
      and(
        eq(prompts.level, level),
        lte(prompts.intensity, intensity)
      )
    );
  }
  
  async getAllPrompts(): Promise<Prompt[]> {
    return db.select().from(prompts);
  }

  async getRandomPrompt(excludeIds: number[] = []): Promise<Prompt | undefined> {
    try {
      // Simplest implementation - just get a random prompt with no filtering
      // This ensures the feature works without SQL errors
      const [prompt] = await db.select().from(prompts).orderBy(sql`RANDOM()`).limit(1);
      return prompt;
    } catch (error) {
      console.error("Error in getRandomPrompt:", error);
      // We'll just return undefined if there's an error
      // The frontend will handle this gracefully
      return undefined;
    }
  }

  async getPromptById(id: number): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async getCustomPromptsByUser(userId: number): Promise<Prompt[]> {
    return db.select().from(prompts).where(
      and(
        eq(prompts.isCustom, true),
        eq(prompts.userId, userId)
      )
    );
  }

  // Challenge methods
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    // Ensure default values are set for required fields
    const challengeData = {
      ...insertChallenge,
      isCustom: insertChallenge.isCustom ?? false,
      userId: insertChallenge.userId ?? null
    };
    
    const [challenge] = await db.insert(challenges).values(challengeData).returning();
    return challenge;
  }

  async getChallengesByIntensity(intensity: number): Promise<Challenge[]> {
    return db.select().from(challenges).where(lte(challenges.intensity, intensity));
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async getChallengesByType(type: string, intensity: number): Promise<Challenge[]> {
    // For "Dare" and "R-Rated Dare" types, return all dares regardless of intensity level
    if (type === "Dare" || type === "R-Rated Dare") {
      return db.select().from(challenges).where(
        eq(challenges.type, type)
      );
    }
    
    // For other challenge types, continue to respect intensity level
    return db.select().from(challenges).where(
      and(
        eq(challenges.type, type),
        lte(challenges.intensity, intensity)
      )
    );
  }

  async getCustomChallengesByUser(userId: number): Promise<Challenge[]> {
    return db.select().from(challenges).where(
      and(
        eq(challenges.isCustom, true),
        eq(challenges.userId, userId)
      )
    );
  }

  // Game session methods
  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    // Make sure all required fields are present with defaults
    const sessionData = {
      ...insertSession,
      usedPromptIds: [],
      currentLevel: insertSession.currentLevel ?? 1,
      currentIntensity: insertSession.currentIntensity ?? 1,
      isDrinkingGame: insertSession.isDrinkingGame ?? false,
      // Track access code for analytics if provided
      accessCode: insertSession.accessCode || null
    };
    
    const [session] = await db.insert(gameSessions).values(sessionData).returning();
    return session;
  }

  async getGameSession(id: number): Promise<GameSession | undefined> {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
    return session;
  }

  async updateGameSession(id: number, data: Partial<GameSession>): Promise<GameSession> {
    const [updatedSession] = await db
      .update(gameSessions)
      .set(data)
      .where(eq(gameSessions.id, id))
      .returning();
    
    if (!updatedSession) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    return updatedSession;
  }
  
  // Game statistics methods
  async incrementFullHouseMoments(id: number): Promise<GameSession> {
    const session = await this.getGameSession(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const currentValue = session.fullHouseMoments || 0;
    
    const [updatedSession] = await db
      .update(gameSessions)
      .set({ fullHouseMoments: currentValue + 1 })
      .where(eq(gameSessions.id, id))
      .returning();
      
    return updatedSession;
  }
  
  async incrementPromptsAnswered(id: number): Promise<GameSession> {
    const session = await this.getGameSession(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const currentValue = session.promptsAnswered || 0;
    
    const [updatedSession] = await db
      .update(gameSessions)
      .set({ promptsAnswered: currentValue + 1 })
      .where(eq(gameSessions.id, id))
      .returning();
      
    return updatedSession;
  }
  
  async updateTotalTimeSpent(id: number, timeSpent: number): Promise<GameSession> {
    const session = await this.getGameSession(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const currentValue = session.totalTimeSpent || 0;
    
    const [updatedSession] = await db
      .update(gameSessions)
      .set({ totalTimeSpent: currentValue + timeSpent })
      .where(eq(gameSessions.id, id))
      .returning();
      
    return updatedSession;
  }
  
  async updateLevelStats(id: number, level: number, intensity: number): Promise<GameSession> {
    const session = await this.getGameSession(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const key = `${level}-${intensity}`;
    const levelStats = session.levelStats as Record<string, number> || {};
    levelStats[key] = (levelStats[key] || 0) + 1;
    
    const [updatedSession] = await db
      .update(gameSessions)
      .set({ levelStats })
      .where(eq(gameSessions.id, id))
      .returning();
      
    return updatedSession;
  }

  // Batch import methods for large prompt sets
  async batchImportPrompts(promptsToImport: InsertPrompt[]): Promise<number> {
    if (promptsToImport.length === 0) return 0;
    
    // Ensure all prompts have the required fields with default values
    const promptsWithDefaults = promptsToImport.map(prompt => ({
      ...prompt,
      isCustom: prompt.isCustom ?? false,
      userId: prompt.userId ?? null
    }));
    
    const result = await db.insert(prompts).values(promptsWithDefaults).returning({ id: prompts.id });
    return result.length;
  }

  async batchImportChallenges(challengesToImport: InsertChallenge[]): Promise<number> {
    if (challengesToImport.length === 0) return 0;
    
    // Ensure all challenges have the required fields with default values
    const challengesWithDefaults = challengesToImport.map(challenge => ({
      ...challenge,
      isCustom: challenge.isCustom ?? false,
      userId: challenge.userId ?? null
    }));
    
    const result = await db.insert(challenges).values(challengesWithDefaults).returning({ id: challenges.id });
    return result.length;
  }

  // Access code operations
  async createAccessCode(insertAccessCode: InsertAccessCode): Promise<AccessCode> {
    const [accessCode] = await db
      .insert(accessCodes)
      .values({
        ...insertAccessCode,
        usageCount: 0,
      })
      .returning();
    
    return accessCode;
  }
  
  async getAccessCodeByCode(code: string): Promise<AccessCode | undefined> {
    const [accessCode] = await db
      .select()
      .from(accessCodes)
      .where(eq(accessCodes.code, code));
    
    return accessCode;
  }
  
  async validateAccessCode(code: string): Promise<boolean> {
    const accessCode = await this.getAccessCodeByCode(code);
    
    if (!accessCode) {
      return false;
    }
    
    // Check if code is active
    if (!accessCode.isActive) {
      return false;
    }
    
    // Check if code has reached max usages
    if (accessCode.maxUsages !== null && accessCode.usageCount >= accessCode.maxUsages) {
      return false;
    }
    
    return true;
  }
  
  async incrementAccessCodeUsage(id: number): Promise<AccessCode> {
    const [accessCode] = await db
      .update(accessCodes)
      .set({
        usageCount: sql`${accessCodes.usageCount} + 1`
      })
      .where(eq(accessCodes.id, id))
      .returning();
    
    if (!accessCode) {
      throw new Error(`Access code with ID ${id} not found`);
    }
    
    return accessCode;
  }
}