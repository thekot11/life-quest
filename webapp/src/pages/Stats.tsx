import { useEffect, useState } from 'react';
import { getStats, getHistory, undoCompletion } from '../services/storage';
import { useStore } from '../store';
import { getUser } from '../services/storage';

export function Stats() {
  const { setUser } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmUndoId, setConfirmUndoId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setStats(getStats());
    setHistory(getHistory(50));
  }

  function handleUndo(completionId: number) {
    if (confirmUndoId === completionId) {
      undoCompletion(completionId);
      setUser(getUser());
      loadData();
      setConfirmUndoId(null);
      showToastMsg('↩️ Выполнение отменено, XP и поинты возвращены');
    } else {
      setConfirmUndoId(completionId);
      setTimeout(() => setConfirmUndoId(null), 5000);
    }
  }

  function showToastMsg(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-900 mb-4">📊 Статистика</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon="🎯" label="Челленджей" value={stats.total_challenges_completed} />
        <StatCard icon="⭐" label="Всего XP" value={stats.total_xp_earned} />
        <StatCard icon="💰" label="Заработано" value={stats.total_points_earned} />
        <StatCard icon="🎁" label="Наград куплено" value={stats.total_rewards_purchased} />
      </div>

      <h2 className="font-semibold text-gray-900 mb-3">Прогресс по категориям</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        {stats.categories_progress.map((cp: any) => (
          <div key={cp.category_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2">
              <span>{cp.category_emoji}</span>
              <span className="text-sm text-gray-700">{cp.category_name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{cp.completed_count}</span>
              <span className="text-xs text-gray-400 ml-1">({cp.total_xp} XP)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Completed challenges with undo */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Выполненные</h2>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-primary-500 font-medium"
          >
            {showHistory ? 'Скрыть' : `Показать (${history.length})`}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>Пока пусто</p>
          <p className="text-sm">Выполни первый челлендж!</p>
        </div>
      ) : showHistory ? (
        <div className="space-y-2">
          {history.map((h: any) => (
            <div key={h.id} className={`bg-white rounded-xl shadow-sm border px-4 py-3 flex items-center justify-between transition-all ${
              confirmUndoId === h.id ? 'border-red-300' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span>{h.challenge_emoji || '🎯'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{h.challenge_title}</p>
                  <p className="text-xs text-gray-400">{formatDate(h.completed_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-600">+{h.xp_earned} XP</p>
                  {h.streak_multiplier > 1 && (
                    <p className="text-xs text-orange-500">x{h.streak_multiplier} 🔥</p>
                  )}
                </div>
                <button
                  onClick={() => handleUndo(h.id)}
                  className={`text-xs px-2 py-1 rounded-lg transition-all ${
                    confirmUndoId === h.id
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-gray-300 hover:text-red-400'
                  }`}
                  title="Отменить выполнение"
                >
                  {confirmUndoId === h.id ? 'Точно?' : '↩️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {history.slice(0, 3).map((h: any) => (
            <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{h.challenge_emoji || '🎯'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{h.challenge_title}</p>
                  <p className="text-xs text-gray-400">{formatDate(h.completed_at)}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-primary-600">+{h.xp_earned} XP</p>
            </div>
          ))}
          {history.length > 3 && (
            <button
              onClick={() => setShowHistory(true)}
              className="w-full text-center text-xs text-primary-500 py-2"
            >
              Показать все ({history.length})...
            </button>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl text-center shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
