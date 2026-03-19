import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, GitCompare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import CategoryBadge from '../components/CategoryBadge';
import StarRating from '../components/StarRating';

function formatPrice(price) {
  if (!price) return '–';
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(price);
}

// Returns Tailwind class for the "winner" highlight
function winnerClass(isWinner) {
  return isWinner ? 'bg-green-50 font-semibold text-green-800' : '';
}

function pickWinner(values, lowerIsBetter = false) {
  const nums = values.map(v => v === null || v === undefined ? null : Number(v));
  const valid = nums.filter(v => v !== null && !isNaN(v));
  if (valid.length === 0) return values.map(() => false);

  const best = lowerIsBetter ? Math.min(...valid) : Math.max(...valid);
  return nums.map(v => v === best && v !== null && !isNaN(v));
}

function Row({ label, values, lowerIsBetter = false, renderCell }) {
  const winners = pickWinner(values, lowerIsBetter);
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 px-4 text-sm text-gray-500 font-medium whitespace-nowrap bg-gray-50 w-36">{label}</td>
      {values.map((val, i) => (
        <td key={i} className={`py-3 px-4 text-sm text-center ${winnerClass(winners[i])}`}>
          {renderCell ? renderCell(val) : (val ?? '–')}
        </td>
      ))}
    </tr>
  );
}

export default function ComparePage() {
  const { properties, compareIds, clearCompare, toggleCompare } = useApp();
  const navigate = useNavigate();

  const selected = compareIds
    .map(id => properties.find(p => p.id === id))
    .filter(Boolean);

  const [expandNotes, setExpandNotes] = useState({});

  if (selected.length === 0) {
    return (
      <div className="text-center py-20">
        <GitCompare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Ingen boliger valgt til sammenligning</h2>
        <p className="text-gray-500 mb-6">Gå til boliglisten og sæt flueben på 2–3 boliger.</p>
        <Link to="/" className="btn-primary">Se boliger</Link>
      </div>
    );
  }

  if (selected.length < 2) {
    return (
      <div className="text-center py-20">
        <GitCompare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Vælg mindst 2 boliger</h2>
        <p className="text-gray-500 mb-6">Du har valgt {selected.length} bolig. Vælg én mere for at sammenligne.</p>
        <Link to="/" className="btn-primary">Tilbage til liste</Link>
      </div>
    );
  }

  function handleClear() {
    clearCompare();
    navigate('/');
  }

  return (
    <div className="pb-6">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/" className="btn-secondary py-1.5 px-3">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-indigo-600" />
          Sammenligning
        </h1>
        <button onClick={handleClear} className="ml-auto btn-secondary text-sm">
          <X className="w-4 h-4" />
          Ryd alt
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-300 w-36">Egenskab</th>
              {selected.map(p => (
                <th key={p.id} className="py-3 px-4 text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <span className="truncate max-w-[160px]">{p.title || p.address || 'Unavngiven'}</span>
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="text-slate-400 hover:text-white flex-shrink-0 transition-colors"
                      title="Fjern fra sammenligning"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Match Score */}
            <tr className="border-b border-gray-100 bg-indigo-50">
              <td className="py-3 px-4 text-sm font-semibold text-indigo-700 bg-indigo-100">Match Score</td>
              {selected.map(p => (
                <td key={p.id} className="py-3 px-4 text-center">
                  <div className="flex justify-center">
                    <MatchScoreBadge score={p.match_score} size="sm" showLabel />
                  </div>
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm text-gray-500 font-medium bg-gray-50">Kategori</td>
              {selected.map(p => (
                <td key={p.id} className="py-3 px-4 text-center">
                  <CategoryBadge category={p.category} />
                </td>
              ))}
            </tr>

            <Row
              label="Pris"
              values={selected.map(p => p.price)}
              lowerIsBetter
              renderCell={v => formatPrice(v)}
            />
            <Row
              label="Køretid"
              values={selected.map(p => p.drive_time_minutes)}
              lowerIsBetter
              renderCell={v => v != null ? `${v} min` : '–'}
            />
            <Row
              label="Støjniveau"
              values={selected.map(p => p.noise_score)}
              renderCell={v => <div className="flex justify-center"><StarRating value={v} /></div>}
            />
            <Row
              label="Landlig"
              values={selected.map(p => p.rural_score)}
              renderCell={v => <div className="flex justify-center"><StarRating value={v} /></div>}
            />
            <Row
              label="Varmekilde"
              values={selected.map(p => p.heating_source)}
              renderCell={v => (
                <span className={!v ? 'text-gray-400' :
                  [5].includes(selected.find(p => p.heating_source === v)?.heating_score) ? 'text-green-700 font-medium' :
                  [1, 2].includes(selected.find(p => p.heating_source === v)?.heating_score) ? 'text-red-600' : ''
                }>
                  {v || '–'}
                </span>
              )}
            />
            <Row
              label="Flexbolig"
              values={selected.map(p =>
                p.is_flexbolig ? 'Ja' : p.flexbolig_possible ? 'Mulig' : 'Nej'
              )}
            />
            <Row
              label="Boligareal"
              values={selected.map(p => p.living_area_m2)}
              renderCell={v => v ? `${v} m²` : '–'}
            />
            <Row
              label="Grundstørrelse"
              values={selected.map(p => p.plot_area_m2)}
              renderCell={v => v ? `${v.toLocaleString('da-DK')} m²` : '–'}
            />
            <Row
              label="Stand"
              values={selected.map(p => p.condition)}
              renderCell={v => v || '–'}
            />
            <Row
              label="Byggeår"
              values={selected.map(p => p.build_year)}
              renderCell={v => v || '–'}
            />

            {/* Notes */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm text-gray-500 font-medium bg-gray-50 align-top">Noter</td>
              {selected.map(p => (
                <td key={p.id} className="py-3 px-4 text-sm text-gray-700 align-top">
                  {p.notes ? (
                    <>
                      {expandNotes[p.id] || p.notes.length <= 150
                        ? p.notes
                        : p.notes.slice(0, 150) + '…'
                      }
                      {p.notes.length > 150 && (
                        <button
                          onClick={() => setExpandNotes(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                          className="ml-1 text-indigo-500 text-xs hover:underline"
                        >
                          {expandNotes[p.id] ? 'Vis mindre' : 'Vis mere'}
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-300 italic">Ingen noter</span>
                  )}
                </td>
              ))}
            </tr>

            {/* View details */}
            <tr>
              <td className="py-3 px-4 bg-gray-50" />
              {selected.map(p => (
                <td key={p.id} className="py-3 px-4 text-center">
                  <Link to={`/property/${p.id}`} className="btn-secondary text-xs py-1.5">
                    Se detaljer
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
