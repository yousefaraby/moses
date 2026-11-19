import { notFound } from 'next/navigation';
import { PageHead, Paragraphs } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { tr } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const c = await getContent();
  const page = c.legal.find((l) => l.slug === slug);
  return { title: page ? tr(page.title, lang) : undefined };
}

export default async function LegalPage({ params }) {
  const { lang, slug } = await params;
  const c = await getContent();
  const page = c.legal.find((l) => l.slug === slug);
  if (!page) notFound();
  return (
    <>
      <PageHead title={tr(page.title, lang)} />
      <section className="section">
        <div className="container">
          <div className="prose">
            <Paragraphs text={tr(page.body, lang)} />
          </div>
        </div>
      </section>
    </>
  );
}
