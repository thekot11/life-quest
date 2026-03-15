# 🎮 Life Quest — Техническая документация v1.0.0

> Персональная RPG-система мотивации в Telegram Mini App

---

## 1. Обзор проекта

**Life Quest** — приложение для геймификации повседневной жизни. Ежедневные челленджи по категориям, система XP/уровней/стриков и магазин наград, где заработанные поинты тратятся на реальные удовольствия.

- **Платформа:** Telegram Mini App (WebApp)
- **Аудитория:** персональное использование (1 пользователь — Влад)
- **Цель:** превратить полезные привычки и задачи в игру с ощутимыми наградами

---

## 2. Архитектура

### Компоненты

```
┌─────────────────────────────────────────────┐
│                  Telegram                    │
│                                             │
│  ┌──────────┐         ┌──────────────────┐  │
│  │   Bot    │         │   Mini App       │  │
│  │ (команды,│         │  (React WebApp)  │  │
│  │ напомин.)│         │                  │  │
│  └────┬─────┘         └────────┬─────────┘  │
└───────┼────────────────────────┼────────────┘
        │                        │
        ▼                        ▼
┌─────────────────────────────────────────────┐
│            Backend API (Node.js)            │
│              Express / Fastify              │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Auth     │  │ Game     │  │ AI        │ │
│  │ (TG SDK) │  │ Logic    │  │ Generator │ │
│  └──────────┘  └──────────┘  └───────────┘ │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   SQLite (DB)   │
              │ better-sqlite3  │
              └─────────────────┘
```

### Деплой

Всё на одном сервере:
- Node.js процесс (бот + API)
- Статика Mini App (через nginx/caddy или встроенно)
- SQLite файл на диске

---

## 3. Стек технологий

| Слой | Технология | Зачем |
|------|-----------|-------|
| **Frontend** | React 18 + Vite | Быстрый SPA для Mini App |
| **Стили** | TailwindCSS | Гибкая стилизация, быстрая вёрстка |
| **TG интеграция** | @twa-dev/sdk | Telegram WebApp API |
| **Backend** | Node.js + Fastify | Лёгкий, быстрый API |
| **БД** | SQLite (better-sqlite3) | Простота, нулевая настройка |
| **Бот** | grammy | Современная библиотека для TG ботов |
| **AI** | OpenAI API (GPT-4o-mini) | Генерация челленджей |
| **Деплой** | PM2 + Caddy | Процесс-менеджер + reverse proxy |

---

## 4. Структура базы данных

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  points_balance INTEGER DEFAULT 0,
  points_total_earned INTEGER DEFAULT 0,
  points_total_spent INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_active_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### categories
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Начальные данные:
-- 🎯 Все категории (виртуальная, не в БД)
-- ⚡ Продуктивность
-- ❤️ Здоровье
-- 🎨 Творчество
-- 👥 Общение
-- 🧘 Осознанность
```

### challenges
```sql
CREATE TABLE challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  xp_reward INTEGER NOT NULL,
  source TEXT CHECK(source IN ('custom', 'ai')) DEFAULT 'custom',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### challenge_completions
```sql
CREATE TABLE challenge_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  challenge_id INTEGER REFERENCES challenges(id),
  xp_earned INTEGER NOT NULL,
  points_earned INTEGER NOT NULL,
  streak_multiplier REAL DEFAULT 1.0,
  completed_at TEXT DEFAULT (datetime('now'))
);
```

### rewards
```sql
CREATE TABLE rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  cost_points INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1,
  times_purchased INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### reward_purchases
```sql
CREATE TABLE reward_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  reward_id INTEGER REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  purchased_at TEXT DEFAULT (datetime('now'))
);
```

---

## 5. API эндпоинты

### Пользователь
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/user` | Профиль (уровень, XP, поинты, стрик) |
| PUT | `/api/user/settings` | Обновить настройки |

### Челленджи
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/challenges` | Список активных челленджей |
| GET | `/api/challenges?category=:id` | Фильтр по категории |
| POST | `/api/challenges` | Создать свой челлендж |
| POST | `/api/challenges/generate` | AI-генерация челленджа |
| POST | `/api/challenges/:id/complete` | Отметить выполненным |
| DELETE | `/api/challenges/:id` | Удалить челлендж |

### Награды
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/rewards` | Список наград |
| POST | `/api/rewards` | Создать награду |
| PUT | `/api/rewards/:id` | Редактировать награду |
| POST | `/api/rewards/:id/purchase` | Купить награду |
| DELETE | `/api/rewards/:id` | Удалить награду |

### Статистика
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/stats` | Общая статистика |
| GET | `/api/stats/history` | История выполнений |
| GET | `/api/stats/categories` | Прогресс по категориям |

### Авторизация
Все запросы содержат заголовок `X-Telegram-Init-Data` с initData от Telegram WebApp SDK. Бэкенд валидирует подпись через bot token.

---

## 6. Геймификация — баланс

### XP за челленджи

| Сложность | XP | Пример |
|-----------|-----|--------|
| 🟢 Лёгкий | 10-20 | Выпить 2л воды, 10 мин прогулка |
| 🟡 Средний | 30-50 | Тренировка 30 мин, прочитать главу книги |
| 🔴 Хард | 70-100 | Холодный душ 5 мин, 2 часа без телефона |

### Уровни

Прогрессивная формула: `XP_для_уровня = 100 * level^1.5`

| Уровень | XP для следующего | Суммарный XP |
|---------|-------------------|-------------|
| 1 → 2 | 100 | 100 |
| 2 → 3 | 283 | 383 |
| 3 → 4 | 520 | 903 |
| 5 → 6 | 1,118 | 2,886 |
| 10 → 11 | 3,162 | 15,474 |

### Стрик-множители

| Дней подряд | Множитель |
|-------------|-----------|
| 1-2 | x1.0 |
| 3-6 | x1.5 |
| 7-13 | x2.0 |
| 14-29 | x2.5 |
| 30+ | x3.0 |

### Поинты

**1 XP = 1 поинт** (с учётом множителя стрика)

Выполнил средний челлендж (40 XP) на 7-м дне стрика → 40 × 2.0 = **80 поинтов**

### Примеры наград

| Награда | Стоимость | Примечание |
|---------|-----------|-----------|
| 🍕 Читмил | 200 | Любая еда без ограничений |
| 🎮 Игры 2 часа | 150 | Guilt-free gaming |
| 📺 Сериал (вечер) | 100 | Один вечер сериалов |
| 💆 Поход в спа | 500 | Полноценный спа-день |
| 🛍️ Покупка до $50 | 800 | Что угодно себе |
| 🛍️ Покупка до $100 | 1,500 | Крупная покупка |
| 🏖️ Выходной день | 1,000 | День без обязательств |

*Все награды настраиваемые — добавляй/меняй через магазин.*

---

## 7. Экраны Mini App

### 7.1 🏠 Главная
- Аватар + имя + уровень
- Прогресс-бар XP до следующего уровня
- Стрик (дней подряд) + баланс поинтов
- Текущий/рекомендованный челлендж
- Быстрые кнопки: «Новый челлендж», «Магазин»

### 7.2 🎯 Челленджи
- Фильтр по категориям (горизонтальный скролл)
- Список активных челленджей (карточки)
- Кнопка «Получить новый челлендж» (AI-генерация)
- Кнопка «Создать свой»
- Свайп для отметки выполнения

### 7.3 🎁 Магазин наград
- Баланс поинтов сверху
- Список наград (карточки с ценой)
- Кнопка покупки (с подтверждением)
- Кнопка «Добавить награду»

### 7.4 ➕ Создание награды/челленджа
- Форма: название, описание, emoji, категория/сложность/цена
- Превью карточки

### 7.5 📊 Статистика
- График активности (тепловая карта, как на GitHub)
- Прогресс по категориям (радарная диаграмма)
- История выполненных челленджей
- Лучший стрик, всего XP, всего наград куплено

### 7.6 ⚙️ Настройки
- Управление категориями
- Время напоминаний
- Экспорт данных

### Навигация
Нижняя панель с 4 вкладками: Главная | Челленджи | Магазин | Статистика

---

## 8. Telegram Bot

### Команды
| Команда | Описание |
|---------|----------|
| `/start` | Приветствие + кнопка открытия Mini App |
| `/challenge` | Случайный челлендж прямо в чат |
| `/stats` | Краткая статистика (уровень, стрик, поинты) |
| `/rewards` | Список доступных наград |
| `/remind` | Настроить напоминания |

### Напоминания
- **Утро (настраиваемое время):** «🌅 Доброе утро! Вот твой челлендж на сегодня: ...»
- **Вечер (настраиваемое время):** «🌙 Ты сегодня выполнил X челленджей! [Открыть приложение]» или «⚠️ Ещё не выполнил ни одного — стрик под угрозой!»

### Inline-кнопка
Каждое сообщение бота содержит кнопку «🎮 Открыть Life Quest» → Mini App

---

## 9. AI-генерация челленджей

### Как работает
1. Пользователь нажимает «Получить новый челлендж»
2. Выбирает категорию (или «любая»)
3. Бэкенд отправляет запрос к OpenAI API
4. Промпт учитывает: категорию, уровень пользователя, историю (чтобы не повторяться)
5. Ответ парсится и сохраняется как новый челлендж

### Промпт (шаблон)
```
Ты — генератор ежедневных челленджей для приложения геймификации жизни.

Пользователь: уровень {level}, категория: {category}.
Уже выполненные челленджи (последние 20): {recent_challenges}

Сгенерируй 1 челлендж. Ответь в JSON:
{
  "title": "Короткое название (до 50 символов)",
  "description": "Описание что нужно сделать (1-2 предложения)",
  "difficulty": "easy|medium|hard",
  "category": "{category}"
}

Правила:
- Челлендж должен быть выполним за 1 день
- Не повторяй уже выполненные
- Сложность соответствует уровню пользователя
- Будь креативным, но реалистичным
```

### Фильтрация дубликатов
- Проверка по title (fuzzy match, порог 80% сходства)
- Хранение последних 100 сгенерированных в контексте промпта

---

## 10. План разработки

### Фаза 1: Фундамент (2-3 дня)
- [  ] Инициализация проекта (monorepo структура)
- [  ] Настройка SQLite + миграции
- [  ] Telegram Bot (grammy) — /start, inline кнопка
- [  ] Базовый API: /api/user, авторизация через initData

### Фаза 2: Челленджи (2-3 дня)
- [  ] CRUD челленджей (API)
- [  ] Mini App: экран челленджей
- [  ] Выполнение челленджа → начисление XP + поинтов
- [  ] Система уровней

### Фаза 3: Магазин наград (1-2 дня)
- [  ] CRUD наград (API)
- [  ] Mini App: экран магазина
- [  ] Покупка награды → списание поинтов

### Фаза 4: Геймификация (2-3 дня)
- [  ] Стрики + множители
- [  ] AI-генерация челленджей
- [  ] Категории + фильтрация
- [  ] Mini App: главный экран с прогрессом

### Фаза 5: Полировка (2-3 дня)
- [  ] Статистика + графики
- [  ] Напоминания (бот)
- [  ] Анимации, звуки, haptic feedback
- [  ] Тестирование + деплой

**Итого MVP: ~10-14 дней**

---

## 11. Структура проекта

```
life-quest/
├── README.md
├── TECH_DOC.md              # этот файл
├── package.json              # корневой (workspaces)
│
├── bot/                      # Telegram Bot
│   ├── package.json
│   ├── src/
│   │   ├── index.ts          # точка входа
│   │   ├── bot.ts            # инициализация grammy
│   │   ├── commands/         # обработчики команд
│   │   │   ├── start.ts
│   │   │   ├── challenge.ts
│   │   │   ├── stats.ts
│   │   │   └── rewards.ts
│   │   └── reminders/
│   │       └── scheduler.ts
│   └── tsconfig.json
│
├── api/                      # Backend API
│   ├── package.json
│   ├── src/
│   │   ├── index.ts          # точка входа
│   │   ├── server.ts         # Fastify setup
│   │   ├── auth/
│   │   │   └── telegram.ts   # валидация initData
│   │   ├── routes/
│   │   │   ├── user.ts
│   │   │   ├── challenges.ts
│   │   │   ├── rewards.ts
│   │   │   └── stats.ts
│   │   ├── services/
│   │   │   ├── game.ts       # XP, уровни, стрики
│   │   │   ├── ai.ts         # генерация челленджей
│   │   │   └── rewards.ts
│   │   └── db/
│   │       ├── index.ts      # подключение SQLite
│   │       ├── schema.sql    # схема БД
│   │       └── migrations/
│   └── tsconfig.json
│
├── webapp/                   # Telegram Mini App (React)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   └── client.ts     # HTTP клиент с initData
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ChallengeCard.tsx
│   │   │   ├── RewardCard.tsx
│   │   │   └── StatsChart.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Challenges.tsx
│   │   │   ├── Rewards.tsx
│   │   │   ├── Stats.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useUser.ts
│   │   │   ├── useChallenges.ts
│   │   │   └── useRewards.ts
│   │   ├── store/
│   │   │   └── index.ts      # Zustand store
│   │   └── utils/
│   │       ├── telegram.ts   # TG WebApp helpers
│   │       └── format.ts
│   └── tsconfig.json
│
└── shared/                   # Общие типы
    ├── package.json
    └── src/
        └── types.ts
```

---

## 12. Переменные окружения

```env
# Telegram
BOT_TOKEN=              # токен от @BotFather
WEBAPP_URL=             # URL Mini App (https://...)

# API
API_PORT=3000
API_HOST=0.0.0.0

# Database
DB_PATH=./data/life-quest.db

# AI
OPENAI_API_KEY=         # для генерации челленджей
OPENAI_MODEL=gpt-4o-mini

# Напоминания (UTC+7)
REMINDER_MORNING=08:00
REMINDER_EVENING=21:00
```

---

*Документ будет обновляться по мере разработки.*
