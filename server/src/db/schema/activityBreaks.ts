import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { prompts } from './prompts';
import { sessionActivityBreaks } from './gameSessions';

export const activityBreaks = pgTable('activity_breaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  durationSeconds: varchar('duration_seconds').notNull().default('60'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  activityType: varchar('activity_type', { length: 50 }).notNull().default('physical'),
  difficulty: varchar('difficulty').notNull().default('1'),
  instructions: text('instructions'),
  imageUrl: text('image_url'),
  minPlayers: varchar('min_players').notNull().default('2'),
  maxPlayers: varchar('max_players'),
  deckSpecific: boolean('deck_specific').notNull().default(false),
  deck: varchar('deck'),
});

export const activityBreaksRelations = relations(activityBreaks, ({ many }) => ({
  prompts: many(prompts),
  sessions: many(sessionActivityBreaks),
}));
