'use client';

// Top-down car used in the add-ons step: tap a zone to see its extras.
// Zone buttons are real <button>s laid over the drawing; zones with no add-ons get no pin.
const ZONES = [
  { id: 'lights', x: 50, y: 7 },
  { id: 'engine', x: 50, y: 21 },
  { id: 'cabin', x: 50, y: 39 },
  { id: 'seats', x: 50, y: 60 },
  { id: 'body', x: 50, y: 85 },
  { id: 'wheels', x: 12, y: 30 },
];

export default function TopCar({ active, counts, onPick, labels, zones }) {
  const hot = (zone) => (counts[zone] ? 'is-picked' : '') + (active === zone ? ' is-active' : '');
  return (
    <div className="topcar">
      <svg viewBox="0 0 200 400" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="tc-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1a1a1a" />
            <stop offset="0.5" stopColor="#3a3d42" />
            <stop offset="1" stopColor="#1a1a1a" />
          </linearGradient>
        </defs>
        {/* wheels */}
        {[
          [22, 96],
          [158, 96],
          [22, 290],
          [158, 290],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="20" height="54" rx="6" className={`tc-zone tc-wheels ${hot('wheels')}`} />
        ))}
        {/* body */}
        <path d="M100 14 C140 14 162 26 166 60 L170 330 C170 368 150 386 100 386 C50 386 30 368 30 330 L34 60 C38 26 60 14 100 14 Z" fill="url(#tc-body)" className={`tc-zone tc-body ${hot('body')}`} />
        {/* lights */}
        <path d="M48 30 C56 22 70 20 78 20 L74 30 Z M152 30 C144 22 130 20 122 20 L126 30 Z" className={`tc-zone tc-lights ${hot('lights')}`} />
        {/* hood / engine */}
        <path d="M46 40 C70 34 130 34 154 40 L150 112 C120 106 80 106 50 112 Z" className={`tc-zone tc-engine ${hot('engine')}`} />
        {/* windshield + dash (cabin) */}
        <path d="M52 124 C80 116 120 116 148 124 L140 162 C114 156 86 156 60 162 Z" className={`tc-zone tc-cabin ${hot('cabin')}`} />
        {/* seats */}
        <g className={`tc-zone tc-seats ${hot('seats')}`}>
          <rect x="60" y="176" width="34" height="44" rx="8" />
          <rect x="106" y="176" width="34" height="44" rx="8" />
          <rect x="58" y="240" width="84" height="48" rx="10" />
        </g>
        {/* rear window */}
        <path d="M60 310 C86 304 114 304 140 310 L146 340 C116 348 84 348 54 340 Z" fill="#0f1316" />
      </svg>
      {ZONES.filter((z) => !zones || zones.includes(z.id)).map((z) => (
        <button
          key={z.id}
          type="button"
          className={`topcar-pin ${hot(z.id)}`}
          style={{ left: `${z.x}%`, top: `${z.y}%` }}
          aria-pressed={active === z.id}
          onClick={() => onPick(active === z.id ? null : z.id)}
        >
          <span>{labels[z.id]}</span>
          {counts[z.id] ? <span className="topcar-count">{counts[z.id]}</span> : null}
        </button>
      ))}
    </div>
  );
}
