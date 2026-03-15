// === Types ===
export interface UserData {
  level: number;
  xp: number;
  total_xp: number;
  xp_to_next: number;
  points_balance: number;
  points_total_earned: number;
  points_total_spent: number;
  streak: number;
  best_streak: number;
  last_active_date: string | null;
  display_name: string;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
  color: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  category_emoji?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  source: 'custom' | 'generated';
  is_active: boolean;
  created_at: string;
}

export interface Completion {
  id: number;
  challenge_id: number;
  challenge_title: string;
  challenge_emoji: string;
  challenge_difficulty: string;
  xp_earned: number;
  points_earned: number;
  streak_multiplier: number;
  completed_at: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  emoji: string;
  cost_points: number;
  times_purchased: number;
}

export interface Purchase {
  id: number;
  reward_id: number;
  reward_title: string;
  reward_emoji: string;
  points_spent: number;
  purchased_at: string;
}

// === Constants ===
export const CATEGORIES: Category[] = [
  { id: 1, name: 'Продуктивность', emoji: '⚡', color: '#8B5CF6' },
  { id: 2, name: 'Здоровье', emoji: '❤️', color: '#EF4444' },
  { id: 3, name: 'Творчество', emoji: '🎨', color: '#F59E0B' },
  { id: 4, name: 'Общение', emoji: '👥', color: '#3B82F6' },
  { id: 5, name: 'Осознанность', emoji: '🧘', color: '#10B981' },
];

const XP_REWARDS = { easy: { min: 10, max: 20 }, medium: { min: 30, max: 50 }, hard: { min: 70, max: 100 } };
const STREAK_MULT = [
  { min: 30, mult: 3.0 },
  { min: 14, mult: 2.5 },
  { min: 7, mult: 2.0 },
  { min: 3, mult: 1.5 },
  { min: 0, mult: 1.0 },
];

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function getStreakMult(streak: number): number {
  for (const s of STREAK_MULT) {
    if (streak >= s.min) return s.mult;
  }
  return 1.0;
}

function randXp(diff: 'easy' | 'medium' | 'hard'): number {
  const r = XP_REWARDS[diff];
  return Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterday(): string {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0];
}

let nextId = Date.now();
function genId(): number {
  return nextId++;
}

// === LocalStorage helpers ===
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// === Seed data ===
const SEED_CHALLENGES: Omit<Challenge, 'id' | 'created_at' | 'is_active' | 'source' | 'category_name' | 'category_emoji'>[] = [
  { title: 'Планирование дня', description: 'Составь план на день с 3 главными задачами и выполни их', category_id: 1, difficulty: 'easy', xp_reward: 15 },
  { title: 'Тренировка 30 минут', description: 'Любая физическая активность не менее 30 минут', category_id: 2, difficulty: 'medium', xp_reward: 40 },
  { title: 'Сделай фото', description: 'Сделай одну художественную фотографию чего угодно', category_id: 3, difficulty: 'easy', xp_reward: 15 },
  { title: 'Напиши другу', description: 'Напиши сообщение другу, с которым давно не общался', category_id: 4, difficulty: 'easy', xp_reward: 12 },
  { title: 'Медитация 10 минут', description: 'Проведи 10-минутную медитацию или дыхательное упражнение', category_id: 5, difficulty: 'easy', xp_reward: 15 },
];

const SEED_REWARDS: Omit<Reward, 'id' | 'times_purchased'>[] = [
  { title: 'Сериал (вечер)', description: 'Один вечер сериалов', emoji: '📺', cost_points: 100 },
  { title: 'Игры 2 часа', description: 'Guilt-free gaming', emoji: '🎮', cost_points: 150 },
  { title: 'Читмил', description: 'Любая еда без ограничений', emoji: '🍕', cost_points: 200 },
  { title: 'Поход в спа', description: 'Полноценный спа-день', emoji: '💆', cost_points: 500 },
  { title: 'Покупка до $50', description: 'Что угодно себе', emoji: '🛍️', cost_points: 800 },
  { title: 'Выходной день', description: 'День без обязательств', emoji: '🏖️', cost_points: 1000 },
  { title: 'Покупка до $100', description: 'Крупная покупка', emoji: '🛍️', cost_points: 1500 },
];

const FALLBACK_CHALLENGES: Omit<Challenge, 'id' | 'created_at' | 'is_active' | 'source' | 'category_name' | 'category_emoji'>[] = [
  // Продуктивность
  { title: 'Pomodoro марафон', description: '4 сессии Pomodoro (25 мин работы + 5 мин отдых)', category_id: 1, difficulty: 'medium', xp_reward: 40 },
  { title: 'Digital detox 4 часа', description: 'Проведи 4 часа без соцсетей и мессенджеров', category_id: 1, difficulty: 'hard', xp_reward: 85 },
  { title: 'Разбери инбокс', description: 'Доведи входящие до нуля: почта, мессенджеры, уведомления', category_id: 1, difficulty: 'medium', xp_reward: 35 },
  { title: 'Выучи что-то новое', description: 'Потрать 30 минут на изучение нового навыка или темы', category_id: 1, difficulty: 'medium', xp_reward: 35 },
  { title: 'Утренняя рутина', description: 'Проснись рано и выполни утреннюю рутину до 8:00', category_id: 1, difficulty: 'medium', xp_reward: 30 },
  // Здоровье
  { title: 'Выпей 2л воды', description: 'Следи за потреблением воды — минимум 2 литра за день', category_id: 2, difficulty: 'easy', xp_reward: 12 },
  { title: 'Холодный душ', description: 'Прими холодный душ минимум 3 минуты', category_id: 2, difficulty: 'hard', xp_reward: 80 },
  { title: '10 000 шагов', description: 'Набери 10 000 шагов за день', category_id: 2, difficulty: 'medium', xp_reward: 40 },
  { title: 'Здоровый ужин', description: 'Приготовь и съешь здоровый ужин без junk food', category_id: 2, difficulty: 'easy', xp_reward: 15 },
  { title: 'Растяжка 15 минут', description: 'Проведи полноценную растяжку или йогу', category_id: 2, difficulty: 'easy', xp_reward: 12 },
  // Творчество
  { title: 'Напиши текст', description: 'Напиши рассказ, стихотворение или заметку на 500+ слов', category_id: 3, difficulty: 'medium', xp_reward: 40 },
  { title: 'Создай что-то руками', description: 'Рисунок, поделка, дизайн, музыка — любое творчество', category_id: 3, difficulty: 'hard', xp_reward: 80 },
  { title: 'Послушай новый альбом', description: 'Послушай альбом артиста, которого раньше не слушал', category_id: 3, difficulty: 'easy', xp_reward: 10 },
  { title: 'Кулинарный эксперимент', description: 'Приготовь блюдо, которое никогда не готовил', category_id: 3, difficulty: 'medium', xp_reward: 35 },
  // Общение
  { title: 'Познакомься с кем-то', description: 'Заведи разговор с незнакомым человеком', category_id: 4, difficulty: 'medium', xp_reward: 45 },
  { title: 'Организуй встречу', description: 'Организуй встречу или созвон с друзьями', category_id: 4, difficulty: 'hard', xp_reward: 75 },
  { title: 'Скажи комплимент', description: 'Скажи искренний комплимент трём разным людям', category_id: 4, difficulty: 'easy', xp_reward: 12 },
  { title: 'Позвони родным', description: 'Позвони родителям или близким родственникам', category_id: 4, difficulty: 'easy', xp_reward: 15 },
  // Осознанность
  { title: 'Дневник благодарности', description: 'Запиши 5 вещей, за которые ты благодарен сегодня', category_id: 5, difficulty: 'medium', xp_reward: 30 },
  { title: 'День без жалоб', description: 'Проведи весь день, не жалуясь ни на что', category_id: 5, difficulty: 'hard', xp_reward: 90 },
  { title: 'Прогулка без телефона', description: 'Выйди на 20-минутную прогулку без телефона', category_id: 5, difficulty: 'medium', xp_reward: 35 },
  { title: 'Дыхательная практика', description: 'Проведи 5 минут дыхательной практики (4-7-8 или box breathing)', category_id: 5, difficulty: 'easy', xp_reward: 10 },
];

// === Init ===
export function initStorage(): void {
  if (!localStorage.getItem('lq_user')) {
    const user: UserData = {
      level: 1, xp: 0, total_xp: 0, xp_to_next: xpForLevel(1),
      points_balance: 0, points_total_earned: 0, points_total_spent: 0,
      streak: 0, best_streak: 0, last_active_date: null, display_name: 'Wlad',
    };
    save('lq_user', user);
  }

  if (!localStorage.getItem('lq_challenges')) {
    const challenges: Challenge[] = SEED_CHALLENGES.map((c, i) => {
      const cat = CATEGORIES.find(ct => ct.id === c.category_id)!;
      return { ...c, id: i + 1, is_active: true, source: 'custom' as const, created_at: new Date().toISOString(), category_name: cat.name, category_emoji: cat.emoji };
    });
    save('lq_challenges', challenges);
  }

  if (!localStorage.getItem('lq_rewards')) {
    const rewards: Reward[] = SEED_REWARDS.map((r, i) => ({ ...r, id: i + 1, times_purchased: 0 }));
    save('lq_rewards', rewards);
  }

  if (!localStorage.getItem('lq_completions')) save('lq_completions', []);
  if (!localStorage.getItem('lq_purchases')) save('lq_purchases', []);
}

// === User ===
export function getUser(): UserData {
  return load<UserData>('lq_user', { level: 1, xp: 0, total_xp: 0, xp_to_next: 100, points_balance: 0, points_total_earned: 0, points_total_spent: 0, streak: 0, best_streak: 0, last_active_date: null, display_name: 'Wlad' });
}

function saveUser(user: UserData): void {
  save('lq_user', user);
}

// === Challenges ===
export function getChallenges(categoryId?: number): Challenge[] {
  const all = load<Challenge[]>('lq_challenges', []);
  const active = all.filter(c => c.is_active);
  if (categoryId) return active.filter(c => c.category_id === categoryId);
  return active;
}

export function createChallenge(data: { title: string; description?: string; category_id: number; difficulty: 'easy' | 'medium' | 'hard' }): Challenge {
  const all = load<Challenge[]>('lq_challenges', []);
  const cat = CATEGORIES.find(c => c.id === data.category_id)!;
  const ch: Challenge = {
    id: genId(),
    title: data.title,
    description: data.description || '',
    category_id: data.category_id,
    category_name: cat.name,
    category_emoji: cat.emoji,
    difficulty: data.difficulty,
    xp_reward: randXp(data.difficulty),
    source: 'custom',
    is_active: true,
    created_at: new Date().toISOString(),
  };
  all.push(ch);
  save('lq_challenges', all);
  return ch;
}

export function generateChallenge(categoryId?: number): Challenge {
  const existing = load<Challenge[]>('lq_challenges', []);
  const existingTitles = new Set(existing.map(c => c.title));
  
  let pool = FALLBACK_CHALLENGES.filter(c => !existingTitles.has(c.title));
  if (categoryId) pool = pool.filter(c => c.category_id === categoryId);
  if (pool.length === 0) pool = categoryId ? FALLBACK_CHALLENGES.filter(c => c.category_id === categoryId) : FALLBACK_CHALLENGES;
  
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const cat = CATEGORIES.find(c => c.id === picked.category_id)!;
  
  const ch: Challenge = {
    ...picked,
    id: genId(),
    is_active: true,
    source: 'generated',
    created_at: new Date().toISOString(),
    category_name: cat.name,
    category_emoji: cat.emoji,
  };
  
  existing.push(ch);
  save('lq_challenges', existing);
  return ch;
}

export function completeChallenge(challengeId: number): {
  xp_earned: number;
  points_earned: number;
  streak_multiplier: number;
  leveled_up: boolean;
  new_level: number;
} {
  const user = getUser();
  const all = load<Challenge[]>('lq_challenges', []);
  const idx = all.findIndex(c => c.id === challengeId && c.is_active);
  if (idx === -1) throw new Error('Challenge not found');
  
  const ch = all[idx];
  
  // Streak
  const t = today();
  const y = yesterday();
  let newStreak = user.streak;
  if (user.last_active_date === t) {
    // already active today
  } else if (user.last_active_date === y) {
    newStreak += 1;
  } else if (user.last_active_date) {
    newStreak = 1;
  } else {
    newStreak = 1;
  }
  
  const mult = getStreakMult(newStreak);
  const xpEarned = Math.floor(ch.xp_reward * mult);
  const pointsEarned = xpEarned;
  
  let newXp = user.xp + xpEarned;
  let newLevel = user.level;
  let leveledUp = false;
  
  while (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel++;
    leveledUp = true;
  }
  
  // Update user
  user.xp = newXp;
  user.total_xp += xpEarned;
  user.level = newLevel;
  user.xp_to_next = xpForLevel(newLevel);
  user.points_balance += pointsEarned;
  user.points_total_earned += pointsEarned;
  user.streak = newStreak;
  user.best_streak = Math.max(user.best_streak, newStreak);
  user.last_active_date = t;
  saveUser(user);
  
  // Deactivate challenge
  all[idx].is_active = false;
  save('lq_challenges', all);
  
  // Record completion
  const completions = load<Completion[]>('lq_completions', []);
  completions.push({
    id: genId(),
    challenge_id: ch.id,
    challenge_title: ch.title,
    challenge_emoji: ch.category_emoji || '🎯',
    challenge_difficulty: ch.difficulty,
    xp_earned: xpEarned,
    points_earned: pointsEarned,
    streak_multiplier: mult,
    completed_at: new Date().toISOString(),
  });
  save('lq_completions', completions);
  
  return { xp_earned: xpEarned, points_earned: pointsEarned, streak_multiplier: mult, leveled_up: leveledUp, new_level: newLevel };
}

export function deleteChallenge(challengeId: number): void {
  const all = load<Challenge[]>('lq_challenges', []);
  save('lq_challenges', all.filter(c => c.id !== challengeId));
}

// === Rewards ===
export function getRewards(): Reward[] {
  return load<Reward[]>('lq_rewards', []);
}

export function createReward(data: { title: string; description?: string; emoji?: string; cost_points: number }): Reward {
  const all = load<Reward[]>('lq_rewards', []);
  const reward: Reward = {
    id: genId(),
    title: data.title,
    description: data.description || '',
    emoji: data.emoji || '🎁',
    cost_points: data.cost_points,
    times_purchased: 0,
  };
  all.push(reward);
  save('lq_rewards', all);
  return reward;
}

export function purchaseReward(rewardId: number): { points_spent: number; remaining_balance: number } {
  const user = getUser();
  const rewards = load<Reward[]>('lq_rewards', []);
  const idx = rewards.findIndex(r => r.id === rewardId);
  if (idx === -1) throw new Error('Reward not found');
  
  const reward = rewards[idx];
  if (user.points_balance < reward.cost_points) throw new Error('Not enough points');
  
  user.points_balance -= reward.cost_points;
  user.points_total_spent += reward.cost_points;
  saveUser(user);
  
  rewards[idx].times_purchased++;
  save('lq_rewards', rewards);
  
  const purchases = load<Purchase[]>('lq_purchases', []);
  purchases.push({
    id: genId(),
    reward_id: reward.id,
    reward_title: reward.title,
    reward_emoji: reward.emoji,
    points_spent: reward.cost_points,
    purchased_at: new Date().toISOString(),
  });
  save('lq_purchases', purchases);
  
  return { points_spent: reward.cost_points, remaining_balance: user.points_balance };
}

export function deleteReward(rewardId: number): void {
  const all = load<Reward[]>('lq_rewards', []);
  save('lq_rewards', all.filter(r => r.id !== rewardId));
}

// === Undo completion ===
export function undoCompletion(completionId: number): void {
  const completions = load<Completion[]>('lq_completions', []);
  const idx = completions.findIndex(c => c.id === completionId);
  if (idx === -1) return;

  const comp = completions[idx];
  const user = getUser();

  // Reverse XP and points
  let newXp = user.xp - comp.xp_earned;
  let newLevel = user.level;

  // Handle level-down
  while (newXp < 0 && newLevel > 1) {
    newLevel--;
    newXp += xpForLevel(newLevel);
  }
  if (newXp < 0) newXp = 0;

  user.xp = newXp;
  user.total_xp = Math.max(0, user.total_xp - comp.xp_earned);
  user.level = newLevel;
  user.xp_to_next = xpForLevel(newLevel);
  user.points_balance = Math.max(0, user.points_balance - comp.points_earned);
  user.points_total_earned = Math.max(0, user.points_total_earned - comp.points_earned);
  saveUser(user);

  // Re-activate the challenge
  const challenges = load<Challenge[]>('lq_challenges', []);
  const chIdx = challenges.findIndex(c => c.id === comp.challenge_id);
  if (chIdx !== -1) {
    challenges[chIdx].is_active = true;
    save('lq_challenges', challenges);
  }

  // Remove completion
  completions.splice(idx, 1);
  save('lq_completions', completions);
}

// === Stats ===
export function getStats() {
  const user = getUser();
  const completions = load<Completion[]>('lq_completions', []);
  const purchases = load<Purchase[]>('lq_purchases', []);
  
  const catProgress = CATEGORIES.map(cat => {
    const catCompletions = completions.filter(c => {
      // find the challenge category via emoji matching
      return c.challenge_emoji === cat.emoji;
    });
    return {
      category_id: cat.id,
      category_name: cat.name,
      category_emoji: cat.emoji,
      completed_count: catCompletions.length,
      total_xp: catCompletions.reduce((sum, c) => sum + c.xp_earned, 0),
    };
  });
  
  return {
    total_challenges_completed: completions.length,
    total_xp_earned: user.total_xp,
    total_points_earned: user.points_total_earned,
    total_points_spent: user.points_total_spent,
    total_rewards_purchased: purchases.length,
    categories_progress: catProgress,
  };
}

export function getHistory(limit = 30): Completion[] {
  const completions = load<Completion[]>('lq_completions', []);
  return completions.slice(-limit).reverse();
}
