import { getDb, updateDb, newId } from '@/lib/db';
import { currentCustomer } from '@/lib/auth';
import { bookingView } from '@/lib/bookings';
import { json, fail, readJson, cleanText } from '@/lib/api';

async function snapshot(customerId) {
  const db = await getDb();
  const customer = db.customers.find((c) => c.id === customerId);
  const bookings = db.bookings
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => (a.date + a.start < b.date + b.start ? 1 : -1))
    .map((b) => ({ ...bookingView(db, b), token: b.token }));
  const subscriptions = db.subscriptions.filter((s) => s.customerId === customerId);
  const subIds = subscriptions.map((s) => s.id);
  const bookingIds = bookings.map((b) => b.id);
  const payments = db.payments
    .filter((p) => (p.kind === 'booking' && bookingIds.includes(p.refId)) || (p.kind === 'subscription' && subIds.includes(p.refId)))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  const rewards = (db.promos || []).filter((p) => p.customerId === customerId && p.active);
  return { customer, bookings, subscriptions, payments, rewards };
}

export async function GET() {
  const customer = await currentCustomer();
  if (!customer) return json({ ok: true, customer: null });
  return json({ ok: true, ...(await snapshot(customer.id)) });
}

export async function PATCH(request) {
  const customer = await currentCustomer();
  if (!customer) return fail('unauthorized', 401);
  const body = await readJson(request);
  const result = await updateDb((db) => {
    const me = db.customers.find((c) => c.id === customer.id);
    switch (body.action) {
      case 'addCar': {
        const plate = cleanText(body.plate, 30);
        if (!plate || !db.vehicleSizes.some((v) => v.id === body.sizeId)) return { error: 'car' };
        me.cars.push({ id: newId('car'), label: cleanText(body.label, 60), plate, sizeId: body.sizeId });
        return { ok: true };
      }
      case 'removeCar':
        me.cars = me.cars.filter((c) => c.id !== body.carId);
        return { ok: true };
      case 'profile':
        if (body.name) me.name = cleanText(body.name, 80);
        if (body.email !== undefined) me.email = cleanText(body.email, 120);
        return { ok: true };
      case 'redeem': {
        const cost = Number(db.settings.loyalty.redeemPoints || 0);
        if (!cost || me.points < cost) return { error: 'points' };
        me.points -= cost;
        const pkg = db.packages.find((p) => p.id === db.settings.loyalty.rewardPackageId);
        const code = `REWARD-${newId().slice(0, 6).toUpperCase()}`;
        db.promos.push({
          code,
          type: 'fixed',
          value: Math.max(...Object.values(pkg?.prices || { x: 0 })),
          description: { ar: 'مكافأة نقاط الولاء', en: 'Loyalty reward' },
          firstBookingOnly: false,
          expires: null,
          active: true,
          singleUse: true,
          customerId: me.id,
          uses: 0,
        });
        return { ok: true, code };
      }
      default:
        return { error: 'action' };
    }
  });
  if (result.error) return fail(result.error);
  return json({ ...result, ...(await snapshot(customer.id)) });
}
