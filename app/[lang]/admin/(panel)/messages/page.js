import MessagesInbox from '@/components/admin/MessagesInbox';
import { adminContext } from '@/lib/adminData';
import { getDict } from '@/lib/i18n';

export default async function MessagesAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { db } = await adminContext();
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.messages}</h1>
      </div>
      <section className="admin-card">
        <MessagesInbox lang={lang} t={t} messages={db.messages} />
      </section>
    </div>
  );
}
