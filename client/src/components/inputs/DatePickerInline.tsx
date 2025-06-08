
interface DatePickerInlineProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DatePickerInline({ value, onChange }: DatePickerInlineProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full mt-1 rounded-xl border-gray-300 shadow-sm focus:border-[#FF4F81] focus:ring-[#FF4F81] sm:text-sm"
    />
  );
}
