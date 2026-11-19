import 'server-only';
import { getDb } from './db';
import { zonedNow } from './time';

/** Lookups every admin editor needs for its dropdowns. */
export async function adminContext() {
  const db = await getDb();
  const now = zonedNow(db.settings.timezone);
  return {
    db,
    now,
    ctx: {
      vehicleSizes: db.vehicleSizes,
      packages: db.packages.map((p) => ({ id: p.id, name: p.name })),
      addons: db.addons.map((a) => ({ id: a.id, name: a.name })),
      services: db.services.map((s) => ({ id: s.id, name: s.name })),
      branches: db.branches.map((b) => ({ id: b.id, name: b.name })),
      facilities: db.facilities.map((f) => ({ id: f.id, name: f.name })),
      today: now.date,
    },
  };
}
