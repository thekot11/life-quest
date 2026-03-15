import { Bot, InlineKeyboard } from 'grammy';
import { getDb } from '../../api/src/db/index';
import { getOrCreateUser, getUserProfile } from '../../api/src/services/game';
import { xpForLevel } from '../../shared/src/types';

let bot: Bot | null = null;

export async function startBot() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.log('⚠️ BOT_TOKEN not set, skipping bot');
    return;
  }

  bot = new Bot(token);
  const webappUrl = process.env.WEBAPP_URL || 'https://life-quest.example.com';

  // /start
  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard().webApp('🎮 Открыть Life Quest', webappUrl);
    await ctx.reply(
      '🎮 *Life Quest*\n\n' +
      'Добро пожаловать в твою персональную RPG!\n\n' +
      'Выполняй челленджи → получай XP и поинты → трать на награды.\n\n' +
      'Нажми кнопку ниже, чтобы начать:',
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  // /challenge - random challenge
  bot.command('challenge', async (ctx) => {
    const db = getDb();
    const challenges = db.prepare(`
      SELECT c.*, cat.emoji as category_emoji 
      FROM challenges c 
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.is_active = 1 
      ORDER BY RANDOM() LIMIT 1
    `).get() as any;

    if (!challenges) {
      const keyboard = new InlineKeyboard().webApp('🎮 Открыть приложение', webappUrl);
      await ctx.reply('Нет активных челленджей. Создай новые в приложении!', { reply_markup: keyboard });
      return;
    }

    const diffEmoji: Record<string, string> = { easy: '🟢', medium: '🟡', hard: '🔴' };
    await ctx.reply(
      `${challenges.category_emoji || '🎯'} *${challenges.title}*\n\n` +
      `${challenges.description || ''}\n\n` +
      `${diffEmoji[challenges.difficulty] || '🟡'} Сложность: ${challenges.difficulty}\n` +
      `⭐ Награда: ${challenges.xp_reward} XP`,
      { parse_mode: 'Markdown' }
    );
  });

  // /stats
  bot.command('stats', async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = getOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);
    const profile = getUserProfile(user);

    const progressBar = makeProgressBar(profile.xp, profile.xp_to_next);
    const keyboard = new InlineKeyboard().webApp('📊 Подробнее', webappUrl);

    await ctx.reply(
      `📊 *Статистика*\n\n` +
      `👤 ${profile.display_name || 'Герой'}\n` +
      `🏆 Уровень: ${profile.level}\n` +
      `${progressBar} ${profile.xp}/${profile.xp_to_next} XP\n` +
      `🔥 Стрик: ${profile.streak} дней\n` +
      `💰 Поинты: ${profile.points_balance}`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  // /rewards
  bot.command('rewards', async (ctx) => {
    const db = getDb();
    const rewards = db.prepare('SELECT * FROM rewards WHERE is_available = 1 ORDER BY cost_points ASC').all() as any[];
    const keyboard = new InlineKeyboard().webApp('🎁 Открыть магазин', webappUrl);

    if (rewards.length === 0) {
      await ctx.reply('Магазин пуст. Добавь награды в приложении!', { reply_markup: keyboard });
      return;
    }

    const list = rewards.map(r => `${r.emoji || '🎁'} ${r.title} — ${r.cost_points} 💰`).join('\n');
    await ctx.reply(
      `🎁 *Магазин наград*\n\n${list}`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  await bot.start();
}

function makeProgressBar(current: number, total: number): string {
  const filled = Math.floor((current / total) * 10);
  const empty = 10 - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}
