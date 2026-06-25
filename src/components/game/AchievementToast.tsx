import { useEffect, useState } from 'react'
import { ACHIEVEMENTS } from '@/data/achievements'

interface Props {
  achievementIds: string[]
  onDismiss: () => void
}

export function AchievementToast({ achievementIds, onDismiss }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const achievements = achievementIds
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean)

  if (!achievements.length) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex flex-col gap-2 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      {achievements.map((ach) => (
        <div
          key={ach!.id}
          className="bg-yellow-900 border border-yellow-500 rounded-xl px-4 py-3 shadow-xl shadow-yellow-900/50 flex items-center gap-3"
        >
          <span className="text-2xl">{ach!.icon}</span>
          <div>
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
              Achievement Unlocked!
            </p>
            <p className="text-sm text-yellow-200 font-medium">{ach!.title}</p>
            <p className="text-xs text-yellow-400/70">{ach!.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
