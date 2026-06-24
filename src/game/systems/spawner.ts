import { spawnEnemy } from '../entities/enemy'
import type { Enemy, EnemyType } from '../entities/enemy'
import type { Vec2 } from '../types'

function pickType(playerLevel: number): EnemyType {
  const r = Math.random()
  if (playerLevel >= 25) {
    if (r < 0.05) return 'shadow'
    if (r < 0.13) return 'demon'
    if (r < 0.25) return 'goblin'
    if (r < 0.42) return 'orc'
    if (r < 0.60) return 'spider'
    if (r < 0.80) return 'skeleton'
    return 'slime'
  }
  if (playerLevel >= 20) {
    if (r < 0.10) return 'demon'
    if (r < 0.24) return 'goblin'
    if (r < 0.42) return 'orc'
    if (r < 0.62) return 'spider'
    if (r < 0.82) return 'skeleton'
    return 'slime'
  }
  if (playerLevel >= 15) {
    if (r < 0.14) return 'goblin'
    if (r < 0.32) return 'orc'
    if (r < 0.52) return 'spider'
    if (r < 0.76) return 'skeleton'
    return 'slime'
  }
  if (playerLevel >= 10) {
    if (r < 0.15) return 'orc'
    if (r < 0.40) return 'spider'
    if (r < 0.70) return 'skeleton'
    return 'slime'
  }
  if (playerLevel >= 5) {
    if (r < 0.25) return 'spider'
    if (r < 0.60) return 'skeleton'
    return 'slime'
  }
  if (playerLevel >= 2) {
    if (r < 0.35) return 'skeleton'
    return 'slime'
  }
  return 'slime'
}

export class Spawner {
  private timer = 0

  update(dt: number, timeElapsed: number, playerLevel: number, canvasW: number, canvasH: number, camPos: Vec2): Enemy[] {
    this.timer += dt
    const interval = Math.max(0.4, 2.0 - timeElapsed / 60)
    if (this.timer < interval) return []
    this.timer -= interval

    const count = Math.floor(1 + timeElapsed / 25)
    const result: Enemy[] = []
    for (let i = 0; i < count; i++) {
      const pos = this.edgePos(canvasW, canvasH, camPos)
      result.push(spawnEnemy(pickType(playerLevel), pos.x, pos.y, timeElapsed))
    }
    return result
  }

  private edgePos(canvasW: number, canvasH: number, camPos: Vec2): Vec2 {
    const m = 90
    const side = Math.floor(Math.random() * 4)
    switch (side) {
      case 0: return { x: camPos.x - canvasW / 2 + Math.random() * canvasW, y: camPos.y - canvasH / 2 - m }
      case 1: return { x: camPos.x + canvasW / 2 + m, y: camPos.y - canvasH / 2 + Math.random() * canvasH }
      case 2: return { x: camPos.x - canvasW / 2 + Math.random() * canvasW, y: camPos.y + canvasH / 2 + m }
      default: return { x: camPos.x - canvasW / 2 - m, y: camPos.y - canvasH / 2 + Math.random() * canvasH }
    }
  }
}
