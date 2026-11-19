import CustomersCRM from '@/components/admin/CustomersCRM';
import { adminContext } from '@/lib/adminData';
import { getDict } from '@/lib/i18n';

export default async function CustomersAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { db } = await adminContext();
  const stats = {};
  for (const c of db.customers) {
    const own = db.bookings.filter((b) => b.customerId === c.id || b.customer.phone === c.phone).sort((x, y) => (x.date + x.start < y.date + y.start ? 1 : -1));
    const done = own.filter((b) => b.status === 'completed');
    stats[c.id] = {
      visits: done.length,
      spent: done.reduce((s, b) => s + b.price.total, 0),
      last: done[0]?.date || null,
      bookings: own.slice(0, 20).map((b) => ({ id: b.id, date: b.date, start: b.start, status: b.status, packageId: b.packageId, total: b.price.total })),
    };
  }
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.customers}</h1>
      </div>
      <section className="admin-card">
        <CustomersCRM lang={lang} t={t} customers={db.customers} stats={stats} sizes={db.vehicleSizes} packages={db.packages} currency={db.settings.currency} />
      </section>
    </div>
  );
}
