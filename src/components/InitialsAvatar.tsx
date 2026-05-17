'use client';

import { motion } from 'framer-motion';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = { sm: 32, md: 48, lg: 72, xl: 96 };
const FONT_MAP = { sm: 13, md: 18, lg: 26, xl: 34 };

const COLORS = [
  { bg: '#FFF8E1', text: '#CC9F00' },
  { bg: '#E8F7FF', text: '#0A7FC0' },
  { bg: '#F0EBFF', text: '#5A3EA0' },
  { bg: '#E8F9D9', text: '#2E7D32' },
  { bg: '#FFF0F0', text: '#C0392B' },
  { bg: '#FFF3E0', text: '#E65100' },
];

export default function InitialsAvatar({ name, size = 'md', className }: InitialsAvatarProps) {
  const words = name.trim().split(/\s+/);
  const initials = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : (words[0][0] ?? '?').toUpperCase();

  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  const px = SIZE_MAP[size];
  const fs = FONT_MAP[size];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={className}
      style={{
        width: px,
        height: px,
        backgroundColor: color.bg,
        color: color.text,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: fs,
        fontFamily: 'Nunito, sans-serif',
        border: '2px solid #FFC800',
        flexShrink: 0,
      }}
    >
      {initials}
    </motion.div>
  );
}
