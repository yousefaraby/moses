import { cookies } from 'next/headers';
import { updateDb, newId, newToken } from '@/lib/db';
import { CUSTOMER_COOKIE, cookieOptions, normalizePhone } from '@/lib/auth';
import { json, fail, readJson, cleanText } from '@/lib/api';

export async function POST(request) {
  const body = await readJson(request);
  const phone = normalizePhone(body.phone);
  if (!phone) return fail('phone');
  const result = await updateDb((db) => {
    const entry = db.otp?.[phone];
    if (!entry || entry.expires < Date.now() || entry.tries >= 5) return { error: 'code' };
    if (String(body.code).trim() !== entry.code) {
      entry.tries += 1;
      return { error: 'code' };
    }
    delete db.otp[phone];
    let customer = db.customers.find((c) => c.phone === phone);
    if (!customer) {
      const name = cleanText(body.name, 80);
      if (!name) return { error: 'name' };
      customer = { id: newId('c'), name, phone, email: '', cars: [], points: 0, notes: '', createdAt: new Date().toISOString() };
      db.customers.push(customer);
    }
    // Link earlier guest bookings made with this phone number.
    for (const b of db.bookings) if (!b.customerId && b.customer.phone === phone) b.customerId = customer.id;
    const token = newToken();
    db.sessions[token] = customer.id;
    return { token, name: customer.name };
  });
  if (result.error) return fail(result.error);
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, result.token, cookieOptions(60 * 60 * 24 * 60));
  return json({ ok: true, name: result.name });
}
