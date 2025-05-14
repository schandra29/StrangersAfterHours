import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Local storage keys
export const STORAGE_KEYS = {
  USED_PROMPTS: 'strangers-used-prompts',
  PROMPT_STATS: 'strangers-prompt-stats'
}

// Function to get used prompt IDs from local storage
export function getUsedPromptIds(): number[] {
  try {
    const storedIds = localStorage.getItem(STORAGE_KEYS.USED_PROMPTS)
    return storedIds ? JSON.parse(storedIds) : []
  } catch (error) {
    console.error('Error retrieving used prompts:', error)
    return []
  }
}

// Function to add a prompt ID to used prompts
export function markPromptAsUsed(promptId: number): void {
  try {
    const usedIds = getUsedPromptIds()
    if (!usedIds.includes(promptId)) {
      usedIds.push(promptId)
      localStorage.setItem(STORAGE_KEYS.USED_PROMPTS, JSON.stringify(usedIds))
      
      // Also update stats
      updatePromptStats()
    }
  } catch (error) {
    console.error('Error marking prompt as used:', error)
  }
}

// Function to reset used prompts
export function resetUsedPrompts(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USED_PROMPTS)
    updatePromptStats() // Update stats after reset
  } catch (error) {
    console.error('Error resetting used prompts:', error)
  }
}

// Function to get prompt stats (total/used counts)
export interface PromptStats {
  total: {
    level1: number;
    level2: number;
    level3: number;
    total: number;
  };
  used: {
    level1: number;
    level2: number;
    level3: number;
    total: number;
  };
}

// Initial empty stats structure
const EMPTY_STATS: PromptStats = {
  total: { level1: 300, level2: 300, level3: 300, total: 900 },
  used: { level1: 0, level2: 0, level3: 0, total: 0 }
}

export function getPromptStats(): PromptStats {
  try {
    const storedStats = localStorage.getItem(STORAGE_KEYS.PROMPT_STATS)
    return storedStats ? JSON.parse(storedStats) : EMPTY_STATS
  } catch (error) {
    console.error('Error retrieving prompt stats:', error)
    return EMPTY_STATS
  }
}

// Function to update prompt stats based on used prompts
// This will be called after marking a prompt as used
export async function updatePromptStats(): Promise<void> {
  try {
    // Get the current used prompt IDs
    const usedIds = getUsedPromptIds()
    
    // Fetch all the prompts from the API to get their levels
    const response = await fetch('/api/prompts')
    if (!response.ok) {
      throw new Error('Failed to fetch prompts for stats')
    }
    
    const prompts = await response.json()
    
    // Count used prompts by level
    const used = {
      level1: 0,
      level2: 0,
      level3: 0,
      total: usedIds.length
    }
    
    // Count total prompts by level
    const total = {
      level1: 0,
      level2: 0,
      level3: 0,
      total: prompts.length
    }
    
    // Process each prompt
    prompts.forEach((prompt: any) => {
      // Update total counts
      if (prompt.level === 1) total.level1++
      else if (prompt.level === 2) total.level2++
      else if (prompt.level === 3) total.level3++
      
      // Update used counts if this prompt has been used
      if (usedIds.includes(prompt.id)) {
        if (prompt.level === 1) used.level1++
        else if (prompt.level === 2) used.level2++
        else if (prompt.level === 3) used.level3++
      }
    })
    
    // Save the updated stats
    const stats: PromptStats = { total, used }
    localStorage.setItem(STORAGE_KEYS.PROMPT_STATS, JSON.stringify(stats))
    
  } catch (error) {
    console.error('Error updating prompt stats:', error)
  }
}

// Calculate completion percentage
export function getCompletionPercentage(): number {
  const stats = getPromptStats()
  if (stats.total.total === 0) return 0
  return Math.round((stats.used.total / stats.total.total) * 100)
}
