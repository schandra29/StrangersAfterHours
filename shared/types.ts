import { InferSelectModel } from 'drizzle-orm';
import { users, prompts, challenges, gameSessions, accessCodes, sessions } from './schema';
import { activityBreaks, reflectionPauses, promptPacks, userProgress } from './game-schema';

export type User = InferSelectModel<typeof users>;
export type Prompt = InferSelectModel<typeof prompts>;
export type Challenge = InferSelectModel<typeof challenges>;
export type GameSession = InferSelectModel<typeof gameSessions>;
export type AccessCode = InferSelectModel<typeof accessCodes>;
export type Session = InferSelectModel<typeof sessions>;
export type ActivityBreak = InferSelectModel<typeof activityBreaks>;
export type ReflectionPause = InferSelectModel<typeof reflectionPauses>;
export type PromptPack = InferSelectModel<typeof promptPacks>;
export type UserProgress = InferSelectModel<typeof userProgress>;

// Content type discriminator for the game content
export type ContentType = 'prompt' | 'activity-break' | 'reflection-pause';

// Game content union type
export type GameContent = 
  | { type: 'prompt'; content: Prompt }
  | { type: 'activity-break'; content: ActivityBreak }
  | { type: 'reflection-pause'; content: ReflectionPause };

// Add any additional types or type helpers here
