import type { QueryResult } from '@/types'

interface VisualizerStep {
  label: string
  icon: string
  detail: string
  highlight?: boolean
}

function parseQuerySteps(sql: string): VisualizerStep[] {
  const upper = sql.trim().toUpperCase()
  const steps: VisualizerStep[] = []

  const tableMatch = sql.match(/FROM\s+(\w+)/i)
  const tableName = tableMatch?.[1] ?? 'tabel'

  steps.push({ label: `TABLE ${tableName}`, icon: '🗄️', detail: 'Sumber data' })

  if (/WHERE/i.test(upper)) {
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|HAVING|$)/is)
    steps.push({
      label: 'FILTER',
      icon: '🔍',
      detail: whereMatch?.[1]?.trim() ?? 'kondisi WHERE',
      highlight: true,
    })
  }

  if (/JOIN/i.test(upper)) {
    const joinMatch = sql.match(/((?:INNER|LEFT|RIGHT)?\s*JOIN\s+\w+)/i)
    steps.push({
      label: 'JOIN',
      icon: '🔗',
      detail: joinMatch?.[1]?.trim() ?? 'gabungkan tabel',
      highlight: true,
    })
  }

  if (/GROUP BY/i.test(upper)) {
    const groupMatch = sql.match(/GROUP BY\s+(.+?)(?:HAVING|ORDER|LIMIT|$)/is)
    steps.push({
      label: 'GROUP BY',
      icon: '📦',
      detail: groupMatch?.[1]?.trim() ?? 'kelompokkan data',
      highlight: true,
    })
  }

  if (/HAVING/i.test(upper)) {
    const havingMatch = sql.match(/HAVING\s+(.+?)(?:ORDER|LIMIT|$)/is)
    steps.push({
      label: 'HAVING',
      icon: '🎯',
      detail: havingMatch?.[1]?.trim() ?? 'filter grup',
    })
  }

  if (/ORDER BY/i.test(upper)) {
    const orderMatch = sql.match(/ORDER BY\s+(.+?)(?:LIMIT|$)/is)
    steps.push({
      label: 'SORT',
      icon: '↕️',
      detail: orderMatch?.[1]?.trim() ?? 'urutkan',
    })
  }

  if (/LIMIT/i.test(upper)) {
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i)
    steps.push({
      label: 'LIMIT',
      icon: '✂️',
      detail: `${limitMatch?.[1] ?? '?'} baris`,
    })
  }

  const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/is)
  const selectCols = selectMatch?.[1]?.trim() ?? '*'
  steps.push({
    label: 'SELECT',
    icon: '📋',
    detail: selectCols.length > 30 ? selectCols.slice(0, 30) + '…' : selectCols,
    highlight: true,
  })

  steps.push({ label: 'RESULT', icon: '✅', detail: 'Data siap!' })

  return steps
}

interface Props {
  sql: string
  result: QueryResult | null
}

export function SQLVisualizer({ sql, result }: Props) {
  const steps = sql.trim() ? parseQuerySteps(sql) : []

  return (
    <div className="h-full flex flex-col p-4 overflow-auto">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">SQL Flow</p>

      {steps.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
          Tulis query untuk melihat visualisasi
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-full rounded-lg border p-3 transition-all ${
                  step.highlight
                    ? 'bg-blue-900/40 border-blue-600 shadow-md shadow-blue-900/20'
                    : step.label === 'RESULT'
                    ? 'bg-green-900/40 border-green-600'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{step.icon}</span>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        step.label === 'RESULT' ? 'text-green-400' : 'text-slate-200'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-[160px]">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="w-px h-4 bg-slate-600 my-0.5" />
              )}
            </div>
          ))}

          {result && !result.error && (
            <div className="mt-2 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400">
                📊 {result.rows.length} baris · {result.columns.length} kolom
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
