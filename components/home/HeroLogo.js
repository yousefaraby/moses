// Hero logo with a working polisher: the machine sweeps back and forth over
// the lettering, its pad spins, dry-ice mist flies off the pad and a shine
// follows across "MD". Pure CSS animation (see `.hero-logo` in site.css),
// switched off for prefers-reduced-motion.
//
// The two PNGs are the client's white logo split into layers:
//   hero-logo-base.png      letters, cord and tagline
//   hero-logo-polisher.png  the polisher only (same canvas size, so they align)

const FOAM = Array.from({ length: 10 }, (_, i) => i);
const SPARKS = [
  { x: 24, y: 30, d: 0 },
  { x: 52, y: 52, d: 1.6 },
  { x: 70, y: 41, d: 3.1 },
];

export default function HeroLogo({ label }) {
  return (
    <figure className="hero-logo" role="img" aria-label={label}>
      <div className="hl-stage">
        <img className="hl-base" src="/brand/hero-logo-base.png" alt="" width="611" height="634" />
        <span className="hl-shine" aria-hidden="true" />
        {SPARKS.map((s) => (
          <span key={`${s.x}-${s.y}`} className="hl-spark" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} aria-hidden="true" />
        ))}
        <div className="hl-arm" aria-hidden="true">
          <div className="hl-motor">
            <span className="hl-foam">
              {FOAM.map((i) => (
                <i key={i} style={{ '--i': i }} />
              ))}
            </span>
            <img className="hl-polisher" src="/brand/hero-logo-polisher.png" alt="" width="611" height="634" />
            <span className="hl-pad">
              <span className="hl-spin" />
              <span className="hl-spin hl-spin-inner" />
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
