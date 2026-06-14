import type { Player } from '../types';

export type RoleKey = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export const ROLE_WEIGHTS: Record<RoleKey, Record<string, number>> = {
  PG: { ballHandle: 0.15, passIQ: 0.12, passVision: 0.10, perimeterDefense: 0.12, steal: 0.12, speed: 0.10, threePointShot: 0.10, speedWithBall: 0.09, offensiveConsistency: 0.05, shotIQ: 0.05 },
  SG: { perimeterDefense: 0.14, steal: 0.13, threePointShot: 0.13, midRangeShot: 0.10, drivingDunk: 0.10, speed: 0.10, ballHandle: 0.08, offensiveConsistency: 0.07, shotIQ: 0.08, passIQ: 0.07 },
  SF: { perimeterDefense: 0.14, steal: 0.12, threePointShot: 0.12, drivingDunk: 0.11, strength: 0.09, speed: 0.10, midRangeShot: 0.09, offensiveConsistency: 0.08, shotIQ: 0.08, block: 0.07 },
  PF: { interiorDefense: 0.15, block: 0.13, offensiveRebound: 0.12, defensiveRebound: 0.12, strength: 0.11, postHook: 0.09, drivingDunk: 0.09, perimeterDefense: 0.08, steal: 0.06, speed: 0.05 },
  C:  { interiorDefense: 0.17, block: 0.15, offensiveRebound: 0.13, defensiveRebound: 0.13, strength: 0.12, standingDunk: 0.10, postHook: 0.08, speed: 0.05, steal: 0.04, passIQ: 0.03 },
};

export function getTierCost(overall: number): number {
  if (overall >= 95) return 30;
  if (overall >= 90) return 22;
  if (overall >= 85) return 14;
  if (overall >= 80) return 7;
  return 3;
}

export function getTierLabel(overall: number): string {
  if (overall >= 95) return 'T1';
  if (overall >= 90) return 'T2';
  if (overall >= 85) return 'T3';
  if (overall >= 80) return 'T4';
  return 'T5';
}

export function getCapCost(player: Player): number {
  const ovr = player.overall ?? player.ovr ?? player.rating ?? 0;
  const base = getTierCost(ovr);
  const atTax = player.teamType === 'allt' || player.teamType === 'class' ? 5 : 0;
  return base + atTax;
}

export function getPrimaryPosition(player: Player): RoleKey {
  const pos = player.positions?.[0] ?? player.position ?? 'SF';
  return (ROLE_WEIGHTS[pos as RoleKey] ? pos : 'SF') as RoleKey;
}

export function getAttr(player: Player, attr: string): number | null {
  const direct = (player as Record<string, unknown>)[attr];
  if (typeof direct === 'number') return direct;
  if (player.attributes && typeof player.attributes[attr] === 'number') return player.attributes[attr];
  return null;
}

export function getWeightedScore(player: Player): number {
  const weights = ROLE_WEIGHTS[getPrimaryPosition(player)];
  let score = 0;
  let totalWeight = 0;
  for (const [attr, weight] of Object.entries(weights)) {
    const val = getAttr(player, attr);
    if (val != null) {
      score += val * weight;
      totalWeight += weight;
    }
  }
  return totalWeight > 0 ? score / totalWeight : 0;
}

export function getValueScore(player: Player): number {
  const ws = getWeightedScore(player);
  const cost = getCapCost(player);
  if (cost === 0) return 0;
  return parseFloat((ws / cost).toFixed(2));
}

export type ValueGrade = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

export function getValueGrade(vs: number): ValueGrade {
  if (vs >= 12) return 'S+';
  if (vs >= 10) return 'S';
  if (vs >= 7) return 'A';
  if (vs >= 5) return 'B';
  if (vs >= 3) return 'C';
  return 'D';
}

export const GRADE_COLORS: Record<ValueGrade, string> = {
  'S+': '#f5c518',
  'S': '#a855f7',
  'A': '#22c55e',
  'B': '#3b82f6',
  'C': '#f97316',
  'D': '#ef4444',
};

export function getSimilarity(playerA: Player, playerB: Player): number {
  const weights = ROLE_WEIGHTS[getPrimaryPosition(playerA)];
  let numerator = 0;
  let denominator = 0;
  for (const [attr, weight] of Object.entries(weights)) {
    const a = getAttr(playerA, attr);
    const b = getAttr(playerB, attr);
    if (a != null && b != null) {
      const diff = Math.abs(a - b);
      numerator += (1 - diff / 99) * weight;
      denominator += weight;
    }
  }
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

export const GAP_ATTRS = [
  'perimeterDefense', 'interiorDefense', 'steal', 'block',
  'threePointShot', 'ballHandle', 'speed', 'offensiveRebound',
  'defensiveRebound', 'drivingDunk', 'strength', 'passIQ',
] as const;

export type GapAttr = typeof GAP_ATTRS[number];

export const GAP_LABELS: Record<GapAttr, string> = {
  perimeterDefense: 'Perimeter D',
  interiorDefense: 'Interior D',
  steal: 'Steal',
  block: 'Block',
  threePointShot: '3PT Shot',
  ballHandle: 'Ball Handle',
  speed: 'Speed',
  offensiveRebound: 'Off. Reb',
  defensiveRebound: 'Def. Reb',
  drivingDunk: 'Dunk',
  strength: 'Strength',
  passIQ: 'Pass IQ',
};

export function getRosterWeaknesses(players: Player[]): Array<{ attr: GapAttr; avg: number; label: string }> {
  if (!Array.isArray(players) || players.length < 2) return [];
  return GAP_ATTRS.map((attr) => {
    const vals = players.map((p) => getAttr(p, attr)).filter((v): v is number => v != null);
    const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { attr, avg, label: GAP_LABELS[attr] };
  })
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 4);
}

export function enrichPlayer(p: Player, teamType?: string): Player {
  const tt = (p.teamType ?? teamType ?? 'curr') as Player['teamType'];
  const enriched: Player = { ...p, teamType: tt };
  enriched.capCost = getCapCost(enriched);
  enriched.weightedScore = parseFloat(getWeightedScore(enriched).toFixed(1));
  enriched.valueScore = getValueScore(enriched);
  return enriched;
}

export function getDefAvg(p: Player): number {
  const vals = ['perimeterDefense', 'steal', 'block', 'interiorDefense']
    .map((a) => getAttr(p, a)).filter((v): v is number => v != null);
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

export function getShootingAvg(p: Player): number {
  const vals = ['threePointShot', 'midRangeShot', 'shotIQ']
    .map((a) => getAttr(p, a)).filter((v): v is number => v != null);
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}
