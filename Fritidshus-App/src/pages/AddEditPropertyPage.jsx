import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPropertyById } from '../lib/storage';
import { HEATING_SOURCES, CONDITIONS, getHeatingScore } from '../lib/matchScore';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { calcMatchScore } from '../lib/matchScore';

const EMPTY = {
  title: '', address: '', source_url: '', price: '',
  living_area_m2: '', plot_area_m2: '', rooms: '', build_year: '',
  heating_source: '', condition: '',
  is_flexbolig: false, flexbolig_possible: false,
  noise_score: 3, rural_score: 3,
  notes: '', status: 'active',
};

function ScoreSelector({ label, hint, value, onChange }) {
  const descriptions = {
    noise_score: ['Stærk motorvej/tung trafik', 'Vedvarende vejtrafik', 'Mærkbar støj til tider', 'Lejlighedsvis fjern trafik', 'Helt stille, ingen vej i nærheden'],
    rural_score: ['Bymæssig / forstads-bebyggelse', 'Tæt bebyggelse', 'Lille by / løs bebyggelse', 'Få spredte naboer', 'Isoleret, ingen naboer synlige'],
  };
  const descList = descriptions[hint] ?? [];
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2 mt-1">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`w-9 h-9 rounded-full border-2 text-sm font-bold transition-all ${
              value === v
                ? 'bg-indigo-600 border-indigo-600 text-white scale-110'
                : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      {value > 0 && descList[value - 1] && (
        <p className="text-xs text-gray-500 mt-1 italic">{descList[value - 1]}</p>
      )}
    </div>
  );
}

export default function AddEditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { upsertProperty, settings, showToast } = useApp();

  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [origAddress, setOrigAddress] = useState('');

  const isEdit = Boolean(id);

  useEffect(() => {
    if (id) {
      const p = getPropertyById(id);
      if (p) {
        setForm({ ...EMPTY, ...p });
        setOrigAddress(p.address ?? '');
      }
    }
  }, [id]);

  const upd = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Live match score preview
  const previewProperty = {
    ...form,
    price:         Number(form.price)         || null,
    living_area_m2: Number(form.living_area_m2) || null,
    plot_area_m2:  Number(form.plot_area_m2)  || null,
  };
  const preview = calcMatchScore(previewProperty, settings);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const addressChanged = form.address !== origAddress;
      await upsertProperty({
        ...form,
        price:         Number(form.price)         || null,
        living_area_m2: Number(form.living_area_m2) || null,
        plot_area_m2:  Number(form.plot_area_m2)  || null,
        rooms:         Number(form.rooms)         || null,
        build_year:    Number(form.build_year)    || null,
        id: isEdit ? id : undefined,
        _addressChanged: addressChanged,
      });
      showToast(isEdit ? 'Bolig opdateret.' : 'Bolig tilføjet.', 'success');
      navigate('/');
    } catch (err) {
      showToast('Noget gik galt: ' + err.message, 'error');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="btn-secondary py-1.5 px-3">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">{isEdit ? 'Redigér bolig' : 'Tilføj bolig'}</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">Preview score</span>
          <MatchScoreBadge score={preview.total} size="sm" showLabel />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section: Basis */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Basis</h2>

          <div>
            <label className="label">Titel / navn</label>
            <input
              className="input"
              placeholder="F.eks. Sommerhus ved Juelsminde"
              value={form.title}
              onChange={e => upd('title', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Link til annonce (valgfrit)</label>
            <input
              className="input"
              type="url"
              placeholder="https://www.boligsiden.dk/…"
              value={form.source_url}
              onChange={e => upd('source_url', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Pris (kr.)</label>
            <input
              className="input"
              type="number"
              min={0}
              step={50000}
              placeholder="2500000"
              value={form.price}
              onChange={e => upd('price', e.target.value)}
            />
          </div>
        </div>

        {/* Section: Lokation */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Lokation</h2>
          <div>
            <label className="label">Adresse</label>
            <input
              className="input"
              placeholder="Strandvejen 12, 7130 Juelsminde"
              value={form.address}
              onChange={e => upd('address', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Bruges til beregning af køretid fra din hjemmeadresse (kræver Google Maps API-nøgle i indstillinger).
            </p>
          </div>
        </div>

        {/* Section: Boligen */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Boligen</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Boligareal (m²)</label>
              <input className="input" type="number" min={0} value={form.living_area_m2} onChange={e => upd('living_area_m2', e.target.value)} placeholder="90" />
            </div>
            <div>
              <label className="label">Grundstørrelse (m²)</label>
              <input className="input" type="number" min={0} step={100} value={form.plot_area_m2} onChange={e => upd('plot_area_m2', e.target.value)} placeholder="3000" />
            </div>
            <div>
              <label className="label">Antal værelser</label>
              <input className="input" type="number" min={1} max={20} value={form.rooms} onChange={e => upd('rooms', e.target.value)} placeholder="4" />
            </div>
            <div>
              <label className="label">Byggeår</label>
              <input className="input" type="number" min={1800} max={2025} value={form.build_year} onChange={e => upd('build_year', e.target.value)} placeholder="1975" />
            </div>
          </div>
        </div>

        {/* Section: Stand og varmekilde */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Stand og varmekilde</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Varmekilde</label>
              <select className="input" value={form.heating_source} onChange={e => upd('heating_source', e.target.value)}>
                <option value="">Vælg…</option>
                {HEATING_SOURCES.map(hs => (
                  <option key={hs} value={hs}>{hs} ({getHeatingScore(hs)}/5)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Stand</label>
              <select className="input" value={form.condition} onChange={e => upd('condition', e.target.value)}>
                <option value="">Vælg…</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_flexbolig} onChange={e => upd('is_flexbolig', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              <span className="text-sm text-gray-700">Er allerede flexbolig</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.flexbolig_possible} onChange={e => upd('flexbolig_possible', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              <span className="text-sm text-gray-700">Flexbolig mulig (zoning)</span>
            </label>
          </div>
        </div>

        {/* Section: Min vurdering */}
        <div className="card p-5 space-y-5">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Min vurdering</h2>

          <ScoreSelector
            label="Støjniveau"
            hint="noise_score"
            value={form.noise_score}
            onChange={v => upd('noise_score', v)}
          />
          <ScoreSelector
            label="Landlig beliggenhed"
            hint="rural_score"
            value={form.rural_score}
            onChange={v => upd('rural_score', v)}
          />
        </div>

        {/* Notes */}
        <div className="card p-5">
          <label className="label">Noter</label>
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Hvad kan du lide ved dette hus? Hvad bekymrer dig?"
            value={form.notes}
            onChange={e => upd('notes', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-4">
          <Link to="/" className="btn-secondary">Annullér</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Gem ændringer' : 'Tilføj bolig'}
          </button>
        </div>
      </form>
    </div>
  );
}
