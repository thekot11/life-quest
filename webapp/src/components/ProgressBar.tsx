interface Props {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ current, total, label, className = '' }: Props) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs text-white/80 mb-1">
          <span>{label}</span>
          <span>{current}/{total} XP</span>
        </div>
      )}
      <div className="w-full bg-white/20 rounded-full h-2.5">
        <div
          className="bg-white rounded-full h-2.5 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
