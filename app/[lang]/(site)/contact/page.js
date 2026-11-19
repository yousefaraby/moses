import Link from 'next/link';
import Icon from '@/components/Icon';
import MessageForm from '@/components/forms/MessageForm';
import { FaqList, PageHead, SectionHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { getDict, href, tr } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).contact.title };
}

export default async function ContactPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const k = t.contact;
  const c = await getContent();
  const s = c.settings;
  return (
    <>
      <PageHead title={k.title} intro={k.intro}>
        <div className="contact-quick">
          <a className="btn btn-primary btn-lg" href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={22} />
            {t.common.whatsapp}
          </a>
          <a className="btn btn-ghost btn-lg" href={`tel:${s.phone.replace(/\s/g, '')}`}>
            <Icon name="phone" size={22} />
            <span className="latin">{s.phone}</span>
          </a>
          <a className="btn btn-quiet btn-lg" href={`mailto:${s.email}`}>
            <Icon name="mail" size={22} />
            <span className="latin">{s.email}</span>
          </a>
        </div>
        <p className="small muted">{k.hours}</p>
      </PageHead>

      <section className="section" aria-labelledby="form-title">
        <div className="container split">
          <div className="stack">
            <h2 id="form-title" className="h2">
              {k.formTitle}
            </h2>
            <div className="stack">
              <h3 className="h3">{k.business}</h3>
              <p className="muted">{k.businessText}</p>
            </div>
            <ul className="branch-phones">
              {c.branches.map((b) => (
                <li key={b.id}>
                  <span>{tr(b.name, lang)}</span>
                  <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="link latin">
                    {b.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <MessageForm
            kind="contact"
            topicField="topic"
            idPrefix="contact"
            submitLabel={t.common.send}
            sendingText={t.common.sending}
            successText={k.sent}
            errorText={t.common.errorGeneric}
            fields={[
              { name: 'topic', label: k.topic, type: 'select', span: true, defaultValue: 'contact', options: Object.entries(k.topics) },
              { name: 'name', label: k.name, required: true, autoComplete: 'name' },
              { name: 'phone', label: k.phone, type: 'tel', required: true, autoComplete: 'tel' },
              { name: 'email', label: k.email, type: 'email', autoComplete: 'email', span: true, optionalText: t.common.optional },
              { name: 'text', label: k.message, type: 'textarea', required: true, span: true },
            ]}
          />
        </div>
      </section>

      <section className="section services-band" aria-labelledby="cfaq-title">
        <div className="container faq-split">
          <SectionHead
            id="cfaq-title"
            title={k.faq}
            action={
              <Link href={href(lang, '/faq')} className="link">
                {t.common.seeAll}
              </Link>
            }
          />
          <FaqList faqs={c.faqs.slice(0, 4)} lang={lang} />
        </div>
      </section>
    </>
  );
}
