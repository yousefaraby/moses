import 'server-only';
import { NextResponse } from 'next/server';
import { isAdmin } from './auth';

export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function fail(error, status = 400, extra = {}) {
  return json({ ok: false, error, ...extra }, status);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) return fail('unauthorized', 401);
  return null;
}

export function originOf(request) {
  const url = new URL(request.url);
  return url.origin;
}

export function cleanText(value, max = 500) {
  return String(value ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}
