'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { type Player, getPlayerKey, getPlayerName, getPlayerOvr, CAP_LIMIT } from '../../types';
import { getCapCost, enrichPlayer } from '../../lib/scoring';
import PlayerCard from '../PlayerCard';
import PlayerAvatar from '../PlayerAvatar';
import OvrBadge from '../OvrBadge';

// ── Section definitions ──────────────────────────────────────────────────────
interface SectionDef {
  id: string;
  title: string;
  params: Record<string, string>;
}

const SECTIONS: SectionDef[] = [
  { id: 'pg', title: '💀 Most Broken PG', params: { position: 'PG', minRating: '60', maxRating: '84', teamType: 'all' } },
  { id: 'sg', title: '💀 Most Broken SG', params: { position: 'SG', minRating: '60', maxRating: '84', teamType: 'all' } },
  { id: 'sf', title: '💀 Most Broken SF', params: { position: 'SF', minRating: '60', maxRating: '84', teamType: 'all' } },
  { id: 'pf', title: '💀 Most Broken PF', params: { position: 'PF', minRating: '60', maxRating: '84', teamType: 'all' } },
  { id: 'c',  title: '💀 Most Broken C',  params: { position: 'C',  minRating: '60', maxRating: '84', teamType: 'all' } },
  { id: 't5', title: '💀 Most Broken T5 (3 cap)', params: { position: 'ALL', minRating: '70', maxRating: '79', teamType: 'curr' } },
  { id: 't4', title: '💀 Most Broken T4 (7 cap)', params: { position: 'ALL', minRating: '80', maxRating: '84', teamType: 'curr' } },
  { id: 'alltime', title: '🏆 Best All-Time Value', params: { position: 'ALL', minRating: '60', maxRating: '99', teamType: 'alltime' } },
  { id: 'defense', title: '🛡 Best Defensive Value', params: { position: 'ALL', minRating: '60', maxRating: '99', teamType: 'all', sortBy: 'def' } },
  { id: 'shooting', title: '🎯 Best Shooting Value', params: { position: 'ALL', minRating: '60', maxRating: '99', teamType: 'all', sortBy: 'shoot' } },
];

const CACHE = new Map<string, { data: Player[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchSection(s: SectionDef): Promise<Player[]> {
  const cacheKey = JSON.stringify(s.params);
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const params = new URLSearchParams({ ...s.params, limit: '50' });
  const res = await fetch(`/api/browse?${params}`);
  if (!res.ok) return [];
  const data: Player[] = await res.json();
  const list = Array.isArray(data) ? data.slice(0, 10) : [];
  CACHE.set(cacheKey, { data: list, ts: Date.now() });
  return list;
}

// ── Section component ────────────────────────────────────────────────────────
function BrokenSection({
  section,
  players,
  loading,
  onAdd,
  onCompare,
  compareKeys,
  isInRoster,
  capRemaining,
}: {
  section: SectionDef;
  players: Player[];
  loading: boolean;
  onAdd: (p: Player) => void;
  onCompare: (p: Player) => void;
  compareKeys: Set<string>;
  isInRoster: (k: string) => boolean;
  capRemaining: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const first = players[0];
  const rest = players.slice(1);

  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-black text-white text-base">{section.title}</h3>
      </div>
      {loading && (
        <div className="flex flex-col gap-2 p-4">
          {[1,2,3].map((i) => <div key={i} className="h-12 rounded-lg bg-border animate-pulse" />)}
        </div>
      )}
      {!loading && players.length === 0 && (
        <p className="text-muted text-sm p-4">No players found</p>
      )}
      {!loading && first && (
        <div className="p-4 flex flex-col gap-3">
          {/* #1 — full card */}
          <PlayerCard
            player={first}
            allPlayers={players}
            onAdd={onAdd}
            onCompare={onCompare}
            inCompare={compareKeys.has(getPlayerKey(first))}
            isInRoster={isInRoster(getPlayerKey(first))}
            capRemaining={capRemaining}
            rank={1}
          />
          {/* #2 and #3 — compact */}
          {rest.slice(0, 2).map((p, i) => (
            <div key={getPlayerKey(p)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg border border-border">
              <span className="text-xs font-black text-muted w-4">#{i + 2}</span>
              <PlayerAvatar player={p} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{getPlayerName(p)}</p>
                <p className="text-xs text-muted">{getPlayerOvr(p)} OVR · {p.capCost ?? getCapCost(p)} cap · VS {p.valueScore?.toFixed(1)}</p>
              </div>
              <OvrBadge ovr={getPlayerOvr(p)} size="sm" />
              <button
                onClick={() => onAdd(p)}
                disabled={isInRoster(getPlayerKey(p)) || (p.capCost ?? getCapCost(p)) > capRemaining}
                className="text-xs bg-gold text-black font-bold px-2 py-1 rounded disabled:bg-border disabled:text-muted"
              >
                +
              </button>
            </div>
          ))}
          {/* Expand button */}
          {rest.length > 2 && (
            <>
              {expanded && rest.slice(2).map((p, i) => (
                <div key={getPlayerKey(p)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg border border-border">
                  <span className="text-xs font-black text-muted w-4">#{i + 4}</span>
                  <PlayerAvatar player={p} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{getPlayerName(p)}</p>
                    <p className="text-xs text-muted">{getPlayerOvr(p)} OVR · {p.capCost ?? getCapCost(p)} cap · VS {p.valueScore?.toFixed(1)}</p>
                  </div>
                  <OvrBadge ovr={getPlayerOvr(p)} size="sm" />
                  <button
                    onClick={() => onAdd(p)}
                    disabled={isInRoster(getPlayerKey(p)) || (p.capCost ?? getCapCost(p)) > capRemaining}
                    className="text-xs bg-gold text-black font-bold px-2 py-1 rounded disabled:bg-border disabled:text-muted"
                  >
                    +
                  </button>
                </div>
              ))}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-muted hover:text-gold transition-colors text-center py-1"
              >
                {expanded ? '▲ Show less' : `▼ See all ${rest.length + 1}`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────────────────
interface Props {
  onAdd: (player: Player) => void;
  onCompare: (player: Player) => void;
  compareKeys: Set<string>;
  isInRoster: (key: string) => boolean;
  roster: Player[];
  capUsed: number;
  capRemaining: number;
}

export default function BrokenTab({ onAdd, onCompare, compareKeys, isInRoster, roster, capUsed, capRemaining }: Props) {
  const [sectionData, setSectionData] = useState<Record<string, Player[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [buildSuggestions, setBuildSuggestions] = useState<Player[]>([]);
  const [building, setBuilding] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const initialLoading: Record<string, boolean> = {};
    SECTIONS.forEach((s) => { initialLoading[s.id] = true; });
    setLoading(initialLoading);

    Promise.all(
      SECTIONS.map(async (s) => {
        const data = await fetchSection(s).catch(() => []);
        setSectionData((prev) => ({ ...prev, [s.id]: data }));
        setLoading((prev) => ({ ...prev, [s.id]: false }));
      })
    ).catch(() => {});
  }, []);

  const buildBrokenTeam = useCallback(async () => {
    setBuilding(true);
    setBuildSuggestions([]);
    try {
      const res = await fetch('/api/browse?teamType=all&minRating=60&maxRating=99&position=ALL&limit=100');
      const data: Player[] = await res.json();
      const available = data
        .filter((p) => !isInRoster(getPlayerKey(p)))
        .sort((a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0));

      const suggestions: Player[] = [];
      let remaining = capRemaining;
      const spots = 12 - roster.length;

      for (const p of available) {
        if (suggestions.length >= spots) break;
        const cost = p.capCost ?? getCapCost(p);
        if (cost <= remaining) {
          suggestions.push(p);
          remaining -= cost;
        }
      }
      setBuildSuggestions(suggestions);
    } catch { /* ignore */ } finally {
      setBuilding(false);
    }
  }, [isInRoster, capRemaining, roster.length]);

  return (
    <div className="flex flex-col gap-5 p-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="rounded-xl bg-surface border border-border p-4">
        <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">👻 BROKEN TEAM BUILDER</p>
        <p className="text-sm text-muted mb-4">Most overpowered players per cap dollar in the game</p>
        <button
          onClick={buildBrokenTeam}
          disabled={building || roster.length >= 12 || capRemaining <= 0}
          className="w-full py-3 rounded-xl font-black text-sm transition-colors
            bg-gold text-black hover:bg-gold-dim disabled:bg-border disabled:text-muted"
        >
          {building ? 'BUILDING…' : roster.length >= 12 ? 'ROSTER FULL' : capRemaining <= 0 ? 'CAP FULL' : 'BUILD ME A BROKEN TEAM'}
        </button>
        {buildSuggestions.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs font-bold text-gold uppercase tracking-widest">
              Suggested Additions ({buildSuggestions.length} players)
            </p>
            {buildSuggestions.map((p) => (
              <div key={getPlayerKey(p)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg border border-border">
                <PlayerAvatar player={p} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{getPlayerName(p)}</p>
                  <p className="text-xs text-muted">{getPlayerOvr(p)} OVR · {p.capCost ?? getCapCost(p)} cap · VS {p.valueScore?.toFixed(1)}</p>
                </div>
                <button
                  onClick={() => onAdd(p)}
                  className="text-xs bg-gold text-black font-bold px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10 sections */}
      {SECTIONS.map((s) => (
        <BrokenSection
          key={s.id}
          section={s}
          players={sectionData[s.id] ?? []}
          loading={loading[s.id] ?? true}
          onAdd={onAdd}
          onCompare={onCompare}
          compareKeys={compareKeys}
          isInRoster={isInRoster}
          capRemaining={capRemaining}
        />
      ))}
    </div>
  );
}
