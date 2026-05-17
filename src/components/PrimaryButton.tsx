'use client';

import { motion } from 'framer-motion';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
}: PrimaryButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { y: 1 }}
      whileTap={disabled ? {} : { y: 3 }}
      transition={{ duration: 0.1 }}
      style={{
        backgroundColor: disabled ? '#ABABAB' : '#FFC800',
        color: disabled ? '#FFFFFF' : '#1A1A1A',
        fontWeight: 700,
        fontSize: 15,
        borderRadius: 12,
        padding: '14px 24px',
        boxShadow: disabled ? '0 2px 0 #888888' : '0 4px 0 #CC9F00',
        border: 'none',
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
