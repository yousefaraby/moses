import { getDb, updateDb, newId } from '@/lib/db';
import { bookingView, canCustomerChange, setStatus } from '@/lib/bookings';
import { bookingDuration, getSlots, pointsFor } from '@/lib/engine';
import { queueMessages } from '@/lib/notify';
import { json, fail, readJson, originOf, cleanText } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { isValidDate } from '@/lib/time';

async function authorized(booking, token) {
  if (!booking) return false;
  if (token && token === booking.token) return true;
  return isAdmin();
}

export async function GET(request, { params }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get('t');
  const db = await getDb();
  const booking = db.bookings.find((b) => b.id === id);
  if (!(await authorized(booking, token))) return fail('notFound', 404);
  return json({ ok: true, booking: bookingView(db, booking) });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await readJson(request);
  const origin = originOf(request);
  const db0 = await getDb();
  const b0 = db0.bookings.find((b) => b.id === id);
  if (!(await authorized(b0, body.token))) return fail('notFound', 404);

  try {
    const result = await updateDb((db) => {
      const booking = db.bookings.find((b) => b.id === id);
      switch (body.action) {
        case 'cancel': {
          if (!canCustomerChange(db, booking)) return { error: 'tooLate' };
          setStatus(db, booking, 'cancelled', origin);
          return { ok: true };
        }
        case 'reschedule': {
          if (!canCustomerChange(db, booking)) return { error: 'tooLate' };
          if (!isValidDate(body.date)) return { error: 'time' };
          const duration = bookingDuration(db, booking);
          const slot = getSlots(db, { branchId: booking.branchId, date: body.date, duration, mode: booking.mode, excludeId: booking.id }).find((s) => s.time === body.start);
          if (!slot) return { error: 'slotTaken' };
          booking.date = body.date;
          booking.start = body.start;
          booking.bay = slot.bay;
          booking.history.push({ at: new Date().toISOString(), status: 'rescheduled' });
          queueMessages(db, booking, 'instant', origin);
          return { ok: true };
        }
        case 'checkin': {
          if (booking.status !== 'booked') return { error: 'state' };
          setStatus(db, booking, 'checked_in', origin);
          return { ok: true };
        }
        case 'rate': {
          if (booking.status !== 'completed' || booking.rating) return { error: 'state' };
          const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 0)));
          booking.rating = rating;
          booking.reviewText = cleanText(body.text, 600);
          db.reviews.unshift({
            id: newId('r'),
            name: `${booking.customer.name.split(' ')[0]} ${(booking.customer.name.split(' ')[1] || '').slice(0, 1)}.`.trim(),
            rating,
            lang: booking.lang,
            text: booking.reviewText,
            branchId: booking.branchId,
            approved: false,
            date: new Date().toISOString().slice(0, 10),
            bookingId: booking.id,
          });
          const owner = db.customers.find((c) => c.id === booking.customerId);
          const bonus = pointsFor(db, 500);
          if (owner) owner.points = Number(owner.points || 0) + bonus;
          return { ok: true, points: owner ? bonus : 0 };
        }
        default:
          return { error: 'action' };
      }
    });
    if (result.error) return fail(result.error, result.error === 'slotTaken' ? 409 : 400);
    const db = await getDb();
    return json({ ...result, booking: bookingView(db, db.bookings.find((b) => b.id === id)) });
  } catch (err) {
    console.error(err);
    return fail('server', 500);
  }
}
