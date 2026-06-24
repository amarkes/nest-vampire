import type { InputState } from '../types'

const GAME_KEYS = new Set(['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

export class InputManager {
  private keys = new Set<string>()

  private onKeyDown = (e: KeyboardEvent) => {
    if (GAME_KEYS.has(e.key)) e.preventDefault()
    this.keys.add(e.key)
  }
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key)

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  get state(): InputState {
    return {
      up: this.keys.has('w') || this.keys.has('W') || this.keys.has('ArrowUp'),
      down: this.keys.has('s') || this.keys.has('S') || this.keys.has('ArrowDown'),
      left: this.keys.has('a') || this.keys.has('A') || this.keys.has('ArrowLeft'),
      right: this.keys.has('d') || this.keys.has('D') || this.keys.has('ArrowRight'),
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
}
