'use client';

import type { Player } from '../types';
import { getRosterWeaknesses } from '../lib/scoring';

interface Props {
  players: Player[];
}

export default function WeaknessAnalysis({ players }: Props) {
  if (players.length < 2) {
    return (
      <p className="text-muted text-sm text-center py-6">Add 2+ players to see weakness analysis</p>
    );
  }

  const weaknesses = getRosterWeaknesses(players);
  if (!weaknesses.length) return null;

  return (
    <div>
      <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">
        ⚠ WEAKNESSES — Target these
      </p>
      <div className="grid grid-cols-2 gap-2">
        {weaknesses.map((w) => {
          const pct = Math.min((w.avg / 99) * 100, 100);
          const color = w.avg >= 70 ? 'bg-yellow-500' : w.avg >= 50 ? 'bg-orange-500' : 'bg-red-600';
          return (
            <div key={w.attr} className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-red-300 font-semibold">{w.label}</span>
                <span className="text-xs font-black text-white">{w.avg || '—'}</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
