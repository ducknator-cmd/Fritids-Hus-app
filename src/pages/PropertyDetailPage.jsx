import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Edit2, GitCompare, Archive, CheckCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPropertyById } from '../lib/storage';
import MatchScoreBadge from '../components/MatchScoreBadge';
import MatchScoreBreakdown from '../components/MatchScoreBreakdown';
import CategoryBadge, { CATEGORIES } from '../components/CategoryBadge';
import StarRating from '../components/StarRating';

function formatPrice(price) {
  if (!price) return '–';
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(price);
}

function Row({ label, value, className = '' }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-gray-900 ${className}`}>{value}</span>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, settings, updatePropertyField, removeProperty, toggleCompare, compareIds, showToast } = useApp();

  const property = properties.find(p => p.id === id) ?? getPropertyById(id);

  const [notes, setNotes] = useState(property?.notes ?? '');
  const [saveIndicator, setSaveIndicator] = useState('');
  const debounceRef = useRef(null);
  const isComparing = compareIds.includes(id);

  useEffect(() => {
    if (property) setNotes(property.notes ?? '');
  }, [property?.id]);

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Bolig ikke fundet.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Tilbage til liste</Link>
      </div>
    );
  }

  function handleNotesChange(val) {
    setNotes(val);
    setSaveIndicator('Gemmer…');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePropertyField(id, 'notes', val);
      setSaveIndicator('Gemt ✓');
      setTimeout(() => setSaveIndicator(''), 2000);
    }, 1000);
  }

  function setCategory(cat) {
    updatePropertyField(id, 'category', cat);
  }

  function handleDelete() {
    if (window.confirm('Slet denne bolig permanent?')) {
      removeProperty(id);
      navigate('/');
    }
  }

  function handleStatus(status) {
    updatePropertyField(id, 'status', status);
    showToast(status === 'archived' ? 'Bolig arkiveret.' : status === 'sold' ? 'Bolig markeret som solgt.' : 'Bolig genaktiveret.', 'info');
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6 flex-wrap">
        <Link to="/" className="btn-secondary py-1.5 px-3">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {property.title || property.address || 'Unavngiven bolig'}
          </h1>
          {property.title && property.address && (
            <p className="text-sm text-gray-500 mt-0.5">{property.address}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {property.source_url && (
            <a href={property.source_url} target="_blank" rel="noopener noreferrer" className="btn-secondary py-1.5 px-3">
              <ExternalLink className="w-4 h-4" />
              Annonce
            </a>
          )}
          <button
            onClick={() => toggleCompare(id)}
            className={`btn py-1.5 px-3 ${isComparing ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            <GitCompare className="w-4 h-4" />
            {isComparing ? 'I sammenligning' : 'Sammenlign'}
          </button>
          <Link to={`/edit/${id}`} className="btn-secondary py-1.5 px-3">
            <Edit2 className="w-4 h-4" />
            Redigér
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left: Score + Category */}
        <div className="md:col-span-1 space-y-4">
          <div className="card p-5 flex flex-col items-center gap-3">
            <MatchScoreBadge score={property.match_score} size="lg" showLabel />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Score-fordeling</h3>
            <MatchScoreBreakdown property={property} settings={settings} />
          </div>

          {/* Category */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Kategori</h3>
            <div className="grid grid-cols-2 gap-2">
              {[null, 'top_pick', 'maybe', 'no_go'].map(cat => {
                const cfg = CATEGORIES[cat ?? 'null'];
                const active = (property.category ?? null) === cat;
                return (
                  <button
                    key={String(cat)}
                    onClick={() => setCategory(cat)}
                    className={`text-xs px-2 py-2 rounded-lg border-2 transition-all font-medium ${
                      active ? `${cfg.bg} ${cfg.text} border-current` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status actions */}
          <div className="card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Handlinger</h3>
            {property.status === 'active' ? (
              <>
                <button onClick={() => handleStatus('sold')} className="btn-secondary w-full justify-center text-xs py-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Marker som solgt
                </button>
                <button onClick={() => handleStatus('archived')} className="btn-secondary w-full justify-center text-xs py-1.5">
                  <Archive className="w-3.5 h-3.5" />
                  Arkivér
                </button>
              </>
            ) : (
              <button onClick={() => handleStatus('active')} className="btn-secondary w-full justify-center text-xs py-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Genaktivér
              </button>
            )}
            <button onClick={handleDelete} className="btn-danger w-full justify-center text-xs py-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Slet permanent
            </button>
          </div>
        </div>

        {/* Right: Details + Notes */}
        <div className="md:col-span-2 space-y-4">
          {/* Key details */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Detaljer</h3>
            <div>
              <Row label="Pris" value={formatPrice(property.price)} className="text-lg font-bold" />
              <Row label="Køretid fra hjem" value={property.drive_time_minutes != null ? `${property.drive_time_minutes} min` : '–'} />
              <Row label="Boligareal" value={property.living_area_m2 ? `${property.living_area_m2} m²` : null} />
              <Row label="Grundstørrelse" value={property.plot_area_m2 ? `${property.plot_area_m2.toLocaleString('da-DK')} m²` : null} />
              <Row label="Antal værelser" value={property.rooms} />
              <Row label="Byggeår" value={property.build_year} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Stand og varmekilde</h3>
            <div>
              <Row label="Varmekilde" value={property.heating_source || '–'} />
              <Row label="Varmekildescore" value={property.heating_score ? `${property.heating_score}/5` : null} />
              <Row label="Stand" value={property.condition || '–'} />
              <Row
                label="Flexbolig"
                value={
                  property.is_flexbolig ? 'Ja – godkendt flexbolig'
                  : property.flexbolig_possible ? 'Mulig (zoneopdeling tillader det)'
                  : 'Nej / Ukendt'
                }
              />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Min vurdering</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Støjniveau</span>
                <StarRating value={property.noise_score} size="md" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Landlig beliggenhed</span>
                <StarRating value={property.rural_score} size="md" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Noter</h3>
              {saveIndicator && (
                <span className="text-xs text-gray-400">{saveIndicator}</span>
              )}
            </div>
            <textarea
              className="input resize-none text-sm"
              rows={5}
              placeholder="Hvad kan du lide ved dette hus? Hvad bekymrer dig?"
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
