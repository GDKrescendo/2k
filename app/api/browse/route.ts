import { NextRequest, NextResponse } from 'next/server';
import { enrichPlayer } from '../../lib/scoring';
import type { Player } from '../../types';

const WNBA = ['liberty','fever','sky','sun','mystics','sparks','storm','aces','dream','lynx','mercury','wings','valkyries'];

function isWNBA(p: Player): boolean {
  const t = (p.team ?? p.teamName ?? p.team_name ?? '').toLowerCase();
  return WNBA.some((w) => t.includes(w));
}

async function fetchOne(teamType: string, position: string, minRating: string, maxRating: string, limit: string): Promise<Player[]> {
  const params = new URLSearchParams({ teamType, limit });
  if (position && position !== 'ALL') params.set('position', position);
  if (minRating) params.set('minRating', minRating);
  if (maxRating) params.set('maxRating', maxRating);

  try {
    const res = await fetch(`${process.env.NBA2K_API_BASE}/players?${params}`, {
      headers: { 'X-API-Key': process.env.NBA2K_API_KEY! },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const players: Player[] = Array.isArray(data)
      ? data
      : (data.players ?? data.results ?? data.data ?? data.items ?? []);
    return players.filter((p) => !isWNBA(p)).map((p) => enrichPlayer(p, teamType));
  } catch {
    return [];
  }
}

function dedup(players: Player[]): Player[] {
  const seen = new Set<string>();
  return players.filter((p) => {
    const k = `${p.slug ?? p.id}_${p.teamType}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const teamType = sp.get('teamType') ?? 'all';
  const minRating = sp.get('minRating') ?? '60';
  const maxRating = sp.get('maxRating') ?? '99';
  const position = sp.get('position') ?? 'ALL';
  const limit = sp.get('limit') ?? '100';
  const sortBy = sp.get('sortBy') ?? 'vs'; // vs | def | shoot | ovr

  try {
    let players: Player[];

    if (teamType === 'all') {
      const [curr, allt, cls] = await Promise.all([
        fetchOne('curr', position, minRating, maxRating, limit),
        fetchOne('allt', position, minRating, maxRating, limit),
        fetchOne('class', position, minRating, maxRating, limit),
      ]);
      players = dedup([...curr, ...allt, ...cls]);
    } else if (teamType === 'alltime') {
      const [allt, cls] = await Promise.all([
        fetchOne('allt', position, minRating, maxRating, limit),
        fetchOne('class', position, minRating, maxRating, limit),
      ]);
      players = dedup([...allt, ...cls]);
    } else {
      players = await fetchOne(teamType, position, minRating, maxRating, limit);
    }

    if (sortBy === 'def') {
      players.sort((a, b) => {
        const defA = (['perimeterDefense','steal','block','interiorDefense'] as const)
          .reduce((s, k) => s + (a[k] ?? 0), 0) / 4;
        const defB = (['perimeterDefense','steal','block','interiorDefense'] as const)
          .reduce((s, k) => s + (b[k] ?? 0), 0) / 4;
        return defB - defA;
      });
    } else if (sortBy === 'shoot') {
      players.sort((a, b) => {
        const sA = (['threePointShot','midRangeShot','shotIQ'] as const)
          .reduce((s, k) => s + (a[k] ?? 0), 0) / 3;
        const sB = (['threePointShot','midRangeShot','shotIQ'] as const)
          .reduce((s, k) => s + (b[k] ?? 0), 0) / 3;
        return sB - sA;
      });
    } else if (sortBy === 'ovr') {
      players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
    } else {
      players.sort((a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0));
    }

    return NextResponse.json(players);
  } catch (err) {
    console.error('[browse]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
