import type { Vec2 } from '../types'

export class Projectile {
  pos: Vec2
  vel: Vec2
  damage: number
  radius: number
  dead = false
  aoeRadius = 0
  aoeDamage = 0
  isFireball = false
  // Piercing shots travel through everything, damaging each target once until they reach max range.
  piercing = false
  hit = new Set<object>()
  private maxDistance: number
  private traveled = 0

  constructor(x: number, y: number, vx: number, vy: number, damage: number, maxDistance = 500) {
    this.pos = { x, y }
    this.vel = { x: vx, y: vy }
    this.damage = damage
    this.radius = 5
    this.maxDistance = maxDistance
  }

  update(dt: number) {
    if (this.dead) return
    const dx = this.vel.x * dt; const dy = this.vel.y * dt
    this.pos.x += dx; this.pos.y += dy
    this.traveled += Math.sqrt(dx * dx + dy * dy)
    if (this.traveled >= this.maxDistance) this.dead = true
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.dead) return
    const sx = this.pos.x - camX; const sy = this.pos.y - camY

    if (this.isFireball) {
      // Ball scales with the projectile radius (which grows per weapon level): glow + core + hot center.
      ctx.fillStyle = 'rgba(249,115,22,0.22)'
      ctx.beginPath()
      ctx.arc(sx, sy, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.arc(sx, sy, this.radius * 0.68, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fef08a'
      ctx.beginPath()
      ctx.arc(sx, sy, this.radius * 0.34, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const spd = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2)
      if (spd > 0) {
        const nx = this.vel.x / spd; const ny = this.vel.y / spd
        ctx.strokeStyle = 'rgba(251,191,36,0.35)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx - nx * 14, sy - ny * 14)
        ctx.stroke()
      }
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(sx, sy, this.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
