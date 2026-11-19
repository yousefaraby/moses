import { cookies } from 'next/headers';
import { updateDb } from '@/lib/db';
import { CUSTOMER_COOKIE } from '@/lib/auth';
import { json } from '@/lib/api';

export async function POST() {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (token) {
    await updateDb((db) => {
      delete db.sessions[token];
    });
  }
  store.delete(CUSTOMER_COOKIE);
  return json({ ok: true });
}
