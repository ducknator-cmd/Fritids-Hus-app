// Category badge display + data constants

export const CATEGORIES = {
  top_pick: { label: '⭐ Top pick',   bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200' },
  maybe:    { label: '🤔 Måske',      bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-200' },
  no_go:    { label: '✗ Fravælg',     bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200'   },
  null:     { label: '— Usorteret',   bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200'  },
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const cfg = CATEGORIES[category ?? 'null'] ?? CATEGORIES['null'];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}>
      {cfg.label}
    </span>
  );
}
