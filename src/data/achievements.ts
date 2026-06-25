import type { Achievement } from '@/types'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_query',
    title: 'First Query',
    description: 'Selesaikan level pertamamu!',
    icon: '🌟',
    condition: (p) => p.completedLevels.length >= 1,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Selesaikan 5 level!',
    icon: '🗺️',
    condition: (p) => p.completedLevels.length >= 5,
  },
  {
    id: 'analyst',
    title: 'Analyst',
    description: 'Selesaikan 10 level!',
    icon: '📊',
    condition: (p) => p.completedLevels.length >= 10,
  },
  {
    id: 'join_master',
    title: 'Data Engineer',
    description: 'Selesaikan Join City!',
    icon: '🌉',
    condition: (p) => p.completedLevels.includes(10),
  },
  {
    id: 'sql_master',
    title: 'SQL Master',
    description: 'Selesaikan semua dunia!',
    icon: '🏆',
    condition: (p) => p.completedLevels.length >= 13,
  },
  {
    id: 'xp_500',
    title: 'XP Collector',
    description: 'Kumpulkan 500 XP!',
    icon: '💎',
    condition: (p) => p.xp >= 500,
  },
  {
    id: 'detective',
    title: 'SQL Detective',
    description: 'Selesaikan Detective SQL!',
    icon: '🕵️',
    condition: (p) => p.completedLevels.includes(11) && p.completedLevels.includes(12),
  },
]
