export function haptic(
  pattern: 'light' | 'medium' | 'success' | 'error' = 'light'
) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  const patterns: Record<typeof pattern, number[]> = {
    light:   [30],
    medium:  [50],
    success: [40, 30, 60],
    error:   [80, 40, 80],
  };
  navigator.vibrate(patterns[pattern]);
}
