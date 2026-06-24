import type { GameStats } from '@/game/types'
import { useGameStore } from '@/stores/gameStore'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props { stats: GameStats }

export function GameOverScreen({ stats }: Props) {
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 text-center">
        {stats.won ? (
          <div>
            <h1 className="text-5xl font-bold text-yellow-400">Você Zerou!</h1>
            <p className="mt-2 text-gray-400">Sobreviveu aos 10 minutos</p>
          </div>
        ) : (
          <div>
            <h1 className="text-5xl font-bold text-red-500">Game Over</h1>
            <p className="mt-2 text-gray-500">Você foi eliminado</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <Stat label="Tempo"   value={formatTime(stats.timeElapsed)} />
          <Stat label="Nível"   value={String(stats.playerLevel)} />
          <Stat label="Kills"   value={String(stats.kills)} />
          <Stat label="Gold"    value={String(stats.gold)} color="text-yellow-400" />
        </div>

        {stats.tookNoDamage && (
          <p className="rounded border border-yellow-600 bg-yellow-950/40 px-4 py-2 text-sm text-yellow-400">
            ★ Partida sem tomar dano!
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setPhase('shop')}
            className="rounded border border-yellow-700 bg-yellow-900 px-8 py-3 text-lg font-semibold text-yellow-100 transition hover:bg-yellow-700"
          >
            🪙 Loja  (+{stats.gold}g)
          </button>
          <button
            onClick={() => useGameStore.getState().reset()}
            className="rounded border border-red-700 bg-red-900 px-8 py-3 text-lg font-semibold text-red-100 transition hover:bg-red-700"
          >
            Jogar Novamente
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-gray-800 bg-gray-900/60 px-5 py-4">
      <span className="text-xs tracking-widest text-gray-500 uppercase">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
  )
}
