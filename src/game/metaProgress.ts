const KEY = 'nest-vampire-meta'

export interface MetaProgress {
  gold: number
  hpLevel: number           // each = +15 HP (max 10)
  damageLevel: number       // each = +6% damage (max 8)
  speedLevel: number        // each = +5% speed (max 8)
  xpLevel: number           // each = +10% XP (max 6)
  magnetLevel: number       // each = +20% pickup radius (max 5)
  lifestealLevel: number    // each = +1 HP per kill (max 5)
  achievements: string[]
}

const DEFAULT: MetaProgress = {
  gold: 0, hpLevel: 0, damageLevel: 0, speedLevel: 0, xpLevel: 0, magnetLevel: 0, lifestealLevel: 0, achievements: [],
}

export function loadMeta(): MetaProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveMeta(meta: MetaProgress) {
  try { localStorage.setItem(KEY, JSON.stringify(meta)) } catch { /* ignore */ }
}

export interface MetaBonuses {
  hpBonus: number
  damageMult: number
  speedMult: number
  xpMult: number
  magnetMult: number
  lifeStealPerKill: number
}

export function getBonuses(meta: MetaProgress): MetaBonuses {
  return {
    hpBonus:          meta.hpLevel * 15,
    damageMult:       1 + meta.damageLevel * 0.06,
    speedMult:        1 + meta.speedLevel  * 0.05,
    xpMult:           1 + meta.xpLevel     * 0.10,
    magnetMult:       1 + meta.magnetLevel * 0.20,
    lifeStealPerKill: meta.lifestealLevel * 0.4,
  }
}

export interface ShopItem {
  key: keyof Pick<MetaProgress, 'hpLevel' | 'damageLevel' | 'speedLevel' | 'xpLevel' | 'magnetLevel' | 'lifestealLevel'>
  name: string
  description: string
  baseCost: number
  maxLevel: number
}

export function getItemCost(item: ShopItem, currentLevel: number): number {
  // Cost climbs steeply with each level so upgrades stay meaningful purchases
  return Math.round(item.baseCost * Math.pow(currentLevel + 1, 1.55))
}

export const SHOP_ITEMS: ShopItem[] = [
  { key: 'hpLevel',        name: 'Vigor',        description: '+15 HP máximo',         baseCost: 60,  maxLevel: 10 },
  { key: 'damageLevel',    name: 'Força',        description: '+6% dano base',         baseCost: 80,  maxLevel: 8  },
  { key: 'speedLevel',     name: 'Impulso',      description: '+5% velocidade base',   baseCost: 60,  maxLevel: 8  },
  { key: 'xpLevel',        name: 'Sabedoria',    description: '+10% XP obtida',        baseCost: 90,  maxLevel: 6  },
  { key: 'magnetLevel',    name: 'Magnetismo',   description: '+20% raio de coleta',   baseCost: 80,  maxLevel: 5  },
  { key: 'lifestealLevel', name: 'Vampirismo',   description: '+0,4 HP por kill',      baseCost: 280, maxLevel: 5  },
]
