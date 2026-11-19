'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../Icon';
import TopCar from './TopCar';
import { getJson, postJson } from '@/lib/client';
import { fmt } from '@/lib/dict';
import { bookingDuration, isAddonIncluded, quote as localQuote } from '@/lib/engine';
import { formatDate, formatDuration, formatMoney, formatNumber, formatTime, href, tr } from '@/lib/i18n';
import { addDays, weekdayOf } from '@/lib/time';

const STEPS = ['branch', 'vehicle', 'package', 'addons', 'time', 'details', 'pay'];
const STORE_KEY = 'md_booking_draft';

const phoneOk = (v) => /^(\+?20|0020|0)?1[0125]\d{8}$/.test(String(v || '').replace(/[\s-]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

function CopyRow({ label, value, t }) {
  const [done, setDone] = useState(false);
  return (
    <div className="copy-row">
      <span className="copy-text">
        <span className="small muted block">{label}</span>
        <strong className="latin">{value}</strong>
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          navigator.clipboard?.writeText(value.replace(/\s/g, ''));
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        }}
      >
        <Icon name={done ? 'check' : 'copy'} size={16} />
        {done ? t.copied : t.copy}
      </button>
    </div>
  );
}

export default function BookingWizard({ lang, t, content, customer, initial, today }) {
  const router = useRouter();
  const b = t.book;
  const { settings, branches, vehicleSizes, packages, addons } = content;
  const cur = settings.currency;
  const payInfo = { instapay: 'mosesdetailing@instapay', wallet: '', walletName: '', ...(settings.payment || {}) };
  const quietPct = settings.booking.quiet.percent;

  const [sel, setSel] = useState(() => ({
    mode: 'center',
    branchId: initial.branch || '',
    address: '',
    sizeId: initial.size || '',
    carId: '',
    plate: '',
    carLabel: '',
    packageId: initial.package || '',
    addonIds: initial.addon ? [initial.addon] : [],
    date: initial.date || today,
    start: initial.time || '',
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    notes: '',
    payMethod: 'center',
    payRef: '',
    promoCode: '',
  }));
  const [step, setStep] = useState(() => {
    if (!initial.branch) return 0;
    if (!initial.size) return 1;
    if (!initial.package) return 2;
    return 3;
  });
  const [zone, setZone] = useState(null);
  const [slots, setSlots] = useState({ loading: false, list: [], date: null });
  const [live, setLive] = useState(null);
  const [serverQuote, setServerQuote] = useState(null);
  const [promoState, setPromoState] = useState({ status: 'idle', error: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const headingRef = useRef(null);
  const restored = useRef(false);

  const set = (patch) => setSel((s) => ({ ...s, ...patch }));

  // Restore an unfinished booking after a reload or a detour to log in.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (initial.branch || initial.package || initial.size) return;
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.sel) {
        setSel((s) => ({ ...s, ...draft.sel, mode: 'center', payMethod: draft.sel.payMethod === 'instapay' ? 'instapay' : 'center', name: customer?.name || draft.sel.name, phone: customer?.phone || draft.sel.phone }));
        setStep(Math.min(draft.step || 0, STEPS.length - 1));
      }
    } catch {
      /* ignore */
    }
  }, [initial, customer]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ sel, step }));
    } catch {
      /* ignore */
    }
  }, [sel, step]);

  useEffect(() => {
    getJson('/api/live').then((r) => r.ok && setLive(r));
  }, []);

  const branch = branches.find((x) => x.id === sel.branchId);
  const pkg = packages.find((x) => x.id === sel.packageId);
  const size = vehicleSizes.find((x) => x.id === sel.sizeId);
  const activeAddons = sel.addonIds.filter((id) => !(pkg && isAddonIncluded(addons.find((a) => a.id === id) || {}, pkg.id)));
  const duration = pkg && sel.sizeId ? bookingDuration({ packages, addons }, { packageId: pkg.id, sizeId: sel.sizeId, addonIds: activeAddons }) : 0;

  const local = useMemo(
    () =>
      pkg && sel.sizeId
        ? localQuote({ packages, addons, settings, promos: [], giftCards: [] }, { packageId: pkg.id, sizeId: sel.sizeId, addonIds: activeAddons, mode: sel.mode, date: sel.date, start: sel.start })
        : null,
    [pkg, sel.sizeId, activeAddons.join(','), sel.mode, sel.date, sel.start] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const q = serverQuote || local;

  // Re-price on the server when a code is applied and the basket changes.
  useEffect(() => {
    if (promoState.status !== 'applied') {
      setServerQuote(null);
      return;
    }
    let alive = true;
    postJson('/api/quote', { packageId: sel.packageId, sizeId: sel.sizeId, addonIds: activeAddons, mode: sel.mode, date: sel.date, start: sel.start, promoCode: sel.promoCode, phone: sel.phone }).then((r) => {
      if (alive && r.ok) setServerQuote(r.quote);
    });
    return () => {
      alive = false;
    };
  }, [promoState.status, sel.packageId, sel.sizeId, activeAddons.join(','), sel.mode, sel.date, sel.start]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slots for the chosen day.
  useEffect(() => {
    if (STEPS[step] !== 'time' || !branch || !pkg || !sel.sizeId) return undefined;
    let alive = true;
    setSlots((s) => ({ ...s, loading: true }));
    const params = new URLSearchParams({ branch: branch.id, date: sel.date, package: pkg.id, size: sel.sizeId, addons: activeAddons.join(','), mode: sel.mode });
    getJson(`/api/slots?${params}`).then((r) => {
      if (!alive) return;
      const list = r.ok ? r.slots : [];
      setSlots({ loading: false, list, date: sel.date });
      if (sel.start && !list.some((s) => s.time === sel.start)) set({ start: '' });
    });
    return () => {
      alive = false;
    };
  }, [step, branch?.id, pkg?.id, sel.sizeId, sel.date, sel.mode, activeAddons.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  function goto(i) {
    setStep(i);
    setBanner(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      headingRef.current?.focus({ preventScroll: true });
    });
  }

  function validate(i) {
    const e = {};
    const key = STEPS[i];
    if (key === 'branch') {
      if (!sel.branchId) e.branch = true;
    }
    if (key === 'vehicle' && !sel.sizeId) e.size = true;
    if (key === 'package' && !sel.packageId) e.package = true;
    if (key === 'time' && !sel.start) e.start = true;
    if (key === 'details') {
      if (!sel.name.trim()) e.name = b.errors.name;
      if (!phoneOk(sel.phone)) e.phone = b.errors.phone;
      if (!sel.plate.trim()) e.plate = b.errors.plate;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const canContinue = (() => {
    switch (STEPS[step]) {
      case 'branch':
        return Boolean(sel.branchId);
      case 'vehicle':
        return Boolean(sel.sizeId);
      case 'package':
        return Boolean(sel.packageId);
      case 'time':
        return Boolean(sel.start);
      default:
        return true;
    }
  })();

  async function submit() {
    if (!validate(step)) return;
    setSubmitting(true);
    const res = await postJson('/api/bookings', {
      branchId: sel.branchId,
      mode: sel.mode,
      address: sel.address,
      sizeId: sel.sizeId,
      packageId: sel.packageId,
      addonIds: activeAddons,
      date: sel.date,
      start: sel.start,
      name: sel.name,
      phone: sel.phone,
      plate: sel.plate,
      carLabel: sel.carLabel,
      email: sel.email,
      notes: sel.notes,
      payMethod: sel.payMethod,
      payRef: sel.payRef,
      promoCode: promoState.status === 'applied' ? sel.promoCode : '',
      lang,
    });
    if (res.ok) {
      try {
        sessionStorage.removeItem(STORE_KEY);
      } catch {
        /* ignore */
      }
      router.push(href(lang, `/booking/${res.id}?t=${res.token}&new=1`));
      return;
    }
    setSubmitting(false);
    if (res.error === 'slotTaken') {
      set({ start: '' });
      goto(STEPS.indexOf('time'));
      setBanner(b.slotTaken);
    } else if (b.errors[res.error]) {
      goto(STEPS.indexOf('details'));
      setErrors({ [res.error]: b.errors[res.error] });
    } else {
      setBanner(t.common.errorGeneric);
    }
  }

  function next() {
    if (!validate(step)) return;
    if (step === STEPS.length - 1) submit();
    else goto(step + 1);
  }

  async function applyPromo() {
    if (!sel.promoCode.trim()) return;
    setPromoState({ status: 'checking', error: null });
    const r = await postJson('/api/quote', { packageId: sel.packageId, sizeId: sel.sizeId, addonIds: activeAddons, mode: sel.mode, date: sel.date, start: sel.start, promoCode: sel.promoCode, phone: sel.phone });
    if (r.ok && !r.quote.promoError) {
      setServerQuote(r.quote);
      setPromoState({ status: 'applied', error: null });
    } else {
      setServerQuote(null);
      setPromoState({ status: 'error', error: r.quote?.promoError || 'notFound' });
    }
  }

  const stepKey = STEPS[step];
  const days = Array.from({ length: Math.min(14, settings.booking.maxDaysAhead) }, (_, i) => addDays(today, i));
  const zoneCounts = activeAddons.reduce((acc, id) => {
    const a = addons.find((x) => x.id === id);
    if (a) acc[a.zone] = (acc[a.zone] || 0) + 1;
    return acc;
  }, {});
  const money = (n) => formatMoney(n, lang, cur);
  const branchLive = (id) => live?.branches.find((x) => x.id === id);

  // ------------------------------------------------------------------ views
  const views = {
    branch: (
      <>
        <div className="choice-list" role="radiogroup" aria-label={b.steps.branch}>
          {branches.map((br) => {
            const s = branchLive(br.id);
            return (
              <label key={br.id} className={`choice ${sel.branchId === br.id ? 'is-on' : ''}`}>
                <input type="radio" name="branch" value={br.id} checked={sel.branchId === br.id} onChange={() => set({ branchId: br.id })} />
                <span className="choice-icon" aria-hidden="true">
                  <Icon name="pin" size={22} />
                </span>
                <span className="choice-main">
                  <strong>{tr(br.name, lang)}</strong>
                  <span className="small muted">{`${tr(br.area, lang)} · ${tr(br.address, lang)}`}</span>
                  {s && (
                    <span className="small">
                      {s.open ? (
                        <span className={`live-dot ${s.wait ? 'is-busy' : ''}`}>
                          {t.locations.wait}: {s.wait ? fmt(t.locations.waitMin, { n: formatNumber(s.wait, lang) }) : t.locations.noWait}
                        </span>
                      ) : (
                        <span className="muted">{t.locations.closedNow}</span>
                      )}
                    </span>
                  )}
                </span>
                <span className="tick">
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
              </label>
            );
          })}
        </div>
      </>
    ),

    vehicle: (
      <>
        {customer?.cars?.length > 0 && (
          <div className="stack">
            <h3 className="caption">{b.savedCars}</h3>
            <div className="choice-list">
              {customer.cars.map((car) => (
                <button
                  key={car.id}
                  type="button"
                  className={`choice ${sel.carId === car.id ? 'is-on' : ''}`}
                  aria-pressed={sel.carId === car.id}
                  onClick={() => set({ carId: car.id, sizeId: car.sizeId, plate: car.plate, carLabel: car.label })}
                >
                  <span className="choice-icon" aria-hidden="true">
                    <Icon name={vehicleSizes.find((v) => v.id === car.sizeId)?.icon || 'car'} size={26} />
                  </span>
                  <span className="choice-main">
                    <strong>{car.label || car.plate}</strong>
                    <span className="small muted">{car.plate}</span>
                  </span>
                  <span className="tick">
                    <Icon name="check" size={14} strokeWidth={3} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="choice-grid" role="radiogroup" aria-label={b.vehicleTitle}>
          {vehicleSizes.map((v) => (
            <label key={v.id} className={`choice choice-tile ${sel.sizeId === v.id ? 'is-on' : ''}`}>
              <input type="radio" name="size" value={v.id} checked={sel.sizeId === v.id} onChange={() => set({ sizeId: v.id, carId: '' })} />
              <Icon name={v.icon} size={40} strokeWidth={1.4} />
              <strong>{tr(v.name, lang)}</strong>
              <span className="small muted">{tr(v.hint, lang)}</span>
              <span className="tick">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
            </label>
          ))}
        </div>
      </>
    ),

    package: (
      <div className="choice-list" role="radiogroup" aria-label={b.packageTitle}>
        {packages.map((p) => (
          <label key={p.id} className={`choice choice-pkg ${sel.packageId === p.id ? 'is-on' : ''}`}>
            <input type="radio" name="package" value={p.id} checked={sel.packageId === p.id} onChange={() => set({ packageId: p.id })} />
            <span className="choice-icon" aria-hidden="true">
              <Icon name="crown" size={24} strokeWidth={1.8} />
            </span>
            <span className="choice-main">
              <span className="row">
                <strong className="choice-pkg-name">{tr(p.name, lang)}</strong>
                {p.popular && <span className="chip copper">{t.common.popular}</span>}
              </span>
              <span className="small muted">{tr(p.tagline, lang)}</span>
              <span className="choice-pkg-incl small">{p.includes.map((i) => tr(i, lang)).join(' · ')}</span>
            </span>
            <span className="choice-side">
              <strong className="num choice-price">{money(p.prices[sel.sizeId])}</strong>
              <span className="small muted">{formatDuration(p.durations[sel.sizeId], lang)}</span>
            </span>
            <span className="tick">
              <Icon name="check" size={14} strokeWidth={3} />
            </span>
          </label>
        ))}
      </div>
    ),

    addons: (
      <div className="addons-layout">
        <TopCar active={zone} counts={zoneCounts} onPick={setZone} labels={b.zones} zones={[...new Set(addons.map((a) => a.zone))]} />
        <div className="stack">
          <p className="muted small">{b.addonsHint}</p>
          {zone && (
            <button type="button" className="chip outline chip-btn" onClick={() => setZone(null)}>
              {b.zones[zone]}
              <Icon name="close" size={14} />
            </button>
          )}
          <div className="choice-list">
            {addons
              .filter((a) => !zone || a.zone === zone)
              .map((a) => {
                const included = pkg && isAddonIncluded(a, pkg.id);
                const on = included || sel.addonIds.includes(a.id);
                return (
                  <label key={a.id} className={`choice ${on ? 'is-on' : ''} ${included ? 'is-included' : ''}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={included}
                      onChange={(e) => set({ addonIds: e.target.checked ? [...sel.addonIds, a.id] : sel.addonIds.filter((x) => x !== a.id) })}
                    />
                    <span className="choice-main">
                      <strong>{tr(a.name, lang)}</strong>
                      <span className="small muted">{tr(a.description, lang)}</span>
                    </span>
                    <span className="choice-side">
                      {included ? (
                        <span className="chip">{t.common.included}</span>
                      ) : (
                        <>
                          <strong className="num">+{money(a.price)}</strong>
                          <span className="small muted">+{formatDuration(a.duration, lang)}</span>
                        </>
                      )}
                    </span>
                    <span className="tick square">
                      <Icon name="check" size={14} strokeWidth={3} />
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      </div>
    ),

    time: (
      <>
        <div className="date-strip" role="radiogroup" aria-label={t.admin.day}>
          {days.map((d) => {
            const h = branch?.hours?.[weekdayOf(d)];
            const closed = !h || h.closed;
            return (
              <button key={d} type="button" role="radio" aria-checked={sel.date === d} disabled={closed} className="date-chip" onClick={() => set({ date: d, start: '' })}>
                <span className="small">{d === today ? t.common.today : formatDate(d, lang, { weekday: 'short' })}</span>
                <strong className="num">{formatDate(d, lang, { day: 'numeric' })}</strong>
                <span className="small muted">{closed ? b.closedDay : formatDate(d, lang, { month: 'short' })}</span>
              </button>
            );
          })}
        </div>
        <p className="small muted legend">
          <span className="chip copper">{fmt(b.quiet, { pct: formatNumber(quietPct, lang) })}</span>
          {fmt(b.quietLegend, { pct: formatNumber(quietPct, lang) })}
        </p>
        <div className="slot-grid" role="radiogroup" aria-label={b.timeTitle} aria-busy={slots.loading}>
          {slots.loading
            ? Array.from({ length: 8 }, (_, i) => <span key={i} className="skeleton slot-skel" />)
            : slots.list.map((s) => (
                <button key={s.time} type="button" role="radio" aria-checked={sel.start === s.time} className={`slot ${s.quiet ? 'is-quiet' : ''}`} onClick={() => set({ start: s.time })}>
                  <span className="num">{formatTime(s.time, lang)}</span>
                  {s.quiet && <span className="slot-tag">{fmt(b.quiet, { pct: formatNumber(quietPct, lang) })}</span>}
                </button>
              ))}
        </div>
        {!slots.loading && slots.list.length === 0 && <p className="notice">{b.noSlots}</p>}
      </>
    ),

    details: (
      <div className="stack">
        {customer ? (
          <p className="notice ok">
            <Icon name="user" size={20} />
            {fmt(b.loggedInAs, { name: customer.name })}
          </p>
        ) : (
          <div className="notice">
            <Icon name="user" size={20} />
            <span>
              <Link className="link" href={href(lang, '/account?next=book')}>
                {b.haveAccount}
              </Link>
              <span className="block muted">{b.guest}</span>
            </span>
          </div>
        )}
        <div className="form-grid two">
          <div className="field">
            <label htmlFor="bk-name">{b.name}</label>
            <input id="bk-name" className="input" autoComplete="name" value={sel.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={Boolean(errors.name)} />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="bk-phone">{b.phone}</label>
            <input id="bk-phone" className="input latin" type="tel" inputMode="tel" autoComplete="tel" placeholder="01X XXXX XXXX" value={sel.phone} onChange={(e) => set({ phone: e.target.value })} aria-invalid={Boolean(errors.phone)} />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
          <div className="field">
            <label htmlFor="bk-plate">{b.plate}</label>
            <input id="bk-plate" className="input" placeholder={b.platePlaceholder} value={sel.plate} onChange={(e) => set({ plate: e.target.value })} aria-invalid={Boolean(errors.plate)} />
            {errors.plate && <span className="error">{errors.plate}</span>}
          </div>
          <div className="field">
            <label htmlFor="bk-email">
              {b.email} <span className="muted">({t.common.optional})</span>
            </label>
            <input id="bk-email" className="input latin" type="email" autoComplete="email" value={sel.email} onChange={(e) => set({ email: e.target.value })} />
          </div>
          <div className="field span-2">
            <label htmlFor="bk-notes">
              {b.notes} <span className="muted">({t.common.optional})</span>
            </label>
            <input id="bk-notes" className="input" value={sel.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>
      </div>
    ),

    pay: (
      <div className="stack">
        <div className="choice-list" role="radiogroup" aria-label={b.payTitle}>
          {[
            ['instapay', b.payInstapay, b.payInstapayHint, 'wallet'],
            ['center', b.payCenter, b.payCenterHint, 'cash'],
          ].map(([id, label, hint, icon]) => (
            <label key={id} className={`choice ${sel.payMethod === id ? 'is-on' : ''}`}>
              <input type="radio" name="pay" value={id} checked={sel.payMethod === id} onChange={() => set({ payMethod: id })} />
              <span className="choice-icon" aria-hidden="true">
                <Icon name={icon} size={24} />
              </span>
              <span className="choice-main">
                <strong>{label}</strong>
                <span className="small muted">{hint}</span>
              </span>
              <span className="tick">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
            </label>
          ))}
        </div>
        {sel.payMethod === 'instapay' && q?.total > 0 && (
          <div className="instapay-box">
            <p className="instapay-title">{fmt(b.instapayTitle, { total: money(q.total) })}</p>
            <CopyRow label={b.instapayAddress} value={payInfo.instapay} t={b} />
            {payInfo.wallet && <CopyRow label={fmt(b.walletNumber, { name: tr(payInfo.walletName, lang) })} value={payInfo.wallet} t={b} />}
            <div className="field">
              <label htmlFor="bk-ref">
                {b.payRef} <span className="muted">({t.common.optional})</span>
              </label>
              <input id="bk-ref" className="input latin" inputMode="text" value={sel.payRef} onChange={(e) => set({ payRef: e.target.value.slice(0, 60) })} />
              <span className="hint">{b.payRefHint}</span>
            </div>
            <p className="small copper">
              <Icon name="clock" size={16} /> {b.instapayNote}
            </p>
          </div>
        )}
        <div className="field">
          <label htmlFor="bk-promo">{b.promo}</label>
          <div className="promo-row">
            <input
              id="bk-promo"
              className="input latin"
              value={sel.promoCode}
              autoCapitalize="characters"
              onChange={(e) => {
                set({ promoCode: e.target.value.toUpperCase() });
                if (promoState.status !== 'idle') setPromoState({ status: 'idle', error: null });
              }}
              aria-invalid={promoState.status === 'error'}
            />
            <button type="button" className="btn btn-ghost" onClick={applyPromo} disabled={!sel.promoCode.trim() || promoState.status === 'checking'}>
              {promoState.status === 'checking' ? <span className="spinner" /> : b.apply}
            </button>
          </div>
          {promoState.status === 'applied' && <span className="hint copper">{fmt(b.promoOk, { code: sel.promoCode })}</span>}
          {promoState.status === 'error' && <span className="error">{b.promoErrors[promoState.error] || b.promoErrors.notFound}</span>}
        </div>
        <p className="small muted">
          <Icon name="info" size={16} /> {fmt(b.policy, { h: formatNumber(settings.booking.cancelHours, lang) })}
        </p>
      </div>
    ),
  };

  const titles = {
    branch: b.whereTitle,
    vehicle: b.vehicleTitle,
    package: b.packageTitle,
    addons: b.addonsTitle,
    time: b.timeTitle,
    details: b.detailsTitle,
    pay: b.payTitle,
  };

  const summaryRows = [
    branch && { k: 'branch', label: b.steps.branch, value: tr(branch.name, lang) },
    size && { k: 'vehicle', label: b.steps.vehicle, value: `${tr(size.name, lang)}${sel.plate ? ` · ${sel.plate}` : ''}` },
    pkg && { k: 'package', label: b.steps.package, value: tr(pkg.name, lang) },
    activeAddons.length > 0 && { k: 'addons', label: b.steps.addons, value: activeAddons.map((id) => tr(addons.find((a) => a.id === id)?.name, lang)).join('، ') },
    sel.start && { k: 'time', label: b.steps.time, value: `${sel.date === today ? t.common.today : formatDate(sel.date, lang)} · ${formatTime(sel.start, lang)}` },
  ].filter(Boolean);

  const Breakdown = () =>
    q ? (
      <dl className="breakdown">
        {q.items.map((i) => (
          <div key={`${i.kind}-${i.id}`}>
            <dt>{tr(i.name, lang)}</dt>
            <dd className="num">{money(i.amount)}</dd>
          </div>
        ))}
        {q.mobileFee > 0 && (
          <div>
            <dt>{b.mobileFee}</dt>
            <dd className="num">{money(q.mobileFee)}</dd>
          </div>
        )}
        {q.discount > 0 && (
          <div className="is-discount">
            <dt>{q.discountLabel?.kind === 'quiet' ? fmt(b.quietDiscount, { pct: formatNumber(quietPct, lang) }) : fmt(b.promoDiscount, { code: q.discountLabel?.code })}</dt>
            <dd className="num">−{money(q.discount)}</dd>
          </div>
        )}
        <div className="is-total">
          <dt>{b.total}</dt>
          <dd className="num">{money(q.total)}</dd>
        </div>
      </dl>
    ) : null;

  const isLast = step === STEPS.length - 1;
  const ctaLabel = submitting ? b.processing : isLast ? (sel.payMethod === 'instapay' && q?.total > 0 ? fmt(b.confirmPay, { total: money(q.total) }) : b.confirm) : t.common.continue;

  return (
    <div className="wizard">
      <div className="wizard-top container">
        {step > 0 ? (
          <button type="button" className="btn btn-quiet btn-sm wizard-back" onClick={() => goto(step - 1)}>
            <Icon name="arrowBack" size={20} className="flip" />
            {t.common.back}
          </button>
        ) : (
          <Link href={href(lang, '/')} className="btn btn-quiet btn-sm wizard-back">
            <Icon name="arrowBack" size={20} className="flip" />
            {t.nav.home}
          </Link>
        )}
        <p className="wizard-top-title">{b.title}</p>
        <ol className="stepper" aria-label={fmt(b.stepOf, { n: formatNumber(step + 1, lang), total: formatNumber(STEPS.length, lang) })}>
          {STEPS.map((k, i) => (
            <li key={k} className={i < step ? 'is-done' : i === step ? 'is-now' : ''}>
              <button type="button" disabled={i > step} aria-current={i === step ? 'step' : undefined} onClick={() => i < step && goto(i)}>
                <span className="stepper-dot" aria-hidden="true">
                  {i < step ? <Icon name="check" size={14} strokeWidth={3} /> : <span />}
                </span>
                <span className="stepper-label">{b.steps[k]}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="container wizard-grid">
        <section className="wizard-main" aria-labelledby="wizard-step-title">
          <p className="small muted">{fmt(b.stepOf, { n: formatNumber(step + 1, lang), total: formatNumber(STEPS.length, lang) })}</p>
          <h1 id="wizard-step-title" ref={headingRef} tabIndex={-1} className="h1 wizard-title">
            {titles[stepKey]}
          </h1>
          {banner && (
            <p className="notice danger" role="alert">
              <Icon name="alert" size={20} />
              {banner}
            </p>
          )}
          <div key={stepKey} className="wizard-step">
            {views[stepKey]}
          </div>
          {isLast && (
            <div className="wizard-review">
              <h2 className="h3">{b.summary}</h2>
              <dl className="summary-list">
                {summaryRows.map((r) => (
                  <div key={r.k}>
                    <dt className="small muted">{r.label}</dt>
                    <dd>{r.value}</dd>
                    <button type="button" className="text-btn small" onClick={() => goto(STEPS.indexOf(r.k))}>
                      {b.edit}
                    </button>
                  </div>
                ))}
              </dl>
              <Breakdown />
            </div>
          )}
        </section>

        <aside className="wizard-aside" aria-label={b.summary}>
          <div className="summary-card">
            <h2 className="h3">{b.summary}</h2>
            {summaryRows.length ? (
              <dl className="summary-list">
                {summaryRows.map((r) => (
                  <div key={r.k}>
                    <dt className="small muted">{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="small muted">{b.whereTitle}</p>
            )}
            {duration > 0 && (
              <p className="small muted">
                <Icon name="clock" size={16} /> {b.duration}: {formatDuration(duration, lang)}
              </p>
            )}
            <Breakdown />
          </div>
        </aside>
      </div>

      <div className="wizard-bar">
        <div className="container wizard-bar-inner">
          <div className="wizard-total" aria-live="polite">
            {q ? (
              <>
                <span className="small muted">{b.total}</span>
                <strong className="num">{money(q.total)}</strong>
                {duration > 0 && <span className="small muted">{formatDuration(duration, lang)}</span>}
              </>
            ) : (
              <span className="small muted">{fmt(b.stepOf, { n: formatNumber(step + 1, lang), total: formatNumber(STEPS.length, lang) })}</span>
            )}
          </div>
          <button type="button" className={`btn btn-primary btn-lg wizard-next ${isLast ? 'is-shining' : ''}`} onClick={next} disabled={!canContinue || submitting}>
            {submitting && <span className="spinner" />}
            {ctaLabel}
            {!isLast && !submitting && <Icon name="arrow" size={20} className="flip" />}
          </button>
        </div>
      </div>
    </div>
  );
}
