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
    const success = await game.getRandomPrompt();
    if (success) {
      toast({
        title: "Random Prompt",
        description: `Switched to ${getLevelName(game.currentLevel)} prompt with intensity ${game.currentIntensity}`,
      });
    }
  };

  const handleRestartGame = () => {
    setCurrentScreen("setup");
    setShowGameMenu(false);
  };

  const handleConfirmLevelUp = (type: "level" | "intensity") => {
    // Get the final values AFTER they've been applied in the modal
    // This ensures we're showing the user the actual values that will be used
    setTimeout(() => {
      const finalLevel = game.currentLevel;
      const finalIntensity = game.currentIntensity;
      
      console.log(`Level/Intensity confirmed as: Level ${finalLevel}/Intensity ${finalIntensity}`);
      
      // Add a toast to confirm the change to the user
      toast({
        title: "Settings Updated",
        description: `Now showing ${getLevelName(finalLevel)} prompts with intensity ${finalIntensity}`,
      });
      
      // Force a fresh prompt with the updated settings 
      game.getNextPrompt();
    }, 100); // Small delay to ensure state has been updated
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
      </div>
    </div>
  );
}
