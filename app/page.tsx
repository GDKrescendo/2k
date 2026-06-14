'use client';

import { useState, useCallback } from 'react';
import { type Player, getPlayerKey, CAP_LIMIT } from './types';
import { getRosterWeaknesses } from './lib/scoring';
import { useRoster } from './hooks/useRoster';
import CapBar from './components/CapBar';
import Toast from './components/Toast';
import PlayerComparison from './components/PlayerComparison';
import SearchTab from './components/tabs/SearchTab';
import BestValueTab from './components/tabs/BestValueTab';
import BrokenTab from './components/tabs/BrokenTab';
import RosterTab from './components/tabs/RosterTab';

type Tab = 'search' | 'bestvalue' | 'broken' | 'roster';

const NAV: Array<{ id: Tab; icon: string; label: string }> = [
  { id: 'search',    icon: '🔍', label: 'Search' },
  { id: 'bestvalue', icon: '📊', label: 'Best Value' },
  { id: 'broken',    icon: '💀', label: 'Broken' },
  { id: 'roster',    icon: '📋', label: 'Roster' },
];

export default function Home() {
  const { roster, capUsed, capRemaining, addPlayer, removePlayer, clearRoster, isInRoster } = useRoster();
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [compareList, setCompareList] = useState<Player[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const weaknesses = getRosterWeaknesses(roster);
  const compareKeys = new Set(compareList.map(getPlayerKey));

  const handleAdd = useCallback((player: Player) => {
    const result = addPlayer(player);
    if (!result.success) {
      setToast({ message: result.reason!, type: 'error' });
    } else {
      const name = player.name ?? player.firstName ?? 'Player';
      setToast({ message: `${name} added to roster`, type: 'success' });
    }
  }, [addPlayer]);

  const handleCompare = useCallback((player: Player) => {
    const key = getPlayerKey(player);
    setCompareList((prev) => {
      if (prev.some((p) => getPlayerKey(p) === key)) {
        return prev.filter((p) => getPlayerKey(p) !== key);
      }
      if (prev.length >= 2) return [prev[1], player];
      return [...prev, player];
    });
  }, []);

  const removeFromCompare = useCallback((key: string) => {
    setCompareList((prev) => prev.filter((p) => getPlayerKey(p) !== key));
  }, []);

  const tabProps = {
    onAdd: handleAdd,
    onCompare: handleCompare,
    compareKeys,
    isInRoster: (key: string) => isInRoster(key),
    capRemaining,
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center shrink-0">
          <span className="text-black font-black text-xs leading-none">GWR</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-white text-base leading-tight">Ghost&apos;s War Room</h1>
          <p className="text-muted text-xs">NBA 2K26 Dynasty Builder</p>
        </div>
        {compareList.length > 0 && (
          <button
            onClick={() => setCompareList([])}
            className="text-xs text-purple-400 border border-purple-800 px-2 py-1 rounded-lg font-bold"
          >
            Compare ({compareList.length})
          </button>
        )}
      </header>

      {/* Cap bar — sticky */}
      <CapBar
        capUsed={capUsed}
        playerCount={roster.length}
        weaknesses={weaknesses.map((w) => ({ label: w.label, avg: w.avg }))}
      />

      {/* Tab content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'search' && <SearchTab {...tabProps} />}
        {activeTab === 'bestvalue' && <BestValueTab {...tabProps} />}
        {activeTab === 'broken' && (
          <BrokenTab
            {...tabProps}
            roster={roster}
            capUsed={capUsed}
          />
        )}
        {activeTab === 'roster' && (
          <RosterTab
            roster={roster}
            capUsed={capUsed}
            capRemaining={capRemaining}
            onRemove={removePlayer}
            onClear={clearRoster}
          />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border">
        <div className="flex max-w-2xl mx-auto">
          {NAV.map(({ id, icon, label }) => {
            const active = activeTab === id;
            const badge = id === 'roster' ? roster.length : 0;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors
                  ${active ? 'text-gold' : 'text-muted hover:text-white'}`}
              >
                <span className="text-xl relative">
                  {icon}
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-2 text-[10px] font-black bg-gold text-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-bold leading-none">{label}</span>
                {active && <span className="w-8 h-0.5 bg-gold rounded-full mt-0.5" />}
              </button>
            );
          })}
        </div>
        {/* iOS safe area padding */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* Player comparison modal */}
      {compareList.length === 2 && (
        <PlayerComparison
          players={compareList as [Player, Player]}
          onRemove={removeFromCompare}
          onClose={() => setCompareList([])}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.message}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
