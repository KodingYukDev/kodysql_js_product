export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  error?: string
  affectedRows?: number
}

export interface Level {
  id: number
  worldId: number
  title: string
  mission: string
  description: string
  hint1: string
  hint2: string
  hint3: string
  solution: string
  setupSQL: string
  validateFn: (result: QueryResult, db?: any) => boolean
  xp: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface World {
  id: number
  name: string
  emoji: string
  concept: string[]
  levels: Level[]
  color: string
}

export interface UserProgress {
  xp: number
  completedLevels: number[]
  achievements: string[]
  currentWorldId: number
  currentLevelId: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  condition: (progress: UserProgress) => boolean
}

export interface VisualizerStep {
  label: string
  description: string
  rows: Record<string, unknown>[]
  columns: string[]
}
