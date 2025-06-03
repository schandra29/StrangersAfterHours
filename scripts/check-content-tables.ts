import dotenv from 'dotenv';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Create log file for output
const logFile = fs.createWriteStream('./scripts/check-tables-output.log', { flags: 'w' });

// Helper function to log to both console and file
function log(message: string) {
  // Force output to console
  process.stdout.write(`${message}\n`);
  // Also write to log file
  logFile.write(`${message}\n`);
}

// Create a Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  log('🔍 Checking database tables...');
  log(`Supabase URL: ${supabaseUrl}`);
  log(`Time: ${new Date().toISOString()}\n`);
  
  try {
    // Check connection by making a simple query
    const { error: connectionError } = await supabase
      .from('activity_breaks')
      .select('*', { count: 'exact', head: true });
    
    if (connectionError) {
      throw new Error(`Supabase connection error: ${connectionError.message}`);
    }
    
    log('✅ Connected to Supabase');
    
    // Check session activity breaks table
    const { count: sessionActivityBreaksCount, error: sessionActivityBreaksError } = await supabase
      .from('session_activity_breaks')
      .select('*', { count: 'exact', head: true });
    
    if (sessionActivityBreaksError) {
      log(`❌ Error checking session activity breaks: ${sessionActivityBreaksError.message}`);
    } else {
      log(`\nSession activity breaks table exists: true`);
      log(`Session activity breaks count: ${sessionActivityBreaksCount || 0}`);
    }
    
    // Check activity breaks table
    const { data: activityBreaksData, count: activityBreaksCount, error: activityBreaksError } = await supabase
      .from('activity_breaks')
      .select('*', { count: 'exact' });
    
    if (activityBreaksError) {
      log(`❌ Error checking activity breaks: ${activityBreaksError.message}`);
    } else {
      log(`Activity breaks table exists: true`);
      log(`Activity breaks count: ${activityBreaksCount || 0}`);
      
      if (activityBreaksData && activityBreaksData.length > 0) {
        // Sample activity breaks
        log('\nSample activity breaks:');
        activityBreaksData.slice(0, 3).forEach((row, index) => {
          log(`${index + 1}. ${row.title} - ${row.description?.substring(0, 50)}...`);
        });
      } else {
        log('No activity breaks found');
      }
    }
    
    // Check session reflection pauses table
    const { count: sessionReflectionPausesCount, error: sessionReflectionPausesError } = await supabase
      .from('session_reflection_pauses')
      .select('*', { count: 'exact', head: true });
    
    if (sessionReflectionPausesError) {
      log(`❌ Error checking session reflection pauses: ${sessionReflectionPausesError.message}`);
    } else {
      log(`\nSession reflection pauses table exists: true`);
      log(`Session reflection pauses count: ${sessionReflectionPausesCount || 0}`);
    }
    
    // Check reflection pauses table
    const { data: reflectionPausesData, count: reflectionPausesCount, error: reflectionPausesError } = await supabase
      .from('reflection_pauses')
      .select('*', { count: 'exact' });
    
    if (reflectionPausesError) {
      log(`❌ Error checking reflection pauses: ${reflectionPausesError.message}`);
    } else {
      log(`Reflection pauses table exists: true`);
      log(`Reflection pauses count: ${reflectionPausesCount || 0}`);
      
      if (reflectionPausesData && reflectionPausesData.length > 0) {
        // Sample reflection pauses
        log('\nSample reflection pauses:');
        reflectionPausesData.slice(0, 3).forEach((row, index) => {
          log(`${index + 1}. ${row.title} - ${row.description?.substring(0, 50)}...`);
        });
      } else {
        log('No reflection pauses found');
      }
    }
    
    // Check game sessions table
    const { data: gameSessions, error: gameSessionsError } = await supabase
      .from('game_sessions')
      .select('*')
      .limit(1);
      
    if (gameSessionsError) {
      log(`\n❌ Error checking game sessions: ${gameSessionsError.message}`);
    } else {
      log('\nGame sessions table exists: true');
      
      // List all columns in the first game session
      if (gameSessions && gameSessions.length > 0) {
        const gameSessionsColumns = Object.keys(gameSessions[0]);
        log('Game sessions table columns:');
        gameSessionsColumns.forEach(column => {
          log(`  - ${column}: ${typeof gameSessions[0][column]}`);
        });
        
        // Check for activity break related columns
        const activityBreakColumns = gameSessionsColumns.filter(column => 
          column.includes('activity_break') || 
          column.includes('activitybreak')
        );
        
        // Check for reflection pause related columns
        const reflectionPauseColumns = gameSessionsColumns.filter(column => 
          column.includes('reflection_pause') || 
          column.includes('reflectionpause')
        );
        
        log(`\nActivity break columns found: ${activityBreakColumns.length}`);
        if (activityBreakColumns.length > 0) {
          log('Activity break columns:');
          activityBreakColumns.forEach(col => log(`  - ${col}`));
        }
        
        log(`Reflection pause columns found: ${reflectionPauseColumns.length}`);
        if (reflectionPauseColumns.length > 0) {
          log('Reflection pause columns:');
          reflectionPauseColumns.forEach(col => log(`  - ${col}`));
        }
      } else {
        log('No game sessions found to analyze structure');
      }
    }
  } catch (error) {
    log(`\n❌ Error checking tables:`);
    if (error instanceof Error) {
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
    } else {
      log(`Unknown error: ${error}`);
    }
    throw error;
  } finally {
    log('\n✅ Database check complete');
  }
  
  // Close the log file
  logFile.end();
}

checkTables()
  .then(() => {
    log('✅ Check complete');
    log('Check the log file at ./scripts/check-tables-output.log for detailed results');
    // Force output to be flushed before exiting
    setTimeout(() => process.exit(0), 100);
  })
  .catch(error => {
    log('❌ Check failed:');
    if (error instanceof Error) {
      log(`Error message: ${error.message}`);
      log(`Error stack: ${error.stack}`);
    } else {
      log(`Unknown error: ${error}`);
    }
    // Force output to be flushed before exiting
    setTimeout(() => process.exit(1), 100);
  });
