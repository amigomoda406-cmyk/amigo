// src/hooks/useHaptics.ts

export function useHaptics() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  return {
    tap: () => vibrate(8),
    success: () => vibrate([5, 10, 5]),
    error: () => vibrate([20, 30, 20]),
    heavy: () => vibrate(25),
  };
}
