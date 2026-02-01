import { CardType } from '../types/game';

/**
 * Get card styling based on card type
 */
export function getCardStyle(cardType: CardType): {
  gradient: string;
  emoji: string;
  name: string;
  description: string;
} {
  const styles: Record<CardType, { gradient: string; emoji: string; name: string; description: string }> = {
    'exploding-kitten': {
      gradient: 'from-red-600 to-red-800',
      emoji: '💣',
      name: 'Exploding Kitten',
      description: 'You explode! Unless you have a Defuse.',
    },
    'defuse': {
      gradient: 'from-blue-500 to-blue-700',
      emoji: '🛡️',
      name: 'Defuse',
      description: 'Defuse an Exploding Kitten',
    },
    'nope': {
      gradient: 'from-purple-500 to-purple-700',
      emoji: '🚫',
      name: 'Nope',
      description: 'Stop any action',
    },
    'attack': {
      gradient: 'from-orange-500 to-red-600',
      emoji: '⚔️',
      name: 'Attack',
      description: 'Next player takes 2 turns',
    },
    'skip': {
      gradient: 'from-green-500 to-green-700',
      emoji: '⏭️',
      name: 'Skip',
      description: 'End turn without drawing',
    },
    'favor': {
      gradient: 'from-pink-500 to-pink-700',
      emoji: '🤝',
      name: 'Favor',
      description: 'Take a card from any player',
    },
    'shuffle': {
      gradient: 'from-yellow-500 to-yellow-700',
      emoji: '🔀',
      name: 'Shuffle',
      description: 'Shuffle the deck',
    },
    'see-the-future': {
      gradient: 'from-cyan-500 to-blue-600',
      emoji: '🔮',
      name: 'See the Future',
      description: 'View top 3 cards',
    },
    'alter-the-future': {
      gradient: 'from-indigo-500 to-purple-600',
      emoji: '✨',
      name: 'Alter the Future',
      description: 'Rearrange top 3 cards',
    },
    'cat-taco': {
      gradient: 'from-amber-400 to-orange-500',
      emoji: '🌮',
      name: 'Taco Cat',
      description: 'Play combos for effects',
    },
    'cat-hairy-potato': {
      gradient: 'from-yellow-600 to-amber-700',
      emoji: '🥔',
      name: 'Hairy Potato Cat',
      description: 'Play combos for effects',
    },
    'cat-rainbow-ralphing': {
      gradient: 'from-pink-400 to-purple-500',
      emoji: '🌈',
      name: 'Rainbow Cat',
      description: 'Play combos for effects',
    },
    'cat-beard': {
      gradient: 'from-gray-600 to-gray-800',
      emoji: '🧔',
      name: 'Beard Cat',
      description: 'Play combos for effects',
    },
    'cat-cattermelon': {
      gradient: 'from-green-400 to-green-600',
      emoji: '🍉',
      name: 'Cattermelon',
      description: 'Play combos for effects',
    },
    'feral-cat': {
      gradient: 'from-slate-500 to-slate-700',
      emoji: '🐾',
      name: 'Feral Cat',
      description: 'Wild card for combos',
    },
  };

  return styles[cardType] || styles['defuse'];
}

/**
 * Check if card is a cat card
 */
export function isCatCard(cardType: CardType): boolean {
  const catCards: CardType[] = [
    'cat-taco',
    'cat-hairy-potato',
    'cat-rainbow-ralphing',
    'cat-beard',
    'cat-cattermelon',
    'feral-cat',
  ];
  return catCards.includes(cardType);
}
