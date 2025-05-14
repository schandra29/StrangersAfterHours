import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertChallengeSchema, insertPromptSchema } from "@shared/schema";

export const importRouter = Router();

// Schema for bulk importing prompts
const importPromptsSchema = z.array(insertPromptSchema);

// Schema for bulk importing challenges
const importChallengesSchema = z.array(insertChallengeSchema);

// Route for importing prompts
importRouter.post("/prompts/import", async (req, res) => {
  try {
    const prompts = importPromptsSchema.parse(req.body);
    const count = await storage.batchImportPrompts(prompts);
    res.status(201).json({ count });
  } catch (error) {
    console.error("Error importing prompts:", error);
    res.status(400).json({ error: "Invalid prompt data" });
  }
});

// Route for importing challenges
importRouter.post("/challenges/import", async (req, res) => {
  try {
    const challenges = importChallengesSchema.parse(req.body);
    const count = await storage.batchImportChallenges(challenges);
    res.status(201).json({ count });
  } catch (error) {
    console.error("Error importing challenges:", error);
    res.status(400).json({ error: "Invalid challenge data" });
  }
});