import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { buildSeed } from './seed';

// A tiny JSON-file database. Good for a single-server demo; swap for a real
// database (Postgres, SQLite, Supabase…) behind these same functions later.

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let queue = Promise.resolve();
let cache = null;
let cacheMtime = 0;

async function readFromDisk() {
  try {
    const stat = await fs.stat(DB_FILE);
    if (cache && stat.mtimeMs === cacheMtime) return cache;
    const raw = await fs.readFile(DB_FILE, 'utf8');
    cache = JSON.parse(raw);
    cacheMtime = stat.mtimeMs;
    return cache;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    const seed = buildSeed();
    await writeToDisk(seed);
    return seed;
  }
}

async function writeToDisk(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, DB_FILE);
  const stat = await fs.stat(DB_FILE);
  cache = data;
  cacheMtime = stat.mtimeMs;
}

/** Read the whole database (do not mutate the result). */
export async function getDb() {
  await queue;
  return readFromDisk();
}

/**
 * Serialized read-modify-write. `mutator` receives a deep copy, may mutate it
 * and may return a value; the copy is saved and the value returned.
 */
export function updateDb(mutator) {
  const run = queue.then(async () => {
    const current = await readFromDisk();
    const draft = structuredClone(current);
    const result = await mutator(draft);
    await writeToDisk(draft);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export async function resetDb() {
  return updateDb((draft) => {
    const seed = buildSeed();
    for (const key of Object.keys(draft)) delete draft[key];
    Object.assign(draft, seed);
    return true;
  });
}

export function newId(prefix = '') {
  return `${prefix}${crypto.randomBytes(5).toString('hex')}`;
}

export function newToken() {
  return crypto.randomBytes(18).toString('base64url');
}

export function bookingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MD-';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i += 1) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

/** Data that is safe to send to any visitor (no bookings, customers, secrets). */
export function publicContent(db) {
  const {
    settings,
    home,
    about,
    vehicleSizes,
    services,
    packages,
    addons,
    branches,
    facilities,
    plans,
    faqs,
    reviews,
    gallery,
    jobs,
    legal,
    brief,
  } = db;
  return {
    settings,
    home,
    about,
    vehicleSizes,
    services: services.filter((s) => s.active !== false),
    packages: packages.filter((p) => p.active !== false),
    addons: addons.filter((a) => a.active !== false),
    branches: branches.filter((b) => b.active !== false),
    facilities,
    plans: plans.filter((p) => p.active !== false),
    faqs,
    reviews: reviews.filter((r) => r.approved),
    gallery,
    jobs: jobs.filter((j) => j.active !== false),
    legal,
    brief,
  };
}
