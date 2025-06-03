import { pgTable, uuid, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sessionReflectionPauses } from './gameSessions';

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

export const reflectionPausesRelations = relations(reflectionPauses, ({ many }) => ({
  sessions: many(sessionReflectionPauses),
}));
