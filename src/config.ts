export const CONFIG = {
  SHEET_URL: import.meta.env.VITE_SHEET_URL || '',
  REFRESH_INTERVAL: 60000, // 1 minute auto-refresh
} as const;
