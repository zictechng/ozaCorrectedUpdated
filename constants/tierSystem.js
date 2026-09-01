
// ─────────────────────────────────────────────────
// tierSystem.js
// Coin tier definitions and helper functions.
// Used across Profile, Home, Wallet screens.
// Tier thresholds can be updated here when
// admin changes them via the backend.
// ─────────────────────────────────────────────────

export const TIERS = [
  {
    name: 'Bronze',
    min: 0,
    max: 999,
    color: '#CD7F32',
    bgColor: '#FDF0E0',
    icon: '🥉',
    perks: 'Basic rewards access',
    bonusRate: 0,
  },
  {
    name: 'Silver',
    min: 1000,
    max: 4999,
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    icon: '🥈',
    perks: '5% bonus on reward rate',
    bonusRate: 5,
  },
  {
    name: 'Gold',
    min: 5000,
    max: 19999,
    color: '#F0A500',
    bgColor: '#FFF3CD',
    icon: '🥇',
    perks: '10% bonus on reward rate',
    bonusRate: 10,
  },
  {
    name: 'Platinum',
    min: 20000,
    max: 99999,
    color: '#818CF8',
    bgColor: '#EDE9FE',
    icon: '💎',
    perks: '15% bonus + priority support',
    bonusRate: 15,
  },
  {
    name: 'Diamond',
    min: 100000,
    max: Infinity,
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    icon: '💠',
    perks: '20% bonus + VIP gifts + priority support',
    bonusRate: 20,
  },
];

// Get user tier based on coin count
export const getUserTier = (coins = 0) => {
  return TIERS.find(t => coins >= t.min && coins <= t.max) || TIERS[0];
};

// Get next tier
export const getNextTier = (currentTierName) => {
  const currentIndex = TIERS.findIndex(t => t.name === currentTierName);
  return TIERS[Math.min(currentIndex + 1, TIERS.length - 1)];
};

// Get progress percentage to next tier
export const getTierProgress = (coins = 0, tier) => {
  if (!tier || tier.max === Infinity) return 100;
  return Math.min(Math.round(((coins - tier.min) / (tier.max - tier.min)) * 100), 100);
};

// Get coins remaining to next tier
export const getCoinsToNextTier = (coins = 0, tier) => {
  if (!tier || tier.max === Infinity) return 0;
  return Math.max(tier.max - coins + 1, 0);
};