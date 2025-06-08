
import type { PropsWithChildren, ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({ children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      {...props}
      className="bg-[#207C8B] text-white py-2 px-4 rounded-xl hover:bg-[#1a6975] active:bg-[#165962] transition-all"
    >
      {children}
    </button>
  );
}
