# 🎮 Life Quest

Персональная RPG-система мотивации в Telegram Mini App.

## Быстрый старт

### 1. Установка зависимостей

```bash
cd api && npm install --include=dev
cd ../bot && npm install --include=dev
cd ../webapp && npm install --include=dev
```

### 2. Настройка

```bash
cp .env.example .env
# Заполни BOT_TOKEN и WEBAPP_URL в .env
```

### 3. Сборка webapp

```bash
cd webapp && npx vite build
```

### 4. Запуск

```bash
cd api && npx tsx src/index.ts
```

Сервер запустится на `http://localhost:3000` с API + статикой Mini App.

### 5. Telegram Bot

1. Создай бота через [@BotFather](https://t.me/BotFather)
2. Впиши `BOT_TOKEN` в `.env`
3. Настрой Menu Button → Web App URL на свой домен
4. Перезапусти сервер

## Структура

```
life-quest/
├── api/        # Backend (Fastify + SQLite)
├── bot/        # Telegram Bot (grammy)
├── webapp/     # Mini App (React + Vite + Tailwind)
└── shared/     # Общие типы
```

## API

- `GET /api/user` — профиль
- `GET /api/categories` — категории
- `GET /api/challenges` — челленджи
- `POST /api/challenges` — создать челлендж
- `POST /api/challenges/generate` — AI генерация
- `POST /api/challenges/:id/complete` — выполнить
- `GET /api/rewards` — награды
- `POST /api/rewards` — создать награду
- `POST /api/rewards/:id/purchase` — купить
- `GET /api/stats` — статистика
