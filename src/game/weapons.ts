import type { Player } from './entities/player'
import type { Enemy } from './entities/enemy'
import { Projectile } from './entities/projectile'
import type { WeaponId } from './types'

export interface ChainSegment {
  x1: number; y1: number; x2: number; y2: number
  jx: number; jy: number
}

export interface WeaponState {
  id: WeaponId
  name: string
  level: number
  timer: number
  angle: number
  chainSegments: ChainSegment[]
  chainTimer: number
  hitCooldowns: Map<Enemy, number>
  // Bow level-6 burst: remaining arrows still to fire one-by-one, and the delay until the next one.
  burstQueue: Enemy[]
  burstTimer: number
}

const BASE_NAMES: Record<WeaponId, string> = {
  bow: 'Arco', sword: 'Espada Giratória', fireball: 'Bola de Fogo', lightning: 'Raio', aura: 'Aura de Gelo', orb: 'Orbe Arcano',
}
const EVOLVED_NAMES: Record<WeaponId, string> = {
  bow: 'Metralhadora Élfica', sword: 'Tempestade de Lâminas', fireball: 'Meteoro Infernal',
  lightning: 'Tempestade Elétrica', aura: 'Nevasca Eterna', orb: 'Singularidade',
}

export const MILESTONE_LEVEL = 6

// Per-weapon level caps. Most weapons evolve at level 8; the Raio (lightning)
// keeps scaling all the way to level 15 (one extra chain target per level).
const WEAPON_MAX_LEVELS: Record<WeaponId, number> = {
  bow: 10, sword: 8, fireball: 8, lightning: 15, aura: 8, orb: 8,
}
export function maxLevelFor(id: WeaponId): number { return WEAPON_MAX_LEVELS[id] }

// Level-6 milestone: each weapon gets a tangible power spike (more damage + more targets/area)
function m6(w: WeaponState): boolean { return w.level >= MILESTONE_LEVEL }
const M6_DMG = 1.4

// Cooldown tables (one entry per level; the bow runs to level 10, the rest to 8)
const COOLDOWNS: Record<WeaponId, number[]> = {
  bow:       [1.1,  95,  0.80, 0.68,  0.55,  0.48, 0.42, 0.35, 0.29, 0.20],
  sword:     [0,    0,    0,    0,    0,    0,    0,    0   ],
  fireball:  [2,  1.8,  1.6, 1.4, 1.1,  0.80, 0.7, 0.6],
  lightning: [1.8,  1.5,  1.2,  0.95, 0.78, 0.64, 0.54, 0.45],
  aura:      [1.5,  1.2,  1.0,  0.82, 0.67, 0.56, 0.47, 0.40],
  orb:       [0.50, 0.40, 0.32, 0.26, 0.22, 0.19, 0.17, 0.15],
}

export function createWeapon(id: WeaponId): WeaponState {
  return { id, name: BASE_NAMES[id], level: 1, timer: 0, angle: 0, chainSegments: [], chainTimer: 0, hitCooldowns: new Map(), burstQueue: [], burstTimer: 0 }
}

function lv(w: WeaponState): number { return Math.min(w.level, COOLDOWNS[w.id].length) - 1 }

export function updateWeapon(w: WeaponState, dt: number, player: Player, enemies: Enemy[], projectiles: Projectile[]) {
  // Update evolved name
  w.name = w.level >= maxLevelFor(w.id) ? EVOLVED_NAMES[w.id] : BASE_NAMES[w.id]

  w.timer -= dt
  if (w.chainTimer > 0) w.chainTimer -= dt

  for (const [e, t] of w.hitCooldowns) {
    if (e.dead) { w.hitCooldowns.delete(e); continue }
    const next = t - dt
    if (next <= 0) w.hitCooldowns.delete(e)
    else w.hitCooldowns.set(e, next)
  }

  switch (w.id) {
    case 'bow':       updateBow(w, dt, player, enemies, projectiles); break
    case 'sword':     updateSword(w, dt, player, enemies); break
    case 'fireball':  updateFireball(w, player, enemies, projectiles); break
    case 'lightning': updateLightning(w, player, enemies); break
    case 'aura':      updateAura(w, player, enemies); break
    case 'orb':       updateOrb(w, player, enemies); break
  }
}

// Delay between the sequential arrows of a level-6 burst (one shot after another).
const BOW_BURST_INTERVAL = 0.1

// Pick the `count` closest distinct living enemies to the player, nearest first.
function nearestEnemies(player: Player, enemies: Enemy[], count: number): Enemy[] {
  const alive = enemies.filter(e => !e.dead)
  alive.sort((a, b) => {
    const da = (a.pos.x - player.pos.x) ** 2 + (a.pos.y - player.pos.y) ** 2
    const db = (b.pos.x - player.pos.x) ** 2 + (b.pos.y - player.pos.y) ** 2
    return da - db
  })
  return alive.slice(0, count)
}

function fireArrowAt(w: WeaponState, player: Player, target: Enemy, projectiles: Projectile[], lvIdx: number) {
  const dx = target.pos.x - player.pos.x; const dy = target.pos.y - player.pos.y
  const len = Math.hypot(dx, dy) || 1
  const dmg = player.damage * (1 + lvIdx * 0.28) * (m6(w) ? M6_DMG : 1)
  projectiles.push(new Projectile(player.pos.x, player.pos.y, (dx / len) * 420, (dy / len) * 420, dmg, player.projectileRange))
}

function updateBow(w: WeaponState, dt: number, player: Player, enemies: Enemy[], projectiles: Projectile[]) {
  const lvIdx = lv(w)

  // Drain a pending level-6 burst: fire the next arrow once its interval elapses, each at its own monster.
  if (w.burstQueue.length > 0) {
    w.burstTimer -= dt
    if (w.burstTimer <= 0) {
      let target = w.burstQueue.shift()!
      if (target.dead) target = nearestEnemies(player, enemies, 1)[0] // queued monster died: retarget to nearest
      if (target) fireArrowAt(w, player, target, projectiles, lvIdx)
      w.burstTimer = BOW_BURST_INTERVAL
    }
    return
  }

  if (w.timer > 0) return

  // Level 6+ fires a 3-arrow burst, one after another at distinct monsters; otherwise a single arrow.
  const arrowCount = w.level >= 6 ? 3 : 1
  const distinct = nearestEnemies(player, enemies, arrowCount)
  if (distinct.length === 0) return

  // Build the full shot list; if fewer monsters than arrows, the extra arrows reuse the nearest ones.
  const targets: Enemy[] = []
  for (let i = 0; i < arrowCount; i++) targets.push(distinct[i % distinct.length])

  fireArrowAt(w, player, targets[0], projectiles, lvIdx) // first arrow flies immediately
  w.burstQueue = targets.slice(1)
  w.burstTimer = BOW_BURST_INTERVAL
  w.timer = COOLDOWNS.bow[lvIdx]
}

function updateSword(w: WeaponState, dt: number, player: Player, enemies: Enemy[]) {
  const lvIdx = lv(w)
  const orbitR = (55 + lvIdx * 8) * (m6(w) ? 1.2 : 1)
  const rotSpeed = 2.5 + lvIdx * 0.25
  const dmg = player.damage * (0.7 + lvIdx * 0.22) * (m6(w) ? M6_DMG : 1)
  const hitR = orbitR + 14  // entire zone within orbit radius deals damage

  w.angle += rotSpeed * dt

  for (const e of enemies) {
    if (e.dead || w.hitCooldowns.has(e)) continue
    const dx = e.pos.x - player.pos.x; const dy = e.pos.y - player.pos.y
    if (dx * dx + dy * dy <= (hitR + e.radius) ** 2) {
      e.takeDamage(dmg)
      w.hitCooldowns.set(e, 0.5)
    }
  }
}

function updateFireball(w: WeaponState, player: Player, enemies: Enemy[], projectiles: Projectile[]) {
  if (w.timer > 0) return
  const lvIdx = lv(w)

  let nearest: Enemy | null = null; let nearestSq = Infinity
  for (const e of enemies) {
    if (e.dead) continue
    const dx = e.pos.x - player.pos.x; const dy = e.pos.y - player.pos.y
    const sq = dx * dx + dy * dy
    if (sq < nearestSq) { nearestSq = sq; nearest = e }
  }
  if (!nearest) return

  const dx = nearest.pos.x - player.pos.x; const dy = nearest.pos.y - player.pos.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const dmg = player.damage * (1.4 + lvIdx * 0.32) * (m6(w) ? M6_DMG : 1)
  // The ball grows every level; it pierces and damages everything it passes through up to its range.
  const ballR = (18 + lvIdx * 6) * (m6(w) ? 1.3 : 1)
  const proj = new Projectile(player.pos.x, player.pos.y, (dx / len) * 220, (dy / len) * 220, dmg, player.projectileRange * 1.3)
  proj.isFireball = true
  proj.piercing = true
  proj.radius = ballR
  projectiles.push(proj)
  w.timer = COOLDOWNS.fireball[lvIdx]
}

function updateLightning(w: WeaponState, player: Player, enemies: Enemy[]) {
  if (w.timer > 0) return
  const lvIdx = lv(w)
  // One extra monster hit per level: lvl 1 -> 1 target, lvl 2 -> 2, ... up to lvl 15 -> 15.
  const chainCount = w.level
  const dmg = player.damage * (2.4 + w.level * 0.45) * (m6(w) ? M6_DMG : 1)

  const alive = enemies.filter(e => !e.dead)
  if (alive.length === 0) return

  alive.sort((a, b) => {
    const da = (a.pos.x - player.pos.x) ** 2 + (a.pos.y - player.pos.y) ** 2
    const db = (b.pos.x - player.pos.x) ** 2 + (b.pos.y - player.pos.y) ** 2
    return da - db
  })

  w.chainSegments = []
  let lx = player.pos.x; let ly = player.pos.y
  for (const t of alive.slice(0, chainCount)) {
    t.takeDamage(dmg)
    const mx = (lx + t.pos.x) / 2 + (Math.random() - 0.5) * 28
    const my = (ly + t.pos.y) / 2 + (Math.random() - 0.5) * 28
    w.chainSegments.push({ x1: lx, y1: ly, x2: t.pos.x, y2: t.pos.y, jx: mx, jy: my })
    lx = t.pos.x; ly = t.pos.y
  }
  w.chainTimer = 0.25
  w.timer = COOLDOWNS.lightning[lvIdx]
}

function updateAura(w: WeaponState, player: Player, enemies: Enemy[]) {
  const lvIdx = lv(w)
  const radius = (60 + lvIdx * 20) * (m6(w) ? 1.25 : 1)

  // Continuously slow all enemies inside the aura
  for (const e of enemies) {
    if (e.dead) continue
    const dx = e.pos.x - player.pos.x; const dy = e.pos.y - player.pos.y
    if (dx * dx + dy * dy <= radius * radius) {
      e.applySlow(0.35, 0.5)
    }
  }

  if (w.timer > 0) return
  const dmg = player.damage * (0.4 + lvIdx * 0.14) * (m6(w) ? M6_DMG : 1)

  for (const e of enemies) {
    if (e.dead || w.hitCooldowns.has(e)) continue
    const dx = e.pos.x - player.pos.x; const dy = e.pos.y - player.pos.y
    if (dx * dx + dy * dy <= radius * radius) {
      e.takeDamage(dmg)
      w.hitCooldowns.set(e, 1.0)
    }
  }
  w.timer = COOLDOWNS.aura[lvIdx]
}

function updateOrb(w: WeaponState, player: Player, enemies: Enemy[]) {
  if (w.timer > 0) return
  const lvIdx = lv(w)
  const radius = m6(w) ? 130 + (lvIdx - 5) * 35 : 50 + lvIdx * 16
  const dmg = player.damage * (0.18 + lvIdx * 0.07) * (m6(w) ? M6_DMG : 1)

  for (const e of enemies) {
    if (e.dead || w.hitCooldowns.has(e)) continue
    const dx = e.pos.x - player.pos.x; const dy = e.pos.y - player.pos.y
    if (dx * dx + dy * dy <= (radius + e.radius) ** 2) {
      e.takeDamage(dmg)
      w.hitCooldowns.set(e, COOLDOWNS.orb[lvIdx] * 0.8)
    }
  }
  w.timer = COOLDOWNS.orb[lvIdx]
}

function renderOrb(w: WeaponState, ctx: CanvasRenderingContext2D, camX: number, camY: number, player: Player) {
  const lvIdx = lv(w)
  const radius = m6(w) ? 130 + (lvIdx - 5) * 35 : 50 + lvIdx * 16
  const px = player.pos.x - camX; const py = player.pos.y - camY
  const pulse = (Math.sin(Date.now() / 280) + 1) / 2
  const alpha = 0.06 + pulse * 0.07
  const isEvolved = w.level >= maxLevelFor(w.id)
  const color = isEvolved ? '220,130,255' : '167,139,250'

  const maxTimer = COOLDOWNS.orb[lvIdx]
  const timeSincePulse = maxTimer - w.timer
  if (timeSincePulse >= 0 && timeSincePulse < 0.18) {
    const t = timeSincePulse / 0.18
    ctx.strokeStyle = `rgba(${color},${(1 - t) * 0.7})`
    ctx.lineWidth = 5
    ctx.beginPath(); ctx.arc(px, py, radius * (0.85 + t * 0.2), 0, Math.PI * 2); ctx.stroke()
  }

  ctx.strokeStyle = `rgba(${color},${alpha + 0.18})`
  ctx.lineWidth = isEvolved ? 3 : 2
  ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = `rgba(${color},${alpha})`
  ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill()
}

export function renderWeapon(w: WeaponState, ctx: CanvasRenderingContext2D, camX: number, camY: number, player: Player) {
  switch (w.id) {
    case 'sword':     renderSword(w, ctx, camX, camY, player); break
    case 'aura':      renderAura(w, ctx, camX, camY, player); break
    case 'orb':       renderOrb(w, ctx, camX, camY, player); break
    case 'lightning': renderLightning(w, ctx, camX, camY); break
    default: break
  }
}

function renderSword(w: WeaponState, ctx: CanvasRenderingContext2D, camX: number, camY: number, player: Player) {
  const lvIdx = lv(w)
  const bladeCount = Math.min(1 + Math.floor(lvIdx / 1.5), 6) + (m6(w) ? 2 : 0)
  const orbitR = (55 + lvIdx * 8) * (m6(w) ? 1.2 : 1)
  const px = player.pos.x - camX; const py = player.pos.y - camY
  const isEvolved = w.level >= maxLevelFor(w.id)

  for (let i = 0; i < bladeCount; i++) {
    const a = w.angle + (i / bladeCount) * Math.PI * 2
    const bx = px + Math.cos(a) * orbitR; const by = py + Math.sin(a) * orbitR
    ctx.save()
    ctx.translate(bx, by)
    ctx.rotate(a + Math.PI / 4)
    ctx.fillStyle = isEvolved ? '#fbbf24' : '#e2e8f0'
    ctx.fillRect(-12, -4, 24, 8)
    ctx.strokeStyle = isEvolved ? '#f59e0b' : '#94a3b8'
    ctx.lineWidth = 1
    ctx.strokeRect(-12, -4, 24, 8)
    ctx.restore()
  }
}

function renderAura(w: WeaponState, ctx: CanvasRenderingContext2D, camX: number, camY: number, player: Player) {
  const lvIdx = lv(w)
  const radius = (60 + lvIdx * 20) * (m6(w) ? 1.25 : 1)
  const px = player.pos.x - camX; const py = player.pos.y - camY
  const pulse = (Math.sin(Date.now() / 400) + 1) / 2
  const alpha = 0.06 + pulse * 0.08
  const isEvolved = w.level >= maxLevelFor(w.id)
  const color = '100,210,255'

  // Expanding pulse ring when aura just fired
  const maxTimer = COOLDOWNS.aura[lvIdx]
  const timeSincePulse = maxTimer - w.timer
  if (timeSincePulse >= 0 && timeSincePulse < 0.25) {
    const t = timeSincePulse / 0.25
    const flashAlpha = (1 - t) * 0.55
    const flashRadius = radius * (0.8 + t * 0.25)
    ctx.strokeStyle = `rgba(${color},${flashAlpha})`
    ctx.lineWidth = 5
    ctx.beginPath(); ctx.arc(px, py, flashRadius, 0, Math.PI * 2); ctx.stroke()
  }

  ctx.strokeStyle = `rgba(${color},${alpha + 0.15})`
  ctx.lineWidth = isEvolved ? 3 : 2
  ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = `rgba(${color},${alpha})`
  ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill()
}

function renderLightning(w: WeaponState, ctx: CanvasRenderingContext2D, camX: number, camY: number) {
  if (w.chainTimer <= 0 || w.chainSegments.length === 0) return
  const alpha = w.chainTimer / 0.25
  ctx.save()
  ctx.strokeStyle = `rgba(196,255,214,${alpha})`
  ctx.lineWidth = 2
  ctx.shadowBlur = 10
  ctx.shadowColor = '#86efac'
  for (const seg of w.chainSegments) {
    ctx.beginPath()
    ctx.moveTo(seg.x1 - camX, seg.y1 - camY)
    ctx.quadraticCurveTo(seg.jx - camX, seg.jy - camY, seg.x2 - camX, seg.y2 - camY)
    ctx.stroke()
  }
  ctx.restore()
}
