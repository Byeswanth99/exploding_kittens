import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameBoard from './components/GameBoard';
import { GameState } from './types/game';

function App() {
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomCodeFromUrl, setRoomCodeFromUrl] = useState<string | null>(null);

  // Use socket.id directly - each client knows their own ID
  const yourPlayerId = socket?.id || '';

  // Check for room code in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    if (room) {
      setRoomCodeFromUrl(room.toUpperCase());
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for game state updates
    socket.on('gameState', (payload: any) => {
      setGameState(payload.gameState);
    });

    return () => {
      socket.off('gameState');
    };
  }, [socket]);

  if (!isConnected) {
    return (
      <div className="h-screen flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Lobby - no game yet
  if (!gameState) {
    return <Lobby socket={socket!} initialRoomCode={roomCodeFromUrl} />;
  }

  // Waiting room - game created but not started
  if (gameState.gamePhase === 'lobby') {
    return (
      <WaitingRoom
        socket={socket!}
        gameState={gameState}
        yourPlayerId={yourPlayerId}
      />
    );
  }

  // Game in progress or ended
  return (
    <div className="h-screen overflow-hidden">
      <GameBoard
        socket={socket!}
        gameState={gameState}
        yourPlayerId={yourPlayerId}
      />
    </div>
  );
}

export default App;
