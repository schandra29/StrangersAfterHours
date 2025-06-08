
type ToggleSwitchProps = {
  isOn: boolean;
  onToggle: () => void;
};

export default function ToggleSwitch({ isOn, onToggle }: ToggleSwitchProps) {
  return (
    <div
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full cursor-pointer transition-all ${isOn ? 'bg-[#FFD166]' : 'bg-gray-300'}`}
    >
      <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );
}
