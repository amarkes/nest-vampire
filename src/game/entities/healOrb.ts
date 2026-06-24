import type { Vec2 } from '../types'

export class HealOrb {
  pos: Vec2
  healAmount: number
  radius = 8
  dead = false
  private bobTimer: number

  constructor(x: number, y: number, healAmount = 20) {
    this.pos = { x, y }
    this.healAmount = healAmount
    this.bobTimer = Math.random() * Math.PI * 2
  }

  update(dt: number) { this.bobTimer += dt * 2 }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.dead) return
    const sx = this.pos.x - camX
    const sy = this.pos.y - camY + Math.sin(this.bobTimer) * 3

    ctx.shadowBlur = 10
    ctx.shadowColor = '#f472b6'
    ctx.fillStyle = '#ec4899'
    ctx.beginPath(); ctx.arc(sx, sy, this.radius, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0

    ctx.strokeStyle = '#fbcfe8'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(sx, sy, this.radius, 0, Math.PI * 2); ctx.stroke()

    // Cross symbol
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(sx, sy - 4); ctx.lineTo(sx, sy + 4); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(sx - 4, sy); ctx.lineTo(sx + 4, sy); ctx.stroke()
  }
}
