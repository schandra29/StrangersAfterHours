import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import SetupScreen from "@/components/SetupScreen";
import GameScreen from "@/components/GameScreen";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "setup" | "game">("welcome");

  const handleStartGame = () => {
    setCurrentScreen("setup");
  };

  const handleGameSetup = () => {
    setCurrentScreen("game");
  };

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome");
  };

  return (
    <div className="min-h-screen text-foreground font-body">
      {currentScreen === "welcome" && (
        <WelcomeScreen onStartGame={handleStartGame} />
      )}
      {currentScreen === "setup" && (
        <SetupScreen 
          onStartGame={handleGameSetup}
          onBack={handleBackToWelcome}
        />
      )}
      {currentScreen === "game" && (
        <GameScreen onBack={handleBackToWelcome} />
      )}
    </div>
  );
}