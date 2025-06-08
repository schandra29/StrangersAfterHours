
import { useState } from 'react';

const slides = [
  "Welcome to the party! Get ready to laugh and connect.",
  "Draw cards and take on fun prompts and challenges.",
  "Play with friends or strangers. Let the good times roll!"
];

export default function Carousel() {
  const [index, setIndex] = useState(0);
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <p className="text-lg font-semibold text-gray-900 mb-4">{slides[index]}</p>
      <div className="flex justify-between">
        <button
          onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
          className="bg-gray-300 px-4 py-2 rounded-xl"
        >
          Back
        </button>
        <button
          onClick={() => setIndex((index + 1) % slides.length)}
          className="bg-[#FF4F81] text-white px-4 py-2 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
}
