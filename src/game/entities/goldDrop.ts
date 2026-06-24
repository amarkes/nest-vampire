import type { Vec2 } from '../types'

export class GoldDrop {
  pos: Vec2
  amount: number
  radius = 7
  dead = false
  private bobTimer: number

  constructor(x: number, y: number, amount = 1) {
    this.pos = { x, y }
    this.amount = amount
    this.bobTimer = Math.random() * Math.PI * 2
  }

  update(dt: number) { this.bobTimer += dt * 2.5 }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.dead) return
    const sx = this.pos.x - camX
    const sy = this.pos.y - camY + Math.sin(this.bobTimer) * 2.5

    ctx.shadowBlur = 8
    ctx.shadowColor = '#fbbf24'
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath(); ctx.arc(sx, sy, this.radius, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0

    ctx.strokeStyle = '#fef08a'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(sx, sy, this.radius, 0, Math.PI * 2); ctx.stroke()

    ctx.fillStyle = '#1c1917'
    ctx.font = 'bold 8px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('G', sx, sy)
    ctx.textBaseline = 'alphabetic'
  }
}
