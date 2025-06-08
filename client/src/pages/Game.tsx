import { useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import GameScreen from '@/components/GameScreen';
import ActivityBreak from '@/components/ActivityBreak';
import ReflectionPause from '@/components/ReflectionPause';
import UnlockablePackModal from '@/components/UnlockablePackModal';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function GamePage() {
  const {
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
  } = useGameState();
  
  const [showMenu, setShowMenu] = useState(false);
  const [location, setLocation] = useLocation();
  // Handle errors - redirect to home if critical error occurs
  useEffect(() => {
    if (error) {
      console.error('Game error:', error);
      // If it's a critical error that prevents play, redirect
      if (error.includes('initialize') || error.includes('authentication')) {
        setTimeout(() => setLocation('/'), 3000);
      }
    }
  }, [error, setLocation]);

  // Handle onChallenge actions
  const handleChallenge = (type: "Dare" | "R-Rated Dare" | "Take a Sip") => {
    // Implement any special challenge handling here
    console.log(`Challenge accepted: ${type}`);
    // Then move to next prompt
    handleNextContent();
  };
  
  // Handle level changes
  const handleLevelChange = (type: "level" | "intensity") => {
    if (type === "level") {
      const newLevel = gameState.level < 3 ? gameState.level + 1 : 1;
      handleSetLevel(newLevel);
    } else {
      const newIntensity = gameState.intensity < 3 ? gameState.intensity + 1 : 1;
      handleSetIntensity(newIntensity);
    }
  };
  
  // Handle time tracking
  const handleRecordTimeSpent = (seconds: number) => {
    // In a production app, you might want to record this to analytics
    console.log(`Time spent on prompt: ${seconds} seconds`);
  };

  if (isLoading && !gameState.currentPrompt && !gameState.currentActivityBreak && !gameState.currentReflectionPause) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="mt-4 text-lg font-medium">Loading your game...</p>
      </div>
    );
  }

  if (error && (error.includes('initialize') || error.includes('authentication'))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-950">
        <p className="mb-4 text-lg font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Redirecting to home...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Main Game Screen */}
      <GameScreen
        currentLevel={gameState.level}
        currentIntensity={gameState.intensity}
        currentPrompt={gameState.currentPrompt}
        currentActivityBreak={gameState.currentActivityBreak}
        currentReflectionPause={gameState.currentReflectionPause}
        contentType={gameState.contentType}
        isDrinkingGame={false} // Set based on your game mode
        isLoadingPrompts={isLoading}
        onMenu={() => setShowMenu(true)}
        onNextContent={handleNextContent}
        onCompleteActivityBreak={handleCompleteActivityBreak}
        onCompleteReflectionPause={handleCompleteReflectionPause}
        onChallenge={handleChallenge}
        onLevelChange={handleLevelChange}
        onRandomPrompt={handleNextContent}
        onEndGame={() => setLocation('/')}
        onRecordTimeSpent={handleRecordTimeSpent}
        onShowStats={() => console.log('Show stats')}
      />
      
      {/* Activity Break Component - can be shown inline within GameScreen */}
      {gameState.contentType === 'activity-break' && gameState.currentActivityBreak && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <ActivityBreak 
            activityBreak={gameState.currentActivityBreak}
            onComplete={handleCompleteActivityBreak}
          />
        </div>
      )}
      
      {/* Reflection Pause Component - can be shown inline within GameScreen */}
      {gameState.contentType === 'reflection-pause' && gameState.currentReflectionPause && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <ReflectionPause
            reflectionPause={gameState.currentReflectionPause}
            onComplete={handleCompleteReflectionPause}
          />
        </div>
      )}
      
      {/* Unlockable Pack Modal */}
      {unlockablePack && (
        <UnlockablePackModal
          pack={unlockablePack}
          isOpen={Boolean(unlockablePack)}
          onClose={handleDismissUnlockablePack}
          onUnlock={handleUnlockPack}
        />
      )}
      
      {/* Menu Modal could be added here */}
    </>
  );
}
