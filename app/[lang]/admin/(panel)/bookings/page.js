import BookingBoard from '@/components/admin/BookingBoard';
import { adminContext } from '@/lib/adminData';
import { getDict } from '@/lib/i18n';
import { isValidDate } from '@/lib/time';

export default async function BookingsAdmin({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const { db, now } = await adminContext();
  const date = isValidDate(sp.date) ? sp.date : now.date;
  const branchId = db.branches.some((b) => b.id === sp.branch) ? sp.branch : db.branches[0]?.id;
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.bookings}</h1>
      </div>
      <BookingBoard
        lang={lang}
        t={t}
        date={date}
        today={now.date}
        branchId={branchId}
        bookings={db.bookings.filter((b) => b.date === date)}
        branches={db.branches}
        staff={db.staff}
        packages={db.packages}
        sizes={db.vehicleSizes}
        addons={db.addons}
        currency={db.settings.currency}
      />
    </div>
  );
}
