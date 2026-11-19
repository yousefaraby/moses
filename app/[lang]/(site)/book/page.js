import BookingWizard from '@/components/book/BookingWizard';
import { getContent } from '@/lib/content';
import { currentCustomer } from '@/lib/auth';
import { getDict } from '@/lib/i18n';
import { zonedNow } from '@/lib/time';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).book.title };
}

const pick = (v) => (typeof v === 'string' ? v.slice(0, 40) : '');

export default async function BookPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const c = await getContent();
  const customer = await currentCustomer();
  const now = zonedNow(c.settings.timezone);
  const initial = {
    branch: c.branches.some((b) => b.id === sp.branch) ? sp.branch : '',
    size: c.vehicleSizes.some((v) => v.id === sp.size) ? sp.size : '',
    package: c.packages.some((p) => p.id === sp.package) ? sp.package : '',
    addon: c.addons.some((a) => a.id === sp.addon) ? sp.addon : '',
    date: /^\d{4}-\d{2}-\d{2}$/.test(pick(sp.date)) ? sp.date : '',
    time: /^\d{2}:\d{2}$/.test(pick(sp.time)) ? sp.time : '',
  };
  return (
    <BookingWizard
      lang={lang}
      t={t}
      today={now.date}
      initial={initial}
      customer={customer ? { name: customer.name, phone: customer.phone.replace(/^\+20/, '0'), email: customer.email, cars: customer.cars } : null}
      content={{ settings: c.settings, branches: c.branches, vehicleSizes: c.vehicleSizes, packages: c.packages, addons: c.addons }}
    />
  );
}
