
import React from 'react';

export default function TextInput({ label, ...props }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        {...props}
        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FF4F81] focus:ring-[#FF4F81] sm:text-sm"
      />
    </label>
  );
}
