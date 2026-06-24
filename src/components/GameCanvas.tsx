import { useEffect, useRef } from 'react'
import { GameEngine } from '@/game/engine/engine'
import { createLoop } from '@/game/engine/loop'
import { useGameStore } from '@/stores/gameStore'
import { CHARACTERS } from '@/game/characters'
import { loadMeta, saveMeta } from '@/game/metaProgress'
import { checkNewAchievements } from '@/game/achievements'

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const setStats = useGameStore((s) => s.setStats)
  const setLevelUp = useGameStore((s) => s.setLevelUp)
  const setItemSelect = useGameStore((s) => s.setItemSelect)
  const setGameOver = useGameStore((s) => s.setGameOver)
  const setPhase = useGameStore((s) => s.setPhase)
  const setBossAlert = useGameStore((s) => s.setBossAlert)
  const setNewAchievements = useGameStore((s) => s.setNewAchievements)
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const character = CHARACTERS.find(c => c.id === selectedCharacter) ?? CHARACTERS[1]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const { update, render, chooseUpgrade, chooseItem, rerollUpgrades, getBossesKilled, destroy } = createLoop(canvas, character, {
      onStats: setStats,
      onLevelUp: (upgrades, rerollsLeft) => setLevelUp(upgrades, chooseUpgrade, rerollsLeft, rerollUpgrades),
      onItemSelect: (items) => setItemSelect(items, chooseItem),
      onGameOver: (finalStats) => {
        engine.stop()

        // Save gold to localStorage
        const meta = loadMeta()
        meta.gold += finalStats.gold

        // Check achievements
        const newAch = checkNewAchievements(
          { timeElapsed: finalStats.timeElapsed, kills: finalStats.kills, level: finalStats.playerLevel, tookNoDamage: finalStats.tookNoDamage, weaponCount: finalStats.weaponCount, bossesKilled: getBossesKilled() },
          meta.achievements,
        )
        meta.achievements = [...meta.achievements, ...newAch]
        saveMeta(meta)

        setNewAchievements(newAch)
        setGameOver(finalStats)
      },
      onBossAlert: (name) => {
        setBossAlert(name)
        setTimeout(() => setBossAlert(null), 3500)
      },
    })

    const engine = new GameEngine(canvas, update, render)
    engine.start()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { engine.togglePause(); setPhase(engine.paused ? 'paused' : 'playing') }
    }
    window.addEventListener('keydown', onKey)

    return () => { engine.stop(); destroy(); window.removeEventListener('resize', resize); window.removeEventListener('keydown', onKey) }
  }, [character, setStats, setLevelUp, setItemSelect, setGameOver, setPhase, setBossAlert, setNewAchievements])

  return <canvas ref={canvasRef} className="block" style={{ cursor: 'none' }} />
}
