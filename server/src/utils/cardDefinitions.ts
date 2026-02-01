/**
 * Card Definitions for Exploding Kittens
 * Complete catalog with detailed descriptions and rules
 */

export type CardCategory = 
  | 'lethal'      // Exploding Kitten
  | 'defense'     // Defuse
  | 'counter'     // Nope
  | 'offensive'   // Attack
  | 'defensive'   // Skip
  | 'interactive' // Favor
  | 'tactical'    // See Future, Alter Future
  | 'utility'     // Shuffle
  | 'cat';        // Cat cards & Feral Cats

export type CardType =
  // Base Game (13 types)
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
  // Expansion (2 types)
  | 'alter-the-future'
  | 'feral-cat';

export interface CardDefinition {
  type: CardType;
  name: string;
  category: CardCategory;
  description: string;
  detailedRules: string;
  canBeNoped: boolean;
  canPlayAnytime: boolean; // For special "Now" cards (not in simplified version)
  emoji: string; // For visual reference
}

/**
 * Complete card catalog with detailed descriptions
 * All 15 card types for Exploding Kittens
 */
export const CARD_DEFINITIONS: Record<CardType, CardDefinition> = {
  // ===== LETHAL CARDS =====
  'exploding-kitten': {
    type: 'exploding-kitten',
    name: 'Exploding Kitten',
    category: 'lethal',
    description: '💥 You must show this card immediately. Unless you have a Defuse Card, you\'re dead.',
    detailedRules: 'If you draw this card, you explode and are eliminated from the game. Discard all of your cards including the Exploding Kitten. If you have a Defuse card, you can use it to stay in the game and secretly place the Exploding Kitten back into the Draw Pile anywhere you choose.',
    canBeNoped: false,
    canPlayAnytime: false,
    emoji: '💣',
  },
  
  // ===== DEFENSE CARDS =====
  'defuse': {
    type: 'defuse',
    name: 'Defuse',
    category: 'defense',
    description: '🛡️ If you drew an Exploding Kitten, you can play this card instead of dying.',
    detailedRules: 'When you draw an Exploding Kitten, play this card to defuse it. Place the Exploding Kitten back into the Draw Pile in any position you choose (secretly). Other players will not know where you put it.',
    canBeNoped: false,
    canPlayAnytime: false,
    emoji: '🛡️',
  },

  // ===== COUNTER CARDS =====
  'nope': {
    type: 'nope',
    name: 'Nope',
    category: 'counter',
    description: '🚫 Stop any action except Exploding Kitten or Defuse.',
    detailedRules: 'Play this card to stop any action card being played by another player. You can play it at any time, even on another player\'s turn. A Nope can be played on another Nope to cancel it, creating a chain. The final Nope in the chain determines if the action happens.',
    canBeNoped: true,
    canPlayAnytime: true,
    emoji: '🚫',
  },

  // ===== OFFENSIVE CARDS =====
  'attack': {
    type: 'attack',
    name: 'Attack',
    category: 'offensive',
    description: '⚔️ End your turn without drawing. Force the next player to take 2 turns.',
    detailedRules: 'End your turn immediately without drawing a card. The next player must take 2 turns in a row. If they play an Attack card on their turn, it adds to the turn count for the following player.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '⚔️',
  },

  // ===== DEFENSIVE CARDS =====
  'skip': {
    type: 'skip',
    name: 'Skip',
    category: 'defensive',
    description: '⏭️ End your turn without drawing a card.',
    detailedRules: 'Immediately end your turn without drawing a card. If you have multiple turns pending (from an Attack), this only ends one turn.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '⏭️',
  },

  // ===== INTERACTIVE CARDS =====
  'favor': {
    type: 'favor',
    name: 'Favor',
    category: 'interactive',
    description: '🤝 Force any other player to give you a card from their hand.',
    detailedRules: 'Choose any player and they must give you one card from their hand. They choose which card to give you. They cannot refuse. If they have no cards, nothing happens.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🤝',
  },

  // ===== UTILITY CARDS =====
  'shuffle': {
    type: 'shuffle',
    name: 'Shuffle',
    category: 'utility',
    description: '🔀 Shuffle the Draw Pile thoroughly.',
    detailedRules: 'Shuffle the Draw Pile completely. This randomizes the order of all remaining cards, including any Exploding Kittens.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🔀',
  },

  // ===== TACTICAL CARDS =====
  'see-the-future': {
    type: 'see-the-future',
    name: 'See the Future',
    category: 'tactical',
    description: '🔮 Privately view the top 3 cards from the Draw Pile.',
    detailedRules: 'Look at the top 3 cards of the Draw Pile privately. Don\'t show them to other players. You cannot rearrange them. This helps you plan your next moves.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🔮',
  },

  'alter-the-future': {
    type: 'alter-the-future',
    name: 'Alter the Future',
    category: 'tactical',
    description: '🔮✨ Privately view AND rearrange the top 3 cards.',
    detailedRules: 'Privately view the top 3 cards from the Draw Pile and put them back in any order you choose. Don\'t show the cards to other players. This is more powerful than See the Future because you can rearrange the cards to help yourself or hurt the next player.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '✨',
  },

  // ===== CAT CARDS =====
  'cat-taco': {
    type: 'cat-taco',
    name: 'Taco Cat',
    category: 'cat',
    description: '🌮 Powerless alone. Play pairs or combos for special abilities.',
    detailedRules: '2 of a Kind: Steal a random card from any player. 3 of a Kind: Ask any player for a specific card type (they must give it if they have it). 5 Different Cats: Take any card from the Discard Pile.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🌮',
  },

  'cat-hairy-potato': {
    type: 'cat-hairy-potato',
    name: 'Hairy Potato Cat',
    category: 'cat',
    description: '🥔 Powerless alone. Play pairs or combos for special abilities.',
    detailedRules: '2 of a Kind: Steal a random card from any player. 3 of a Kind: Ask any player for a specific card type (they must give it if they have it). 5 Different Cats: Take any card from the Discard Pile.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🥔',
  },

  'cat-rainbow-ralphing': {
    type: 'cat-rainbow-ralphing',
    name: 'Rainbow-Ralphing Cat',
    category: 'cat',
    description: '🌈 Powerless alone. Play pairs or combos for special abilities.',
    detailedRules: '2 of a Kind: Steal a random card from any player. 3 of a Kind: Ask any player for a specific card type (they must give it if they have it). 5 Different Cats: Take any card from the Discard Pile.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🌈',
  },

  'cat-beard': {
    type: 'cat-beard',
    name: 'Beard Cat',
    category: 'cat',
    description: '🧔 Powerless alone. Play pairs or combos for special abilities.',
    detailedRules: '2 of a Kind: Steal a random card from any player. 3 of a Kind: Ask any player for a specific card type (they must give it if they have it). 5 Different Cats: Take any card from the Discard Pile.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🧔',
  },

  'cat-cattermelon': {
    type: 'cat-cattermelon',
    name: 'Cattermelon',
    category: 'cat',
    description: '🍉 Powerless alone. Play pairs or combos for special abilities.',
    detailedRules: '2 of a Kind: Steal a random card from any player. 3 of a Kind: Ask any player for a specific card type (they must give it if they have it). 5 Different Cats: Take any card from the Discard Pile.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🍉',
  },

  'feral-cat': {
    type: 'feral-cat',
    name: 'Feral Cat',
    category: 'cat',
    description: '🐾 Wild card! Counts as ANY cat card in combos.',
    detailedRules: 'This is a wild card that can be used as any Cat Card when playing pairs, 3-of-a-kind, or 5-different combos. Cannot be used to substitute action cards like Attack or Skip. Only works for Cat Card combos.',
    canBeNoped: true,
    canPlayAnytime: false,
    emoji: '🐾',
  },
};

/**
 * Helper function to get card definition by type
 */
export function getCardDefinition(type: CardType): CardDefinition {
  return CARD_DEFINITIONS[type];
}

/**
 * Check if a card is a cat card
 */
export function isCatCard(type: CardType): boolean {
  const catCards: CardType[] = [
    'cat-taco',
    'cat-hairy-potato',
    'cat-rainbow-ralphing',
    'cat-beard',
    'cat-cattermelon',
    'feral-cat',
  ];
  return catCards.includes(type);
}

/**
 * Get all cat card types (excluding feral)
 */
export function getRegularCatCards(): CardType[] {
  return [
    'cat-taco',
    'cat-hairy-potato',
    'cat-rainbow-ralphing',
    'cat-beard',
    'cat-cattermelon',
  ];
}
