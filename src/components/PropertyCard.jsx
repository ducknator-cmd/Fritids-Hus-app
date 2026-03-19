import { Link } from 'react-router-dom';
import { Clock, Ruler, Home, FileText, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import MatchScoreBadge from './MatchScoreBadge';
import CategoryBadge, { CATEGORIES } from './CategoryBadge';
import StarRating from './StarRating';

const CATEGORY_CYCLE = [null, 'top_pick', 'maybe', 'no_go'];

function formatPrice(price) {
  if (!price) return '–';
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(price);
}

export default function PropertyCard({ property }) {
  const { toggleCompare, compareIds, updatePropertyField, removeProperty, showToast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const isComparing = compareIds.includes(property.id);
  const isNoGo = property.category === 'no_go';
  const isArchived = property.status !== 'active';

  function cycleCategory() {
    const idx = CATEGORY_CYCLE.indexOf(property.category ?? null);
    const next = CATEGORY_CYCLE[(idx + 1) % CATEGORY_CYCLE.length];
    updatePropertyField(property.id, 'category', next);
  }

  function handleArchive(status) {
    updatePropertyField(property.id, 'status', status);
    setMenuOpen(false);
    showToast(status === 'archived' ? 'Bolig arkiveret.' : 'Bolig markeret som solgt.', 'info');
  }

  function handleUnarchive() {
    updatePropertyField(property.id, 'status', 'active');
    setMenuOpen(false);
  }

  return (
    <div className={`card relative flex flex-col transition-all hover:shadow-md ${isNoGo ? 'opacity-60' : ''} ${isArchived ? 'ring-2 ring-amber-300' : ''}`}>
      {/* Top row: score + category */}
      <div className="flex items-start justify-between p-4 pb-0">
        <MatchScoreBadge score={property.match_score} size="sm" />
        <div className="flex items-center gap-1">
          <button onClick={cycleCategory} title="Ændre kategori" className="hover:opacity-80 transition-opacity">
            <CategoryBadge category={property.category} />
          </button>
          {/* Context menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-lg shadow-lg text-sm min-w-[160px]">
                  {property.status === 'active' ? (
                    <>
                      <button onClick={() => handleArchive('sold')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Marker som solgt</button>
                      <button onClick={() => handleArchive('archived')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Arkivér</button>
                    </>
                  ) : (
                    <button onClick={handleUnarchive} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Genaktivér</button>
                  )}
                  <hr className="border-gray-100" />
                  <Link to={`/edit/${property.id}`} className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Redigér</Link>
                  <button
                    onClick={() => { removeProperty(property.id); setMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Slet
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main clickable area */}
      <Link to={`/property/${property.id}`} className="flex-1 p-4 pt-2 block">
        <div className="flex items-start gap-1 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {property.title || property.address || 'Unavngiven bolig'}
          </h3>
          {property.notes && (
            <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" title="Har noter" />
          )}
        </div>
        {property.title && property.address && (
          <p className="text-xs text-gray-400 mb-2 truncate">{property.address}</p>
        )}

        {/* Price */}
        <p className="text-base font-bold text-gray-900 mb-3">{formatPrice(property.price)}</p>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {property.drive_time_minutes != null
              ? `${property.drive_time_minutes} min`
              : <span className="text-gray-400 italic">Beregner…</span>
            }
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {property.plot_area_m2 ? `${property.plot_area_m2.toLocaleString('da-DK')} m²` : '– m²'}
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {property.living_area_m2 ? `${property.living_area_m2} m²` : '–'}
            {property.rooms ? ` · ${property.rooms} vær.` : ''}
          </div>
          <div className="text-xs">
            <span className="text-gray-400">Varme:</span>{' '}
            <span className={property.heating_score >= 4 ? 'text-green-600 font-medium' : property.heating_score <= 2 ? 'text-red-500' : ''}>
              {property.heating_source || '–'}
            </span>
          </div>
        </div>

        {/* Scores row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            Ro: <StarRating value={property.noise_score} />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            Landligt: <StarRating value={property.rural_score} />
          </div>
        </div>
      </Link>

      {/* Compare checkbox */}
      <div
        className="px-4 pb-3 flex items-center gap-2 border-t border-gray-100 pt-3"
        onClick={e => e.stopPropagation()}
      >
        <input
          type="checkbox"
          id={`cmp-${property.id}`}
          checked={isComparing}
          onChange={() => toggleCompare(property.id)}
          className="w-4 h-4 accent-indigo-600"
        />
        <label htmlFor={`cmp-${property.id}`} className="text-xs text-gray-500 cursor-pointer select-none">
          {isComparing ? 'Fjern fra sammenligning' : 'Tilføj til sammenligning'}
        </label>
      </div>
    </div>
  );
}
