interface Props {
  challenge: any;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

const diffColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const diffLabels: Record<string, string> = {
  easy: 'Лёгкий',
  medium: 'Средний',
  hard: 'Сложный',
};

export function ChallengeCard({ challenge, onComplete, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{challenge.category_emoji || '🎯'}</span>
            <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
          </div>
          {challenge.description && (
            <p className="text-sm text-gray-500 mb-2">{challenge.description}</p>
          )}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[challenge.difficulty] || diffColors.medium}`}>
              {diffLabels[challenge.difficulty] || 'Средний'}
            </span>
            <span className="text-xs text-gray-400">⭐ {challenge.xp_reward} XP</span>
            {challenge.source === 'ai' && (
              <span className="text-xs text-purple-400">🤖 AI</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onComplete(challenge.id)}
          className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium py-2 rounded-xl active:scale-95 transition-transform"
        >
          ✅ Выполнено
        </button>
        <button
          onClick={() => onDelete(challenge.id)}
          className="px-3 py-2 text-gray-400 text-sm rounded-xl hover:bg-gray-50 active:scale-95 transition-transform"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
