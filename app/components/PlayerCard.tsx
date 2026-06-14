'use client';

import { getPlayerName, getPlayerOvr, getPlayerTeam, type Player, type RosterPosition } from '../types';
import OvrBadge from './OvrBadge';
import PlayerAvatar from './PlayerAvatar';

interface Props {
  player: Player;
  onAdd?: (player: Player, slot?: RosterPosition) => void;
  onRemove?: () => void;
  compact?: boolean;
  isInRoster?: boolean;
}

export default function PlayerCard({ player, onAdd, onRemove, compact = false, isInRoster = false }: Props) {
  const name = getPlayerName(player);
  const ovr = getPlayerOvr(player);
  const team = getPlayerTeam(player);

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border hover:border-gold/40 transition-colors group">
        <PlayerAvatar player={player} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-white">{name}</p>
          <p className="text-xs text-muted truncate">{team}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <OvrBadge ovr={ovr} size="sm" />
          {onAdd && !isInRoster && (
            <button
              onClick={() => onAdd(player)}
              className="text-xs bg-gold text-black font-bold px-2 py-1 rounded hover:bg-gold-dim transition-colors"
            >
              + ADD
            </button>
          )}
          {isInRoster && onRemove && (
            <button
              onClick={onRemove}
              className="text-xs bg-red-900/60 text-red-300 font-bold px-2 py-1 rounded hover:bg-red-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:border-gold/50 transition-all hover:gold-glow group">
      <PlayerAvatar player={player} size={72} className="ring-2 ring-border group-hover:ring-gold/40 transition-colors" />
      <div className="text-center min-w-0 w-full">
        <p className="font-bold text-sm text-white truncate">{name}</p>
        <p className="text-xs text-muted truncate">{player.position ?? ''} · {team}</p>
      </div>
      <OvrBadge ovr={ovr} size="md" />
      {onAdd && !isInRoster && (
        <button
          onClick={() => onAdd(player)}
          className="mt-1 w-full text-xs bg-gold text-black font-bold py-1.5 rounded-lg hover:bg-gold-dim transition-colors"
        >
          + ADD TO ROSTER
        </button>
      )}
      {isInRoster && onRemove && (
        <button
          onClick={onRemove}
          className="mt-1 w-full text-xs bg-red-900/60 text-red-300 font-bold py-1.5 rounded-lg hover:bg-red-800 transition-colors"
        >
          REMOVE
        </button>
      )}
    </div>
  );
}
