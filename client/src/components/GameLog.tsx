import { GameLogEntry } from '../types/game';
import { useEffect, useRef } from 'react';

interface GameLogProps {
  gameLog: GameLogEntry[];
  compact?: boolean;
}

export default function GameLog({ gameLog, compact = false }: GameLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameLog]);

  const getLogIcon = (type: string): string => {
    switch (type) {
      case 'card-played': return '🎴';
      case 'card-drawn': return '📥';
      case 'player-exploded': return '💥';
      case 'player-defused': return '🛡️';
      case 'turn-changed': return '🔄';
      case 'game-started': return '🎮';
      case 'player-joined': return '👋';
      case 'player-left': return '👋';
      default: return '📝';
    }
  };

  const displayedLogs = compact ? gameLog.slice(-3) : gameLog;

  return (
    <div className={`
      bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg
      ${compact ? 'p-2' : 'p-4'}
      ${compact ? '' : 'h-64 md:h-80 flex flex-col'}
    `}>
      {!compact && (
        <h3 className="font-bold text-gray-800 mb-3 text-sm md:text-base flex-shrink-0">Game Log</h3>
      )}

      <div className={`
        ${compact ? 'space-y-1' : 'space-y-2 overflow-y-auto flex-1 min-h-0'}
      `}>
        {displayedLogs.length === 0 ? (
          <p className="text-gray-500 text-xs text-center">No events yet</p>
        ) : (
          displayedLogs.map((entry) => (
            <div
              key={entry.id}
              className={`
                ${compact ? 'text-xs' : 'text-xs md:text-sm'}
                text-gray-700 flex items-start space-x-2
                ${entry.type === 'player-exploded' && 'text-red-600 font-semibold'}
                ${entry.type === 'turn-changed' && 'text-blue-600'}
                fade-in
              `}
            >
              <span className="flex-shrink-0">{getLogIcon(entry.type)}</span>
              <span className="flex-1 leading-snug">{entry.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
