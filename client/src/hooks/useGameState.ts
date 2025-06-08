import { useState, useEffect, useCallback } from 'react';
import GameController, { GameState, initialGameState } from '@/lib/gameController';
import { supabase } from '@/lib/supabaseProvider';
import { type PromptPack } from '@shared/schema';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameController, setGameController] = useState<GameController | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockablePack, setUnlockablePack] = useState<PromptPack | null>(null);
  // const supabase = useSupabase(); // supabase is now directly imported

  // Initialize game controller
  useEffect(() => {
    const initGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const controller = new GameController();
        const success = await controller.initialize();
        
        if (!success) {
          throw new Error('Failed to initialize game');
        }
        
        setGameController(controller);
        setGameState(controller.getState());
        
        // Get first prompt
        await handleNextContent();
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Game initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initGame();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [supabase]);

  // Handle getting the next content (prompt, activity break, or reflection)
  const handleNextContent = useCallback(async () => {
    if (!gameController) return;
    
    try {
      setIsLoading(true);
      await gameController.getNextContent();
      const newState = gameController.getState();
      setGameState(newState);
      
      // Check if we should unlock a new pack
      const packToUnlock = await gameController.checkForUnlockablePack();
      if (packToUnlock) {
        setUnlockablePack(packToUnlock);
      }
      
    } catch (err) {
      console.error('Error getting next content:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameController]);

  // Complete an activity break
  const handleCompleteActivityBreak = useCallback(async () => {
    if (!gameController) return;
    
    try {
      setIsLoading(true);
      await gameController.completeActivityBreak();
      setGameState(gameController.getState());
    } catch (err) {
      console.error('Error completing activity break:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameController]);

  // Complete a reflection pause
  const handleCompleteReflectionPause = useCallback(async () => {
    if (!gameController) return;
    
    try {
      setIsLoading(true);
      await gameController.completeReflectionPause();
      setGameState(gameController.getState());
    } catch (err) {
      console.error('Error completing reflection pause:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameController]);

  // Unlock a prompt pack
  const handleUnlockPack = useCallback(async (packId: string) => {
    if (!gameController) return false;
    
    try {
      const success = await gameController.unlockPack(packId);
      if (success) {
        setGameState(gameController.getState());
        setUnlockablePack(null);
      }
      return success;
    } catch (err) {
      console.error('Error unlocking pack:', err);
      return false;
    }
  }, [gameController]);

  // Change game level
  const handleSetLevel = useCallback(async (level: number) => {
    if (!gameController) return;
    
    try {
      await gameController.setLevel(level);
      setGameState(gameController.getState());
    } catch (err) {
      console.error('Error changing level:', err);
    }
  }, [gameController]);

  // Change game intensity
  const handleSetIntensity = useCallback(async (intensity: number) => {
    if (!gameController) return;
    
    try {
      await gameController.setIntensity(intensity);
      setGameState(gameController.getState());
    } catch (err) {
      console.error('Error changing intensity:', err);
    }
  }, [gameController]);

  // Toggle group mode
  const handleToggleGroupMode = useCallback(async () => {
    if (!gameController) return;
    
    try {
      await gameController.toggleGroupMode();
      setGameState(gameController.getState());
    } catch (err) {
      console.error('Error toggling group mode:', err);
    }
  }, [gameController]);

  // Dismiss the unlockable pack modal without unlocking
  const handleDismissUnlockablePack = useCallback(() => {
    setUnlockablePack(null);
  }, []);

  return {
    gameState,
    isLoading,
    error,
    unlockablePack,
    handleNextContent,
    handleCompleteActivityBreak,
    handleCompleteReflectionPause,
    handleUnlockPack,
    handleSetLevel,
    handleSetIntensity,
    handleToggleGroupMode,
    handleDismissUnlockablePack
  };
}
