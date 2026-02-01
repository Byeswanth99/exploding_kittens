import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState, Card } from '../types/game';
import CardComponent from './CardComponent';
import PlayerHand from './PlayerHand';
import OpponentView from './OpponentView';
import GameLog from './GameLog';
import DefusePlacement from './DefusePlacement';
import AlterFutureModal from './AlterFutureModal';
import PlayerSelectionModal from './PlayerSelectionModal';

interface GameBoardProps {
  socket: Socket;
  gameState: GameState;
  yourPlayerId: string;
}

export default function GameBoard({ socket, gameState, yourPlayerId }: GameBoardProps) {
  const [showDefusePlacement, setShowDefusePlacement] = useState(false);
  const [showAlterFuture, setShowAlterFuture] = useState(false);
  const [alterFutureCards, setAlterFutureCards] = useState<Card[]>([]);
  const [seeFutureCards, setSeeFutureCards] = useState<Card[]>([]);
  const [showSeeFuture, setShowSeeFuture] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [favorCardId, setFavorCardId] = useState<string | null>(null);
  const [canSkipDraw, setCanSkipDraw] = useState(false);

  const currentPlayer = gameState.players.find(p => p.id === yourPlayerId);
  const isYourTurn = gameState.currentTurnPlayerId === yourPlayerId;
  const isEliminated = currentPlayer?.isEliminated || false;

  useEffect(() => {
    if (!socket) return;

    // Listen for game end
    socket.on('gameEnd', (data: any) => {
      alert(`🎉 ${data.winnerName} wins!`);
    });

    return () => {
      socket.off('gameEnd');
    };
  }, [socket]);

  const handlePlayCard = (cardId: string, cardType: string) => {
    if (!isYourTurn || isEliminated) return;

    // Handle special cards
    if (cardType === 'skip') {
      socket.emit('playCard', { cardId }, (response: any) => {
        if (response.success) {
          setCanSkipDraw(true); // Skip card played - no draw needed
        } else {
          alert(response.error || 'Failed to play card');
        }
      });
      return;
    }

    if (cardType === 'attack') {
      socket.emit('playCard', { cardId }, (response: any) => {
        if (response.success) {
          setCanSkipDraw(true); // Attack card played - no draw needed
        } else {
          alert(response.error || 'Failed to play card');
        }
      });
      return;
    }

    if (cardType === 'favor') {
      // Show player selection modal
      setFavorCardId(cardId);
      setShowPlayerSelection(true);
      return;
    }

    if (cardType === 'see-the-future') {
      socket.emit('seeTheFuture', (response: any) => {
        if (response.success) {
          setSeeFutureCards(response.cards);
          setShowSeeFuture(true);
        }
      });
      socket.emit('playCard', { cardId }, (response: any) => {
        if (!response.success) {
          alert(response.error || 'Failed to play card');
        }
      });
      return;
    }

    if (cardType === 'alter-the-future') {
      socket.emit('seeTheFuture', (response: any) => {
        if (response.success) {
          setAlterFutureCards(response.cards);
          setShowAlterFuture(true);
        }
      });
      socket.emit('playCard', { cardId }, (response: any) => {
        if (!response.success) {
          alert(response.error || 'Failed to play card');
        }
      });
      return;
    }

    if (cardType === 'shuffle') {
      socket.emit('playCard', { cardId }, (response: any) => {
        if (response.success) {
          socket.emit('shuffleDeck', (shuffleResponse: any) => {
            if (!shuffleResponse.success) {
              alert('Failed to shuffle deck');
            }
          });
        }
      });
      return;
    }

    // Regular card play
    socket.emit('playCard', { cardId }, (response: any) => {
      if (!response.success) {
        alert(response.error || 'Failed to play card');
      }
    });
  };

  const handlePlayerSelection = (targetPlayerId: string) => {
    if (!favorCardId) return;

    socket.emit('playCard', { 
      cardId: favorCardId, 
      targetPlayerId 
    }, (response: any) => {
      if (response.success) {
        setShowPlayerSelection(false);
        setFavorCardId(null);
        // Target player will need to give a card
        alert('Waiting for player to give you a card...');
      } else {
        alert(response.error || 'Failed to play favor');
      }
    });
  };

  const handleDrawCard = () => {
    if (!isYourTurn || isEliminated) return;

    socket.emit('drawCard', (response: any) => {
      if (response.success) {
        setCanSkipDraw(false); // Reset skip flag
        if (response.needsDefuse) {
          setShowDefusePlacement(true);
        }
      } else {
        alert(response.error || 'Failed to draw card');
      }
    });
  };

  // Reset skip flag when turn changes
  useEffect(() => {
    if (isYourTurn) {
      setCanSkipDraw(false);
    }
  }, [isYourTurn]);

  const handleDefusePlacement = (position: number) => {
    socket.emit('defuseKitten', { insertPosition: position }, (response: any) => {
      if (response.success) {
        setShowDefusePlacement(false);
      } else {
        alert(response.error || 'Failed to defuse kitten');
      }
    });
  };

  const handleAlterFuture = (rearrangedCards: Card[]) => {
    socket.emit('alterTheFuture', rearrangedCards, (response: any) => {
      if (response.success) {
        setShowAlterFuture(false);
        setAlterFutureCards([]);
      } else {
        alert(response.error || 'Failed to alter future');
      }
    });
  };

  if (gameState.gamePhase === 'gameEnd') {
    const winner = gameState.players.find(p => !p.isEliminated);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
            Game Over!
          </h1>
          <p className="text-2xl text-gray-800 mb-8">
            {winner?.name} wins!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const opponents = gameState.players.filter(p => p.id !== yourPlayerId);
  const turnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-2 md:p-4">
      {/* Mobile-first layout */}
      <div className="max-w-7xl mx-auto">
        {/* Top section - Opponents */}
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            {opponents.map(opponent => (
              <OpponentView key={opponent.id} player={opponent} />
            ))}
          </div>
          
          {/* Turn indicator */}
          <div className="bg-white rounded-lg shadow-lg p-3 text-center">
            <p className="text-sm md:text-base font-semibold">
              {isYourTurn ? (
                <span className="text-green-600">🎯 Your Turn!</span>
              ) : (
                <span className="text-gray-600">
                  {turnPlayer?.name}'s turn
                  {turnPlayer?.pendingTurns && turnPlayer.pendingTurns > 1 && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      {turnPlayer.pendingTurns} turns
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Middle section - Deck and Discard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Game Log (hidden on mobile, sidebar on desktop) */}
          <div className="hidden md:block">
            <GameLog gameLog={gameState.gameLog} />
          </div>

          {/* Center - Deck and Discard */}
          <div className="flex justify-center items-center space-x-4">
            {/* Draw Pile */}
            <div className="relative">
              <button
                onClick={handleDrawCard}
                disabled={!isYourTurn || isEliminated || canSkipDraw}
                className={`w-24 h-36 md:w-32 md:h-48 rounded-lg shadow-lg transition-all ${
                  isYourTurn && !isEliminated && !canSkipDraw
                    ? 'bg-gradient-to-br from-red-500 to-pink-500 hover:scale-105 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-white text-center">
                  <div className="text-3xl mb-2">🎴</div>
                  <div className="text-xs font-bold">{canSkipDraw ? 'SKIPPED' : 'DRAW'}</div>
                  <div className="text-sm">{gameState.deck.length}</div>
                </div>
              </button>
            </div>

            {/* Discard Pile */}
            <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg shadow-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              {gameState.discardPile.length > 0 ? (
                <CardComponent 
                  card={gameState.discardPile[gameState.discardPile.length - 1]} 
                  onClick={() => {}}
                  disabled={true}
                />
              ) : (
                <div className="text-white text-center">
                  <div className="text-2xl">🗑️</div>
                  <div className="text-xs">DISCARD</div>
                </div>
              )}
            </div>
          </div>

          {/* Room info (desktop) */}
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">Room: {gameState.roomCode}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Deck: {gameState.deckConfiguration}</p>
                <p>Players: {gameState.players.filter(p => !p.isEliminated).length}</p>
                {currentPlayer && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-semibold text-gray-800">Your Stats:</p>
                    <p>Defuses: {currentPlayer.defuseCount}</p>
                    <p>Cards: {currentPlayer.hand.length}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Your Hand */}
        {currentPlayer && !isEliminated && (
          <PlayerHand
            hand={currentPlayer.hand}
            onPlayCard={handlePlayCard}
            canPlay={isYourTurn}
          />
        )}

        {/* Eliminated overlay */}
        {isEliminated && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 text-center max-w-md">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-bold text-red-600 mb-2">You Exploded!</h2>
              <p className="text-gray-600 mb-4">You can still watch the game as a spectator</p>
              <button
                onClick={() => setShowDefusePlacement(false)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Continue Watching
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDefusePlacement && (
        <DefusePlacement
          deckSize={gameState.deck.length}
          onPlace={handleDefusePlacement}
          onClose={() => setShowDefusePlacement(false)}
        />
      )}

      {showAlterFuture && (
        <AlterFutureModal
          cards={alterFutureCards}
          onConfirm={handleAlterFuture}
          onClose={() => {
            setShowAlterFuture(false);
            setAlterFutureCards([]);
          }}
        />
      )}

      {showSeeFuture && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-4">🔮 Future Cards</h2>
            <p className="text-center text-gray-600 mb-4 text-sm">
              Top 3 cards (you'll draw from bottom to top)
            </p>
            <div className="flex justify-center space-x-2 mb-6">
              {seeFutureCards.map((card, index) => (
                <div key={card.id} className="transform scale-90">
                  <CardComponent card={card} onClick={() => {}} disabled={true} />
                  <p className="text-center text-xs mt-1"># {index + 1}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setShowSeeFuture(false);
                setSeeFutureCards([]);
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showPlayerSelection && (
        <PlayerSelectionModal
          players={gameState.players}
          yourPlayerId={yourPlayerId}
          onSelect={handlePlayerSelection}
          onClose={() => {
            setShowPlayerSelection(false);
            setFavorCardId(null);
          }}
          title="🤝 Play Favor"
          message="Choose a player to take a card from"
        />
      )}

      {/* Mobile Game Log (swipeable drawer) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-32 overflow-hidden">
        <div className="p-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2"></div>
          <GameLog gameLog={gameState.gameLog.slice(-3)} compact />
        </div>
      </div>
    </div>
  );
}
