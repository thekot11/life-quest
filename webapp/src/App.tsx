import { useEffect } from 'react';
import { useStore } from './store';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Challenges } from './pages/Challenges';
import { Rewards } from './pages/Rewards';
import { Stats } from './pages/Stats';

function App() {
  const { tab } = useStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#8b5cf6');
        tg.setBackgroundColor('#ffffff');
      }
    } catch {
      // Not in Telegram context
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
