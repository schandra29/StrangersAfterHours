import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Prompt, type GameSession, type ActivityBreak, type ReflectionPause } from "@shared/schema";
import { fallbackPrompts, getLevelName } from "@/lib/gameData";
import { getUsedPromptIds, markPromptAsUsed, resetUsedPrompts } from "@/lib/utils";

export function useGame() {
  const [currentLevel, setLevel] = useState<number>(1);
  const [currentIntensity, setIntensity] = useState<number>(1);
  const [currentDeck, setCurrentDeck] = useState<string>("Strangers");
  const [isDrinkingGame, setIsDrinkingGame] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [currentActivityBreak, setCurrentActivityBreak] = useState<ActivityBreak | null>(null);
  const [currentReflectionPause, setCurrentReflectionPause] = useState<ReflectionPause | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [usedPromptIds, setUsedPromptIds] = useState<number[]>([]);
  const [promptsShown, setPromptsShown] = useState<number>(0);
  const [contentType, setContentType] = useState<'prompt' | 'activity-break' | 'reflection-pause'>('prompt');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Load used prompts from localStorage on mount
  useEffect(() => {
    const storedIds = getUsedPromptIds();
    setUsedPromptIds(storedIds);
  }, []);

  // Fetch prompts, excluding already used ones
  const { data: prompts, isLoading: isLoadingPrompts, refetch: refetchPrompts } = useQuery<Prompt[]>({
    queryKey: [`/api/prompts?level=${currentLevel}&intensity=${currentIntensity}`, usedPromptIds],
    enabled: !!currentLevel && !!currentIntensity,
    queryFn: async () => {
      // Convert used prompt IDs to a query string
      const excludeIdsParam = usedPromptIds.length > 0 
        ? `&excludeIds=${usedPromptIds.join('&excludeIds=')}` 
        : '';
      
      console.log(`Fetching prompts for Level ${currentLevel}/Intensity ${currentIntensity}`);
      
      const response = await apiRequest(
        "GET", 
        `/api/prompts?level=${currentLevel}&intensity=${currentIntensity}${excludeIdsParam}`
      );
      return response.json();
    }
  });

  // Create new game session
  const createSession = useMutation({
    mutationFn: async (data: { 
      currentLevel: number; 
      currentIntensity: number; 
      currentDeck: string;
      isDrinkingGame: boolean 
    }) => {
      // Include the createdAt field
      const sessionData = {
        ...data,
        createdAt: new Date().toISOString()
      };
      const res = await apiRequest("POST", "/api/game-sessions", sessionData);
      return res.json();
    },
    onSuccess: (data: GameSession) => {
      setSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: [`/api/game-sessions/${data.id}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create game session",
        variant: "destructive",
      });
    },
  });

  // Update game session
  const updateSession = useMutation({
    mutationFn: async (data: Partial<GameSession>) => {
      if (!sessionId) return null;
      const res = await apiRequest("PATCH", `/api/sessions/${sessionId}`, data);
      return res.json();
    },
    onSuccess: (data: GameSession | null) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}`] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update game session",
        variant: "destructive",
      });
    },
  });

  // Start a new game
  const startNewGame = () => {
    setUsedPromptIds([]);
    setPromptsShown(0);
    setContentType('prompt');
    
    // Create new session in the backend
    createSession.mutate({
      currentLevel,
      currentIntensity,
      currentDeck,
      isDrinkingGame,
    });
    
    // Initialize with first prompt
    getNextContent();
  };

  // Get next content (prompt, activity break, or reflection pause)
  const getNextContent = async () => {
    if (!sessionId) {
      console.error("No session ID available");
      return;
    }
    
    try {
      const response = await apiRequest("GET", `/api/game-sessions/${sessionId}/next-prompt`, {});
      const data = await response.json();
      
      // Increment prompts shown counter
      setPromptsShown(prev => prev + 1);
      
      // Handle different content types
      setContentType(data.type);
      
      if (data.type === 'prompt') {
        setCurrentPrompt(data.content);
        setCurrentActivityBreak(null);
        setCurrentReflectionPause(null);
        
        // Update level and intensity if they've changed
        if (data.content.level !== currentLevel) {
          setLevel(data.content.level);
        }
        
        if (data.content.intensity !== currentIntensity) {
          setIntensity(data.content.intensity);
        }
        
        // Track in localStorage for long-term persistence
        markPromptAsUsed(data.content.id);
      } 
      else if (data.type === 'activity-break') {
        setCurrentActivityBreak(data.content);
        setCurrentPrompt(null);
        setCurrentReflectionPause(null);
      } 
      else if (data.type === 'reflection-pause') {
        setCurrentReflectionPause(data.content);
        setCurrentPrompt(null);
        setCurrentActivityBreak(null);
      }
    } catch (error) {
      console.error("Error getting next content:", error);
      toast({
        title: "Error",
        description: "Failed to get next content. Using fallback prompts.",
        variant: "destructive",
      });
      
      // Use fallback prompts if API fails
      const fallbackPrompt = fallbackPrompts
        .filter(p => p.level === currentLevel && (p.intensity || 1) <= currentIntensity)
        .map((p, index) => ({
          id: index,
          text: p.text || "Prompt not available",
          level: p.level || 1,
          intensity: p.intensity || 1,
          category: p.category || getLevelName(p.level || 1),
          isCustom: false,
          userId: null,
          isGroup: false
        }))[0];
      
      if (fallbackPrompt) {
        setContentType('prompt');
        setCurrentPrompt(fallbackPrompt as unknown as Prompt);
        setCurrentActivityBreak(null);
        setCurrentReflectionPause(null);
      }
    }
  };

  // Alias for backwards compatibility
  const getNextPrompt = getNextContent;
  
  // Get a completely random prompt (from any level or intensity)
  const getRandomPrompt = async () => {
    try {
      // Simplified call to random endpoint with no parameters to avoid SQL errors
      const response = await apiRequest("GET", `/api/prompts/random`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const randomPrompt: Prompt = await response.json();
      
      if (randomPrompt) {
        console.log("Got random prompt:", randomPrompt);
        
        // FIRST update the level and intensity BEFORE setting the current prompt
        // This ensures UI consistency
        
        // Save the values from the random prompt
        const newLevel = randomPrompt.level;
        const newIntensity = randomPrompt.intensity;
        
        // 1. First update the state variables directly
        setLevel(newLevel);
        setIntensity(newIntensity);
        
        // 2. Then update the current prompt
        setCurrentPrompt(randomPrompt);
        setUsedPromptIds(prev => [...prev, randomPrompt.id]);
        
        // 3. Update persistent storage
        markPromptAsUsed(randomPrompt.id);
        
        // 4. Finally update the backend if we have a session
        if (sessionId) {
          updateSession.mutate({ 
            usedPromptIds: [...usedPromptIds, randomPrompt.id],
            currentLevel: newLevel,
            currentIntensity: newIntensity
          });
        }
        
        return true; // Successfully got a random prompt
      }
      return false;
    } catch (error) {
      console.error("Random prompt error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch a random prompt",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Complete activity break
  const completeActivityBreak = useMutation({
    mutationFn: async () => {
      if (!sessionId || !currentActivityBreak) return null;
      const res = await apiRequest("POST", `/api/game-sessions/${sessionId}/activity-breaks/${currentActivityBreak.id}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Activity Break Completed",
        description: "Great job completing the activity!",
      });
      
      // Move to the next content
      getNextContent();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete activity break",
        variant: "destructive",
      });
    },
  });
  
  // Complete reflection pause
  const completeReflectionPause = useMutation({
    mutationFn: async () => {
      if (!sessionId || !currentReflectionPause) return null;
      const res = await apiRequest("POST", `/api/game-sessions/${sessionId}/reflection-pauses/${currentReflectionPause.id}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reflection Pause Completed",
        description: "Time to continue the game!",
      });
      
      // Move to the next content
      getNextContent();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete reflection pause",
        variant: "destructive",
      });
    },
  });
  
  const updateTimeSpent = useMutation({
    mutationFn: async (timeSpent: number) => {
      if (!sessionId) return null;
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/time-spent`, { timeSpent });
      return res.json();
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}`] });
      }
    },
  });
  
  const updateLevelStatistics = useMutation({
    mutationFn: async () => {
      if (!sessionId) return null;
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/level-stats`, { 
        level: currentLevel, 
        intensity: currentIntensity 
      });
      return res.json();
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}`] });
      }
    },
  });

  const recordFullHouse = useMutation({
    mutationFn: async () => {
      if (!sessionId) return null;
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/full-house`, {});
      return res.json();
    }
  });

  const recordPromptAnswered = useMutation({
    mutationFn: async () => {
      if (!sessionId) return null;
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/prompt-answered`, {});
      return res.json();
    }
  });

  // Toggle drinking game setting
  const toggleDrinkingGame = () => {
    setIsDrinkingGame(prev => !prev);
  };

  // Custom setLevel function with side effects
  const setLevelCustom = (level: number) => {
    console.log(`Setting level to ${level}`);
    // Update the state
    setLevel(level);
    // Invalidate the query to force refresh
    queryClient.invalidateQueries({
      queryKey: [`/api/prompts?level=${level}&intensity=${currentIntensity}`],
    });
    // Refresh prompts immediately
    refetchPrompts();
  };
  
  // Custom setIntensity function with side effects
  const setIntensityCustom = (intensity: number) => {
    console.log(`Setting intensity to ${intensity}`);
    // Update the state
    setIntensity(intensity);
    // Invalidate the query to force refresh
    queryClient.invalidateQueries({
      queryKey: [`/api/prompts?level=${currentLevel}&intensity=${intensity}`],
    });
    // Refresh prompts immediately
    refetchPrompts();
  };
  
  // Explicitly update session with level and intensity
  const updateSessionLevelIntensity = (level: number, intensity: number) => {
    if (sessionId) {
      updateSession.mutate({ 
        currentLevel: level, 
        currentIntensity: intensity
      });
    }
  };
  
  // Effect to update session when drinking game setting changes
  useEffect(() => {
    if (sessionId) {
      updateSession.mutate({ 
        isDrinkingGame
      });
    }
  }, [isDrinkingGame, sessionId]);

  // Effect to update prompt when prompts are loaded
  useEffect(() => {
    if (!currentPrompt && prompts && prompts.length > 0) {
      getNextPrompt();
    }
  }, [prompts, currentPrompt]);

  // Get the most engaged intensity level from the game stats
  const getMostEngagedIntensity = (session: GameSession): number => {
    const levelStats = session.levelStats as Record<string, number> || {};
    let maxCount = 0;
    let mostEngagedIntensity = 1;
    
    // Analyze all level-intensity combinations
    Object.entries(levelStats).forEach(([key, count]) => {
      // Key format is "level-intensity"
      const intensity = parseInt(key.split('-')[1]);
      if (count > maxCount) {
        maxCount = count;
        mostEngagedIntensity = intensity;
      }
    });
    
    return mostEngagedIntensity;
  };
  
  // Record prompt time spent
  const recordTimeSpent = (seconds: number) => {
    if (sessionId && seconds > 0) {
      updateTimeSpent.mutate(seconds);
    }
  };
  
  // Record full house moment with confetti celebration
  const recordFullHouseMoment = () => {
    if (sessionId) {
      recordFullHouse.mutate();
      updateLevelStatistics.mutate();
    }
  };
  
  // Record when a prompt is answered and the group moves to the next one
  const recordPromptComplete = () => {
    if (sessionId) {
      recordPromptAnswered.mutate();
    }
  };

  return {
    // State
    currentLevel,
    currentIntensity,
    currentDeck,
    isDrinkingGame,
    currentPrompt,
    currentActivityBreak,
    currentReflectionPause,
    contentType,
    sessionId,
    usedPromptIds,
    promptsShown,
    isLoadingPrompts,
    
    // State setters
    setLevel: setLevelCustom,  // Use our custom function with side effects
    setIntensity: setIntensityCustom,  // Use our custom function with side effects
    setCurrentDeck,
    setIsDrinkingGame,
    
    // Actions
    startNewGame,
    getNextContent,
    getNextPrompt,
    getRandomPrompt,
    resetUsedPrompts,
    
    // Game content actions
    completeActivityBreak,
    completeReflectionPause,
    
    // Game statistics
    updateTimeSpent,
    updateLevelStatistics,
    toggleDrinkingGame,
    updateSessionLevelIntensity,
    recordTimeSpent,
    recordFullHouseMoment,
    recordPromptComplete,
    getMostEngagedIntensity
  };
}
