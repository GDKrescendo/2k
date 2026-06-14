import { NextRequest, NextResponse } from 'next/server';
import { enrichPlayer } from '../../lib/scoring';
import type { Player } from '../../types';

const WNBA = ['liberty','fever','sky','sun','mystics','sparks','storm','aces','dream','lynx','mercury','wings','valkyries'];

function isWNBA(p: Player): boolean {
  const t = (p.team ?? p.teamName ?? p.team_name ?? '').toLowerCase();
  return WNBA.some((w) => t.includes(w));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 });

  const url = `${process.env.NBA2K_API_BASE}/players/search?q=${encodeURIComponent(q)}&limit=30`;
  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': process.env.NBA2K_API_KEY! },
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ error: 'Upstream error' }, { status: res.status });

    const data = await res.json();
    const players: Player[] = Array.isArray(data)
      ? data
      : (data.players ?? data.results ?? data.data ?? data.items ?? []);
    const filtered = players
      .filter((p) => !isWNBA(p))
      .map((p) => enrichPlayer(p, p.teamType ?? 'curr'))
      .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('[search]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
