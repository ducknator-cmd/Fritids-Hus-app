import { useState, useEffect } from 'react';
import { Save, RotateCcw, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_SETTINGS } from '../lib/storage';
import { hasTravelTimeApiKey } from '../lib/travelTime';

function fmt(v) {
  return Math.round(v * 100);
}

// Adjust other weights proportionally when one changes,
// keeping the total = 1.
function adjustWeights(weights, changedKey, newPercent) {
  const newVal = newPercent / 100;
  const others = Object.keys(weights).filter(k => k !== changedKey);
  const remaining = 1 - newVal;
  const oldOtherTotal = others.reduce((s, k) => s + weights[k], 0);

  let newWeights = { ...weights, [changedKey]: newVal };
  if (oldOtherTotal > 0) {
    others.forEach(k => {
      newWeights[k] = (weights[k] / oldOtherTotal) * remaining;
    });
  } else {
    const share = remaining / others.length;
    others.forEach(k => { newWeights[k] = share; });
  }
  return newWeights;
}

const WEIGHT_LABELS = {
  weight_quiet:     { label: 'Ro / ingen støj',       color: 'accent-green-600' },
  weight_distance:  { label: 'Afstand (køretid)',     color: 'accent-indigo-600' },
  weight_condition: { label: 'Stand / varmekilde',     color: 'accent-amber-600' },
  weight_price:     { label: 'Pris vs. budget',        color: 'accent-red-500' },
};

export default function SettingsPage() {
  const { settings, updateSettings, showToast } = useApp();
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS });
  const hasApiKey = hasTravelTimeApiKey();

  useEffect(() => {
    setForm({ ...DEFAULT_SETTINGS, ...settings });
  }, [settings]);

  const weights = {
    weight_quiet:     form.weight_quiet     ?? 0.40,
    weight_distance:  form.weight_distance  ?? 0.30,
    weight_condition: form.weight_condition ?? 0.20,
    weight_price:     form.weight_price     ?? 0.10,
  };
  const total = Math.round(Object.values(weights).reduce((s, v) => s + v, 0) * 100);

  function handleWeightChange(key, pct) {
    const adjusted = adjustWeights(weights, key, pct);
    setForm(prev => ({ ...prev, ...adjusted }));
  }

  function handleSave(e) {
    e.preventDefault();
    updateSettings({
      ...form,
      max_budget: form.max_budget ? Number(form.max_budget) : null,
      max_drive_minutes: Number(form.max_drive_minutes),
    });
    showToast('Indstillinger gemt.', 'success');
  }

  function handleReset() {
    setForm({ ...DEFAULT_SETTINGS });
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Indstillinger</h1>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Home + distance */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Lokation</h2>

          <div>
            <label className="label">Din hjemmeadresse</label>
            <input
              className="input"
              placeholder="Vejlevej 1, 7100 Vejle"
              value={form.home_address ?? ''}
              onChange={e => setForm(prev => ({ ...prev, home_address: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">Bruges til beregning af køretid til alle boliger.</p>
          </div>

          <div>
            <label className="label">Standard maks. køretid (minutter)</label>
            <input
              className="input"
              type="number"
              min={5}
              max={240}
              value={form.max_drive_minutes ?? 60}
              onChange={e => setForm(prev => ({ ...prev, max_drive_minutes: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Budget */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Budget</h2>
          <div>
            <label className="label">Maksimalt budget (kr.)</label>
            <input
              className="input"
              type="number"
              min={0}
              step={100000}
              placeholder="3000000"
              value={form.max_budget ?? ''}
              onChange={e => setForm(prev => ({ ...prev, max_budget: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">Bruges til pris-dimensionen i match-scoren. Lad stå tomt for at udelade pris fra scoren.</p>
          </div>
        </div>

        {/* Match score weights */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h2 className="font-semibold text-gray-800">Match-score vægte</h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${total === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Total: {total}%
            </span>
          </div>

          <div className="space-y-5">
            {Object.entries(WEIGHT_LABELS).map(([key, meta]) => {
              const pct = fmt(weights[key]);
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">{meta.label}</label>
                    <span className="text-sm font-bold text-indigo-600">{pct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={pct}
                    onChange={e => handleWeightChange(key, Number(e.target.value))}
                    className={`w-full ${meta.color}`}
                  />
                </div>
              );
            })}
          </div>

          {total !== 100 && (
            <p className="text-xs text-red-600 mt-3">Vægtene summerer ikke til 100%. Juster dem for at gemme.</p>
          )}
        </div>

        {/* API key info */}
        <div className={`card p-5 ${hasApiKey ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${hasApiKey ? 'text-green-600' : 'text-amber-600'}`} />
            <div>
              <h3 className={`font-semibold text-sm mb-1 ${hasApiKey ? 'text-green-800' : 'text-amber-800'}`}>
                Google Maps API-nøgle
              </h3>
              {hasApiKey ? (
                <p className="text-xs text-green-700">
                  API-nøgle fundet. Rejsetider beregnes automatisk når du tilføjer eller redigerer en bolig med en adresse.
                </p>
              ) : (
                <>
                  <p className="text-xs text-amber-700 mb-2">
                    Ingen API-nøgle konfigureret. Rejsetider kan ikke beregnes automatisk.
                  </p>
                  <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                    <li>Opret en nøgle på <span className="font-mono">console.cloud.google.com</span></li>
                    <li>Aktivér "Distance Matrix API" og "Maps JavaScript API"</li>
                    <li>Opret filen <span className="font-mono">.env.local</span> i projektets rodmappe</li>
                    <li>Tilføj linjen: <span className="font-mono">VITE_GOOGLE_MAPS_API_KEY=din-nøgle</span></li>
                    <li>Genstart udviklingsserveren (<span className="font-mono">npm run dev</span>)</li>
                  </ol>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={handleReset} className="btn-secondary">
            <RotateCcw className="w-4 h-4" />
            Nulstil til standard
          </button>
          <button type="submit" disabled={total !== 100} className="btn-primary">
            <Save className="w-4 h-4" />
            Gem indstillinger
          </button>
        </div>
      </form>
    </div>
  );
}
