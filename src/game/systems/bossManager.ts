import { Boss } from '../entities/boss'
import { EnemyProjectile } from '../entities/enemyProjectile'
import { HealOrb } from '../entities/healOrb'
import { GoldDrop } from '../entities/goldDrop'
import type { BossId, BossFiredProjectile } from '../entities/boss'
import type { Vec2 } from '../types'

// Bosses spawn every 2 minutes, cycling through all types, scaling up each wave
const BOSS_INTERVAL = 120
const BOSS_CYCLE: BossId[] = ['goblin_king', 'infernal_golem', 'frost_titan', 'shadow_reaper']

const BOSS_GOLD: Record<BossId, number> = {
  goblin_king: 25, infernal_golem: 40, frost_titan: 55, shadow_reaper: 70,
}

export interface BossManagerContext {
  playerPos: Vec2
  playerRadius: number
  canvasW: number
  canvasH: number
  onSlowPlayer: () => void
  onBossAlert: (name: string) => void
}

export class BossManager {
  private spawnedCount = 0
  private nextSpawnTime = BOSS_INTERVAL
  private boss: Boss | null = null

  getActiveBoss(): Boss | null { return this.boss }

  update(
    dt: number,
    timeElapsed: number,
    ctx: BossManagerContext,
    enemyProjectiles: EnemyProjectile[],
    healOrbs: HealOrb[],
    goldDrops: GoldDrop[],
  ): number {
    // Trigger boss spawns every BOSS_INTERVAL seconds, scaling each wave
    if (!this.boss && timeElapsed >= this.nextSpawnTime) {
      const tier = this.spawnedCount
      const id = BOSS_CYCLE[this.spawnedCount % BOSS_CYCLE.length]
      this.spawnedCount++
      this.nextSpawnTime += BOSS_INTERVAL
      const hpMult = 1 + tier * 0.6
      const damageMult = 1 + tier * 0.35
      const spawnX = ctx.playerPos.x + (ctx.canvasW / 2 + 80) * (Math.random() > 0.5 ? 1 : -1)
      const spawnY = ctx.playerPos.y + (ctx.canvasH / 2 + 80) * (Math.random() > 0.5 ? 1 : -1)
      this.boss = new Boss(spawnX, spawnY, id, hpMult, damageMult, tier)
      ctx.onBossAlert(this.boss.name)
    }

    if (!this.boss) return 0

    const b = this.boss
    b.update(dt, ctx.playerPos,
      (projs: BossFiredProjectile[]) => {
        for (const p of projs) enemyProjectiles.push(new EnemyProjectile(p.x, p.y, p.vx, p.vy, p.damage))
      },
      ctx.onSlowPlayer,
    )

    if (b.dead) {
      const goldEarned = BOSS_GOLD[b.type]
      healOrbs.push(new HealOrb(b.pos.x, b.pos.y, 50))
      for (let i = 0; i < 5; i++) {
        goldDrops.push(new GoldDrop(b.pos.x + (Math.random() - 0.5) * 60, b.pos.y + (Math.random() - 0.5) * 60, Math.floor(goldEarned / 5)))
      }
      this.boss = null
      return goldEarned
    }

    return 0
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    this.boss?.render(ctx, camX, camY)
  }
}
