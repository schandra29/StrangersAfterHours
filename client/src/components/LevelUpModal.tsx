import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [selectedOption, setSelectedOption] = useState<"level" | "intensity" | null>(null);
  
  const canIncreaseLevel = currentLevel < 3;
  const canIncreaseIntensity = currentIntensity < 3;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-4 border border-primary shadow-xl">
        <div className="text-center mb-6">
          <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <i className="ri-arrow-up-line text-primary text-3xl"></i>
          </div>
          <h3 className="font-heading font-bold text-2xl text-white mb-2">Level Up!</h3>
          <p className="text-gray-300">Take a vote with your group</p>
        </div>
        
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-3">
            <button 
              className={`bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-left ${!canIncreaseLevel ? 'opacity-50 cursor-not-allowed' : ''} ${selectedOption === 'level' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => canIncreaseLevel && setSelectedOption("level")}
              disabled={!canIncreaseLevel}
            >
              <div className="flex items-center">
                <div className="bg-primary/30 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <i className="ri-bar-chart-line text-white"></i>
                </div>
                <div>
                  <h4 className="font-heading font-bold">Increase Level</h4>
                  <p className="text-sm text-gray-300">
                    {canIncreaseLevel 
                      ? "Move to deeper conversation topics" 
                      : "Already at maximum level"}
                  </p>
                </div>
              </div>
            </button>
            
            <button 
              className={`bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-left ${!canIncreaseIntensity ? 'opacity-50 cursor-not-allowed' : ''} ${selectedOption === 'intensity' ? 'ring-2 ring-secondary' : ''}`}
              onClick={() => canIncreaseIntensity && setSelectedOption("intensity")}
              disabled={!canIncreaseIntensity}
            >
              <div className="flex items-center">
                <div className="bg-secondary/30 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <i className="ri-fire-line text-white"></i>
                </div>
                <div>
                  <h4 className="font-heading font-bold">Increase Intensity</h4>
                  <p className="text-sm text-gray-300">
                    {canIncreaseIntensity 
                      ? "Make current topics more revealing" 
                      : "Already at maximum intensity"}
                  </p>
                </div>
              </div>
            </button>
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
            onClick={() => selectedOption && onConfirm(selectedOption)}
            disabled={!selectedOption}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
