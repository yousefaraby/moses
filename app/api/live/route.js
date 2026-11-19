import { getDb } from '@/lib/db';
import { bookingDuration, isOpenNow, nextFreeSlot, waitMinutes } from '@/lib/engine';
import { json } from '@/lib/api';
import { zonedNow } from '@/lib/time';

// Live branch status: open/closed, walk-in wait and the next free slot.
export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const db = await getDb();
  const now = zonedNow(db.settings.timezone);
  const sizeId = p.get('size') || 'sedan';
  const packageId = p.get('package') || 'basic';
  const duration = bookingDuration(db, { packageId, sizeId, addonIds: [] });
  const branches = db.branches
    .filter((b) => b.active !== false)
    .map((b) => ({
      id: b.id,
      open: isOpenNow(b, now),
      wait: waitMinutes(db, b.id, now),
      next: nextFreeSlot(db, { branchId: b.id, duration, now }),
    }));
  return json({ ok: true, now, duration, branches });
}
