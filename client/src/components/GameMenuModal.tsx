import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import PromptStatsModal from "./PromptStatsModal";
import { resetUsedPrompts } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Settings, 
  HelpCircle, 
  BarChart2, 
  RotateCcw,
  Plus,
  Heart
} from "lucide-react";

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  onAboutGame: () => void;
  onAddCustomChallenge?: () => void;
}

export default function GameMenuModal({
  isOpen,
  onClose,
  onRestart,
  onSettings,
  onHowToPlay,
  onAboutGame,
  onAddCustomChallenge
}: GameMenuModalProps) {
  const [isPromptStatsOpen, setIsPromptStatsOpen] = useState(false);
  
  // Handle resetting the game (clear used prompts)
  const handleReset = () => {
    resetUsedPrompts();
    toast({
      title: "Game Reset",
      description: "All used prompts have been reset. You'll now see all prompts again.",
    });
  };
  
  // State for prompt stats modal only
  // Download functionality has been removed per client request
  
  const menuOptions = [
    {
      Icon: RefreshCw,
      label: "Restart Game",
      action: onRestart
    },
    {
      Icon: Settings,
      label: "Change Settings",
      action: onSettings
    },
    {
      Icon: HelpCircle,
      label: "How to Play",
      action: onHowToPlay
    },
    {
      Icon: Heart,
      label: "About this Game",
      action: onAboutGame
    },
    {
      Icon: BarChart2,
      label: "View Prompt Progress",
      action: () => setIsPromptStatsOpen(true)
    },
    {
      Icon: RotateCcw,
      label: "Reset Used Prompts",
      action: handleReset
    }
  ];
  
  // Add the custom challenge option if the handler is provided
  if (onAddCustomChallenge) {
    menuOptions.push({
      Icon: Plus,
      label: "Add Custom Challenge",
      action: onAddCustomChallenge
    });
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-auto border border-primary shadow-xl">
          <DialogTitle className="font-heading font-bold text-2xl text-white mb-6">
            Game Menu
          </DialogTitle>
          
          <div className="grid grid-cols-1 gap-3 mb-6">
            {menuOptions.map((option, index) => (
              <button 
                key={index}
                className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl text-left flex items-center"
                onClick={option.action}
              >
                <option.Icon className="text-primary mr-3 w-5 h-5" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
            onClick={onClose}
          >
            Resume Game
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Prompt Stats Modal */}
      <PromptStatsModal 
        isOpen={isPromptStatsOpen} 
        onClose={() => setIsPromptStatsOpen(false)} 
      />
    </>
  );
}
