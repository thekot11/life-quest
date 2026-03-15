import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.BOT_TOKEN || '8766105120:AAFQw8L7MfSNMz6rxpS76FHCL9NHyHRRYuo';
const webappUrl = process.env.WEBAPP_URL || 'https://thekot11.github.io/life-quest/';

const bot = new Bot(token);

const mainKeyboard = new InlineKeyboard().webApp('🎮 Открыть Life Quest', webappUrl);

const WELCOME = `🎮 *Life Quest*

Твоя персональная RPG для прокачки реальной жизни!

*Как это работает:*
🎯 Выполняй ежедневные челленджи
⭐ Получай XP и поинты
📈 Повышай уровень
🎁 Трать поинты на награды

*Категории:*
⚡ Продуктивность
❤️ Здоровье
🎨 Творчество
👥 Общение
🧘 Осознанность

Нажми кнопку ниже, чтобы начать:`;

const HELP = `📖 *Команды:*

/start — Главное меню
/play — Открыть приложение
/help — Эта справка
/about — О проекте

*Как играть:*
1\\. Открой приложение по кнопке ниже
2\\. Выбирай и выполняй челленджи
3\\. Получай XP и поинты за выполнение
4\\. Копи поинты и трать на награды
5\\. Поддерживай стрик — чем дольше серия, тем больше бонус\\!

*Множители стрика:*
🔥 3\\-6 дней → x1\\.5
🔥🔥 7\\-13 дней → x2\\.0
🔥🔥🔥 14\\-29 дней → x2\\.5
👑 30\\+ дней → x3\\.0`;

const ABOUT = `🎮 *Life Quest v1\\.0\\.0*

Персональная RPG\\-система мотивации\\.

Превращай повседневные задачи в игру с реальными наградами\\. Выполняй челленджи по 5 категориям жизни, прокачивай персонажа и трать заработанные поинты на то, что любишь\\.

🛠 Сделано с ❤️`;

// /start
bot.command('start', async (ctx) => {
  await ctx.reply(WELCOME, { parse_mode: 'Markdown', reply_markup: mainKeyboard });
});

// /play
bot.command('play', async (ctx) => {
  await ctx.reply('🎮 Открывай и играй\\!', { parse_mode: 'MarkdownV2', reply_markup: mainKeyboard });
});

// /help
bot.command('help', async (ctx) => {
  await ctx.reply(HELP, { parse_mode: 'MarkdownV2', reply_markup: mainKeyboard });
});

// /about
bot.command('about', async (ctx) => {
  await ctx.reply(ABOUT, { parse_mode: 'MarkdownV2', reply_markup: mainKeyboard });
});

// Any text message
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.toLowerCase();
  
  if (text.includes('привет') || text.includes('здравств') || text.includes('хай') || text.includes('hello')) {
    await ctx.reply('👋 Привет\\! Готов к челленджам?', { parse_mode: 'MarkdownV2', reply_markup: mainKeyboard });
  } else if (text.includes('помощь') || text.includes('помоги') || text.includes('как')) {
    await ctx.reply(HELP, { parse_mode: 'MarkdownV2', reply_markup: mainKeyboard });
  } else {
    await ctx.reply('🎮 Нажми кнопку ниже, чтобы открыть Life Quest\\!', { parse_mode: 'MarkdownV2', reply_markup: mainKeyboard });
  }
});

// Any other message (stickers, photos etc)
bot.on('message', async (ctx) => {
  await ctx.reply('🎮 Открой Life Quest и начни играть\\!', { parse_mode: 'MarkdownV2', reply_markup: mainKeyboard });
});

bot.start();
console.log('🤖 Life Quest Bot started!');
