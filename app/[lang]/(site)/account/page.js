import AccountApp from '@/components/AccountApp';
import { PageHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { getDict } from '@/lib/i18n';
import { zonedNow } from '@/lib/time';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).account.title, robots: { index: false } };
}

export default async function AccountPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const c = await getContent();
  return (
    <>
      <PageHead title={t.account.title} />
      <section className="section">
        <div className="container">
          <AccountApp
            lang={lang}
            t={t}
            next={typeof sp.next === 'string' ? sp.next : ''}
            sizes={c.vehicleSizes}
            packages={c.packages}
            plans={c.plans}
            settings={{ currency: c.settings.currency, loyalty: c.settings.loyalty }}
            today={zonedNow(c.settings.timezone).date}
          />
        </div>
      </section>
    </>
  );
}
