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
  gameLog: GameLogEntry[];
  deckConfiguration: 'small' | 'medium' | 'full';
}
