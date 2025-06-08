
import React from 'react';

export default function DeckSelectionCard({ deck, locked }) {
  return (
    <div className="p-4 rounded-xl bg-[#FFF8F2] shadow border-l-4" style={{ borderColor: locked ? '#D8CFE6' : '#FFD166' }}>
      <h3 className="text-xl font-bold text-gray-900">{deck.name}</h3>
      <p className="text-sm text-gray-600">{deck.description}</p>
      <span className="text-xs text-gray-400">{locked ? 'Locked' : 'Unlocked'}</span>
    </div>
  );
}
