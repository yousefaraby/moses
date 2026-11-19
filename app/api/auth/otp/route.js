import crypto from 'node:crypto';
import { updateDb } from '@/lib/db';
import { normalizePhone } from '@/lib/auth';
import { json, fail, readJson } from '@/lib/api';

// Sends a one-time code. In this demo the code is returned in the response
// and shown on screen; connect an SMS provider here for production.
export async function POST(request) {
  const body = await readJson(request);
  const phone = normalizePhone(body.phone);
  if (!phone) return fail('phone');
  const code = String(crypto.randomInt(1000, 10000));
  const exists = await updateDb((db) => {
    db.otp = db.otp || {};
    db.otp[phone] = { code, expires: Date.now() + 10 * 60 * 1000, tries: 0 };
    return db.customers.some((c) => c.phone === phone);
  });
  return json({ ok: true, phone, exists, demoCode: code });
}
