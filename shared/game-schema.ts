import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./schema";

// Enums
export const promptTypeEnum = pgEnum('prompt_type', ['solo', 'group']);

export const activityBreaks = pgTable("activity_breaks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").default(60).notNull(), // in seconds
  isActive: boolean("is_active").default(true).notNull(),
  deckSpecific: boolean("deck_specific").default(false).notNull(),
  deck: text("deck"), // Strangers, Friends, BFFs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reflectionPauses = pgTable("reflection_pauses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").default(120).notNull(), // in seconds
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const promptPacks = pgTable("prompt_packs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  unlockThreshold: integer("unlock_threshold").default(10).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  promptsAnswered: integer("prompts_answered").default(0).notNull(),
  unlockedPacks: integer("unlocked_packs").array().default(sql`'{}'::integer[]`),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type ActivityBreak = typeof activityBreaks.$inferSelect;
export type InsertActivityBreak = typeof activityBreaks.$inferInsert;

export type ReflectionPause = typeof reflectionPauses.$inferSelect;
export type InsertReflectionPause = typeof reflectionPauses.$inferInsert;

export type PromptPack = typeof promptPacks.$inferSelect;
export type InsertPromptPack = typeof promptPacks.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;
