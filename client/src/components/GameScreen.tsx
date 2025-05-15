import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { type Prompt } from "@shared/schema";
import Confetti from "react-confetti";
import { useIsMobile } from "@/hooks/use-mobile";
import { getLevelName, getIntensityName } from "@/lib/gameData";
import { getCompletionPercentage } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface GameScreenProps {
  currentLevel: number;
  currentIntensity: number;
  currentPrompt: Prompt | null;
  isDrinkingGame: boolean;
  isLoadingPrompts: boolean; // Added to show loading state
  onMenu: () => void;
  onNextPrompt: () => void;
  onChallenge: (type: "Dare" | "R-Rated Dare" | "Take a Sip") => void;
  onLevelChange: (type: "level" | "intensity") => void;
  onRandomPrompt: () => void;
  onFullHouse?: () => void;
  onEndGame?: () => void;
  onRecordTimeSpent?: (seconds: number) => void;
  onShowStats?: () => void; // Added for stats modal
}

export default function GameScreen({
  currentLevel,
  currentIntensity,
  currentPrompt,
  isDrinkingGame,
  isLoadingPrompts,
  onMenu,
  onNextPrompt,
  onChallenge,
  onLevelChange,
  onRandomPrompt,
  onFullHouse,
  onEndGame,
  onRecordTimeSpent,
  onShowStats
}: GameScreenProps) {
  const isMobile = useIsMobile();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerInterval = useRef<number | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(getCompletionPercentage());

  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);
  
  // Update progress percentage when a new prompt is loaded
  useEffect(() => {
    if (!isLoadingPrompts && currentPrompt) {
      setProgressPercentage(getCompletionPercentage());
    }
  }, [isLoadingPrompts, currentPrompt]);

  // Reset timer when moving to a new prompt
  useEffect(() => {
    // Record the time spent on the previous prompt if there was any
    if (timeElapsed > 0 && onRecordTimeSpent) {
      onRecordTimeSpent(timeElapsed);
    }
    
    stopTimer();
    setTimeElapsed(0);
  }, [currentPrompt]);
  
  // Handle full house celebration
  const handleFullHouse = () => {
    if (onFullHouse) {
      // Stop the timer if it's running and record the time
      if (isTimerRunning && onRecordTimeSpent) {
        stopTimer();
        onRecordTimeSpent(timeElapsed);
      }
      
      // Show confetti and trigger the full house celebration
      setShowConfetti(true);
      onFullHouse();
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  };

  const startTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    setIsTimerRunning(true);
    const startTime = Date.now() - timeElapsed * 1000;
    
    timerInterval.current = window.setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <>
      {/* Confetti effect for full house moments */}
      {showConfetti && (
        <Confetti
          width={isMobile ? window.innerWidth : window.innerWidth * 0.8}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={isMobile ? 100 : 200}
          gravity={0.2}
        />
      )}
      
      {/* Floating Progress Indicator */}
      {onShowStats && (
        <button 
          onClick={onShowStats}
          className="fixed bottom-6 right-6 z-50 bg-primary/90 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg hover:bg-primary transition-colors"
          aria-label="View Progress"
        >
          <div className="text-xs font-semibold">{progressPercentage}%</div>
          <Progress 
            value={progressPercentage} 
            className="w-8 h-1.5 mt-1 bg-white/20" 
          />
        </button>
      )}
    
      {/* Game Status Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <span className="bg-primary/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            Level: <span>{getLevelName(currentLevel)}</span>
          </span>
          <span className="bg-secondary/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            Intensity: <span>{getIntensityName(currentIntensity)}</span>
          </span>
        </div>
        <button 
          className="text-white bg-card/50 rounded-full p-2"
          onClick={onMenu}
        >
          <i className="ri-menu-line"></i>
        </button>
      </div>
      
      {/* Prompt Card */}
      <div className="card bg-card/90 rounded-3xl p-8 mb-6 border border-primary/20 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 rounded-full py-1 px-4 text-sm text-white font-bold">
              {currentPrompt?.category || "Icebreaker"}
            </div>
          </div>
          {isLoadingPrompts ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">Loading new prompt...</p>
            </div>
          ) : (
            <h2 className="font-prompt font-semibold text-3xl text-white leading-tight">
              {currentPrompt?.text || "If you could have dinner with any historical figure, who would it be and why?"}
            </h2>
          )}
        </div>
        
        {/* Timer Display */}
        {timeElapsed > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-2 mb-4 flex justify-center">
            <div className="text-2xl font-mono text-white">
              {formatTime(timeElapsed)}
            </div>
          </div>
        )}
        
        {/* Timer Controls */}
        {!isTimerRunning ? (
          timeElapsed === 0 ? (
            <Button
              className="btn-secondary w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center mb-4"
              onClick={startTimer}
            >
              <i className="ri-timer-line mr-2"></i> Start Timer
            </Button>
          ) : (
            <div className="mb-4">
              <p className="text-center text-white mb-2">Timer stopped at {formatTime(timeElapsed)}</p>
            </div>
          )
        ) : (
          <Button
            className="btn-secondary w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center mb-4"
            onClick={stopTimer}
          >
            <i className="ri-stop-circle-line mr-2"></i> Stop Timer
          </Button>
        )}
        
        {/* Full house celebration button */}
        <Button
          className="btn-secondary w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center mb-4"
          onClick={handleFullHouse}
        >
          <i className="ri-group-line mr-2"></i> Full-house!
        </Button>
        
        <Button
          className="btn-primary w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center mb-3"
          onClick={onNextPrompt}
        >
          <i className="ri-arrow-right-line mr-2"></i> Next Prompt
        </Button>
        
        {/* Game Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onLevelChange("level")}
          >
            <i className="ri-game-line mb-1 text-xl block"></i>
            <span className="block text-sm font-medium leading-tight">Select Level/<wbr/>Intensity</span>
          </button>
          <button 
            className="bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-center relative overflow-hidden group"
            onClick={() => onRandomPrompt()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <i className="ri-magic-line mb-1 text-xl block relative z-10"></i>
            <span className="block text-sm font-medium leading-tight relative z-10">Take a Chance</span>
          </button>
        </div>
      </div>
      
      {/* Challenge Section */}
      <div className="card bg-secondary/10 rounded-3xl p-6 mb-6 border border-secondary/20">
        <h3 className="font-heading font-bold text-xl text-white mb-4">If you don't want to answer, select one of these options</h3>
        <p className="text-gray-300 mb-4">Instead of answering the prompt, you can choose to:</p>
        
        <div className={`grid ${isDrinkingGame ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
          <button 
            className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onChallenge("Dare")}
          >
            <i className="ri-questionnaire-line mb-1 text-xl block"></i>
            <span className="block font-medium">Dare</span>
          </button>
          <button 
            className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onChallenge("R-Rated Dare")}
          >
            <i className="ri-fire-line mb-1 text-xl block"></i>
            <span className="block font-medium">R-Rated Dare</span>
          </button>
          {isDrinkingGame && (
            <button 
              className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
              onClick={() => onChallenge("Take a Sip")}
            >
              <i className="ri-goblet-line mb-1 text-xl block"></i>
              <span className="block font-medium">Take a Sip</span>
            </button>
          )}
        </div>
        
        <div className="text-sm text-center text-gray-400">
          You can return to answering the prompt anytime
        </div>
      </div>
      
      {/* End Game Section */}
      <div className="card bg-primary/10 rounded-3xl p-4 border border-primary/20">
        {/* End Game Button */}
        {onEndGame && (
          <Button
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold py-3 px-4"
            onClick={onEndGame}
          >
            <i className="ri-award-line mr-2"></i> End Game & View Summary
          </Button>
        )}
      </div>
    </>
  );
}
