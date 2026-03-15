import { create } from 'zustand';

type Tab = 'home' | 'challenges' | 'rewards' | 'stats';

interface AppState {
  tab: Tab;
  setTab: (tab: Tab) => void;
  
  user: any | null;
  setUser: (user: any) => void;
  
  categories: any[];
  setCategories: (cats: any[]) => void;
  
  challenges: any[];
  setChallenges: (challenges: any[]) => void;
  
  rewards: any[];
  setRewards: (rewards: any[]) => void;
  
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  tab: 'home',
  setTab: (tab) => set({ tab }),
  
  user: null,
  setUser: (user) => set({ user }),
  
  categories: [],
  setCategories: (categories) => set({ categories }),
  
  challenges: [],
  setChallenges: (challenges) => set({ challenges }),
  
  rewards: [],
  setRewards: (rewards) => set({ rewards }),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
