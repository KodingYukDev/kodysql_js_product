import { useState } from 'react'
import type { QueryResult } from '@/types'
import { ResultChart, isChartable } from './ResultChart'

interface Props {
  result: QueryResult | null
  isSuccess?: boolean
}

export function ResultViewer({ result, isSuccess }: Props) {
  const [view, setView] = useState<'table' | 'chart'>('table')
  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
        Jalankan query untuk melihat hasil
      </div>
    )
  }

  if (result.error) {
    return (
      <div className="p-4 h-full overflow-auto">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 font-medium text-sm mb-1">❌ Error</p>
          <p className="text-red-300 text-sm font-mono">{result.error}</p>
        </div>
      </div>
    )
  }

  if (result.rows.length === 0 && result.columns.length === 0) {
    return (
      <div className="p-4 h-full overflow-auto">
        <div
          className={`rounded-lg p-4 ${
            isSuccess
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-slate-800 border border-slate-700'
          }`}
        >
          <p className={`text-sm ${isSuccess ? 'text-green-400' : 'text-slate-400'}`}>
            {isSuccess ? '✅ Query berhasil dijalankan!' : '✓ Query dijalankan (0 baris)'}
          </p>
          {result.affectedRows !== undefined && (
            <p className="text-slate-500 text-xs mt-1">
              {result.affectedRows} baris terpengaruh
            </p>
          )}
        </div>
      </div>
    )
  }

  const chartable = isChartable(result)

  return (
    <div className="h-full overflow-auto p-2">
      {isSuccess && (
        <div className="mb-2 bg-green-900/30 border border-green-700 rounded-lg px-3 py-2">
          <p className="text-green-400 text-sm">✅ Benar! Query sesuai misi.</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-500">
          {result.rows.length} baris · {result.columns.length} kolom
        </div>
        {chartable && (
          <div className="flex gap-1 bg-slate-800 rounded-md p-0.5">
            <button
              onClick={() => setView('table')}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                view === 'table' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📋 Tabel
            </button>
            <button
              onClick={() => setView('chart')}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                view === 'chart' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 Grafik
            </button>
          </div>
        )}
      </div>

      {chartable && view === 'chart' ? (
        <ResultChart result={result} />
      ) : (
      <div className="overflow-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800">
              {result.columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-xs font-medium text-slate-300 border-b border-slate-700 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-slate-800 transition-colors ${
                  isSuccess ? 'animate-pulse-once' : ''
                } hover:bg-slate-800/50`}
              >
                {result.columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                    {row[col] === null ? (
                      <span className="text-slate-600 italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
