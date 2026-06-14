export interface Player {
  id: string | number;
  slug?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  overall?: number;
  ovr?: number;
  rating?: number;
  position?: string;
  team?: string;
  teamName?: string;
  team_name?: string;
  imageUrl?: string;
  image?: string;
  photo?: string;
  attributes?: Record<string, number>;
  badges?: string[];
  archetype?: string;
  height?: string;
  weight?: string | number;
}

export type RosterPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'BN1' | 'BN2' | 'BN3' | 'BN4' | 'BN5';

export const ROSTER_SLOTS: RosterPosition[] = ['PG', 'SG', 'SF', 'PF', 'C', 'BN1', 'BN2', 'BN3', 'BN4', 'BN5'];

export const SLOT_LABELS: Record<RosterPosition, string> = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
  BN1: 'Bench',
  BN2: 'Bench',
  BN3: 'Bench',
  BN4: 'Bench',
  BN5: 'Bench',
};

export type TeamType = 'curr' | 'allt' | 'class';

export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;

export function getPlayerOvr(p: Player): number {
  return p.overall ?? p.ovr ?? p.rating ?? 0;
}

export function getPlayerName(p: Player): string {
  if (p.name) return p.name;
  if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
  return 'Unknown Player';
}

export function getPlayerTeam(p: Player): string {
  return p.team ?? p.teamName ?? p.team_name ?? '';
}

export function getPlayerImage(p: Player): string {
  return p.imageUrl ?? p.image ?? p.photo ?? '';
}
