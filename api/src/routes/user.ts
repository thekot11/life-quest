import { FastifyInstance } from 'fastify';
import { getOrCreateUser, getUserProfile } from '../services/game';

export function userRoutes(app: FastifyInstance) {
  app.get('/api/user', async (req) => {
    const tgUser = (req as any).telegramUser;
    const user = getOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);
    return { success: true, data: getUserProfile(user) };
  });
}
