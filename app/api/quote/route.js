import { getDb } from '@/lib/db';
import { quote } from '@/lib/engine';
import { json, readJson } from '@/lib/api';
import { currentCustomer, normalizePhone } from '@/lib/auth';

export async function POST(request) {
  const body = await readJson(request);
  const db = await getDb();
  const customer = await currentCustomer();
  const phone = normalizePhone(body.phone);
  const first = !db.bookings.some((b) => (phone && b.customer.phone === phone) || (customer && b.customerId === customer.id));
  const q = quote(db, {
    packageId: body.packageId,
    sizeId: body.sizeId,
    addonIds: Array.isArray(body.addonIds) ? body.addonIds : [],
    mode: body.mode,
    date: body.date,
    start: body.start,
    promoCode: body.promoCode,
    isFirstBooking: first,
  });
  return json({ ok: true, quote: q });
}
