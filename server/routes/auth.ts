import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Add custom properties to express-session
declare module 'express-session' {
  interface SessionData {
    accessCode?: string;
    isAuthenticated?: boolean;
  }
}

export const authRouter = Router();

// Schema for validating access code
const accessCodeSchema = z.object({
  accessCode: z.string().min(1, "Access code is required"),
});

// Get current authentication status
authRouter.get("/status", (req, res) => {
  console.log("Session check:", req.session.id, req.session.isAuthenticated);
  return res.json({
    isAuthenticated: !!req.session.isAuthenticated,
  });
});

// Login with access code
authRouter.post("/login", async (req, res) => {
  try {
    const { accessCode } = accessCodeSchema.parse(req.body);
    
    // Validate access code
    const isValid = await storage.validateAccessCode(accessCode);
    
    if (isValid) {
      // Get the access code record to increment usage
      const accessCodeRecord = await storage.getAccessCodeByCode(accessCode);
      
      if (accessCodeRecord) {
        // Increment usage count
        await storage.incrementAccessCodeUsage(accessCodeRecord.id);
        
        // Set authenticated session
        req.session.accessCode = accessCode;
        req.session.isAuthenticated = true;
        
        return res.status(200).json({ message: "Login successful" });
      }
    }
    
    return res.status(401).json({ message: "Invalid access code" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(400).json({ message: "Invalid request" });
  }
});

// Logout
authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    
    return res.status(200).json({ message: "Logout successful" });
  });
});

// Reset session (for testing)
authRouter.get("/reset", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session reset error:", err);
      return res.status(500).json({ message: "Failed to reset session" });
    }
    
    return res.redirect('/access');
  });
});