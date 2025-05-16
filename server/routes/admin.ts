import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertAccessCodeSchema, accessCodes, gameSessions, prompts, challenges } from "@shared/schema";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";

export const adminRouter = Router();

// Secret admin key for basic protection (replace with a more secure solution in production)
const ADMIN_KEY = process.env.ADMIN_KEY || "strangers_admin";

// Basic admin key validation middleware
const validateAdminKey = (req: any, res: any, next: any) => {
  const adminKey = req.headers["x-admin-key"] || req.headers["authorization"]?.replace('Bearer ', '');
  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Apply admin key validation to all routes
adminRouter.use(validateAdminKey);

// Create a new access code
adminRouter.post("/access-codes", async (req, res) => {
  try {
    const accessCodeData = insertAccessCodeSchema.parse(req.body);
    const newAccessCode = await storage.createAccessCode(accessCodeData);
    return res.status(201).json(newAccessCode);
  } catch (error) {
    console.error("Error creating access code:", error);
    return res.status(400).json({ message: "Invalid request" });
  }
});

// Get all access codes
adminRouter.get("/access-codes", async (req, res) => {
  try {
    // Get all access codes from the database
    const result = await db.select().from(accessCodes).orderBy(accessCodes.createdAt, 'desc');
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting access codes:", error);
    return res.status(500).json({ message: "Failed to retrieve access codes" });
  }
});

// Get access code statistics for admin dashboard
adminRouter.get("/access-codes/stats", async (req, res) => {
  try {
    // Get all access codes
    const allAccessCodes = await db.select().from(accessCodes);
    
    // Result array to be returned
    const result = [];
    
    // Process each access code
    for (const accessCode of allAccessCodes) {
      // Get associated sessions for this access code
      const sessions = await db.select()
        .from(gameSessions)
        .where(eq(gameSessions.accessCode, accessCode.code))
        .orderBy(gameSessions.createdAt, 'desc');
      
      // Calculate statistics
      const totalSessions = sessions.length;
      const totalTimeSpent = sessions.reduce((sum, session) => sum + (session.totalTimeSpent || 0), 0);
      const totalPromptsAnswered = sessions.reduce((sum, session) => sum + (session.promptsAnswered || 0), 0);
      const totalFullHouseMoments = sessions.reduce((sum, session) => sum + (session.fullHouseMoments || 0), 0);
      
      const avgSessionLength = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0;
      const avgPromptsPerSession = totalSessions > 0 ? Math.round((totalPromptsAnswered / totalSessions) * 10) / 10 : 0;
      
      // Format recent sessions for display
      const recentSessions = sessions.slice(0, 5).map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        level: session.currentLevel,
        intensity: session.currentIntensity,
        timeSpent: session.totalTimeSpent || 0,
        promptsAnswered: session.promptsAnswered || 0
      }));
      
      // Add to result
      result.push({
        code: accessCode.code,
        description: accessCode.description,
        isActive: accessCode.isActive,
        usageCount: accessCode.usageCount,
        maxUsages: accessCode.maxUsages,
        createdAt: accessCode.createdAt,
        stats: {
          totalSessions,
          totalTimeSpent,
          avgSessionLength,
          totalPromptsAnswered,
          avgPromptsPerSession,
          totalFullHouseMoments
        },
        sessions: recentSessions
      });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting access code statistics:", error);
    return res.status(500).json({ message: "Failed to retrieve access code statistics" });
  }
});

// Purge all prompts - used when reimporting the entire prompts dataset
adminRouter.post("/purge-prompts", async (req, res) => {
  try {
    console.log("Admin request to purge all prompts");
    
    // Delete all prompts from the database using raw SQL to avoid ID conflicts
    const result = await db.execute(sql`DELETE FROM prompts`);
    
    return res.status(200).json({ 
      message: "Successfully purged all prompts", 
      count: result.rowCount || 0
    });
  } catch (error) {
    console.error("Error purging prompts:", error);
    return res.status(500).json({ message: "Failed to purge prompts" });
  }
});

// Purge all challenges - used when reimporting the entire challenges dataset
adminRouter.post("/purge-challenges", async (req, res) => {
  try {
    console.log("Admin request to purge all challenges");
    
    // Delete all challenges from the database
    const result = await db.execute(sql`DELETE FROM challenges`);
    
    return res.status(200).json({ 
      message: "Successfully purged all challenges", 
      count: result.rowCount || 0
    });
  } catch (error) {
    console.error("Error purging challenges:", error);
    return res.status(500).json({ message: "Failed to purge challenges" });
  }
});