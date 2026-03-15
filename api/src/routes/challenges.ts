import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index';
import { getOrCreateUser, completeChallenge } from '../services/game';
import { generateChallenge } from '../services/ai';
import { XP_REWARDS } from '../../../shared/src/types';
import type { Difficulty } from '../../../shared/src/types';

export function challengeRoutes(app: FastifyInstance) {
  // List active challenges
  app.get('/api/challenges', async (req) => {
    const db = getDb();
    const { category } = req.query as { category?: string };
    
    let challenges;
    if (category && category !== 'all') {
      challenges = db.prepare(`
        SELECT c.*, cat.name as category_name, cat.emoji as category_emoji 
        FROM challenges c 
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.is_active = 1 AND c.category_id = ?
        ORDER BY c.created_at DESC
      `).all(category);
    } else {
      challenges = db.prepare(`
        SELECT c.*, cat.name as category_name, cat.emoji as category_emoji 
        FROM challenges c 
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.is_active = 1
        ORDER BY c.created_at DESC
      `).all();
    }
    
    return { success: true, data: challenges };
  });

  // Get categories
  app.get('/api/categories', async () => {
    const db = getDb();
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    return { success: true, data: categories };
  });

  // Create custom challenge
  app.post('/api/challenges', async (req) => {
    const db = getDb();
    const { title, description, category_id, difficulty } = req.body as any;
    
    const diff: Difficulty = difficulty || 'medium';
    const xpRange = XP_REWARDS[diff];
    const xpReward = Math.floor(Math.random() * (xpRange.max - xpRange.min + 1)) + xpRange.min;
    
    const result = db.prepare(`
      INSERT INTO challenges (title, description, category_id, difficulty, xp_reward, source)
      VALUES (?, ?, ?, ?, ?, 'custom')
    `).run(title, description || null, category_id, diff, xpReward);
    
    const challenge = db.prepare(`
      SELECT c.*, cat.name as category_name, cat.emoji as category_emoji 
      FROM challenges c 
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);
    
    return { success: true, data: challenge };
  });

  // AI generate challenge
  app.post('/api/challenges/generate', async (req) => {
    const db = getDb();
    const tgUser = (req as any).telegramUser;
    const user = getOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);
    const { category_id } = req.body as { category_id?: number };
    
    const generated = await generateChallenge(category_id || null, user.level);
    
    const xpRange = XP_REWARDS[generated.difficulty];
    const xpReward = Math.floor(Math.random() * (xpRange.max - xpRange.min + 1)) + xpRange.min;
    
    const result = db.prepare(`
      INSERT INTO challenges (title, description, category_id, difficulty, xp_reward, source)
      VALUES (?, ?, ?, ?, ?, 'ai')
    `).run(generated.title, generated.description, generated.category_id, generated.difficulty, xpReward);
    
    const challenge = db.prepare(`
      SELECT c.*, cat.name as category_name, cat.emoji as category_emoji 
      FROM challenges c 
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);
    
    return { success: true, data: challenge };
  });

  // Complete challenge
  app.post('/api/challenges/:id/complete', async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = getOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);
    const { id } = req.params as { id: string };
    
    try {
      const result = completeChallenge(user.id, parseInt(id));
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Delete challenge
  app.delete('/api/challenges/:id', async (req) => {
    const db = getDb();
    const { id } = req.params as { id: string };
    db.prepare('DELETE FROM challenges WHERE id = ?').run(id);
    return { success: true };
  });
}
