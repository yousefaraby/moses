import QRCode from 'qrcode';
import { headers } from 'next/headers';
import Link from 'next/link';
import BookingLive from '@/components/book/BookingLive';
import { PageHead } from '@/components/ui/bits';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { bookingView } from '@/lib/bookings';
import { getDict, href } from '@/lib/i18n';
import { zonedNow } from '@/lib/time';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).booking.code, robots: { index: false } };
}

export default async function BookingPage({ params, searchParams }) {
  const { lang, id } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const db = await getDb();
  const booking = db.bookings.find((b) => b.id === id);
  const allowed = booking && (sp.t === booking.token || (await isAdmin()));

  if (!allowed) {
    return (
      <PageHead title={t.booking.notFound}>
        <div className="row">
          <Link className="btn btn-primary" href={href(lang, '/book')}>
            {t.common.bookNow}
          </Link>
        </div>
      </PageHead>
    );
  }

  const h = await headers();
  const origin = `${h.get('x-forwarded-proto') || 'http'}://${h.get('host')}`;
  const manageUrl = `${origin}/${lang}/booking/${booking.id}?t=${booking.token}`;
  const qr = await QRCode.toString(`${manageUrl}&checkin=1`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } });
  const pkg = db.packages.find((p) => p.id === booking.packageId);
  const size = db.vehicleSizes.find((v) => v.id === booking.sizeId);
  const addons = booking.addonIds.map((aid) => db.addons.find((a) => a.id === aid)).filter(Boolean);

  return (
    <BookingLive
      lang={lang}
      t={t}
      token={booking.token}
      initial={bookingView(db, booking)}
      qr={qr}
      isNew={sp.new === '1'}
      today={zonedNow(db.settings.timezone).date}
      settings={{ payment: db.settings.payment || null, currency: db.settings.currency, reminders: db.settings.reminders, cancelHours: db.settings.booking.cancelHours, maxDaysAhead: db.settings.booking.maxDaysAhead, loyalty: db.settings.loyalty, quietPct: db.settings.booking.quiet.percent }}
      names={{ package: pkg?.name, size: size?.name, addons: addons.map((a) => a.name) }}
      hours={db.branches.find((b) => b.id === booking.branchId)?.hours || {}}
      staffName={db.staff.find((s) => s.id === booking.staffId)?.name || ''}
    />
  );
}
