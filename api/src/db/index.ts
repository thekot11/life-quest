import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function initDb(dbPath: string): Database.Database {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);

  // Seed categories
  seedCategories();
  // Seed rewards
  seedRewards();

  return db;
}

function seedCategories() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number };
  if (count.cnt > 0) return;

  const insert = db.prepare('INSERT INTO categories (name, emoji, color, sort_order) VALUES (?, ?, ?, ?)');
  const categories = [
    ['Продуктивность', '⚡', '#8B5CF6', 1],
    ['Здоровье', '❤️', '#EF4444', 2],
    ['Творчество', '🎨', '#F59E0B', 3],
    ['Общение', '👥', '#3B82F6', 4],
    ['Осознанность', '🧘', '#10B981', 5],
  ];

  const tx = db.transaction(() => {
    for (const [name, emoji, color, sort_order] of categories) {
      insert.run(name, emoji, color, sort_order);
    }
  });
  tx();
}

function seedRewards() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM rewards').get() as { cnt: number };
  if (count.cnt > 0) return;

  const insert = db.prepare('INSERT INTO rewards (title, emoji, cost_points, description) VALUES (?, ?, ?, ?)');
  const rewards = [
    ['Читмил', '🍕', 200, 'Любая еда без ограничений'],
    ['Игры 2 часа', '🎮', 150, 'Guilt-free gaming'],
    ['Сериал (вечер)', '📺', 100, 'Один вечер сериалов'],
    ['Поход в спа', '💆', 500, 'Полноценный спа-день'],
    ['Покупка до $50', '🛍️', 800, 'Что угодно себе'],
    ['Покупка до $100', '🛍️', 1500, 'Крупная покупка'],
    ['Выходной день', '🏖️', 1000, 'День без обязательств'],
  ];

  const tx = db.transaction(() => {
    for (const [title, emoji, cost, desc] of rewards) {
      insert.run(title, emoji, cost, desc);
    }
  });
  tx();
}
