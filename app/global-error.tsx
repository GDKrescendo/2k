'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('GLOBAL error:', error);
  }, [error]);

  return (
    <html>
      <body style={{ background: '#080815', color: 'white', padding: 20, fontFamily: 'monospace', margin: 0, minHeight: '100vh' }}>
        <h1 style={{ color: '#f5c518', fontSize: 18, marginBottom: 12 }}>Fatal Error</h1>
        <p style={{ color: '#ef4444', marginBottom: 8, fontSize: 14 }}>{error?.message ?? 'Unknown error'}</p>
        {error?.digest && (
          <p style={{ color: '#a0a0c0', fontSize: 11, marginBottom: 8 }}>Digest: {error.digest}</p>
        )}
        <pre style={{ fontSize: 11, color: '#a0a0c0', overflow: 'auto', background: '#0f0f24', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error?.stack ?? 'No stack trace'}
        </pre>
        <button
          onClick={reset}
          style={{ background: '#f5c518', color: 'black', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
