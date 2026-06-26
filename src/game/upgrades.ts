import type { Player } from './entities/player'
import type { Upgrade, Rarity, WeaponId } from './types'
import { createWeapon, maxLevelFor } from './weapons'
import type { WeaponState } from './weapons'

interface UpgradeDef extends Upgrade {
  apply: (player: Player) => void
  weight: number
}

const PASSIVE_POOL: UpgradeDef[] = [
  { id: 'p_power',     name: 'Poder',       description: '+15% dano',                   rarity: 'common',    weight: 10, apply: p => { p.damage *= 1.15 } },
  { id: 'p_speed',     name: 'Agilidade',   description: '+12% velocidade',             rarity: 'common',    weight: 10, apply: p => { p.speed *= 1.12 } },
  { id: 'p_health',    name: 'Vitalidade',  description: '+40 HP e cura 40',            rarity: 'common',    weight: 10, apply: p => { p.maxHp += 40; p.hp = Math.min(p.hp + 40, p.maxHp) } },
  { id: 'p_crit',      name: 'Precisão',    description: '+8% chance crítica',          rarity: 'uncommon',  weight: 6,  apply: p => { p.critChance += 0.08 } },
  { id: 'p_magnet',    name: 'Magnetismo',  description: '+50% raio de coleta',         rarity: 'common',    weight: 8,  apply: p => { p.pickupRadius *= 1.5 } },
  { id: 'p_armor',     name: 'Armadura',    description: '+12% redução de dano',        rarity: 'uncommon',  weight: 6,  apply: p => { p.armor = Math.min(p.armor + 0.12, 0.85) } },
  { id: 'p_wisdom',    name: 'Sabedoria',   description: '+25% XP obtida',              rarity: 'uncommon',  weight: 6,  apply: p => { p.xpMultiplier *= 1.25 } },
  { id: 'p_range',     name: 'Alcance',     description: '+35% alcance dos projéteis',  rarity: 'uncommon',  weight: 6,  apply: p => { p.projectileRange *= 1.35 } },
  { id: 'p_luck',      name: 'Sorte',       description: '+15% chance de drops raros',  rarity: 'uncommon',  weight: 6,  apply: p => { p.luck += 0.15 } },
  { id: 'p_fury',      name: 'Fúria',       description: 'Cooldowns -20%',             rarity: 'rare',      weight: 3,  apply: p => { for (const w of p.weapons) w.timer = Math.max(0, w.timer * 0.8) } },
  { id: 'p_overclock', name: 'Sobrecarga',  description: '+30% dano e +15% velocidade', rarity: 'rare',     weight: 2,  apply: p => { p.damage *= 1.3; p.speed *= 1.15 } },
  { id: 'p_titan',     name: 'Titã',        description: '+80 HP e +20% redução de dano', rarity: 'epic',   weight: 1,  apply: p => { p.maxHp += 80; p.hp = Math.min(p.hp + 80, p.maxHp); p.armor = Math.min(p.armor + 0.2, 0.85) } },
  { id: 'p_godspeed',  name: 'Velocidade Divina', description: '+40% velocidade e +20% coleta', rarity: 'epic', weight: 1, apply: p => { p.speed *= 1.4; p.pickupRadius *= 1.2 } },
  { id: 'p_legendary', name: 'Lendário',    description: '+50% a tudo',                 rarity: 'legendary', weight: 0.5, apply: p => { p.damage *= 1.5; p.speed *= 1.5; p.maxHp += 100; p.hp = Math.min(p.hp + 100, p.maxHp) } },
]

const WEAPON_NAMES: Record<WeaponId, string> = {
  bow: 'Arco', sword: 'Espada Giratória', fireball: 'Bola de Fogo', lightning: 'Raio', aura: 'Aura de Gelo', orb: 'Orbe Arcano',
}
const WEAPON_RARITY: Record<WeaponId, Rarity> = {
  bow: 'common', sword: 'common', fireball: 'uncommon', lightning: 'uncommon', aura: 'rare', orb: 'uncommon',
}
const ALL_WEAPONS: WeaponId[] = ['bow', 'sword', 'fireball', 'lightning', 'aura', 'orb']

function rarityForLevel(level: number): Rarity {
  if (level <= 2) return 'uncommon'
  if (level <= 4) return 'rare'
  if (level <= 6) return 'epic'
  return 'legendary'
}

// Fallback offered at level-up when every weapon is unlocked and maxed
const FALLBACK_HEAL: UpgradeDef = {
  id: 'fallback_heal', name: 'Recuperação', description: 'Cura 50% da vida máxima',
  rarity: 'common', weight: 1, apply: p => { p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.5) },
}

function weightedPick(pool: UpgradeDef[], count: number): Upgrade[] {
  const result: UpgradeDef[] = []
  const available = [...pool]
  for (let i = 0; i < count && available.length > 0; i++) {
    const total = available.reduce((s, u) => s + u.weight, 0)
    let r = Math.random() * total
    let chosen = available[available.length - 1]
    for (const u of available) { r -= u.weight; if (r <= 0) { chosen = u; break } }
    result.push(chosen)
    available.splice(available.indexOf(chosen), 1)
  }
  return result
}

// Level up: player only chooses WEAPONS (unlock new ones or level up existing ones)
export function pickWeaponUpgrades(count: number, playerWeapons: WeaponState[]): Upgrade[] {
  const weaponMap = new Map(playerWeapons.map(w => [w.id, w.level]))
  const pool: UpgradeDef[] = []

  for (const wid of ALL_WEAPONS) {
    if (!weaponMap.has(wid)) {
      pool.push({
        id: `w_unlock_${wid}`, name: WEAPON_NAMES[wid],
        description: `Desbloquear ${WEAPON_NAMES[wid]}`,
        rarity: WEAPON_RARITY[wid], weight: 5,
        apply: (p) => { p.weapons.push(createWeapon(wid)) },
      })
    } else {
      const curLevel = weaponMap.get(wid)!
      if (curLevel < maxLevelFor(wid)) {
        const newLevel = curLevel + 1
        pool.push({
          id: `w_up_${wid}`,
          name: `${WEAPON_NAMES[wid]} → Nv ${newLevel}`,
          description: newLevel === maxLevelFor(wid) ? `Evolui para forma final!`
            : newLevel === 6 ? `Nível 6: poder aprimorado!`
            : `Evoluir para nível ${newLevel}`,
          rarity: rarityForLevel(newLevel),
          weight: 4,
          apply: (p) => { const w = p.weapons.find(w => w.id === wid); if (w) w.level = newLevel },
        })
      }
    }
  }

  if (pool.length === 0) pool.push(FALLBACK_HEAL)
  return weightedPick(pool, count)
}

// Boss drop: player chooses a passive ITEM (damage reduction, range, crit, etc.)
export function pickItems(count: number): Upgrade[] {
  return weightedPick([...PASSIVE_POOL], count)
}

export function applyUpgrade(id: string, player: Player) {
  if (id === FALLBACK_HEAL.id) { FALLBACK_HEAL.apply(player); return }

  const passive = PASSIVE_POOL.find(u => u.id === id)
  if (passive) { passive.apply(player); return }

  if (id.startsWith('w_unlock_')) {
    const wid = id.replace('w_unlock_', '') as WeaponId
    if (!player.weapons.find(w => w.id === wid)) player.weapons.push(createWeapon(wid))
    return
  }
  if (id.startsWith('w_up_')) {
    const wid = id.replace('w_up_', '') as WeaponId
    const w = player.weapons.find(w => w.id === wid)
    if (w && w.level < maxLevelFor(wid)) w.level++
  }
}
