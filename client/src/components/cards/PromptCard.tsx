
interface PromptCardProps {
  prompt: string;
  player: string;
}

export default function PromptCard({ prompt, player }: PromptCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#FFD166]">
      <p className="text-sm text-gray-500 mb-1">It's {player}'s turn</p>
      <p className="text-lg font-bold text-gray-900">{prompt}</p>
    </div>
  );
}
