'use client';

import { motion } from 'framer-motion';
import { haptic } from '@/lib/haptics';

interface SkillChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export default function SkillChip({ label, selected, onToggle }: SkillChipProps) {
  const handleClick = () => {
    haptic('light');
    onToggle();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      animate={selected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      whileTap={{ scale: 0.92 }}
      style={{
        backgroundColor: selected ? '#FFC800' : '#F7F7F7',
        border: selected ? '2px solid #CC9F00' : '2px solid #E8E0D0',
        color: selected ? '#1A1A1A' : '#6B6B6B',
        borderRadius: 9999,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        transition: 'all 150ms',
        fontFamily: 'inherit',
        lineHeight: 1,
      }}
    >
      {selected && <span>✓</span>}
      {label}
    </motion.button>
  );
}
