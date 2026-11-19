import Icon from '@/components/Icon';
import BeforeAfter from '@/components/BeforeAfter';
import MessageForm from '@/components/forms/MessageForm';
import { PageHead, Paragraphs, Reviews, SectionHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { fmt } from '@/lib/dict';
import { getDict, tr } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).about.title };
}

export default async function AboutPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = await getContent();
  const a = c.about;
  const labels = { before: t.home.before, after: t.home.after, compare: t.home.compare };

  return (
    <>
      <PageHead title={t.about.title} intro={tr(c.settings.tagline, lang)} />

      <section className="section" aria-labelledby="story-title">
        <div className="container split">
          <h2 id="story-title" className="h2">
            {tr(a.storyTitle, lang)}
          </h2>
          <div className="prose">
            <Paragraphs text={tr(a.story, lang)} className="lead" />
          </div>
        </div>
      </section>

      <section className="section services-band" aria-labelledby="eco-title">
        <div className="container about-pair">
          <div className="about-panel">
            <Icon name="recycle" size={32} />
            <h2 id="eco-title" className="h2">
              {tr(a.ecoTitle, lang)}
            </h2>
            <p className="lead">{tr(a.eco, lang)}</p>
          </div>
          <div className="about-panel">
            <Icon name="shield" size={32} />
            <h2 className="h2">{tr(a.guaranteeTitle, lang)}</h2>
            <p className="lead">{tr(a.guarantee, lang)}</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="gallery-title">
        <div className="container">
          <SectionHead id="gallery-title" title={t.about.gallery} intro={t.home.compare} />
          <div className="gallery-grid">
            {c.gallery.map((g) => (
              <BeforeAfter key={g.id} variant={g.vehicle} tone={g.tone} labels={labels} uid={`ab-${g.id}`} title={tr(g.title, lang)} />
            ))}
          </div>
        </div>
      </section>

      <section className="section is-flush" aria-labelledby="reviews-title">
        <div className="container">
          <SectionHead id="reviews-title" title={t.about.reviews} intro={c.settings.demoNotice ? t.about.reviewSample : undefined} />
        </div>
        <Reviews reviews={c.reviews} lang={lang} t={t} branches={c.branches} />
      </section>

      <section id="careers" className="section" aria-labelledby="careers-title">
        <div className="container split">
          <div className="stack">
            <h2 id="careers-title" className="h2">
              {tr(a.careersTitle, lang)}
            </h2>
            <p className="lead">{tr(a.careersText, lang)}</p>
          </div>
          <div className="jobs">
            {c.jobs.length === 0 && <p className="muted">{t.about.noJobs}</p>}
            {c.jobs.map((j) => {
              const branch = c.branches.find((b) => b.id === j.branchId);
              return (
                <details key={j.id} className="job">
                  <summary>
                    <span>
                      <strong>{tr(j.title, lang)}</strong>
                      <span className="small muted block">
                        {tr(j.type, lang)}
                        {branch ? ` · ${tr(branch.name, lang)}` : ''}
                      </span>
                    </span>
                    <span className="btn btn-ghost btn-sm" aria-hidden="true">
                      {t.about.apply}
                    </span>
                  </summary>
                  <div className="job-body">
                    <p className="muted">{tr(j.description, lang)}</p>
                    <MessageForm
                      kind="career"
                      idPrefix={`job-${j.id}`}
                      extra={{ role: tr(j.title, 'en') }}
                      submitLabel={fmt(t.about.applyTitle, { role: tr(j.title, lang) })}
                      sendingText={t.common.sending}
                      successText={t.about.applied}
                      errorText={t.common.errorGeneric}
                      fields={[
                        { name: 'name', label: t.contact.name, required: true, autoComplete: 'name' },
                        { name: 'phone', label: t.contact.phone, type: 'tel', required: true, autoComplete: 'tel' },
                        { name: 'link', label: t.about.cv, type: 'url', span: true },
                      ]}
                    />
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
