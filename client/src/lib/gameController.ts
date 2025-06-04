import { type Prompt, type ActivityBreak, type ReflectionPause, type PromptPack } from '@shared/schema';
import axios from 'axios';

// Game controller interacts with API endpoints

// Game state constants
const ACTIVITY_BREAK_FREQUENCY = 4; // After every 4 prompts
const REFLECTION_PAUSE_FREQUENCY = 10; // After every 10 prompts
const UNLOCK_PACK_THRESHOLD = 10; // Unlock first pack after 10 prompts

export type GameContentType = 'prompt' | 'activity-break' | 'reflection-pause';

export interface GameState {
  gameId: string | null;
  currentPrompt: Prompt | null;
  currentActivityBreak: ActivityBreak | null;
  currentReflectionPause: ReflectionPause | null;
  contentType: GameContentType;
  promptCount: number;
  promptsShown: number;
  lastActivityBreakAt: number;
  lastReflectionAt: number;
  unlockedPacks: string[];
  level: number;
  intensity: number;
  deck: 'strangers' | 'friends' | 'bffs';
  isGroup: boolean;
}

// Default initial state
export const initialGameState: GameState = {
  gameId: null,
  currentPrompt: null,
  currentActivityBreak: null,
  currentReflectionPause: null,
  contentType: 'prompt',
  promptCount: 0,
  promptsShown: 0,
  lastActivityBreakAt: 0,
  lastReflectionAt: 0,
  unlockedPacks: [],
  level: 1,
  intensity: 1,
  deck: 'strangers',
  isGroup: false,
};

export class GameController {
  private state: GameState;
  private activityBreaks: ActivityBreak[] = [];
  private reflectionPauses: ReflectionPause[] = [];
  private availablePrompts: Prompt[] = [];
  private unlockedPrompts: Prompt[] = [];
  private availablePacks: PromptPack[] = [];

  constructor(initialState: Partial<GameState> = {}) {
    this.state = { ...initialGameState, ...initialState };
  }

  // Initialize the game with data from the database
  async initialize() {
    try {
      // Get game progress first
      const progressResponse = await axios.get('/api/game/progress');
      const progress = progressResponse.data;
      
      if (progress) {
        // Update state with user's saved progress
        this.state.level = progress.level || 1;
        this.state.intensity = progress.intensity || 1;
        this.state.isGroup = progress.isGroupMode || false;
        this.state.promptCount = progress.promptsAnswered || 0;
      }
      
      // Fetch activity breaks using our new API endpoint
      const activityResponse = await axios.get('/api/game/activity');
      this.activityBreaks = [activityResponse.data];
      
      // Fetch more activities for variety
      for (let i = 0; i < 4; i++) {
        try {
          const response = await axios.get('/api/game/activity');
          if (response.data && !this.activityBreaks.find(a => a.id === response.data.id)) {
            this.activityBreaks.push(response.data);
          }
        } catch (e) {
          console.warn('Failed to fetch additional activity', e);
        }
      }

      // Fetch reflection pauses
      const reflectionResponse = await axios.get('/api/game/reflection');
      this.reflectionPauses = [reflectionResponse.data];
      
      // Fetch more reflections for variety
      for (let i = 0; i < 4; i++) {
        try {
          const response = await axios.get('/api/game/reflection');
          if (response.data && !this.reflectionPauses.find(r => r.id === response.data.id)) {
            this.reflectionPauses.push(response.data);
          }
        } catch (e) {
          console.warn('Failed to fetch additional reflection', e);
        }
      }

      // Fetch unlockable packs
      const packsResponse = await axios.get('/api/game/unlockable-packs');
      const packs = packsResponse.data;
      
      // Set available packs and track which are unlocked
      this.availablePacks = packs || [];
      this.state.unlockedPacks = packs
        .filter((pack: PromptPack & { isUnlocked?: boolean }) => pack.isUnlocked)
        .map((pack: PromptPack & { isUnlocked?: boolean }) => String(pack.id));

      // Load initial prompts based on current deck, level, intensity
      await this.loadPrompts();

      return true;
    } catch (error) {
      console.error('Failed to initialize game controller:', error);
      return false;
    }
  }

  // Load prompts based on current game settings
  async loadPrompts() {
    try {
      const { level, intensity, deck, isGroup } = this.state;

      // Get next prompt from API
      const response = await axios.get('/api/game/next-prompt', {
        params: {
          level,
          intensity,
          deck,
          isGroup,
          lastPromptType: this.state.currentPrompt?.type
        }
      });

      if (response.data && response.data.prompt) {
        // Add the prompt to our available list so we can randomly select it later
        // In a real implementation, we would fetch multiple prompts at once
        this.availablePrompts = [response.data.prompt];
        
        // Fetch a few more prompts for variety (in production we'd batch this)
        for (let i = 0; i < 5; i++) {
          try {
            const additionalResponse = await axios.get('/api/game/next-prompt', {
              params: { level, intensity, deck, isGroup }
            });
            
            if (additionalResponse.data && additionalResponse.data.prompt) {
              const newPrompt = additionalResponse.data.prompt;
              
              // Only add if not a duplicate
              if (!this.availablePrompts.find(p => p.id === newPrompt.id)) {
                this.availablePrompts.push(newPrompt);
              }
            }
          } catch (e) {
            // Continue if one fetch fails
            console.warn('Failed to fetch additional prompt', e);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to load prompts:', error);
      return false;
    }
  }

  // Get the next content (prompt, activity break, or reflection pause)
  async getNextContent(): Promise<GameContentType> {
    try {
      const { promptCount, lastActivityBreakAt, lastReflectionAt } = this.state;
      
      // Check if we need to show an activity break
      if (promptCount > 0 && promptCount % ACTIVITY_BREAK_FREQUENCY === 0 && promptCount !== lastActivityBreakAt) {
        // Time for an activity break
        const randomIndex = Math.floor(Math.random() * this.activityBreaks.length);
        this.state.currentActivityBreak = this.activityBreaks[randomIndex];
        this.state.currentPrompt = null;
        this.state.currentReflectionPause = null;
        this.state.contentType = 'activity-break';
        return 'activity-break';
      }
      
      // Check if we need to show a reflection pause
      if (promptCount > 0 && promptCount % REFLECTION_PAUSE_FREQUENCY === 0 && promptCount !== lastReflectionAt) {
        // Time for a reflection pause
        const randomIndex = Math.floor(Math.random() * this.reflectionPauses.length);
        this.state.currentReflectionPause = this.reflectionPauses[randomIndex];
        this.state.currentPrompt = null;
        this.state.currentActivityBreak = null;
        this.state.contentType = 'reflection-pause';
        return 'reflection-pause';
      }
      
      // Otherwise, show a prompt
      const allPrompts = [...this.availablePrompts, ...this.unlockedPrompts];
      if (allPrompts.length === 0) {
        // No prompts available - reload or handle accordingly
        await this.loadPrompts();
        if (this.availablePrompts.length === 0) {
          throw new Error('No prompts available for current settings');
        }
      }
      
      const randomIndex = Math.floor(Math.random() * allPrompts.length);
      this.state.currentPrompt = allPrompts[randomIndex];
      this.state.currentActivityBreak = null;
      this.state.currentReflectionPause = null;
      this.state.contentType = 'prompt';
      this.state.promptCount++;
      this.state.promptsShown++;
      
      return 'prompt';
    } catch (error) {
      console.error('Error getting next content:', error);
      return 'prompt'; // Default to prompt on error
    }
  }

  // Complete an activity break
  async completeActivityBreak() {
    if (this.state.contentType === 'activity-break' && this.state.currentActivityBreak) {
      try {
        // Record activity completion with API
        await axios.post('/api/game/complete-activity', {
          activityId: this.state.currentActivityBreak.id
        });
        
        this.state.lastActivityBreakAt = this.state.promptCount;
        // Return to normal prompt flow
        return this.getNextContent();
      } catch (error) {
        console.error('Failed to complete activity break:', error);
        // Continue the game even if the API call fails
        this.state.lastActivityBreakAt = this.state.promptCount;
        return this.getNextContent();
      }
    }
  }

  // Complete a reflection pause
  async completeReflectionPause(answer?: string) {
    if (this.state.contentType === 'reflection-pause' && this.state.currentReflectionPause) {
      try {
        // Record reflection completion with API
        await axios.post('/api/game/complete-reflection', {
          reflectionId: this.state.currentReflectionPause.id,
          answer: answer || ''
        });
        
        this.state.lastReflectionAt = this.state.promptCount;
        // Return to normal prompt flow
        return this.getNextContent();
      } catch (error) {
        console.error('Failed to complete reflection pause:', error);
        // Continue the game even if the API call fails
        this.state.lastReflectionAt = this.state.promptCount;
        return this.getNextContent();
      }
    }
  }

  // Check if a new prompt pack can be unlocked
  async checkForUnlockablePack(): Promise<PromptPack | null> {
    try {
      const { promptsShown, unlockedPacks } = this.state;
      
      // Check if we've reached the threshold to unlock a pack
      if (promptsShown >= UNLOCK_PACK_THRESHOLD) {
        // Find a pack that hasn't been unlocked yet
        const unlockedPackIds = new Set<string>(unlockedPacks);
        const availableToUnlock = this.availablePacks.filter(pack => !unlockedPackIds.has(String(pack.id)));
        
        if (availableToUnlock.length > 0) {
          // Return the first available pack to unlock
          return availableToUnlock[0];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for unlockable packs:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  // Unlock a prompt pack
  async unlockPack(packId: string): Promise<boolean> {
    try {
      // Save unlock to the database through API
      const response = await axios.post('/api/game/unlock-pack', { packId });
      
      if (response.data && response.data.success) {
        // Update local state
        if (!this.state.unlockedPacks.includes(packId)) {
          this.state.unlockedPacks.push(packId);
        }
        
        // Reload prompts to include newly unlocked ones
        await this.loadPrompts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unlocking pack:', error);
      return false;
    }
  }

  // Change level or intensity
  async setLevel(level: number) {
    if (level >= 1 && level <= 3) {
      this.state.level = level;
      
      // Update progress in database
      try {
        await axios.post('/api/game/update-progress', { level });
      } catch (error) {
        console.error('Failed to update level in database:', error);
      }
      
      await this.loadPrompts();
    }
  }

  async setIntensity(intensity: number) {
    if (intensity >= 1 && intensity <= 3) {
      this.state.intensity = intensity;
      
      // Update progress in database
      try {
        await axios.post('/api/game/update-progress', { intensity });
      } catch (error) {
        console.error('Failed to update intensity in database:', error);
      }
      
      await this.loadPrompts();
    }
  }

  async setDeck(deck: 'strangers' | 'friends' | 'bffs') {
    this.state.deck = deck;
    await this.loadPrompts();
  }

  async toggleGroupMode() {
    this.state.isGroup = !this.state.isGroup;
    
    // Update progress in database
    try {
      await axios.post('/api/game/update-progress', { isGroupMode: this.state.isGroup });
    } catch (error) {
      console.error('Failed to update group mode in database:', error);
    }
    
    await this.loadPrompts();
  }

  // Get current state
  getState() {
    return { ...this.state };
  }
}

export default GameController;
