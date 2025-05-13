import { Button } from "@/components/ui/button";
import { type Prompt } from "@shared/schema";

interface GameScreenProps {
  currentLevel: number;
  currentIntensity: number;
  currentPrompt: Prompt | null;
  onMenu: () => void;
  onNextPrompt: () => void;
  onChallenge: (type: "Truth or Dare" | "Act It Out") => void;
  onLevelUp: () => void;
}

export default function GameScreen({
  currentLevel,
  currentIntensity,
  currentPrompt,
  onMenu,
  onNextPrompt,
  onChallenge,
  onLevelUp
}: GameScreenProps) {
  const getIntensityText = (intensity: number): string => {
    switch (intensity) {
      case 1: return "Mild";
      case 2: return "Medium";
      case 3: return "Wild";
      default: return "Mild";
    }
  };

  return (
    <>
      {/* Game Status Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <span className="bg-primary/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            Level: <span>{currentLevel}</span>
          </span>
          <span className="bg-secondary/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            Intensity: <span>{getIntensityText(currentIntensity)}</span>
          </span>
        </div>
        <button 
          className="text-white bg-card/50 rounded-full p-2"
          onClick={onMenu}
        >
          <i className="ri-menu-line"></i>
        </button>
      </div>
      
      {/* Prompt Card */}
      <div className="card bg-card/90 rounded-3xl p-8 mb-6 border border-primary/20 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-block bg-primary/20 rounded-full px-4 py-1 text-sm text-white font-medium mb-4">
            <span>{currentPrompt?.category || "Icebreaker"}</span>
          </div>
          <h2 className="font-prompt font-semibold text-3xl text-white leading-tight">
            {currentPrompt?.text || "If you could have dinner with any historical figure, who would it be and why?"}
          </h2>
        </div>
        
        <Button
          className="btn-primary w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center"
          onClick={onNextPrompt}
        >
          <i className="ri-arrow-right-line mr-2"></i> Next Prompt
        </Button>
      </div>
      
      {/* Challenge Section */}
      <div className="card bg-secondary/10 rounded-3xl p-6 mb-6 border border-secondary/20">
        <h3 className="font-heading font-bold text-xl text-white mb-4">Want to challenge someone?</h3>
        <p className="text-gray-300 mb-4">After someone answers, you can challenge them to:</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onChallenge("Truth or Dare")}
          >
            <i className="ri-questionnaire-line mb-1 text-xl block"></i>
            <span className="block font-medium">Truth or Dare</span>
          </button>
          <button 
            className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onChallenge("Act It Out")}
          >
            <i className="ri-emotion-laugh-line mb-1 text-xl block"></i>
            <span className="block font-medium">Act It Out</span>
          </button>
        </div>
        
        <div className="text-sm text-center text-gray-400">
          They can choose to accept or pass
        </div>
      </div>
      
      {/* Level Up Section */}
      <div className="card bg-primary/10 rounded-3xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-xl text-white">Ready to level up?</h3>
          <button 
            className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={onLevelUp}
          >
            <i className="ri-arrow-up-line"></i>
          </button>
        </div>
        <p className="text-gray-300 text-sm">
          Take a group vote to increase the level or intensity for deeper conversations
        </p>
      </div>
    </>
  );
}
