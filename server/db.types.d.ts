import { ExtractTablesWithRelations } from 'drizzle-orm';
import { users, prompts, challenges, gameSessions, accessCodes, sessions } from '@shared/schema';
import { activities, promptPacks, userProgress } from '@shared/game-schema';

declare module '../db' {
  interface Database {
    users: typeof users;
    prompts: typeof prompts;
    challenges: typeof challenges;
    gameSessions: typeof gameSessions;
    accessCodes: typeof accessCodes;
    sessions: typeof sessions;
    activities: typeof activities;
    promptPacks: typeof promptPacks;
    userProgress: typeof userProgress;
  }
}

export type Tables = ExtractTablesWithRelations<{
  users: typeof users;
  prompts: typeof prompts;
  challenges: typeof challenges;
  gameSessions: typeof gameSessions;
  accessCodes: typeof accessCodes;
  sessions: typeof sessions;
  activities: typeof activities;
  promptPacks: typeof promptPacks;
  userProgress: typeof userProgress;
}>;
