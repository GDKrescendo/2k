'use client';

import { useState, useEffect } from 'react';
import {
  type Player, type PositionFilter, type TierFilter, type EraFilter,
  POSITIONS, TIERS, ERAS, getPlayerKey, CAP_LIMIT,
} from '../../types';
import PlayerCard from '../PlayerCard';

const TIER_RANGES: Record<TierFilter, [number, number]> = {
  All: [60, 99], T1: [95, 99], T2: [90, 94], T3: [85, 89], T4: [80, 84], T5: [60, 79],
};
const ERA_MAP: Record<EraFilter, string> = {
  All: 'all', Current: 'curr', 'All-Time': 'alltime',
};

interface Props {
  onAdd: (player: Player) => void;
  onCompare: (player: Player) => void;
  compareKeys: Set<string>;
  isInRoster: (key: string) => boolean;
  capRemaining: number;
}

export default function BestValueTab({ onAdd, onCompare, compareKeys, isInRoster, capRemaining }: Props) {
  const [position, setPosition] = useState<PositionFilter>('ALL');
  const [tier, setTier] = useState<TierFilter>('T4');
  const [era, setEra] = useState<EraFilter>('All');
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetch_results(pos: PositionFilter, t: TierFilter, e: EraFilter) {
    setLoading(true);
    setError('');
    const [minRating, maxRating] = TIER_RANGES[t];
    const params = new URLSearchParams({
      position: pos,
      minRating: String(minRating),
      maxRating: String(maxRating),
      teamType: ERA_MAP[e],
      limit: '100',
    });
    try {
      const res = await fetch(`/api/browse?${params}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data.slice(0, 30) : []);
    } catch {
      setError('Failed to load. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-load default on mount
  useEffect(() => { fetch_results('ALL', 'T4', 'All'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function PillRow<T extends string>({ label, values, active, set }: { label: string; values: T[]; active: T; set: (v: T) => void }) {
    return (
      <div>
        <p className="text-xs text-muted mb-1.5">{label}</p>
        <div className="flex gap-1.5 flex-wrap">
          {values.map((v) => (
            <button
              key={v}
              onClick={() => set(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors
                ${active === v ? 'bg-gold text-black' : 'bg-surface border border-border text-muted hover:border-gold/40 hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
      {/* Filters */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface border border-border">
        <PillRow label="Position" values={[...POSITIONS]} active={position} set={setPosition} />
        <PillRow label="Tier" values={[...TIERS]} active={tier} set={setTier} />
        <PillRow label="Era" values={[...ERAS]} active={era} set={setEra} />
        <button
          onClick={() => fetch_results(position, tier, era)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gold text-black font-black text-sm hover:bg-gold-dim transition-colors disabled:opacity-50"
        >
          {loading ? 'LOADING…' : 'FIND BEST VALUE'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-surface border border-border animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted">Top {results.length} — ranked by value score</p>
          {results.map((p, idx) => (
            <PlayerCard
              key={getPlayerKey(p)}
              player={p}
              allPlayers={results}
              onAdd={onAdd}
              onCompare={onCompare}
              inCompare={compareKeys.has(getPlayerKey(p))}
              isInRoster={isInRoster(getPlayerKey(p))}
              capRemaining={capRemaining}
              rank={idx + 1}
            />
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <p className="text-muted text-sm text-center py-12">No players found for these filters</p>
      )}
    </div>
  );
}
