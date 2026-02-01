import { useState } from 'react';
import { Socket } from 'socket.io-client';

interface LobbyProps {
  socket: Socket;
}

export default function Lobby({ socket }: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setError('');
    setIsCreating(true);

    socket.emit('createGame', { playerName: playerName.trim() }, (response: any) => {
      setIsCreating(false);
      if (!response.success) {
        setError(response.error || 'Failed to create game');
      }
      // Success - App component will receive gameState via socket event
    });
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }

    setError('');
    setIsJoining(true);

    socket.emit('joinGame', { 
      roomCode: roomCode.trim().toUpperCase(), 
      playerName: playerName.trim() 
    }, (response: any) => {
      setIsJoining(false);
      if (!response.success) {
        setError(response.error || 'Failed to join game');
      }
      // Success - App component will receive gameState via socket event
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
            💣 Exploding Kittens
          </h1>
          <p className="text-gray-600">A game of luck, strategy, and kittens!</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Player name input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
            maxLength={20}
          />
        </div>

        {/* Create game button */}
        <button
          onClick={handleCreateGame}
          disabled={isCreating || !playerName.trim()}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating...
            </span>
          ) : (
            '🎮 Create New Game'
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Join game section */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
            placeholder="Enter room code"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors uppercase"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleJoinGame}
          disabled={isJoining || !playerName.trim() || !roomCode.trim()}
          className="w-full bg-gradient-to-r from-secondary to-accent text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isJoining ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Joining...
            </span>
          ) : (
            '🚪 Join Game'
          )}
        </button>

        {/* Info */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-sm text-gray-700 text-center">
            <strong>2-10 players</strong> • Mobile & Desktop friendly
          </p>
        </div>
      </div>
    </div>
  );
}
