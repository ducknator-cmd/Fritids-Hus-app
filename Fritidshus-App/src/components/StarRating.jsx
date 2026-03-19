export default function StarRating({ value, max = 5, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <span className={`${sizeClass} tracking-tight`} title={`${value ?? '–'} / ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < (value ?? 0) ? 'text-amber-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
    </span>
  );
}
