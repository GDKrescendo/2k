import { NextResponse } from 'next/server';
import { API_KEY, API_BASE } from '../../lib/api-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = `${API_BASE}/players/search?q=Tatum&limit=5`;

  try {
    const res = await fetch(url, { headers: { 'X-API-Key': API_KEY } });
    const text = await res.text();
    let json: unknown = null;
    try { json = JSON.parse(text); } catch {}

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      url,
      envKeySet: !!process.env.NBA2K_API_KEY,
      envBaseSet: !!process.env.NBA2K_API_BASE,
      isArray: Array.isArray(json),
      topLevelKeys: json && typeof json === 'object' && !Array.isArray(json) ? Object.keys(json as object) : null,
      length: Array.isArray(json) ? (json as unknown[]).length : null,
      firstItem: Array.isArray(json) ? (json as unknown[])[0] : json,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err), url });
  }
}
