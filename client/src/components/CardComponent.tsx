import { Card } from '../types/game';
import { getCardStyle } from '../utils/cardStyles';

interface CardComponentProps {
  card: Card;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  small?: boolean;
}

export default function CardComponent({
  card,
  onClick,
  disabled = false,
  selected = false,
  small = false
}: CardComponentProps) {
  // Check if card is hidden (for cat combo - face down cards)
  const isHidden = (card.type as any) === 'hidden' || card.type === undefined;
  const style = isHidden
    ? { gradient: 'from-gray-600 to-gray-800', emoji: '🂠', name: '?', description: 'Hidden card' }
    : getCardStyle(card.type);

  const sizeClasses = small
    ? 'w-14 h-20 text-xs'
    : 'w-16 h-24 md:w-20 md:h-28';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses}
        bg-gradient-to-br ${style.gradient}
        rounded-lg shadow-lg
        flex flex-col items-center justify-center
        text-white font-bold
        transition-all duration-200
        ${!disabled && 'card-hover cursor-pointer'}
        ${disabled && 'opacity-60 cursor-not-allowed'}
        ${selected && 'ring-4 ring-yellow-400 scale-105'}
        relative
      `}
    >
      {/* Card emoji */}
      <div className={`${small ? 'text-xl' : 'text-2xl md:text-3xl'} mb-1`}>
        {style.emoji}
      </div>

      {/* Card name */}
      <div className={`${small ? 'text-[7px]' : 'text-[9px] md:text-[10px]'} text-center px-1 leading-tight`}>
        {style.name}
      </div>

      {/* Tooltip on hover (desktop only) */}
      {!small && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black bg-opacity-90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50">
          {style.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black border-opacity-90"></div>
        </div>
      )}
    </button>
  );
}
