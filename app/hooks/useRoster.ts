'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Player } from '../types';
import { CAP_LIMIT, getPlayerKey } from '../types';
import { getCapCost, enrichPlayer } from '../lib/scoring';

export interface RosterState {
  roster: Player[];
  capUsed: number;
  capRemaining: number;
  addPlayer: (player: Player) => { success: boolean; reason?: string };
  removePlayer: (key: string) => void;
  clearRoster: () => void;
  isInRoster: (key: string) => boolean;
}

const STORAGE_KEY = 'ghosts_war_room_roster';

export function useRoster(): RosterState {
  const [roster, setRoster] = useState<Player[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
    } catch { /* quota exceeded */ }
  }, [roster]);

  const capUsed = roster.reduce((sum, p) => sum + (p.capCost ?? getCapCost(p)), 0);
  const capRemaining = CAP_LIMIT - capUsed;

  const addPlayer = useCallback(
    (player: Player): { success: boolean; reason?: string } => {
      const enriched = enrichPlayer(player, player.teamType ?? 'curr');
      const key = getPlayerKey(enriched);

      if (roster.some((p) => getPlayerKey(p) === key)) {
        return { success: false, reason: 'Player already in your roster' };
      }
      if (roster.length >= 12) {
        return { success: false, reason: 'Roster full — max 12 players' };
      }
      const cost = enriched.capCost ?? 0;
      if (capUsed + cost > CAP_LIMIT) {
        return {
          success: false,
          reason: `Over cap — need ${cost} cap, only ${capRemaining} left`,
        };
      }
      setRoster((prev) => [...prev, enriched]);
      return { success: true };
    },
    [roster, capUsed, capRemaining],
  );

  const removePlayer = useCallback((key: string) => {
    setRoster((prev) => prev.filter((p) => getPlayerKey(p) !== key));
  }, []);

  const clearRoster = useCallback(() => setRoster([]), []);

  const isInRoster = useCallback(
    (key: string) => roster.some((p) => getPlayerKey(p) === key),
    [roster],
  );

  return { roster, capUsed, capRemaining, addPlayer, removePlayer, clearRoster, isInRoster };
}
