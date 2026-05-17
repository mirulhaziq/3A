'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPToastItem {
  id: number;
  xp: number;
  label: string;
}

interface XPToastContextValue {
  showXP: (xp: number, label?: string) => void;
}

const XPToastContext = createContext<XPToastContextValue>({
  showXP: () => {},
});

export function useXPToast() {
  return useContext(XPToastContext);
}

let nextId = 0;

export function XPToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<XPToastItem[]>([]);

  const showXP = useCallback((xp: number, label = 'XP earned') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, xp, label }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2200);
  }, []);

  return (
    <XPToastContext.Provider value={{ showXP }}>
      {children}
      {/* Toast container — sits above bottom nav */}
      <div
        style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
          width: '100%',
          maxWidth: 480,
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                background: '#1A1A1A',
                color: 'white',
                borderRadius: 9999,
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              <span style={{ color: '#7C5CBF' }}>⚡</span>
              <span style={{ color: '#7C5CBF' }}>+{toast.xp} XP</span>
              <span style={{ color: '#ABABAB', fontWeight: 400, fontSize: 13 }}>
                {toast.label}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </XPToastContext.Provider>
  );
}
