import { useEffect, useState } from 'react'
import { initEngine } from '@/engine/sqlEngine'
import { useGameStore } from '@/store/useGameStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { GamePage } from '@/pages/GamePage'
import { SandboxPage } from '@/pages/SandboxPage'

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const mode = useGameStore((s) => s.mode)

  useEffect(() => {
    initEngine()
      .then(() => setReady(true))
      .catch((e) => setError(String(e)))
  }, [])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
        Gagal memuat SQL engine: {error}
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-bounce">🗄️</div>
        <p className="text-slate-400 text-sm">Memuat KodySQL...</p>
        <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {mode === 'game' ? <GamePage /> : <SandboxPage />}
    </div>
  )
}
