import { getScoreColorClass, getScoreLabel } from '../lib/matchScore';

export default function MatchScoreBadge({ score, size = 'md', showLabel = false }) {
  if (score === null || score === undefined) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`rounded-full bg-gray-200 text-gray-500 font-bold flex items-center justify-center ${{
          sm: 'w-10 h-10 text-sm',
          md: 'w-14 h-14 text-lg',
          lg: 'w-20 h-20 text-2xl',
        }[size]}`}>
          —
        </div>
        {showLabel && <span className="text-xs text-gray-400">Ingen score</span>}
      </div>
    );
  }

  const colors = getScoreColorClass(score);
  const sizeClass = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  }[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`rounded-full ${colors.bg} text-white font-bold flex items-center justify-center ${sizeClass}`}>
        {score}
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${colors.text}`}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
