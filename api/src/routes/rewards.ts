import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index';
import { getOrCreateUser, purchaseReward } from '../services/game';

export function rewardRoutes(app: FastifyInstance) {
  // List rewards
  app.get('/api/rewards', async () => {
    const db = getDb();
    const rewards = db.prepare('SELECT * FROM rewards WHERE is_available = 1 ORDER BY cost_points ASC').all();
    return { success: true, data: rewards };
  });

  // Create reward
  app.post('/api/rewards', async (req) => {
    const db = getDb();
    const { title, description, emoji, cost_points } = req.body as any;
    
    const result = db.prepare(`
      INSERT INTO rewards (title, description, emoji, cost_points)
      VALUES (?, ?, ?, ?)
    `).run(title, description || null, emoji || '🎁', cost_points);
    
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(result.lastInsertRowid);
    return { success: true, data: reward };
  });

  // Update reward
  app.put('/api/rewards/:id', async (req) => {
    const db = getDb();
    const { id } = req.params as { id: string };
    const { title, description, emoji, cost_points, is_available } = req.body as any;
    
    db.prepare(`
      UPDATE rewards SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        emoji = COALESCE(?, emoji),
        cost_points = COALESCE(?, cost_points),
        is_available = COALESCE(?, is_available)
      WHERE id = ?
    `).run(title, description, emoji, cost_points, is_available, id);
    
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
    return { success: true, data: reward };
  });

  // Purchase reward
  app.post('/api/rewards/:id/purchase', async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = getOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);
    const { id } = req.params as { id: string };
    
    try {
      const result = purchaseReward(user.id, parseInt(id));
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Delete reward
  app.delete('/api/rewards/:id', async (req) => {
    const db = getDb();
    const { id } = req.params as { id: string };
    db.prepare('UPDATE rewards SET is_available = 0 WHERE id = ?').run(id);
    return { success: true };
  });
}
