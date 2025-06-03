import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { promptPackPrompts } from './prompts';

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

export const promptPacksRelations = relations(promptPacks, ({ many }) => ({
  prompts: many(promptPackPrompts),
  unlockedBy: many(userUnlockedPacks),
}));

export const userUnlockedPacks = pgTable('user_unlocked_packs', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  packId: uuid('pack_id').notNull().references(() => promptPacks.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: t.primaryKey(t.userId, t.packId),
}));

export const userUnlockedPacksRelations = relations(userUnlockedPacks, ({ one }) => ({
  user: one(users, {
    fields: [userUnlockedPacks.userId],
    references: [users.id],
  }),
  pack: one(promptPacks, {
    fields: [userUnlockedPacks.packId],
    references: [promptPacks.id],
  }),
}));
