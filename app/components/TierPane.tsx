'use client';

import { useState } from 'react';
import { POSITIONS, type Player, type TeamType } from '../types';
import PlayerCard from './PlayerCard';

const TIERS = [
  { label: 'GOD TIER', min: 95, max: 99, color: 'text-purple-400' },
  { label: 'ELITE',    min: 90, max: 94, color: 'text-blue-400' },
  { label: 'STAR',     min: 85, max: 89, color: 'text-green-400' },
  { label: 'STARTER',  min: 80, max: 84, color: 'text-yellow-400' },
  { label: 'ROTATION', min: 75, max: 79, color: 'text-orange-400' },
  { label: 'DEEP',     min: 60, max: 74, color: 'text-gray-400' },
];

const TEAM_TYPE_LABELS: Record<TeamType, string> = {
  curr: 'Current Teams',
  allt: 'All-Time Teams',
  class: 'Classic Teams',
};

interface Props {
  onAdd: (player: Player) => void;
  isInRoster: (id: string | number) => boolean;
}

export default function TierPane({ onAdd, isInRoster }: Props) {
  const [position, setPosition] = useState('');
  const [teamType, setTeamType] = useState<TeamType>('curr');
  const [activeTier, setActiveTier] = useState<(typeof TIERS)[number] | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchTier(tier: (typeof TIERS)[number]) {
    setActiveTier(tier);
    setLoading(true);
    setError('');
    setPlayers([]);
    try {
      const params = new URLSearchParams({
        min: String(tier.min),
        max: String(tier.max),
        teamType,
        ...(position && { position }),
      });
      const res = await fetch(`/api/tier?${params}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load players.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="flex-1 min-w-[100px] bg-surface border border-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold"
        >
          <option value="">All Positions</option>
          {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={teamType}
          onChange={(e) => setTeamType(e.target.value as TeamType)}
          className="flex-1 min-w-[130px] bg-surface border border-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold"
        >
          {(Object.keys(TEAM_TYPE_LABELS) as TeamType[]).map((t) => (
            <option key={t} value={t}>{TEAM_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Tier buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        {TIERS.map((tier) => (
          <button
            key={tier.label}
            onClick={() => fetchTier(tier)}
            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all
              ${activeTier?.label === tier.label
                ? 'border-gold bg-gold/10 text-gold'
                : `border-border bg-surface ${tier.color} hover:border-gold/40`}`}
          >
            {tier.label}
            <span className="text-muted font-normal ml-1">({tier.min}–{tier.max})</span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-0.5">
        {loading && (
          <div className="flex items-center justify-center py-12 text-gold">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        )}
        {error && <p className="text-red-400 text-xs text-center py-4">{error}</p>}
        {!loading && !activeTier && (
          <div className="text-center py-12 text-muted">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">Select a tier to browse players</p>
          </div>
        )}
        {!loading && players.length === 0 && activeTier && !error && (
          <p className="text-muted text-sm text-center py-8">No players in this tier</p>
        )}
        {players.map((p) => (
          <PlayerCard
            key={p.id ?? p.slug ?? p.name}
            player={p}
            onAdd={onAdd}
            isInRoster={isInRoster(p.id ?? p.slug ?? p.name)}
            compact
          />
        ))}
      </div>
    </div>
  );
}
