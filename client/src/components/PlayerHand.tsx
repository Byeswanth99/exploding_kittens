import { Card } from '../types/game';
import CardComponent from './CardComponent';
import { useState } from 'react';

interface PlayerHandProps {
  hand: Card[];
  onPlayCard: (cardId: string, cardType: string) => void;
  canPlay: boolean;
}

export default function PlayerHand({ hand, onPlayCard, canPlay }: PlayerHandProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleCardClick = (card: Card) => {
    if (!canPlay) return;
    
    // If clicking the same card, deselect
    if (selectedCardId === card.id) {
      setSelectedCardId(null);
      return;
    }

    setSelectedCardId(card.id);
  };

  const handlePlaySelected = () => {
    if (!selectedCardId || !canPlay) return;
    
    const card = hand.find(c => c.id === selectedCardId);
    if (!card) return;

    onPlayCard(card.id, card.type);
    setSelectedCardId(null);
  };

  if (hand.length === 0) {
    return (
      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 text-center">
        <p className="text-white">No cards in hand</p>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-3 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-sm md:text-base">
          Your Hand ({hand.length} cards)
        </h3>
        {selectedCardId && canPlay && (
          <button
            onClick={handlePlaySelected}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transform hover:scale-105 transition-all pulse"
          >
            ▶ Play Card
          </button>
        )}
      </div>

      {/* Cards - Horizontal scrollable */}
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2 md:space-x-3 min-w-max">
          {hand.map((card) => (
            <div
              key={card.id}
              className="group relative"
            >
              <CardComponent
                card={card}
                onClick={() => handleCardClick(card)}
                disabled={!canPlay}
                selected={selectedCardId === card.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {canPlay && !selectedCardId && (
        <p className="text-white text-xs md:text-sm mt-2 text-center opacity-75">
          Tap a card to select, then tap "Play Card" or draw from deck
        </p>
      )}
      {!canPlay && (
        <p className="text-white text-xs md:text-sm mt-2 text-center opacity-75">
          Wait for your turn
        </p>
      )}
    </div>
  );
}
