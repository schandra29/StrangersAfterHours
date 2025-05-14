import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  onAddCustomChallenge?: () => void;
}

export default function GameMenuModal({
  isOpen,
  onClose,
  onRestart,
  onSettings,
  onHowToPlay,
  onAddCustomChallenge
}: GameMenuModalProps) {
  const menuOptions = [
    {
      icon: "ri-restart-line",
      label: "Restart Game",
      action: onRestart
    },
    {
      icon: "ri-settings-4-line",
      label: "Change Settings",
      action: onSettings
    },
    {
      icon: "ri-question-line",
      label: "How to Play",
      action: onHowToPlay
    }
  ];
  
  // Add the custom challenge option if the handler is provided
  if (onAddCustomChallenge) {
    menuOptions.push({
      icon: "ri-add-line",
      label: "Add Custom Challenge",
      action: onAddCustomChallenge
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-4 border border-primary shadow-xl">
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
              <i className={`${option.icon} text-primary mr-3 text-xl`}></i>
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
  );
}
