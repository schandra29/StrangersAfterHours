import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql as drizzleSql } from 'drizzle-orm';

declare module '../lib/db' {
  export const db: PostgresJsDatabase;
  export const sql: typeof drizzleSql;
  
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
}
