import type { Upgrade, Rarity } from '@/game/types'

const RARITY_STYLES: Record<Rarity, { border: string; label: string; bg: string; labelColor: string }> = {
  common:    { border: 'border-gray-600',   bg: 'bg-gray-900',    label: 'Comum',     labelColor: 'text-gray-400'   },
  uncommon:  { border: 'border-green-700',  bg: 'bg-green-950',   label: 'Incomum',   labelColor: 'text-green-400'  },
  rare:      { border: 'border-blue-600',   bg: 'bg-blue-950',    label: 'Raro',      labelColor: 'text-blue-400'   },
  epic:      { border: 'border-purple-600', bg: 'bg-purple-950',  label: 'Épico',     labelColor: 'text-purple-400' },
  legendary: { border: 'border-orange-500', bg: 'bg-orange-950',  label: 'Lendário',  labelColor: 'text-orange-400' },
}

interface Props {
  upgrades: Upgrade[]
  onChoose: (id: string) => void
  rerollsLeft?: number
  onReroll?: () => void
  eyebrow?: string
  title?: string
  accent?: string
}

export function UpgradeModal({ upgrades, onChoose, rerollsLeft, onReroll, eyebrow = 'Level Up!', title = 'Escolha um upgrade', accent = 'text-yellow-500' }: Props) {
  const showReroll = onReroll != null && rerollsLeft != null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-4">
        <div className="text-center">
          <p className={`text-xs tracking-widest uppercase ${accent}`}>{eyebrow}</p>
          <h2 className="mt-1 text-3xl font-bold text-white">{title}</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {upgrades.map((u) => {
            const style = RARITY_STYLES[u.rarity]
            return (
              <button
                key={u.id}
                onClick={() => onChoose(u.id)}
                className={`group flex w-52 flex-col gap-3 rounded-xl border p-5 text-left transition hover:brightness-125 ${style.border} ${style.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{u.name}</span>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${style.labelColor}`}>
                    {style.label}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{u.description}</span>
              </button>
            )
          })}
        </div>

        {showReroll && (
          <button
            onClick={onReroll}
            disabled={rerollsLeft <= 0}
            className={`flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-semibold transition
              ${rerollsLeft > 0
                ? 'border-gray-600 bg-gray-800 text-gray-200 hover:border-gray-400 hover:bg-gray-700'
                : 'border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed'}`}
          >
            <span>🔄 Mostrar outros</span>
            <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${rerollsLeft > 0 ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-600'}`}>
              {rerollsLeft}/3
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
