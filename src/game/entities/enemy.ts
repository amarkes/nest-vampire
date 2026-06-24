import type { Vec2 } from '../types'

export type EnemyType = 'slime' | 'skeleton' | 'orc' | 'spider' | 'goblin' | 'demon' | 'shadow'

const TYPE_STYLES: Record<EnemyType, { fill: string; stroke: string }> = {
  slime:    { fill: '#16a34a', stroke: '#4ade80' },
  skeleton: { fill: '#94a3b8', stroke: '#e2e8f0' },
  orc:      { fill: '#4d7c0f', stroke: '#84cc16' },
  spider:   { fill: '#7f1d1d', stroke: '#f87171' },
  goblin:   { fill: '#92400e', stroke: '#f59e0b' },
  demon:    { fill: '#3b0764', stroke: '#a855f7' },
  shadow:   { fill: '#111827', stroke: '#9ca3af' },
}

export class Enemy {
  pos: Vec2
  vel: Vec2
  hp: number
  maxHp: number
  speed: number
  damage: number
  radius: number
  type: EnemyType
  dead = false
  justDied = false
  damageCooldown = 0
  slowFactor = 1.0
  slowTimer = 0
  hitFlashTimer = 0

  constructor(x: number, y: number, type: EnemyType, hp: number, speed: number, damage: number, radius: number) {
    this.pos = { x, y }
    this.vel = { x: 0, y: 0 }
    this.type = type
    this.hp = hp
    this.maxHp = hp
    this.speed = speed
    this.damage = damage
    this.radius = radius
  }

  applySlow(factor: number, duration: number) {
    this.slowFactor = factor
    this.slowTimer = duration
  }

  update(dt: number, target: Vec2) {
    if (this.dead) return
    const dx = target.x - this.pos.x; const dy = target.y - this.pos.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const spd = this.slowTimer > 0 ? this.speed * this.slowFactor : this.speed
    if (len > 0) { this.vel.x = (dx / len) * spd; this.vel.y = (dy / len) * spd }
    this.pos.x += this.vel.x * dt
    this.pos.y += this.vel.y * dt
    if (this.damageCooldown > 0) this.damageCooldown -= dt
    if (this.slowTimer > 0) this.slowTimer -= dt
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt
  }

  takeDamage(amount: number) {
    if (this.dead) return
    this.hp -= amount
    this.hitFlashTimer = 0.1
    if (this.hp <= 0) { this.dead = true; this.justDied = true }
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.dead) return
    const sx = this.pos.x - camX; const sy = this.pos.y - camY
    const r = this.radius
    const style = TYPE_STYLES[this.type]

    ctx.fillStyle = style.fill
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = style.stroke
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.stroke()

    // Slow (ice) indicator
    if (this.slowTimer > 0) {
      const iceAlpha = Math.min(0.9, this.slowTimer * 2)
      ctx.strokeStyle = `rgba(100,210,255,${iceAlpha})`
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(sx, sy, r + 2, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.hitFlashTimer / 0.1 * 0.5})`
      ctx.beginPath()
      ctx.arc(sx, sy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // HP bar
    const bw = r * 2; const bh = 3
    const bx = sx - r; const by = sy - r - 8
    ctx.fillStyle = '#111'
    ctx.fillRect(bx, by, bw, bh)
    ctx.fillStyle = style.stroke
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh)
  }
}

// Per-type stats. Each type sits in a clear HP tier so a tougher (later) enemy
// always has noticeably more life than a weaker one — base HP + a time-scaling factor.
//   hp: base health  |  scale: HP grows by hp*(timeElapsed/scale)  |  speed/damage/radius fixed per type
const TYPE_STATS: Record<EnemyType, { hp: number; scale: number; speed: number; damage: number; radius: number }> = {
  slime:    { hp: 12,  scale: 200, speed: 70,  damage: 8,  radius: 9  },
  spider:   { hp: 28,  scale: 190, speed: 120, damage: 7,  radius: 10 },
  skeleton: { hp: 55,  scale: 160, speed: 75,  damage: 10, radius: 12 },
  goblin:   { hp: 95,  scale: 150, speed: 110, damage: 12, radius: 10 },
  orc:      { hp: 170, scale: 140, speed: 45,  damage: 14, radius: 18 },
  shadow:   { hp: 230, scale: 130, speed: 150, damage: 13, radius: 11 },
  demon:    { hp: 320, scale: 120, speed: 60,  damage: 18, radius: 16 },
}

// Factory functions — HP scales with time, speed is fixed per type
export function spawnEnemy(type: EnemyType, x: number, y: number, timeElapsed: number): Enemy {
  const s = TYPE_STATS[type]
  const hp = Math.floor(s.hp * (1 + timeElapsed / s.scale))
  return new Enemy(x, y, type, hp, s.speed, s.damage, s.radius)
}
