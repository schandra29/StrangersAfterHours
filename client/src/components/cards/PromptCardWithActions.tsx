
import React from 'react';

export default function PromptCardWithActions({ prompt, player, onNext, onSkip }) {
  return (
    <div className="flex flex-col justify-between h-full p-4 bg-white rounded-xl shadow-md">
      <div>
        <p className="text-sm text-gray-500">It's {player}'s turn</p>
        <p className="text-xl font-bold text-gray-900 mt-2">{prompt}</p>
      </div>
      <div className="fixed bottom-4 left-0 right-0 px-4 flex justify-between">
        <button onClick={onSkip} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl">Skip</button>
        <button onClick={onNext} className="bg-[#FF4F81] text-white px-4 py-2 rounded-xl">Next</button>
      </div>
    </div>
  );
}
