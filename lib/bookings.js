import 'server-only';
import { bookingCode, newId, newToken } from './db';
import { bookingDuration, findById, getSlots, pointsFor, quote, ACTIVE_STATUSES } from './engine';
import { queueMessages } from './notify';
import { normalizePhone } from './auth';
import { isValidDate, isValidTime, zonedNow, toMinutes, diffDays } from './time';
import { cleanText } from './api';

export class BookingError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export function validateSelection(db, input) {
  const branch = findById(db.branches, input.branchId);
  if (!branch || branch.active === false) throw new BookingError('branch');
  const mode = input.mode === 'mobile' ? 'mobile' : 'center';
  // Mobile (at-home) washing is switched off for this business.
  if (mode === 'mobile') throw new BookingError('mobile');
  if (!db.vehicleSizes.some((v) => v.id === input.sizeId)) throw new BookingError('size');
  const pkg = findById(db.packages, input.packageId);
  if (!pkg || pkg.active === false || pkg.prices?.[input.sizeId] === undefined) throw new BookingError('package');
  const addonIds = Array.isArray(input.addonIds)
    ? [...new Set(input.addonIds)].filter((id) => {
        const a = findById(db.addons, id);
        return a && a.active !== false;
      })
    : [];
  if (!isValidDate(input.date) || !isValidTime(input.start)) throw new BookingError('time');
  return { branch, mode, pkg, addonIds };
}

function isFirstBooking(db, phone, customerId) {
  return !db.bookings.some((b) => (phone && b.customer.phone === phone) || (customerId && b.customerId === customerId));
}

export function createBooking(db, input, { customer, origin }) {
  const { branch, mode, addonIds } = validateSelection(db, input);
  const name = cleanText(input.name, 80);
  const phone = normalizePhone(input.phone);
  const plate = cleanText(input.plate, 30);
  const address = cleanText(input.address, 240);
  if (!name) throw new BookingError('name');
  if (!phone) throw new BookingError('phone');
  if (!plate) throw new BookingError('plate');
  if (mode === 'mobile' && !address) throw new BookingError('address');

  const duration = bookingDuration(db, { packageId: input.packageId, sizeId: input.sizeId, addonIds });
  const slots = getSlots(db, { branchId: branch.id, date: input.date, duration, mode });
  const slot = slots.find((s) => s.time === input.start);
  if (!slot) throw new BookingError('slotTaken', 409);

  const first = isFirstBooking(db, phone, customer?.id);
  const q = quote(db, {
    packageId: input.packageId,
    sizeId: input.sizeId,
    addonIds,
    mode,
    date: input.date,
    start: input.start,
    promoCode: input.promoCode,
    isFirstBooking: first,
  });

  // InstaPay / wallet transfers wait for staff confirmation in Admin.
  const method = input.payMethod === 'instapay' ? 'instapay' : 'center';
  const now = new Date().toISOString();
  const booking = {
    id: newId('b'),
    code: bookingCode(),
    token: newToken(),
    branchId: branch.id,
    mode,
    address: mode === 'mobile' ? address : '',
    bay: slot.bay,
    sizeId: input.sizeId,
    packageId: input.packageId,
    addonIds,
    date: input.date,
    start: input.start,
    duration,
    price: {
      subtotal: q.subtotal,
      discount: q.discount,
      discountLabel: q.discountLabel,
      mobileFee: q.mobileFee,
      total: q.total,
      items: q.items.map((i) => ({ kind: i.kind, id: i.id, amount: i.amount })),
    },
    promo: q.discountLabel && q.discountLabel.kind !== 'quiet' ? q.discountLabel.code : null,
    payment: {
      method,
      status: q.total === 0 ? 'paid' : method === 'instapay' ? 'pending' : 'unpaid',
      reference: method === 'instapay' ? cleanText(input.payRef, 60) : '',
    },
    customer: { name, phone, plate, email: cleanText(input.email, 120) },
    customerId: customer?.id || db.customers.find((c) => c.phone === phone)?.id || null,
    notes: cleanText(input.notes, 300),
    staffId: null,
    status: 'booked',
    history: [{ at: now, status: 'booked' }],
    rating: null,
    reviewText: '',
    lang: input.lang === 'en' ? 'en' : 'ar',
    createdAt: now,
  };

  if (q.discountLabel?.kind === 'promo') {
    const p = db.promos.find((x) => x.code === q.discountLabel.code);
    if (p) p.uses = Number(p.uses || 0) + 1;
    if (p?.singleUse) p.active = false;
  }
  if (q.discountLabel?.kind === 'gift') {
    const g = db.giftCards.find((x) => x.code === q.discountLabel.code);
    if (g) g.balance = Math.max(0, Number(g.balance) - q.discount);
  }

  // Save the car on the customer's account if it is new.
  const owner = db.customers.find((c) => c.id === booking.customerId);
  if (owner && !owner.cars.some((c) => c.plate === plate)) {
    owner.cars.push({ id: newId('car'), label: cleanText(input.carLabel, 60), plate, sizeId: input.sizeId });
  }

  db.bookings.push(booking);
  queueMessages(db, booking, 'instant', origin);
  return booking;
}

export function canCustomerChange(db, booking) {
  if (!['booked'].includes(booking.status)) return false;
  const now = zonedNow(db.settings.timezone);
  const days = diffDays(booking.date, now.date);
  const minutesUntil = days * 1440 + toMinutes(booking.start) - now.minutes;
  return minutesUntil >= Number(db.settings.booking.cancelHours || 0) * 60;
}

export function setStatus(db, booking, status, origin) {
  if (booking.status === status) return;
  booking.status = status;
  booking.history.push({ at: new Date().toISOString(), status });
  if (status === 'ready') queueMessages(db, booking, 'status:ready', origin);
  if (status === 'completed') {
    queueMessages(db, booking, 'status:completed', origin);
    const owner = db.customers.find((c) => c.id === booking.customerId);
    if (owner && !booking.pointsAwarded) {
      owner.points = Number(owner.points || 0) + pointsFor(db, booking.price.total);
      booking.pointsAwarded = true;
    }
    if (booking.payment.status === 'unpaid' || booking.payment.status === 'pending') {
      const method = booking.payment.method === 'instapay' ? 'instapay' : 'cash';
      booking.payment.status = 'paid';
      db.payments.push({ id: newId('p'), kind: 'booking', refId: booking.id, amount: booking.price.total, method, status: 'paid', at: new Date().toISOString() });
    }
  }
  if (status === 'cancelled') {
    queueMessages(db, booking, 'status:cancelled', origin);
    if (booking.payment.status === 'paid') {
      booking.payment.status = 'refunded';
      const pay = db.payments.find((p) => p.refId === booking.id && p.status === 'paid');
      if (pay) pay.status = 'refunded';
    }
  }
}

/** Public view of a booking for the customer page (no other customers' data). */
export function bookingView(db, booking) {
  const branch = findById(db.branches, booking.branchId);
  return {
    ...booking,
    token: undefined,
    canChange: canCustomerChange(db, booking),
    isActive: ACTIVE_STATUSES.includes(booking.status),
    branch: branch ? { id: branch.id, name: branch.name, address: branch.address, mapUrl: branch.mapUrl, phone: branch.phone } : null,
  };
}
