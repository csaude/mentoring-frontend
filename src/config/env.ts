// src/config/env.ts
import pkg from '../../package.json'

const num = (v: any, fallback: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

const str = (v: any, fallback = '') =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback

export const ENV = {
  // API
  API_BASE_URL: str(import.meta.env.VITE_API_BASE_URL),
  REFRESH_TOKEN_ENDPOINT: str(
    import.meta.env.VITE_REFRESH_TOKEN_ENDPOINT,
    '/auth/refresh'
  ),

  // Auth
  ACCESS_TOKEN_TTL: num(import.meta.env.VITE_ACCESS_TOKEN_TTL, 900000), // ms

  // App info (✅ do package.json)
  APP_NAME: pkg.name,
  APP_VERSION: pkg.version,
  APP_ENV: str(import.meta.env.VITE_APP_ENV, import.meta.env.MODE),

  // Vite flags
  MODE: import.meta.env.MODE as string,
  DEV: import.meta.env.DEV as boolean,
  PROD: import.meta.env.PROD as boolean,
}
