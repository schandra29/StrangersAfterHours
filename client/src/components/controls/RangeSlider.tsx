
import React from 'react';

export default function RangeSlider({ min, max, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full accent-[#FF4F81]"
      />
      <p className="text-sm text-center text-gray-600">Value: {value}</p>
    </div>
  );
}
