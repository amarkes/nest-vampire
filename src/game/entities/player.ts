import type { Vec2, InputState } from '../types'
import type { WeaponState } from '../weapons'
import type { MetaBonuses } from '../metaProgress'

export class Player {
  pos: Vec2
  vel: Vec2

  speed = 200
  radius = 14

  hp: number
  maxHp: number
  damage = 20
  projectileRange = 500
  pickupRadius = 80

  critChance = 0
  armor = 0
  xpMultiplier = 1
  luck = 0
  lifeSteal = 0

  slowTimer = 0
  slowFactor = 0.4

  level = 1
  xp = 0
  xpToNext = 50

  weapons: WeaponState[] = []

  constructor(x: number, y: number) {
    this.pos = { x, y }
    this.vel = { x: 0, y: 0 }
    this.hp = 100
    this.maxHp = 100
  }

  applyMeta(bonuses: MetaBonuses) {
    this.maxHp += bonuses.hpBonus
    this.hp = this.maxHp
    this.damage *= bonuses.damageMult
    this.speed *= bonuses.speedMult
    this.xpMultiplier *= bonuses.xpMult
    this.pickupRadius *= bonuses.magnetMult
    this.lifeSteal = bonuses.lifeStealPerKill
  }

  update(dt: number, input: InputState) {
    if (this.slowTimer > 0) this.slowTimer -= dt
    const effectiveSpeed = this.speed * (this.slowTimer > 0 ? this.slowFactor : 1)

    let dx = 0; let dy = 0
    if (input.up) dy -= 1
    if (input.down) dy += 1
    if (input.left) dx -= 1
    if (input.right) dx += 1

    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy); dx /= len; dy /= len
    }

    this.vel.x = dx * effectiveSpeed
    this.vel.y = dy * effectiveSpeed
    this.pos.x += this.vel.x * dt
    this.pos.y += this.vel.y * dt
  }

  gainXp(amount: number): boolean {
    this.xp += Math.floor(amount * this.xpMultiplier)
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext
      this.level++
      this.xpToNext = Math.floor(50 * Math.pow(1.4, this.level - 1))
      return true
    }
    return false
  }

  takeDamage(amount: number) {
    const reduced = amount * (1 - Math.min(this.armor, 0.85))
    this.hp = Math.max(0, this.hp - reduced)
  }

  get isDead() { return this.hp <= 0 }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const sx = this.pos.x - camX; const sy = this.pos.y - camY
    const r = this.radius
    const hpRatio = this.hp / this.maxHp
    const isSlow = this.slowTimer > 0

    ctx.strokeStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(sx, sy, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio); ctx.stroke()

    ctx.fillStyle = isSlow ? '#93c5fd' : '#ef4444'
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill()

    const spd = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2)
    if (spd > 0) {
      const nx = this.vel.x / spd; const ny = this.vel.y / spd
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath(); ctx.arc(sx + nx * (r * 0.55), sy + ny * (r * 0.55), 4, 0, Math.PI * 2); ctx.fill()
    }

    ctx.strokeStyle = isSlow ? '#bfdbfe' : '#fca5a5'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke()
  }
}
