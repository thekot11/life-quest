// === User ===
export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  display_name: string | null;
  level: number;
  xp: number;
  total_xp: number;
  points_balance: number;
  points_total_earned: number;
  points_total_spent: number;
  streak: number;
  best_streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  level: number;
  xp: number;
  xp_to_next: number;
  total_xp: number;
  points_balance: number;
  streak: number;
  best_streak: number;
  display_name: string | null;
}

// === Category ===
export interface Category {
  id: number;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
}

// === Challenge ===
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeSource = 'custom' | 'ai';

export interface Challenge {
  id: number;
  title: string;
  description: string | null;
  category_id: number;
  difficulty: Difficulty;
  xp_reward: number;
  source: ChallengeSource;
  is_active: number;
  created_at: string;
  // joined
  category_name?: string;
  category_emoji?: string;
}

export interface CreateChallengeInput {
  title: string;
  description?: string;
  category_id: number;
  difficulty: Difficulty;
  xp_reward: number;
}

// === Challenge Completion ===
export interface ChallengeCompletion {
  id: number;
  user_id: number;
  challenge_id: number;
  xp_earned: number;
  points_earned: number;
  streak_multiplier: number;
  completed_at: string;
  // joined
  challenge_title?: string;
  challenge_emoji?: string;
  challenge_difficulty?: Difficulty;
}

// === Reward ===
export interface Reward {
  id: number;
  title: string;
  description: string | null;
  emoji: string | null;
  cost_points: number;
  is_available: number;
  times_purchased: number;
  created_at: string;
}

export interface CreateRewardInput {
  title: string;
  description?: string;
  emoji?: string;
  cost_points: number;
}

// === Reward Purchase ===
export interface RewardPurchase {
  id: number;
  user_id: number;
  reward_id: number;
  points_spent: number;
  purchased_at: string;
  // joined
  reward_title?: string;
  reward_emoji?: string;
}

// === Stats ===
export interface Stats {
  total_challenges_completed: number;
  total_xp_earned: number;
  total_points_earned: number;
  total_points_spent: number;
  total_rewards_purchased: number;
  categories_progress: CategoryProgress[];
}

export interface CategoryProgress {
  category_id: number;
  category_name: string;
  category_emoji: string;
  completed_count: number;
  total_xp: number;
}

// === API Responses ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// === Game Constants ===
export const XP_REWARDS: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 10, max: 20 },
  medium: { min: 30, max: 50 },
  hard: { min: 70, max: 100 },
};

export const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 3.0 },
  { minDays: 14, multiplier: 2.5 },
  { minDays: 7, multiplier: 2.0 },
  { minDays: 3, multiplier: 1.5 },
  { minDays: 0, multiplier: 1.0 },
];

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getStreakMultiplier(streak: number): number {
  for (const s of STREAK_MULTIPLIERS) {
    if (streak >= s.minDays) return s.multiplier;
  }
  return 1.0;
}
