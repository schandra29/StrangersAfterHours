import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import SetupScreen from "@/components/SetupScreen";
import GameScreen from "@/components/GameScreen";
import HowToPlayModal from "@/components/HowToPlayModal";
import GameMenuModal from "@/components/GameMenuModal";
import ChallengeModal from "@/components/ChallengeModal";
import LevelUpModal from "@/components/LevelUpModal";
import CustomChallengeForm from "@/components/CustomChallengeForm";
import GameSummaryModal from "@/components/GameSummaryModal";
import PromptStatsModal from "@/components/PromptStatsModal";
import { useGame } from "@/hooks/useGame";
import { useToast } from "@/hooks/use-toast";
import { getLevelName } from "@/lib/gameData";

type Screen = "welcome" | "setup" | "game";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showCustomChallengeForm, setShowCustomChallengeForm] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);
  const [showPromptStats, setShowPromptStats] = useState(false);
  const [selectedChallengeType, setSelectedChallengeType] = useState<"Dare" | "R-Rated Dare" | "Take a Sip">("Dare");
  
  const { toast } = useToast();
  const game = useGame();

  const handleStartGame = () => {
    setCurrentScreen("setup");
  };

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome");
  };

  const handleStartPlaying = () => {
    game.startNewGame();
    setCurrentScreen("game");
  };

  const handleOpenChallenge = (type: "Dare" | "R-Rated Dare" | "Take a Sip") => {
    setSelectedChallengeType(type);
    setShowChallenge(true);
  };

  const handleLevelChange = (type: "level" | "intensity") => {
    setShowLevelUp(true);
  };
  
  const handleRandomPrompt = async () => {
    // First show a loading toast to indicate we're getting a random prompt
    const loadingToast = toast({
      title: "Taking a Chance...",
      description: "Getting a random prompt from any level or intensity",
      duration: 1000, // Only show for 1 second
    });
    
    // Call the API to get a random prompt
    try {
      const response = await fetch('/api/prompts/random');
      
      if (!response.ok) {
        throw new Error('Failed to fetch random prompt');
      }
      
      // Get the random prompt data
      const randomPrompt = await response.json();
      
      // Check if we got a valid prompt
      if (randomPrompt && randomPrompt.id) {
        console.log("Got random prompt directly:", randomPrompt);
        
        // Explicitly update our game state with the new level/intensity from the prompt
        const newLevel = randomPrompt.level;
        const newIntensity = randomPrompt.intensity;
        
        // Update game state
        game.setLevel(newLevel);
        game.setIntensity(newIntensity);
        
        // Add a small delay to allow the state to update
        setTimeout(() => {
          // Force refresh with the new prompt
          toast({
            title: "Random Prompt",
            description: `Switched to ${getLevelName(newLevel)} (Level ${newLevel}) with intensity ${newIntensity}`,
            duration: 1000, // Only show for 1 second
          });
          
          // Force the UI to reflect the new prompt
          game.getNextPrompt();
        }, 100);
        
        return true;
      }
    } catch (error) {
      console.error("Error getting random prompt:", error);
      toast({
        title: "Error",
        description: "Failed to get a random prompt. Please try again.",
        variant: "destructive",
        duration: 3000, // Keep error messages a bit longer
      });
    }
    
    return false;
  };

  const handleRestartGame = () => {
    setCurrentScreen("setup");
    setShowGameMenu(false);
  };

  const handleConfirmLevelUp = (type: "level" | "intensity", newLevel: number, newIntensity: number) => {
    // Get the new values directly from the modal component
    console.log(`Applying changes: Level ${newLevel}, Intensity ${newIntensity}`);
    
    // Show a loading toast
    const loadingToast = toast({
      title: "Updating...",
      description: "Getting a new prompt with your updated settings",
      duration: 1000, // Only show for 1 second
    });
    
    // Update game state with the new values
    game.setLevel(newLevel);
    game.setIntensity(newIntensity);
    
    // Update the backend
    if (game.sessionId) {
      game.updateSessionLevelIntensity(newLevel, newIntensity);
    }
    
    // Wait a small moment for state updates to process
    setTimeout(() => {
      // Get a new prompt with the updated settings
      game.getNextPrompt();
      
      // Show confirmation toast to the user
      toast({
        title: "✨ New Prompt Ready",
        description: `Now showing ${getLevelName(newLevel)} prompts with intensity ${newIntensity}`,
        duration: 1000, // Only show for 1 second
      });
    }, 100);
  };
  
  const handleAddCustomChallenge = () => {
    setShowCustomChallengeForm(true);
    setShowGameMenu(false); // Close the menu when opening the form
  };
  
  // Handle full house moments - when everyone has participated
  const handleFullHouseMoment = () => {
    game.recordFullHouseMoment();
    toast({
      title: "Full House!",
      description: "Everyone participated! Great job!",
      duration: 1000, // Only show for 1 second
    });
  };
  
  // Handle end game and show summary
  const handleEndGame = () => {
    // If the timer is running, stop it and record the time
    if (game.sessionId) {
      setShowGameSummary(true);
    } else {
      toast({
        title: "Error",
        description: "No active game session found",
        variant: "destructive",
      });
    }
  };
  
  // Record time spent on prompts
  const handleRecordTimeSpent = (seconds: number) => {
    if (seconds > 0) {
      game.recordTimeSpent(seconds);
    }
  };

  return (
    <div className="min-h-screen text-foreground font-body">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {currentScreen === "welcome" && (
          <WelcomeScreen 
            onStartGame={handleStartGame} 
            onHowToPlay={() => setShowHowToPlay(true)} 
          />
        )}
        
        {currentScreen === "setup" && (
          <SetupScreen 
            selectedLevel={game.currentLevel}
            selectedIntensity={game.currentIntensity}
            isDrinkingGame={game.isDrinkingGame}
            onSelectLevel={game.setLevel}
            onSelectIntensity={game.setIntensity}
            onToggleDrinkingGame={game.toggleDrinkingGame}
            onBack={handleBackToWelcome}
            onStartPlaying={handleStartPlaying}
          />
        )}
        
        {currentScreen === "game" && (
          <GameScreen 
            currentLevel={game.currentLevel}
            currentIntensity={game.currentIntensity}
            currentPrompt={game.currentPrompt}
            isDrinkingGame={game.isDrinkingGame}
            isLoadingPrompts={game.isLoadingPrompts}
            onMenu={() => setShowGameMenu(true)}
            onNextPrompt={() => {
              game.getNextPrompt();
              game.recordPromptComplete(); // Record that a prompt was answered
            }}
            onChallenge={handleOpenChallenge}
            onLevelChange={handleLevelChange}
            onRandomPrompt={handleRandomPrompt}
            onFullHouse={handleFullHouseMoment}
            onEndGame={handleEndGame}
            onRecordTimeSpent={handleRecordTimeSpent}
            onShowStats={() => setShowPromptStats(true)}
          />
        )}
        
        <HowToPlayModal 
          isOpen={showHowToPlay} 
          onClose={() => setShowHowToPlay(false)} 
        />
        
        <GameMenuModal 
          isOpen={showGameMenu} 
          onClose={() => setShowGameMenu(false)}
          onRestart={handleRestartGame}
          onSettings={() => {
            setCurrentScreen("setup");
            setShowGameMenu(false);
          }}
          onHowToPlay={() => {
            setShowHowToPlay(true);
            setShowGameMenu(false);
          }}
          onAddCustomChallenge={handleAddCustomChallenge}
        />
        
        <ChallengeModal 
          isOpen={showChallenge}
          onClose={() => setShowChallenge(false)}
          type={selectedChallengeType}
          intensity={game.currentIntensity}
          isDrinkingGame={game.isDrinkingGame}
          onChallengeComplete={() => {
            // Get a new prompt when challenge is completed and record completion
            game.getNextPrompt();
            game.recordPromptComplete(); // Also record this prompt as completed
          }}
        />
        
        <LevelUpModal 
          isOpen={showLevelUp}
          onClose={() => setShowLevelUp(false)}
          currentLevel={game.currentLevel}
          currentIntensity={game.currentIntensity}
          onConfirm={handleConfirmLevelUp}
        />
        
        <CustomChallengeForm
          isOpen={showCustomChallengeForm}
          onClose={() => setShowCustomChallengeForm(false)}
          onSuccess={() => {
            // Show a success message or refresh challenges if needed
          }}
        />
        
        <GameSummaryModal
          isOpen={showGameSummary}
          onClose={() => setShowGameSummary(false)}
          sessionId={game.sessionId}
          onStartNewGame={() => {
            setShowGameSummary(false);
            handleRestartGame();
          }}
        />
        
        <PromptStatsModal
          isOpen={showPromptStats}
          onClose={() => setShowPromptStats(false)}
        />
      </div>
    </div>
  );
}
