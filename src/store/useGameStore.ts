import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProgress } from '@/types'
import { ACHIEVEMENTS } from '@/data/achievements'

interface GameStore {
  progress: UserProgress
  mode: 'game' | 'sandbox'
  activeWorldId: number
  activeLevelId: number
  setMode: (mode: 'game' | 'sandbox') => void
  setActiveLevel: (worldId: number, levelId: number) => void
  completeLevel: (levelId: number, xpGain: number) => string[]
  resetProgress: () => void
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  completedLevels: [],
  achievements: [],
  currentWorldId: 1,
  currentLevelId: 1,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      progress: DEFAULT_PROGRESS,
      mode: 'game',
      activeWorldId: 1,
      activeLevelId: 1,

      setMode: (mode) => set({ mode }),

      setActiveLevel: (worldId, levelId) =>
        set({ activeWorldId: worldId, activeLevelId: levelId }),

      completeLevel: (levelId, xpGain) => {
        const { progress } = get()
        const newCompleted = progress.completedLevels.includes(levelId)
          ? progress.completedLevels
          : [...progress.completedLevels, levelId]

        const newProgress: UserProgress = {
          ...progress,
          xp: progress.xp + (progress.completedLevels.includes(levelId) ? 0 : xpGain),
          completedLevels: newCompleted,
          achievements: [...progress.achievements],
        }

        const newAchievements: string[] = []
        for (const ach of ACHIEVEMENTS) {
          if (!newProgress.achievements.includes(ach.id) && ach.condition(newProgress)) {
            newProgress.achievements.push(ach.id)
            newAchievements.push(ach.id)
          }
        }

        set({ progress: newProgress })
        return newAchievements
      },

      resetProgress: () => set({ progress: DEFAULT_PROGRESS }),
    }),
    { name: 'kodysql-progress' }
  )
)
