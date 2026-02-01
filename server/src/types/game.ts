import { CardType } from '../utils/cardDefinitions';

/**
 * Game Types for Exploding Kittens
 */

export interface Card {
  id: string; // Unique identifier for each card instance
  type: CardType;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isEliminated: boolean;
  isConnected: boolean;
  isHost: boolean;
  defuseCount: number; // Quick access for UI
  pendingTurns: number; // Number of turns this player needs to take (from Attack cards)
}

export type GamePhase = 'lobby' | 'playing' | 'gameEnd';

export interface CardViewRequest {
  requestId: string;
  spectatorId: string;
  spectatorName: string;
  targetPlayerId: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

export interface SpectatorView {
  playerId: string;
  allowedSpectators: string[]; // IDs of spectators who can see this player's hand
}

export interface NopeEntry {
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface PendingAction {
  actionId: string;
  type: 'favor' | 'cat-combo' | 'shuffle' | 'see-the-future' | 'alter-the-future' | 'attack' | 'skip';
  initiatorId: string;
  targetPlayerId?: string; // For Favor and Cat combos
  cardIds?: string[]; // For Cat combos
  comboType?: '2-kind' | '3-kind' | '5-diff'; // For Cat combos
  requestedCardType?: CardType; // For 3-of-a-kind combo
  nopeChain: NopeEntry[];
  status: 'waiting' | 'resolved';
  createdAt: number;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentTurnPlayerId: string | null;
  gamePhase: GamePhase;
  hostId: string;
  pendingAction: PendingAction | null;
  spectatorViews: SpectatorView[]; // Who can see whose hand
  cardViewRequests: CardViewRequest[]; // Pending view requests
  gameLog: GameLogEntry[]; // Action history
  deckConfiguration: 'small' | 'medium' | 'full';
  turnDirection: 'clockwise'; // Could add counter-clockwise for expansions
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  type: 'card-played' | 'card-drawn' | 'player-exploded' | 'player-defused' | 'nope-played' | 'action-resolved' | 'turn-changed' | 'game-started' | 'player-joined' | 'player-left';
  playerId?: string;
  playerName?: string;
  cardType?: CardType;
  targetPlayerId?: string;
  targetPlayerName?: string;
  message: string; // Human-readable message
}

/**
 * Socket Event Payloads
 */

// Client -> Server
export interface CreateGamePayload {
  playerName: string;
}

export interface JoinGamePayload {
  roomCode: string;
  playerName: string;
}

export interface PlayCardPayload {
  cardId: string;
  targetPlayerId?: string;
  data?: any; // Additional data for specific cards
}

export interface PlayCatComboPayload {
  cardIds: string[];
  comboType: '2-kind' | '3-kind' | '5-diff';
  targetPlayerId?: string;
  requestedCardType?: CardType;
}

export interface DrawCardPayload {
  // No parameters needed for basic draw
}

export interface DefuseKittenPayload {
  insertPosition: number; // 0 to deck.length (inclusive)
}

export interface PlayNopePayload {
  actionId: string;
}

export interface ResolveActionPayload {
  actionId: string;
}

export interface SelectCardToGivePayload {
  requestId: string;
  cardId: string;
}

export interface RequestCardViewPayload {
  targetPlayerId: string;
}

export interface RespondViewRequestPayload {
  requestId: string;
  accepted: boolean;
}

export interface RevokeCardViewPayload {
  spectatorId: string;
}

// Server -> Client
export interface GameStatePayload {
  gameState: GameState;
  yourPlayerId: string;
}

export interface CardPlayedPayload {
  playerId: string;
  playerName: string;
  cardType: CardType;
  targetPlayerId?: string;
}

export interface PlayerExplodedPayload {
  playerId: string;
  playerName: string;
}

export interface ActionPendingPayload {
  action: PendingAction;
}

export interface SeeFutureResultPayload {
  cards: Card[]; // Top 3 cards
}

export interface AlterFutureResultPayload {
  cards: Card[]; // Top 3 cards to rearrange
}

export interface ViewRequestReceivedPayload {
  request: CardViewRequest;
}

export interface SpectatorHandUpdatePayload {
  targetPlayerId: string;
  hand: Card[];
}
