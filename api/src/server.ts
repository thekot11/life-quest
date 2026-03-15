import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { validateInitData, getDevUser } from './auth/telegram';
import { userRoutes } from './routes/user';
import { challengeRoutes } from './routes/challenges';
import { rewardRoutes } from './routes/rewards';
import { statsRoutes } from './routes/stats';

export async function createServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  // Serve webapp static files
  const webappDist = path.join(__dirname, '../../webapp/dist');
  try {
    await app.register(fastifyStatic, {
      root: webappDist,
      prefix: '/',
      wildcard: false,
    });

    // SPA fallback
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) {
        reply.code(404).send({ success: false, error: 'Not found' });
      } else {
        reply.sendFile('index.html');
      }
    });
  } catch {
    console.log('Webapp dist not found, skipping static files');
  }

  // Auth middleware for /api routes
  app.addHook('preHandler', async (req, reply) => {
    if (!req.url.startsWith('/api/')) return;

    const botToken = process.env.BOT_TOKEN;
    const initData = req.headers['x-telegram-init-data'] as string;

    if (initData && botToken) {
      const user = validateInitData(initData, botToken);
      if (user) {
        (req as any).telegramUser = user;
        return;
      }
    }

    // Dev mode fallback
    if (process.env.NODE_ENV !== 'production') {
      (req as any).telegramUser = getDevUser();
      return;
    }

    reply.code(401).send({ success: false, error: 'Unauthorized' });
  });

  // Register routes
  userRoutes(app);
  challengeRoutes(app);
  rewardRoutes(app);
  statsRoutes(app);

  return app;
}
