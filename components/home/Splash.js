// Water spray around the hero car (decorative SVG). Deterministic layout so
// server and client render the same markup.
function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function Splash({ seed = 7, className = '' }) {
  const r = rand(seed);
  const drops = [];
  // Two bursts around the wheels and a mist line along the sill.
  [
    [250, 300, 150],
    [730, 300, 150],
    [490, 330, 330],
  ].forEach(([cx, cy, spread], k) => {
    for (let i = 0; i < 26; i += 1) {
      const a = Math.PI + r() * Math.PI; // upper half
      const d = 40 + r() * spread;
      drops.push({
        x: cx + Math.cos(a) * d * (k === 2 ? 1.4 : 1),
        y: cy + Math.sin(a) * d * 0.55 + 20,
        rx: 1.2 + r() * 3.6,
        o: 0.25 + r() * 0.6,
      });
    }
  });
  const arcs = [
    'M150 320 C120 270 100 250 70 246',
    'M178 300 C150 240 140 220 120 200',
    'M810 318 C850 270 880 252 920 250',
    'M790 296 C820 236 836 214 860 196',
    'M330 336 C300 310 270 304 240 306',
    'M650 336 C690 312 720 306 760 310',
  ];
  return (
    <svg className={className} viewBox="0 0 960 380" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`drop-${seed}`}>
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.6" stopColor="#dfe9ee" stopOpacity="0.7" />
          <stop offset="1" stopColor="#dfe9ee" stopOpacity="0" />
        </radialGradient>
      </defs>
      {arcs.map((d) => (
        <path key={d} d={d} fill="none" stroke="#e6eef2" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 7" />
      ))}
      {drops.map((p, i) => (
        <ellipse key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} rx={p.rx.toFixed(1)} ry={(p.rx * 1.3).toFixed(1)} fill={`url(#drop-${seed})`} opacity={p.o.toFixed(2)} />
      ))}
    </svg>
  );
}
