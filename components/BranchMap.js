import { tr } from '@/lib/i18n';

// Stylised Sheikh Zayed map (placeholder). Replace with an embedded map later;
// each branch already has a Google Maps link for directions.
export default function BranchMap({ branches, lang, label }) {
  return (
    <figure className="map" role="img" aria-label={label}>
      <svg viewBox="0 0 100 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="map-grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M4 0H0V4" fill="none" stroke="#1d1d1d" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="64" fill="#0b0b0b" />
        <rect width="100" height="64" fill="url(#map-grid)" />
        <path d="M-2 30 C30 34 60 44 102 52" stroke="#2e3238" strokeWidth="2.4" fill="none" />
        <path d="M0 44 C20 42 34 40 52 34 C66 30 80 34 100 40" stroke="#2a2a2a" strokeWidth="0.9" fill="none" />
        <path d="M10 64 C22 50 30 40 46 30 C58 22 70 18 100 12" stroke="#2a2a2a" strokeWidth="0.9" fill="none" />
        <path d="M54 0 C58 20 62 40 70 64" stroke="#222" strokeWidth="0.7" fill="none" />
      </svg>
      {branches.map((b) => (
        <span key={b.id} className="map-pin" style={{ left: `${b.map.x}%`, top: `${b.map.y}%` }}>
          <span className="map-dot" />
          <span className="map-label">{tr(b.name, lang)}</span>
        </span>
      ))}
    </figure>
  );
}
