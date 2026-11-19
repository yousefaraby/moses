import { CollectionEditor, ObjectEditor } from '@/components/admin/Editors';
import { adminContext } from '@/lib/adminData';
import { getDict } from '@/lib/i18n';

export default async function CapacityAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { db, ctx } = await adminContext();
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.capacity}</h1>
      </div>
      <section className="admin-card stack">
        <h2 className="h3">{t.admin.slotRules}</h2>
        <ObjectEditor saveAs="settings" value={db.settings} schemaKey="bookingRules" ctx={ctx} lang={lang} t={t} />
      </section>
      <section className="admin-card stack">
        <h2 className="h3">
          {t.admin.bays} · {t.admin.hours} · {t.admin.blocked}
        </h2>
        <CollectionEditor saveAs="branches" items={db.branches} schemaKey="branches" ctx={ctx} lang={lang} t={t} />
      </section>
      <section className="admin-card stack">
        <h2 className="h3">{t.admin.durations}</h2>
        <CollectionEditor saveAs="packages" items={db.packages} schemaKey="packages" onlyFields={['name', 'durations']} ctx={ctx} lang={lang} t={t} />
      </section>
    </div>
  );
}
