export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
} as const;
