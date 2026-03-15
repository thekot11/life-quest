import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { api } from '../api/client';
import { ChallengeCard } from '../components/ChallengeCard';

export function Challenges() {
  const { challenges, setChallenges, categories, setCategories, setUser } = useStore();
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCatId, setNewCatId] = useState<number>(1);
  const [newDiff, setNewDiff] = useState<string>('medium');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [selectedCat]);

  async function loadData() {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
      await loadChallenges();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadChallenges() {
    try {
      const c = await api.getChallenges(selectedCat || undefined);
      setChallenges(c);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await api.generateChallenge(selectedCat || undefined);
      await loadChallenges();
      showToast('🤖 Новый челлендж создан!');
    } catch (err) {
      console.error(err);
      showToast('❌ Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  }

  async function handleComplete(id: number) {
    try {
      const result = await api.completeChallenge(id);
      await loadChallenges();
      const u = await api.getUser();
      setUser(u);
      
      let msg = `✅ +${result.xp_earned} XP, +${result.points_earned} 💰`;
      if (result.streak_multiplier > 1) msg += ` (x${result.streak_multiplier} стрик!)`;
      if (result.leveled_up) msg += `\n🎉 Уровень ${result.new_level}!`;
      showToast(msg);
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteChallenge(id);
      await loadChallenges();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      await api.createChallenge({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        category_id: newCatId,
        difficulty: newDiff,
      });
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
      await loadChallenges();
      showToast('✅ Челлендж создан!');
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
      <h1 className="text-xl font-bold text-gray-900 mb-4">🎯 Челленджи</h1>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCat(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCat === null
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          🎯 Все
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCat === cat.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex-1 bg-gradient-to-r from-primary-500 to-indigo-500 text-white font-medium py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          {generating ? '⏳ Генерирую...' : '🔀 Получить челлендж'}
        </button>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-3 bg-gray-100 rounded-xl active:scale-95 transition-transform"
        >
          ➕
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Новый челлендж</h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Название"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-400"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Описание (необязательно)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-400"
          />
          <div className="flex gap-2 mb-3">
            <select
              value={newCatId}
              onChange={(e) => setNewCatId(parseInt(e.target.value))}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
            >
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
            <select
              value={newDiff}
              onChange={(e) => setNewDiff(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
            >
              <option value="easy">🟢 Лёгкий</option>
              <option value="medium">🟡 Средний</option>
              <option value="hard">🔴 Сложный</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim()}
            className="w-full bg-primary-500 text-white font-medium py-2.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            Создать
          </button>
        </div>
      )}

      {/* Challenge list */}
      {challenges.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-2">🎯</p>
          <p>Нет активных челленджей</p>
          <p className="text-sm">Сгенерируй новый или создай свой!</p>
        </div>
      ) : (
        challenges.map((ch: any) => (
          <ChallengeCard
            key={ch.id}
            challenge={ch}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl text-center shadow-lg animate-fade-in z-50 whitespace-pre-line">
          {toast}
        </div>
      )}
    </div>
  );
}
