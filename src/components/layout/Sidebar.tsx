import { useGameStore } from '@/store/useGameStore'
import { WORLDS, ALL_LEVELS } from '@/data/worlds'
import { ACHIEVEMENTS } from '@/data/achievements'

export function Sidebar() {
  const { progress, activeWorldId, activeLevelId, setActiveLevel, mode, setMode, resetProgress } =
    useGameStore()

  const totalLevels = ALL_LEVELS.length
  const doneLevels = progress.completedLevels.length
  const progressPct = totalLevels ? (doneLevels / totalLevels) * 100 : 0

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">🗄️ KodySQL</h1>
        <p className="text-xs text-slate-400 mt-1">Belajar SQL Visual</p>
      </div>

      {/* XP Bar */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">XP</span>
          <span className="text-sm font-bold text-yellow-400">{progress.xp} XP</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {doneLevels}/{totalLevels} level selesai
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="p-3 border-b border-slate-700 flex gap-2">
        <button
          onClick={() => setMode('game')}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
            mode === 'game'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          🎮 Game
        </button>
        <button
          onClick={() => setMode('sandbox')}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
            mode === 'sandbox'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          🧪 Sandbox
        </button>
      </div>

      {/* World List */}
      <div className="flex-1 overflow-y-auto py-2">
        {mode === 'game' ? (
          <>
            <p className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider">Dunia</p>
            {WORLDS.map((world) => {
              const worldLevels = world.levels
              const completedInWorld = worldLevels.filter((l) =>
                progress.completedLevels.includes(l.id)
              ).length
              const isWorldUnlocked =
                world.id === 1 ||
                WORLDS.find((w) => w.id === world.id - 1)?.levels.every((l) =>
                  progress.completedLevels.includes(l.id)
                )

              return (
                <div key={world.id} className="mb-1">
                  <div
                    className={`px-4 py-2 flex items-center gap-2 ${
                      !isWorldUnlocked ? 'opacity-40' : ''
                    }`}
                  >
                    <span className="text-lg">{world.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{world.name}</p>
                      <p className="text-xs text-slate-500">
                        {completedInWorld}/{worldLevels.length} level
                      </p>
                    </div>
                    {!isWorldUnlocked && <span className="text-slate-600">🔒</span>}
                  </div>

                  {isWorldUnlocked && (
                    <div className="ml-8 mr-3 mb-2">
                      {worldLevels.map((level) => {
                        const isCompleted = progress.completedLevels.includes(level.id)
                        const isActive =
                          activeWorldId === world.id && activeLevelId === level.id
                        return (
                          <button
                            key={level.id}
                            onClick={() => setActiveLevel(world.id, level.id)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs mb-0.5 transition-colors flex items-center gap-2 ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : isCompleted
                                ? 'bg-slate-700/50 text-green-400 hover:bg-slate-700'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <span>{isCompleted ? '✅' : '○'}</span>
                            <span className="truncate">{level.title}</span>
                            <span className="ml-auto text-yellow-500 shrink-0">
                              +{level.xp}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        ) : (
          <div className="p-4">
            <p className="text-sm text-slate-300 font-medium mb-2">🧪 Sandbox Mode</p>
            <p className="text-xs text-slate-500">
              Bebas menulis SQL. Buat tabel sendiri, isi data, dan eksplorasi query!
            </p>
            <p className="mt-4 text-xs text-slate-600">
              Pilih template database dari panel di sebelah kanan editor.
            </p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="p-3 border-t border-slate-700">
        <p className="text-xs text-slate-500 mb-2">
          🏆 {progress.achievements.length}/{ACHIEVEMENTS.length} achievement
        </p>
        <div className="flex flex-wrap gap-1">
          {ACHIEVEMENTS.map((ach) => (
            <span
              key={ach.id}
              title={`${ach.title}: ${ach.description}`}
              className={`text-base ${
                progress.achievements.includes(ach.id) ? '' : 'opacity-20 grayscale'
              }`}
            >
              {ach.icon}
            </span>
          ))}
        </div>
        <button
          onClick={() => {
            if (confirm('Reset semua progress, XP, dan achievement?')) resetProgress()
          }}
          className="mt-3 w-full text-xs py-1.5 rounded-md border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-700/50 transition-colors"
        >
          🗑️ Reset Progress
        </button>
      </div>
    </div>
  )
}
