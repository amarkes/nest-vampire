import type { Vec2 } from '../types'

export type WorldPickupType = 'heal_shrine' | 'xp_magnet'

export class WorldPickup {
  pos: Vec2
  type: WorldPickupType
  radius = 14
  dead = false
  private bobTimer: number
  private glowTimer = 0

  constructor(x: number, y: number, type: WorldPickupType) {
    this.pos = { x, y }
    this.type = type
    this.bobTimer = Math.random() * Math.PI * 2
  }

  update(dt: number) {
    this.bobTimer += dt * 1.5
    this.glowTimer += dt
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.dead) return
    const sx = this.pos.x - camX
    const sy = this.pos.y - camY + Math.sin(this.bobTimer) * 4
    const pulse = 0.75 + 0.25 * Math.sin(this.glowTimer * 3)

    if (this.type === 'heal_shrine') {
      ctx.shadowBlur = 18 * pulse
      ctx.shadowColor = '#f43f5e'
      ctx.fillStyle = '#1a0a0d'
      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(sx, sy - this.radius)
      ctx.lineTo(sx + this.radius, sy)
      ctx.lineTo(sx, sy + this.radius)
      ctx.lineTo(sx - this.radius, sy)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#fb7185'
      ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.moveTo(sx, sy - 7); ctx.lineTo(sx, sy + 7); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(sx - 7, sy); ctx.lineTo(sx + 7, sy); ctx.stroke()
    } else {
      ctx.shadowBlur = 20 * pulse
      ctx.shadowColor = '#fbbf24'
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(sx, sy, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#fde68a'
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + this.glowTimer * 0.8
        const inner = this.radius + 2
        const outer = this.radius + 8
        ctx.beginPath()
        ctx.moveTo(sx + Math.cos(angle) * inner, sy + Math.sin(angle) * inner)
        ctx.lineTo(sx + Math.cos(angle) * outer, sy + Math.sin(angle) * outer)
        ctx.stroke()
      }
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(sx, sy, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
