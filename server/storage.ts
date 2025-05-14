import { 
  users, type User, type InsertUser,
  prompts, type Prompt, type InsertPrompt,
  challenges, type Challenge, type InsertChallenge,
  gameSessions, type GameSession, type InsertGameSession
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt operations
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPromptsByLevelAndIntensity(level: number, intensity: number): Promise<Prompt[]>;
  getRandomPrompt(): Promise<Prompt | undefined>;
  getPromptById(id: number): Promise<Prompt | undefined>;
  getCustomPromptsByUser(userId: number): Promise<Prompt[]>;
  batchImportPrompts(prompts: InsertPrompt[]): Promise<number>; // Returns count of imported prompts
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallengesByIntensity(intensity: number): Promise<Challenge[]>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  getChallengesByType(type: string, intensity: number): Promise<Challenge[]>;
  getCustomChallengesByUser(userId: number): Promise<Challenge[]>;
  batchImportChallenges(challenges: InsertChallenge[]): Promise<number>; // Returns count of imported challenges
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(id: number): Promise<GameSession | undefined>;
  updateGameSession(id: number, data: Partial<GameSession>): Promise<GameSession>;
  // Game statistics operations
  incrementFullHouseMoments(id: number): Promise<GameSession>;
  incrementPromptsAnswered(id: number): Promise<GameSession>;
  updateTotalTimeSpent(id: number, timeSpent: number): Promise<GameSession>;
  updateLevelStats(id: number, level: number, intensity: number): Promise<GameSession>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private prompts: Map<number, Prompt>;
  private challenges: Map<number, Challenge>;
  private gameSessions: Map<number, GameSession>;
  private userIdCounter: number;
  private promptIdCounter: number;
  private challengeIdCounter: number;
  private sessionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.challenges = new Map();
    this.gameSessions = new Map();
    this.userIdCounter = 1;
    this.promptIdCounter = 1;
    this.challengeIdCounter = 1;
    this.sessionIdCounter = 1;
    
    // Initialize with default prompts and challenges
    this.initializeDefaultPrompts();
    this.initializeDefaultChallenges();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Prompt methods
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptIdCounter++;
    const prompt: Prompt = { ...insertPrompt, id };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async getPromptsByLevelAndIntensity(level: number, intensity: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.level === level && prompt.intensity <= intensity
    );
  }

  async getRandomPrompt(): Promise<Prompt | undefined> {
    const allPrompts = Array.from(this.prompts.values());
    if (allPrompts.length === 0) {
      return undefined;
    }
    
    // Get a random prompt from the entire collection
    const randomIndex = Math.floor(Math.random() * allPrompts.length);
    return allPrompts[randomIndex];
  }

  async getPromptById(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async getCustomPromptsByUser(userId: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.isCustom && prompt.userId === userId
    );
  }

  // Challenge methods
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeIdCounter++;
    const challenge: Challenge = { ...insertChallenge, id };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getChallengesByIntensity(intensity: number): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.intensity <= intensity
    );
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getChallengesByType(type: string, intensity: number): Promise<Challenge[]> {
    // For "Dare" type, return all dares regardless of intensity level
    if (type === "Dare") {
      return Array.from(this.challenges.values()).filter(
        (challenge) => challenge.type === type
      );
    }
    
    // For other challenge types, continue to respect intensity level
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.type === type && challenge.intensity <= intensity
    );
  }

  async getCustomChallengesByUser(userId: number): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.isCustom && challenge.userId === userId
    );
  }

  // Game session methods
  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = this.sessionIdCounter++;
    const session: GameSession = { 
      ...insertSession, 
      id, 
      usedPromptIds: [],
      // Initialize the new game statistics fields
      totalTimeSpent: 0,
      promptsAnswered: 0,
      fullHouseMoments: 0,
      levelStats: {} 
    };
    this.gameSessions.set(id, session);
    return session;
  }

  async getGameSession(id: number): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async updateGameSession(id: number, data: Partial<GameSession>): Promise<GameSession> {
    const existingSession = this.gameSessions.get(id);
    if (!existingSession) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const updatedSession = {
      ...existingSession,
      ...data
    };
    
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async incrementFullHouseMoments(id: number): Promise<GameSession> {
    const session = this.gameSessions.get(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const fullHouseMoments = (session.fullHouseMoments || 0) + 1;
    const updatedSession = { ...session, fullHouseMoments };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  async incrementPromptsAnswered(id: number): Promise<GameSession> {
    const session = this.gameSessions.get(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const promptsAnswered = (session.promptsAnswered || 0) + 1;
    const updatedSession = { ...session, promptsAnswered };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  async updateTotalTimeSpent(id: number, timeSpent: number): Promise<GameSession> {
    const session = this.gameSessions.get(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const totalTimeSpent = (session.totalTimeSpent || 0) + timeSpent;
    const updatedSession = { ...session, totalTimeSpent };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  async updateLevelStats(id: number, level: number, intensity: number): Promise<GameSession> {
    const session = this.gameSessions.get(id);
    if (!session) {
      throw new Error(`Game session with id ${id} not found`);
    }
    
    const key = `${level}-${intensity}`;
    const levelStats = session.levelStats as Record<string, number> || {};
    levelStats[key] = (levelStats[key] || 0) + 1;
    
    const updatedSession = { ...session, levelStats };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async batchImportPrompts(promptsToImport: InsertPrompt[]): Promise<number> {
    let count = 0;
    for (const prompt of promptsToImport) {
      await this.createPrompt(prompt);
      count++;
    }
    return count;
  }
  
  async batchImportChallenges(challengesToImport: InsertChallenge[]): Promise<number> {
    let count = 0;
    for (const challenge of challengesToImport) {
      await this.createChallenge(challenge);
      count++;
    }
    return count;
  }

  // Helper methods to initialize default data
  private initializeDefaultPrompts(): void {
    // Level 1: Icebreakers (Mild)
    this.createPrompt({
      text: "If you could have dinner with any historical figure, who would it be and why?",
      level: 1,
      intensity: 1,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's one skill you wish you had learned earlier in life?",
      level: 1,
      intensity: 1,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "If you could travel anywhere in the world right now, where would you go and why?",
      level: 1,
      intensity: 1,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's your favorite way to spend a rainy day?",
      level: 1,
      intensity: 1,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What would your perfect day look like from start to finish?",
      level: 1,
      intensity: 1,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });

    // Level 1: Icebreakers (Medium)
    this.createPrompt({
      text: "What's a popular opinion you strongly disagree with?",
      level: 1,
      intensity: 2,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's the best piece of advice you've ever received?",
      level: 1,
      intensity: 2,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "If you could have any superpower, what would it be and how would you use it?",
      level: 1,
      intensity: 2,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });

    // Level 1: Icebreakers (Wild)
    this.createPrompt({
      text: "What's one thing that's on your bucket list that might surprise people?",
      level: 1,
      intensity: 3,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's the most spontaneous thing you've ever done?",
      level: 1,
      intensity: 3,
      category: "Icebreaker",
      isCustom: false,
      userId: null
    });

    // Level 2: Getting to Know You (Mild)
    this.createPrompt({
      text: "What's something you're proud of that you don't often get to talk about?",
      level: 2,
      intensity: 1,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's a small, everyday thing that brings you joy?",
      level: 2,
      intensity: 1,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What hobby or activity did you love as a child that you no longer do?",
      level: 2,
      intensity: 1,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    
    // Level 2: Getting to Know You (Medium)
    this.createPrompt({
      text: "What's a belief or value you hold that has changed significantly over time?",
      level: 2,
      intensity: 2,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's something you've accomplished that you once thought was impossible?",
      level: 2,
      intensity: 2,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's a fear you've overcome or are working to overcome?",
      level: 2,
      intensity: 2,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    
    // Level 2: Getting to Know You (Wild)
    this.createPrompt({
      text: "What's something that deeply moved you or changed your perspective?",
      level: 2,
      intensity: 3,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's a meaningful connection or relationship that shaped who you are today?",
      level: 2,
      intensity: 3,
      category: "Getting to Know You",
      isCustom: false,
      userId: null
    });
    
    // Level 3: Deeper Dive (Mild)
    this.createPrompt({
      text: "What values or principles do you try to live by?",
      level: 3,
      intensity: 1,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's something you're still figuring out in life?",
      level: 3,
      intensity: 1,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's a life lesson you learned the hard way?",
      level: 3,
      intensity: 1,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    
    // Level 3: Deeper Dive (Medium)
    this.createPrompt({
      text: "What's something you're passionate about that you wish more people understood?",
      level: 3,
      intensity: 2,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "In what ways are you different from the person you were five years ago?",
      level: 3,
      intensity: 2,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's a personal belief or value you hold that might be controversial?",
      level: 3,
      intensity: 2,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    
    // Level 3: Deeper Dive (Wild)
    this.createPrompt({
      text: "What's a moment in your life where you felt truly vulnerable?",
      level: 3,
      intensity: 3,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's something you're still healing from or working through?",
      level: 3,
      intensity: 3,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
    this.createPrompt({
      text: "What's a deeply held fear that influences your decisions?",
      level: 3,
      intensity: 3,
      category: "Deeper Dive",
      isCustom: false,
      userId: null
    });
  }

  private initializeDefaultChallenges(): void {
    // Truth or Dare challenges (Mild)
    this.createChallenge({
      type: "Truth or Dare",
      text: "TRUTH: Share a funny childhood memory OR DARE: Do your best impression of someone in the group",
      intensity: 1,
      isCustom: false,
      userId: null
    });
    this.createChallenge({
      type: "Truth or Dare",
      text: "TRUTH: What's something small that makes you irrationally angry? OR DARE: Speak in an accent for the next round",
      intensity: 1,
      isCustom: false,
      userId: null
    });
    
    // Truth or Dare challenges (Medium)
    this.createChallenge({
      type: "Truth or Dare",
      text: "TRUTH: What's the most embarrassing thing you've done in public? OR DARE: Let someone post anything they want to your social media",
      intensity: 2,
      isCustom: false,
      userId: null
    });
    this.createChallenge({
      type: "Truth or Dare",
      text: "TRUTH: What's a white lie you've told recently? OR DARE: Call a friend and tell them something you appreciate about them",
      intensity: 2,
      isCustom: false,
      userId: null
    });
    
    // Truth or Dare challenges (Wild)
    this.createChallenge({
      type: "Truth or Dare",
      text: "TRUTH: What's something you've never told anyone in this room? OR DARE: Let the group look through your phone for 1 minute",
      intensity: 3,
      isCustom: false,
      userId: null
    });
    this.createChallenge({
      type: "Truth or Dare",
      text: "TRUTH: What's your biggest regret? OR DARE: Text your crush or ex something the group decides",
      intensity: 3,
      isCustom: false,
      userId: null
    });
    
    // Act It Out challenges (Mild)
    this.createChallenge({
      type: "Act It Out",
      text: "Act out your favorite movie scene and have others guess what it is",
      intensity: 1,
      isCustom: false,
      userId: null
    });
    this.createChallenge({
      type: "Act It Out",
      text: "Mime an everyday activity and have others guess what you're doing",
      intensity: 1,
      isCustom: false,
      userId: null
    });
    
    // Act It Out challenges (Medium)
    this.createChallenge({
      type: "Act It Out",
      text: "Do your best dance move without music",
      intensity: 2,
      isCustom: false,
      userId: null
    });
    this.createChallenge({
      type: "Act It Out",
      text: "Act out a commercial for a ridiculous product the group invents",
      intensity: 2,
      isCustom: false,
      userId: null
    });
    
    // Act It Out challenges (Wild)
    this.createChallenge({
      type: "Act It Out",
      text: "Act out your most embarrassing moment without speaking",
      intensity: 3,
      isCustom: false,
      userId: null
    });
    this.createChallenge({
      type: "Act It Out",
      text: "Pretend you're giving a passionate TED Talk on a topic the group chooses",
      intensity: 3,
      isCustom: false,
      userId: null
    });
  }
}

import { DatabaseStorage } from "./storage.database";

// Choose which storage implementation to use
// For development or testing, you can switch between MemStorage and DatabaseStorage
export const storage = new DatabaseStorage();
