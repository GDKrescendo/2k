'use client';

import { useState, useRef, useCallback } from 'react';
import { type Player } from '../types';
import PlayerCard from './PlayerCard';

interface Props {
  onAdd: (player: Player) => void;
  onInfo: (player: Player) => void;
  isInRoster: (id: string | number) => boolean;
}

export default function SearchPane({ onAdd, onInfo, isInRoster }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 350);
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search players by name…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-border text-white placeholder:text-muted focus:outline-none focus:border-gold text-sm transition-colors"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold animate-spin">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-0.5">
        {results.length === 0 && query.length >= 2 && !loading && (
          <p className="text-muted text-sm text-center py-8">No players found for &ldquo;{query}&rdquo;</p>
        )}
        {results.length === 0 && query.length < 2 && (
          <div className="text-center py-12 text-muted">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Type a player name to search</p>
          </div>
        )}
        {results.map((p) => (
          <PlayerCard
            key={p.id ?? p.slug ?? p.name}
            player={p}
            onAdd={onAdd}
            onInfo={onInfo}
            isInRoster={isInRoster(p.id ?? p.slug ?? p.name)}
            compact
          />
        ))}
      </div>
    </div>
  );
}
