// Decorative top-down car on an orange disc with a water ring (About panel).
function ring(seed, count, radius) {
  let s = seed;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => {
    const a = r() * Math.PI * 2;
    const d = radius + (r() - 0.5) * 70;
    return { x: 300 + Math.cos(a) * d, y: 300 + Math.sin(a) * d, s: 1.5 + r() * 5, o: 0.25 + r() * 0.6 };
  });
}

export default function TopViewCar({ className = '' }) {
  const drops = ring(11, 90, 238);
  return (
    <svg className={className} viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="tv-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa0a7" />
          <stop offset="0.18" stopColor="#e9ecef" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="0.82" stopColor="#e3e6e9" />
          <stop offset="1" stopColor="#8d939a" />
        </linearGradient>
        <linearGradient id="tv-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3138" />
          <stop offset="1" stopColor="#07090b" />
        </linearGradient>
        <radialGradient id="tv-drop">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#cfe0e8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="200" fill="#f5922f" />
      <circle cx="300" cy="300" r="238" fill="none" stroke="#cfe0e8" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="3 9" />
      {drops.map((d, i) => (
        <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.s.toFixed(1)} fill="url(#tv-drop)" opacity={d.o.toFixed(2)} />
      ))}
      <g transform="translate(300 300) rotate(-8) translate(-120 -260)">
        <ellipse cx="120" cy="268" rx="118" ry="250" fill="#000" opacity="0.35" transform="translate(10 14)" />
        {/* wheels */}
        {[
          [4, 92],
          [210, 92],
          [4, 362],
          [210, 362],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="26" height="70" rx="8" fill="#111" />
        ))}
        {/* mirrors */}
        <path d="M14 168 L-14 160 L-12 178 L16 184 Z" fill="#c9cdd2" />
        <path d="M226 168 L254 160 L252 178 L224 184 Z" fill="#c9cdd2" />
        <path d="M120 6 C190 6 222 30 226 90 L232 430 C232 492 200 520 120 520 C40 520 8 492 8 430 L14 90 C18 30 50 6 120 6 Z" fill="url(#tv-body)" />
        {/* headlights */}
        <path d="M34 34 C48 20 66 14 82 12 L76 30 C60 32 46 36 34 44 Z M206 34 C192 20 174 14 158 12 L164 30 C180 32 194 36 206 44 Z" fill="#f2f6f8" stroke="#9aa0a7" strokeWidth="1" />
        {/* hood lines */}
        <path d="M70 40 C80 90 80 120 76 150 M170 40 C160 90 160 120 164 150" stroke="#b9bec4" strokeWidth="2" fill="none" />
        {/* windshield */}
        <path d="M30 168 C80 146 160 146 210 168 L200 214 C150 202 90 202 40 214 Z" fill="url(#tv-glass)" />
        {/* roof (panoramic glass) */}
        <path d="M42 222 C94 212 146 212 198 222 L196 380 C146 388 94 388 44 380 Z" fill="url(#tv-glass)" />
        <path d="M60 236 C100 230 140 230 180 236" stroke="#fff" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" />
        {/* rear window */}
        <path d="M46 392 C96 402 144 402 194 392 L204 440 C150 456 90 456 36 440 Z" fill="url(#tv-glass)" />
        {/* tail lights */}
        <path d="M30 486 C44 500 64 508 86 510 L84 498 C66 494 48 488 34 478 Z M210 486 C196 500 176 508 154 510 L156 498 C174 494 192 488 206 478 Z" fill="#d6452f" />
      </g>
    </svg>
  );
}
