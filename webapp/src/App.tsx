import { useEffect } from 'react';
import { useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Challenges } from './pages/Challenges';
import { Rewards } from './pages/Rewards';
import { Stats } from './pages/Stats';
import { initStorage } from './services/storage';

function App() {
  const { tab, setTab } = useStore();

  useEffect(() => {
    initStorage();

    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#8b5cf6');
        tg.setBackgroundColor('#f9fafb');
      }
    } catch {
      // Not in Telegram context
    }
  }, []);

  // Telegram Back Button: show on non-home tabs, go back to home
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) return;

      if (tab !== 'home') {
        tg.BackButton.show();
        const handler = () => setTab('home');
        tg.BackButton.onClick(handler);
        return () => {
          tg.BackButton.offClick(handler);
          tg.BackButton.hide();
        };
      } else {
        tg.BackButton.hide();
      }
    } catch {
      // Not in Telegram context
    }
  }, [tab, setTab]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto">
        {tab === 'home' && <Home />}
        {tab === 'challenges' && <Challenges />}
        {tab === 'rewards' && <Rewards />}
        {tab === 'stats' && <Stats />}
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
