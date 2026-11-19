import Link from 'next/link';
import CarArt from '@/components/CarArt';

// Shown for unknown pages inside a language. Bilingual because the segment
// language is not available to not-found boundaries.
export default function NotFound() {
  return (
    <section className="section">
      <div className="container stack" style={{ alignItems: 'flex-start', gap: 'var(--s-5)' }}>
        <div style={{ width: 'min(520px, 100%)' }}>
          <CarArt variant="sedan" state="dirty" uid="nf" />
        </div>
        <h1 className="h1">404</h1>
        <p className="lead">This page drove off. · الصفحة دي مشيت.</p>
        <div className="row">
          <Link className="btn btn-primary" href="/ar">
            الرئيسية
          </Link>
          <Link className="btn btn-ghost" href="/en">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
