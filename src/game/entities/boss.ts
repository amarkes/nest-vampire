import type { Vec2 } from '../types'

export type BossId = 'goblin_king' | 'infernal_golem' | 'frost_titan' | 'shadow_reaper'

export interface BossFiredProjectile {
  x: number; y: number; vx: number; vy: number; damage: number
}

interface BossDef {
  name: string; hp: number; speed: number; radius: number
  color: string; stroke: string; specialCooldown: number
}

const DEFS: Record<BossId, BossDef> = {
  goblin_king:    { name: 'Goblin King',    hp: 600,  speed: 65,  radius: 30, color: '#14532d', stroke: '#4ade80', specialCooldown: 3.0 },
  infernal_golem: { name: 'Infernal Golem', hp: 1000, speed: 40,  radius: 38, color: '#78350f', stroke: '#fb923c', specialCooldown: 2.0 },
  frost_titan:    { name: 'Frost Titan',    hp: 1400, speed: 30,  radius: 44, color: '#1e3a5f', stroke: '#93c5fd', specialCooldown: 4.0 },
  shadow_reaper:  { name: 'Shadow Reaper',  hp: 900,  speed: 100, radius: 28, color: '#2e1065', stroke: '#c4b5fd', specialCooldown: 5.0 },
}

export class Boss {
  pos: Vec2
  vel: Vec2
  hp: number
  maxHp: number
  speed: number
  radius: number
  type: BossId
  name: string
  dead = false
  justDied = false
  damageCooldown = 0
  slowFactor = 1.0
  slowTimer = 0
  hitFlashTimer = 0
  damageMult = 1
  tier = 0

  // Bosses are immune to slow — no-op so weapon code can call applySlow safely
  applySlow(_factor: number, _duration: number) {}

  private specialTimer: number
  private specialCooldown: number
  private color: string
  private stroke: string
  teleportFlash = 0

  constructor(x: number, y: number, type: BossId, hpMult = 1, damageMult = 1, tier = 0) {
    const d = DEFS[type]
    this.pos = { x, y }
    this.vel = { x: 0, y: 0 }
    this.type = type
    this.name = tier > 0 ? `${d.name} +${tier}` : d.name
    this.hp = Math.floor(d.hp * hpMult)
    this.maxHp = this.hp
    this.damageMult = damageMult
    this.tier = tier
    this.speed = d.speed
    this.radius = d.radius
    this.color = d.color
    this.stroke = d.stroke
    this.specialCooldown = d.specialCooldown
    this.specialTimer = d.specialCooldown * 0.5 // first ability sooner
  }

  takeDamage(amount: number) {
    if (this.dead) return
    this.hp -= amount
    if (this.hp <= 0) { this.dead = true; this.justDied = true }
  }

  update(
    dt: number,
    playerPos: Vec2,
    onProjectiles: (projs: BossFiredProjectile[]) => void,
    onSlowPlayer: () => void,
  ) {
    if (this.dead) return
    if (this.damageCooldown > 0) this.damageCooldown -= dt
    if (this.teleportFlash > 0) this.teleportFlash -= dt

    const dx = playerPos.x - this.pos.x
    const dy = playerPos.y - this.pos.y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > this.radius) {
      this.vel.x = (dx / len) * this.speed
      this.vel.y = (dy / len) * this.speed
      this.pos.x += this.vel.x * dt
      this.pos.y += this.vel.y * dt
    }

    this.specialTimer -= dt
    if (this.specialTimer <= 0) {
      this.specialTimer = this.specialCooldown
      this.fireAbility(playerPos, onProjectiles, onSlowPlayer)
    }
  }

  private fireAbility(
    playerPos: Vec2,
    onProjectiles: (projs: BossFiredProjectile[]) => void,
    onSlowPlayer: () => void,
  ) {
    switch (this.type) {
      case 'goblin_king': {
        const projs: BossFiredProjectile[] = []
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2
          projs.push({ x: this.pos.x, y: this.pos.y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, damage: 15 * this.damageMult })
        }
        onProjectiles(projs)
        break
      }
      case 'infernal_golem': {
        const projs: BossFiredProjectile[] = []
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2
          projs.push({ x: this.pos.x, y: this.pos.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, damage: 22 * this.damageMult })
        }
        onProjectiles(projs)
        break
      }
      case 'frost_titan':
        onSlowPlayer()
        break
      case 'shadow_reaper': {
        const a = Math.random() * Math.PI * 2
        const dist = this.radius + 80
        this.pos.x = playerPos.x + Math.cos(a) * dist
        this.pos.y = playerPos.y + Math.sin(a) * dist
        this.teleportFlash = 0.5
        break
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.dead) return
    const sx = this.pos.x - camX
    const sy = this.pos.y - camY
    const r = this.radius

    if (this.type === 'shadow_reaper' && this.teleportFlash > 0) {
      const a = this.teleportFlash / 0.5
      ctx.fillStyle = `rgba(196,181,253,${a * 0.4})`
      ctx.beginPath()
      ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.shadowBlur = 20
    ctx.shadowColor = this.stroke
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.strokeStyle = this.stroke
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.stroke()

    // inner glow ring
    const hpRatio = this.hp / this.maxHp
    ctx.strokeStyle = this.stroke
    ctx.lineWidth = 5
    ctx.globalAlpha = 0.25
    ctx.beginPath()
    ctx.arc(sx, sy, r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio)
    ctx.stroke()
    ctx.globalAlpha = 1

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(this.name, sx, sy - r - 14)
    ctx.textBaseline = 'alphabetic'
  }
}
