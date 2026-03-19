import { useNavigate } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CompareBar() {
  const { compareIds, properties, clearCompare } = useApp();
  const navigate = useNavigate();

  if (compareIds.length < 2) return null;

  const selected = compareIds
    .map(id => properties.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-800 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-indigo-300 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            {selected.map(p => (
              <span key={p.id} className="bg-slate-700 text-sm px-2 py-0.5 rounded truncate max-w-xs">
                {p.title || p.address || 'Unavngiven bolig'}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            Ryd
          </button>
          <button
            onClick={() => navigate('/compare')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            Sammenlign {compareIds.length} boliger
          </button>
        </div>
      </div>
    </div>
  );
}
