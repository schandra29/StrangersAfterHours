import { Router } from "express";

export const authRouter = Router();

// Always return authenticated status
authRouter.get("/status", (req, res) => {
  return res.json({
    isAuthenticated: true,
  });
});

// Login endpoint that always succeeds
authRouter.post("/login", async (req, res) => {
  return res.status(200).json({ message: "Login successful" });
});

// Logout endpoint
authRouter.post("/logout", (req, res) => {
  return res.status(200).json({ message: "Logout successful" });
});

// Reset session endpoint
authRouter.get("/reset", (req, res) => {
  return res.redirect('/');
});