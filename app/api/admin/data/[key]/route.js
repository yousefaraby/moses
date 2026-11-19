import { updateDb } from '@/lib/db';
import { json, fail, readJson, requireAdmin } from '@/lib/api';

// Every editable part of the site. The admin sends the whole value back.
const EDITABLE = {
  settings: 'object',
  home: 'object',
  about: 'object',
  brief: 'object',
  vehicleSizes: 'array',
  services: 'array',
  packages: 'array',
  addons: 'array',
  facilities: 'array',
  branches: 'array',
  plans: 'array',
  promos: 'array',
  giftCards: 'array',
  faqs: 'array',
  reviews: 'array',
  gallery: 'array',
  jobs: 'array',
  legal: 'array',
  staff: 'array',
  templates: 'array',
  customers: 'array',
  subscriptions: 'array',
  payments: 'array',
  messages: 'array',
};

export async function PUT(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { key } = await params;
  const shape = EDITABLE[key];
  if (!shape) return fail('key', 404);
  const { value } = await readJson(request);
  const valid = shape === 'array' ? Array.isArray(value) : value && typeof value === 'object' && !Array.isArray(value);
  if (!valid) return fail('shape');
  if (shape === 'array' && value.some((item) => !item || typeof item !== 'object')) return fail('shape');
  await updateDb((db) => {
    db[key] = value;
  });
  return json({ ok: true });
}
