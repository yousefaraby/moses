import { updateDb } from '@/lib/db';
import { createBooking, BookingError } from '@/lib/bookings';
import { json, fail, readJson, originOf } from '@/lib/api';
import { currentCustomer } from '@/lib/auth';

export async function POST(request) {
  const body = await readJson(request);
  const customer = await currentCustomer();
  try {
    const booking = await updateDb((db) => createBooking(db, body, { customer, origin: originOf(request) }));
    return json({ ok: true, id: booking.id, token: booking.token });
  } catch (err) {
    if (err instanceof BookingError) return fail(err.code, err.status);
    console.error(err);
    return fail('server', 500);
  }
}
