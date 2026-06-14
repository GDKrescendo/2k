'use client';

import { type Player, getPlayerName, getPlayerOvr, getPlayerTeam, getPlayerPosition, getPlayerKey, isAllTime, CAP_LIMIT } from '../../types';
import { getCapCost, getValueScore, getValueGrade, GRADE_COLORS } from '../../lib/scoring';
import OvrBadge from '../OvrBadge';
import PlayerAvatar from '../PlayerAvatar';
import WeaknessAnalysis from '../WeaknessAnalysis';

interface Props {
  roster: Player[];
  capUsed: number;
  capRemaining: number;
  onRemove: (key: string) => void;
  onClear: () => void;
}

export default function RosterTab({ roster, capUsed, capRemaining, onRemove, onClear }: Props) {
  const spots = 12 - roster.length;
  const avgOvr = roster.length > 0
    ? Math.round(roster.reduce((s, p) => s + getPlayerOvr(p), 0) / roster.length)
    : 0;
  const avgVs = roster.length > 0
    ? (roster.reduce((s, p) => s + (p.valueScore ?? getValueScore(p)), 0) / roster.length).toFixed(2)
    : '0';
  const teamGrade = getValueGrade(parseFloat(avgVs));
  const teamGradeColor = GRADE_COLORS[teamGrade];

  function exportRoster() {
    const lines = roster.map((p, i) => {
      const ovr = getPlayerOvr(p);
      const cost = p.capCost ?? getCapCost(p);
      const grade = getValueGrade(p.valueScore ?? getValueScore(p));
      const era = isAllTime(p) ? 'AT' : 'CUR';
      return `${i + 1}. ${getPlayerName(p)} (${ovr} OVR) — ${cost} cap [${grade}] [${era}]`;
    });
    const text = [
      "👻 Ghost's War Room Roster",
      `Cap: ${capUsed}/${CAP_LIMIT} · ${roster.length}/12 players`,
      `Avg OVR: ${avgOvr} · Team Grade: ${teamGrade} · Avg VS: ${avgVs}`,
      '─'.repeat(35),
      ...lines,
    ].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    alert('Roster copied to clipboard!');
  }

  if (roster.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-5xl mb-4">📋</p>
        <p className="font-black text-white text-lg">No players yet</p>
        <p className="text-muted text-sm mt-2">Search or browse to build your roster</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
      {/* Summary */}
      <div className="rounded-xl bg-surface border border-border p-4">
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <p className="text-xs text-muted">Players</p>
            <p className="text-xl font-black text-white">{roster.length}<span className="text-muted text-sm">/12</span></p>
          </div>
          <div>
            <p className="text-xs text-muted">Cap Used</p>
            <p className="text-xl font-black text-white">{capUsed}<span className="text-muted text-sm">/{CAP_LIMIT}</span></p>
          </div>
          <div>
            <p className="text-xs text-muted">Cap Left</p>
            <p className={`text-xl font-black ${capRemaining < 10 ? 'text-red-400' : 'text-green-400'}`}>{capRemaining}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted">Avg OVR</p>
            <p className="text-xl font-black text-gold">{avgOvr}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Avg VS</p>
            <p className="text-xl font-black text-white">{avgVs}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Team Grade</p>
            <p className="text-xl font-black" style={{ color: teamGradeColor }}>{teamGrade}</p>
          </div>
        </div>
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-2">
        {roster.map((p, i) => {
          const ovr = getPlayerOvr(p);
          const cost = p.capCost ?? getCapCost(p);
          const vs = p.valueScore ?? getValueScore(p);
          const grade = getValueGrade(vs);
          const gradeColor = GRADE_COLORS[grade];
          const at = isAllTime(p);
          return (
            <div
              key={getPlayerKey(p)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface border border-border"
            >
              <span className="text-xs font-black text-muted w-5 shrink-0 text-center">{i + 1}</span>
              <PlayerAvatar player={p} size={40} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{getPlayerName(p)}</p>
                <p className="text-xs text-muted truncate">
                  {getPlayerPosition(p)} · {getPlayerTeam(p)} · {at ? '🏆' : '⚡'}
                </p>
              </div>
              <OvrBadge ovr={ovr} size="sm" />
              <span className="text-xs font-bold shrink-0" style={{ color: gradeColor }}>{grade}</span>
              <span className="text-xs text-muted shrink-0">{cost}c</span>
              <button
                onClick={() => onRemove(getPlayerKey(p))}
                className="text-muted hover:text-red-400 transition-colors text-base shrink-0 w-7 h-7 flex items-center justify-center"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Weakness analysis */}
      {roster.length >= 2 && (
        <div className="rounded-xl bg-surface border border-border p-4">
          <WeaknessAnalysis players={roster} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={exportRoster}
          className="flex-1 py-3 rounded-xl border border-gold text-gold font-bold text-sm hover:bg-gold hover:text-black transition-colors"
        >
          COPY ROSTER
        </button>
        <button
          onClick={() => {
            if (confirm('Clear entire roster?')) onClear();
          }}
          className="px-4 py-3 rounded-xl border border-red-900 text-red-400 font-bold text-sm hover:bg-red-950 transition-colors"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
}
