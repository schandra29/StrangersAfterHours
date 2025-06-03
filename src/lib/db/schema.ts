import { pgTable, uuid, varchar, text, timestamp, boolean, integer, index, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const deckEnum = pgEnum('deck_type', ['strangers', 'friends', 'bffs']);
export const promptTypeEnum = pgEnum('prompt_type', ['truth', 'dare', 'activity', 'reflection']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login')
});

export const usersRelations = relations(users, ({ many }) => ({
  hostedGames: many(gameSessions, { relationName: 'host' }),
  gamePlayers: many(gamePlayers),
  responses: many(playerResponses)
}));

export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  level: integer('level').notNull(),  // 1: Icebreaker, 2: Getting to Know You, 3: Deeper Dive
  intensity: integer('intensity').notNull(),  // 1: Mild, 2: Moderate, 3: Bold
  type: promptTypeEnum('type').notNull().default('truth'),
  deck: deckEnum('deck').notNull().default('strangers'),
  isGroup: boolean('is_group').notNull().default(false),
  isIndian: boolean('is_indian').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  isUnlockable: boolean('is_unlockable').notNull().default(false),
  unlockAfterPrompts: integer('unlock_after_prompts'),
  activityBreakId: uuid('activity_break_id').references(() => activityBreaks.id, { onDelete: 'set null' }),
  isReflectionPrompt: boolean('is_reflection_prompt').notNull().default(false),
  createdById: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  levelIntensityIdx: index('idx_prompts_level_intensity').on(table.level, table.intensity, table.isGroup, table.isActive),
  deckIdx: index('idx_prompts_deck').on(table.deck),
  typeIdx: index('idx_prompts_type').on(table.type)
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [prompts.createdById],
    references: [users.id]
  }),
  responses: many(playerResponses)
}));

export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  hostId: uuid('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentLevel: integer('current_level').notNull().default(1),
  currentDeck: deckEnum('current_deck').notNull().default('strangers'),
  currentPromptId: uuid('current_prompt_id').references(() => prompts.id, { onDelete: 'set null' }),
  promptCount: integer('prompt_count').notNull().default(0),
  promptsShown: integer('prompts_shown').notNull().default(0),
  lastActivityBreakAt: timestamp('last_activity_break_at'),
  lastReflectionAt: timestamp('last_reflection_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  codeIdx: index('idx_game_sessions_code').on(table.code)
}));

export const gameSessionsRelations = relations(gameSessions, ({ one, many }) => ({
  host: one(users, {
    fields: [gameSessions.hostId],
    references: [users.id],
    relationName: 'host'
  }),
  currentPrompt: one(prompts, {
    fields: [gameSessions.currentPromptId],
    references: [prompts.id]
  }),
  players: many(gamePlayers),
  responses: many(playerResponses)
}));

export const gamePlayers = pgTable('game_players', {
  gameId: uuid('game_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').notNull().default(0),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastActive: timestamp('last_active').notNull().defaultNow()
}, (table) => ({
  pk: primaryKey({ columns: [table.gameId, table.userId] }),
  userIdx: index('idx_game_players_user').on(table.userId)
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one }) => ({
  game: one(gameSessions, {
    fields: [gamePlayers.gameId],
    references: [gameSessions.id]
  }),
  user: one(users, {
    fields: [gamePlayers.userId],
    references: [users.id]
  })
}));

export const playerResponses = pgTable('player_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  response: text('response').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  // Use primaryKey for unique constraints on multiple columns
  gameUserPromptPk: primaryKey({
    name: 'player_responses_game_user_prompt_pk',
    columns: [table.gameId, table.userId, table.promptId]
  })
}));

export const playerResponsesRelations = relations(playerResponses, ({ one }) => ({
  game: one(gameSessions, {
    fields: [playerResponses.gameId],
    references: [gameSessions.id]
  }),
  prompt: one(prompts, {
    fields: [playerResponses.promptId],
    references: [prompts.id]
  }),
  user: one(users, {
    fields: [playerResponses.userId],
    references: [users.id]
  })
}));

export const activityBreaks = pgTable('activity_breaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  durationSeconds: integer('duration_seconds').notNull().default(60),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const reflectionPauses = pgTable('reflection_pauses', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  description: text('description'),
  durationSeconds: integer('duration_seconds').notNull().default(120),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const promptPacks = pgTable('prompt_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  unlockCondition: text('unlock_condition').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const promptPackPrompts = pgTable('prompt_pack_prompts', {
  packId: uuid('pack_id').notNull().references(() => promptPacks.id, { onDelete: 'cascade' }),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  pk: primaryKey({ columns: [table.packId, table.promptId] }),
  packIdx: index('idx_prompt_pack_prompts_pack').on(table.packId)
}));

export const promptPackPromptsRelations = relations(promptPackPrompts, ({ one }) => ({
  pack: one(promptPacks, {
    fields: [promptPackPrompts.packId],
    references: [promptPacks.id]
  }),
  prompt: one(prompts, {
    fields: [promptPackPrompts.promptId],
    references: [prompts.id]
  })
}));

export const userUnlockedPacks = pgTable('user_unlocked_packs', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  packId: uuid('pack_id').notNull().references(() => promptPacks.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at').notNull().defaultNow()
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.packId] }),
  userIdx: index('idx_user_unlocked_packs_user').on(table.userId)
}));

export const userUnlockedPacksRelations = relations(userUnlockedPacks, ({ one }) => ({
  user: one(users, {
    fields: [userUnlockedPacks.userId],
    references: [users.id]
  }),
  pack: one(promptPacks, {
    fields: [userUnlockedPacks.packId],
    references: [promptPacks.id]
  })
}));

// Export all types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;

export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;

export type GamePlayer = typeof gamePlayers.$inferSelect;
export type NewGamePlayer = typeof gamePlayers.$inferInsert;

export type PlayerResponse = typeof playerResponses.$inferSelect;
export type NewPlayerResponse = typeof playerResponses.$inferInsert;

export type ActivityBreak = typeof activityBreaks.$inferSelect;
export type NewActivityBreak = typeof activityBreaks.$inferInsert;

export type ReflectionPause = typeof reflectionPauses.$inferSelect;
export type NewReflectionPause = typeof reflectionPauses.$inferInsert;

export type PromptPack = typeof promptPacks.$inferSelect;
export type NewPromptPack = typeof promptPacks.$inferInsert;
