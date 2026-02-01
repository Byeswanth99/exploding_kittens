import { useState } from 'react';

interface DefusePlacementProps {
  deckSize: number;
  onPlace: (position: number) => void;
  onClose?: () => void;
}

export default function DefusePlacement({ deckSize, onPlace }: DefusePlacementProps) {
  const [selectedPosition, setSelectedPosition] = useState<number>(0);

  // Create position options (0 to deckSize)
  const positions = Array.from({ length: deckSize + 1 }, (_, i) => i);

  const handleConfirm = () => {
    onPlace(selectedPosition);
  };

  const getPositionLabel = (pos: number): string => {
    if (pos === 0) return 'Top (next draw)';
    if (pos === deckSize) return 'Bottom (safest)';
    return `Position ${pos + 1}`;
  };

  const getPositionDescription = (pos: number): string => {
    if (pos === 0) return 'Very risky! Next player will draw it.';
    if (pos <= Math.floor(deckSize / 3)) return 'Risky - will be drawn soon';
    if (pos <= Math.floor(deckSize * 2 / 3)) return 'Moderate risk';
    if (pos < deckSize) return 'Safer position';
    return 'Safest! Will be drawn last.';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🛡️</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Defuse Success!</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Place the Exploding Kitten back in the deck
          </p>
        </div>

        {/* Position selector */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-3">
            Select Position:
          </label>
          
          {/* Slider */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={deckSize}
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  #EF4444 0%, 
                  #F59E0B 50%, 
                  #10B981 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Top (0)</span>
              <span>Middle</span>
              <span>Bottom ({deckSize})</span>
            </div>
          </div>

          {/* Selected position display */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="font-bold text-gray-800 mb-1">
              {getPositionLabel(selectedPosition)}
            </p>
            <p className="text-sm text-gray-600">
              {getPositionDescription(selectedPosition)}
            </p>
          </div>

          {/* Visual deck representation */}
          <div className="mt-4 flex items-center justify-center space-x-1">
            {positions.slice(0, Math.min(10, deckSize + 1)).map((pos) => (
              <div
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`
                  w-8 h-12 md:w-10 md:h-16 rounded cursor-pointer transition-all
                  ${pos === selectedPosition 
                    ? 'bg-gradient-to-br from-red-500 to-red-700 transform scale-110 shadow-lg' 
                    : 'bg-gradient-to-br from-gray-300 to-gray-400'}
                `}
                title={`Position ${pos}`}
              />
            ))}
            {deckSize > 9 && (
              <span className="text-gray-500 text-sm">...+{deckSize - 9}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <button
          onClick={handleConfirm}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Place Kitten Here 💣
        </button>

        {/* Warning */}
        <p className="text-center text-xs text-gray-500 mt-4">
          ⚠️ Other players won't know where you placed it
        </p>
      </div>
    </div>
  );
}
