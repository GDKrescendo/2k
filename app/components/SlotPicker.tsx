'use client';

import { ROSTER_SLOTS, SLOT_LABELS, type Player, type RosterPosition } from '../types';
import { getPlayerName } from '../types';

interface Props {
  player: Player;
  roster: Partial<Record<RosterPosition, Player>>;
  onSelect: (slot: RosterPosition) => void;
  onClose: () => void;
}

export default function SlotPicker({ player, roster, onSelect, onClose }: Props) {
  const starters = ROSTER_SLOTS.slice(0, 5);
  const bench = ROSTER_SLOTS.slice(5);

  function SlotBtn({ slot }: { slot: RosterPosition }) {
    const occupant = roster[slot];
    return (
      <button
        onClick={() => onSelect(slot)}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-surface hover:border-gold hover:bg-gold/10 transition-all text-left group"
      >
        <span className="text-sm font-black text-gold w-8">{slot.startsWith('BN') ? 'BN' : slot}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">{SLOT_LABELS[slot]}</p>
          {occupant && (
            <p className="text-xs text-white/60 truncate">Replace: {getPlayerName(occupant)}</p>
          )}
        </div>
        {!occupant && (
          <span className="text-xs text-green-400 font-bold">OPEN</span>
        )}
        {occupant && (
          <span className="text-xs text-yellow-400 font-bold">SWAP</span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-bg border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-gold text-lg">Pick a Slot</h3>
            <p className="text-sm text-muted">Adding: {getPlayerName(player)}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Starters</p>
            <div className="flex flex-col gap-1.5">
              {starters.map((s) => <SlotBtn key={s} slot={s} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Bench</p>
            <div className="flex flex-col gap-1.5">
              {bench.map((s) => <SlotBtn key={s} slot={s} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
