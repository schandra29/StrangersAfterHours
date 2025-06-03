import { pgTable, uuid, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, activityBreaks } from './users.js';

export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  level: varchar('level').notNull(),
  intensity: varchar('intensity').notNull(),
  isGroup: boolean('is_group').notNull().default(false),
  isIndian: boolean('is_indian').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdById: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deck: varchar('deck').notNull().default('1'),
  unlockAfterPrompts: varchar('unlock_after_prompts').default('10'),
  isUnlockable: boolean('is_unlockable').default(false),
  activityBreakId: uuid('activity_break_id').references(() => activityBreaks.id, { onDelete: 'set null' }),
  isReflectionPrompt: boolean('is_reflection_prompt').default(false),
  type: varchar('type').notNull().default('truth'),
});

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [prompts.createdById],
    references: [users.id],
  }),
  activityBreak: one(activityBreaks, {
    fields: [prompts.activityBreakId],
    references: [activityBreaks.id],
  }),
  playerResponses: many(playerResponses),
  promptPacks: many(promptPackPrompts),
}));

export const playerResponses = pgTable('player_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull(),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  response: text('response').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const playerResponsesRelations = relations(playerResponses, ({ one }) => ({
  prompt: one(prompts, {
    fields: [playerResponses.promptId],
    references: [prompts.id],
  }),
  user: one(users, {
    fields: [playerResponses.userId],
    references: [users.id],
  }),
  gameSession: one(gameSessions, {
    fields: [playerResponses.gameId],
    references: [gameSessions.id],
  }),
}));

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

export const promptPackPrompts = pgTable('prompt_pack_prompts', {
  packId: uuid('pack_id').notNull(),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  primaryKey: { columns: [t.packId, t.promptId] },
}));
