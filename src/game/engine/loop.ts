import { Player } from '../entities/player'
import { Spawner } from '../systems/spawner'
import { BossManager } from '../systems/bossManager'
import { XpOrb } from '../entities/xpOrb'
import { HealOrb } from '../entities/healOrb'
import { GoldDrop } from '../entities/goldDrop'
import { WorldPickup } from '../entities/worldPickup'
import { EnemyProjectile } from '../entities/enemyProjectile'
import { InputManager } from './input'
import { pickWeaponUpgrades, pickItems, applyUpgrade } from '../upgrades'
import { createWeapon, updateWeapon, renderWeapon, maxLevelFor } from '../weapons'
import { loadMeta, getBonuses } from '../metaProgress'
import type { CharacterDef } from '../characters'
import type { GameStats, Upgrade } from '../types'
import type { Enemy, EnemyType } from '../entities/enemy'
import type { Projectile } from '../entities/projectile'

const GRID = 64

function circles(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
  const dx = ax - bx; const dy = ay - by
  return dx * dx + dy * dy < (ar + br) ** 2
}

function drawGrid(ctx: CanvasRenderingContext2D, camX: number, camY: number, w: number, h: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  const sx = Math.floor(camX / GRID) * GRID; const sy = Math.floor(camY / GRID) * GRID
  for (let x = sx; x <= camX + w; x += GRID) { ctx.beginPath(); ctx.moveTo(x - camX, 0); ctx.lineTo(x - camX, h); ctx.stroke() }
  for (let y = sy; y <= camY + h; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y - camY); ctx.lineTo(w, y - camY); ctx.stroke() }
}

export interface LoopCallbacks {
  onStats: (stats: GameStats) => void
  onLevelUp: (upgrades: Upgrade[], rerollsLeft: number) => void
  onItemSelect: (items: Upgrade[]) => void
  onGameOver: (stats: GameStats) => void
  onBossAlert: (name: string) => void
}

export function createLoop(canvas: HTMLCanvasElement, character: CharacterDef, cb: LoopCallbacks) {
  const meta = loadMeta()
  const bonuses = getBonuses(meta)

  const player = new Player(0, 0)
  player.maxHp = Math.floor(100 * character.hpMultiplier)
  player.hp = player.maxHp
  player.speed *= character.speedMultiplier
  player.damage *= character.damageMultiplier
  player.weapons = [createWeapon(character.startingWeapon)]
  player.applyMeta(bonuses)
  player.lifeSteal += character.lifeStealBonus

  const input = new InputManager()
  const spawner = new Spawner()
  const bossManager = new BossManager()

  let enemies: Enemy[] = []
  let projectiles: Projectile[] = []
  let enemyProjectiles: EnemyProjectile[] = []
  let xpOrbs: XpOrb[] = []
  let healOrbs: HealOrb[] = []
  let goldDrops: GoldDrop[] = []
  let worldPickups: WorldPickup[] = []

  let kills = 0
  let totalGold = 0
  let timeElapsed = 0
  let waitingLevelUp = false
  let waitingItemPick = false
  let pendingPassivePick = false  // set when leveling to an even level: extra PASSIVE_POOL pick after the weapon choice
  let gameEnded = false
  let tookNoDamage = true
  let bossesKilled = 0
  let rerollsLeft = 3
  let healShrineTimer = 60 + Math.random() * 30
  let xpMagnetTimer = 40 + Math.random() * 20

  const XP_BASE: Record<EnemyType, number> = { slime: 5, skeleton: 8, orc: 18, spider: 6, goblin: 12, demon: 25, shadow: 10 }
  function xpVal(type: EnemyType): number {
    return Math.floor(XP_BASE[type] * (1 + timeElapsed / 180))
  }

  function onKill(e: Enemy) {
    kills++
    xpOrbs.push(new XpOrb(e.pos.x, e.pos.y, xpVal(e.type)))
    if (Math.random() < 0.012 * (1 + player.luck)) goldDrops.push(new GoldDrop(e.pos.x, e.pos.y, 1))
    if (player.lifeSteal > 0) player.hp = Math.min(player.maxHp, player.hp + player.lifeSteal)
  }

  function stats(): GameStats {
    const activeBoss = bossManager.getActiveBoss()
    return {
      playerHp: player.hp, playerMaxHp: player.maxHp,
      playerLevel: player.level, playerXp: player.xp, playerXpToNext: player.xpToNext,
      kills, timeElapsed, gold: totalGold,
      activeBoss: activeBoss ? { name: activeBoss.name, hp: activeBoss.hp, maxHp: activeBoss.maxHp } : null,
      tookNoDamage, weaponCount: player.weapons.length,
      weapons: player.weapons.map(w => ({ id: w.id, name: w.name, level: w.level, maxLevel: maxLevelFor(w.id) })),
      won: false,
    }
  }

  function update(dt: number) {
    if (waitingLevelUp || waitingItemPick || gameEnded) return
    timeElapsed += dt

    for (const e of enemies) e.justDied = false

    player.update(dt, input.state)
    enemies.push(...spawner.update(dt, timeElapsed, player.level, canvas.width, canvas.height, player.pos))

    // Enemy contact damage
    for (const e of enemies) {
      e.update(dt, player.pos)
      if (!e.dead && e.damageCooldown <= 0 && circles(e.pos.x, e.pos.y, e.radius, player.pos.x, player.pos.y, player.radius)) {
        const dmgBefore = player.hp
        player.takeDamage(e.damage)
        if (player.hp < dmgBefore) tookNoDamage = false
        e.damageCooldown = 1
      }
    }

    // Boss manager
    const goldFromBoss = bossManager.update(dt, timeElapsed,
      { playerPos: player.pos, playerRadius: player.radius, canvasW: canvas.width, canvasH: canvas.height,
        onSlowPlayer: () => { player.slowTimer = 3 },
        onBossAlert: (name) => cb.onBossAlert(name),
      },
      enemyProjectiles, healOrbs, goldDrops,
    )
    if (goldFromBoss > 0) {
      totalGold += goldFromBoss; bossesKilled++
      // Boss drops an item — player picks a passive bonus
      waitingItemPick = true
      cb.onItemSelect(pickItems(3))
    }

    // Boss contact damage
    const boss = bossManager.getActiveBoss()
    if (boss && !boss.dead && boss.damageCooldown <= 0 && circles(boss.pos.x, boss.pos.y, boss.radius, player.pos.x, player.pos.y, player.radius)) {
      const dmgBefore = player.hp
      player.takeDamage(25 * boss.damageMult)
      if (player.hp < dmgBefore) tookNoDamage = false
      boss.damageCooldown = 1.5
    }

    // Enemy projectiles hit player
    for (const ep of enemyProjectiles) {
      ep.update(dt)
      if (ep.dead) continue
      if (circles(ep.pos.x, ep.pos.y, ep.radius, player.pos.x, player.pos.y, player.radius)) {
        const dmgBefore = player.hp
        player.takeDamage(ep.damage)
        if (player.hp < dmgBefore) tookNoDamage = false
        ep.dead = true
      }
    }

    // Player weapons — include boss in target list so contact weapons (sword/aura/orb/lightning) hit it
    const weaponTargets = boss && !boss.dead ? [...enemies, boss as unknown as Enemy] : enemies
    for (const w of player.weapons) updateWeapon(w, dt, player, weaponTargets, projectiles)

    // Collect sword/lightning/aura kills
    for (const e of enemies) {
      if (e.justDied) { onKill(e); e.justDied = false }
    }

    // Player projectiles hit enemies (and boss)
    for (const proj of projectiles) {
      proj.update(dt)
      if (proj.dead) continue

      // Piercing shots (e.g. the fireball) pass through, damaging each target once until they expire.
      if (proj.piercing) {
        if (boss && !boss.dead && !proj.hit.has(boss) && circles(proj.pos.x, proj.pos.y, proj.radius, boss.pos.x, boss.pos.y, boss.radius)) {
          boss.takeDamage(proj.damage); proj.hit.add(boss)
        }
        for (const e of enemies) {
          if (e.dead || proj.hit.has(e)) continue
          if (!circles(proj.pos.x, proj.pos.y, proj.radius, e.pos.x, e.pos.y, e.radius)) continue
          e.justDied = false; e.takeDamage(proj.damage); proj.hit.add(e)
          if (e.justDied) onKill(e)
        }
        continue
      }

      // Hit boss first
      if (boss && !boss.dead && circles(proj.pos.x, proj.pos.y, proj.radius, boss.pos.x, boss.pos.y, boss.radius)) {
        boss.takeDamage(proj.damage)
        proj.dead = true
        continue
      }

      for (const e of enemies) {
        if (e.dead) continue
        if (!circles(proj.pos.x, proj.pos.y, proj.radius, e.pos.x, e.pos.y, e.radius)) continue
        proj.dead = true
        if (proj.aoeRadius > 0) {
          for (const en of enemies) {
            if (en.dead) continue
            const dx2 = en.pos.x - proj.pos.x; const dy2 = en.pos.y - proj.pos.y
            if (dx2 * dx2 + dy2 * dy2 <= proj.aoeRadius ** 2) {
              en.justDied = false; en.takeDamage(proj.aoeDamage)
              if (en.justDied) { onKill(en) }
            }
          }
          // AoE also hits boss
          if (boss && !boss.dead) {
            const bdx = boss.pos.x - proj.pos.x; const bdy = boss.pos.y - proj.pos.y
            if (bdx * bdx + bdy * bdy <= proj.aoeRadius ** 2) boss.takeDamage(proj.aoeDamage * 0.5)
          }
        } else {
          e.takeDamage(proj.damage)
          if (e.justDied) { onKill(e) }
        }
        break
      }
    }

    // XP pickup
    for (const orb of xpOrbs) {
      orb.update(dt)
      if (orb.dead) continue
      const dx = orb.pos.x - player.pos.x; const dy = orb.pos.y - player.pos.y
      if (Math.sqrt(dx * dx + dy * dy) <= player.pickupRadius + orb.radius) {
        orb.dead = true
        if (!waitingLevelUp && player.gainXp(orb.value)) {
          waitingLevelUp = true
          if (player.level % 2 === 0) pendingPassivePick = true
          cb.onLevelUp(pickWeaponUpgrades(3, player.weapons), rerollsLeft)
        }
      }
    }

    // Heal orb pickup
    for (const orb of healOrbs) {
      orb.update(dt)
      if (orb.dead) continue
      const dx = orb.pos.x - player.pos.x; const dy = orb.pos.y - player.pos.y
      if (Math.sqrt(dx * dx + dy * dy) <= player.pickupRadius + orb.radius) {
        orb.dead = true
        player.hp = Math.min(player.maxHp, player.hp + orb.healAmount)
      }
    }

    // Gold pickup
    for (const drop of goldDrops) {
      drop.update(dt)
      if (drop.dead) continue
      const dx = drop.pos.x - player.pos.x; const dy = drop.pos.y - player.pos.y
      if (Math.sqrt(dx * dx + dy * dy) <= player.pickupRadius + drop.radius) {
        drop.dead = true
        totalGold += drop.amount
      }
    }

    // World pickup spawners
    healShrineTimer -= dt
    if (healShrineTimer <= 0) {
      const angle = Math.random() * Math.PI * 2
      const dist = 250 + Math.random() * 200
      worldPickups.push(new WorldPickup(
        player.pos.x + Math.cos(angle) * dist,
        player.pos.y + Math.sin(angle) * dist,
        'heal_shrine',
      ))
      healShrineTimer = 60 + Math.random() * 30
    }
    xpMagnetTimer -= dt
    if (xpMagnetTimer <= 0) {
      const angle = Math.random() * Math.PI * 2
      const dist = 250 + Math.random() * 200
      worldPickups.push(new WorldPickup(
        player.pos.x + Math.cos(angle) * dist,
        player.pos.y + Math.sin(angle) * dist,
        'xp_magnet',
      ))
      xpMagnetTimer = 40 + Math.random() * 20
    }

    // World pickup collection
    for (const wp of worldPickups) {
      wp.update(dt)
      if (wp.dead) continue
      const dx = wp.pos.x - player.pos.x; const dy = wp.pos.y - player.pos.y
      if (Math.sqrt(dx * dx + dy * dy) <= player.pickupRadius + wp.radius) {
        wp.dead = true
        if (wp.type === 'heal_shrine') {
          player.hp = Math.min(player.maxHp, player.hp + Math.floor(player.maxHp * 0.3))
        } else {
          for (const orb of xpOrbs) {
            if (!orb.dead) {
              orb.dead = true
              if (!waitingLevelUp && player.gainXp(orb.value)) {
                waitingLevelUp = true
                if (player.level % 2 === 0) pendingPassivePick = true
                cb.onLevelUp(pickWeaponUpgrades(3, player.weapons), rerollsLeft)
              }
            }
          }
        }
      }
    }
    worldPickups = worldPickups.filter(wp => !wp.dead)

    enemies = enemies.filter(e => !e.dead)
    projectiles = projectiles.filter(p => !p.dead)
    enemyProjectiles = enemyProjectiles.filter(p => !p.dead)
    xpOrbs = xpOrbs.filter(o => !o.dead)
    healOrbs = healOrbs.filter(o => !o.dead)
    goldDrops = goldDrops.filter(g => !g.dead)

    cb.onStats(stats())
    if (player.isDead) {
      gameEnded = true
      cb.onGameOver({ ...stats(), tookNoDamage, weaponCount: player.weapons.length, won: false })
    } else if (timeElapsed >= 600) {
      gameEnded = true
      cb.onGameOver({ ...stats(), tookNoDamage, weaponCount: player.weapons.length, won: true })
    }
  }

  function render(ctx: CanvasRenderingContext2D) {
    const w = canvas.width; const h = canvas.height
    const camX = player.pos.x - w / 2; const camY = player.pos.y - h / 2

    ctx.fillStyle = '#0f0f1a'
    ctx.fillRect(0, 0, w, h)
    drawGrid(ctx, camX, camY, w, h)

    // Area weapons behind everything
    for (const wp of player.weapons) { if (wp.id === 'aura' || wp.id === 'orb') renderWeapon(wp, ctx, camX, camY, player) }

    for (const wp of worldPickups) wp.render(ctx, camX, camY)
    for (const orb of xpOrbs) orb.render(ctx, camX, camY)
    for (const orb of healOrbs) orb.render(ctx, camX, camY)
    for (const drop of goldDrops) drop.render(ctx, camX, camY)
    for (const e of enemies) e.render(ctx, camX, camY)
    bossManager.render(ctx, camX, camY)
    for (const proj of projectiles) proj.render(ctx, camX, camY)
    for (const ep of enemyProjectiles) ep.render(ctx, camX, camY)
    player.render(ctx, camX, camY)

    // Sword + lightning on top
    for (const wp of player.weapons) { if (wp.id === 'sword' || wp.id === 'lightning') renderWeapon(wp, ctx, camX, camY, player) }
  }

  function chooseUpgrade(id: string) {
    applyUpgrade(id, player)
    waitingLevelUp = false
    // Even level: also let the player pick a passive from the PASSIVE_POOL.
    if (pendingPassivePick) {
      pendingPassivePick = false
      waitingItemPick = true
      cb.onItemSelect(pickItems(3))
    }
  }
  function chooseItem(id: string) { applyUpgrade(id, player); waitingItemPick = false }
  function rerollUpgrades() {
    if (rerollsLeft <= 0) return
    rerollsLeft--
    cb.onLevelUp(pickWeaponUpgrades(3, player.weapons), rerollsLeft)
  }
  function getBossesKilled() { return bossesKilled }
  function destroy() { input.destroy() }

  return { update, render, chooseUpgrade, chooseItem, rerollUpgrades, getBossesKilled, destroy }
}
