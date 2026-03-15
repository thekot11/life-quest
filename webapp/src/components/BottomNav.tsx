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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              tab === t.id
                ? 'text-primary-600 font-semibold'
                : 'text-gray-400'
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-[10px] mt-1">{t.label}</span>
          </button>
        ))}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
