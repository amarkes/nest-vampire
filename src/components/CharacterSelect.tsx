import { CHARACTERS } from '@/game/characters'
import { useGameStore } from '@/stores/gameStore'
import { loadMeta } from '@/game/metaProgress'

const WEAPON_LABELS: Record<string, string> = {
  bow:       'Arco',
  sword:     'Espada Giratória',
  fireball:  'Bola de Fogo',
  lightning: 'Raio',
  aura:      'Aura de Gelo',
  orb:       'Orbe Arcano',
}

function getMetaLevel(): number {
  const m = loadMeta()
  return m.hpLevel + m.damageLevel + m.speedLevel + m.xpLevel + m.magnetLevel + m.lifestealLevel
}

export function CharacterSelect() {
  const selectCharacter = useGameStore((s) => s.selectCharacter)
  const setPhase = useGameStore((s) => s.setPhase)
  const metaLevel = getMetaLevel()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black px-4">
      <h1 className="mb-2 text-5xl font-bold tracking-tight text-white">Escolha seu herói</h1>
      <p className="mb-2 text-sm tracking-widest text-gray-600 uppercase">cada partida é única</p>
      <p className="mb-8 text-xs text-gray-700">Nível de progressão: <span className="text-gray-500">{metaLevel}</span></p>

      <div className="flex flex-wrap justify-center gap-5">
        {CHARACTERS.map((c) => {
          const locked = metaLevel < c.unlockLevel
          return (
            <div key={c.id} className="relative">
              <button
                disabled={locked}
                onClick={() => !locked && selectCharacter(c.id)}
                className={`group flex w-56 flex-col items-center gap-3 rounded-2xl border p-5 text-left transition
                  ${locked
                    ? 'border-gray-800 bg-gray-950 opacity-50 cursor-not-allowed'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-500 hover:bg-gray-800 cursor-pointer'}`}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                  style={locked
                    ? { backgroundColor: '#111', border: '2px solid #374151', color: '#6b7280' }
                    : { backgroundColor: c.color + '22', border: `2px solid ${c.color}`, color: c.color }}
                >
                  {locked ? '🔒' : c.name[0]}
                </div>

                <div className="w-full text-center">
                  <p className="text-base font-bold" style={{ color: locked ? '#6b7280' : c.color }}>{c.name}</p>
                  <p className="mb-2 text-xs text-gray-600">{c.role}</p>
                  <p className="text-xs text-gray-500">{locked ? `Requer progressão ${c.unlockLevel}` : c.description}</p>
                </div>

                {!locked && (
                  <div className="w-full rounded border border-gray-700 bg-black/40 px-2 py-1.5 text-center">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Arma inicial</p>
                    <p className="text-xs font-semibold text-gray-300">{WEAPON_LABELS[c.startingWeapon]}</p>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setPhase('menu')}
        className="mt-10 text-sm text-gray-600 underline hover:text-gray-400"
      >
        ← Voltar
      </button>
    </div>
  )
}
