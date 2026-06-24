import { create } from 'zustand'
import type { GameStats, Upgrade } from '@/game/types'
import type { CharacterId } from '@/game/characters'

export type GamePhase = 'menu' | 'charselect' | 'playing' | 'levelup' | 'itemselect' | 'paused' | 'gameover' | 'shop'

interface GameStore {
  phase: GamePhase
  setPhase: (phase: GamePhase) => void

  selectedCharacter: CharacterId | null
  selectCharacter: (id: CharacterId) => void

  stats: GameStats
  setStats: (stats: GameStats) => void

  pendingUpgrades: Upgrade[]
  applyUpgradeFn: ((id: string) => void) | null
  rerollsLeft: number
  rerollFn: (() => void) | null
  setLevelUp: (upgrades: Upgrade[], fn: (id: string) => void, rerollsLeft: number, rerollFn: () => void) => void

  pendingItems: Upgrade[]
  applyItemFn: ((id: string) => void) | null
  setItemSelect: (items: Upgrade[], fn: (id: string) => void) => void

  finalStats: GameStats | null
  setGameOver: (stats: GameStats) => void

  bossAlert: string | null
  setBossAlert: (name: string | null) => void

  newAchievements: string[]
  setNewAchievements: (ids: string[]) => void

  reset: () => void
}

const defaultStats: GameStats = {
  playerHp: 100, playerMaxHp: 100, playerLevel: 1,
  playerXp: 0, playerXpToNext: 50, kills: 0, timeElapsed: 0,
  gold: 0, activeBoss: null, tookNoDamage: true, weaponCount: 1, weapons: [], won: false,
}

export const useGameStore = create<GameStore>((set) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  selectedCharacter: null,
  selectCharacter: (id) => set({ selectedCharacter: id, phase: 'playing' }),

  stats: defaultStats,
  setStats: (stats) => set({ stats }),

  pendingUpgrades: [],
  applyUpgradeFn: null,
  rerollsLeft: 3,
  rerollFn: null,
  setLevelUp: (pendingUpgrades, applyUpgradeFn, rerollsLeft, rerollFn) => set({ pendingUpgrades, applyUpgradeFn, rerollsLeft, rerollFn, phase: 'levelup' }),

  pendingItems: [],
  applyItemFn: null,
  setItemSelect: (pendingItems, applyItemFn) => set({ pendingItems, applyItemFn, phase: 'itemselect' }),

  finalStats: null,
  setGameOver: (finalStats) => set({ finalStats, phase: 'gameover' }),

  bossAlert: null,
  setBossAlert: (bossAlert) => set({ bossAlert }),

  newAchievements: [],
  setNewAchievements: (newAchievements) => set({ newAchievements }),

  reset: () => set({ phase: 'charselect', stats: defaultStats, finalStats: null, pendingUpgrades: [], applyUpgradeFn: null, rerollsLeft: 3, rerollFn: null, pendingItems: [], applyItemFn: null, bossAlert: null, newAchievements: [] }),
}))
