'use client';

import { motion } from 'framer-motion';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function SecondaryButton({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
}: SecondaryButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { y: 1 }}
      whileTap={disabled ? {} : { y: 3 }}
      transition={{ duration: 0.1 }}
      style={{
        backgroundColor: '#FFFFFF',
        color: disabled ? '#ABABAB' : '#1A1A1A',
        fontWeight: 700,
        fontSize: 15,
        borderRadius: 12,
        padding: '14px 24px',
        border: `2px solid ${disabled ? '#E5E5E5' : '#E5E5E5'}`,
        boxShadow: disabled ? '0 2px 0 #E5E5E5' : '0 4px 0 #D1D1D1',
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: disabled ? 'none' : 'auto',
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'box-shadow 100ms',
        fontFamily: 'inherit',
        lineHeight: 1,
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
