import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type GameSession } from "@shared/schema";
import Confetti from "react-confetti";
import { useIsMobile } from "@/hooks/use-mobile";
import { getIntensityName } from "@/lib/gameData";
import { useToast } from "@/hooks/use-toast";

interface GameSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number | null;
  onStartNewGame: () => void;
}

export default function GameSummaryModal({
  isOpen,
  onClose,
  sessionId,
  onStartNewGame
}: GameSummaryModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const formatTime = (seconds: number): string => {
    if (!seconds) return "0 minutes";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  };
  
  // Get the most engaged intensity level
  const getMostEngagedIntensityName = (session: GameSession): string => {
    const levelStats = session.levelStats as Record<string, number> || {};
    let maxCount = 0;
    let mostEngagedIntensity = 1;
    
    Object.entries(levelStats).forEach(([key, count]) => {
      const intensity = parseInt(key.split('-')[1]);
      if (count > maxCount) {
        maxCount = count;
        mostEngagedIntensity = intensity;
      }
    });
    
    return getIntensityName(mostEngagedIntensity);
  };
  
  // Fetch game session data
  const { data: session, isLoading } = useQuery<GameSession>({
    queryKey: [`/api/sessions/${sessionId}`],
    enabled: !!sessionId && isOpen,
  });
  
  // Show confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  return (
    <>
      {showConfetti && (
        <Confetti
          width={isMobile ? window.innerWidth : window.innerWidth * 0.6}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={isMobile ? 100 : 200}
          gravity={0.2}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
        <DialogContent className="bg-background/95 backdrop-blur-sm border-primary/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center mb-4">
              Game Summary
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300 text-lg mb-6">
              Thank you for playing Strangers: After Hours!
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="text-center py-8">Loading game statistics...</div>
          ) : session ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card/30 rounded-xl p-4 text-center">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">Time Spent</h3>
                  <p className="text-2xl font-bold">{formatTime(session.totalTimeSpent || 0)}</p>
                </div>
                
                <div className="bg-card/30 rounded-xl p-4 text-center">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">Prompts Answered</h3>
                  <p className="text-2xl font-bold">{session.promptsAnswered || 0}</p>
                </div>
                
                <div className="bg-card/30 rounded-xl p-4 text-center">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">Full-House Moments</h3>
                  <p className="text-2xl font-bold">{session.fullHouseMoments || 0}</p>
                </div>
                
                <div className="bg-card/30 rounded-xl p-4 text-center">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">Most Engaged Intensity</h3>
                  <p className="text-2xl font-bold">{getMostEngagedIntensityName(session)}</p>
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold mb-3">Meaningful Connections</h3>
                <p className="text-gray-300">
                  Your group shared insights, laughed together, and built connections that matter. 
                  We hope these moments lead to deeper friendships and understanding!
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={onStartNewGame}
                >
                  Start a New Game
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-white/20 hover:bg-white/10"
                  onClick={onClose}
                >
                  Return to Current Game
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-400">
              Game session data not found. Please try again.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}