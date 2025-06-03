import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

declare module './index' {
  export const db: PostgresJsDatabase;
  export const sql: typeof sql;
  
  export function getDatabaseVersion(): Promise<string>;
  
  export function getDatabaseStats(): Promise<{
    tableCount: number;
    totalRows: number;
    size: string;
  }>;
  
  export function query<T = Record<string, unknown>>(
    query: string,
    params?: any[]
  ): Promise<T[]>;
  
  export function transaction<T>(
    callback: (tx: any) => Promise<T>
  ): Promise<T>;
  
  export function closeConnection(): Promise<void>;
}

export * from './schema';
export { sql };

declare const db: PostgresJsDatabase;
export { db };
