import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SetupScreenProps {
  selectedLevel: number;
  selectedIntensity: number;
  isDrinkingGame: boolean;
  onSelectLevel: (level: number) => void;
  onSelectIntensity: (intensity: number) => void;
  onToggleDrinkingGame: () => void;
  onBack: () => void;
  onStartPlaying: () => void;
}

export default function SetupScreen({
  selectedLevel,
  selectedIntensity,
  isDrinkingGame,
  onSelectLevel,
  onSelectIntensity,
  onToggleDrinkingGame,
  onBack,
  onStartPlaying
}: SetupScreenProps) {
  const levels = [
    {
      id: 1,
      title: "Icebreakers",
      description: "Lighthearted, general interest prompts"
    },
    {
      id: 2,
      title: "Getting to Know You",
      description: "Explores shared experiences and interests"
    },
    {
      id: 3,
      title: "Deeper Dive",
      description: "Examines values, beliefs, and philosophies"
    }
  ];

  const intensities = [
    {
      id: 1,
      title: "Mild",
      description: "Family-friendly",
      icon: "ri-emotion-happy-line"
    },
    {
      id: 2,
      title: "Medium",
      description: "Self-reflective",
      icon: "ri-emotion-normal-line"
    },
    {
      id: 3,
      title: "Wild",
      description: "Deep & personal",
      icon: "ri-fire-line"
    }
  ];

  return (
    <div className="card bg-card/90 rounded-3xl p-8 mb-8 border border-primary/20 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="font-heading font-bold text-3xl text-white mb-4">Game Setup</h2>
        <p className="text-gray-300 mb-6">Select your starting level and intensity</p>
      </div>
      
      {/* Level Selection */}
      <div className="mb-8">
        <h3 className="font-heading font-semibold text-xl text-white mb-4">Choose Level</h3>
        <div className="grid grid-cols-1 gap-3">
          {levels.map((level) => (
            <div
              key={level.id}
              className={cn(
                "level-pill cursor-pointer rounded-xl p-4 border",
                selectedLevel === level.id 
                  ? "bg-primary/20 hover:bg-primary/30 border-primary/30 active" 
                  : "bg-white/10 hover:bg-white/20 border-white/10"
              )}
              onClick={() => onSelectLevel(level.id)}
            >
              <div className="flex items-center">
                <div className={cn(
                  "rounded-full w-10 h-10 flex items-center justify-center mr-3",
                  selectedLevel === level.id ? "bg-primary/30" : "bg-white/10"
                )}>
                  <span className="text-white font-bold">{level.id}</span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white">{level.title}</h4>
                  <p className="text-sm text-gray-300">{level.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Intensity Selection */}
      <div className="mb-8">
        <h3 className="font-heading font-semibold text-xl text-white mb-4">Choose Intensity</h3>
        <div className="grid grid-cols-3 gap-3">
          {intensities.map((intensity) => (
            <div
              key={intensity.id}
              className={cn(
                "intensity-option cursor-pointer rounded-xl p-3 border text-center",
                selectedIntensity === intensity.id 
                  ? "bg-secondary/20 hover:bg-secondary/30 border-secondary/30 active" 
                  : "bg-white/10 hover:bg-white/20 border-white/10"
              )}
              onClick={() => onSelectIntensity(intensity.id)}
            >
              <div className={cn(
                "rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2",
                selectedIntensity === intensity.id ? "bg-secondary/20" : "bg-white/10"
              )}>
                <i className={`${intensity.icon} text-white`}></i>
              </div>
              <h4 className="font-heading font-bold text-white">{intensity.title}</h4>
              <p className="text-xs text-gray-300">{intensity.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Drink Option Toggle */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-xl text-white">Drinking Game</h3>
            <p className="text-sm text-gray-300">Enable alcohol-related challenges</p>
          </div>
          <Switch 
            checked={isDrinkingGame} 
            onCheckedChange={onToggleDrinkingGame}
            className="bg-gray-700 data-[state=checked]:bg-secondary"
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="w-1/3 border-gray-500 text-gray-300 font-bold py-3 px-4 rounded-xl"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button 
          className="btn-primary w-2/3 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl shadow-lg"
          onClick={onStartPlaying}
        >
          Start Playing
        </Button>
      </div>
    </div>
  );
}
