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
  code: z.string().min(4).max(20)
});

// Endpoint to validate access code
authRouter.post("/access-code/validate", async (req, res) => {
  try {
    // Validate request body
    const { code } = accessCodeSchema.parse(req.body);
    
    // Check if code is valid
    const isValid = await storage.validateAccessCode(code);
    
    if (!isValid) {
      return res.status(401).json({ message: "Invalid access code" });
    }
    
    // Get the access code object
    const accessCode = await storage.getAccessCodeByCode(code);
    
    if (!accessCode) {
      return res.status(500).json({ message: "Access code not found after validation" });
    }
    
    // Increment usage count
    await storage.incrementAccessCodeUsage(accessCode.id);
    
    // Store access code in session
    req.session.accessCode = code;
    req.session.isAuthenticated = true;
    
    return res.status(200).json({ message: "Access code validated successfully" });
  } catch (error) {
    console.error("Error validating access code:", error);
    return res.status(400).json({ message: "Invalid request" });
  }
});

// Endpoint to check if user is authenticated
authRouter.get("/status", (req, res) => {
  const isAuthenticated = req.session.isAuthenticated === true;
  return res.status(200).json({ isAuthenticated });
});

// Endpoint to log out
authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    return res.status(200).json({ message: "Logged out successfully" });
  });
});