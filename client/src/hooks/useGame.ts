import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Prompt, type GameSession } from "@shared/schema";
import { fallbackPrompts, getLevelName } from "@/lib/gameData";
import { getUsedPromptIds, markPromptAsUsed } from "@/lib/utils";

export function useGame() {
  const [currentLevel, setLevel] = useState<number>(1);
  const [currentIntensity, setIntensity] = useState<number>(1);
  const [isDrinkingGame, setIsDrinkingGame] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [usedPromptIds, setUsedPromptIds] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Load used prompts from localStorage on mount
  useEffect(() => {
    const storedIds = getUsedPromptIds();
    setUsedPromptIds(storedIds);
  }, []);

  // Fetch prompts, excluding already used ones
  const { data: prompts, isLoading: isLoadingPrompts } = useQuery<Prompt[]>({
    queryKey: [`/api/prompts?level=${currentLevel}&intensity=${currentIntensity}`, usedPromptIds],
    enabled: !!currentLevel && !!currentIntensity,
    queryFn: async () => {
      // Convert used prompt IDs to a query string
      const excludeIdsParam = usedPromptIds.length > 0 
        ? `&excludeIds=${usedPromptIds.join('&excludeIds=')}` 
        : '';
      
      const response = await apiRequest(
        "GET", 
        `/api/prompts?level=${currentLevel}&intensity=${currentIntensity}${excludeIdsParam}`
      );
      return response.json();
    }
  });

  // Create new game session
  const createSession = useMutation({
    mutationFn: async (data: { currentLevel: number; currentIntensity: number; isDrinkingGame: boolean }) => {
      // Include the createdAt field
      const sessionData = {
        ...data,
        createdAt: new Date().toISOString()
      };
      const res = await apiRequest("POST", "/api/sessions", sessionData);
      return res.json();
    },
    onSuccess: (data: GameSession) => {
      setSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${data.id}`] });
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
    
    // Create new session in the backend
    createSession.mutate({
      currentLevel,
      currentIntensity,
      isDrinkingGame,
    });
    
    // Initialize with first prompt
    getNextPrompt();
  };

  // Get next prompt
  const getNextPrompt = () => {
    let availablePrompts: Prompt[] = [];
    
    if (prompts && prompts.length > 0) {
      // Filter prompts not yet used in the current session
      availablePrompts = prompts.filter(
        prompt => !usedPromptIds.includes(prompt.id)
      );
    }
    
    // If we run out of prompts in the current session, reset session IDs but avoid the most recent one
    if (availablePrompts.length === 0) {
      const mostRecentId = currentPrompt?.id;
      setUsedPromptIds(mostRecentId ? [mostRecentId] : []);
      
      // Check if we've seen all prompts in this level/intensity in localStorage
      const storedUsedIds = getUsedPromptIds();
      const allUsedInLocalStorage = prompts && prompts.every(prompt => storedUsedIds.includes(prompt.id));
      
      if (allUsedInLocalStorage && prompts && prompts.length > 0) {
        // Show toast message that all prompts have been seen at this level
        toast({
          title: "All prompts seen!",
          description: `You've seen all prompts at this level and intensity. Consider increasing the level or intensity, or reset used prompts in the Game Menu.`,
        });
      }
      
      if (prompts && prompts.length > 0) {
        availablePrompts = prompts.filter(
          prompt => prompt.id !== mostRecentId
        );
      } else {
        // Use fallback prompts if API fails
        availablePrompts = fallbackPrompts
          .filter(p => p.level === currentLevel && (p.intensity || 1) <= currentIntensity)
          .map((p, index) => ({
            id: index,
            text: p.text || "Prompt not available",
            level: p.level || 1,
            intensity: p.intensity || 1,
            category: p.category || getLevelName(p.level || 1),
            isCustom: false,
            userId: null
          }));
      }
    }
    
    // Select random prompt
    if (availablePrompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePrompts.length);
      const newPrompt = availablePrompts[randomIndex];
      
      setCurrentPrompt(newPrompt);
      setUsedPromptIds(prev => [...prev, newPrompt.id]);
      
      // Track in localStorage for long-term persistence
      markPromptAsUsed(newPrompt.id);
      
      // Update session in backend
      if (sessionId) {
        updateSession.mutate({ 
          usedPromptIds: [...usedPromptIds, newPrompt.id] 
        });
      }
    }
  };
  
  // Get a completely random prompt (from any level or intensity)
  const getRandomPrompt = async () => {
    try {
      // Get used prompt IDs from localStorage to exclude
      const storedUsedIds = getUsedPromptIds();
      
      // Construct the query to exclude used prompts
      const excludeIdsParam = storedUsedIds.length > 0 
        ? `?excludeIds=${storedUsedIds.join('&excludeIds=')}` 
        : '';
      
      const response = await apiRequest("GET", `/api/prompts/random${excludeIdsParam}`);
      const randomPrompt: Prompt = await response.json();
      
      if (randomPrompt) {
        // Set the current prompt
        setCurrentPrompt(randomPrompt);
        setUsedPromptIds(prev => [...prev, randomPrompt.id]);
        
        // Mark as used in localStorage for long-term persistence
        markPromptAsUsed(randomPrompt.id);
        
        // Update the level and intensity to match the random prompt
        setLevel(randomPrompt.level);
        setIntensity(randomPrompt.intensity);
        
        // Update session in backend
        if (sessionId) {
          updateSession.mutate({ 
            usedPromptIds: [...usedPromptIds, randomPrompt.id],
            currentLevel: randomPrompt.level,
            currentIntensity: randomPrompt.intensity
          });
        }
        
        // Show toast
        toast({
          title: "Random Prompt",
          description: `Switched to ${getLevelName(randomPrompt.level)} prompt with intensity ${randomPrompt.intensity}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch a random prompt",
        variant: "destructive",
      });
      
      // Fallback to normal getNextPrompt if the random API fails
      getNextPrompt();
    }
  };
  
  // Game statistics mutations
  const recordFullHouse = useMutation({
    mutationFn: async () => {
      if (!sessionId) return null;
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/full-house`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Full House!",
        description: "Everyone has shared! Great participation!",
      });
      
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}`] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record full house moment",
        variant: "destructive",
      });
    },
  });
  
  const recordPromptAnswered = useMutation({
    mutationFn: async () => {
      if (!sessionId) return null;
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/prompt-answered`, {});
      return res.json();
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}`] });
      }
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

  // Toggle drinking game setting
  const toggleDrinkingGame = () => {
    setIsDrinkingGame(prev => !prev);
  };

  // Effect to update session when level or intensity changes
  useEffect(() => {
    if (sessionId) {
      updateSession.mutate({ 
        currentLevel, 
        currentIntensity,
        isDrinkingGame,
      });
    }
  }, [currentLevel, currentIntensity, isDrinkingGame, sessionId]);

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
    currentLevel,
    currentIntensity,
    isDrinkingGame,
    currentPrompt,
    usedPromptIds,
    isLoadingPrompts,
    sessionId,
    startNewGame,
    getNextPrompt,
    getRandomPrompt,
    setLevel,
    setIntensity,
    toggleDrinkingGame,
    recordTimeSpent,
    recordFullHouseMoment,
    recordPromptComplete,
    getMostEngagedIntensity
  };
}
