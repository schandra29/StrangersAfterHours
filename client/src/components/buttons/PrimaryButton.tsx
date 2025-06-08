
import type { PropsWithChildren, ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({ children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      {...props}
      className="bg-[#FF4F81] text-white py-2 px-4 rounded-xl hover:bg-[#e54473] active:bg-[#cc3b66] transition-all"
    >
      {children}
    </button>
  );
}
