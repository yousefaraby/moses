import { resetDb } from '@/lib/db';
import { json, requireAdmin } from '@/lib/api';

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  await resetDb();
  return json({ ok: true });
}
