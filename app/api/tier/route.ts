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
  const { searchParams } = req.nextUrl;
  const position = searchParams.get('position') ?? '';
  const min = searchParams.get('min') ?? '60';
  const max = searchParams.get('max') ?? '99';
  const teamType = searchParams.get('teamType') ?? 'curr';

  const params = new URLSearchParams({
    teamType,
    limit: '100',
    ...(position && { position }),
    minRating: min,
    maxRating: max,
  });

  const url = `${process.env.NBA2K_API_BASE}/players?${params}`;

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
    console.error('[tier] fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
