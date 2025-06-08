
interface PlayerProfileCardProps {
  name: string;
  avatarUrl: string;
}

export default function PlayerProfileCard({ name, avatarUrl }: PlayerProfileCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-xl">
      <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full" />
      <p className="text-lg font-semibold text-gray-800">{name}</p>
    </div>
  );
}
