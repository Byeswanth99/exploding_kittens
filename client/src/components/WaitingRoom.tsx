import { Socket } from 'socket.io-client';
import { GameState } from '../types/game';

interface WaitingRoomProps {
  socket: Socket;
  gameState: GameState;
  yourPlayerId: string;
}

export default function WaitingRoom({ socket, gameState, yourPlayerId }: WaitingRoomProps) {
  const isHost = gameState.hostId === yourPlayerId;
  const canStart = gameState.players.length >= 2;

  const handleStartGame = () => {
    if (!isHost || !canStart) return;
    socket.emit('startGame', gameState.roomCode, (response: any) => {
      if (!response.success) {
        alert(response.error || 'Failed to start game');
      }
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    // You could add a toast notification here
    alert('Room code copied to clipboard!');
  };

  const getDeckInfo = () => {
    const config = gameState.deckConfiguration;
    const playerCount = gameState.players.length;
    
    if (config === 'small') return `Small Deck (2-3 players)`;
    if (config === 'medium') return `Medium Deck (4-7 players)`;
    return `Full Deck (8-10 players)`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
            💣 Game Lobby
          </h1>
          
          {/* Room code */}
          <div className="inline-flex items-center bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-full mb-2">
            <span className="text-sm mr-2">Room Code:</span>
            <span className="text-2xl font-bold tracking-wider">{gameState.roomCode}</span>
            <button
              onClick={copyRoomCode}
              className="ml-3 hover:scale-110 transition-transform"
              title="Copy room code"
            >
              📋
            </button>
          </div>
          
          {/* Deck configuration */}
          <p className="text-gray-600 text-sm mt-2">
            {getDeckInfo()}
          </p>
        </div>

        {/* Players list */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Players ({gameState.players.length}/10)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  player.id === yourPlayerId
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold mr-3">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {player.name}
                      {player.id === yourPlayerId && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                    {player.isHost && (
                      <p className="text-xs text-secondary">👑 Host</p>
                    )}
                  </div>
                </div>
                
                {/* Connection status */}
                <div className={`w-3 h-3 rounded-full ${
                  player.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} title={player.isConnected ? 'Connected' : 'Disconnected'} />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Play action cards to help yourself or hurt opponents</li>
            <li>• Draw a card at the end of your turn</li>
            <li>• If you draw an Exploding Kitten without a Defuse, you explode! 💥</li>
            <li>• Last player standing wins!</li>
          </ul>
        </div>

        {/* Start game button (host only) */}
        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className={`w-full font-bold py-4 px-6 rounded-lg transition-all ${
              canStart
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canStart ? '🚀 Start Game' : '⏳ Waiting for more players...'}
          </button>
        ) : (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">
              Waiting for host to start the game...
            </p>
            <div className="mt-2 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Share instructions */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Share the room code with your friends to join!</p>
        </div>
      </div>
    </div>
  );
}
