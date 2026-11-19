import { CollectionEditor, ObjectEditor } from '@/components/admin/Editors';
import { adminContext } from '@/lib/adminData';
import { OBJECTS } from '@/lib/adminSchema';
import { formatDateTime, getDict } from '@/lib/i18n';

export default async function NotificationsAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const a = t.admin;
  const { db, ctx } = await adminContext();
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{a.nav.notifications}</h1>
      </div>
      <section className="admin-card stack">
        <h2 className="h3">{a.templates}</h2>
        <CollectionEditor saveAs="templates" items={db.templates} schemaKey="templates" ctx={ctx} lang={lang} t={t} />
      </section>
      <section className="admin-card stack">
        <h2 className="h3">{OBJECTS.reminders.title[lang]}</h2>
        <ObjectEditor saveAs="settings" value={db.settings} schemaKey="reminders" ctx={ctx} lang={lang} t={t} />
      </section>
      <section className="admin-card stack">
        <h2 className="h3">{a.outbox}</h2>
        {db.outbox.length === 0 ? (
          <p className="muted">{a.outboxEmpty}</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">{a.date}</th>
                  <th scope="col">{a.channel}</th>
                  <th scope="col">{a.to}</th>
                  <th scope="col">{a.message}</th>
                </tr>
              </thead>
              <tbody>
                {db.outbox.slice(0, 100).map((o) => (
                  <tr key={o.id}>
                    <td className="nowrap">{formatDateTime(o.at, lang)}</td>
                    <td>
                      <span className="chip outline">{o.channel}</span>
                    </td>
                    <td className="latin nowrap">{o.to}</td>
                    <td>{o.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
