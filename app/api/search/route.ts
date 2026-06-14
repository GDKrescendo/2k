import { NextRequest, NextResponse } from 'next/server';

const WNBA_TEAMS = [
  'liberty', 'fever', 'sky', 'sun', 'mystics', 'sparks',
  'storm', 'aces', 'dream', 'lynx', 'mercury', 'wings', 'valkyries',
];

function isWNBA(player: { team?: string; teamName?: string; team_name?: string }): boolean {
  const teamRaw = player.team ?? player.teamName ?? player.team_name ?? '';
  const team = teamRaw.toLowerCase();
  return WNBA_TEAMS.some((w) => team.includes(w));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.trim().length === 0) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const url = `${process.env.NBA2K_API_BASE}/players/search?q=${encodeURIComponent(q)}&limit=20`;

  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': process.env.NBA2K_API_KEY! },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream API error', status: res.status }, { status: res.status });
    }

    const data = await res.json();
    const players = Array.isArray(data) ? data : (data.players ?? data.results ?? []);
    const filtered = players.filter((p: Parameters<typeof isWNBA>[0]) => !isWNBA(p));

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('[search] fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
