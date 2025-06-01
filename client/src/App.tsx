import { useState } from "react";
import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AccessCodeScreen from "@/components/AccessCodeScreen";
import WelcomeScreen from "@/components/WelcomeScreen";
import SetupScreen from "@/components/SetupScreen";
import GameScreen from "@/components/GameScreen";
import ChallengeModal from "@/components/ChallengeModal";
import GameMenuModal from "@/components/GameMenuModal";
import HowToPlayModal from "@/components/HowToPlayModal";
import AboutGameModal from "@/components/AboutGameModal";
import GameSummaryModal from "@/components/GameSummaryModal";
import PromptStatsModal from "@/components/PromptStatsModal";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import { useGame } from "@/hooks/useGame";

const queryClient = new QueryClient();

function GameApp() {
  const [currentScreen, setCurrentScreen] = useState<"access" | "welcome" | "setup" | "game">("access");
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showAboutGame, setShowAboutGame] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const {
    currentLevel,
    currentIntensity,
    currentPrompt,
    isDrinkingGame,
    isLoadingPrompts,
    currentChallenge,
    setCurrentLevel,
    setCurrentIntensity,
    setIsDrinkingGame,
    loadNextPrompt,
    loadRandomPrompt,
    handleChallenge,
    closeChallenge,
    sessionId,
    restartGame,
    endGame,
    recordTimeSpent,
    handleFullHouse
  } = useGame();

  const handleAccessGranted = () => {
    setCurrentScreen("welcome");
  };

  const handleStartGame = () => {
    setCurrentScreen("setup");
  };

  const handleGameSetup = () => {
    setCurrentScreen("game");
  };

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome");
  };

  const handleMenu = () => {
    setShowGameMenu(true);
  };

  const handleRestart = () => {
    restartGame();
    setShowGameMenu(false);
    setCurrentScreen("setup");
  };

  const handleEndGame = () => {
    endGame();
    setShowGameSummary(true);
  };

  const handleStartNewGame = () => {
    setShowGameSummary(false);
    setCurrentScreen("welcome");
    restartGame();
  };

  return (
    <div className="min-h-screen text-foreground font-body">
      {currentScreen === "access" && (
        <AccessCodeScreen onAccessGranted={handleAccessGranted} />
      )}
      
      {currentScreen === "welcome" && (
        <WelcomeScreen onStartGame={handleStartGame} />
      )}
      
      {currentScreen === "setup" && (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <SetupScreen
            selectedLevel={currentLevel}
            selectedIntensity={currentIntensity}
            isDrinkingGame={isDrinkingGame}
            onSelectLevel={setCurrentLevel}
            onSelectIntensity={setCurrentIntensity}
            onToggleDrinkingGame={() => setIsDrinkingGame(!isDrinkingGame)}
            onBack={handleBackToWelcome}
            onStartPlaying={handleGameSetup}
          />
        </div>
      )}
      
      {currentScreen === "game" && (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
          <div className="max-w-2xl mx-auto py-8">
            <GameScreen
              currentLevel={currentLevel}
              currentIntensity={currentIntensity}
              currentPrompt={currentPrompt}
              isDrinkingGame={isDrinkingGame}
              isLoadingPrompts={isLoadingPrompts}
              onMenu={handleMenu}
              onNextPrompt={loadNextPrompt}
              onChallenge={handleChallenge}
              onLevelChange={() => setCurrentScreen("setup")}
              onRandomPrompt={loadRandomPrompt}
              onFullHouse={handleFullHouse}
              onEndGame={handleEndGame}
              onRecordTimeSpent={recordTimeSpent}
              onShowStats={() => setShowStats(true)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {currentChallenge && (
        <ChallengeModal
          isOpen={!!currentChallenge}
          onClose={closeChallenge}
          challenge={currentChallenge}
        />
      )}

      <GameMenuModal
        isOpen={showGameMenu}
        onClose={() => setShowGameMenu(false)}
        onRestart={handleRestart}
        onSettings={() => setCurrentScreen("setup")}
        onHowToPlay={() => setShowHowToPlay(true)}
        onAboutGame={() => setShowAboutGame(true)}
      />

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <AboutGameModal
        isOpen={showAboutGame}
        onClose={() => setShowAboutGame(false)}
      />

      <GameSummaryModal
        isOpen={showGameSummary}
        onClose={() => setShowGameSummary(false)}
        sessionId={sessionId}
        onStartNewGame={handleStartNewGame}
      />

      <PromptStatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={GameApp} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;