import { cookies } from 'next/headers';
import { ADMIN_COOKIE, cookieOptions, makeAdminToken, passwordMatches } from '@/lib/auth';
import { json, fail, readJson } from '@/lib/api';

export async function POST(request) {
  const { password } = await readJson(request);
  if (!passwordMatches(password)) return fail('wrong', 401);
  const store = await cookies();
  store.set(ADMIN_COOKIE, await makeAdminToken(), cookieOptions(60 * 60 * 12));
  return json({ ok: true });
}
