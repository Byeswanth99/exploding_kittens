import { Player } from '../types/game';

interface OpponentViewProps {
  player: Player;
}

export default function OpponentView({ player }: OpponentViewProps) {
  return (
    <div className={`
      bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg
      ${player.isEliminated ? 'opacity-50 grayscale' : ''}
      fade-in
    `}>
      {/* Player avatar */}
      <div className="flex items-center mb-2">
        <div className={`
          w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold mr-2
          ${player.isEliminated 
            ? 'bg-gray-500' 
            : 'bg-gradient-to-r from-primary to-secondary'}
        `}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {player.name}
          </p>
          <div className="flex items-center space-x-2 text-xs">
            {player.isEliminated ? (
              <span className="text-red-600">💥 Eliminated</span>
            ) : (
              <>
                <span className={`
                  w-2 h-2 rounded-full
                  ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}
                `} />
                <span className="text-gray-600">
                  {player.isConnected ? 'Online' : 'Offline'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Player stats */}
      {!player.isEliminated && (
        <div className="flex justify-between text-xs text-gray-600">
          <div className="flex items-center">
            <span className="mr-1">🃏</span>
            <span>{player.hand.length}</span>
          </div>
          {/* Hide defuse count from opponents (private info) */}
          {player.pendingTurns > 0 && (
            <div className="flex items-center bg-orange-100 px-2 rounded">
              <span className="text-orange-600 font-semibold">
                {player.pendingTurns}x
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
