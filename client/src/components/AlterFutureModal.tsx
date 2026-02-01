import { useState } from 'react';
import { Card } from '../types/game';
import CardComponent from './CardComponent';

interface AlterFutureModalProps {
  cards: Card[];
  onConfirm: (rearrangedCards: Card[]) => void;
  onClose: () => void;
}

export default function AlterFutureModal({ cards, onConfirm, onClose }: AlterFutureModalProps) {
  const [rearrangedCards, setRearrangedCards] = useState<Card[]>([...cards]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    if (selectedIndex === null) {
      // First selection
      setSelectedIndex(index);
    } else {
      // Swap cards
      const newCards = [...rearrangedCards];
      [newCards[selectedIndex], newCards[index]] = [newCards[index], newCards[selectedIndex]];
      setRearrangedCards(newCards);
      setSelectedIndex(null);
    }
  };

  const handleConfirm = () => {
    onConfirm(rearrangedCards);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          ✨ Alter the Future
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
          Rearrange the top 3 cards. Tap two cards to swap them.
        </p>

        {/* Card positions */}
        <div className="mb-6">
          <div className="flex justify-center space-x-3 md:space-x-4 mb-4">
            {rearrangedCards.map((card, index) => (
              <div key={card.id} className="text-center">
                <div className={`
                  p-1 rounded-lg transition-all
                  ${selectedIndex === index ? 'bg-yellow-200 ring-4 ring-yellow-400' : ''}
                `}>
                  <CardComponent
                    card={card}
                    onClick={() => handleCardClick(index)}
                    selected={selectedIndex === index}
                  />
                </div>
                <p className="text-xs mt-2 font-semibold text-gray-700">
                  Position {index + 1}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600">
              📝 Position 1 will be drawn first, Position 3 last
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
          >
            Confirm
          </button>
        </div>

        {/* Instructions */}
        {selectedIndex !== null && (
          <p className="text-center text-sm text-purple-600 font-semibold mt-4 animate-pulse">
            Now tap another card to swap positions
          </p>
        )}
      </div>
    </div>
  );
}
