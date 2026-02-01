// Copy of server types for client use
export type CardType =
  | 'exploding-kitten'
  | 'defuse'
  | 'nope'
  | 'attack'
  | 'skip'
  | 'favor'
  | 'shuffle'
  | 'see-the-future'
  | 'cat-taco'
  | 'cat-hairy-potato'
  | 'cat-rainbow-ralphing'
  | 'cat-beard'
  | 'cat-cattermelon'
  | 'alter-the-future'
  | 'feral-cat';

export interface Card {
  id: string;
  type: CardType;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isEliminated: boolean;
  isConnected: boolean;
  isHost: boolean;
  defuseCount: number;
  pendingTurns: number;
}

export type GamePhase = 'lobby' | 'playing' | 'gameEnd';

export interface NopeEntry {
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface PendingAction {
  actionId: string;
  type: 'favor' | 'cat-combo' | 'shuffle' | 'see-the-future' | 'alter-the-future' | 'attack' | 'skip';
  initiatorId: string;
  targetPlayerId?: string;
  cardIds?: string[];
  comboType?: '2-kind' | '3-kind' | '5-diff';
  requestedCardType?: CardType;
  nopeChain: NopeEntry[];
  status: 'waiting' | 'resolved';
  createdAt: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  type: string;
  playerId?: string;
  playerName?: string;
  cardType?: CardType;
  message: string;
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
  gameLog: GameLogEntry[];
  deckConfiguration: 'small' | 'medium' | 'full';
}
