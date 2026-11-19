// Single-series bar chart in plain HTML/CSS: thin rounded bars on a
// baseline, recessive grid, hover/focus tooltip, and a table view.
export default function BarChart({ title, data, format, tableLabel, valueLabel, horizontal = false }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = (() => {
    const pow = 10 ** Math.floor(Math.log10(max));
    const step = [1, 2, 2.5, 5, 10].find((m) => m * pow * 4 >= max) * pow;
    return step * 4;
  })();
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * nice);
  return (
    <figure className={`chart ${horizontal ? 'is-horizontal' : ''}`}>
      <figcaption className="h3">{title}</figcaption>
      {horizontal ? (
        <ul className="hbars">
          {data.map((d) => (
            <li key={d.label}>
              <span className="hbar-label small">{d.label}</span>
              <span className="hbar-track">
                <span className="hbar" style={{ width: `${(d.value / max) * 100}%` }} />
              </span>
              <span className="small num">{format(d.value)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="vchart">
          <div className="vchart-grid" aria-hidden="true">
            {ticks
              .slice()
              .reverse()
              .map((tk) => (
                <span key={tk}>
                  <em className="small num">{format(tk)}</em>
                </span>
              ))}
          </div>
          <div className="vchart-bars" role="list">
            {data.map((d) => (
              <div key={d.label} className="vbar-slot" role="listitem" tabIndex={0} aria-label={`${d.full || d.label}: ${format(d.value)}`}>
                <span className="vbar" style={{ height: `${(d.value / nice) * 100}%` }} />
                <span className="vbar-tip" aria-hidden="true">
                  <strong className="num">{format(d.value)}</strong>
                  <span>{d.full || d.label}</span>
                </span>
                <span className="vbar-label small" aria-hidden="true">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <details className="chart-table">
        <summary className="small muted">{tableLabel}</summary>
        <table className="admin-table compact">
          <caption className="visually-hidden">{valueLabel}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.full || d.label}</th>
                <td className="num">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
