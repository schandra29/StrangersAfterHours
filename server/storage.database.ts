import { 
  users, type User, type InsertUser,
  prompts, type Prompt, type InsertPrompt,
  challenges, type Challenge, type InsertChallenge,
  gameSessions, type GameSession, type InsertGameSession
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, lte } from "drizzle-orm";

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
    const [prompt] = await db.insert(prompts).values(insertPrompt).returning();
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
    const [challenge] = await db.insert(challenges).values(insertChallenge).returning();
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
    const [session] = await db.insert(gameSessions).values({
      ...insertSession,
      usedPromptIds: []
    }).returning();
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

  // Batch import methods for large prompt sets
  async batchImportPrompts(promptsToImport: InsertPrompt[]): Promise<number> {
    if (promptsToImport.length === 0) return 0;
    
    const result = await db.insert(prompts).values(promptsToImport).returning({ id: prompts.id });
    return result.length;
  }

  async batchImportChallenges(challengesToImport: InsertChallenge[]): Promise<number> {
    if (challengesToImport.length === 0) return 0;
    
    const result = await db.insert(challenges).values(challengesToImport).returning({ id: challenges.id });
    return result.length;
  }
}