import { query } from '../lib/db';

export interface Prompt {
  id: string;
  text: string;
  level: number; // 1-3: Icebreaker to Deeper
  intensity: number; // 1-3: Mild to Bold
  isGroup: boolean;
  isIndianContext: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getRandomPrompt(options: {
  level?: number;
  intensity?: number;
  isGroup?: boolean;
  excludeIds?: string[];
}): Promise<Prompt | null> {
  const { level, intensity, isGroup, excludeIds = [] } = options;
  
  const params: any[] = [true];
  let paramIndex = 1;
  
  let whereClause = 'WHERE is_active = $1';
  
  if (level !== undefined) {
    whereClause += ` AND level = $${++paramIndex}`;
    params.push(level);
  }
  
  if (intensity !== undefined) {
    whereClause += ` AND intensity = $${++paramIndex}`;
    params.push(intensity);
  }
  
  if (isGroup !== undefined) {
    whereClause += ` AND is_group = $${++paramIndex}`;
    params.push(isGroup);
  }
  
  if (excludeIds.length > 0) {
    whereClause += ` AND id NOT IN (${excludeIds.map((_, i) => `$${paramIndex + i + 1}`).join(', ')})`;
    params.push(...excludeIds);
  }
  
  const result = await query<Prompt>(
    `SELECT * FROM prompts 
     ${whereClause}
     ORDER BY RANDOM() 
     LIMIT 1`,
    params,
    'Failed to fetch random prompt'
  );
  
  return result.rows[0] || null;
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  const result = await query<Prompt>(
    'SELECT * FROM prompts WHERE id = $1',
    [id],
    'Failed to fetch prompt by ID'
  );
  return result.rows[0] || null;
}

export async function createPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
  const result = await query<Prompt>(
    `INSERT INTO prompts (text, level, intensity, is_group, is_indian_context, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      prompt.text,
      prompt.level,
      prompt.intensity,
      prompt.isGroup,
      prompt.isIndianContext,
      prompt.isActive !== false
    ],
    'Failed to create prompt'
  );
  
  return result.rows[0];
}

export async function updatePrompt(
  id: string,
  updates: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Prompt | null> {
  const updateFields = [];
  const params: any[] = [id];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      updateFields.push(`${key} = $${++paramIndex}`);
      params.push(value);
    }
  }
  
  if (updateFields.length === 0) {
    return getPromptById(id);
  }
  
  const result = await query<Prompt>(
    `UPDATE prompts 
     SET ${updateFields.join(', ')}, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    params,
    'Failed to update prompt'
  );
  
  return result.rows[0] || null;
}

export async function deletePrompt(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM prompts WHERE id = $1',
    [id],
    'Failed to delete prompt'
  );
  
  return result.rowCount > 0;
}

export async function listPrompts(options: {
  level?: number;
  intensity?: number;
  isGroup?: boolean;
  isIndianContext?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<Prompt[]> {
  const {
    level,
    intensity,
    isGroup,
    isIndianContext,
    isActive,
    limit = 100,
    offset = 0
  } = options;
  
  const whereClauses: string[] = [];
  const params: any[] = [limit, offset];
  
  if (level !== undefined) {
    whereClauses.push(`level = $${params.length + 1}`);
    params.push(level);
  }
  
  if (intensity !== undefined) {
    whereClauses.push(`intensity = $${params.length + 1}`);
    params.push(intensity);
  }
  
  if (isGroup !== undefined) {
    whereClauses.push(`is_group = $${params.length + 1}`);
    params.push(isGroup);
  }
  
  if (isIndianContext !== undefined) {
    whereClauses.push(`is_indian_context = $${params.length + 1}`);
    params.push(isIndianContext);
  }
  
  if (isActive !== undefined) {
    whereClauses.push(`is_active = $${params.length + 1}`);
    params.push(isActive);
  }
  
  const whereClause = whereClauses.length > 0 
    ? `WHERE ${whereClauses.join(' AND ')}` 
    : '';
  
  const result = await query<Prompt>(
    `SELECT * FROM prompts
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    params,
    'Failed to list prompts'
  );
  
  return result.rows;
}
