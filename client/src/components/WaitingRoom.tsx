import { useState, useEffect } from 'react';
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [defuseCount, setDefuseCount] = useState<string>('0');
  const defaultKittenCount = gameState.players.length - 1;
  const [explodingKittenCount, setExplodingKittenCount] = useState<string>(defaultKittenCount.toString());

  // Update exploding kitten count when player count changes
  useEffect(() => {
    setExplodingKittenCount((gameState.players.length - 1).toString());
  }, [gameState.players.length]);

  const handleStartGame = () => {
    if (!isHost || !canStart) return;

    // Parse and validate the counts
    const defuseCountNum = parseInt(defuseCount) || 0;
    const kittenCountNum = parseInt(explodingKittenCount) || defaultKittenCount;

    socket.emit('startGame', {
      roomCode: gameState.roomCode,
      defuseCount: Math.max(0, defuseCountNum),
      explodingKittenCount: Math.max(1, kittenCountNum)
    }, (response: any) => {
      if (!response.success) {
        alert(response.error || 'Failed to start game');
      }
    });
  };

  const getShareableLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?room=${gameState.roomCode}`;
  };

  const copyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.roomCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy room code');
    }
  };

  const getDeckInfo = () => {
    const config = gameState.deckConfiguration;

    if (config === 'small') return `Small Deck (2-3 players)`;
    if (config === 'medium') return `Medium Deck (4-7 players)`;
    return `Full Deck (8-10 players)`;
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4 py-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full fade-in my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
            💣 Game Lobby
          </h1>

          {/* Room code */}
          <div className="inline-flex items-center bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-full mb-4">
            <span className="text-sm mr-2">Room Code:</span>
            <span className="text-2xl font-bold tracking-wider">{gameState.roomCode}</span>
            <button
              onClick={copyRoomCode}
              className="ml-3 hover:scale-110 transition-transform"
              title="Copy room code"
            >
              {codeCopied ? '✓' : '📋'}
            </button>
          </div>

          {/* Shareable link */}
          <div className="mb-4">
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">Shareable Link:</span>
                <button
                  onClick={copyShareableLink}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    linkCopied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {linkCopied ? '✓ Copied!' : '📤 Copy Link'}
                </button>
              </div>
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-xs text-gray-600 break-all font-mono">
                  {getShareableLink()}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Share this link with friends - they'll join automatically!
              </p>
            </div>
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

        {/* Game Configuration (host only) */}
        {isHost && (
          <div className="mb-6 space-y-4">
            {/* Defuse Count Input */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Additional Defuse Cards in Deck (default: 0)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={defuseCount}
                onChange={(e) => setDefuseCount(e.target.value)}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 0) {
                    setDefuseCount('0');
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Each player gets 1 defuse card by default. This number adds extra defuse cards to the deck.
              </p>
            </div>

            {/* Exploding Kitten Count Input */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Number of Exploding Kitten Cards (default: {defaultKittenCount})
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={explodingKittenCount}
                onChange={(e) => setExplodingKittenCount(e.target.value)}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 1) {
                    setExplodingKittenCount(defaultKittenCount.toString());
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder={defaultKittenCount.toString()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of exploding kitten cards in the deck. Default is (number of players - 1).
              </p>
            </div>
          </div>
        )}

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
