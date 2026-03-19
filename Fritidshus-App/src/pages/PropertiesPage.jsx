import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import FilterPanel from '../components/FilterPanel';
import CompareBar from '../components/CompareBar';

const SORT_OPTIONS = [
  { value: 'match_score_desc', label: 'Match score ↓' },
  { value: 'drive_time_asc',   label: 'Køretid ↑' },
  { value: 'price_asc',        label: 'Pris ↑' },
  { value: 'price_desc',       label: 'Pris ↓' },
  { value: 'plot_area_desc',   label: 'Grundstørrelse ↓' },
  { value: 'created_at_desc',  label: 'Nyeste først' },
];

function applyFilters(properties, filters) {
  return properties.filter(p => {
    // Status
    if (!filters.showArchived && p.status !== 'active') return false;

    // Drive time
    if (filters.maxDriveMinutes != null && p.drive_time_minutes != null) {
      if (p.drive_time_minutes > filters.maxDriveMinutes) return false;
    }

    // Price
    if (filters.maxPrice != null && p.price != null) {
      if (p.price > filters.maxPrice) return false;
    }

    // Plot area
    if (filters.minPlotArea && p.plot_area_m2 != null) {
      if (p.plot_area_m2 < filters.minPlotArea) return false;
    }

    // Heating
    if (filters.heatingSources.length > 0) {
      if (!filters.heatingSources.includes(p.heating_source)) return false;
    }

    // Flexbolig
    if (filters.flexbolig === 'yes' && !p.is_flexbolig) return false;
    if (filters.flexbolig === 'possible' && !p.is_flexbolig && !p.flexbolig_possible) return false;

    // Condition
    if (filters.conditions.length > 0) {
      if (!filters.conditions.includes(p.condition)) return false;
    }

    // Categories
    if (filters.categories.length > 0) {
      const cat = p.category ?? 'unsorted';
      if (!filters.categories.includes(cat)) return false;
    }

    return true;
  });
}

function applySort(properties, sort) {
  const arr = [...properties];
  switch (sort) {
    case 'match_score_desc': return arr.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    case 'drive_time_asc':   return arr.sort((a, b) => (a.drive_time_minutes ?? 9999) - (b.drive_time_minutes ?? 9999));
    case 'price_asc':        return arr.sort((a, b) => (a.price ?? 9e9) - (b.price ?? 9e9));
    case 'price_desc':       return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case 'plot_area_desc':   return arr.sort((a, b) => (b.plot_area_m2 ?? 0) - (a.plot_area_m2 ?? 0));
    case 'created_at_desc':  return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    default:                 return arr;
  }
}

export default function PropertiesPage() {
  const { properties, filters, sort, setSort, resetFilters } = useApp();

  const filtered = useMemo(() => applyFilters(properties, filters), [properties, filters]);
  const sorted   = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  return (
    <div className="pb-24">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mine boliger</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Viser {sorted.length} af {properties.filter(p => p.status === 'active' || filters.showArchived).length} boliger
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input w-auto text-sm py-1.5"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Link to="/add" className="btn-primary">
            <Plus className="w-4 h-4" />
            Tilføj
          </Link>
        </div>
      </div>

      <FilterPanel />

      {properties.length === 0 ? (
        /* Empty state – no properties yet */
        <div className="card p-12 text-center mt-8">
          <div className="text-5xl mb-4">🏡</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ingen boliger endnu</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Tilføj din første bolig for at komme i gang. Du kan manuelt angive alle relevante detaljer og få beregnet en match-score.
          </p>
          <Link to="/add" className="btn-primary">
            <Plus className="w-4 h-4" />
            Tilføj første bolig
          </Link>
        </div>
      ) : sorted.length === 0 ? (
        /* Empty state – filters hide everything */
        <div className="card p-12 text-center mt-4">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Ingen boliger matcher dine filtre</h2>
          <p className="text-gray-500 mb-5">Prøv at justere køretid eller andre filtre.</p>
          <button onClick={resetFilters} className="btn-secondary">Nulstil filtre</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      <CompareBar />
    </div>
  );
}
