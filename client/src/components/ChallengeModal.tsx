import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { type Challenge } from "@shared/schema";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "Dare" | "Act It Out" | "Take a Sip";
  intensity: number;
  isDrinkingGame: boolean;
}

export default function ChallengeModal({
  isOpen,
  onClose,
  type,
  intensity,
  isDrinkingGame
}: ChallengeModalProps) {
  const [challenge, setChallenge] = useState<string | null>(null);

  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: [`/api/challenges?type=${encodeURIComponent(type)}&intensity=${intensity}`],
    enabled: isOpen && type !== "Take a Sip",
  });

  useEffect(() => {
    if (type === "Take a Sip") {
      setChallenge("Take a sip of your drink!");
    } else if (challenges && challenges.length > 0) {
      const randomIndex = Math.floor(Math.random() * challenges.length);
      setChallenge(challenges[randomIndex].text);
    }
  }, [challenges, isOpen, type]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-4 border border-secondary shadow-xl">
        <div className="text-center mb-6">
          <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <i className="ri-fire-line text-secondary text-3xl"></i>
          </div>
          <h3 className="font-heading font-bold text-2xl text-white mb-2">Challenge!</h3>
          <p className="text-gray-300">{type} challenge</p>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <p className="text-white font-medium">
            {challenge || "Loading challenge..."}
            {isDrinkingGame && type === "Dare" && challenge && (
              <span className="block mt-2 text-sm text-secondary">
                (If passing, take a sip of your drink)
              </span>
            )}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl"
            onClick={onClose}
          >
            Accept
          </Button>
          <Button 
            variant="outline"
            className="bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-xl"
            onClick={onClose}
          >
            Pass
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
