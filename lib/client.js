// Small fetch helpers for client components.
export async function postJson(url, body, method = 'POST') {
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok !== false, status: res.status, ...data };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function getJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok !== false, status: res.status, ...data };
  } catch {
    return { ok: false, error: 'network' };
  }
}
