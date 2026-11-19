import Link from 'next/link';
import { FaqList, PageHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { getDict, href } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).faq.title };
}

export default async function FaqPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = await getContent();
  const cats = [...new Set(c.faqs.map((f) => f.category))];
  return (
    <>
      <PageHead title={t.faq.title}>
        <div className="row">
          <Link href={href(lang, '/contact')} className="btn btn-ghost">
            {t.nav.contact}
          </Link>
        </div>
      </PageHead>
      <section className="section">
        <div className="container stack-xl">
          {cats.map((cat) => (
            <div key={cat} className="faq-split">
              <h2 className="h2">{t.faq.categories[cat] || cat}</h2>
              <FaqList faqs={c.faqs.filter((f) => f.category === cat)} lang={lang} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
