'use client';

import { useState, useCallback } from 'react';
import { ROSTER_SLOTS, type Player, type RosterPosition } from './types';
import RosterPanel from './components/RosterPanel';
import SearchPane from './components/SearchPane';
import TierPane from './components/TierPane';
import SlotPicker from './components/SlotPicker';
import PlayerModal from './components/PlayerModal';

type Tab = 'search' | 'tier';

export default function Home() {
  const [roster, setRoster] = useState<Partial<Record<RosterPosition, Player>>>({});
  const [tab, setTab] = useState<Tab>('search');
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null);
  const [activeSlot, setActiveSlot] = useState<RosterPosition | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);

  const rosterIds = new Set(
    Object.values(roster).filter(Boolean).map((p) => p!.id ?? p!.slug ?? p!.name)
  );

  const isInRoster = useCallback(
    (id: string | number) => rosterIds.has(id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roster]
  );

  function handleAdd(player: Player) {
    // Find first open slot
    const openSlot = ROSTER_SLOTS.find((s) => !roster[s]);
    if (openSlot) {
      setRoster((prev) => ({ ...prev, [openSlot]: player }));
    } else {
      setPendingPlayer(player);
    }
  }

  function handleSlotPickerSelect(slot: RosterPosition) {
    if (pendingPlayer) {
      setRoster((prev) => ({ ...prev, [slot]: pendingPlayer }));
      setPendingPlayer(null);
    }
  }

  function handleRosterSlotClick(slot: RosterPosition) {
    setActiveSlot((prev) => (prev === slot ? null : slot));
  }

  function handleRemove(slot: RosterPosition) {
    setRoster((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
    if (activeSlot === slot) setActiveSlot(null);
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center shrink-0">
              <span className="text-black font-black text-sm">GW</span>
            </div>
            <div>
              <h1 className="font-black text-white text-base leading-tight">Ghost&apos;s War Room</h1>
              <p className="text-muted text-xs leading-tight">NBA 2K26 Dynasty Builder</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Players added</p>
            <p className="text-2xl font-black text-gold leading-tight">
              {Object.values(roster).filter(Boolean).length}
              <span className="text-muted text-base font-bold">/10</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* Left: Player browser */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border self-start">
            {(['search', 'tier'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
                  ${tab === t ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
              >
                {t === 'search' ? '🔍 Search' : '📊 Browse Tiers'}
              </button>
            ))}
          </div>

          {/* Pane */}
          <div className="flex-1 min-h-0 bg-surface/30 rounded-2xl border border-border p-4"
            style={{ minHeight: '70vh' }}>
            {tab === 'search' ? (
              <SearchPane onAdd={handleAdd} onInfo={setDetailPlayer} isInRoster={isInRoster} />
            ) : (
              <TierPane onAdd={handleAdd} onInfo={setDetailPlayer} isInRoster={isInRoster} />
            )}
          </div>
        </div>

        {/* Right: Roster */}
        <div className="lg:sticky lg:top-[73px] lg:self-start">
          <div className="bg-surface/30 rounded-2xl border border-border p-4" style={{ minHeight: '70vh' }}>
            <RosterPanel
              roster={roster}
              onRemove={handleRemove}
              onSlotClick={handleRosterSlotClick}
              activeSlot={activeSlot}
            />
          </div>
        </div>
      </main>

      {/* Player detail modal */}
      {detailPlayer && (
        <PlayerModal
          player={detailPlayer}
          onAdd={handleAdd}
          isInRoster={isInRoster(detailPlayer.id ?? detailPlayer.slug ?? detailPlayer.name)}
          onClose={() => setDetailPlayer(null)}
        />
      )}

      {/* Slot picker modal */}
      {pendingPlayer && (
        <SlotPicker
          player={pendingPlayer}
          roster={roster}
          onSelect={handleSlotPickerSelect}
          onClose={() => setPendingPlayer(null)}
        />
      )}
    </div>
  );
}
