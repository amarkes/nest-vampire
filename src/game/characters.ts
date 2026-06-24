import type { WeaponId } from './types'

export type CharacterId = 'ranger' | 'knight' | 'mage' | 'berserker' | 'cleric' | 'phantom'

export interface CharacterDef {
  id: CharacterId
  name: string
  role: string
  description: string
  hpMultiplier: number
  speedMultiplier: number
  damageMultiplier: number
  lifeStealBonus: number
  startingWeapon: WeaponId
  color: string
  accent: string
  unlockLevel: number
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'ranger',
    name: 'Ranger',
    role: 'Atirador',
    description: '+15% velocidade. Arco automático com grande alcance.',
    hpMultiplier: 1.0,
    speedMultiplier: 1.15,
    damageMultiplier: 1.0,
    lifeStealBonus: 0,
    startingWeapon: 'bow',
    color: '#22c55e',
    accent: '#dcfce7',
    unlockLevel: 0,
  },
  {
    id: 'knight',
    name: 'Knight',
    role: 'Tanque',
    description: '+20% HP. Espada giratória que corta tudo ao redor.',
    hpMultiplier: 1.2,
    speedMultiplier: 1.0,
    damageMultiplier: 1.0,
    lifeStealBonus: 0,
    startingWeapon: 'sword',
    color: '#ef4444',
    accent: '#fee2e2',
    unlockLevel: 2,
  },
  {
    id: 'mage',
    name: 'Mage',
    role: 'Mago',
    description: '+20% dano, -15% HP. Bola de fogo com explosão em área.',
    hpMultiplier: 0.85,
    speedMultiplier: 1.0,
    damageMultiplier: 1.2,
    lifeStealBonus: 0,
    startingWeapon: 'fireball',
    color: '#94a3b8',
    accent: '#f1f5f9',
    unlockLevel: 5,
  },
  {
    id: 'berserker',
    name: 'Berserker',
    role: 'Destruidor',
    description: '+30% dano, +15% velocidade, -20% HP. Puro frenesi.',
    hpMultiplier: 0.8,
    speedMultiplier: 1.15,
    damageMultiplier: 1.3,
    lifeStealBonus: 0,
    startingWeapon: 'lightning',
    color: '#166534',
    accent: '#dcfce7',
    unlockLevel: 10,
  },
  {
    id: 'cleric',
    name: 'Clérigo',
    role: 'Curandeiro',
    description: '+50% HP, -10% dano, -10% velocidade. Vampirismo natural (+1 HP/kill).',
    hpMultiplier: 1.5,
    speedMultiplier: 0.9,
    damageMultiplier: 0.9,
    lifeStealBonus: 1,
    startingWeapon: 'aura',
    color: '#3b82f6',
    accent: '#dbeafe',
    unlockLevel: 15,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    role: 'Assassino',
    description: '+45% velocidade, -25% HP, +15% dano. Canhão de vidro ágil.',
    hpMultiplier: 0.75,
    speedMultiplier: 1.45,
    damageMultiplier: 1.15,
    lifeStealBonus: 0,
    startingWeapon: 'orb',
    color: '#7c3aed',
    accent: '#ede9fe',
    unlockLevel: 20,
  },
]
