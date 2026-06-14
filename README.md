# 👻 Ghost's War Room — NBA 2K26 Dynasty Builder

Find the most overpowered players per cap dollar. Build teams that make opponents quit.

## Setup

```bash
npm install
cp .env.example .env.local
# Add your NBA2K API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
vercel
# Set NBA2K_API_KEY in Vercel dashboard → Settings → Environment Variables
```

## Environment Variables

| Variable | Description |
|---|---|
| `NBA2K_API_KEY` | Your nba2kapi.com API key |
| `NBA2K_API_BASE` | API base URL (default: https://api.nba2kapi.com/api) |

The API key is **server-side only** — never exposed to the client bundle.

## Features

### 🔍 Search
- Debounced live search (300ms) + Enter/Go
- Results sorted by **value score**, not OVR
- Last 5 searches as quick-tap chips (localStorage)
- Loading skeletons while fetching
- Inline "Better Value Alternatives" (similarity ≥ 70%, lower cap cost)

### 📊 Best Value
- Filter by Position (ALL / PG / SG / SF / PF / C)
- Filter by Tier (T1 95+ down to T5 60–79)
- Filter by Era (All / Current / All-Time)
- Top 30 ranked by value score

### 💀 Broken
- 10 parallel sections: best value per position, T4/T5 steals, All-Time, defensive, shooting
- **BUILD ME A BROKEN TEAM** — auto-fills remaining roster spots greedily by value score
- Results cached 5 minutes client-side

### 📋 My Roster
- Max 12 players, cap limit 114
- Persisted to `localStorage`
- Team OVR, avg value score, team grade
- Weakness analysis (4 lowest team attributes)
- Copy roster to clipboard

## Cap Rules

| Overall | Base Cap | + All-Time Tax |
|---|---|---|
| 95+ (T1) | 30 | 35 |
| 90–94 (T2) | 22 | 27 |
| 85–89 (T3) | 14 | 19 |
| 80–84 (T4) | 7 | 12 |
| 79 and under (T5) | 3 | 8 |

## Value Score

Value Score = Weighted Score / Cap Cost

Weighted Score uses role-specific attribute weights (PG weights ball handle & pass IQ more; C weights interior defense & block more).

| Grade | VS Range | Color |
|---|---|---|
| S+ | 12+ | Gold |
| S | 10–11.9 | Purple |
| A | 7–9.9 | Green |
| B | 5–6.9 | Blue |
| C | 3–4.9 | Orange |
| D | < 3 | Red |
