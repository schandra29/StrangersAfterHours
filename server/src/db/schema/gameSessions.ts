import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { prompts, playerResponses } from './prompts.js';
import { users } from './users.js';
import { activityBreaks } from './activityBreaks.js';
import { reflectionPauses } from './reflectionPauses.js';

export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  hostId: uuid('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentLevel: varchar('current_level').notNull().default('1'),
  currentDeck: varchar('current_deck').notNull().default('1'),
  currentPromptId: uuid('current_prompt_id').references(() => prompts.id, { onDelete: 'set null' }),
  promptCount: varchar('prompt_count').notNull().default('0'),
  promptsShown: varchar('prompts_shown').notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastActivityBreakAt: timestamp('last_activity_break_at', { withTimezone: true }),
  lastReflectionAt: timestamp('last_reflection_at', { withTimezone: true }),
  activityBreaksShown: varchar('activity_breaks_shown').notNull().default('0'),
  reflectionPausesShown: varchar('reflection_pauses_shown').notNull().default('0'),
  nextActivityBreakAfter: varchar('next_activity_break_after').notNull().default('4'),
  nextReflectionAfter: varchar('next_reflection_after').notNull().default('10'),
  soloPromptCount: varchar('solo_prompt_count').notNull().default('0'),
  groupPromptCount: varchar('group_prompt_count').notNull().default('0'),
  lastPromptType: varchar('last_prompt_type', { length: 10 }),
});

export const gameSessionsRelations = relations(gameSessions, ({ one, many }) => ({
  host: one(users, {
    fields: [gameSessions.hostId],
    references: [users.id],
  }),
  currentPrompt: one(prompts, {
    fields: [gameSessions.currentPromptId],
    references: [prompts.id],
  }),
  players: many(gamePlayers),
  responses: many(playerResponses),
  activityBreaks: many(sessionActivityBreaks),
  reflectionPauses: many(sessionReflectionPauses),
}));

export const gamePlayers = pgTable('game_players', {
  gameId: uuid('game_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: varchar('score').notNull().default('0'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  lastActive: timestamp('last_active', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  primaryKey: { columns: [t.gameId, t.userId] },
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one }) => ({
  gameSession: one(gameSessions, {
    fields: [gamePlayers.gameId],
    references: [gameSessions.id],
  }),
  user: one(users, {
    fields: [gamePlayers.userId],
    references: [users.id],
  }),
}));

export const sessionActivityBreaks = pgTable('session_activity_breaks', {
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  activityBreakId: uuid('activity_break_id').notNull().references(() => activityBreaks.id, { onDelete: 'cascade' }),
  shownAt: timestamp('shown_at', { withTimezone: true }).notNull().defaultNow(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (t) => ({
  primaryKey: { columns: [t.sessionId, t.activityBreakId] },
}));

export const sessionActivityBreaksRelations = relations(sessionActivityBreaks, ({ one }) => ({
  gameSession: one(gameSessions, {
    fields: [sessionActivityBreaks.sessionId],
    references: [gameSessions.id],
  }),
  activityBreak: one(activityBreaks, {
    fields: [sessionActivityBreaks.activityBreakId],
    references: [activityBreaks.id],
  }),
}));

export const sessionReflectionPauses = pgTable('session_reflection_pauses', {
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  reflectionPauseId: uuid('reflection_pause_id').notNull().references(() => reflectionPauses.id, { onDelete: 'cascade' }),
  shownAt: timestamp('shown_at', { withTimezone: true }).notNull().defaultNow(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (t) => ({
  primaryKey: { columns: [t.sessionId, t.reflectionPauseId] },
}));

export const sessionReflectionPausesRelations = relations(sessionReflectionPauses, ({ one }) => ({
  gameSession: one(gameSessions, {
    fields: [sessionReflectionPauses.sessionId],
    references: [gameSessions.id],
  }),
  reflectionPause: one(reflectionPauses, {
    fields: [sessionReflectionPauses.reflectionPauseId],
    references: [reflectionPauses.id],
  }),
}));
