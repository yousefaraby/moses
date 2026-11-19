import { ObjectEditor } from '@/components/admin/Editors';
import ResetData from '@/components/admin/ResetData';
import { adminContext } from '@/lib/adminData';
import { getDict } from '@/lib/i18n';

export default async function SettingsAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { db, ctx } = await adminContext();
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.settings}</h1>
      </div>
      <section className="admin-card">
        <ObjectEditor saveAs="settings" value={db.settings} schemaKey="settings" ctx={ctx} lang={lang} t={t} />
      </section>
      <section className="admin-card stack">
        <h2 className="h3">{t.admin.resetData}</h2>
        <ResetData t={t} />
      </section>
    </div>
  );
}
