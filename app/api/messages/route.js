import { updateDb, newId } from '@/lib/db';
import { json, fail, readJson, cleanText } from '@/lib/api';

const KINDS = ['contact', 'business', 'fleet', 'career', 'newsletter'];

export async function POST(request) {
  const body = await readJson(request);
  const kind = KINDS.includes(body.kind) ? body.kind : 'contact';
  const name = cleanText(body.name, 80);
  const phone = cleanText(body.phone, 30);
  const email = cleanText(body.email, 120);
  const text = cleanText(body.text, 2000);
  if (kind === 'newsletter') {
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('email');
  } else if (!name || (!phone && !email)) {
    return fail('fields');
  }
  await updateDb((db) => {
    db.messages.unshift({
      id: newId('m'),
      kind,
      name,
      company: cleanText(body.company, 120),
      phone,
      email,
      text: [text, body.cars ? `Cars: ${cleanText(body.cars, 10)}` : '', body.role ? `Role: ${cleanText(body.role, 80)}` : '', body.link ? `Link: ${cleanText(body.link, 300)}` : '']
        .filter(Boolean)
        .join('\n'),
      createdAt: new Date().toISOString(),
      read: false,
    });
  });
  return json({ ok: true });
}
