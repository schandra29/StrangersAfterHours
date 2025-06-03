import { supabase, executeQuery, fetchFromTable } from './supabaseClient'

// Example usage of the database functions
export async function getPrompts(options = {}) {
  const { level, intensity, isGroup, limit = 10, offset = 0 } = options
  
  const filter = {}
  if (level !== undefined) filter.level = level
  if (intensity !== undefined) filter.intensity = intensity
  if (isGroup !== undefined) filter.is_group = isGroup
  
  return fetchFromTable('prompts', '*', filter)
    .limit(limit)
    .range(offset, offset + limit - 1)
}

export async function getRandomPrompt(options = {}) {
  const { level, intensity, isGroup } = options
  
  // Build the where clause
  let whereClause = 'is_active = true'
  const params = []
  let paramIndex = 1
  
  if (level !== undefined) {
    whereClause += ` AND level = $${paramIndex++}`
    params.push(level)
  }
  
  if (intensity !== undefined) {
    whereClause += ` AND intensity = $${paramIndex++}`
    params.push(intensity)
  }
  
  if (isGroup !== undefined) {
    whereClause += ` AND is_group = $${paramIndex++}`
    params.push(isGroup)
  }
  
  const sql = `
    SELECT * FROM prompts
    WHERE ${whereClause}
    ORDER BY RANDOM()
    LIMIT 1
  `
  
  const result = await executeQuery(sql, params)
  return result[0]?.[0] || null
}

// Add more database functions as needed
