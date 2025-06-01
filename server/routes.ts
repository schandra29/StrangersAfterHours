import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { registerVite } from "./vite";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import { fileServeRouter } from "./routes/fileServe";
import { importRouter } from "./routes/import";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/', (_req, res) => {
    res.status(200).send('OK');
  });

  // API routes (keeping for compatibility but removing authentication)
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/files", fileServeRouter);
  app.use("/api/import", importRouter);

  // Serve prompts without authentication
  app.get("/api/prompts", async (req, res) => {
    try {
      const { storage } = await import("./storage");

      const level = parseInt(req.query.level as string) || 1;
      const intensity = parseInt(req.query.intensity as string) || 1;
      const isDrinkingGame = req.query.isDrinkingGame === 'true';
      const limit = parseInt(req.query.limit as string) || 10;

      const prompts = await storage.getPrompts({
        level,
        intensity,
        isDrinkingGame,
        limit
      });

      return res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      return res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Serve random prompt without authentication
  app.get("/api/prompts/random", async (req, res) => {
    try {
      const { storage } = await import("./storage");

      const level = parseInt(req.query.level as string) || 1;
      const intensity = parseInt(req.query.intensity as string) || 1;
      const isDrinkingGame = req.query.isDrinkingGame === 'true';

      const prompt = await storage.getRandomPrompt({
        level,
        intensity,
        isDrinkingGame
      });

      return res.json(prompt);
    } catch (error) {
      console.error("Error fetching random prompt:", error);
      return res.status(500).json({ message: "Failed to fetch random prompt" });
    }
  });

  // Serve challenges without authentication
  app.get("/api/challenges", async (req, res) => {
    try {
      const { storage } = await import("./storage");

      const type = req.query.type as string;
      const intensity = parseInt(req.query.intensity as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const challenges = await storage.getChallenges({
        type,
        intensity,
        limit
      });

      return res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      return res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Game session endpoints without authentication
  app.post("/api/sessions", async (req, res) => {
    try {
      const { storage } = await import("./storage");

      const session = await storage.createGameSession({
        accessCode: "OPEN_ACCESS", // Default value for tracking
        ...req.body
      });

      return res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      return res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const sessionId = parseInt(req.params.id);

      const session = await storage.updateGameSession(sessionId, req.body);

      return res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      return res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const sessionId = parseInt(req.params.id);

      await storage.deleteGameSession(sessionId);

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting session:", error);
      return res.status(500).json({ message: "Failed to delete session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}