import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { promptTypeEnum, promptPacks } from "./game-schema";

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
  type: promptTypeEnum("type").default('solo').notNull(), // solo or group
  category: text("category").notNull(),
  packId: integer("pack_id").references(() => promptPacks.id),
  isCustom: boolean("is_custom").default(false).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  usedActivityBreakIds: jsonb("used_activity_break_ids").default([]),
  usedReflectionPauseIds: jsonb("used_reflection_pause_ids").default([]),
  currentDeck: text("current_deck"), // Strangers, Friends, BFFs
  createdAt: text("created_at").notNull(),
  // Game statistics
  totalTimeSpent: integer("total_time_spent").default(0), // Total time in seconds
  promptsAnswered: integer("prompts_answered").default(0),
  activityBreaksCompleted: integer("activity_breaks_completed").default(0),
  reflectionPausesCompleted: integer("reflection_pauses_completed").default(0),
  fullHouseMoments: integer("full_house_moments").default(0),
  levelStats: jsonb("level_stats").default({}),
  // Access tracking for analytics
  accessCode: text("access_code"),
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  usedPromptIds: true,
  totalTimeSpent: true,
  promptsAnswered: true,
  fullHouseMoments: true,
  levelStats: true,
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

// Re-export types from game-schema
export { 
  promptTypeEnum,
  ActivityBreak,
  InsertActivityBreak,
  ReflectionPause,
  InsertReflectionPause,
  PromptPack,
  InsertPromptPack,
  UserProgress,
  InsertUserProgress
} from "./game-schema";

// Access codes for limiting application access
export const accessCodes = pgTable("access_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  maxUsages: integer("max_usages").default(10), // null means unlimited
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session storage for express-session with connect-pg-simple
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const insertAccessCodeSchema = createInsertSchema(accessCodes).omit({
  id: true,
  usageCount: true,
  createdAt: true,
});

export type AccessCode = typeof accessCodes.$inferSelect;
export type InsertAccessCode = z.infer<typeof insertAccessCodeSchema>;
