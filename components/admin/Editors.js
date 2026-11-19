'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Icon from '../Icon';
import { getJson, postJson } from '@/lib/client';
import { COLLECTIONS, OBJECTS, getPath, setPath } from '@/lib/adminSchema';
import { tr, weekdayName } from '@/lib/i18n';

export async function saveKey(key, value) {
  return postJson(`/api/admin/data/${key}`, { value }, 'PUT');
}

const lbl = (l, lang) => (typeof l === 'string' ? l : l?.[lang] || l?.en || '');

function Bilingual({ value, onChange, area, rows = 3, id }) {
  const v = value && typeof value === 'object' ? value : { ar: value || '', en: value || '' };
  const Tag = area ? 'textarea' : 'input';
  return (
    <div className="bi">
      {['ar', 'en'].map((l) => (
        <div key={l} className="bi-col">
          <span className="bi-tag">{l.toUpperCase()}</span>
          <Tag
            id={l === 'ar' ? id : undefined}
            aria-label={l === 'ar' ? 'العربية' : 'English'}
            className={area ? 'textarea' : 'input'}
            dir={l === 'ar' ? 'rtl' : 'ltr'}
            lang={l}
            rows={area ? rows : undefined}
            value={v[l] || ''}
            onChange={(e) => onChange({ ...v, [l]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

export function FieldInput({ field, value, onChange, ctx, lang, locked }) {
  const id = `f-${field.path.replace(/\./g, '-')}`;
  const options = field.options || (field.optionsFrom ? (ctx[field.optionsFrom] || []).map((o) => [o.id, o.name || o.title || o.id]) : []);
  let control;
  switch (field.type) {
    case 'i18n':
      control = <Bilingual id={id} value={value} onChange={onChange} />;
      break;
    case 'i18nArea':
      control = <Bilingual id={id} value={value} onChange={onChange} area rows={field.rows || 4} />;
      break;
    case 'textarea':
      control = <textarea id={id} className="textarea" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'number':
      control = (
        <input
          id={id}
          className="input num"
          type="number"
          inputMode="decimal"
          value={value === null || value === undefined ? '' : value}
          onChange={(e) => onChange(e.target.value === '' ? (field.nullable ? null : 0) : Number(e.target.value))}
        />
      );
      break;
    case 'date':
      control = <input id={id} className="input" type="date" value={value || ''} onChange={(e) => onChange(e.target.value || null)} />;
      break;
    case 'time':
      control = <input id={id} className="input" type="time" step="900" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'bool':
      control = (
        <label className="switch">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span aria-hidden="true" />
        </label>
      );
      break;
    case 'select':
      control = (
        <select id={id} className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value || (field.allowEmpty ? undefined : ''))}>
          {field.allowEmpty && <option value="">—</option>}
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {lbl(l, lang)}
            </option>
          ))}
        </select>
      );
      break;
    case 'multi':
    case 'channels': {
      const opts = field.type === 'channels' ? [['sms', 'SMS'], ['whatsapp', 'WhatsApp'], ['email', 'Email']] : options;
      const list = Array.isArray(value) ? value : [];
      control = (
        <div className="checks" role="group" aria-labelledby={`${id}-label`}>
          {opts.map(([v, l]) => (
            <label key={v} className="check">
              <input type="checkbox" checked={list.includes(v)} onChange={(e) => onChange(e.target.checked ? [...list, v] : list.filter((x) => x !== v))} />
              {lbl(l, lang)}
            </label>
          ))}
        </div>
      );
      break;
    }
    case 'weekdays': {
      const list = Array.isArray(value) ? value : [];
      control = (
        <div className="checks" role="group" aria-labelledby={`${id}-label`}>
          {[6, 0, 1, 2, 3, 4, 5].map((d) => (
            <label key={d} className="check">
              <input type="checkbox" checked={list.includes(d)} onChange={(e) => onChange(e.target.checked ? [...list, d].sort() : list.filter((x) => x !== d))} />
              {weekdayName(d, lang, 'short')}
            </label>
          ))}
        </div>
      );
      break;
    }
    case 'sizeMap': {
      const v = value || {};
      control = (
        <div className="size-map">
          {(ctx.vehicleSizes || []).map((s) => (
            <label key={s.id} className="field">
              <span className="small muted">{tr(s.name, lang)}</span>
              <input className="input num" type="number" inputMode="numeric" value={v[s.id] ?? ''} onChange={(e) => onChange({ ...v, [s.id]: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </label>
          ))}
        </div>
      );
      break;
    }
    case 'i18nList': {
      const list = Array.isArray(value) ? value : [];
      control = (
        <div className="list-edit">
          {list.map((item, i) => (
            <div key={i} className="list-edit-row">
              <Bilingual value={item} onChange={(nv) => onChange(list.map((x, j) => (j === i ? nv : x)))} />
              <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...list, { ar: '', en: '' }])}>
            <Icon name="plus" size={18} />
            {lang === 'ar' ? 'إضافة سطر' : 'Add line'}
          </button>
        </div>
      );
      break;
    }
    case 'steps': {
      const list = Array.isArray(value) ? value : [];
      control = (
        <div className="list-edit">
          {list.map((item, i) => (
            <div key={i} className="list-edit-row is-stacked">
              <Bilingual value={item.title} onChange={(nv) => onChange(list.map((x, j) => (j === i ? { ...x, title: nv } : x)))} />
              <Bilingual value={item.text} area rows={2} onChange={(nv) => onChange(list.map((x, j) => (j === i ? { ...x, text: nv } : x)))} />
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                <Icon name="trash" size={18} />
                {lang === 'ar' ? 'حذف' : 'Remove'}
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...list, { title: { ar: '', en: '' }, text: { ar: '', en: '' } }])}>
            <Icon name="plus" size={18} />
            {lang === 'ar' ? 'إضافة' : 'Add'}
          </button>
        </div>
      );
      break;
    }
    case 'hours': {
      const v = value || {};
      control = (
        <table className="admin-table compact">
          <tbody>
            {[6, 0, 1, 2, 3, 4, 5].map((d) => {
              const h = v[d] || { open: '09:00', close: '22:00' };
              const set = (patch) => onChange({ ...v, [d]: { ...h, ...patch } });
              return (
                <tr key={d}>
                  <th scope="row">{weekdayName(d, lang)}</th>
                  <td>
                    <input className="input" type="time" step="900" aria-label="open" value={h.open} disabled={h.closed} onChange={(e) => set({ open: e.target.value })} />
                  </td>
                  <td>
                    <input className="input" type="time" step="900" aria-label="close" value={h.close} disabled={h.closed} onChange={(e) => set({ close: e.target.value })} />
                  </td>
                  <td>
                    <label className="check">
                      <input type="checkbox" checked={Boolean(h.closed)} onChange={(e) => set({ closed: e.target.checked })} />
                      {lang === 'ar' ? 'مغلق' : 'Closed'}
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
      break;
    }
    case 'blocked': {
      const list = Array.isArray(value) ? value : [];
      const setRow = (i, patch) => onChange(list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
      control = (
        <div className="list-edit">
          {list.map((row, i) => (
            <div key={i} className="blocked-row">
              <input className="input" type="date" aria-label="date" value={row.date || ''} onChange={(e) => setRow(i, { date: e.target.value })} />
              <input className="input" type="time" step="900" aria-label="from" value={row.from || ''} onChange={(e) => setRow(i, { from: e.target.value })} />
              <input className="input" type="time" step="900" aria-label="to" value={row.to || ''} onChange={(e) => setRow(i, { to: e.target.value })} />
              <input className="input num" type="number" min="0" aria-label="bay" placeholder={lang === 'ar' ? 'كل الأماكن' : 'All bays'} value={row.bay || ''} onChange={(e) => setRow(i, { bay: e.target.value ? Number(e.target.value) : null })} />
              <input className="input" aria-label="reason" placeholder={lang === 'ar' ? 'السبب' : 'Reason'} value={row.reason || ''} onChange={(e) => setRow(i, { reason: e.target.value })} />
              <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...list, { date: ctx.today || '', from: '12:00', to: '14:00', bay: null, reason: '' }])}>
            <Icon name="plus" size={18} />
            {lang === 'ar' ? 'قفل وقت' : 'Block time'}
          </button>
        </div>
      );
      break;
    }
    default:
      control = (
        <input
          id={id}
          className="input"
          value={value ?? ''}
          readOnly={locked}
          onChange={(e) => onChange(field.upper ? e.target.value.toUpperCase() : e.target.value)}
        />
      );
  }
  const labelled = ['i18n', 'i18nArea', 'multi', 'channels', 'weekdays', 'sizeMap', 'i18nList', 'steps', 'hours', 'blocked', 'bool'].includes(field.type);
  return (
    <div className={`field admin-field type-${field.type}`}>
      {labelled ? (
        <span className="label" id={`${id}-label`}>
          {lbl(field.label, lang)}
        </span>
      ) : (
        <label htmlFor={id}>{lbl(field.label, lang)}</label>
      )}
      {control}
    </div>
  );
}

function SaveBar({ dirty, state, onSave, onReset, t }) {
  return (
    <div className={`save-bar ${dirty ? 'is-dirty' : ''}`}>
      <span className="small muted" role="status">
        {state === 'saved' ? t.admin.savedOk : state === 'error' ? t.admin.saveFailed : ''}
      </span>
      {dirty && (
        <button type="button" className="btn btn-quiet btn-sm" onClick={onReset}>
          {t.common.cancel}
        </button>
      )}
      <button type="button" className="btn btn-primary" disabled={!dirty || state === 'saving'} onClick={onSave}>
        {state === 'saving' ? <span className="spinner" /> : <Icon name="check" size={18} />}
        {t.common.save}
      </button>
    </div>
  );
}

/** Edit an array collection: list on one side, form on the other. */
export function CollectionEditor({ saveAs, items, schemaKey, onlyFields, ctx, lang, t }) {
  const full = COLLECTIONS[schemaKey];
  const schema = onlyFields ? { ...full, fields: full.fields.filter((f) => onlyFields.includes(f.path)) } : full;
  const router = useRouter();
  const [list, setList] = useState(items);
  const [base, setBase] = useState(items);
  const [openIdx, setOpenIdx] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [state, setState] = useState('idle');
  const [q, setQ] = useState('');
  const dirty = JSON.stringify(list) !== JSON.stringify(base);
  const resolvedCtx = useMemo(() => {
    const out = { ...ctx };
    for (const k of Object.keys(out)) {
      if (Array.isArray(out[k])) out[k] = out[k].map((o) => ({ ...o, name: o.name ? tr(o.name, lang) : o.title ? tr(o.title, lang) : o.id }));
    }
    out.vehicleSizes = ctx.vehicleSizes;
    return out;
  }, [ctx, lang]);

  async function save() {
    setState('saving');
    const r = await saveKey(saveAs, list);
    if (r.ok) {
      setBase(list);
      setState('saved');
      setIsNew(false);
      router.refresh();
    } else setState('error');
  }

  const item = openIdx !== null ? list[openIdx] : null;
  const update = (path, value) => {
    setState('idle');
    setList((l) => l.map((x, i) => (i === openIdx ? setPath(x, path, value) : x)));
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setList(copy);
    if (openIdx === i) setOpenIdx(j);
  };
  const filtered = list.map((x, i) => [x, i]).filter(([x]) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="editor">
      <div className="editor-list">
        <div className="editor-tools">
          <input className="input" type="search" placeholder={t.admin.search} aria-label={t.admin.search} value={q} onChange={(e) => setQ(e.target.value)} />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const next = [...list, schema.blank()];
              setList(next);
              setOpenIdx(next.length - 1);
              setIsNew(true);
            }}
          >
            <Icon name="plus" size={18} />
            {t.admin.newItem}
          </button>
        </div>
        {list.length === 0 && <p className="muted small">{t.admin.empty}</p>}
        <ul className="editor-items">
          {filtered.map(([x, i]) => (
            <li key={`${x[schema.key]}-${i}`} className={openIdx === i ? 'is-open' : ''}>
              <button type="button" className="editor-item" onClick={() => setOpenIdx(openIdx === i ? null : i)} aria-expanded={openIdx === i}>
                <span className="editor-item-title">{schema.label(x, lang) || '—'}</span>
                {x.active === false && <span className="chip">{lang === 'ar' ? 'متوقف' : 'Off'}</span>}
              </button>
              <span className="editor-item-actions">
                <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label={t.admin.moveUp} onClick={() => move(i, -1)}>
                  <Icon name="chevron" size={18} className="rot-up" />
                </button>
                <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label={t.admin.moveDown} onClick={() => move(i, 1)}>
                  <Icon name="chevronDown" size={18} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="editor-form">
        {item ? (
          <>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3 className="h3">{schema.label(item, lang) || t.admin.newItem}</h3>
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={() => {
                  if (!window.confirm(`${t.admin.removeItem}?`)) return;
                  setList((l) => l.filter((_, i) => i !== openIdx));
                  setOpenIdx(null);
                }}
              >
                <Icon name="trash" size={18} />
                {t.admin.removeItem}
              </button>
            </div>
            {schema.fields.map((f) => (
              <FieldInput key={f.path} field={f} value={getPath(item, f.path)} onChange={(v) => update(f.path, v)} ctx={resolvedCtx} lang={lang} locked={f.lockOnEdit && !isNew} />
            ))}
          </>
        ) : (
          <p className="muted">{lang === 'ar' ? 'اختار عنصر من القائمة عشان تعدّله، أو اضغط جديد.' : 'Pick an item to edit it, or add a new one.'}</p>
        )}
        <SaveBar dirty={dirty} state={state} onSave={save} onReset={() => setList(base)} t={t} />
      </div>
    </div>
  );
}

/** Edit an object (settings, page copy). `root` saves into another key. */
export function ObjectEditor({ saveAs, value, schemaKey, ctx, lang, t }) {
  const schema = OBJECTS[schemaKey];
  const router = useRouter();
  const [obj, setObj] = useState(value);
  const [base, setBase] = useState(value);
  const [state, setState] = useState('idle');
  const dirty = JSON.stringify(obj) !== JSON.stringify(base);
  const resolvedCtx = useMemo(() => {
    const out = { ...ctx };
    for (const k of Object.keys(out)) {
      if (Array.isArray(out[k])) out[k] = out[k].map((o) => ({ ...o, name: o.name ? tr(o.name, lang) : o.id }));
    }
    return out;
  }, [ctx, lang]);
  // Merge only this editor's fields into the latest saved object, so two
  // editors on the same object (e.g. settings) never overwrite each other.
  async function save() {
    setState('saving');
    const fresh = await getJson('/api/admin/data');
    if (!fresh.ok) return setState('error');
    let merged = fresh.data[saveAs] || {};
    for (const f of schema.fields) merged = setPath(merged, f.path, getPath(obj, f.path));
    const r = await saveKey(saveAs, merged);
    if (r.ok) {
      setObj(merged);
      setBase(merged);
      setState('saved');
      router.refresh();
    } else setState('error');
  }
  return (
    <div className="editor-form is-solo">
      {schema.fields.map((f) => (
        <FieldInput
          key={f.path}
          field={f}
          value={getPath(obj, f.path)}
          onChange={(v) => {
            setState('idle');
            setObj((o) => setPath(o, f.path, v));
          }}
          ctx={resolvedCtx}
          lang={lang}
        />
      ))}
      <SaveBar dirty={dirty} state={state} onSave={save} onReset={() => setObj(base)} t={t} />
    </div>
  );
}
