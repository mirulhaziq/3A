'use client';

import { useTheme } from 'next-themes';

export function useThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const toggle = () => setTheme(isDark ? 'light' : 'dark');
  return { isDark, toggle };
}
