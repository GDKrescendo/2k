import { NextRequest, NextResponse } from 'next/server';
import { enrichPlayer } from '../../lib/scoring';
import { API_KEY, API_BASE } from '../../lib/api-config';
import type { Player } from '../../types';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const teamType = req.nextUrl.searchParams.get('teamType') ?? 'curr';
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const url = `${API_BASE}/players/slug/${encodeURIComponent(slug)}?teamType=${teamType}`;
  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': API_KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ error: 'Upstream error' }, { status: res.status });

    const data: Player = await res.json();
    return NextResponse.json(enrichPlayer(data, teamType));
  } catch (err) {
    console.error('[player]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
