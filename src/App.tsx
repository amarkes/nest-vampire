import { useGameStore } from '@/stores/gameStore'
import { GameCanvas } from '@/components/GameCanvas'
import { HUD } from '@/components/HUD'
import { UpgradeModal } from '@/components/UpgradeModal'
import { GameOverScreen } from '@/components/GameOverScreen'
import { CharacterSelect } from '@/components/CharacterSelect'
import { MetaShop } from '@/components/MetaShop'
import { loadMeta } from '@/game/metaProgress'

function MainMenu() {
  const setPhase = useGameStore((s) => s.setPhase)
  const meta = loadMeta()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black">
      <h1 className="mb-2 text-6xl font-bold tracking-tight text-red-500">Nest Vampire</h1>
      <p className="mb-10 text-sm tracking-widest text-gray-600 uppercase">Survive the horde</p>
      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={() => setPhase('charselect')}
          className="rounded border border-red-800 bg-red-900 px-10 py-3 text-lg font-semibold text-red-100 transition hover:bg-red-700"
        >
          Jogar
        </button>
        <button
          onClick={() => setPhase('shop')}
          className="rounded border border-yellow-800 bg-yellow-900/40 px-8 py-2 text-sm text-yellow-400 transition hover:bg-yellow-800/40"
        >
          🪙 Loja ({meta.gold}g)
        </button>
      </div>
    </div>
  )
}

function PauseOverlay() {
  const setPhase = useGameStore((s) => s.setPhase)
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto rounded-xl border border-gray-700 bg-black/80 px-12 py-8 text-center backdrop-blur">
        <p className="text-2xl font-bold text-white">Pausado</p>
        <p className="mt-1 text-sm text-gray-500">Pressione ESC para continuar</p>
        <button onClick={() => setPhase('menu')} className="mt-6 text-sm text-gray-400 underline hover:text-white">
          Voltar ao menu
        </button>
      </div>
    </div>
  )
}

function Game() {
  const phase = useGameStore((s) => s.phase)
  const pendingUpgrades = useGameStore((s) => s.pendingUpgrades)
  const applyUpgradeFn = useGameStore((s) => s.applyUpgradeFn)
  const rerollsLeft = useGameStore((s) => s.rerollsLeft)
  const rerollFn = useGameStore((s) => s.rerollFn)
  const pendingItems = useGameStore((s) => s.pendingItems)
  const applyItemFn = useGameStore((s) => s.applyItemFn)
  const finalStats = useGameStore((s) => s.finalStats)
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <GameCanvas />
      <HUD />
      {phase === 'levelup' && (
        <UpgradeModal
          upgrades={pendingUpgrades}
          onChoose={(id) => { applyUpgradeFn?.(id); setPhase('playing') }}
          rerollsLeft={rerollsLeft}
          onReroll={() => rerollFn?.()}
          eyebrow="Level Up!"
          title="Escolha uma arma"
        />
      )}
      {phase === 'itemselect' && (
        <UpgradeModal
          upgrades={pendingItems}
          onChoose={(id) => { applyItemFn?.(id); setPhase('playing') }}
          eyebrow="★ Item do Boss ★"
          title="Escolha um item"
          accent="text-purple-400"
        />
      )}
      {phase === 'paused' && <PauseOverlay />}
      {phase === 'gameover' && finalStats && <GameOverScreen stats={finalStats} />}
    </div>
  )
}

function App() {
  const phase = useGameStore((s) => s.phase)
  if (phase === 'menu') return <MainMenu />
  if (phase === 'charselect') return <CharacterSelect />
  if (phase === 'shop') return <MetaShop />
  return <Game />
}

export default App
