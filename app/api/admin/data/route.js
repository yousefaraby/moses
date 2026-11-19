import { getDb } from '@/lib/db';
import { json, requireAdmin } from '@/lib/api';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  const { meta, sessions, otp, ...rest } = db;
  return json({ ok: true, data: rest });
}
