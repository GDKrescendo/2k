'use client';

import { useEffect } from 'react';

interface Props {
  message: string;
  type?: 'error' | 'success' | 'info';
  onDone: () => void;
}

const styles = {
  error: 'bg-red-950 border-red-700 text-red-300',
  success: 'bg-green-950 border-green-700 text-green-300',
  info: 'bg-surface border-border text-white',
};

export default function Toast({ message, type = 'info', onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-xl border shadow-2xl
        text-sm font-semibold max-w-xs w-max text-center pointer-events-none ${styles[type]}`}
    >
      {message}
    </div>
  );
}
