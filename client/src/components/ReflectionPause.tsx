import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type ReflectionPause as ReflectionPauseType } from "@shared/schema";
import { Clock, ArrowRight } from "lucide-react";

// Custom ThoughtBubble icon since it's not in Lucide
function ThoughtBubble(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 4a5 5 0 0 0-5-5c-4 0-7 3-7 7a1 1 0 0 1-1 1H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h6a5 5 0 0 0 5-5 3 3 0 0 0-3-3" />
      <circle cx="20" cy="9" r="1" />
      <circle cx="22" cy="4" r="1" />
    </svg>
  );
}

interface ReflectionPauseProps {
  reflectionPause: ReflectionPauseType;
  onComplete: () => void;
}

export default function ReflectionPause({ reflectionPause, onComplete }: ReflectionPauseProps) {
  // Use reflectionPause.duration (from schema) instead of reflectionPause.durationSeconds
  // Use reflectionPause.title (from schema) as the question
  const [timeRemaining, setTimeRemaining] = useState(reflectionPause.duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answer, setAnswer] = useState("");
  
  // Calculate progress percentage
  const progressPercentage = Math.max(
    0,
    Math.min(100, ((reflectionPause.duration - timeRemaining) / reflectionPause.duration) * 100)
  );

  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime: number) => {
          if (prevTime <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      setIsCompleted(true);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining]);

  const handleStart = () => {
    setIsActive(true);
  };
  
  const handleSkip = () => {
    setIsActive(false);
    setIsCompleted(true);
    setTimeRemaining(0);
  };
  
  const handleComplete = () => {
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/20 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Reflection Moment
        </CardTitle>
        <CardDescription className="text-lg font-medium">
          Take a moment to reflect...
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-4">{reflectionPause.title}</h3>
          {reflectionPause.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{reflectionPause.description}</p>
          )}
          
          <textarea
            className="w-full p-3 border border-indigo-200 dark:border-indigo-800 rounded-md bg-white/80 dark:bg-indigo-950/50"
            placeholder="Type your thoughts here... (optional)"
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!isActive}
          />
        </div>
        
        <div className="flex items-center justify-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
        </div>
        
        <Progress value={progressPercentage} className="h-2 bg-indigo-100 dark:bg-indigo-900">
          <div className="h-full bg-indigo-500" style={{ width: `${progressPercentage}%` }} />
        </Progress>
      </CardContent>
      
      <CardFooter className="flex justify-center gap-3 pt-2">
        {!isActive && !isCompleted && (
          <Button 
            onClick={handleStart}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
            size="lg"
          >
            <ThoughtBubble className="mr-2 h-5 w-5" />
            Begin Reflection
          </Button>
        )}
        
        {isActive && !isCompleted && (
          <Button 
            onClick={handleSkip}
            variant="outline"
            className="border-indigo-300 dark:border-indigo-700"
            size="lg"
          >
            Skip
          </Button>
        )}
        
        {isCompleted && (
          <Button 
            onClick={handleComplete}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
            size="lg"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Continue Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
