
import { Home, Layers, PlayCircle, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const tabs = [
    { name: "Home", icon: <Home size={24} />, key: "home" },
    { name: "Decks", icon: <Layers size={24} />, key: "decks" },
    { name: "Game", icon: <PlayCircle size={24} />, key: "game" },
    { name: "Settings", icon: <Settings size={24} />, key: "settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around py-2">
      {tabs.map((tab) => (
        <button key={tab.key} className={`flex flex-col items-center text-sm ${activeTab === tab.key ? 'text-[#FF4F81]' : 'text-gray-400'}`}>
          {tab.icon}
          {tab.name}
        </button>
      ))}
    </nav>
  );
}
