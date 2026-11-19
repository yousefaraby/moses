import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getDb } from './db';

export const ADMIN_COOKIE = 'md_admin';
export const CUSTOMER_COOKIE = 'md_session';

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'moses-admin';
}

async function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const db = await getDb();
  return db.meta.secret;
}

function sign(value, key) {
  return crypto.createHmac('sha256', key).update(value).digest('base64url');
}

export async function makeAdminToken() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload, await secret())}`;
}

export async function isAdmin() {
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const [who, expires, sig] = parts;
  if (who !== 'admin' || Number(expires) < Date.now()) return false;
  const expected = sign(`${who}.${expires}`, await secret());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function passwordMatches(input) {
  const a = Buffer.from(String(input || ''));
  const b = Buffer.from(adminPassword());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** The logged-in customer (or null). */
export async function currentCustomer() {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const id = db.sessions?.[token];
  if (!id) return null;
  return db.customers.find((c) => c.id === id) || null;
}

export function normalizePhone(input) {
  const digits = String(input || '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d+]/g, '');
  let d = digits.replace(/^\+/, '');
  if (d.startsWith('0020')) d = d.slice(2);
  if (d.startsWith('20')) d = `0${d.slice(2)}`;
  if (/^01[0125]\d{8}$/.test(d)) return `+20${d.slice(1)}`;
  return null;
}

export const cookieOptions = (maxAgeSeconds) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: maxAgeSeconds,
});
