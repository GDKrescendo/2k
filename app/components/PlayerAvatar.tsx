'use client';

import { useState } from 'react';
import { getPlayerName, type Player } from '../types';

interface Props {
  player: Player;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ player, size = 48, className = '' }: Props) {
  const [imgError, setImgError] = useState(false);
  const src = player.imageUrl ?? player.image ?? player.photo ?? '';
  const name = getPlayerName(player);
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');

  if (!src || imgError) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-border text-gold font-bold select-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover object-top ${className}`}
      style={{ width: size, height: size }}
      onError={() => setImgError(true)}
    />
  );
}
