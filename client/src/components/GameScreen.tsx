import { Button } from "@/components/ui/button";
import { type Prompt } from "@shared/schema";

interface GameScreenProps {
  currentLevel: number;
  currentIntensity: number;
  currentPrompt: Prompt | null;
  isDrinkingGame: boolean;
  onMenu: () => void;
  onNextPrompt: () => void;
  onChallenge: (type: "Dare" | "Act It Out" | "Take a Sip") => void;
  onLevelChange: (type: "level" | "intensity") => void;
  onRandomPrompt: () => void;
}

export default function GameScreen({
  currentLevel,
  currentIntensity,
  currentPrompt,
  isDrinkingGame,
  onMenu,
  onNextPrompt,
  onChallenge,
  onLevelChange,
  onRandomPrompt
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
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 rounded-full py-1 px-4 text-sm text-white font-bold">
              {currentPrompt?.category || "Icebreaker"}
            </div>
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
        <h3 className="font-heading font-bold text-xl text-white mb-4">If you don't want to answer, select one of these options</h3>
        <p className="text-gray-300 mb-4">Instead of answering the prompt, you can choose to:</p>
        
        <div className={`grid ${isDrinkingGame ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
          <button 
            className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onChallenge("Dare")}
          >
            <i className="ri-questionnaire-line mb-1 text-xl block"></i>
            <span className="block font-medium">Dare</span>
          </button>
          <button 
            className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onChallenge("Act It Out")}
          >
            <i className="ri-emotion-laugh-line mb-1 text-xl block"></i>
            <span className="block font-medium">Act It Out</span>
          </button>
          {isDrinkingGame && (
            <button 
              className="bg-secondary/20 hover:bg-secondary/30 text-white py-3 px-4 rounded-xl text-center"
              onClick={() => onChallenge("Take a Sip")}
            >
              <i className="ri-goblet-line mb-1 text-xl block"></i>
              <span className="block font-medium">Take a Sip</span>
            </button>
          )}
        </div>
        
        <div className="text-sm text-center text-gray-400">
          You can return to answering the prompt anytime
        </div>
      </div>
      
      {/* Level Up Section */}
      <div className="card bg-primary/10 rounded-3xl p-6 border border-primary/20">
        <h3 className="font-heading font-bold text-xl text-white mb-4">Change Level or Intensity</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button 
            className="bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onLevelChange("level")}
          >
            <i className="ri-bar-chart-line mb-1 text-xl block"></i>
            <span className="block font-medium">Select Level</span>
          </button>
          <button 
            className="bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onLevelChange("intensity")}
          >
            <i className="ri-fire-line mb-1 text-xl block"></i>
            <span className="block font-medium">Select Intensity</span>
          </button>
          <button 
            className="bg-primary/20 hover:bg-primary/30 text-white py-3 px-4 rounded-xl text-center"
            onClick={() => onRandomPrompt()}
          >
            <i className="ri-dice-line mb-1 text-xl block"></i>
            <span className="block font-medium">Take a Chance</span>
          </button>
        </div>
        
        <p className="text-gray-300 text-sm text-center">
          Change the experience or get a completely random prompt
        </p>
      </div>
    </>
  );
}
