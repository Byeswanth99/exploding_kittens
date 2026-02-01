import { Player } from '../types/game';

interface PlayerSelectionModalProps {
  players: Player[];
  yourPlayerId: string;
  onSelect: (playerId: string) => void;
  onClose: () => void;
  title: string;
  message: string;
}

export default function PlayerSelectionModal({
  players,
  yourPlayerId,
  onSelect,
  onClose,
  title,
  message
}: PlayerSelectionModalProps) {
  // Filter out yourself and eliminated players
  const selectablePlayers = players.filter(
    p => p.id !== yourPlayerId && !p.isEliminated
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          {title}
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
          {message}
        </p>

        {/* Player list */}
        <div className="space-y-3 mb-6">
          {selectablePlayers.length === 0 ? (
            <p className="text-center text-gray-500">No players available</p>
          ) : (
            selectablePlayers.map(player => (
              <button
                key={player.id}
                onClick={() => onSelect(player.id)}
                className="w-full flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold mr-3">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{player.name}</p>
                  <p className="text-xs text-gray-600">
                    {player.hand.length} cards
                  </p>
                </div>
                <div className="text-primary">→</div>
              </button>
            ))
          )}
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
