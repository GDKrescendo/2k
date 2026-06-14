'use client';

import { CAP_LIMIT } from '../types';

interface Props {
  capUsed: number;
  playerCount: number;
  weaknesses?: Array<{ label: string; avg: number }>;
}

export default function CapBar({ capUsed, playerCount, weaknesses = [] }: Props) {
  const pct = Math.min((capUsed / CAP_LIMIT) * 100, 100);
  const capRemaining = CAP_LIMIT - capUsed;
  const isDanger = capUsed > CAP_LIMIT * 0.95;
  const isWarning = capUsed > CAP_LIMIT * 0.85;
  const barColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-gold';
  const textColor = isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white';

  return (
    <div className="bg-surface/90 backdrop-blur border-b border-border px-4 py-2 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-bold text-muted shrink-0">CAP</span>
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-xs font-black tabular-nums shrink-0 ${textColor}`}>
            {capUsed}/{CAP_LIMIT}
          </span>
          <span className="text-xs text-muted shrink-0">{playerCount}/12</span>
          <span className="text-xs text-muted shrink-0 hidden sm:inline">{capRemaining} left</span>
        </div>
        {weaknesses.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-1">
            {weaknesses.map((w) => (
              <span
                key={w.label}
                className="text-xs bg-red-950/60 border border-red-800/50 text-red-400 px-2 py-0.5 rounded-full"
              >
                ⚠ {w.label} {w.avg > 0 ? `(${w.avg})` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
