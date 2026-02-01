import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState, Card } from '../types/game';
import CardComponent from './CardComponent';
import PlayerHand from './PlayerHand';
import GameLog from './GameLog';
import DefusePlacement from './DefusePlacement';
import AlterFutureModal from './AlterFutureModal';
import PlayerSelectionModal from './PlayerSelectionModal';
import FavorGiveCardModal from './FavorGiveCardModal';

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
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [favorCardId, setFavorCardId] = useState<string | null>(null);
  const [canSkipDraw, setCanSkipDraw] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [showDrawnCard, setShowDrawnCard] = useState(false);

  const currentPlayer = gameState.players.find(p => p.id === yourPlayerId);
  const isYourTurn = gameState.currentTurnPlayerId === yourPlayerId;
  const isEliminated = currentPlayer?.isEliminated || false;
  const pendingFavor = gameState.pendingAction?.type === 'favor' && gameState.pendingAction.status === 'waiting'
    ? gameState.pendingAction
    : null;
  const isFavorTarget = pendingFavor?.targetPlayerId === yourPlayerId;
  const favorRequester = pendingFavor
    ? gameState.players.find(p => p.id === pendingFavor.initiatorId)
    : null;

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
          // Show defuse placement for exploding kitten
          setShowDefusePlacement(true);
        } else if (response.card && !response.exploded) {
          // Show drawn card popup for regular cards
          setDrawnCard(response.card);
          setShowDrawnCard(true);
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

  const handleGiveFavorCard = (cardId: string) => {
    if (!pendingFavor) return;
    socket.emit(
      'giveFavorCard',
      { requesterId: pendingFavor.initiatorId, cardId },
      (response: any) => {
        if (!response.success) {
          alert(response.error || 'Failed to give card');
        }
      }
    );
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

  const turnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  const allPlayers = gameState.players;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-1.5 md:p-3">
      {/* Mobile-first layout */}
      <div className="max-w-7xl mx-auto">
        {/* Top section - Turn indicator (mobile and desktop) */}
        <div className="mb-2 md:mb-3">
          {/* Turn indicator banner */}
          <div className={`
            rounded-lg shadow-lg p-2 md:p-2.5 text-center transition-all
            ${isYourTurn
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : 'bg-white text-gray-800'
            }
          `}>
            <p className="text-xs md:text-sm font-bold">
              {isYourTurn ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-2xl animate-pulse">🎯</span>
                  <span>Your Turn!</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">⏳</span>
                  <span>
                    {turnPlayer?.name}'s turn
                    {turnPlayer?.pendingTurns && turnPlayer.pendingTurns > 1 && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                        {turnPlayer.pendingTurns} turns
                      </span>
                    )}
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Middle section - Players, Deck, Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-2 md:mb-3">
          {/* Players Display (left sidebar on desktop, hidden on mobile - shown at top) */}
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-center">Players</h3>
              <div className="space-y-3">
                {allPlayers.map(player => {
                  const isCurrentTurn = player.id === gameState.currentTurnPlayerId;
                  const isYou = player.id === yourPlayerId;

                  return (
                    <div
                      key={player.id}
                      className={`
                        flex items-center p-2 rounded-lg transition-all
                        ${isCurrentTurn
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100'
                        }
                        ${player.isEliminated ? 'opacity-50 grayscale' : ''}
                      `}
                    >
                      {/* Turn indicator badge */}
                      {isCurrentTurn && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 animate-pulse">
                          <span className="text-xs">🎯</span>
                        </div>
                      )}

                      {/* Player avatar */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0
                        ${player.isEliminated
                          ? 'bg-gray-500'
                          : isYou
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gradient-to-r from-primary to-secondary'
                        }
                      `}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Player info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`
                            text-sm font-semibold truncate
                            ${isCurrentTurn ? 'text-white' : 'text-gray-800'}
                          `}>
                            {isYou ? 'You' : player.name}
                          </p>
                          {!isYou && !player.isEliminated && (
                            <div className={`
                              w-2 h-2 rounded-full flex-shrink-0
                              ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}
                            `} />
                          )}
                        </div>
                        {!player.isEliminated && (
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className={isCurrentTurn ? 'text-white' : 'text-gray-600'}>
                              🃏 {player.hand.length} cards
                            </span>
                            {player.pendingTurns > 0 && (
                              <span className={`
                                px-1.5 py-0.5 rounded text-xs font-semibold
                                ${isCurrentTurn ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'}
                              `}>
                                {player.pendingTurns}x
                              </span>
                            )}
                          </div>
                        )}
                        {player.isEliminated && (
                          <span className="text-xs text-red-600 font-semibold">💥 Eliminated</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center - Deck Only */}
          <div className="flex justify-center items-center">
            {/* Draw Pile */}
            <div className="relative">
              <button
                onClick={handleDrawCard}
                disabled={!isYourTurn || isEliminated || canSkipDraw}
                className={`w-20 h-28 md:w-24 md:h-36 rounded-lg shadow-lg transition-all ${
                  isYourTurn && !isEliminated && !canSkipDraw
                    ? 'bg-gradient-to-br from-red-500 to-pink-500 hover:scale-105 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-white text-center">
                  <div className="text-2xl md:text-3xl mb-1">🎴</div>
                  <div className="text-[10px] md:text-xs font-bold">{canSkipDraw ? 'SKIPPED' : 'DRAW'}</div>
                  <div className="text-xs md:text-sm">{gameState.deck.length}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right sidebar - Stats and Game Log (desktop) */}
          <div className="hidden md:block space-y-4">
            {/* Room info */}
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

            {/* Game Log - Small */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">Game Log</h3>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-1">
                  {gameState.gameLog.slice(-10).map((entry) => {
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
                    return (
                      <div
                        key={entry.id}
                        className={`
                          text-xs text-gray-700 flex items-start space-x-2
                          ${entry.type === 'player-exploded' && 'text-red-600 font-semibold'}
                          ${entry.type === 'turn-changed' && 'text-blue-600'}
                        `}
                      >
                        <span className="flex-shrink-0">{getLogIcon(entry.type)}</span>
                        <span className="flex-1 leading-snug">{entry.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Players Display - Mobile only (shown at top) */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-lg shadow-lg p-3">
            <h3 className="text-xs font-semibold text-gray-600 mb-3 text-center">
              Players
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {allPlayers.map(player => {
                const isCurrentTurn = player.id === gameState.currentTurnPlayerId;
                const isYou = player.id === yourPlayerId;

                return (
                  <div
                    key={player.id}
                    className={`
                      relative flex flex-col items-center p-2 rounded-lg transition-all
                      ${isCurrentTurn
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg scale-105 ring-2 ring-yellow-300'
                        : 'bg-gray-100'
                      }
                      ${player.isEliminated ? 'opacity-50 grayscale' : ''}
                    `}
                  >
                    {/* Turn indicator badge */}
                    {isCurrentTurn && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 animate-pulse">
                        <span className="text-xs">🎯</span>
                      </div>
                    )}

                    {/* Player avatar */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-1
                      ${player.isEliminated
                        ? 'bg-gray-500'
                        : isYou
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gradient-to-r from-primary to-secondary'
                      }
                    `}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Player name */}
                    <p className={`
                      text-xs font-semibold text-center mb-1 truncate max-w-[80px]
                      ${isCurrentTurn ? 'text-white' : 'text-gray-800'}
                    `}>
                      {isYou ? 'You' : player.name}
                    </p>

                    {/* Player stats */}
                    {!player.isEliminated && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className={isCurrentTurn ? 'text-white' : 'text-gray-600'}>
                          🃏 {player.hand.length}
                        </span>
                        {player.pendingTurns > 0 && (
                          <span className={`
                            ml-1 px-1.5 py-0.5 rounded text-xs font-semibold
                            ${isCurrentTurn ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'}
                          `}>
                            {player.pendingTurns}x
                          </span>
                        )}
                      </div>
                    )}

                    {/* Eliminated indicator */}
                    {player.isEliminated && (
                      <span className="text-xs text-red-600 font-semibold mt-1">💥</span>
                    )}

                    {/* Connection status (for opponents) */}
                    {!isYou && !player.isEliminated && (
                      <div className={`
                        w-2 h-2 rounded-full mt-1
                        ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isFavorTarget && currentPlayer && favorRequester && (
          <FavorGiveCardModal
            hand={currentPlayer.hand}
            requesterName={favorRequester.name}
            onGive={handleGiveFavorCard}
          />
        )}

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

      {/* Drawn Card Modal */}
      {showDrawnCard && drawnCard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center fade-in">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">🎴 Card Drawn!</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              You drew this card:
            </p>
            <div className="flex justify-center mb-6">
              <div className="transform scale-110">
                <CardComponent card={drawnCard} onClick={() => {}} disabled={true} />
              </div>
            </div>
            <button
              onClick={() => {
                setShowDrawnCard(false);
                setDrawnCard(null);
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
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
