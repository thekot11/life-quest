import { getDb } from '../db/index';
import type { Difficulty } from '../../../shared/src/types';

interface GeneratedChallenge {
  title: string;
  description: string;
  difficulty: Difficulty;
  category_id: number;
}

export async function generateChallenge(
  categoryId: number | null,
  userLevel: number
): Promise<GeneratedChallenge> {
  const db = getDb();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Get category info
  let categoryName = 'любая';
  let resolvedCategoryId = categoryId;
  
  if (categoryId) {
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId) as any;
    if (cat) categoryName = cat.name;
  } else {
    // Random category
    const cats = db.prepare('SELECT * FROM categories').all() as any[];
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    resolvedCategoryId = randomCat.id;
    categoryName = randomCat.name;
  }

  // Get recent challenges to avoid duplicates
  const recent = db.prepare(
    `SELECT title FROM challenges ORDER BY created_at DESC LIMIT 20`
  ).all() as { title: string }[];
  const recentTitles = recent.map(r => r.title).join(', ');

  // XP based on difficulty
  const xpMap: Record<Difficulty, number> = { easy: 15, medium: 40, hard: 85 };

  if (!apiKey) {
    // Fallback: return a pre-defined challenge
    return getFallbackChallenge(resolvedCategoryId!, categoryName, userLevel);
  }

  const prompt = `Ты — генератор ежедневных челленджей для приложения геймификации жизни.

Пользователь: уровень ${userLevel}, категория: ${categoryName}.
Уже существующие челленджи (не повторяй): ${recentTitles || 'пока нет'}

Сгенерируй 1 челлендж. Ответь ТОЛЬКО в JSON без markdown:
{"title": "Короткое название (до 50 символов)", "description": "Описание что нужно сделать (1-2 предложения)", "difficulty": "easy|medium|hard"}

Правила:
- Челлендж должен быть выполним за 1 день
- Не повторяй уже существующие
- Сложность должна соответствовать уровню пользователя (выше уровень = чаще сложные)
- Будь креативным, но реалистичным
- Отвечай на русском`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) throw new Error('Empty AI response');
    
    const parsed = JSON.parse(content);
    const difficulty: Difficulty = ['easy', 'medium', 'hard'].includes(parsed.difficulty) 
      ? parsed.difficulty 
      : 'medium';

    return {
      title: parsed.title,
      description: parsed.description,
      difficulty,
      category_id: resolvedCategoryId!,
    };
  } catch (err) {
    console.error('AI generation failed, using fallback:', err);
    return getFallbackChallenge(resolvedCategoryId!, categoryName, userLevel);
  }
}

function getFallbackChallenge(categoryId: number, categoryName: string, level: number): GeneratedChallenge {
  const fallbacks: Record<string, Array<{ title: string; description: string; difficulty: Difficulty }>> = {
    'Продуктивность': [
      { title: 'Планирование дня', description: 'Составь план на день с 3 главными задачами и выполни их', difficulty: 'easy' },
      { title: 'Pomodoro марафон', description: 'Проведи 4 сессии Pomodoro (25 мин работы + 5 мин отдых)', difficulty: 'medium' },
      { title: 'Digital detox 4 часа', description: 'Проведи 4 часа без соцсетей и мессенджеров', difficulty: 'hard' },
    ],
    'Здоровье': [
      { title: 'Выпей 2л воды', description: 'Следи за потреблением воды в течение дня — минимум 2 литра', difficulty: 'easy' },
      { title: 'Тренировка 30 минут', description: 'Любая физическая активность не менее 30 минут', difficulty: 'medium' },
      { title: 'Холодный душ', description: 'Прими холодный душ минимум 3 минуты', difficulty: 'hard' },
    ],
    'Творчество': [
      { title: 'Сделай фото', description: 'Сделай одну художественную фотографию чего угодно', difficulty: 'easy' },
      { title: 'Напиши текст', description: 'Напиши короткий рассказ, стихотворение или заметку на 500+ слов', difficulty: 'medium' },
      { title: 'Создай что-то новое', description: 'Создай что-то руками: рисунок, поделку, дизайн, музыку', difficulty: 'hard' },
    ],
    'Общение': [
      { title: 'Напиши другу', description: 'Напиши сообщение другу, с которым давно не общался', difficulty: 'easy' },
      { title: 'Познакомься', description: 'Заведи разговор с незнакомым человеком (вживую или онлайн)', difficulty: 'medium' },
      { title: 'Организуй встречу', description: 'Организуй встречу или созвон с друзьями/коллегами', difficulty: 'hard' },
    ],
    'Осознанность': [
      { title: 'Медитация 10 минут', description: 'Проведи 10-минутную медитацию или дыхательное упражнение', difficulty: 'easy' },
      { title: 'Дневник благодарности', description: 'Запиши 5 вещей, за которые ты благодарен сегодня', difficulty: 'medium' },
      { title: 'День без жалоб', description: 'Проведи весь день, не жалуясь ни на что', difficulty: 'hard' },
    ],
  };

  const list = fallbacks[categoryName] || fallbacks['Продуктивность'];
  const challenge = list[Math.floor(Math.random() * list.length)];
  const xpMap: Record<Difficulty, number> = { easy: 15, medium: 40, hard: 85 };

  return {
    ...challenge,
    category_id: categoryId,
  };
}
