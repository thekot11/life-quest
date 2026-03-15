import { useEffect } from 'react';
import { useStore } from '../store';
import { getUser } from '../services/storage';
import { ProgressBar } from '../components/ProgressBar';

export function Home() {
  const { user, setUser, setTab } = useStore();

  useEffect(() => {
    setUser(getUser());
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">🎮 Life Quest</h1>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">{user.display_name || 'Герой'}</h2>
            <p className="text-white/70 text-sm">Уровень {user.level}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">💰 {user.points_balance}</div>
            <p className="text-white/70 text-xs">поинтов</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{user.level}</div>
            <div className="text-xs text-white/70">Уровень</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.streak}</div>
            <div className="text-xs text-white/70">Дней подряд</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.best_streak}</div>
            <div className="text-xs text-white/70">Лучший стрик</div>
          </div>
        </div>

        <ProgressBar
          current={user.xp}
          total={user.xp_to_next}
          label={`Опыт до ${user.level + 1} уровня`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTab('challenges')}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:scale-95 transition-transform"
        >
          <span className="text-2xl">🎯</span>
          <h3 className="font-semibold text-gray-900 mt-2">Челленджи</h3>
          <p className="text-xs text-gray-400 mt-0.5">Найди новый вызов</p>
        </button>
        <button
          onClick={() => setTab('rewards')}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:scale-95 transition-transform"
        >
          <span className="text-2xl">🎁</span>
          <h3 className="font-semibold text-gray-900 mt-2">Магазин</h3>
          <p className="text-xs text-gray-400 mt-0.5">Потрать поинты</p>
        </button>
      </div>

      {user.streak > 0 && (
        <div className="mt-4 bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-orange-800">Стрик: {user.streak} {getDaysWord(user.streak)}!</p>
              <p className="text-xs text-orange-600">Не забудь выполнить челлендж сегодня</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDaysWord(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'дней';
  if (last > 1 && last < 5) return 'дня';
  if (last === 1) return 'день';
  return 'дней';
}
