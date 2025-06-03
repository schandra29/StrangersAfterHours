// This file contains type definitions for database-related code
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, prompts, gameSessions, gamePlayers, playerResponses, activityBreaks, reflectionPauses, promptPacks, promptPackPrompts, userUnlockedPacks, deckEnum, promptTypeEnum } from './schema';

// Re-export enums
export { deckEnum, promptTypeEnum };

// Base types from schema
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Prompt = InferSelectModel<typeof prompts> & {
  activityBreak?: ActivityBreak | null;
  createdBy?: User | null;
};
export type NewPrompt = InferInsertModel<typeof prompts>;

export type GameSession = InferSelectModel<typeof gameSessions> & {
  host?: User | null;
  currentPrompt?: Prompt | null;
  players?: GamePlayer[];
  responses?: PlayerResponse[];
};
export type NewGameSession = InferInsertModel<typeof gameSessions>;

export type GamePlayer = InferSelectModel<typeof gamePlayers> & {
  user?: User | null;
  game?: GameSession | null;
};
export type NewGamePlayer = InferInsertModel<typeof gamePlayers>;

export type PlayerResponse = InferSelectModel<typeof playerResponses> & {
  prompt?: Prompt | null;
  user?: User | null;
  game?: GameSession | null;
};
export type NewPlayerResponse = InferInsertModel<typeof playerResponses>;

export type ActivityBreak = InferSelectModel<typeof activityBreaks>;
export type NewActivityBreak = InferInsertModel<typeof activityBreaks>;

export type ReflectionPause = InferSelectModel<typeof reflectionPauses>;
export type NewReflectionPause = InferInsertModel<typeof reflectionPauses>;

export type PromptPack = InferSelectModel<typeof promptPacks> & {
  prompts?: Prompt[];
};
export type NewPromptPack = InferInsertModel<typeof promptPacks>;

export type PromptPackPrompt = InferSelectModel<typeof promptPackPrompts> & {
  pack?: PromptPack | null;
  prompt?: Prompt | null;
};
export type NewPromptPackPrompt = InferInsertModel<typeof promptPackPrompts>;

export type UserUnlockedPack = InferSelectModel<typeof userUnlockedPacks> & {
  user?: User | null;
  pack?: PromptPack | null;
};
export type NewUserUnlockedPack = InferInsertModel<typeof userUnlockedPacks>;

// Enums
export type DeckType = 'strangers' | 'friends' | 'bffs';
export type PromptType = 'truth' | 'dare' | 'activity' | 'reflection';

// Game configuration types
export interface GameConfig {
  promptsPerLevel: number;
  activityBreakInterval: number;
  reflectionPauseInterval: number;
  points: {
    correctAnswer: number;
    bonusMultiplier: number;
    activityCompletion: number;
  };
  unlockThresholds: {
    friendsDeck: number;
    bffsDeck: number;
    promptPack: number;
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

/**
 * Type representing a database query result
 */
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  oid: number;
  fields: Array<{
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
  }>;
}

/**
 * Type representing a database column definition
 */
export interface ColumnDefinition {
  column_name: string;
  data_type: string;
  is_nullable: 'YES' | 'NO';
  column_default: string | null;
  description: string | null;
}

/**
 * Type representing a foreign key constraint
 */
export interface ForeignKeyConstraint {
  constraint_name: string;
  constraint_type: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

/**
 * Type representing a database index
 */
export interface IndexDefinition {
  indexname: string;
  indexdef: string;
}

/**
 * Type representing a database table with its columns, constraints, and indexes
 */
export interface TableDefinition {
  table_name: string;
  description: string | null;
  columns: ColumnDefinition[];
  constraints: ForeignKeyConstraint[];
  indexes: IndexDefinition[];
}

/**
 * Type for database connection options
 */
export interface DatabaseConnectionOptions {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string;
  };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}
