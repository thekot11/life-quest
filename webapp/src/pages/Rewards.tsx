import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { api } from '../api/client';
import { RewardCard } from '../components/RewardCard';

export function Rewards() {
  const { rewards, setRewards, user, setUser } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎁');
  const [newCost, setNewCost] = useState('100');

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      const r = await api.getRewards();
      setRewards(r);
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePurchase(id: number) {
    const reward = rewards.find((r: any) => r.id === id);
    if (!reward) return;
    
    if (!confirm(`Купить "${reward.title}" за ${reward.cost_points} 💰?`)) return;
    
    try {
      const result = await api.purchaseReward(id);
      await loadRewards();
      const u = await api.getUser();
      setUser(u);
      showToast(`🎉 Награда куплена! Осталось ${result.remaining_balance} 💰`);
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim() || !newCost) return;
    try {
      await api.createReward({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        emoji: newEmoji || '🎁',
        cost_points: parseInt(newCost),
      });
      setNewTitle('');
      setNewDesc('');
      setNewEmoji('🎁');
      setNewCost('100');
      setShowCreate(false);
      await loadRewards();
      showToast('✅ Награда добавлена!');
    } catch (err) {
      console.error(err);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-4 pb-20">
      {/* Header with balance */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">🎁 Магазин наград</h1>
        <div className="bg-primary-50 px-3 py-1.5 rounded-full">
          <span className="text-sm font-bold text-primary-600">{user?.points_balance || 0} 💰</span>
        </div>
      </div>

      {/* Add reward button */}
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-3 text-gray-400 font-medium mb-4 active:scale-95 transition-transform"
      >
        ➕ Добавить награду
      </button>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Новая награда</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              placeholder="🎁"
              className="w-14 border border-gray-200 rounded-xl px-2 py-2 text-center text-xl focus:outline-none focus:border-primary-400"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Название награды"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Описание (необязательно)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-400"
          />
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
              placeholder="Стоимость"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
            />
            <span className="flex items-center text-sm text-gray-400">💰 поинтов</span>
          </div>
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim() || !newCost}
            className="w-full bg-primary-500 text-white font-medium py-2.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            Добавить
          </button>
        </div>
      )}

      {/* Rewards list */}
      {rewards.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-2">🎁</p>
          <p>Нет наград</p>
          <p className="text-sm">Добавь первую награду!</p>
        </div>
      ) : (
        rewards.map((r: any) => (
          <RewardCard
            key={r.id}
            reward={r}
            userPoints={user?.points_balance || 0}
            onPurchase={handlePurchase}
          />
        ))
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl text-center shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
