import { 
  GameState, 
  Player, 
  Card, 
  GameLogEntry,
  PendingAction,
  CardViewRequest,
  SpectatorView,
  NopeEntry
} from '../types/game';
import { setupInitialGame, shuffleArray } from './DeckGenerator';
import { v4 as uuidv4 } from 'uuid';
import { CardType, isCatCard } from '../utils/cardDefinitions';

/**
 * Game Room
 * Manages a single game instance
 */
export class GameRoom {
  private gameState: GameState;

  constructor(roomCode: string, hostId: string, hostName: string) {
    // Create initial host player
    const hostPlayer: Player = {
      id: hostId,
      name: hostName,
      hand: [],
      isEliminated: false,
      isConnected: true,
      isHost: true,
      defuseCount: 0,
      pendingTurns: 0,
    };

    this.gameState = {
      roomCode,
      players: [hostPlayer],
      deck: [],
      discardPile: [],
      currentTurnPlayerId: null,
      gamePhase: 'lobby',
      hostId,
      pendingAction: null,
      spectatorViews: [],
      cardViewRequests: [],
      gameLog: [],
      deckConfiguration: 'medium',
      turnDirection: 'clockwise',
    };

    this.addLogEntry('game-created', hostId, hostName, undefined, 'Game created');
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Get all players
   */
  getPlayers(): Player[] {
    return this.gameState.players;
  }

  /**
   * Add a player to the room
   */
  addPlayer(playerId: string, playerName: string): Player | null {
    // Check if game already started
    if (this.gameState.gamePhase !== 'lobby') {
      return null;
    }

    // Check if room is full (max 10 players)
    if (this.gameState.players.length >= 10) {
      return null;
    }

    // Check if player already exists
    if (this.gameState.players.find(p => p.id === playerId)) {
      return null;
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: [],
      isEliminated: false,
      isConnected: true,
      isHost: false,
      defuseCount: 0,
      pendingTurns: 0,
    };

    this.gameState.players.push(newPlayer);
    this.addLogEntry('player-joined', playerId, playerName, undefined, `${playerName} joined the game`);

    return newPlayer;
  }

  /**
   * Remove a player from the room
   */
  removePlayer(playerId: string): void {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return;

    this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
    this.addLogEntry('player-left', playerId, player.name, undefined, `${player.name} left the game`);

    // If host left, assign new host
    if (playerId === this.gameState.hostId && this.gameState.players.length > 0) {
      this.gameState.hostId = this.gameState.players[0].id;
      this.gameState.players[0].isHost = true;
    }
  }

  /**
   * Start the game
   */
  startGame(): void {
    if (this.gameState.gamePhase !== 'lobby') return;
    if (this.gameState.players.length < 2) return;

    const playerCount = this.gameState.players.length;
    const { deck, playerHands, deckConfiguration } = setupInitialGame(playerCount);

    // Assign hands to players
    this.gameState.players.forEach((player, index) => {
      player.hand = playerHands[index];
      player.defuseCount = player.hand.filter(c => c.type === 'defuse').length;
      player.pendingTurns = 0;
    });

    this.gameState.deck = deck;
    this.gameState.deckConfiguration = deckConfiguration;
    this.gameState.gamePhase = 'playing';
    
    // Set first player's turn
    this.gameState.currentTurnPlayerId = this.gameState.players[0].id;
    this.gameState.players[0].pendingTurns = 1;

    this.addLogEntry('game-started', undefined, undefined, undefined, 
      `Game started with ${playerCount} players! Deck: ${deckConfiguration} (${deck.length} cards)`);
    this.addLogEntry('turn-changed', this.gameState.players[0].id, this.gameState.players[0].name, 
      undefined, `${this.gameState.players[0].name}'s turn`);
  }

  /**
   * Add a log entry
   */
  private addLogEntry(
    type: GameLogEntry['type'],
    playerId?: string,
    playerName?: string,
    cardType?: CardType,
    message?: string,
    targetPlayerId?: string,
    targetPlayerName?: string
  ): void {
    const entry: GameLogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      type,
      playerId,
      playerName,
      cardType,
      targetPlayerId,
      targetPlayerName,
      message: message || '',
    };
    this.gameState.gameLog.push(entry);
    
    // Keep only last 50 entries
    if (this.gameState.gameLog.length > 50) {
      this.gameState.gameLog = this.gameState.gameLog.slice(-50);
    }
  }

  /**
   * Get next player in turn order
   */
  private getNextPlayer(currentPlayerId: string): Player | null {
    const activePlayers = this.gameState.players.filter(p => !p.isEliminated);
    const currentIndex = activePlayers.findIndex(p => p.id === currentPlayerId);
    
    if (currentIndex === -1) return null;
    
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    return activePlayers[nextIndex];
  }

  /**
   * End current turn and move to next player
   */
  endTurn(): void {
    const currentPlayer = this.gameState.players.find(p => p.id === this.gameState.currentTurnPlayerId);
    if (!currentPlayer) return;

    // Decrease pending turns
    if (currentPlayer.pendingTurns > 0) {
      currentPlayer.pendingTurns--;
    }

    // If player still has pending turns, they continue
    if (currentPlayer.pendingTurns > 0) {
      this.addLogEntry('turn-changed', currentPlayer.id, currentPlayer.name, 
        undefined, `${currentPlayer.name}'s turn (${currentPlayer.pendingTurns} more turn(s))`);
      return;
    }

    // Move to next player
    const nextPlayer = this.getNextPlayer(currentPlayer.id);
    if (nextPlayer) {
      this.gameState.currentTurnPlayerId = nextPlayer.id;
      nextPlayer.pendingTurns = 1;
      this.addLogEntry('turn-changed', nextPlayer.id, nextPlayer.name, 
        undefined, `${nextPlayer.name}'s turn`);
    }
  }

  /**
   * Check if game is over
   */
  checkGameEnd(): Player | null {
    const activePlayers = this.gameState.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 1) {
      this.gameState.gamePhase = 'gameEnd';
      return activePlayers[0];
    }
    return null;
  }

  /**
   * Play a card
   */
  playCard(playerId: string, cardId: string, data?: any): { success: boolean; error?: string; requiresAction?: string } {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Check if it's player's turn
    if (this.gameState.currentTurnPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const card = player.hand[cardIndex];
    
    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    
    // Update defuse count
    if (card.type === 'defuse') {
      player.defuseCount--;
    }
    
    // Add to discard pile
    this.gameState.discardPile.push(card);
    
    // Handle card effects
    const cardEffect = this.handleCardEffect(playerId, card.type, data);
    
    this.addLogEntry('card-played', playerId, player.name, card.type, 
      `${player.name} played ${card.type}`);

    return cardEffect;
  }

  /**
   * Handle card effects
   */
  private handleCardEffect(playerId: string, cardType: CardType, data?: any): { success: boolean; error?: string; requiresAction?: string } {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    switch (cardType) {
      case 'skip':
        // Skip drawing - end turn immediately
        player.pendingTurns = Math.max(0, player.pendingTurns - 1);
        if (player.pendingTurns === 0) {
          this.endTurn();
        }
        this.addLogEntry('card-played', playerId, player.name, cardType, 
          `${player.name} skipped their turn`);
        return { success: true };

      case 'attack':
        // End turn without drawing, next player takes 2 turns
        player.pendingTurns = 0;
        const nextPlayer = this.getNextPlayer(playerId);
        if (nextPlayer) {
          nextPlayer.pendingTurns += 2;
          this.gameState.currentTurnPlayerId = nextPlayer.id;
          this.addLogEntry('turn-changed', nextPlayer.id, nextPlayer.name, 
            undefined, `${nextPlayer.name}'s turn (${nextPlayer.pendingTurns} turns)`);
        }
        return { success: true };

      case 'favor':
        // Requires target player to be selected
        if (!data?.targetPlayerId) {
          return { success: false, error: 'Target player required' };
        }
        return { success: true, requiresAction: 'favor' };

      case 'shuffle':
        // Shuffle is handled separately
        return { success: true };

      case 'see-the-future':
      case 'alter-the-future':
        // These are handled separately
        return { success: true };

      default:
        // Cat cards and other cards
        return { success: true };
    }
  }

  /**
   * Draw a card from deck
   */
  drawCard(playerId: string): { card: Card | null; exploded: boolean } {
    if (this.gameState.deck.length === 0) {
      return { card: null, exploded: false };
    }

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return { card: null, exploded: false };

    const card = this.gameState.deck.pop()!;

    // Check if it's an Exploding Kitten
    if (card.type === 'exploding-kitten') {
      // Check if player has a Defuse
      if (player.defuseCount > 0) {
        // Player can defuse
        return { card, exploded: false };
      } else {
        // Player explodes
        player.isEliminated = true;
        this.gameState.discardPile.push(card);
        this.addLogEntry('player-exploded', playerId, player.name, undefined, 
          `${player.name} exploded! 💥`);
        
        // End turn and move to next player
        this.endTurn();
        
        return { card, exploded: true };
      }
    }

    // Regular card
    player.hand.push(card);
    this.addLogEntry('card-drawn', playerId, player.name, undefined, 
      `${player.name} drew a card`);

    return { card, exploded: false };
  }

  /**
   * Defuse an Exploding Kitten
   */
  defuseKitten(playerId: string, insertPosition: number): boolean {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return false;

    // Find and remove defuse card
    const defuseIndex = player.hand.findIndex(c => c.type === 'defuse');
    if (defuseIndex === -1) return false;

    const defuseCard = player.hand.splice(defuseIndex, 1)[0];
    player.defuseCount--;
    this.gameState.discardPile.push(defuseCard);

    // Create new Exploding Kitten and insert at position
    const explodingKitten: Card = {
      id: uuidv4(),
      type: 'exploding-kitten',
    };
    
    const position = Math.max(0, Math.min(insertPosition, this.gameState.deck.length));
    this.gameState.deck.splice(position, 0, explodingKitten);

    this.addLogEntry('player-defused', playerId, player.name, undefined, 
      `${player.name} defused an Exploding Kitten! 🛡️`);

    return true;
  }

  /**
   * Shuffle the deck
   */
  shuffleDeck(): void {
    this.gameState.deck = shuffleArray(this.gameState.deck);
  }

  /**
   * Get top N cards from deck (for See the Future / Alter the Future)
   */
  peekDeck(count: number): Card[] {
    return this.gameState.deck.slice(-count).reverse();
  }

  /**
   * Rearrange top N cards (for Alter the Future)
   */
  rearrangeDeck(cards: Card[]): void {
    // Remove top N cards
    this.gameState.deck = this.gameState.deck.slice(0, -cards.length);
    // Add rearranged cards back
    this.gameState.deck.push(...cards.reverse());
  }

  /**
   * Handle Favor - give card to requesting player
   */
  giveFavorCard(giverId: string, receiverId: string, cardId: string): boolean {
    const giver = this.gameState.players.find(p => p.id === giverId);
    const receiver = this.gameState.players.find(p => p.id === receiverId);
    
    if (!giver || !receiver) return false;

    const cardIndex = giver.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;

    const card = giver.hand.splice(cardIndex, 1)[0];
    receiver.hand.push(card);

    // Update defuse counts
    if (card.type === 'defuse') {
      giver.defuseCount--;
      receiver.defuseCount++;
    }

    this.addLogEntry('card-played', receiverId, receiver.name, undefined,
      `${receiver.name} received a card from ${giver.name} (Favor)`);

    return true;
  }

  /**
   * Get sanitized game state for a specific player
   * Hides other players' defuse counts and hands
   */
  getSanitizedGameState(requestingPlayerId: string): GameState {
    const sanitized = { ...this.gameState };
    sanitized.players = this.gameState.players.map(p => {
      if (p.id === requestingPlayerId) {
        // Show full data for requesting player
        return { ...p };
      } else {
        // Hide sensitive info for other players
        return {
          ...p,
          hand: p.hand.map(card => ({ ...card, type: 'hidden' as any })), // Hide card types
          defuseCount: -1, // Hide defuse count
        };
      }
    });
    return sanitized;
  }
}
