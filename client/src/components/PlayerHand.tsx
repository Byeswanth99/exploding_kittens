import { Card } from '../types/game';
import CardComponent from './CardComponent';
import { useState } from 'react';
import { isCatCard } from '../utils/cardStyles';

interface PlayerHandProps {
  hand: Card[];
  onPlayCard: (cardId: string, cardType: string) => void;
  onPlayCatCombo?: (cardIds: string[]) => void;
  canPlay: boolean;
}

export default function PlayerHand({ hand, onPlayCard, onPlayCatCombo, canPlay }: PlayerHandProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCatCards, setSelectedCatCards] = useState<string[]>([]);

  const handleCardClick = (card: Card) => {
    if (!canPlay) return;

    // If it's a cat card, handle multi-select for combos
    if (isCatCard(card.type)) {
      const index = selectedCatCards.indexOf(card.id);
      if (index === -1) {
        // Add to selection (max 2, and must be same type)
        if (selectedCatCards.length === 0) {
          // First card selected
          setSelectedCatCards([card.id]);
          setSelectedCardId(null); // Clear single selection
        } else if (selectedCatCards.length === 1) {
          // Second card - check if same type
          const firstCard = hand.find(c => c.id === selectedCatCards[0]);
          if (firstCard && (firstCard.type === card.type ||
              firstCard.type === 'feral-cat' ||
              card.type === 'feral-cat')) {
            setSelectedCatCards([...selectedCatCards, card.id]);
            setSelectedCardId(null);
          } else {
            // Different type - replace selection
            setSelectedCatCards([card.id]);
            setSelectedCardId(null);
          }
        }
      } else {
        // Remove from selection
        setSelectedCatCards(selectedCatCards.filter(id => id !== card.id));
      }
    } else {
      // Non-cat cards: single select
      if (selectedCardId === card.id) {
        setSelectedCardId(null);
      } else {
        setSelectedCardId(card.id);
        setSelectedCatCards([]); // Clear cat card selection
      }
    }
  };

  const handlePlaySelected = () => {
    if (!selectedCardId || !canPlay) return;

    const card = hand.find(c => c.id === selectedCardId);
    if (!card) return;

    onPlayCard(card.id, card.type);
    setSelectedCardId(null);
  };

  const handlePlayCatCombo = () => {
    if (selectedCatCards.length !== 2 || !canPlay || !onPlayCatCombo) return;
    onPlayCatCombo(selectedCatCards);
    setSelectedCatCards([]);
  };

  if (hand.length === 0) {
    return (
      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 text-center">
        <p className="text-white">No cards in hand</p>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-2 md:p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-bold text-xs md:text-sm">
          Your Hand ({hand.length} cards)
        </h3>
        <div className="flex gap-2">
          {selectedCatCards.length === 2 && canPlay && onPlayCatCombo && (
            <button
              onClick={handlePlayCatCombo}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transform hover:scale-105 transition-all pulse"
            >
              🐱 Play Combo
            </button>
          )}
          {selectedCardId && canPlay && (
            <button
              onClick={handlePlaySelected}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transform hover:scale-105 transition-all pulse"
            >
              ▶ Play Card
            </button>
          )}
        </div>
      </div>

      {/* Cards - Horizontal scrollable */}
      <div className="overflow-x-auto pb-1">
        <div className="flex space-x-1.5 md:space-x-2 min-w-max">
          {hand.map((card) => (
            <div
              key={card.id}
              className="group relative"
            >
              <CardComponent
                card={card}
                onClick={() => handleCardClick(card)}
                disabled={!canPlay}
                selected={selectedCardId === card.id || selectedCatCards.includes(card.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {canPlay && !selectedCardId && selectedCatCards.length === 0 && (
        <p className="text-white text-[10px] md:text-xs mt-1.5 text-center opacity-75">
          Tap a card to select, or select 2 cat cards for combo
        </p>
      )}
      {canPlay && selectedCatCards.length === 1 && (
        <p className="text-white text-[10px] md:text-xs mt-1.5 text-center opacity-75">
          Select one more cat card to play combo
        </p>
      )}
      {!canPlay && (
        <p className="text-white text-[10px] md:text-xs mt-1.5 text-center opacity-75">
          Wait for your turn
        </p>
      )}
    </div>
  );
}
