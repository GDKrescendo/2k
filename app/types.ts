export interface Player {
  id?: string | number;
  slug?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  overall?: number;
  ovr?: number;
  rating?: number;
  position?: string;
  positions?: string[];
  team?: string;
  teamName?: string;
  team_name?: string;
  teamType?: 'curr' | 'allt' | 'class';
  playerImage?: string;
  imageUrl?: string;
  image?: string;
  photo?: string;
  archetype?: string;
  height?: string;
  weight?: string | number;
  // Shooting
  closeShot?: number;
  midRangeShot?: number;
  threePointShot?: number;
  freeThrow?: number;
  shotIQ?: number;
  offensiveConsistency?: number;
  // Finishing
  drivingLayup?: number;
  drivingDunk?: number;
  standingDunk?: number;
  postHook?: number;
  postFade?: number;
  postControl?: number;
  // Playmaking
  passAccuracy?: number;
  ballHandle?: number;
  speedWithBall?: number;
  passIQ?: number;
  passVision?: number;
  // Defense
  interiorDefense?: number;
  perimeterDefense?: number;
  steal?: number;
  block?: number;
  helpDefenseIQ?: number;
  passPerception?: number;
  defensiveConsistency?: number;
  // Athleticism
  speed?: number;
  acceleration?: number;
  strength?: number;
  vertical?: number;
  stamina?: number;
  hustle?: number;
  overallDurability?: number;
  // Rebounding
  offensiveRebound?: number;
  defensiveRebound?: number;
  // Other
  drawFoul?: number;
  hands?: number;
  // Badges
  badges?: Array<string | BadgeInfo>;
  badgeCount?: number;
  hofBadgeCount?: number;
  // Computed client-side
  capCost?: number;
  valueScore?: number;
  weightedScore?: number;
  attributes?: Record<string, number>;
}

export interface BadgeInfo {
  name: string;
  tier?: string;
}

export const CAP_LIMIT = 114;
export type TeamType = 'curr' | 'allt' | 'class';
export type PositionFilter = 'ALL' | 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type TierFilter = 'All' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
export type EraFilter = 'All' | 'Current' | 'All-Time';

export const POSITIONS: PositionFilter[] = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'];
export const TIERS: TierFilter[] = ['All', 'T1', 'T2', 'T3', 'T4', 'T5'];
export const ERAS: EraFilter[] = ['All', 'Current', 'All-Time'];

export function getPlayerOvr(p: Player): number {
  return p.overall ?? p.ovr ?? p.rating ?? 0;
}

export function getPlayerName(p: Player): string {
  if (p.name) return p.name;
  if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
  return 'Unknown';
}

export function getPlayerTeam(p: Player): string {
  return p.team ?? p.teamName ?? p.team_name ?? '';
}

export function getPlayerImage(p: Player): string {
  return p.playerImage ?? p.imageUrl ?? p.image ?? p.photo ?? '';
}

export function getPlayerPosition(p: Player): string {
  return p.positions?.[0] ?? p.position ?? '';
}

export function isAllTime(p: Player): boolean {
  return p.teamType === 'allt' || p.teamType === 'class';
}

export function getPlayerKey(p: Player): string {
  return `${p.slug ?? p.id ?? p.name}_${p.teamType ?? 'curr'}`;
}
