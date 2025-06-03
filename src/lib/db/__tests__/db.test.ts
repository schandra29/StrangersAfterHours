import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db, getDatabaseVersion, getDatabaseStats, query } from '../..';
import { sql } from 'drizzle-orm';

describe('Database Utilities', () => {
  beforeAll(async () => {
    // Ensure database connection is established
    try {
      await db.execute(sql`SELECT 1`);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Close the database connection after all tests
    // Note: The actual connection pool cleanup is handled by the config
  });

  it('should get database version', async () => {
    const version = await getDatabaseVersion();
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
    expect(version).not.toBe('Error');
    console.log(`Database version: ${version}`);
  });

  it('should get database statistics', async () => {
    const stats = await getDatabaseStats();
    expect(stats).toBeDefined();
    expect(typeof stats.tableCount).toBe('number');
    expect(stats.tableCount).toBeGreaterThanOrEqual(0);
    expect(typeof stats.size).toBe('string');
    console.log(`Database stats:`, stats);
  });

  it('should execute a raw query', async () => {
    const result = await query('SELECT $1::text as message', ['Hello, Database!']);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBeDefined();
    expect(result[0].message).toBe('Hello, Database!');
  });

  it('should handle query errors gracefully', async () => {
    await expect(query('INVALID SQL')).rejects.toThrow();
  });
});
