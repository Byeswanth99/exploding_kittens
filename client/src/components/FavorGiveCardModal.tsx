import { Card } from '../types/game';
import CardComponent from './CardComponent';
import { useState } from 'react';

interface FavorGiveCardModalProps {
  hand: Card[];
  requesterName: string;
  onGive: (cardId: string) => void;
}

export default function FavorGiveCardModal({
  hand,
  requesterName,
  onGive,
}: FavorGiveCardModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleGive = () => {
    if (!selectedCardId) return;
    onGive(selectedCardId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Favor Requested
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
          {requesterName} played Favor. Choose a card to give.
        </p>

        {hand.length === 0 ? (
          <p className="text-center text-gray-500">You have no cards to give.</p>
        ) : (
          <>
            <div className="overflow-x-auto pb-2 mb-4">
              <div className="flex space-x-2 md:space-x-3 min-w-max">
                {hand.map((card) => (
                  <div key={card.id} className="group relative">
                    <CardComponent
                      card={card}
                      onClick={() => setSelectedCardId(card.id)}
                      selected={selectedCardId === card.id}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGive}
              disabled={!selectedCardId}
              className="w-full bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              Give Selected Card
            </button>
          </>
        )}
      </div>
    </div>
  );
}
