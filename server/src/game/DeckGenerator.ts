import { Card } from '../types/game';
import { CardType, getRegularCatCards } from '../utils/cardDefinitions';
import { v4 as uuidv4 } from 'uuid';

/**
 * Dynamic Deck Generator
 * Automatically configures deck based on player count
 */

interface DeckConfig {
  playerRange: [number, number];
  deckSize: 'small' | 'medium' | 'full';
  feralCats: number;
}

const DECK_CONFIGS: DeckConfig[] = [
  { playerRange: [2, 3], deckSize: 'small', feralCats: 2 },
  { playerRange: [4, 7], deckSize: 'medium', feralCats: 4 },
  { playerRange: [8, 10], deckSize: 'full', feralCats: 6 },
];

/**
 * Get deck configuration based on player count
 */
export function getDeckConfiguration(playerCount: number): 'small' | 'medium' | 'full' {
  const config = DECK_CONFIGS.find(
    (cfg) => playerCount >= cfg.playerRange[0] && playerCount <= cfg.playerRange[1]
  );
  return config?.deckSize || 'medium';
}

/**
 * Get number of feral cats based on player count
 */
function getFeralCatCount(playerCount: number): number {
  const config = DECK_CONFIGS.find(
    (cfg) => playerCount >= cfg.playerRange[0] && playerCount <= cfg.playerRange[1]
  );
  return config?.feralCats || 4;
}

/**
 * Create a card instance
 */
function createCard(type: CardType): Card {
  return {
    id: uuidv4(),
    type,
  };
}

/**
 * Generate base game cards (excluding Exploding Kittens and Defuses)
 */
function generateBaseCards(): Card[] {
  const cards: Card[] = [];

  // Action cards
  cards.push(...Array(4).fill(null).map(() => createCard('attack')));
  cards.push(...Array(4).fill(null).map(() => createCard('skip')));
  cards.push(...Array(4).fill(null).map(() => createCard('favor')));
  cards.push(...Array(4).fill(null).map(() => createCard('shuffle')));
  cards.push(...Array(5).fill(null).map(() => createCard('see-the-future')));
  cards.push(...Array(5).fill(null).map(() => createCard('nope')));

  // Expansion cards
  cards.push(...Array(3).fill(null).map(() => createCard('alter-the-future')));

  // Cat cards (4 of each type)
  const catTypes = getRegularCatCards();
  catTypes.forEach((catType) => {
    cards.push(...Array(4).fill(null).map(() => createCard(catType)));
  });

  return cards;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a complete deck for the given player count
 * This is used during initial game setup
 */
export function generateDeckForPlayers(
  playerCount: number,
  defuseCount: number = 0,
  explodingKittenCount: number = playerCount - 1
): {
  deck: Card[];
  defuses: Card[];
  explodingKittens: Card[];
  deckConfiguration: 'small' | 'medium' | 'full';
} {
  const deckConfig = getDeckConfiguration(playerCount);
  const feralCatCount = getFeralCatCount(playerCount);

  // Generate base cards
  let deck = generateBaseCards();

  // Add feral cats based on player count
  deck.push(...Array(feralCatCount).fill(null).map(() => createCard('feral-cat')));

  // Generate Defuse cards:
  // - 1 defuse per player (always given to players)
  // - Additional defuses (defuseCount) go into the deck
  const defusesForPlayers = Array(playerCount).fill(null).map(() => createCard('defuse'));
  const additionalDefuses = Array(defuseCount).fill(null).map(() => createCard('defuse'));
  const defuses = [...defusesForPlayers, ...additionalDefuses];

  // Generate Exploding Kittens (configurable, default playerCount - 1)
  const explodingKittens = Array(Math.max(1, explodingKittenCount))
    .fill(null)
    .map(() => createCard('exploding-kitten'));

  return {
    deck: shuffleArray(deck),
    defuses,
    explodingKittens,
    deckConfiguration: deckConfig,
  };
}

/**
 * Setup initial game deck and deal cards to players
 * Returns: { deck, playerHands, defusesForPlayers }
 */
export function setupInitialGame(
  playerCount: number,
  defuseCount: number = 0,
  explodingKittenCount: number = playerCount - 1
): {
  deck: Card[];
  playerHands: Card[][];
  deckConfiguration: 'small' | 'medium' | 'full';
} {
  // Step 1: Generate deck
  const { deck, defuses, explodingKittens, deckConfiguration } = generateDeckForPlayers(
    playerCount,
    defuseCount,
    explodingKittenCount
  );

  // Step 2: Separate defuses for players and additional defuses for deck
  const defusesForPlayers = defuses.slice(0, playerCount);
  const additionalDefuses = defuses.slice(playerCount);

  // Step 3: Shuffle the deck WITHOUT exploding kittens and WITHOUT additional defuses
  // Additional defuses will be added to the deck after dealing, so players only get 1 defuse
  let shuffledDeck = shuffleArray([...deck]);

  // Step 4: Deal 7 cards to each player (from deck without kittens and without additional defuses)
  const playerHands: Card[][] = Array(playerCount)
    .fill(null)
    .map(() => []);

  let remainingDeck = [...shuffledDeck];
  for (let i = 0; i < 7; i++) {
    for (let p = 0; p < playerCount; p++) {
      if (remainingDeck.length > 0) {
        playerHands[p].push(remainingDeck.pop()!);
      }
    }
  }

  // Step 5: Give each player 1 Defuse card (always - this is the only defuse they get)
  for (let p = 0; p < playerCount; p++) {
    playerHands[p].push(defusesForPlayers[p]);
  }

  // Step 6: Add additional defuses and exploding kittens to the remaining deck AFTER dealing
  // This ensures additional defuses are only in the deck, not in player hands
  remainingDeck.push(...additionalDefuses);
  remainingDeck.push(...explodingKittens);

  // Step 7: Shuffle the final deck (with additional defuses and kittens)
  remainingDeck = shuffleArray(remainingDeck);

  return {
    deck: remainingDeck,
    playerHands,
    deckConfiguration,
  };
}
