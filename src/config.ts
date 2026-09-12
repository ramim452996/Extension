// Production & Local API Configuration
// Can be overridden at build time via VITE_API_BASE_URL (e.g. VITE_API_BASE_URL=https://api.compareanything.com/api)
export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "https://compare-backend1.onrender.com/api";

