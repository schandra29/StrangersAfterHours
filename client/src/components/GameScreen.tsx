import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { type Prompt } from "@shared/schema";
import Confetti from "react-confetti";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameScreenProps {
  currentLevel: number;
  currentIntensity: number;
  currentPrompt: Prompt | null;
  isDrinkingGame: boolean;
  onMenu: () => void;
  onNextPrompt: () => void;
  onChallenge: (type: "Dare" | "Act It Out" | "Take a Sip") => void;
  onLevelChange: (type: "level" | "intensity") => void;
  onRandomPrompt: () => void;
  onFullHouse?: () => void;
  onEndGame?: () => void;
  onRecordTimeSpent?: (seconds: number) => void;
}

export default function GameScreen({
  currentLevel,
  currentIntensity,
  currentPrompt,
  isDrinkingGame,
  onMenu,
  onNextPrompt,
  onChallenge,
  onLevelChange,
  onRandomPrompt,
  onFullHouse,
  onEndGame,
  onRecordTimeSpent
}: GameScreenProps) {
  const isMobile = useIsMobile();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerInterval = useRef<number | null>(null);

  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

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
  const getIntensityText = (intensity: number): string => {
    switch (intensity) {
      case 1: return "Mild";
      case 2: return "Medium";
      case 3: return "Wild";
      default: return "Mild";
    }
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
    
      {/* Game Status Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <span className="bg-primary/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            Level: <span>{currentLevel}</span>
          </span>
          <span className="bg-secondary/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            Intensity: <span>{getIntensityText(currentIntensity)}</span>
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
          <h2 className="font-prompt font-semibold text-3xl text-white leading-tight">
            {currentPrompt?.text || "If you could have dinner with any historical figure, who would it be and why?"}
          </h2>
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
          className="btn-primary w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center"
          onClick={onNextPrompt}
        >
          <i className="ri-arrow-right-line mr-2"></i> Next Prompt
        </Button>
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
            onClick={() => onChallenge("Act It Out")}
          >
            <i className="ri-emotion-laugh-line mb-1 text-xl block"></i>
            <span className="block font-medium">Act It Out</span>
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
      
      {/* Level Up Section */}
      <div className="card bg-primary/10 rounded-3xl p-6 border border-primary/20">
        <h3 className="font-heading font-bold text-xl text-white mb-4">Change Level or Intensity</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            className="bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onLevelChange("level")}
          >
            <i className="ri-game-line mb-1 text-xl block"></i>
            <span className="block font-medium">Select Level/Intensity</span>
          </button>
          <button 
            className="bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onRandomPrompt()}
          >
            <i className="ri-magic-line mb-1 text-xl block"></i>
            <span className="block font-medium">Take a Chance</span>
          </button>
        </div>
        
        <p className="text-gray-300 text-sm text-center mb-6">
          Change the experience or get a completely random prompt
        </p>
        
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
