import dotenv from 'dotenv';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Console colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  fg: {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    white: '\x1b[37m',
  }
};

// Create log file for output
const logFile = fs.createWriteStream('./scripts/tables-list.log', { flags: 'w' });

// Helper function to log to both console and file
function log(message: string) {
  try {
    // Force output to console
    process.stdout.write(`${message}\n`);
    // Also write to log file
    logFile.write(`${message}\n`);
  } catch (error) {
    // If there's an error writing to the log file, at least try to write to console
    console.error('Error writing to log:', error);
  }
}

// Create Supabase client for database operations
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Add a header to the log output
log(`${colors.bright}${colors.fg.cyan}📋 DATABASE TABLES LIST${colors.reset}`);
log(`${colors.fg.yellow}This script will list all tables in the database${colors.reset}`);
log(`${colors.fg.white}Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'Not set'}${colors.reset}`);
log(`${colors.fg.white}Supabase URL: ${supabaseUrl}${colors.reset}`);
log(`${colors.fg.white}Time: ${new Date().toISOString()}${colors.reset}\n`);

async function listTables() {
  try {
    log(`${colors.bright}${colors.fg.blue}🔍 QUERYING DATABASE TABLES${colors.reset}\n`);
    
    // Query to list all tables in the public schema
    const { data, error } = await supabase
      .rpc('list_tables');
    
    if (error) {
      log(`${colors.fg.red}❌ Error: ${error.message}${colors.reset}`);
      
      // Try an alternative approach - query the information_schema
      log(`${colors.fg.yellow}⚠️ Trying alternative approach...${colors.reset}`);
      
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        log(`${colors.fg.red}❌ Alternative approach failed: ${tablesError.message}${colors.reset}`);
        throw tablesError;
      }
      
      log(`${colors.fg.green}✓ Found ${tables?.length || 0} tables${colors.reset}\n`);
      
      if (tables && tables.length > 0) {
        log(`${colors.bright}${colors.fg.blue}📊 TABLE LIST:${colors.reset}`);
        tables.forEach((table, index) => {
          log(`${colors.fg.green}${index + 1}. ${table.table_name}${colors.reset}`);
        });
      } else {
        log(`${colors.fg.yellow}⚠️ No tables found${colors.reset}`);
      }
      
      return tables || [];
    }
    
    log(`${colors.fg.green}✓ Found ${data?.length || 0} tables${colors.reset}\n`);
    
    if (data && data.length > 0) {
      log(`${colors.bright}${colors.fg.blue}📊 TABLE LIST:${colors.reset}`);
      data.forEach((table, index) => {
        log(`${colors.fg.green}${index + 1}. ${table}${colors.reset}`);
      });
    } else {
      log(`${colors.fg.yellow}⚠️ No tables found${colors.reset}`);
    }
    
    return data || [];
  } catch (error) {
    log(`${colors.fg.red}❌ Error listing tables: ${error instanceof Error ? error.message : JSON.stringify(error)}${colors.reset}`);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await listTables();
    
    // Try to describe specific tables we're interested in
    const tablesToCheck = ['activity_breaks', 'activityBreaks', 'reflection_pauses', 'reflectionPauses', 'game_sessions', 'gameSessions'];
    
    log(`\n${colors.bright}${colors.fg.blue}🔍 CHECKING SPECIFIC TABLES${colors.reset}`);
    
    for (const table of tablesToCheck) {
      log(`\n${colors.fg.yellow}Checking table: ${table}${colors.reset}`);
      
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          log(`${colors.fg.red}❌ Table '${table}' error: ${error.message}${colors.reset}`);
        } else {
          log(`${colors.fg.green}✓ Table '${table}' exists${colors.reset}`);
          log(`${colors.fg.green}✓ Contains ${data?.length || 0} rows${colors.reset}`);
          
          if (data && data.length > 0) {
            log(`${colors.fg.cyan}Sample row structure:${colors.reset}`);
            const sample = data[0];
            Object.keys(sample).forEach(key => {
              log(`  ${colors.fg.white}${key}: ${typeof sample[key] === 'object' ? JSON.stringify(sample[key]) : sample[key]}${colors.reset}`);
            });
          }
        }
      } catch (error) {
        log(`${colors.fg.red}❌ Error checking table '${table}': ${error instanceof Error ? error.message : JSON.stringify(error)}${colors.reset}`);
      }
    }
    
    return true;
  } catch (error) {
    log(`${colors.fg.red}❌ Error in main function: ${error instanceof Error ? error.message : JSON.stringify(error)}${colors.reset}`);
    return false;
  }
}

// Run the script
main()
  .then(() => {
    log(`\n${colors.bright}${colors.fg.green}✅ SCRIPT COMPLETED${colors.reset}`);
    log(`Check the log file at ./scripts/tables-list.log for detailed results`);
    // Make sure all output is flushed before exiting
    logFile.end(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    log(`\n${colors.bright}${colors.fg.red}❌ SCRIPT FAILED${colors.reset}`);
    if (error instanceof Error) {
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
    } else {
      log(`Unknown error: ${JSON.stringify(error)}`);
    }
    log(`Check the log file at ./scripts/tables-list.log for detailed results`);
    // Make sure all output is flushed before exiting
    logFile.end(() => {
      process.exit(1);
    });
  });
