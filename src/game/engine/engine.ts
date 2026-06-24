export type UpdateFn = (dt: number) => void
export type RenderFn = (ctx: CanvasRenderingContext2D) => void

const MAX_DT = 0.05 // cap delta at 50ms to avoid spiral of death on tab blur

export class GameEngine {
  private canvas: HTMLCanvasElement
  private update: UpdateFn
  private render: RenderFn
  private rafId = 0
  private lastTime = 0
  private _paused = false

  constructor(canvas: HTMLCanvasElement, update: UpdateFn, render: RenderFn) {
    this.canvas = canvas
    this.update = update
    this.render = render
  }

  get paused() {
    return this._paused
  }

  start() {
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop() {
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
  }

  pause() {
    this._paused = true
  }

  resume() {
    if (this._paused) {
      this._paused = false
      this.lastTime = performance.now()
    }
  }

  togglePause() {
    if (this._paused) this.resume()
    else this.pause()
  }

  private tick = (now: number) => {
    this.rafId = requestAnimationFrame(this.tick)

    if (this._paused) return

    const dt = Math.min((now - this.lastTime) / 1000, MAX_DT)
    this.lastTime = now

    this.update(dt)

    const ctx = this.canvas.getContext('2d')
    if (ctx) this.render(ctx)
  }
}
