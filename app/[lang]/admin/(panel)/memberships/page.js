import { CollectionEditor } from '@/components/admin/Editors';
import SubscriptionsTable from '@/components/admin/SubscriptionsTable';
import PaymentsTable from '@/components/admin/PaymentsTable';
import Tabs from '@/components/admin/Tabs';
import { adminContext } from '@/lib/adminData';
import { getDict } from '@/lib/i18n';

export default async function MembershipsAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const a = t.admin;
  const { db, ctx } = await adminContext();
  const payments = [...db.payments].sort((x, y) => (x.at < y.at ? 1 : -1)).slice(0, 150);
  const ref = (p) => {
    if (p.kind === 'booking') return db.bookings.find((b) => b.id === p.refId)?.code || p.refId;
    return p.refId;
  };
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{a.nav.memberships}</h1>
      </div>
      <section className="admin-card">
        <Tabs
          label={a.nav.memberships}
          tabs={[
            { id: 'plans', label: a.plans, content: <CollectionEditor saveAs="plans" items={db.plans} schemaKey="plans" ctx={ctx} lang={lang} t={t} /> },
            { id: 'subs', label: a.subscriptions, content: <SubscriptionsTable lang={lang} t={t} subscriptions={db.subscriptions} customers={db.customers} plans={db.plans} /> },
            {
              id: 'payments',
              label: a.payments,
              content: <PaymentsTable lang={lang} t={t} payments={payments.map((p) => ({ ...p, ref: ref(p) }))} currency={db.settings.currency} />,
            },
            { id: 'gift', label: a.giftCards, content: <CollectionEditor saveAs="giftCards" items={db.giftCards} schemaKey="giftCards" ctx={ctx} lang={lang} t={t} /> },
          ]}
        />
      </section>
    </div>
  );
}
