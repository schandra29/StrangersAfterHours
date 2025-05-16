/**
 * This script analyzes access code usage and session statistics
 * for beta testing analytics.
 * 
 * Usage: node tools/analyze-access-codes.js [CODE]
 * Example: node tools/analyze-access-codes.js VIVEKG
 * 
 * If no code is specified, it will show statistics for all access codes.
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import Table from 'cli-table3';

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;

async function analyzeAccessCodes() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }
  
  // Get specific code from command line arguments if provided
  const specificCode = process.argv[2];
  
  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // PART 1: Get access code information
    let accessCodesQuery = `
      SELECT 
        id,
        code, 
        description, 
        is_active, 
        usage_count, 
        max_usages, 
        created_at
      FROM 
        access_codes
    `;
    
    if (specificCode) {
      accessCodesQuery += ` WHERE code = $1`;
    }
    
    accessCodesQuery += ` ORDER BY usage_count DESC, created_at DESC`;
    
    const accessCodesResult = specificCode 
      ? await pool.query(accessCodesQuery, [specificCode])
      : await pool.query(accessCodesQuery);
    
    if (accessCodesResult.rows.length === 0) {
      if (specificCode) {
        console.log(`No access code found with code: ${specificCode}`);
      } else {
        console.log("No access codes found in the database");
      }
      return;
    }
    
    console.log("\n==============================");
    console.log("ACCESS CODE INFORMATION");
    console.log("==============================\n");
    
    const accessTable = new Table({
      head: ['Code', 'Description', 'Status', 'Usage', 'Created'],
      colWidths: [12, 30, 10, 15, 24]
    });
    
    for (const code of accessCodesResult.rows) {
      const status = code.is_active ? "ACTIVE" : "INACTIVE";
      const usageLimit = code.max_usages === null ? "∞" : code.max_usages;
      const usageDisplay = `${code.usage_count} / ${usageLimit}`;
      const createdDate = new Date(code.created_at).toLocaleString();
      
      accessTable.push([
        code.code,
        code.description || "N/A",
        status,
        usageDisplay,
        createdDate
      ]);
    }
    
    console.log(accessTable.toString());
    
    // PART 2: Get session information for the access codes
    console.log("\n==============================");
    console.log("SESSION ANALYTICS");
    console.log("==============================\n");
    
    // Special code-specific analytics
    for (const accessCode of accessCodesResult.rows) {
      // Get sessions associated with this code
      const sessionsQuery = `
        SELECT 
          id,
          access_code,
          current_level,
          current_intensity,
          is_drinking_game,
          total_time_spent,
          prompts_answered,
          full_house_moments,
          created_at
        FROM 
          game_sessions
        WHERE 
          access_code = $1
        ORDER BY 
          created_at DESC
      `;
      
      const sessionsResult = await pool.query(sessionsQuery, [accessCode.code]);
      
      console.log(`\nAccess Code: ${accessCode.code} (${accessCode.description || 'No description'})`);
      
      if (sessionsResult.rows.length === 0) {
        console.log("  No sessions recorded for this access code yet");
        continue;
      }
      
      // Calculate session statistics
      const totalSessions = sessionsResult.rows.length;
      const totalTimeSpent = sessionsResult.rows.reduce((sum, session) => sum + (session.total_time_spent || 0), 0);
      const totalPromptsAnswered = sessionsResult.rows.reduce((sum, session) => sum + (session.prompts_answered || 0), 0);
      const totalFullHouseMoments = sessionsResult.rows.reduce((sum, session) => sum + (session.full_house_moments || 0), 0);
      
      const avgTimePerSession = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0;
      const avgPromptsPerSession = totalSessions > 0 ? Math.round(totalPromptsAnswered / totalSessions * 10) / 10 : 0;
      
      const sessionTable = new Table({
        head: ['Metric', 'Value'],
        colWidths: [30, 20]
      });
      
      sessionTable.push(
        ['Total Sessions', totalSessions.toString()],
        ['Total Time Spent', `${formatTime(totalTimeSpent)}`],
        ['Avg Session Length', `${formatTime(avgTimePerSession)}`],
        ['Total Prompts Answered', totalPromptsAnswered.toString()],
        ['Avg Prompts Per Session', avgPromptsPerSession.toString()],
        ['Total "Full House" Moments', totalFullHouseMoments.toString()]
      );
      
      console.log(sessionTable.toString());
      
      // Show the last 5 sessions for this code
      if (sessionsResult.rows.length > 0) {
        console.log("\nRecent Sessions:");
        
        const recentSessionsTable = new Table({
          head: ['Date', 'Level', 'Intensity', 'Time', 'Prompts'],
          colWidths: [24, 8, 12, 12, 10]
        });
        
        const recentSessions = sessionsResult.rows.slice(0, 5);
        
        for (const session of recentSessions) {
          const sessionDate = new Date(session.created_at).toLocaleString();
          
          recentSessionsTable.push([
            sessionDate,
            session.current_level.toString(),
            session.current_intensity.toString(),
            formatTime(session.total_time_spent || 0),
            (session.prompts_answered || 0).toString()
          ]);
        }
        
        console.log(recentSessionsTable.toString());
      }
    }
    
  } catch (error) {
    console.error("Error analyzing access codes:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Helper function to format time in seconds to a human-readable format
function formatTime(seconds) {
  if (!seconds) return '0m 0s';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
}

// Execute the function
analyzeAccessCodes();