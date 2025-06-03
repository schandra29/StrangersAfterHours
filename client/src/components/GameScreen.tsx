import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { type Prompt, type ActivityBreak, type ReflectionPause } from "@shared/schema";
import Confetti from "react-confetti";
import { useIsMobile } from "@/hooks/use-mobile";
import { getLevelName, getIntensityName } from "@/lib/gameData";
import { getCompletionPercentage } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface GameScreenProps {
  currentLevel: number;
  currentIntensity: number;
  currentPrompt: Prompt | null;
  currentActivityBreak: ActivityBreak | null;
  currentReflectionPause: ReflectionPause | null;
  contentType: 'prompt' | 'activity-break' | 'reflection-pause';
  isDrinkingGame: boolean;
  isLoadingPrompts: boolean; // Added to show loading state
  onMenu: () => void;
  onNextContent: () => void;
  onCompleteActivityBreak: () => void;
  onCompleteReflectionPause: () => void;
  onChallenge: (type: "Dare" | "R-Rated Dare" | "Take a Sip") => void;
  onLevelChange: (type: "level" | "intensity") => void;
  onRandomPrompt: () => void;
  onEndGame?: () => void;
  onRecordTimeSpent?: (seconds: number) => void;
  onShowStats?: () => void; // Added for stats modal
}

export default function GameScreen({
  currentLevel,
  currentIntensity,
  currentPrompt,
  currentActivityBreak,
  currentReflectionPause,
  contentType,
  isDrinkingGame,
  isLoadingPrompts,
  onMenu,
  onNextContent,
  onCompleteActivityBreak,
  onCompleteReflectionPause,
  onChallenge,
  onLevelChange,
  onRandomPrompt,
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
  
  // Handle activity break completion
  const handleCompleteActivityBreak = () => {
    // Stop the timer if it's running and record the time
    if (isTimerRunning && onRecordTimeSpent) {
      stopTimer();
      onRecordTimeSpent(timeElapsed);
    }
    
    // Show confetti for celebration
    setShowConfetti(true);
    onCompleteActivityBreak();
    
    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };
  
  // Handle reflection pause completion
  const handleCompleteReflectionPause = () => {
    // Stop the timer if it's running and record the time
    if (isTimerRunning && onRecordTimeSpent) {
      stopTimer();
      onRecordTimeSpent(timeElapsed);
    }
    
    onCompleteReflectionPause();
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
        <div className="flex items-center gap-2">
          <button 
            className="text-white bg-card/50 rounded-full p-2 hover:bg-card/70"
            onClick={onMenu}
          >
            <i className="ri-menu-line"></i>
          </button>
        </div>
      </div>
      
      {/* Main content card - could be prompt, activity break, or reflection pause */}
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {contentType === 'prompt' && (
            <>
              {/* Level/Intensity indicator for prompts */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {getLevelName(currentLevel)} · {getIntensityName(currentIntensity)}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Level {currentLevel} · Intensity {currentIntensity}
                </div>
              </div>
              
              {/* Prompt text */}
              <div className="text-center">
                {isLoadingPrompts ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {currentPrompt?.text || "No prompt available"}
                  </h2>
                )}
              </div>
            </>
          )}
          
          {contentType === 'activity-break' && (
            <>
              {/* Activity Break header */}
              <div className="flex justify-center items-center mb-4">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ACTIVITY BREAK
                </div>
              </div>
              
              {/* Activity Break content */}
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentActivityBreak?.title || "Time for an activity!"}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {currentActivityBreak?.description || "Let's take a break and do something fun together!"}
                </p>
                <Button 
                  onClick={handleCompleteActivityBreak}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Complete Activity
                </Button>
              </div>
            </>
          )}
          
          {contentType === 'reflection-pause' && (
            <>
              {/* Reflection Pause header */}
              <div className="flex justify-center items-center mb-4">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  REFLECTION PAUSE
                </div>
              </div>
              
              {/* Reflection Pause content */}
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentReflectionPause?.title || "Time to reflect"}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {currentReflectionPause?.description || "Take a moment to reflect on the conversations you've had so far."}
                </p>
                <Button 
                  onClick={handleCompleteReflectionPause}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Continue Playing
                </Button>
              </div>
            </>
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
        
        {/* Action buttons - only show for prompts */}
        {contentType === 'prompt' && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button 
                onClick={onNextContent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next Prompt
              </Button>
              
              <Button 
                onClick={onMenu}
                variant="outline"
                className="w-full"
              >
                Game Menu
              </Button>
            </div>
            
            {/* Challenge buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onChallenge("Dare")}
                variant="outline"
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              >
                Dare
              </Button>
              
              <Button 
                onClick={() => onChallenge(isDrinkingGame ? "Take a Sip" : "R-Rated Dare")}
                variant="outline"
                className={`w-full ${isDrinkingGame 
                  ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white" 
                  : "border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"}`}
              >
                {isDrinkingGame ? "Take a Sip" : "R-Rated Dare"}
              </Button>
            </div>
            
            {/* Special action buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onLevelChange("level")}
                variant="outline"
                className="w-full border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
              >
                Change Level
              </Button>
              
              <Button 
                onClick={onRandomPrompt}
                variant="outline"
                className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >
                Random Prompt
              </Button>
            </div>
          </>
        )}
        
        {/* Menu button for activity breaks and reflection pauses */}
        {(contentType === 'activity-break' || contentType === 'reflection-pause') && (
          <div className="mt-4">
            <Button 
              onClick={onMenu}
              variant="outline"
              className="w-full"
            >
              Game Menu
            </Button>
          </div>
        )}
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
