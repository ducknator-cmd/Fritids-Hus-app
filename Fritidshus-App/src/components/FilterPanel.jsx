import { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HEATING_SOURCES, CONDITIONS } from '../lib/matchScore';

const FLEX_OPTIONS = [
  { value: 'all',      label: 'Alle' },
  { value: 'yes',      label: 'Kun flexbolig' },
  { value: 'possible', label: 'Flexbolig mulig' },
];

const CATEGORY_OPTIONS = [
  { value: 'top_pick', label: '⭐ Top pick' },
  { value: 'maybe',    label: '🤔 Måske' },
  { value: 'no_go',    label: '✗ Fravælg' },
  { value: 'unsorted', label: '— Usorteret' },
];

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

function countActiveFilters(f, settings) {
  let n = 0;
  if (f.maxDriveMinutes !== null && f.maxDriveMinutes !== undefined) n++;
  if (f.maxPrice !== null && f.maxPrice !== undefined) n++;
  if (f.minPlotArea) n++;
  if (f.heatingSources.length) n++;
  if (f.flexbolig !== 'all') n++;
  if (f.conditions.length) n++;
  if (f.categories.length) n++;
  if (f.showArchived) n++;
  return n;
}

export default function FilterPanel() {
  const { filters, setFilters, resetFilters, settings } = useApp();
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters, settings);

  const upd = (key, val) => setFilters({ ...filters, [key]: val });

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-secondary gap-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtre
        {activeCount > 0 && (
          <span className="bg-indigo-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-bold">
            {activeCount}
          </span>
        )}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="mt-3 card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

          {/* Max drive time */}
          <div>
            <label className="label">
              Maks. køretid
              {filters.maxDriveMinutes ? ` — ${filters.maxDriveMinutes} min` : ' — Alle'}
            </label>
            <input
              type="range" min={10} max={120} step={5}
              value={filters.maxDriveMinutes ?? 120}
              onChange={e => upd('maxDriveMinutes', Number(e.target.value) === 120 ? null : Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>10 min</span><span>Alle</span>
            </div>
          </div>

          {/* Max price */}
          <div>
            <label className="label">
              Maks. pris
              {filters.maxPrice ? ` — ${(filters.maxPrice / 1_000_000).toFixed(1)}M kr.` : ' — Alle'}
            </label>
            <input
              type="range" min={500_000} max={10_000_000} step={250_000}
              value={filters.maxPrice ?? 10_000_000}
              onChange={e => upd('maxPrice', Number(e.target.value) === 10_000_000 ? null : Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>500K</span><span>Alle</span>
            </div>
          </div>

          {/* Min plot area */}
          <div>
            <label className="label">Min. grundstørrelse (m²)</label>
            <input
              type="number" min={0} step={100}
              value={filters.minPlotArea ?? ''}
              onChange={e => upd('minPlotArea', e.target.value ? Number(e.target.value) : null)}
              placeholder="Ingen grænse"
              className="input"
            />
          </div>

          {/* Heating sources */}
          <div>
            <label className="label">Varmekilde</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {HEATING_SOURCES.map(hs => (
                <button
                  key={hs}
                  onClick={() => upd('heatingSources', toggle(filters.heatingSources, hs))}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    filters.heatingSources.includes(hs)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {hs}
                </button>
              ))}
            </div>
            {filters.heatingSources.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">Viser kun valgte varmekilder</p>
            )}
          </div>

          {/* Flexbolig */}
          <div>
            <label className="label">Flexbolig</label>
            <div className="flex gap-2 mt-1">
              {FLEX_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => upd('flexbolig', o.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    filters.flexbolig === o.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="label">Stand</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {CONDITIONS.map(c => (
                <button
                  key={c}
                  onClick={() => upd('conditions', toggle(filters.conditions, c))}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    filters.conditions.includes(c)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">Kategori</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {CATEGORY_OPTIONS.map(c => (
                <button
                  key={c.value}
                  onClick={() => upd('categories', toggle(filters.categories, c.value))}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    filters.categories.includes(c.value)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Show archived */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showArchived"
              checked={filters.showArchived}
              onChange={e => upd('showArchived', e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            <label htmlFor="showArchived" className="text-sm text-gray-700 cursor-pointer">
              Vis arkiverede boliger
            </label>
          </div>

          {/* Reset */}
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2 border-t border-gray-100">
            <button onClick={resetFilters} className="btn-secondary text-sm">
              <RotateCcw className="w-3.5 h-3.5" />
              Nulstil filtre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
