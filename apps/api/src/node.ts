/**
 * Entry point para dev local com Node.js.
 * Usado quando o Wrangler nao e suportado (ex: macOS < 13.5).
 * Substitui o D1Database por um adapter better-sqlite3.
 */
import { serve } from '@hono/node-server'
import BetterSQLite from 'better-sqlite3'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './index.js'
import type { Bindings } from './types.js'

// Carrega variaveis do .env (Node 20.12+)
const envPath = resolve(fileURLToPath(new URL('..', import.meta.url)), '.env')
process.loadEnvFile(envPath)

const __dir = fileURLToPath(new URL('..', import.meta.url))
const dbPath = resolve(__dir, 'data', 'forja.db')

// Adapter D1-compativel usando better-sqlite3
class D1Stmt {
  constructor(
    private stmt: BetterSQLite.Statement,
    private values: unknown[] = [],
  ) {}

  bind(...values: unknown[]): D1Stmt {
    return new D1Stmt(this.stmt, values)
  }

  async run(): Promise<D1Result> {
    this.stmt.run(...this.values)
    return { success: true, meta: { duration: 0, rows_read: 0, rows_written: 0 }, results: [] }
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    const results = this.stmt.all(...this.values) as T[]
    return { success: true, meta: { duration: 0, rows_read: results.length, rows_written: 0 }, results }
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    const row = this.stmt.get(...this.values) as T | null
    if (colName && row) return (row as Record<string, unknown>)[colName] as T
    return row ?? null
  }

  async raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<T[]> {
    const rows = this.stmt.raw().all(...this.values)
    if (options?.columnNames) {
      const cols = this.stmt.columns().map((c) => c.name)
      return [cols, ...rows] as unknown as T[]
    }
    return rows as unknown as T[]
  }
}

function createD1Adapter(db: BetterSQLite.Database): D1Database {
  return {
    prepare(query: string) {
      return new D1Stmt(db.prepare(query)) as unknown as D1PreparedStatement
    },
    async exec(query: string) {
      db.exec(query)
      return { count: 0, duration: 0 }
    },
    async batch<T = unknown>(stmts: D1PreparedStatement[]) {
      return Promise.all(stmts.map((s) => (s as unknown as D1Stmt).all<T>()))
    },
    async dump() {
      throw new Error('dump() nao suportado no modo Node.js local')
    },
  } as unknown as D1Database
}

const sqlite = new BetterSQLite(dbPath)
sqlite.pragma('journal_mode = WAL')
const d1 = createD1Adapter(sqlite)

const bindings: Bindings = {
  DB: d1 as unknown as D1Database,
  ADMIN_KEY: process.env.ADMIN_KEY || (() => { throw new Error('ADMIN_KEY is required') })(),
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ?? '',
  MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY ?? '',
  APP_BASE_URL: process.env.APP_BASE_URL ?? 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is required') })(),
}

const port = 3001
console.log(`\n  API local → http://localhost:${port}\n`)

serve({
  fetch: (req) => app.fetch(req, bindings),
  port,
})
