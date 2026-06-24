import { useState } from 'react'
import { loadMeta, saveMeta, SHOP_ITEMS, getItemCost } from '@/game/metaProgress'
import { useGameStore } from '@/stores/gameStore'
import { ALL_ACHIEVEMENTS, getAchievement } from '@/game/achievements'

export function MetaShop() {
  const reset = useGameStore((s) => s.reset)
  const setPhase = useGameStore((s) => s.setPhase)
  const newAchievements = useGameStore((s) => s.newAchievements)
  const [meta, setMeta] = useState(() => loadMeta())

  function buy(key: typeof SHOP_ITEMS[0]['key']) {
    const item = SHOP_ITEMS.find(i => i.key === key)!
    const curLevel = meta[key] ?? 0
    const cost = getItemCost(item, curLevel)
    if (curLevel >= item.maxLevel || meta.gold < cost) return
    const updated = { ...meta, gold: meta.gold - cost, [key]: curLevel + 1 }
    saveMeta(updated)
    setMeta(updated)
  }

  const unlockedAch = meta.achievements

  return (
    <div className="flex h-screen w-screen flex-col items-center overflow-y-auto bg-black px-4 py-10">
      <h1 className="mb-1 text-4xl font-bold text-yellow-400">Loja de Progressão</h1>
      <p className="mb-8 text-sm text-gray-500">Melhorias permanentes entre partidas</p>

      {/* Gold */}
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-yellow-800 bg-yellow-950/40 px-8 py-3">
        <span className="text-2xl">🪙</span>
        <span className="text-3xl font-bold text-yellow-400">{meta.gold}</span>
        <span className="text-gray-500">gold disponível</span>
      </div>

      {/* Shop items */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SHOP_ITEMS.map(item => {
          const curLevel = meta[item.key] ?? 0
          const maxed = curLevel >= item.maxLevel
          const cost = getItemCost(item, curLevel)
          const canBuy = !maxed && meta.gold >= cost
          return (
            <div key={item.key} className="flex flex-col items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="font-bold text-white">{item.name}</p>
              <p className="text-xs text-gray-400">{item.description}</p>
              <p className="text-xs text-gray-600">Nível {curLevel}/{item.maxLevel}</p>
              <button
                onClick={() => buy(item.key)}
                disabled={!canBuy}
                className={`mt-1 w-full rounded px-3 py-1.5 text-sm font-semibold transition
                  ${maxed ? 'border border-yellow-700 text-yellow-600 cursor-default' :
                    canBuy ? 'bg-yellow-700 text-yellow-100 hover:bg-yellow-600' :
                    'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
              >
                {maxed ? 'MAX' : `${cost}g`}
              </button>
            </div>
          )
        })}
      </div>

      {/* New Achievements */}
      {newAchievements.length > 0 && (
        <div className="mb-8 w-full max-w-lg">
          <p className="mb-3 text-center text-xs tracking-widest text-yellow-500 uppercase">Conquistas desbloqueadas!</p>
          <div className="flex flex-col gap-2">
            {newAchievements.map(id => {
              const ach = getAchievement(id)
              return ach ? (
                <div key={id} className="flex items-center gap-3 rounded-lg border border-yellow-700 bg-yellow-950/40 px-4 py-2">
                  <span className="text-yellow-400">★</span>
                  <div>
                    <p className="font-bold text-yellow-300">{ach.name}</p>
                    <p className="text-xs text-gray-400">{ach.description}</p>
                  </div>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* All achievements */}
      <div className="mb-10 w-full max-w-lg">
        <p className="mb-3 text-center text-xs tracking-widest text-gray-600 uppercase">Conquistas</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_ACHIEVEMENTS.map(ach => {
            const unlocked = unlockedAch.includes(ach.id)
            return (
              <div key={ach.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${unlocked ? 'border-yellow-700 bg-yellow-950/30' : 'border-gray-800 bg-gray-900/50'}`}>
                <span className={unlocked ? 'text-yellow-400' : 'text-gray-700'}>★</span>
                <div>
                  <p className={`text-xs font-bold ${unlocked ? 'text-yellow-300' : 'text-gray-600'}`}>{ach.name}</p>
                  <p className="text-xs text-gray-600">{ach.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={reset} className="rounded border border-red-800 bg-red-900 px-8 py-3 text-lg font-semibold text-red-100 transition hover:bg-red-700">
          Jogar Novamente
        </button>
        <button onClick={() => setPhase('menu')} className="rounded border border-gray-700 px-8 py-3 text-gray-400 transition hover:text-white">
          Menu
        </button>
      </div>
    </div>
  )
}
