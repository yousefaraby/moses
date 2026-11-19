import Icon from '../Icon';
import { fmt } from '@/lib/dict';
import { tr } from '@/lib/i18n';

export function PageHead({ title, intro, children, art }) {
  return (
    <section className="page-head">
      <div className="container">
        <div className="page-head-inner">
          <div className="page-head-text">
            <h1 className="h1">{title}</h1>
            {intro && <p className="lead">{intro}</p>}
            {children}
          </div>
          {art && <div className="page-head-art">{art}</div>}
        </div>
      </div>
    </section>
  );
}

export function SectionHead({ title, intro, id, action }) {
  return (
    <div className="section-head">
      <div className="section-head-text">
        <h2 className="h2" id={id}>
          {title}
        </h2>
        {intro && <p className="lead">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stars({ value, label }) {
  return (
    <span className="stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={16} className={n <= value ? '' : 'off'} />
      ))}
    </span>
  );
}

export function Reviews({ reviews, lang, t, branches }) {
  return (
    <div className="reviews" role="list">
      {reviews.map((r) => {
        const branch = branches.find((b) => b.id === r.branchId);
        return (
          <figure key={r.id} className="review" role="listitem">
            <Stars value={r.rating} label={fmt(t.common.stars, { n: r.rating })} />
            <blockquote lang={r.lang} dir={r.lang === 'ar' ? 'rtl' : 'ltr'}>
              <p>{r.text}</p>
            </blockquote>
            <figcaption className="small muted">
              <span lang={r.lang}>{r.name}</span>
              {branch && <> · {tr(branch.name, lang)}</>}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

export function FaqList({ faqs, lang }) {
  return (
    <div className="faq">
      {faqs.map((f) => (
        <details key={f.id} className="faq-item">
          <summary>
            <span>{tr(f.q, lang)}</span>
            <Icon name="plus" size={20} />
          </summary>
          <p>{tr(f.a, lang)}</p>
        </details>
      ))}
    </div>
  );
}

export function Paragraphs({ text, className = '' }) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((p, i) => (
      <p key={i} className={className}>
        {p}
      </p>
    ));
}
