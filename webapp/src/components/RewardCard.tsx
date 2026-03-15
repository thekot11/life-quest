interface Props {
  reward: any;
  userPoints: number;
  onPurchase: (id: number) => void;
  isConfirming?: boolean;
}

export function RewardCard({ reward, userPoints, onPurchase, isConfirming }: Props) {
  const canAfford = userPoints >= reward.cost_points;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 mb-3 transition-all ${
      isConfirming ? 'border-primary-300' : 'border-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{reward.emoji || '🎁'}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{reward.title}</h3>
            {reward.description && (
              <p className="text-xs text-gray-400">{reward.description}</p>
            )}
            {reward.times_purchased > 0 && (
              <p className="text-xs text-gray-300 mt-0.5">Куплено: {reward.times_purchased}×</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-primary-600">{reward.cost_points} 💰</div>
          <button
            onClick={() => onPurchase(reward.id)}
            disabled={!canAfford}
            className={`mt-1 text-xs px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95 ${
              !canAfford
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isConfirming
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
            }`}
          >
            {!canAfford ? 'Мало 💰' : isConfirming ? 'Точно?' : 'Купить'}
          </button>
        </div>
      </div>
    </div>
  );
}
