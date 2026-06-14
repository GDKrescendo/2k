'use client';

import { ROSTER_SLOTS, SLOT_LABELS, getPlayerName, getPlayerOvr, type Player, type RosterPosition } from '../types';
import OvrBadge from './OvrBadge';
import PlayerAvatar from './PlayerAvatar';

interface Props {
  roster: Partial<Record<RosterPosition, Player>>;
  onRemove: (slot: RosterPosition) => void;
  onSlotClick: (slot: RosterPosition) => void;
  activeSlot: RosterPosition | null;
}

export default function RosterPanel({ roster, onRemove, onSlotClick, activeSlot }: Props) {
  const starters = ROSTER_SLOTS.slice(0, 5);
  const bench = ROSTER_SLOTS.slice(5);

  const filled = Object.values(roster).filter(Boolean).length;
  const totalOvr = Object.values(roster)
    .filter(Boolean)
    .reduce((sum, p) => sum + getPlayerOvr(p!), 0);
  const avgOvr = filled > 0 ? Math.round(totalOvr / filled) : 0;

  function SlotRow({ slot }: { slot: RosterPosition }) {
    const player = roster[slot];
    const isActive = activeSlot === slot;
    return (
      <button
        onClick={() => onSlotClick(slot)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left
          ${isActive ? 'border-gold bg-gold/10 gold-glow' : 'border-border bg-surface hover:border-gold/40 hover:bg-white/5'}`}
      >
        <span className={`text-xs font-bold w-8 shrink-0 ${isActive ? 'text-gold' : 'text-muted'}`}>
          {slot.startsWith('BN') ? 'BN' : slot}
        </span>
        {player ? (
          <>
            <PlayerAvatar player={player} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{getPlayerName(player)}</p>
              <p className="text-xs text-muted">{SLOT_LABELS[slot]}</p>
            </div>
            <OvrBadge ovr={getPlayerOvr(player)} size="sm" />
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(slot); }}
              className="ml-1 text-red-500 hover:text-red-300 text-xs font-bold shrink-0 w-5 h-5 flex items-center justify-center"
              aria-label="Remove player"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center">
              <span className="text-muted text-xs">+</span>
            </div>
            <p className="text-sm text-muted">{SLOT_LABELS[slot]}</p>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Team header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gold uppercase tracking-wider">My Roster</h2>
        {filled > 0 && (
          <div className="text-right">
            <span className="text-xs text-muted">Team OVR</span>
            <p className="text-xl font-black text-white">{avgOvr}</p>
          </div>
        )}
      </div>

      {/* Starters */}
      <div>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Starters</p>
        <div className="flex flex-col gap-1.5">
          {starters.map((slot) => <SlotRow key={slot} slot={slot} />)}
        </div>
      </div>

      {/* Bench */}
      <div>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Bench</p>
        <div className="flex flex-col gap-1.5">
          {bench.map((slot) => <SlotRow key={slot} slot={slot} />)}
        </div>
      </div>

      {/* Export button */}
      {filled > 0 && (
        <button
          onClick={() => {
            const lines = ROSTER_SLOTS.map((slot) => {
              const p = roster[slot];
              return p ? `${slot}: ${getPlayerName(p)} (${getPlayerOvr(p)} OVR)` : `${slot}: Empty`;
            });
            const text = `Ghost's War Room — 2K26 Roster\n${'='.repeat(35)}\n${lines.join('\n')}\nTeam OVR: ${avgOvr}`;
            navigator.clipboard.writeText(text).catch(() => {});
            alert('Roster copied to clipboard!');
          }}
          className="mt-auto w-full py-2 rounded-lg border border-gold text-gold font-bold text-sm hover:bg-gold hover:text-black transition-colors"
        >
          COPY ROSTER
        </button>
      )}
    </div>
  );
}
