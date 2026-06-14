'use client';

import { type Player, getPlayerName, getPlayerOvr, getPlayerTeam, getPlayerKey } from '../types';
import { getCapCost, getValueScore, getValueGrade, GRADE_COLORS, getAttr } from '../lib/scoring';
import PlayerAvatar from './PlayerAvatar';

const COMPARE_ATTRS = [
  ['perimeterDefense', 'Perimeter D'],
  ['steal', 'Steal'],
  ['block', 'Block'],
  ['interiorDefense', 'Interior D'],
  ['threePointShot', '3PT Shot'],
  ['midRangeShot', 'Mid Range'],
  ['ballHandle', 'Ball Handle'],
  ['speed', 'Speed'],
  ['drivingDunk', 'Dunk'],
  ['passIQ', 'Pass IQ'],
  ['offensiveRebound', 'Off. Reb'],
  ['defensiveRebound', 'Def. Reb'],
  ['strength', 'Strength'],
] as const;

interface Props {
  players: [Player, Player];
  onRemove: (key: string) => void;
  onClose: () => void;
}

export default function PlayerComparison({ players, onRemove, onClose }: Props) {
  const [a, b] = players;

  const aOvr = getPlayerOvr(a);
  const bOvr = getPlayerOvr(b);
  const aVs = a.valueScore ?? getValueScore(a);
  const bVs = b.valueScore ?? getValueScore(b);
  const aCost = a.capCost ?? getCapCost(a);
  const bCost = b.capCost ?? getCapCost(b);

  function Cell({ val, win, attr }: { val: number | null; win: boolean; attr: string }) {
    if (val == null) return <span className="text-muted text-sm">—</span>;
    return (
      <span
        className={`text-sm font-bold tabular-nums ${win ? 'text-gold' : 'text-white/60'}`}
      >
        {val}
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-bg border-t sm:border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-bg/95 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-border">
          <h3 className="font-black text-gold">Player Comparison</h3>
          <button onClick={onClose} className="text-muted hover:text-white text-lg">✕</button>
        </div>

        {/* Player headers */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-4 py-4 border-b border-border">
          {[a, b].map((p, idx) => {
            const ovr = idx === 0 ? aOvr : bOvr;
            const vs = idx === 0 ? aVs : bVs;
            const cost = idx === 0 ? aCost : bCost;
            const grade = getValueGrade(vs);
            const color = GRADE_COLORS[grade];
            return (
              <div key={getPlayerKey(p)} className={`flex flex-col items-center gap-1 ${idx === 1 ? 'text-right items-end' : ''}`}>
                <PlayerAvatar player={p} size={48} />
                <p className="text-sm font-black text-white leading-tight text-center">{getPlayerName(p)}</p>
                <p className="text-xs text-muted text-center">{getPlayerTeam(p)}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-gold">{ovr}</span>
                  <span className="text-xs font-bold" style={{ color }}>{grade}</span>
                </div>
                <p className="text-xs text-muted">{cost} cap · VS {vs}</p>
                <button
                  onClick={() => onRemove(getPlayerKey(p))}
                  className="text-xs text-muted hover:text-red-400 mt-1"
                >
                  Remove
                </button>
              </div>
            );
          })}
          <div className="flex items-center justify-center">
            <span className="text-muted text-xs font-bold">VS</span>
          </div>
        </div>

        {/* Summary diff */}
        <div className="grid grid-cols-3 text-center px-4 py-3 border-b border-border text-xs">
          <div>
            <p className="text-muted">Cap Cost</p>
            <p className={`font-black ${aCost <= bCost ? 'text-green-400' : 'text-red-400'}`}>{aCost}</p>
          </div>
          <div>
            <p className="text-muted">Diff</p>
            <p className="text-white font-bold">{Math.abs(aCost - bCost)} cap · VS {Math.abs(aVs - bVs).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted">Cap Cost</p>
            <p className={`font-black ${bCost <= aCost ? 'text-green-400' : 'text-red-400'}`}>{bCost}</p>
          </div>
        </div>

        {/* Attribute rows */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {COMPARE_ATTRS.map(([attr, label]) => {
            const aVal = getAttr(a, attr);
            const bVal = getAttr(b, attr);
            if (aVal == null && bVal == null) return null;
            const aWins = aVal != null && bVal != null && aVal >= bVal;
            const bWins = aVal != null && bVal != null && bVal >= aVal;
            return (
              <div key={attr} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex justify-end">
                  <Cell val={aVal} win={aWins} attr={attr} />
                </div>
                <span className="text-xs text-muted text-center w-20">{label}</span>
                <Cell val={bVal} win={bWins} attr={attr} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
