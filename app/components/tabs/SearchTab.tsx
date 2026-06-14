'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { type Player, getPlayerKey, CAP_LIMIT } from '../../types';
import PlayerCard from '../PlayerCard';

const RECENT_KEY = 'ghosts_recent_searches';
const MAX_RECENT = 5;

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function saveRecent(q: string, prev: string[]) {
  const next = [q, ...prev.filter((s) => s !== q)].slice(0, MAX_RECENT);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  return next;
}

interface Props {
  onAdd: (player: Player) => void;
  onCompare: (player: Player) => void;
  compareKeys: Set<string>;
  isInRoster: (key: string) => boolean;
  capRemaining: number;
}

export default function SearchTab({ onAdd, onCompare, compareKeys, isInRoster, capRemaining }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setRecent(loadRecent()); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setRecent((prev) => saveRecent(q.trim(), prev));
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    doSearch(query);
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search players by name…"
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface border border-border text-white placeholder:text-muted focus:outline-none focus:border-gold text-sm transition-colors"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold animate-spin">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </span>
          )}
        </div>
        <button type="submit" className="px-4 py-3 rounded-xl bg-gold text-black font-black text-sm hover:bg-gold-dim transition-colors shrink-0">
          GO
        </button>
      </form>

      {/* Recent searches */}
      {recent.length > 0 && results.length === 0 && !loading && (
        <div className="flex gap-2 flex-wrap">
          {recent.map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); doSearch(q); }}
              className="text-xs px-3 py-1.5 rounded-full bg-surface border border-border text-muted hover:border-gold/40 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-surface border border-border animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted">{results.length} results — sorted by value score</p>
          {results.map((p) => (
            <PlayerCard
              key={getPlayerKey(p)}
              player={p}
              allPlayers={results}
              onAdd={onAdd}
              onCompare={onCompare}
              inCompare={compareKeys.has(getPlayerKey(p))}
              isInRoster={isInRoster(getPlayerKey(p))}
              capRemaining={capRemaining}
            />
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query.length >= 2 && !error && (
        <p className="text-muted text-sm text-center py-12">No results for &ldquo;{query}&rdquo;</p>
      )}

      {!loading && results.length === 0 && query.length < 2 && (
        <div className="text-center py-16 text-muted">
          <p className="text-5xl mb-4">👻</p>
          <p className="font-bold text-white">Search for players</p>
          <p className="text-sm mt-1">Results sorted by value score — not OVR</p>
        </div>
      )}
    </div>
  );
}
