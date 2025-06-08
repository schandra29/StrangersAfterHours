
interface TooltipProps {
  message: string;
}

export default function Tooltip({ message }: TooltipProps) {
  return (
    <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow">
      {message}
    </div>
  );
}
