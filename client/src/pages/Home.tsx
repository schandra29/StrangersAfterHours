import { useState } from "react";
import WelcomeScreen from "../components/WelcomeScreen";
import GameScreen from "../components/GameScreen";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "game">("welcome");

  const handleStartGame = () => {
    setCurrentScreen("game");
  };

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {currentScreen === "welcome" && (
        <WelcomeScreen onStartGame={handleStartGame} />
      )}
      {currentScreen === "game" && (
        <GameScreen onBack={handleBackToWelcome} />
      )}
    </div>
  );
}