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
  const style = getCardStyle(card.type);
  
  const sizeClasses = small 
    ? 'w-16 h-24 text-xs' 
    : 'w-20 h-32 md:w-24 md:h-36';

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
      <div className={`${small ? 'text-2xl' : 'text-3xl md:text-4xl'} mb-1`}>
        {style.emoji}
      </div>
      
      {/* Card name */}
      <div className={`${small ? 'text-[8px]' : 'text-[10px] md:text-xs'} text-center px-1 leading-tight`}>
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
