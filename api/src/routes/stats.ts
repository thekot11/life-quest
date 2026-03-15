import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index';
import { getOrCreateUser } from '../services/game';

export function statsRoutes(app: FastifyInstance) {
  // General stats
  app.get('/api/stats', async (req) => {
    const db = getDb();
    const tgUser = (req as any).telegramUser;
    const user = getOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);

    const completions = db.prepare(
      'SELECT COUNT(*) as cnt FROM challenge_completions WHERE user_id = ?'
    ).get(user.id) as { cnt: number };

    const purchases = db.prepare(
      'SELECT COUNT(*) as cnt FROM reward_purchases WHERE user_id = ?'
    ).get(user.id) as { cnt: number };

    const categoryProgress = db.prepare(`
      SELECT 
        cat.id as category_id,
        cat.name as category_name,
        cat.emoji as category_emoji,
        COUNT(cc.id) as completed_count,
        COALESCE(SUM(cc.xp_earned), 0) as total_xp
      FROM categories cat
      LEFT JOIN challenges ch ON ch.category_id = cat.id
      LEFT JOIN challenge_completions cc ON cc.challenge_id = ch.id AND cc.user_id = ?
      GROUP BY cat.id
      ORDER BY cat.sort_order
    `).all(user.id);

    return {
      success: true,
      data: {
        total_challenges_completed: completions.cnt,
        total_xp_earned: user.total_xp,
        total_points_earned: user.points_total_earned,
        total_points_spent: user.points_total_spent,
        total_rewards_purchased: purchases.cnt,
        categories_progress: categoryProgress,
      },
    };
  });

  // History
  app.get('/api/stats/history', async (req) => {
    const db = getDb();
    const tgUser = (req as any).telegramUser;
    const user = getOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);
    const { limit = '50' } = req.query as { limit?: string };

    const history = db.prepare(`
      SELECT 
        cc.*,
        ch.title as challenge_title,
        ch.difficulty as challenge_difficulty,
        cat.emoji as challenge_emoji
      FROM challenge_completions cc
      JOIN challenges ch ON cc.challenge_id = ch.id
      LEFT JOIN categories cat ON ch.category_id = cat.id
      WHERE cc.user_id = ?
      ORDER BY cc.completed_at DESC
      LIMIT ?
    `).all(user.id, parseInt(limit));

    return { success: true, data: history };
  });
}
