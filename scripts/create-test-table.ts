import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('🔄 Creating test table...');
  
  try {
    // Create a test table
    const { data: createTableData, error: createTableError } = await supabase.rpc('create_test_table');
    
    if (createTableError) {
      console.error('❌ Error creating table:', createTableError);
      return;
    }
    
    console.log('✅ Test table created successfully!');
    
    // Insert a sample record
    const { data: insertData, error: insertError } = await supabase
      .from('test_table')
      .insert([
        { name: 'Test Entry', description: 'This is a test entry' }
      ]);
    
    if (insertError) {
      console.error('❌ Error inserting test data:', insertError);
      return;
    }
    
    console.log('✅ Test data inserted successfully!');
    
    // Verify the data was inserted
    const { data: fetchData, error: fetchError } = await supabase
      .from('test_table')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching test data:', fetchError);
      return;
    }
    
    console.log('📊 Test data in table:', fetchData);
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Create a function in the database to create the table
async function setupDatabase() {
  console.log('🛠️ Setting up database...');
  
  try {
    // Create a function to execute raw SQL for table creation
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE OR REPLACE FUNCTION create_test_table() 
        RETURNS void AS $$
        BEGIN
          -- Create the table if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'test_table') THEN
            CREATE TABLE test_table (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Grant permissions to the anon role
            GRANT ALL PRIVILEGES ON TABLE test_table TO anon, authenticated, service_role;
            GRANT USAGE, SELECT ON SEQUENCE test_table_id_seq TO anon, authenticated, service_role;
            
            RAISE NOTICE 'Test table created successfully';
          ELSE
            RAISE NOTICE 'Test table already exists';
          END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Create a function to execute raw SQL
        CREATE OR REPLACE FUNCTION exec_sql(sql TEXT) 
        RETURNS json AS $$
        DECLARE
          result json;
        BEGIN
          EXECUTE sql INTO result;
          RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (error) {
      console.error('❌ Error setting up database functions:', error);
      return;
    }
    
    console.log('✅ Database setup complete!');
    
    // Now create the test table and insert data
    await createTestTable();
    
  } catch (err) {
    console.error('❌ Error during database setup:', err);
  }
}

main();
