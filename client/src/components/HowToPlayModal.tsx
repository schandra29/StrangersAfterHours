import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const steps = [
    "Choose a starting Level (topic depth) and Intensity (how revealing)",
    "One person controls the app and reads prompts to the group",
    "Players take turns answering the prompts verbally",
    "Players can challenge each other after answers",
    "Take a group vote to level up for deeper conversations"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-4 border border-primary shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-bold text-2xl text-white">How to Play</h3>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="mb-6 space-y-4">
          {steps.map((step, index) => (
            <div className="flex" key={index}>
              <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0">
                <span className="text-white font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: step }}></p>
            </div>
          ))}
        </div>
        
        <div className="bg-warning/20 rounded-xl p-4 mb-6">
          <div className="flex">
            <i className="ri-information-line text-warning mr-3 text-xl"></i>
            <p className="text-sm text-gray-300">
              Remember, everyone should feel comfortable. Anyone can skip a prompt or challenge at any time.
            </p>
          </div>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
          onClick={onClose}
        >
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
