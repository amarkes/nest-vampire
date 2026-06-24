export interface AchievementDef {
  id: string
  name: string
  description: string
}

export interface AchievementStats {
  timeElapsed: number
  kills: number
  level: number
  tookNoDamage: boolean
  weaponCount: number
  bossesKilled: number
}

const DEFS: AchievementDef[] = [
  { id: 'survivor',  name: 'Sobrevivente',     description: 'Sobreviva por 10 minutos' },
  { id: 'exterminator', name: 'Exterminador',  description: 'Elimine 1.000 inimigos' },
  { id: 'untouched', name: 'Intocável',        description: 'Complete uma partida sem tomar dano' },
  { id: 'arsenal',   name: 'Arsenal Completo', description: 'Tenha todas as 5 armas em uma partida' },
  { id: 'veteran',   name: 'Veterano',         description: 'Alcance o nível 20' },
  { id: 'bosshunter',name: 'Caçador de Bosses',description: 'Derrote seu primeiro boss' },
]

const CHECKS: Record<string, (s: AchievementStats) => boolean> = {
  survivor:    (s) => s.timeElapsed >= 600,
  exterminator:(s) => s.kills >= 1000,
  untouched:   (s) => s.tookNoDamage,
  arsenal:     (s) => s.weaponCount >= 5,
  veteran:     (s) => s.level >= 20,
  bosshunter:  (s) => s.bossesKilled >= 1,
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = DEFS

export function checkNewAchievements(stats: AchievementStats, already: string[]): string[] {
  const alreadySet = new Set(already)
  return DEFS
    .filter(d => !alreadySet.has(d.id) && CHECKS[d.id]?.(stats))
    .map(d => d.id)
}

export function getAchievement(id: string): AchievementDef | undefined {
  return DEFS.find(d => d.id === id)
}
