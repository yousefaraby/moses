// Pure booking logic shared by the server (source of truth) and the client
// (live previews). No I/O here.

import { addDays, toHHMM, toMinutes, weekdayOf, zonedNow, diffDays } from './time';

export const ACTIVE_STATUSES = ['booked', 'checked_in', 'washing', 'ready'];
export const BLOCKING_STATUSES = ['booked', 'checked_in', 'washing', 'ready', 'completed'];
export const STATUS_FLOW = ['booked', 'checked_in', 'washing', 'ready', 'completed'];

export function findById(list, id) {
  return (list || []).find((x) => x.id === id) || null;
}

export function isAddonIncluded(addon, packageId) {
  return (addon.includedIn || []).includes(packageId);
}

export function bookingDuration(db, { packageId, sizeId, addonIds = [] }) {
  const pkg = findById(db.packages, packageId);
  if (!pkg) return 0;
  const base = Number(pkg.durations?.[sizeId] || 0);
  const extra = addonIds.reduce((sum, id) => {
    const a = findById(db.addons, id);
    if (!a || isAddonIncluded(a, packageId)) return sum;
    return sum + Number(a.duration || 0);
  }, 0);
  return base + extra;
}

export function isQuiet(settings, date, start) {
  const q = settings?.booking?.quiet;
  if (!q || !q.percent) return false;
  const day = weekdayOf(date);
  if (!q.days.includes(day)) return false;
  const t = toMinutes(start);
  return t >= toMinutes(q.from) && t < toMinutes(q.to);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/** Resource ids for a branch: bays for center visits, vans for mobile. */
export function resourcesFor(branch, mode) {
  if (mode === 'mobile') {
    return Array.from({ length: Number(branch.mobileUnits || 0) }, (_, i) => `M${i + 1}`);
  }
  return Array.from({ length: Number(branch.bays || 0) }, (_, i) => i + 1);
}

function resourceBusy(db, { branchId, date, resource, start, end, excludeId }) {
  return db.bookings.some(
    (b) =>
      b.id !== excludeId &&
      b.branchId === branchId &&
      b.date === date &&
      String(b.bay) === String(resource) &&
      BLOCKING_STATUSES.includes(b.status) &&
      overlaps(start, end, toMinutes(b.start), toMinutes(b.start) + Number(b.duration))
  );
}

function blockedAt(branch, { date, resource, start, end }) {
  return (branch.blocked || []).some(
    (bl) =>
      bl.date === date &&
      (!bl.bay || String(bl.bay) === String(resource)) &&
      overlaps(start, end, toMinutes(bl.from), toMinutes(bl.to))
  );
}

/**
 * Free start times for a branch/date/duration. Each slot lists the first
 * free bay (or mobile van) so the booking can be pinned to it.
 */
export function getSlots(db, { branchId, date, duration, mode = 'center', excludeId = null, now = zonedNow(db.settings.timezone) }) {
  const branch = findById(db.branches, branchId);
  if (!branch || !duration) return [];
  const hours = branch.hours?.[weekdayOf(date)];
  if (!hours || hours.closed) return [];
  const step = Number(db.settings.booking.slotStep || 30);
  const lead = Number(db.settings.booking.leadMinutes || 0);
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const days = diffDays(date, now.date);
  if (days < 0 || days > Number(db.settings.booking.maxDaysAhead || 30)) return [];
  const resources = resourcesFor(branch, mode);
  const slots = [];
  for (let t = open; t + duration <= close; t += step) {
    if (days === 0 && t < now.minutes + lead) continue;
    const free = resources.filter(
      (r) =>
        !blockedAt(branch, { date, resource: r, start: t, end: t + duration }) &&
        !resourceBusy(db, { branchId, date, resource: r, start: t, end: t + duration, excludeId })
    );
    if (free.length) {
      const time = toHHMM(t);
      slots.push({ time, bay: free[0], free: free.length, quiet: isQuiet(db.settings, date, time) });
    }
  }
  return slots;
}

/** The next free slot from now, scanning a few days ahead. */
export function nextFreeSlot(db, { branchId, duration, mode = 'center', now = zonedNow(db.settings.timezone), days = 7 }) {
  for (let i = 0; i < days; i += 1) {
    const date = addDays(now.date, i);
    const slots = getSlots(db, { branchId, date, duration, mode, now });
    if (slots.length) return { date, ...slots[0] };
  }
  return null;
}

/** Live wait estimate in minutes for a walk-in right now. */
export function waitMinutes(db, branchId, now = zonedNow(db.settings.timezone)) {
  const branch = findById(db.branches, branchId);
  if (!branch) return null;
  if (branch.waitOverride !== null && branch.waitOverride !== undefined && branch.waitOverride !== '') {
    return Number(branch.waitOverride);
  }
  const hours = branch.hours?.[now.weekday];
  if (!hours || hours.closed) return null;
  if (now.minutes < toMinutes(hours.open) || now.minutes >= toMinutes(hours.close)) return null;
  const bays = resourcesFor(branch, 'center');
  const freeAt = bays.map((bay) => {
    let t = now.minutes;
    const todays = db.bookings
      .filter((b) => b.branchId === branchId && b.date === now.date && String(b.bay) === String(bay) && ACTIVE_STATUSES.includes(b.status))
      .map((b) => [toMinutes(b.start), toMinutes(b.start) + Number(b.duration)])
      .sort((a, b) => a[0] - b[0]);
    for (const [s, e] of todays) {
      if (s <= t + 20 && e > t) t = e;
    }
    return t - now.minutes;
  });
  return Math.max(0, Math.min(...freeAt));
}

export function isOpenNow(branch, now) {
  const hours = branch.hours?.[now.weekday];
  if (!hours || hours.closed) return false;
  return now.minutes >= toMinutes(hours.open) && now.minutes < toMinutes(hours.close);
}

/**
 * Price breakdown. Quiet-hour discount applies automatically; a promo code or
 * gift card replaces it only when it is worth more.
 */
export function quote(db, { packageId, sizeId, addonIds = [], mode = 'center', date, start, promoCode = '', isFirstBooking = false }) {
  const pkg = findById(db.packages, packageId);
  const items = [];
  if (pkg && pkg.prices?.[sizeId] !== undefined) {
    items.push({ kind: 'package', id: pkg.id, name: pkg.name, amount: Number(pkg.prices[sizeId]) });
  }
  for (const id of addonIds) {
    const a = findById(db.addons, id);
    if (!a || (pkg && isAddonIncluded(a, pkg.id))) continue;
    items.push({ kind: 'addon', id: a.id, name: a.name, amount: Number(a.price) });
  }
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const mobileFee = mode === 'mobile' ? Number(db.settings.booking.mobileFee || 0) : 0;

  let discount = 0;
  let discountLabel = null;
  let promo = null;
  let promoError = null;

  if (date && start && isQuiet(db.settings, date, start)) {
    const pct = Number(db.settings.booking.quiet.percent);
    discount = Math.round((subtotal * pct) / 100);
    discountLabel = { kind: 'quiet', percent: pct };
  }

  const code = String(promoCode || '').trim().toUpperCase();
  if (code) {
    const p = (db.promos || []).find((x) => x.code.toUpperCase() === code);
    const gift = (db.giftCards || []).find((g) => g.code.toUpperCase() === code);
    if (p) {
      if (!p.active) promoError = 'inactive';
      else if (p.expires && date && date > p.expires) promoError = 'expired';
      else if (p.firstBookingOnly && !isFirstBooking) promoError = 'firstOnly';
      else {
        const value = p.type === 'percent' ? Math.round((subtotal * Number(p.value)) / 100) : Number(p.value);
        promo = { code: p.code, type: p.type, value: p.value };
        if (value >= discount) {
          discount = value;
          discountLabel = { kind: 'promo', code: p.code };
        }
      }
    } else if (gift) {
      if (gift.balance <= 0) promoError = 'empty';
      else {
        const value = Math.min(Number(gift.balance), subtotal + mobileFee);
        promo = { code: gift.code, type: 'gift', value };
        if (value >= discount) {
          discount = value;
          discountLabel = { kind: 'gift', code: gift.code };
        }
      }
    } else {
      promoError = 'notFound';
    }
  }

  discount = Math.min(discount, subtotal + mobileFee);
  const total = Math.max(0, subtotal + mobileFee - discount);
  return { items, subtotal, mobileFee, discount, discountLabel, promo, promoError, total };
}

export function fillTemplate(body, vars) {
  return String(body || '').replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

export function pointsFor(db, amount) {
  const per100 = Number(db.settings.loyalty?.pointsPer100 || 0);
  return Math.floor((Number(amount) / 100) * per100);
}
