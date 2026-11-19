import BarChart from '@/components/admin/BarChart';
import { adminContext } from '@/lib/adminData';
import { formatDate, formatMoney, formatNumber, getDict, tr } from '@/lib/i18n';
import { addDays } from '@/lib/time';

export default async function ReportsAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const a = t.admin;
  const { db, now } = await adminContext();
  const cur = db.settings.currency;
  const days = Array.from({ length: 14 }, (_, i) => addDays(now.date, i - 13));
  const inRange = db.bookings.filter((b) => b.date >= days[0] && b.date <= now.date);
  const done = inRange.filter((b) => b.status === 'completed');
  const revenueByDay = days.map((d) => ({
    label: formatDate(d, lang, { day: 'numeric' }),
    full: formatDate(d, lang),
    value: db.bookings.filter((b) => b.date === d && b.status === 'completed').reduce((s, b) => s + b.price.total, 0),
  }));
  const countByDay = days.map((d) => ({
    label: formatDate(d, lang, { day: 'numeric' }),
    full: formatDate(d, lang),
    value: db.bookings.filter((b) => b.date === d && !['cancelled'].includes(b.status)).length,
  }));
  const byPkg = db.packages
    .map((p) => ({ label: tr(p.name, lang), value: done.filter((b) => b.packageId === p.id).length }))
    .sort((x, y) => y.value - x.value);
  const byBranch = db.branches.map((br) => ({ label: tr(br.name, lang), value: done.filter((b) => b.branchId === br.id).reduce((s, b) => s + b.price.total, 0) }));
  const noShows = inRange.filter((b) => b.status === 'no_show').length;
  const revenue = done.reduce((s, b) => s + b.price.total, 0);
  const rated = done.filter((b) => b.rating);
  const avgRating = rated.length ? rated.reduce((s, b) => s + b.rating, 0) / rated.length : 0;
  const closed = inRange.filter((b) => ['completed', 'no_show', 'cancelled'].includes(b.status)).length;
  const money = (n) => formatMoney(n, lang, cur);
  const num = (n) => formatNumber(n, lang);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{a.nav.reports}</h1>
        <p className="muted">{a.last14}</p>
      </div>
      <div className="kpis">
        <div className="kpi">
          <span className="small muted">{a.revenue}</span>
          <strong className="num">{money(revenue)}</strong>
        </div>
        <div className="kpi">
          <span className="small muted">{a.avgTicket}</span>
          <strong className="num">{money(done.length ? Math.round(revenue / done.length) : 0)}</strong>
        </div>
        <div className="kpi">
          <span className="small muted">{a.completionRate}</span>
          <strong className="num">{closed ? `${num(Math.round((done.length / closed) * 100))}%` : '—'}</strong>
        </div>
        <div className="kpi">
          <span className="small muted">{a.noShows}</span>
          <strong className="num">{num(noShows)}</strong>
        </div>
        <div className="kpi">
          <span className="small muted">{a.rating}</span>
          <strong className="num">{avgRating ? `${avgRating.toFixed(1)} / 5` : '—'}</strong>
        </div>
      </div>
      <div className="admin-cols">
        <section className="admin-card">
          <BarChart title={a.revenue} data={revenueByDay} format={money} tableLabel={a.list} valueLabel={a.revenue} />
        </section>
        <section className="admin-card">
          <BarChart title={a.bookingsPerDay} data={countByDay} format={num} tableLabel={a.list} valueLabel={a.bookingsPerDay} />
        </section>
        <section className="admin-card">
          <BarChart title={a.topPackages} data={byPkg} format={num} tableLabel={a.list} valueLabel={a.topPackages} horizontal />
        </section>
        <section className="admin-card">
          <BarChart title={`${a.revenue} · ${a.branch}`} data={byBranch} format={money} tableLabel={a.list} valueLabel={a.revenue} horizontal />
        </section>
      </div>
    </div>
  );
}
