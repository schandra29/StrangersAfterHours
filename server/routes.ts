import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPromptSchema, 
  insertChallengeSchema, 
  insertGameSessionSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Prompt routes
  app.get("/api/prompts", async (req, res) => {
    try {
      const level = parseInt(req.query.level as string) || 1;
      const intensity = parseInt(req.query.intensity as string) || 1;
      
      const prompts = await storage.getPromptsByLevelAndIntensity(level, intensity);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prompts" });
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
      const data = {
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      
      const validatedData = insertGameSessionSchema.parse(data);
      const session = await storage.createGameSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
