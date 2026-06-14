import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.NBA2K_API_BASE;
  const key = process.env.NBA2K_API_KEY;

  if (!base || !key) {
    return NextResponse.json({
      error: 'Missing env vars',
      hasBase: !!base,
      hasKey: !!key,
    });
  }

  const url = `${base}/players/search?q=Tatum&limit=5`;

  try {
    const res = await fetch(url, { headers: { 'X-API-Key': key } });
    const text = await res.text();
    let json: unknown = null;
    try { json = JSON.parse(text); } catch {}

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      url,
      keyPrefix: key.slice(0, 6) + '...',
      isArray: Array.isArray(json),
      topLevelKeys: json && typeof json === 'object' && !Array.isArray(json) ? Object.keys(json as object) : null,
      length: Array.isArray(json) ? (json as unknown[]).length : null,
      firstItem: Array.isArray(json) ? (json as unknown[])[0] : json,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err), url });
  }
}
