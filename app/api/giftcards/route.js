import crypto from 'node:crypto';
import { updateDb, newId } from '@/lib/db';
import { json, fail, readJson, cleanText } from '@/lib/api';

export async function POST(request) {
  const body = await readJson(request);
  const amount = Math.round(Number(body.amount));
  if (!amount || amount < 100 || amount > 20000) return fail('amount');
  const buyerName = cleanText(body.buyerName, 80);
  const recipientName = cleanText(body.recipientName, 80);
  if (!buyerName || !recipientName) return fail('name');
  const code = `GIFT-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${amount}`;
  await updateDb((db) => {
    const at = new Date().toISOString();
    db.giftCards.push({ code, amount, balance: amount, buyerName, recipientName, message: cleanText(body.message, 200), createdAt: at });
    db.payments.push({ id: newId('p'), kind: 'giftcard', refId: code, amount, method: 'instapay', status: 'pending', at });
  });
  return json({ ok: true, code });
}
