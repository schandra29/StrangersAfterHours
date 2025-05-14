import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import SetupScreen from "@/components/SetupScreen";
import GameScreen from "@/components/GameScreen";
import HowToPlayModal from "@/components/HowToPlayModal";
import GameMenuModal from "@/components/GameMenuModal";
import ChallengeModal from "@/components/ChallengeModal";
import LevelUpModal from "@/components/LevelUpModal";
import { useGame } from "@/hooks/useGame";

type Screen = "welcome" | "setup" | "game";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedChallengeType, setSelectedChallengeType] = useState<"Dare" | "Act It Out" | "Take a Sip">("Dare");
  
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

  const handleOpenChallenge = (type: "Dare" | "Act It Out" | "Take a Sip") => {
    setSelectedChallengeType(type);
    setShowChallenge(true);
  };

  const handleLevelChange = (type: "level" | "intensity") => {
    setShowLevelUp(true);
  };
  
  const handleRandomPrompt = () => {
    game.getRandomPrompt();
  };

  const handleRestartGame = () => {
    setCurrentScreen("setup");
    setShowGameMenu(false);
  };

  const handleConfirmLevelUp = (type: "level" | "intensity") => {
    // The level and intensity have already been updated in the LevelUpModal component
    // through the game context, so we just need to get a new prompt
    game.getNextPrompt();
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
            onMenu={() => setShowGameMenu(true)}
            onNextPrompt={game.getNextPrompt}
            onChallenge={handleOpenChallenge}
            onLevelChange={handleLevelChange}
            onRandomPrompt={handleRandomPrompt}
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
        />
        
        <ChallengeModal 
          isOpen={showChallenge}
          onClose={() => setShowChallenge(false)}
          type={selectedChallengeType}
          intensity={game.currentIntensity}
          isDrinkingGame={game.isDrinkingGame}
        />
        
        <LevelUpModal 
          isOpen={showLevelUp}
          onClose={() => setShowLevelUp(false)}
          currentLevel={game.currentLevel}
          currentIntensity={game.currentIntensity}
          onConfirm={handleConfirmLevelUp}
        />
      </div>
    </div>
  );
}
