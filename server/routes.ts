import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPromptSchema, 
  insertChallengeSchema, 
  insertGameSessionSchema 
} from "@shared/schema";
import { importRouter } from "./routes/import";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import { downloadRouter } from "./routes/downloads";
import { sessionMiddleware, isAuthenticated } from "./session";
import path from "path";
import express from "express";


export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(sessionMiddleware);
  
  // Set up static file serving for downloads with proper MIME types
  app.use('/download', downloadRouter);
  
  // Auth routes (not protected)
  app.use("/api/auth", authRouter);
  
  // Admin routes (protected with admin key)
  app.use("/api/admin", adminRouter);
  
  // Import routes
  app.use("/api", importRouter);
  
  // Prompt routes (protected)
  app.get("/api/prompts", isAuthenticated, async (req, res) => {
    try {
      // If all=true, return all prompts (used for stats calculation)
      if (req.query.all === 'true') {
        const allPrompts = await storage.getAllPrompts();
        return res.json(allPrompts);
      }
      
      const level = parseInt(req.query.level as string) || 1;
      const intensity = parseInt(req.query.intensity as string) || 1;
      const excludeIds = req.query.excludeIds ? 
        (Array.isArray(req.query.excludeIds) 
          ? req.query.excludeIds.map(id => parseInt(id as string))
          : [parseInt(req.query.excludeIds as string)]) 
        : [];
      
      const prompts = await storage.getPromptsByLevelAndIntensity(level, intensity);
      
      // Filter out excluded prompts if any were provided
      const filteredPrompts = excludeIds.length > 0
        ? prompts.filter(prompt => !excludeIds.includes(prompt.id))
        : prompts;
        
      res.json(filteredPrompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });
  
  app.get("/api/prompts/random", isAuthenticated, async (req, res) => {
    try {
      // Get a completely random prompt with no exclusions
      const randomPrompt = await storage.getRandomPrompt([]);
      
      if (!randomPrompt) {
        return res.status(404).json({ message: "No prompts available" });
      }
      
      res.json(randomPrompt);
    } catch (error) {
      console.error("Error fetching random prompt:", error);
      res.status(500).json({ message: "Failed to fetch random prompt" });
    }
  });
  
  app.post("/api/prompts", async (req, res) => {
    try {
      const validatedData = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(validatedData);
      res.status(201).json(prompt);
    } catch (error) {
      res.status(400).json({ message: "Invalid prompt data" });
    }
  });
  
  app.get("/api/prompts/custom", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const customPrompts = await storage.getCustomPromptsByUser(userId);
      res.json(customPrompts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom prompts" });
    }
  });
  
  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const intensity = parseInt(req.query.intensity as string) || 1;
      const type = req.query.type as string;
      
      if (type) {
        const challenges = await storage.getChallengesByType(type, intensity);
        res.json(challenges);
      } else {
        const challenges = await storage.getChallengesByIntensity(intensity);
        res.json(challenges);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });
  
  app.post("/api/challenges", async (req, res) => {
    try {
      const validatedData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(validatedData);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(400).json({ message: "Invalid challenge data" });
    }
  });
  
  app.get("/api/challenges/custom", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const customChallenges = await storage.getCustomChallengesByUser(userId);
      res.json(customChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom challenges" });
    }
  });
  
  // Game session routes
  app.post("/api/sessions", async (req, res) => {
    try {
      // The createdAt field is now sent from the client
      const validatedData = insertGameSessionSchema.parse(req.body);
      
      // Add access code tracking from the session if available
      if (req.session.accessCode) {
        validatedData.accessCode = req.session.accessCode;
      }
      
      const session = await storage.createGameSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: "Invalid session data" });
    }
  });
  
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getGameSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });
  
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getGameSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const updatedSession = await storage.updateGameSession(id, req.body);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });
  
  // Game statistics routes
  app.post("/api/sessions/:id/full-house", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getGameSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const updatedSession = await storage.incrementFullHouseMoments(id);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update full-house moments" });
    }
  });
  
  app.post("/api/sessions/:id/prompt-answered", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getGameSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const updatedSession = await storage.incrementPromptsAnswered(id);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update prompts answered" });
    }
  });
  
  app.post("/api/sessions/:id/time-spent", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { timeSpent } = req.body;
      
      if (typeof timeSpent !== 'number' || isNaN(timeSpent)) {
        return res.status(400).json({ message: "Time spent must be a number" });
      }
      
      const session = await storage.getGameSession(id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const updatedSession = await storage.updateTotalTimeSpent(id, timeSpent);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update time spent" });
    }
  });
  
  app.post("/api/sessions/:id/level-stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { level, intensity } = req.body;
      
      if (!level || !intensity) {
        return res.status(400).json({ message: "Level and intensity are required" });
      }
      
      const session = await storage.getGameSession(id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const updatedSession = await storage.updateLevelStats(id, level, intensity);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update level statistics" });
    }
  });

  // Health check endpoint for deployment
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  const httpServer = createServer(app);
  return httpServer;
}
