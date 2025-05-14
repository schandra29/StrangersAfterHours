import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertAccessCodeSchema } from "@shared/schema";

export const adminRouter = Router();

// Secret admin key for basic protection (replace with a more secure solution in production)
const ADMIN_KEY = process.env.ADMIN_KEY || "strangers_admin";

// Basic admin key validation middleware
const validateAdminKey = (req: any, res: any, next: any) => {
  const adminKey = req.headers["x-admin-key"];
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
    // This would require adding a new method to the storage interface
    // For simplicity, we'll just return a placeholder message since
    // this is just for admin management
    return res.status(200).json({ message: "Access code listing not implemented yet" });
  } catch (error) {
    console.error("Error getting access codes:", error);
    return res.status(500).json({ message: "Failed to retrieve access codes" });
  }
});