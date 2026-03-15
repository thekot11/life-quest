import 'dotenv/config';
import path from 'path';
import { initDb } from './db/index';
import { createServer } from './server';

// Optional: import bot
let startBot: (() => Promise<void>) | undefined;
try {
  const botModule = require('../../bot/src/index');
  startBot = botModule.startBot;
} catch {
  console.log('Bot module not found, running API only');
}

async function main() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/life-quest.db');
  initDb(dbPath);
  console.log('✅ Database initialized');

  const server = await createServer();
  const port = parseInt(process.env.API_PORT || '3000');
  const host = process.env.API_HOST || '0.0.0.0';

  await server.listen({ port, host });
  console.log(`🚀 API server running on http://${host}:${port}`);

  if (startBot) {
    await startBot();
    console.log('🤖 Telegram bot started');
  }
}

main().catch(console.error);
