'use client';

import { useState, useRef, useCallback } from 'react';
import {
  type Player, getPlayerName, getPlayerOvr, getPlayerTeam, getPlayerPosition,
  getPlayerKey, isAllTime, CAP_LIMIT,
} from '../types';
import {
  getCapCost, getTierLabel, getValueScore, getValueGrade, GRADE_COLORS,
  getSimilarity, getAttr, enrichPlayer,
} from '../lib/scoring';
import OvrBadge from './OvrBadge';
import PlayerAvatar from './PlayerAvatar';

// ── Attribute groups ────────────────────────────────────────────────────────
const ATTR_GROUPS = [
  { icon: '🏀', label: 'Shooting', keys: ['closeShot','midRangeShot','threePointShot','freeThrow','shotIQ','offensiveConsistency'] },
  { icon: '⚡', label: 'Finishing', keys: ['drivingLayup','drivingDunk','standingDunk','postHook','postFade','postControl'] },
  { icon: '🎯', label: 'Playmaking', keys: ['passAccuracy','ballHandle','speedWithBall','passIQ','passVision'] },
  { icon: '🛡', label: 'Defense', keys: ['interiorDefense','perimeterDefense','steal','block','helpDefenseIQ','passPerception','defensiveConsistency'] },
  { icon: '💪', label: 'Athleticism', keys: ['speed','acceleration','strength','vertical','stamina','hustle'] },
  { icon: '📦', label: 'Rebounding', keys: ['offensiveRebound','defensiveRebound'] },
];

function attrColor(v: number): string {
  if (v >= 90) return '#22c55e';
  if (v >= 80) return '#eab308';
  if (v >= 70) return '#f97316';
  return '#ef4444';
}

function attrLabel(k: string): string {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

// ── Badge rendering ─────────────────────────────────────────────────────────
function badgeStyle(tier?: string): string {
  const t = (tier ?? '').toLowerCase();
  if (t.includes('hof') || t === 'hall of fame') return '#7c3aed';
  if (t === 'gold') return '#b45309';
  if (t === 'silver') return '#475569';
  return '#1e3a5f';
}

// ── Cached attribute fetch ──────────────────────────────────────────────────
const attrCache = new Map<string, Player>();

async function loadAttrs(slug: string, teamType: string): Promise<Player> {
  const key = `${slug}_${teamType}`;
  if (attrCache.has(key)) return attrCache.get(key)!;
  const res = await fetch(`/api/player?slug=${encodeURIComponent(slug)}&teamType=${teamType}`);
  if (!res.ok) throw new Error(`${res.status}`);
  const data: Player = await res.json();
  attrCache.set(key, data);
  return data;
}

// ── Main component ──────────────────────────────────────────────────────────
interface Props {
  player: Player;
  allPlayers?: Player[];
  onAdd: (player: Player) => void;
  onCompare?: (player: Player) => void;
  inCompare?: boolean;
  isInRoster?: boolean;
  capRemaining?: number;
  compact?: boolean;
  rank?: number;
}

export default function PlayerCard({
  player,
  allPlayers = [],
  onAdd,
  onCompare,
  inCompare = false,
  isInRoster = false,
  capRemaining = CAP_LIMIT,
  compact = false,
  rank,
}: Props) {
  const [attrsOpen, setAttrsOpen] = useState(false);
  const [fullPlayer, setFullPlayer] = useState<Player | null>(null);
  const [loadingAttrs, setLoadingAttrs] = useState(false);
  const [attrError, setAttrError] = useState('');
  const [altExpanded, setAltExpanded] = useState(false);
  const loadedRef = useRef(false);

  const name = getPlayerName(player);
  const ovr = getPlayerOvr(player);
  const team = getPlayerTeam(player);
  const pos = getPlayerPosition(player);
  const tt = player.teamType ?? 'curr';
  const at = isAllTime(player);
  const cost = player.capCost ?? getCapCost(player);
  const tierLabel = getTierLabel(ovr);
  const vs = player.valueScore ?? getValueScore(player);
  const ws = player.weightedScore ?? 0;
  const grade = getValueGrade(vs);
  const gradeColor = GRADE_COLORS[grade];
  const slug = player.slug ?? String(player.id ?? '');
  const key = getPlayerKey(player);
  const canAdd = !isInRoster && capRemaining >= cost;
  const addReason = isInRoster
    ? 'In roster'
    : capRemaining < cost
    ? `Need ${cost} cap`
    : '';

  // Alternatives: cheaper players with similarity >= 70%
  const alternatives = allPlayers
    .filter((p) => {
      const pKey = getPlayerKey(p);
      if (pKey === key) return false;
      const pCost = p.capCost ?? getCapCost(p);
      if (pCost >= cost) return false;
      return getSimilarity(player, p) >= 70;
    })
    .map((p) => ({
      p,
      sim: getSimilarity(player, p),
      vs: p.valueScore ?? getValueScore(p),
    }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3);

  const toggleAttrs = useCallback(async () => {
    if (!attrsOpen && !loadedRef.current && slug) {
      loadedRef.current = true;
      setLoadingAttrs(true);
      setAttrError('');
      try {
        const data = await loadAttrs(slug, tt);
        setFullPlayer(enrichPlayer(data, tt));
      } catch {
        setAttrError('Failed to load attributes');
        loadedRef.current = false;
      } finally {
        setLoadingAttrs(false);
      }
    }
    setAttrsOpen((v) => !v);
  }, [attrsOpen, slug, tt]);

  const displayPlayer = fullPlayer ?? player;
  const badges = Array.isArray(displayPlayer.badges) ? displayPlayer.badges : [];
  const hofCount = badges.filter((b) =>
    typeof b === 'string' ? b.toLowerCase().includes('hof') : (b.tier ?? '').toLowerCase().includes('hof')
  ).length;

  // ── Compact row ───────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-surface border border-border hover:border-gold/30 transition-colors">
        {rank != null && (
          <span className="text-xs font-black text-muted w-5 shrink-0 text-center">{rank}</span>
        )}
        <PlayerAvatar player={player} size={34} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate leading-tight">{name}</p>
          <p className="text-xs text-muted truncate">{pos} · {team}</p>
        </div>
        <OvrBadge ovr={ovr} size="sm" />
        <span className="text-xs font-bold shrink-0" style={{ color: gradeColor }}>{grade}</span>
        <span className="text-xs text-muted shrink-0">{cost}c</span>
        <button
          onClick={() => onAdd(player)}
          disabled={!canAdd}
          className={`text-xs font-bold px-2 py-1 rounded shrink-0 transition-colors
            ${canAdd ? 'bg-gold text-black hover:bg-gold-dim' : 'bg-border text-muted cursor-default'}`}
          title={addReason}
        >
          {isInRoster ? '✓' : '+'}
        </button>
      </div>
    );
  }

  // ── Full card ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      {/* Header */}
      <div className="flex gap-3 p-4">
        <PlayerAvatar player={player} size={56} className="ring-2 ring-border" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-black text-white text-base leading-tight truncate">{name}</p>
              <p className="text-xs text-muted truncate mt-0.5">{team}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {pos && (
                  <span className="text-xs bg-border text-white/70 px-1.5 py-0.5 rounded font-medium">{pos}</span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${at ? 'bg-yellow-950 text-yellow-400' : 'bg-blue-950 text-blue-400'}`}>
                  {at ? '🏆 All-Time' : '⚡ Current'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 gap-1">
              <span className="text-3xl font-black text-gold leading-none">{ovr}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-border text-white/60 px-1.5 py-0.5 rounded font-bold">{tierLabel}</span>
                <span className="text-xs text-muted font-semibold">{cost} cap{at ? ' (+5 AT)' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value row */}
      <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-bg/40">
        <span
          className="text-sm font-black px-2 py-0.5 rounded"
          style={{ backgroundColor: gradeColor + '22', color: gradeColor, border: `1px solid ${gradeColor}44` }}
        >
          {grade}
        </span>
        <span className="text-xs text-muted">WS <span className="text-white font-bold">{ws}</span></span>
        <span className="text-xs text-muted">VS <span className="text-white font-bold">{vs}</span></span>
        {badges.length > 0 && (
          <span className="text-xs text-muted ml-auto">
            {badges.length} badges{hofCount > 0 ? <span className="text-purple-400 font-bold"> · {hofCount} HOF</span> : null}
          </span>
        )}
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="px-4 py-2 border-t border-green-900/40 bg-green-950/20">
          <button
            onClick={() => setAltExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-green-400 font-bold w-full"
          >
            <span className="text-green-500">💡</span>
            Better Value Alternative{alternatives.length > 1 ? 's' : ''} ({alternatives.length})
            <span className="ml-auto">{altExpanded ? '▲' : '▼'}</span>
          </button>
          {altExpanded && (
            <div className="mt-2 flex flex-col gap-1.5">
              {alternatives.map(({ p, sim, vs: altVs }) => {
                const altGrade = getValueGrade(altVs);
                const altColor = GRADE_COLORS[altGrade];
                const altCost = p.capCost ?? getCapCost(p);
                return (
                  <div
                    key={getPlayerKey(p)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-green-950/30 border border-green-900/40"
                  >
                    <PlayerAvatar player={p} size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{getPlayerName(p)}</p>
                      <p className="text-xs text-muted">{getPlayerOvr(p)} OVR · {altCost} cap</p>
                    </div>
                    <span className="text-xs font-bold" style={{ color: altColor }}>{altGrade}</span>
                    <span className="text-xs text-green-400 font-bold">{sim}%</span>
                    <button
                      onClick={() => onAdd(p)}
                      className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded font-bold hover:bg-green-800/50"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Attribute panel */}
      {attrsOpen && (
        <div className="border-t border-border px-4 py-3">
          {loadingAttrs && (
            <div className="flex items-center gap-2 py-4 justify-center text-gold text-sm">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Loading attributes…
            </div>
          )}
          {attrError && <p className="text-red-400 text-xs py-2">{attrError}</p>}
          {!loadingAttrs && !attrError && (
            <>
              {ATTR_GROUPS.map(({ icon, label, keys }) => {
                const rows = keys.map((k) => ({ k, v: getAttr(displayPlayer, k) })).filter((r) => r.v != null);
                if (!rows.length) return null;
                return (
                  <div key={label} className="mb-3">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      {icon} {label}
                    </p>
                    {rows.map(({ k, v }) => (
                      <div key={k} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white/60 w-32 shrink-0">{attrLabel(k)}</span>
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${v}%`, backgroundColor: attrColor(v!) }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-5 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {/* Badges */}
              {badges.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Badges</p>
                  <div className="flex flex-wrap gap-1">
                    {badges.map((b, i) => {
                      const name = typeof b === 'string' ? b : b.name;
                      const tier = typeof b === 'string' ? undefined : b.tier;
                      return (
                        <span
                          key={i}
                          className="text-xs px-1.5 py-0.5 rounded font-medium text-white/80"
                          style={{ backgroundColor: badgeStyle(tier) + 'cc', border: `1px solid ${badgeStyle(tier)}` }}
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-4 pt-2">
        {slug && (
          <button
            onClick={toggleAttrs}
            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors
              ${attrsOpen ? 'border-gold text-gold bg-gold/10' : 'border-border text-muted hover:border-gold/40 hover:text-white'}`}
          >
            {attrsOpen ? 'Hide Attrs' : 'Attributes'}
          </button>
        )}
        {onCompare && (
          <button
            onClick={() => onCompare(player)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors
              ${inCompare ? 'border-purple-500 text-purple-400 bg-purple-950/30' : 'border-border text-muted hover:border-purple-500/40 hover:text-purple-400'}`}
          >
            {inCompare ? 'Comparing' : 'Compare'}
          </button>
        )}
        <button
          onClick={() => onAdd(player)}
          disabled={!canAdd}
          title={addReason}
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-colors
            ${isInRoster
              ? 'bg-green-900/30 text-green-400 border border-green-900/50 cursor-default'
              : canAdd
              ? 'bg-gold text-black hover:bg-gold-dim'
              : 'bg-border text-muted cursor-default'}`}
        >
          {isInRoster ? '✓ In Roster' : canAdd ? '+ Add' : addReason}
        </button>
      </div>
    </div>
  );
}
