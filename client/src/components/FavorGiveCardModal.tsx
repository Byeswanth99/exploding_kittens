import { Card } from '../types/game';
import CardComponent from './CardComponent';

interface FavorGiveCardModalProps {
  hand: Card[];
  requesterName: string;
  onGive: (cardId: string) => void;
  isCatCombo?: boolean;
}

export default function FavorGiveCardModal({
  hand,
  requesterName,
  onGive,
  isCatCombo = false,
}: FavorGiveCardModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          {isCatCombo ? '🐱 Cat Combo!' : '🤝 Favor Requested'}
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
          {isCatCombo
            ? `${requesterName} played 2 of a kind. Choose a card to give.`
            : `${requesterName} played Favor. Choose a card to give.`}
        </p>

        {hand.length === 0 ? (
          <p className="text-center text-gray-500">You have no cards to give.</p>
        ) : (
          <>
            <div className="overflow-y-auto pb-2 mb-4 max-h-[60vh]">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 justify-items-center">
                {hand.map((card) => (
                  <div key={card.id} className="group relative">
                    <CardComponent
                      card={card}
                      onClick={() => onGive(card.id)}
                      selected={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              Click on a card to give it
            </p>
          </>
        )}
      </div>
    </div>
  );
}
