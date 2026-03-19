import { calcMatchScore, getScoreColorClass, getWeakestDimensionTip } from '../lib/matchScore';
import { Lightbulb } from 'lucide-react';

const DIM_LABELS = {
  quiet:     'Ro / ingen støj',
  distance:  'Afstand (køretid)',
  condition: 'Stand / varmekilde',
  price:     'Pris vs. budget',
};

function Bar({ score }) {
  const colors = getScoreColorClass(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bg} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-semibold w-6 text-right ${colors.text}`}>{score}</span>
    </div>
  );
}

export default function MatchScoreBreakdown({ property, settings }) {
  const result = calcMatchScore(property, settings);
  const { components } = result;
  const tip = getWeakestDimensionTip(components);

  return (
    <div className="space-y-3">
      {Object.entries(components).map(([key, val]) => {
        if (!val) return null;
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">{DIM_LABELS[key]}</span>
              <span className="text-xs text-gray-400">
                ×{(val.weight * 100).toFixed(0)}% = {val.contribution} point
              </span>
            </div>
            <Bar score={val.score} />
          </div>
        );
      })}

      {tip && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{tip}</p>
        </div>
      )}
    </div>
  );
}
