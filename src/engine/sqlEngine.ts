import type { QueryResult } from '@/types'
// Vite resolves ?url to the actual asset path — guaranteed correct even with base config
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

let SQL: any = null
let db: any = null

export async function initEngine(): Promise<void> {
  if (SQL) return
  const mod = await import('sql.js')
  const factory: any =
    typeof mod.default === 'function'
      ? mod.default
      : typeof (mod as any).default?.default === 'function'
      ? (mod as any).default.default
      : mod
  SQL = await factory({
    locateFile: () => sqlWasmUrl,
  })
  db = new SQL.Database()
}

export function getDb() {
  return db
}

export function createFreshDb(): any {
  if (!SQL) throw new Error('SQL engine not initialized')
  return new SQL.Database()
}

export function runQuery(sql: string, database?: any): QueryResult {
  const target = database ?? db
  if (!target) return { columns: [], rows: [], error: 'Engine not ready' }

  try {
    const results = target.exec(sql)

    if (!results || results.length === 0) {
      const lower = sql.trim().toLowerCase()
      if (
        lower.startsWith('insert') ||
        lower.startsWith('update') ||
        lower.startsWith('delete') ||
        lower.startsWith('create') ||
        lower.startsWith('drop') ||
        lower.startsWith('alter')
      ) {
        return { columns: [], rows: [], affectedRows: target.getRowsModified() }
      }
      return { columns: [], rows: [] }
    }

    const { columns, values } = results[0]
    const rows = values.map((row: unknown[]) =>
      Object.fromEntries(columns.map((col: string, i: number) => [col, row[i]]))
    )

    return { columns, rows }
  } catch (e: any) {
    return { columns: [], rows: [], error: e.message }
  }
}

export function runSetup(setupSQL: string, database: any): void {
  const statements = setupSQL.split(';').filter((s) => s.trim())
  for (const stmt of statements) {
    try {
      database.run(stmt)
    } catch {
      // ignore setup errors for partial schemas
    }
  }
}
