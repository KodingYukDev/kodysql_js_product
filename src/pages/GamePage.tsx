import { useCallback, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { useGameStore } from '@/store/useGameStore'
import { WORLDS } from '@/data/worlds'
import { createFreshDb, runQuery, runSetup } from '@/engine/sqlEngine'
import type { QueryResult } from '@/types'
import { ResultViewer } from '@/components/game/ResultViewer'
import { SQLVisualizer } from '@/components/game/SQLVisualizer'
import { HintSystem } from '@/components/game/HintSystem'
import { AchievementToast } from '@/components/game/AchievementToast'

export function GamePage() {
  const { activeWorldId, activeLevelId, completeLevel, setActiveLevel } = useGameStore()
  const [sql, setSql] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newAchievements, setNewAchievements] = useState<string[]>([])

  const world = WORLDS.find((w) => w.id === activeWorldId)
  const level = world?.levels.find((l) => l.id === activeLevelId)

  // Reset editor & result when level changes
  useEffect(() => {
    setSql('')
    setResult(null)
    setIsSuccess(false)
  }, [level?.id])

  const handleRun = useCallback(() => {
    if (!sql.trim() || !level) return

    // Fresh DB per run → deterministic; mutasi (INSERT/UPDATE) tidak menumpuk
    let db: any = null
    try {
      db = createFreshDb()
      if (level.setupSQL) runSetup(level.setupSQL, db)
    } catch {
      setResult({ columns: [], rows: [], error: 'Engine belum siap' })
      return
    }

    const queryResult = runQuery(sql, db)
    setResult(queryResult)

    if (!queryResult.error && level.validateFn(queryResult, db)) {
      setIsSuccess(true)
      const achs = completeLevel(level.id, level.xp)
      if (achs.length > 0) setNewAchievements(achs)
    } else {
      setIsSuccess(false)
    }
  }, [sql, level, completeLevel])

  const handleNext = () => {
    if (!world || !level) return
    const currentIdx = world.levels.findIndex((l) => l.id === level.id)
    if (currentIdx < world.levels.length - 1) {
      setActiveLevel(world.id, world.levels[currentIdx + 1].id)
    } else {
      const nextWorld = WORLDS.find((w) => w.id === world.id + 1)
      if (nextWorld) setActiveLevel(nextWorld.id, nextWorld.levels[0].id)
    }
  }

  if (!level || !world) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Pilih level dari sidebar
      </div>
    )
  }

  return (
    <>
      {newAchievements.length > 0 && (
        <AchievementToast
          achievementIds={newAchievements}
          onDismiss={() => setNewAchievements([])}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Mission Panel */}
        <div className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden">
          <div className={`p-4 bg-gradient-to-b ${world.color}`}>
            <p className="text-xs text-white/70 uppercase tracking-wider">
              {world.emoji} {world.name}
            </p>
            <h2 className="text-lg font-bold text-white mt-1">{level.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  level.difficulty === 'easy'
                    ? 'bg-green-500/30 text-green-300'
                    : level.difficulty === 'medium'
                    ? 'bg-yellow-500/30 text-yellow-300'
                    : 'bg-red-500/30 text-red-300'
                }`}
              >
                {level.difficulty}
              </span>
              <span className="text-xs text-yellow-300 font-bold">+{level.xp} XP</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Misi</p>
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <p className="text-sm text-slate-200">🎯 {level.mission}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Konsep</p>
              <div className="flex flex-wrap gap-1.5">
                {world.concept.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-300 font-mono"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Petunjuk</p>
              <p className="text-sm text-slate-400">{level.description}</p>
            </div>

            <HintSystem level={level} />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">SQL Editor</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  ▶ Jalankan
                </button>
                {isSuccess && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Selanjutnya →
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={sql}
                onChange={(v) => setSql(v ?? '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  wordWrap: 'on',
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                }}
                onMount={(editor) => {
                  editor.addCommand(2048 + 3, handleRun) // Ctrl+Enter
                }}
              />
            </div>
          </div>

          {/* Result */}
          <div className="h-48 border-t border-slate-700 bg-slate-900">
            <div className="flex items-center px-4 py-2 border-b border-slate-700 bg-slate-800">
              <span className="text-xs text-slate-400">Result</span>
            </div>
            <div className="h-[calc(100%-36px)] overflow-auto">
              <ResultViewer result={result} isSuccess={isSuccess} />
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="w-52 bg-slate-900 border-l border-slate-700 overflow-auto">
          <SQLVisualizer sql={sql} result={result} />
        </div>
      </div>
    </>
  )
}
