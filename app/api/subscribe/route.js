import { updateDb, newId } from '@/lib/db';
import { currentCustomer } from '@/lib/auth';
import { json, fail, readJson } from '@/lib/api';

export async function POST(request) {
  const customer = await currentCustomer();
  if (!customer) return fail('login', 401);
  const { planId } = await readJson(request);
  const result = await updateDb((db) => {
    const plan = db.plans.find((p) => p.id === planId && p.active !== false);
    if (!plan) return { error: 'plan' };
    const now = new Date().toISOString();
    const sub = { id: newId('sub'), customerId: customer.id, planId: plan.id, startedAt: now.slice(0, 10), status: 'active', washesLeft: plan.washes ?? null };
    db.subscriptions.push(sub);
    db.payments.push({ id: newId('p'), kind: 'subscription', refId: sub.id, amount: Number(plan.price), method: 'instapay', status: 'pending', at: now });
    return { ok: true, subscription: sub };
  });
  if (result.error) return fail(result.error);
  return json(result);
}
