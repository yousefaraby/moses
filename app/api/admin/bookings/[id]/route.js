import { getDb, updateDb, newId } from '@/lib/db';
import { setStatus } from '@/lib/bookings';
import { bookingDuration, getSlots } from '@/lib/engine';
import { json, fail, readJson, requireAdmin, originOf } from '@/lib/api';
import { isValidDate, isValidTime } from '@/lib/time';

const STATUSES = ['booked', 'checked_in', 'washing', 'ready', 'completed', 'cancelled', 'no_show'];

export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  const origin = originOf(request);
  const result = await updateDb((db) => {
    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) return { error: 'notFound' };
    if (body.status) {
      if (!STATUSES.includes(body.status)) return { error: 'status' };
      setStatus(db, booking, body.status, origin);
    }
    if (body.staffId !== undefined) booking.staffId = body.staffId || null;
    if (body.notes !== undefined) booking.notes = String(body.notes).slice(0, 300);
    if (body.payment === 'paid' && booking.payment.status !== 'paid') {
      const method = ['cash', 'card', 'instapay', 'wallet'].includes(body.method) ? body.method : 'cash';
      booking.payment.status = 'paid';
      booking.payment.method = method === 'instapay' || method === 'wallet' ? 'instapay' : 'center';
      db.payments.push({ id: newId('p'), kind: 'booking', refId: booking.id, amount: booking.price.total, method, status: 'paid', at: new Date().toISOString() });
    }
    if (body.payment === 'refunded' && booking.payment.status === 'paid') {
      booking.payment.status = 'refunded';
      const pay = db.payments.find((p) => p.refId === booking.id && p.status === 'paid');
      if (pay) pay.status = 'refunded';
    }
    if (body.move) {
      const { date, start } = body.move;
      if (!isValidDate(date) || !isValidTime(start)) return { error: 'time' };
      const duration = bookingDuration(db, booking);
      const slots = getSlots(db, { branchId: booking.branchId, date, duration, mode: booking.mode, excludeId: booking.id, now: { date: '1970-01-01', minutes: 0, weekday: 4 } });
      const slot = slots.find((s) => s.time === start);
      if (!slot) return { error: 'slotTaken' };
      booking.date = date;
      booking.start = start;
      booking.bay = slot.bay;
      booking.history.push({ at: new Date().toISOString(), status: 'rescheduled' });
    }
    return { ok: true };
  });
  if (result.error) return fail(result.error, result.error === 'notFound' ? 404 : 400);
  const db = await getDb();
  return json({ ok: true, booking: db.bookings.find((b) => b.id === id) });
}
