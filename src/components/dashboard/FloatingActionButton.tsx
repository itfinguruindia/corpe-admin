import React from 'react';

export default function FloatingActionButton() {
  return (
    <button className="fixed bottom-8 right-8 z-30 flex items-center justify-center rounded-full border-2 border-[#FF8A65] bg-white px-6 py-3 text-sm font-bold text-[#FF8A65] shadow-lg transition-transform hover:scale-105 active:scale-95">
      + More
    </button>
  );
}
