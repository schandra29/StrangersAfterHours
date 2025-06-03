import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    return false;
  }

  const sql = postgres(connectionString, { max: 1 });
  
  try {
    console.log('1/3 🗑️  Dropping existing schema...');
    
    // Disable all triggers
    await sql`SET session_replication_ROLE = 'replica'`;
    
    // Get all tables in the public schema
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    
    // Drop all tables
    for (const table of tables) {
      console.log(`Dropping table: ${table.tablename}`);
      await sql`DROP TABLE IF EXISTS ${sql(table.tablename)} CASCADE`;
    }
    
    // Drop all enums
    const enums = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typnamespace = 'public'::regnamespace 
      AND typtype = 'e'
    `;
    
    for (const enumType of enums) {
      console.log(`Dropping enum: ${enumType.typname}`);
      await sql`DROP TYPE IF EXISTS ${sql(enumType.typname)} CASCADE`;
    }
    
    // Re-enable triggers
    await sql`SET session_replication_role = 'origin'`;
    
    console.log('✅ Database reset completed!');
    
    // Run migrations
    console.log('\n2/3 🚀 Running migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    
    // Seed the database
    console.log('\n3/3 🌱 Seeding database...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    
    console.log('\n✨ Database reset and seeded successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error resetting database:');
    console.error(error);
    return false;
  } finally {
    // Close the connection
    if (sql) {
      await sql.end();
    }
  }
}

// Run the reset
resetDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
