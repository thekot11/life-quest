import { getDb } from '../db/index';
import { xpForLevel, getStreakMultiplier } from '../../../shared/src/types';
import type { User, UserProfile } from '../../../shared/src/types';

export function getOrCreateUser(telegramId: number, username?: string, displayName?: string): User {
  const db = getDb();
  
  let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as User | undefined;
  
  if (!user) {
    db.prepare(
      'INSERT INTO users (telegram_id, username, display_name) VALUES (?, ?, ?)'
    ).run(telegramId, username || null, displayName || null);
    
    user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as User;
  }
  
  return user;
}

export function getUserProfile(user: User): UserProfile {
  return {
    level: user.level,
    xp: user.xp,
    xp_to_next: xpForLevel(user.level),
    total_xp: user.total_xp,
    points_balance: user.points_balance,
    streak: user.streak,
    best_streak: user.best_streak,
    display_name: user.display_name,
  };
}

export function completeChallenge(userId: number, challengeId: number): {
  xp_earned: number;
  points_earned: number;
  streak_multiplier: number;
  leveled_up: boolean;
  new_level: number;
} {
  const db = getDb();
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ? AND is_active = 1').get(challengeId) as any;
  
  if (!challenge) throw new Error('Challenge not found or inactive');
  
  // Check if already completed today
  const today = new Date().toISOString().split('T')[0];
  const alreadyDone = db.prepare(
    `SELECT id FROM challenge_completions 
     WHERE user_id = ? AND challenge_id = ? AND date(completed_at) = ?`
  ).get(userId, challengeId, today);
  
  if (alreadyDone) throw new Error('Challenge already completed today');
  
  // Calculate streak
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = user.streak;
  
  if (user.last_active_date === today) {
    // Already active today, keep streak
  } else if (user.last_active_date === yesterday) {
    newStreak += 1;
  } else if (user.last_active_date) {
    newStreak = 1; // Streak broken
  } else {
    newStreak = 1; // First time
  }
  
  const multiplier = getStreakMultiplier(newStreak);
  const baseXp = challenge.xp_reward;
  const xpEarned = Math.floor(baseXp * multiplier);
  const pointsEarned = xpEarned; // 1:1
  
  // New XP totals
  let newXp = user.xp + xpEarned;
  let newTotalXp = user.total_xp + xpEarned;
  let newLevel = user.level;
  let leveledUp = false;
  
  // Check level up
  while (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel += 1;
    leveledUp = true;
  }
  
  const newBestStreak = Math.max(user.best_streak, newStreak);
  
  // Update user
  db.prepare(`
    UPDATE users SET 
      xp = ?, total_xp = ?, level = ?,
      points_balance = points_balance + ?,
      points_total_earned = points_total_earned + ?,
      streak = ?, best_streak = ?,
      last_active_date = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(newXp, newTotalXp, newLevel, pointsEarned, pointsEarned, newStreak, newBestStreak, today, userId);
  
  // Record completion
  db.prepare(`
    INSERT INTO challenge_completions (user_id, challenge_id, xp_earned, points_earned, streak_multiplier)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, challengeId, xpEarned, pointsEarned, multiplier);
  
  // Deactivate challenge
  db.prepare('UPDATE challenges SET is_active = 0 WHERE id = ?').run(challengeId);
  
  return { xp_earned: xpEarned, points_earned: pointsEarned, streak_multiplier: multiplier, leveled_up: leveledUp, new_level: newLevel };
}

export function purchaseReward(userId: number, rewardId: number): {
  points_spent: number;
  remaining_balance: number;
} {
  const db = getDb();
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
  const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND is_available = 1').get(rewardId) as any;
  
  if (!reward) throw new Error('Reward not found or unavailable');
  if (user.points_balance < reward.cost_points) throw new Error('Not enough points');
  
  db.prepare(`
    UPDATE users SET 
      points_balance = points_balance - ?,
      points_total_spent = points_total_spent + ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(reward.cost_points, reward.cost_points, userId);
  
  db.prepare(`
    INSERT INTO reward_purchases (user_id, reward_id, points_spent)
    VALUES (?, ?, ?)
  `).run(userId, rewardId, reward.cost_points);
  
  db.prepare('UPDATE rewards SET times_purchased = times_purchased + 1 WHERE id = ?').run(rewardId);
  
  return {
    points_spent: reward.cost_points,
    remaining_balance: user.points_balance - reward.cost_points,
  };
}
