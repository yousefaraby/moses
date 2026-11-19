import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import MobileBar from '@/components/site/MobileBar';
import DemoBanner from '@/components/site/DemoBanner';
import { getContent } from '@/lib/content';
import { currentCustomer } from '@/lib/auth';
import { formatMoney, getDict, tr } from '@/lib/i18n';

export default async function SiteLayout({ children, params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const content = await getContent();
  const customer = await currentCustomer();
  const { settings, packages } = content;
  const fromPrice = Math.min(...packages.flatMap((p) => Object.values(p.prices)));
  return (
    <>
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      {settings.demoNotice && <DemoBanner text={t.demo.text} dismiss={t.demo.dismiss} />}
      <SiteHeader lang={lang} t={t} brand={tr(settings.brand, lang)} phone={settings.phone} whatsapp={settings.whatsapp} loggedIn={Boolean(customer)} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter lang={lang} t={t} settings={settings} />
      <MobileBar lang={lang} t={t} fromPrice={formatMoney(fromPrice, lang, settings.currency)} />
    </>
  );
}
