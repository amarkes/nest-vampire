import type { Vec2 } from '../types'

export class XpOrb {
  pos: Vec2
  value: number
  radius: number
  dead = false
  private bobTimer: number

  constructor(x: number, y: number, value = 5) {
    this.pos = { x, y }
    this.value = value
    this.radius = 6
    this.bobTimer = Math.random() * Math.PI * 2
  }

  update(dt: number) {
    this.bobTimer += dt * 2.5
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.dead) return
    const sx = this.pos.x - camX
    const sy = this.pos.y - camY + Math.sin(this.bobTimer) * 2.5

    ctx.fillStyle = '#6ee7b7'
    ctx.beginPath()
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#34d399'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2)
    ctx.stroke()

    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(sx - 1.5, sy - 1.5, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}
