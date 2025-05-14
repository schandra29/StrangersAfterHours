import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGame } from "@/hooks/useGame";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  currentIntensity: number;
  onConfirm: (type: "level" | "intensity") => void;
}

export default function LevelUpModal({
  isOpen,
  onClose,
  currentLevel,
  currentIntensity,
  onConfirm
}: LevelUpModalProps) {
  const game = useGame();
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevel);
  const [selectedIntensity, setSelectedIntensity] = useState<number>(currentIntensity);
  
  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLevel(currentLevel);
      setSelectedIntensity(currentIntensity);
    }
  }, [isOpen, currentLevel, currentIntensity]);
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  
  const handleApply = () => {
    const levelChanged = selectedLevel !== currentLevel;
    const intensityChanged = selectedIntensity !== currentIntensity;
    
    // Only update if something has changed
    if (levelChanged || intensityChanged) {
      // Apply level changes
      if (levelChanged) {
        game.setLevel(selectedLevel);
        onConfirm("level");
      }
      
      // Apply intensity changes
      if (intensityChanged) {
        game.setIntensity(selectedIntensity);
        onConfirm("intensity");
      }
      
      // Get a new prompt that matches the new level/intensity
      setTimeout(() => {
        game.getNextPrompt();
      }, 100); // Small delay to ensure state updates first
    }
    
    onClose();
  };
  
  const hasChanges = selectedLevel !== currentLevel || selectedIntensity !== currentIntensity;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-4 border border-primary shadow-xl">
        <DialogTitle className="sr-only">Select Level and Intensity</DialogTitle>
        <div className="text-center mb-6">
          <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <i className="ri-settings-line text-primary text-3xl"></i>
          </div>
          <h3 className="font-heading font-bold text-2xl text-white mb-2">Select Level/Intensity</h3>
          <p className="text-gray-300">Choose your desired game settings</p>
        </div>
        
        {/* Level Selection */}
        <div className="mb-6">
          <h4 className="font-heading font-bold text-lg text-white mb-3">Game Level</h4>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((level) => (
              <button
                key={`level-${level}`}
                className={`p-3 rounded-xl text-center ${
                  selectedLevel === level 
                    ? 'bg-primary text-white' 
                    : 'bg-primary/20 hover:bg-primary/30 text-gray-300'
                }`}
                onClick={() => setSelectedLevel(level)}
              >
                <div className="text-xl font-bold">{level}</div>
                <div className="text-xs">
                  {level === 1 ? 'Casual' : level === 2 ? 'Personal' : 'Deep'}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Intensity Selection */}
        <div className="mb-6">
          <h4 className="font-heading font-bold text-lg text-white mb-3">Intensity</h4>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((intensity) => (
              <button
                key={`intensity-${intensity}`}
                className={`p-3 rounded-xl text-center ${
                  selectedIntensity === intensity 
                    ? 'bg-secondary text-white' 
                    : 'bg-secondary/20 hover:bg-secondary/30 text-gray-300'
                }`}
                onClick={() => setSelectedIntensity(intensity)}
              >
                <div className="text-xl font-bold">{intensity}</div>
                <div className="text-xs">
                  {intensity === 1 ? 'Mild' : intensity === 2 ? 'Medium' : 'Wild'}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            className="bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-xl"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
            onClick={handleApply}
            disabled={!hasChanges}
          >
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
