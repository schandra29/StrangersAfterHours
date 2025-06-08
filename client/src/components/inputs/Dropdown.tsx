
interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Dropdown({ label, options, value, onChange }: DropdownProps) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FF4F81] focus:ring-[#FF4F81] sm:text-sm"
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}
