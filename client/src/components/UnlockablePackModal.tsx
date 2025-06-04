import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type PromptPack } from "@shared/schema";
import { Lock, Unlock, Gift } from "lucide-react";
import { ConfettiExplosion } from "react-confetti-explosion";

interface UnlockablePackModalProps {
  pack: PromptPack;
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (packId: string) => Promise<boolean>;
}

export default function UnlockablePackModal({ 
  pack, 
  isOpen, 
  onClose, 
  onUnlock 
}: UnlockablePackModalProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      const success = await onUnlock(pack.id);
      if (success) {
        setIsUnlocked(true);
        setShowConfetti(true);
        
        // Hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error unlocking pack:", error);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {showConfetti && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <ConfettiExplosion 
              force={0.8}
              duration={3000}
              particleCount={100}
              width={1600}
            />
          </div>
        )}
        
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            {isUnlocked ? (
              <>
                <Gift className="h-6 w-6 text-purple-500" />
                Pack Unlocked!
              </>
            ) : (
              <>
                <Lock className="h-6 w-6 text-amber-500" />
                New Pack Available!
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-lg pt-2">
            {isUnlocked 
              ? "You've successfully unlocked a new prompt pack!"
              : "You've earned access to a new prompt pack!"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 my-2 bg-gradient-to-br from-purple-50 to-fuchsia-100 dark:from-purple-900/30 dark:to-fuchsia-900/20 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2 text-purple-700 dark:text-purple-300">{pack.name}</h3>
          <p className="text-gray-700 dark:text-gray-300">{pack.description}</p>
        </div>

        <DialogFooter className="sm:justify-center gap-3">
          {!isUnlocked ? (
            <Button 
              onClick={handleUnlock}
              className="bg-amber-500 hover:bg-amber-600"
              disabled={isUnlocking}
            >
              {isUnlocking ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Unlocking...
                </div>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock This Pack
                </>
              )}
            </Button>
          ) : (
            <Button onClick={onClose}>
              Continue Playing
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
