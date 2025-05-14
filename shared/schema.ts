import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Prompt table
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  level: integer("level").notNull(), // 1-3: Icebreaker, Getting to Know You, Deeper Dive
  intensity: integer("intensity").notNull(), // 1-3: Mild, Medium, Wild
  category: text("category").notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
});

// Challenge table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "Truth or Dare" or "Act It Out"
  text: text("text").notNull(),
  intensity: integer("intensity").notNull(), // 1-3: Mild, Medium, Wild
  isCustom: boolean("is_custom").default(false).notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

// Game session table
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  currentLevel: integer("current_level").notNull().default(1),
  currentIntensity: integer("current_intensity").notNull().default(1),
  isDrinkingGame: boolean("is_drinking_game").notNull().default(false),
  usedPromptIds: jsonb("used_prompt_ids").notNull().default([]),
  createdAt: text("created_at").notNull(),
  // Game statistics
  totalTimeSpent: integer("total_time_spent").default(0), // Total time in seconds
  promptsAnswered: integer("prompts_answered").default(0),
  fullHouseMoments: integer("full_house_moments").default(0),
  levelStats: jsonb("level_stats").default({}),
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  usedPromptIds: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
