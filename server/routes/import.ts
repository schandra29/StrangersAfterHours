import { Router } from "express";
import { storage } from "../storage";
import { insertPromptSchema, insertChallengeSchema } from "@shared/schema";
import { z } from "zod";

const importRouter = Router();

// Schema for batch prompt import
const batchPromptImportSchema = z.object({
  prompts: z.array(insertPromptSchema)
});

// Schema for batch challenge import
const batchChallengeImportSchema = z.object({
  challenges: z.array(insertChallengeSchema)
});

// Endpoint for batch importing prompts
importRouter.post("/prompts", async (req, res) => {
  try {
    const { prompts } = batchPromptImportSchema.parse(req.body);
    
    // Check if we have prompts to import
    if (prompts.length === 0) {
      return res.status(400).json({ message: "No prompts to import" });
    }
    
    // Use batch import method from DatabaseStorage
    const count = await storage.batchImportPrompts(prompts);
    
    res.status(201).json({ 
      message: `Successfully imported ${count} prompts`,
      count 
    });
  } catch (error) {
    console.error("Error importing prompts:", error);
    res.status(400).json({ message: "Invalid prompt data for batch import" });
  }
});

// Endpoint for batch importing challenges
importRouter.post("/challenges", async (req, res) => {
  try {
    const { challenges } = batchChallengeImportSchema.parse(req.body);
    
    // Check if we have challenges to import
    if (challenges.length === 0) {
      return res.status(400).json({ message: "No challenges to import" });
    }
    
    // Use batch import method from DatabaseStorage
    const count = await storage.batchImportChallenges(challenges);
    
    res.status(201).json({ 
      message: `Successfully imported ${count} challenges`,
      count 
    });
  } catch (error) {
    console.error("Error importing challenges:", error);
    res.status(400).json({ message: "Invalid challenge data for batch import" });
  }
});

export default importRouter;