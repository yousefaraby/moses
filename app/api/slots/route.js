import { getDb } from '@/lib/db';
import { bookingDuration, getSlots } from '@/lib/engine';
import { json, fail } from '@/lib/api';
import { isValidDate } from '@/lib/time';

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const date = p.get('date');
  if (!isValidDate(date)) return fail('date');
  const db = await getDb();
  const addonIds = (p.get('addons') || '').split(',').filter(Boolean);
  const duration = bookingDuration(db, { packageId: p.get('package'), sizeId: p.get('size'), addonIds });
  const slots = getSlots(db, {
    branchId: p.get('branch'),
    date,
    duration,
    mode: p.get('mode') === 'mobile' ? 'mobile' : 'center',
    excludeId: p.get('exclude') || null,
  });
  return json({ ok: true, date, duration, slots });
}
