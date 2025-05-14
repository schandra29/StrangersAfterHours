import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Prompt, type GameSession } from "@shared/schema";
import { fallbackPrompts, getLevelName } from "@/lib/gameData";

export function useGame() {
  const [currentLevel, setLevel] = useState<number>(1);
  const [currentIntensity, setIntensity] = useState<number>(1);
  const [isDrinkingGame, setIsDrinkingGame] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [usedPromptIds, setUsedPromptIds] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prompts
  const { data: prompts, isLoading: isLoadingPrompts } = useQuery<Prompt[]>({
    queryKey: [`/api/prompts?level=${currentLevel}&intensity=${currentIntensity}`],
    enabled: !!currentLevel && !!currentIntensity,
  });

  // Create new game session
  const createSession = useMutation({
    mutationFn: async (data: { currentLevel: number; currentIntensity: number; isDrinkingGame: boolean }) => {
      const res = await apiRequest("POST", "/api/sessions", data);
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
      // Filter prompts not yet used
      availablePrompts = prompts.filter(
        prompt => !usedPromptIds.includes(prompt.id)
      );
    }
    
    // If we run out of prompts, reset used IDs but avoid the most recent one
    if (availablePrompts.length === 0) {
      const mostRecentId = currentPrompt?.id;
      setUsedPromptIds(mostRecentId ? [mostRecentId] : []);
      
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
      const response = await apiRequest("GET", "/api/prompts/random");
      const randomPrompt: Prompt = await response.json();
      
      if (randomPrompt) {
        // Set the current prompt
        setCurrentPrompt(randomPrompt);
        setUsedPromptIds(prev => [...prev, randomPrompt.id]);
        
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

  return {
    currentLevel,
    currentIntensity,
    isDrinkingGame,
    currentPrompt,
    usedPromptIds,
    isLoadingPrompts,
    startNewGame,
    getNextPrompt,
    getRandomPrompt,
    setLevel,
    setIntensity,
    toggleDrinkingGame,
  };
}
