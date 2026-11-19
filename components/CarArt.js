// Placeholder vehicle illustrations (side profile). Swap for real photos
// later — see README "Images to replace". `state="dirty"` adds grime.

const BODIES = {
  suv: {
    body:
      'M112 272 C100 262 98 236 100 214 C102 196 108 176 120 160 C136 140 168 118 214 110 C300 98 440 96 520 102 C560 106 586 120 612 140 C640 160 662 170 700 176 C760 184 820 192 858 204 C880 212 890 228 888 248 C887 262 882 272 870 278 L806 282 A76 76 0 0 0 654 282 L326 282 A76 76 0 0 0 174 282 Z',
    glass: 'M150 166 C162 148 184 130 214 124 C296 112 430 110 506 114 C540 118 566 134 592 162 Z',
    pillars: ['M318 116 L330 166', 'M470 113 L486 164'],
    wheels: [250, 730],
    wheelY: 282,
    head: 'M842 206 C860 210 874 216 882 226 L860 226 C852 220 846 214 842 206 Z',
    tail: 'M104 196 L118 194 L120 230 L104 232 Z',
    belt: 'M132 176 C300 172 520 170 640 172',
    crease: 'M140 222 C320 216 560 214 860 222',
  },
  sedan: {
    body:
      'M108 268 C98 256 98 238 102 224 C108 208 124 200 150 194 C190 186 222 170 252 150 C290 126 340 116 420 114 C490 112 540 118 580 136 C610 150 640 170 680 182 C750 194 820 202 856 214 C878 222 888 238 886 254 C884 266 878 274 866 278 L800 282 A72 72 0 0 0 656 282 L320 282 A72 72 0 0 0 176 282 Z',
    glass: 'M222 184 C248 160 280 138 322 128 C380 118 470 118 528 126 C560 132 590 152 620 182 Z',
    pillars: ['M410 122 L414 184', 'M534 128 L560 184'],
    wheels: [248, 728],
    wheelY: 282,
    head: 'M846 214 C864 218 876 226 882 236 L860 236 C854 228 850 222 846 214 Z',
    tail: 'M104 214 L120 210 L122 236 L104 238 Z',
    belt: 'M180 194 C360 190 560 188 680 190',
    crease: 'M130 232 C320 226 560 226 864 234',
  },
  van: {
    body:
      'M104 276 C96 262 96 120 104 96 C110 82 126 76 150 76 L600 76 C640 76 664 92 690 120 L760 196 C800 202 846 210 866 222 C884 232 890 246 888 262 C886 272 880 278 870 280 L806 282 A76 76 0 0 0 654 282 L326 282 A76 76 0 0 0 174 282 Z',
    glass: 'M590 96 C622 96 640 108 660 132 L716 196 L590 196 Z',
    pillars: ['M584 90 L584 200'],
    wheels: [250, 730],
    wheelY: 282,
    head: 'M846 214 C864 218 876 226 882 236 L860 236 C854 228 850 222 846 214 Z',
    tail: 'M100 120 L114 118 L114 170 L100 172 Z',
    belt: 'M110 204 C320 202 560 202 760 202',
    crease: 'M120 236 C320 232 560 232 864 238',
  },
};

const TONES = {
  graphite: { paint: '#24272b', light: '#6a7078', rim: '#C07A31' },
  pearl: { paint: '#d9dcdf', light: '#f4f6f7', rim: '#C07A31' },
  copper: { paint: '#5a3415', light: '#a0612a', rim: '#E8AE6E' },
};

function Wheel({ cx, cy, rim }) {
  const spokes = Array.from({ length: 5 }, (_, i) => (i * 72 * Math.PI) / 180);
  return (
    <g>
      <circle cx={cx} cy={cy} r="62" fill="#0a0a0a" />
      <circle cx={cx} cy={cy} r="58" fill="none" stroke="#2b2b2b" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="42" fill="#1b1b1b" stroke="#6e6e6e" strokeWidth="2" />
      {spokes.map((a) => (
        <path
          key={a}
          d={`M${cx + Math.cos(a) * 10} ${cy + Math.sin(a) * 10} L${cx + Math.cos(a - 0.18) * 40} ${cy + Math.sin(a - 0.18) * 40} L${cx + Math.cos(a + 0.18) * 40} ${cy + Math.sin(a + 0.18) * 40} Z`}
          fill="#8d8d8d"
        />
      ))}
      <circle cx={cx} cy={cy} r="10" fill="#2a2a2a" stroke="#9a9a9a" strokeWidth="2" />
      <path d={`M${cx - 30} ${cy - 22} A38 38 0 0 1 ${cx - 6} ${cy - 37}`} stroke={rim} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Bike({ state, tone }) {
  const t = TONES[tone] || TONES.graphite;
  return (
    <g>
      <ellipse cx="480" cy="352" rx="360" ry="10" fill="#000" opacity="0.55" />
      {[250, 690].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="270" r="74" fill="none" stroke="#0a0a0a" strokeWidth="22" />
          <circle cx={cx} cy="270" r="50" fill="none" stroke="#6e6e6e" strokeWidth="3" />
          <circle cx={cx} cy="270" r="12" fill="#8d8d8d" />
        </g>
      ))}
      <path d="M250 270 L380 270 L470 180 L600 180 L690 270" stroke="#8d8d8d" strokeWidth="10" fill="none" strokeLinejoin="round" />
      <path d="M330 180 C360 140 450 132 520 140 L600 150 C620 160 626 176 610 186 L420 196 Z" fill={t.paint} />
      <path d="M560 120 L640 100 L700 110" stroke="#cfcfcf" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M600 150 L690 270" stroke="#8d8d8d" strokeWidth="9" />
      <path d="M380 210 C420 230 480 230 520 214 L500 250 L400 250 Z" fill="#202020" />
      <path d="M690 112 C716 118 728 132 726 146" stroke={t.rim} strokeWidth="6" fill="none" strokeLinecap="round" />
      {state === 'dirty' && [250, 690].map((cx) => <circle key={cx} cx={cx} cy="270" r="80" fill="#5b4630" opacity="0.5" />)}
    </g>
  );
}

export default function CarArt({ variant = 'suv', state = 'clean', tone = 'graphite', className = '', title, uid = 'car' }) {
  const t = TONES[tone] || TONES.graphite;
  const b = BODIES[variant] || BODIES.suv;
  const dirty = state === 'dirty';
  const id = `${uid}-${variant}-${state}`;
  return (
    <svg className={className} viewBox="0 0 960 380" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.light} />
          <stop offset="0.45" stopColor={t.paint} />
          <stop offset="1" stopColor="#050505" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3c4650" />
          <stop offset="0.55" stopColor="#0d1114" />
          <stop offset="1" stopColor="#1e252b" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-speck-f`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.33  0 0 0 0 0.22  9 0 0 0 -5.6" />
        </filter>
        <filter id={`${id}-blot-f`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.06" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.27  0 0 0 0 0.17  5 0 0 0 -2.6" />
        </filter>
        <linearGradient id={`${id}-dust`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a7a62" stopOpacity="0.18" />
          <stop offset="0.55" stopColor="#7a6447" stopOpacity="0.32" />
          <stop offset="1" stopColor="#5b4630" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-mudfade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-mudmask`}>
          <rect width="960" height="380" fill={`url(#${id}-mudfade)`} />
        </mask>
        <clipPath id={`${id}-clip`}>
          <path d={b.body} />
        </clipPath>
      </defs>

      {variant === 'bike' ? (
        <Bike state={state} tone={tone} />
      ) : (
        <g>
          <ellipse cx="490" cy="352" rx="420" ry="14" fill="#000" opacity="0.6" />
          <path d={b.body} fill={`url(#${id}-paint)`} />
          <path d={b.glass} fill={`url(#${id}-glass)`} opacity={dirty ? 0.75 : 1} />
          {b.pillars.map((d) => (
            <path key={d} d={d} stroke={t.paint} strokeWidth="12" strokeLinecap="round" />
          ))}
          <path d={b.belt} stroke={t.rim} strokeWidth="2.5" fill="none" opacity={dirty ? 0.25 : 0.9} />
          <path d={b.crease} stroke="#ffffff" strokeOpacity={dirty ? 0.04 : 0.14} strokeWidth="2" fill="none" />
          <path d={b.head} fill={dirty ? '#7d7563' : '#f3efe6'} />
          <path d={b.tail} fill={t.rim} opacity={dirty ? 0.4 : 1} />
          {!dirty && (
            <g clipPath={`url(#${id}-clip)`}>
              <rect className="car-shine" x="-260" y="60" width="220" height="260" fill={`url(#${id}-shine)`} transform="skewX(-24)" />
            </g>
          )}
          {dirty && (
            <g clipPath={`url(#${id}-clip)`}>
              <rect width="960" height="380" fill={`url(#${id}-dust)`} />
              <rect width="960" height="380" filter={`url(#${id}-blot-f)`} mask={`url(#${id}-mudmask)`} />
              <rect width="960" height="380" filter={`url(#${id}-speck-f)`} opacity="0.8" />
            </g>
          )}
          {b.wheels.map((cx) => (
            <Wheel key={cx} cx={cx} cy={b.wheelY} rim={dirty ? '#5d4a35' : t.rim} />
          ))}
          {dirty &&
            b.wheels.map((cx) => <circle key={`m${cx}`} cx={cx} cy={b.wheelY} r="58" fill="#5b4630" opacity="0.45" />)}
        </g>
      )}
    </svg>
  );
}
