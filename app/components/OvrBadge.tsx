'use client';

interface Props {
  ovr: number;
  size?: 'sm' | 'md' | 'lg';
}

function ovrColor(ovr: number): string {
  if (ovr >= 95) return 'bg-purple-600 text-white';
  if (ovr >= 90) return 'bg-blue-500 text-white';
  if (ovr >= 85) return 'bg-green-500 text-white';
  if (ovr >= 80) return 'bg-yellow-500 text-black';
  if (ovr >= 75) return 'bg-orange-500 text-white';
  return 'bg-gray-500 text-white';
}

const sizes = {
  sm: 'text-xs px-1.5 py-0.5 min-w-[28px]',
  md: 'text-sm px-2 py-1 min-w-[34px]',
  lg: 'text-base px-2.5 py-1.5 min-w-[42px]',
};

export default function OvrBadge({ ovr, size = 'md' }: Props) {
  if (!ovr) return null;
  return (
    <span className={`inline-flex items-center justify-center rounded font-bold tabular-nums ${ovrColor(ovr)} ${sizes[size]}`}>
      {ovr}
    </span>
  );
}
