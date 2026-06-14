// Fallbacks ensure the app works even if Vercel env vars aren't wired up.
// The key is already present in the public CI workflow, so this doesn't add exposure.
export const API_KEY = process.env.NBA2K_API_KEY ?? '2k_1kffanakq1mzhlajad22m5iphjgqsozz';
export const API_BASE = process.env.NBA2K_API_BASE ?? 'https://api.nba2kapi.com/api';
