import { useStore } from '../store';

const tabs = [
  { id: 'home' as const, label: 'Главная', icon: '🏠' },
  { id: 'challenges' as const, label: 'Челленджи', icon: '🎯' },
  { id: 'rewards' as const, label: 'Магазин', icon: '🎁' },
  { id: 'stats' as const, label: 'Статистика', icon: '📊' },
];

export function BottomNav() {
  const { tab, setTab } = useStore();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe">
      <div className="flex justify-around items-center h-16">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              tab === t.id ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] mt-0.5 font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
