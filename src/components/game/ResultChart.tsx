import type { QueryResult } from '@/types'

interface Props {
  result: QueryResult
}

const BAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-red-500',
]

/** Kolom dianggap numerik jika semua nilai non-null bisa jadi angka */
export function numericColumns(result: QueryResult): string[] {
  return result.columns.filter((col) =>
    result.rows.every((row) => {
      const v = row[col]
      return v === null || v === undefined || (typeof v !== 'boolean' && !Number.isNaN(Number(v)))
    }) && result.rows.some((row) => row[col] !== null && row[col] !== undefined)
  )
}

/** Layak di-chart: ada ≥1 kolom angka, baris masuk akal */
export function isChartable(result: QueryResult): boolean {
  if (result.error || result.rows.length === 0 || result.rows.length > 50) return false
  return numericColumns(result).length >= 1
}

export function ResultChart({ result }: Props) {
  const numCols = numericColumns(result)
  const valueCol = numCols[0]
  // label = kolom non-numerik pertama, fallback ke index baris
  const labelCol = result.columns.find((c) => !numCols.includes(c))

  const data = result.rows.map((row, i) => ({
    label: labelCol ? String(row[labelCol] ?? '∅') : `#${i + 1}`,
    value: Number(row[valueCol] ?? 0),
  }))

  const max = Math.max(...data.map((d) => d.value), 0)
  const min = Math.min(...data.map((d) => d.value), 0)
  const range = max - min || 1

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400">
          📊 <span className="font-mono text-slate-300">{valueCol}</span>
          {labelCol && <span className="text-slate-500"> per {labelCol}</span>}
        </p>
        <span className="text-xs text-slate-600">{data.length} baris</span>
      </div>

      <div className="space-y-2">
        {data.map((d, i) => {
          const pct = ((d.value - Math.min(min, 0)) / range) * 100
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-20 shrink-0 text-xs text-slate-400 truncate text-right font-mono"
                title={d.label}
              >
                {d.label}
              </span>
              <div className="flex-1 bg-slate-800 rounded h-5 overflow-hidden relative">
                <div
                  className={`h-full rounded transition-all duration-500 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
                <span className="absolute inset-y-0 right-2 flex items-center text-xs font-bold text-slate-200">
                  {d.value.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
