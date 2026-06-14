'use client';

import { useEffect, useState } from 'react';
import { type Player, getPlayerName, getPlayerOvr, getPlayerTeam } from '../types';
import PlayerAvatar from './PlayerAvatar';
import OvrBadge from './OvrBadge';

interface Props {
  player: Player;
  teamType?: string;
  onAdd: (player: Player) => void;
  isInRoster: boolean;
  onClose: () => void;
}

const ATTR_GROUPS: Record<string, string[]> = {
  Shooting: ['midRangeShot', 'threePointShot', 'freeThrow', 'shotIQ', 'offensiveConsistency'],
  Playmaking: ['speed', 'acceleration', 'ballHandle', 'passAccuracy', 'passVision', 'passIQ'],
  Defense: ['interiorDefense', 'perimeterDefense', 'steal', 'block', 'helpDefenseIQ', 'passPerception', 'defensiveConsistency'],
  Athleticism: ['speed', 'acceleration', 'strength', 'vertical', 'stamina', 'hustle', 'overallDurability'],
  Inside: ['closeShot', 'drivingLayup', 'drivingDunk', 'standingDunk', 'postControl', 'drawFoul', 'hands'],
  Rebounding: ['offensiveRebound', 'defensiveRebound'],
};

function attrLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function attrColor(val: number): string {
  if (val >= 90) return 'bg-purple-500';
  if (val >= 80) return 'bg-blue-500';
  if (val >= 70) return 'bg-green-500';
  if (val >= 60) return 'bg-yellow-500';
  if (val >= 50) return 'bg-orange-500';
  return 'bg-red-700';
}

export default function PlayerModal({ player, teamType = 'curr', onAdd, isInRoster, onClose }: Props) {
  const [detail, setDetail] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const slug = player.slug ?? String(player.id);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/player?slug=${encodeURIComponent(slug)}&teamType=${teamType}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setDetail(data);
      } catch {
        setError('Could not load player details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, teamType]);

  const p = detail ?? player;
  const name = getPlayerName(p);
  const ovr = getPlayerOvr(p);
  const team = getPlayerTeam(p);
  const attrs = p.attributes ?? {};
  const badges = p.badges ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-bg border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-6 py-4 flex items-center gap-4">
          <PlayerAvatar player={p} size={56} className="ring-2 ring-gold/40 shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-white text-lg leading-tight truncate">{name}</h2>
            <p className="text-muted text-sm">{p.position ?? ''}{p.position && team ? ' · ' : ''}{team}</p>
            {(p.archetype ?? p.height) && (
              <p className="text-muted text-xs mt-0.5">
                {p.archetype ?? ''}{p.archetype && p.height ? ' · ' : ''}{p.height ?? ''}{p.weight ? ` · ${p.weight}` : ''}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <OvrBadge ovr={ovr} size="lg" />
            <button onClick={onClose} className="text-muted hover:text-white text-lg leading-none">✕</button>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-5">
          {loading && (
            <div className="flex items-center justify-center py-12 text-gold">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
          )}
          {error && <p className="text-red-400 text-sm text-center py-4">{error}</p>}

          {/* Attributes */}
          {Object.keys(attrs).length > 0 && (
            <>
              {Object.entries(ATTR_GROUPS).map(([group, keys]) => {
                const rows = keys.filter((k) => attrs[k] != null);
                if (rows.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">{group}</p>
                    <div className="flex flex-col gap-1.5">
                      {rows.map((k) => (
                        <div key={k} className="flex items-center gap-3">
                          <span className="text-xs text-white/70 w-36 shrink-0">{attrLabel(k)}</span>
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${attrColor(attrs[k])}`}
                              style={{ width: `${attrs[k]}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white w-6 text-right shrink-0">{attrs[k]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Any remaining attrs not in groups */}
              {(() => {
                const covered = new Set(Object.values(ATTR_GROUPS).flat());
                const rest = Object.entries(attrs).filter(([k]) => !covered.has(k));
                if (rest.length === 0) return null;
                return (
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Other</p>
                    <div className="flex flex-col gap-1.5">
                      {rest.map(([k, v]) => (
                        <div key={k} className="flex items-center gap-3">
                          <span className="text-xs text-white/70 w-36 shrink-0">{attrLabel(k)}</span>
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${attrColor(v)}`} style={{ width: `${v}%` }} />
                          </div>
                          <span className="text-xs font-bold text-white w-6 text-right shrink-0">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Badges ({badges.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {badges.map((b, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-md bg-surface border border-border text-white/80">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* No detail returned */}
          {!loading && !error && Object.keys(attrs).length === 0 && badges.length === 0 && (
            <p className="text-muted text-sm text-center py-4">No detailed stats available for this player.</p>
          )}

          {/* Add/remove button */}
          <button
            onClick={() => { onAdd(p); onClose(); }}
            disabled={isInRoster}
            className={`w-full py-3 rounded-xl font-black text-sm transition-colors
              ${isInRoster
                ? 'bg-border text-muted cursor-default'
                : 'bg-gold text-black hover:bg-gold-dim'}`}
          >
            {isInRoster ? 'ALREADY IN ROSTER' : '+ ADD TO ROSTER'}
          </button>
        </div>
      </div>
    </div>
  );
}
