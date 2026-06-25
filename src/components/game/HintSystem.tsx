import { useState } from 'react'
import type { Level } from '@/types'

interface Props {
  level: Level
}

export function HintSystem({ level }: Props) {
  const [revealed, setRevealed] = useState(0)

  const hints = [level.hint1, level.hint2, level.hint3]

  return (
    <div className="space-y-2">
      {hints.slice(0, revealed).map((hint, i) => (
        <div
          key={i}
          className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-3 py-2"
        >
          <p className="text-xs text-yellow-500 font-medium mb-0.5">💡 Hint {i + 1}</p>
          <p className="text-sm text-yellow-200">{hint}</p>
        </div>
      ))}

      {revealed < 3 && (
        <button
          onClick={() => setRevealed((r) => r + 1)}
          className="w-full text-xs py-2 rounded-lg border border-yellow-700/30 text-yellow-600 hover:bg-yellow-900/20 transition-colors"
        >
          💡 Tampilkan Hint {revealed + 1}
        </button>
      )}
    </div>
  )
}
