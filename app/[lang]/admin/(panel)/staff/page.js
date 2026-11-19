import { CollectionEditor } from '@/components/admin/Editors';
import { adminContext } from '@/lib/adminData';
import { formatNumber, getDict, tr } from '@/lib/i18n';

export default async function StaffAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { db, ctx, now } = await adminContext();
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.staff}</h1>
      </div>
      <div className="kpis">
        {db.branches.map((b) => {
          const team = db.staff.filter((s) => s.branchId === b.id && s.active !== false);
          const jobs = db.bookings.filter((x) => x.branchId === b.id && x.date === now.date && x.staffId).length;
          return (
            <div key={b.id} className="kpi">
              <span className="small muted">{tr(b.name, lang)}</span>
              <strong className="num">
                {formatNumber(team.length, lang)} · {formatNumber(b.bays, lang)} {t.admin.bays.toLowerCase()}
              </strong>
              <span className="small muted">
                {formatNumber(jobs, lang)} {t.admin.assign.toLowerCase()} · {t.common.today}
              </span>
            </div>
          );
        })}
      </div>
      <section className="admin-card">
        <CollectionEditor saveAs="staff" items={db.staff} schemaKey="staff" ctx={ctx} lang={lang} t={t} />
      </section>
    </div>
  );
}
