import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
});

export const usersRelations = relations(users, ({ many }) => ({
  gameSessions: many(gameSessions),
  playerResponses: many(playerResponses),
  unlockedPacks: many(userUnlockedPacks),
}));

// Forward declarations for relations
export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  hostId: uuid('host_id').notNull(),
  // Other fields omitted to avoid circular dependencies
});

// Forward declarations for relations
export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Other fields omitted to avoid circular dependencies
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

// This will be defined in promptPacks.ts
export const userUnlockedPacks = pgTable('user_unlocked_packs', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  packId: uuid('pack_id').notNull().references(() => promptPacks.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  primaryKey: { columns: [t.userId, t.packId] },
}));

// This will be defined in promptPacks.ts
export const promptPacks = pgTable('prompt_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  unlockAfterPrompts: varchar('unlock_after_prompts').notNull().default('10'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  theme: varchar('theme', { length: 50 }),
  imageUrl: text('image_url'),
  deck: varchar('deck'),
  promptCount: varchar('prompt_count').default('0'),
  isPremium: boolean('is_premium').notNull().default(false),
});

// This will be defined in gameSessions.ts
export const playerResponses = pgTable('player_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull(),
  promptId: uuid('prompt_id').notNull(),
  userId: uuid('user_id').notNull(),
  response: text('response').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// This will be defined in activityBreaks.ts
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

// This will be defined in reflectionPauses.ts
export const reflectionPauses = pgTable('reflection_pauses', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  description: text('description'),
  durationSeconds: varchar('duration_seconds').notNull().default('120'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  theme: varchar('theme', { length: 50 }),
  followUpQuestions: text('follow_up_questions').array(),
  imageUrl: text('image_url'),
  deckSpecific: boolean('deck_specific').notNull().default(false),
  deck: varchar('deck'),
});
