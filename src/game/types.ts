export interface Vec2 {
  x: number
  y: number
}

export interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export interface ActiveBoss {
  name: string
  hp: number
  maxHp: number
}

export interface WeaponInfo {
  id: WeaponId
  name: string
  level: number
  maxLevel: number
}

export interface GameStats {
  playerHp: number
  playerMaxHp: number
  playerLevel: number
  playerXp: number
  playerXpToNext: number
  kills: number
  timeElapsed: number
  gold: number
  activeBoss: ActiveBoss | null
  tookNoDamage: boolean
  weaponCount: number
  weapons: WeaponInfo[]
  won: boolean
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Upgrade {
  id: string
  name: string
  description: string
  rarity: Rarity
}

export type WeaponId = 'bow' | 'sword' | 'fireball' | 'lightning' | 'aura' | 'orb'
