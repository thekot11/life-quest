const API_BASE = '';

function getInitData(): string {
  try {
    return (window as any).Telegram?.WebApp?.initData || '';
  } catch {
    return '';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const initData = getInitData();
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...options.headers,
    },
  });
  
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data;
}

export const api = {
  // User
  getUser: () => request<any>('/api/user'),
  
  // Categories
  getCategories: () => request<any[]>('/api/categories'),
  
  // Challenges
  getChallenges: (categoryId?: number) => {
    const q = categoryId ? `?category=${categoryId}` : '';
    return request<any[]>(`/api/challenges${q}`);
  },
  createChallenge: (data: any) => request<any>('/api/challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  generateChallenge: (categoryId?: number) => request<any>('/api/challenges/generate', {
    method: 'POST',
    body: JSON.stringify({ category_id: categoryId }),
  }),
  completeChallenge: (id: number) => request<any>(`/api/challenges/${id}/complete`, {
    method: 'POST',
  }),
  deleteChallenge: (id: number) => request<void>(`/api/challenges/${id}`, {
    method: 'DELETE',
  }),
  
  // Rewards
  getRewards: () => request<any[]>('/api/rewards'),
  createReward: (data: any) => request<any>('/api/rewards', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  purchaseReward: (id: number) => request<any>(`/api/rewards/${id}/purchase`, {
    method: 'POST',
  }),
  deleteReward: (id: number) => request<void>(`/api/rewards/${id}`, {
    method: 'DELETE',
  }),
  
  // Stats
  getStats: () => request<any>('/api/stats'),
  getHistory: (limit = 50) => request<any[]>(`/api/stats/history?limit=${limit}`),
};
