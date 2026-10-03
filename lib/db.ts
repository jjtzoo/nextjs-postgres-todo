import { Pool } from "pg";

// A Pool keeps a few database connections open and lends one to each query.
// DATABASE_URL comes from .env.local (Next.js loads it automatically, server-side only).
function createPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

// In development, Next.js re-runs this file every time you save.
// Parking the pool on globalThis lets us reuse it instead of opening new connections each time.
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}
