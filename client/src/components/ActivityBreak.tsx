import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type ActivityBreak as ActivityBreakType } from "@shared/schema";
import { Clock, PlayCircle, CheckCircle } from "lucide-react";

interface ActivityBreakProps {
  activityBreak: ActivityBreakType;
  onComplete: () => void;
}

export default function ActivityBreak({ activityBreak, onComplete }: ActivityBreakProps) {
  const [timeRemaining, setTimeRemaining] = useState(activityBreak.duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Calculate progress percentage
  const progressPercentage = Math.max(
    0,
    Math.min(100, ((activityBreak.duration - timeRemaining) / activityBreak.duration) * 100)
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
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          Activity Break!
        </CardTitle>
        <CardDescription className="text-lg font-medium">
          Time to move around a bit
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">{activityBreak.title}</h3>
          <p className="text-gray-700 dark:text-gray-300">{activityBreak.description}</p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
      </CardContent>
      
      <CardFooter className="flex justify-center gap-3 pt-2">
        {!isActive && !isCompleted && (
          <Button 
            onClick={handleStart}
            className="bg-amber-500 hover:bg-amber-600 text-white"
            size="lg"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Activity
          </Button>
        )}
        
        {isActive && !isCompleted && (
          <Button 
            onClick={handleSkip}
            variant="outline"
            size="lg"
          >
            Skip
          </Button>
        )}
        
        {isCompleted && (
          <Button 
            onClick={handleComplete}
            className="bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Continue Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
