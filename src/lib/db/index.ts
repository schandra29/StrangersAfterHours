// Database configuration and client
export * from './config';

// Import schema types without re-exporting to avoid conflicts
import {
  ActivityBreak,
  GamePlayer,
  GameSession,
  PlayerResponse,
  Prompt,
  PromptPack,
  ReflectionPause,
  User,
  NewActivityBreak,
  NewGamePlayer,
  NewGameSession,
  NewPlayerResponse,
  NewPrompt,
  NewPromptPack,
  NewReflectionPause,
  NewUser
} from './schema';

// Re-export Drizzle ORM types for convenience
export {
  eq, and, or, inArray, desc, asc, count, avg, sum, gt, gte, lt, lte
} from 'drizzle-orm';

// Main database client and utilities
import { db } from './config';
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export { db, sql };

// Re-export types
export type { Database, DatabasePool } from './config';

// Export schema types with proper naming
export type {
  ActivityBreak,
  GamePlayer,
  GameSession,
  PlayerResponse,
  Prompt,
  PromptPack,
  ReflectionPause,
  User,
  NewActivityBreak,
  NewGamePlayer,
  NewGameSession,
  NewPlayerResponse,
  NewPrompt,
  NewPromptPack,
  NewReflectionPause,
  NewUser
};

/**
 * Test the database connection
 * @returns Promise that resolves to true if the connection is successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

/**
 * Get the database version
 * @returns Promise that resolves to the database version string
 */
export async function getDatabaseVersion(): Promise<string> {
  try {
    const result = await db.execute(sql`SELECT version() as version`);
    const rows = Array.isArray(result) ? result : [result];
    return (rows[0] as any)?.version || 'Unknown';
  } catch (error) {
    console.error('Error getting database version:', error);
    return 'Error';
  }
}

/**
 * Get database statistics
 * @returns Promise with database statistics
 */
export async function getDatabaseStats(): Promise<{
  tableCount: number;
  totalRows: number;
  size: string;
}> {
  try {
    const [tableCountResult, sizeResult] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`),
      db.execute(sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size`)
    ]);

    const getFirstRow = (result: any) => Array.isArray(result) ? result[0] : result;
    const tableCount = getFirstRow(tableCountResult);
    const sizeData = getFirstRow(sizeResult);

    return {
      tableCount: parseInt((tableCount as any)?.count || '0', 10),
      totalRows: 0, // This would need a more complex query to calculate
      size: (sizeData as any)?.size || '0 MB'
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}

/**
 * Execute a raw SQL query using the database client
 * @param query SQL query string with placeholders ($1, $2, etc.)
 * @param params Array of parameters for the query
 * @returns Promise with query results
 */
export async function query<T = Record<string, unknown>>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    // Create a prepared statement with parameters
    const preparedQuery = params.reduce(
      (acc, param, index) => acc.replace(`$${index + 1}`, `'${param}'`),
      query
    );
    
    // Execute the query
    const result = await db.execute(sql.raw(preparedQuery));
    return (Array.isArray(result) ? result : [result]) as T[];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute a transaction
 * @param callback Async callback function that receives the transaction client
 * @returns Promise that resolves with the transaction result
 */
export async function transaction<T>(
  callback: (tx: PostgresJsDatabase<Record<string, unknown>>) => Promise<T>
): Promise<T> {
  try {
    return await db.transaction(async (tx) => {
      try {
        return await callback(tx);
      } catch (error) {
        console.error('Transaction callback error:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}
