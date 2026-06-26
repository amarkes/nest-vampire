import { useGameStore } from '@/stores/gameStore'
import type { WeaponId, WeaponInfo } from '@/game/types'

const GAME_DURATION = 600

function formatTime(s: number): string {
  const m = Math.floor(s / 60); const ss = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

const WEAPON_ICON: Record<WeaponId, string> = {
  bow: '🏹', sword: '⚔️', fireball: '🔥', lightning: '⚡', aura: '❄️', orb: '🔮',
}

function BossHPBar({ name, hp, maxHp }: { name: string; hp: number; maxHp: number }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  return (
    <div className="mx-auto w-full max-w-lg px-4">
      <div className="rounded-lg border border-red-800 bg-black/70 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex justify-between text-xs">
          <span className="font-bold text-red-400 uppercase tracking-widest">{name}</span>
          <span className="text-gray-400">{Math.ceil(hp)} / {maxHp}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-900">
          <div
            className="h-full rounded-full bg-linear-to-r from-red-700 to-red-500 transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function BossAlert({ name }: { name: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="rounded-xl border border-red-600 bg-black/85 px-10 py-5 text-center shadow-[0_0_40px_rgba(239,68,68,0.4)]">
        <p className="text-xs tracking-widest text-red-500 uppercase">⚠ Boss Apareceu ⚠</p>
        <p className="mt-1 text-3xl font-bold text-white">{name}</p>
      </div>
    </div>
  )
}

function WeaponChip({ w }: { w: WeaponInfo }) {
  const evolved = w.level >= w.maxLevel
  const milestone = w.level >= 6
  const border = evolved ? 'border-amber-400/80' : milestone ? 'border-fuchsia-500/70' : 'border-gray-700/80'
  const glow = evolved ? 'shadow-[0_0_12px_rgba(251,191,36,0.45)]' : milestone ? 'shadow-[0_0_10px_rgba(217,70,239,0.35)]' : ''
  const levelColor = evolved ? 'text-amber-300' : milestone ? 'text-fuchsia-300' : 'text-gray-200'

  return (
    <div className={`flex items-center gap-2 rounded-lg border bg-black/55 px-2 py-1 backdrop-blur ${border} ${glow}`}>
      <span className="text-lg leading-none">{WEAPON_ICON[w.id]}</span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[11px] font-semibold leading-tight text-gray-200">{w.name}</span>
        <div className="mt-0.5 flex items-center gap-1">
          {evolved ? (
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300">MAX ★</span>
          ) : (
            <>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-700">
                <div
                  className={`h-full rounded-full ${milestone ? 'bg-fuchsia-400' : 'bg-emerald-400'}`}
                  style={{ width: `${(w.level / w.maxLevel) * 100}%` }}
                />
              </div>
              <span className={`shrink-0 text-[10px] font-bold ${levelColor}`}>Lv{w.level}/{w.maxLevel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function HUD() {
  const stats = useGameStore((s) => s.stats)
  const bossAlert = useGameStore((s) => s.bossAlert)
  const { playerHp, playerMaxHp, playerLevel, playerXp, playerXpToNext, kills, timeElapsed, gold, activeBoss, weapons } = stats

  const hpPct = Math.max(0, (playerHp / playerMaxHp) * 100)
  const xpPct = Math.min(100, (playerXp / playerXpToNext) * 100)
  const lowHp = hpPct <= 25

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* Top */}
      <div className="absolute top-0 left-0 right-0 flex flex-col gap-2 px-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Nível</span>
            <span className="text-2xl font-bold text-yellow-400">{playerLevel}</span>
          </div>

          <div className={`rounded border px-5 py-1 backdrop-blur ${GAME_DURATION - timeElapsed <= 60 ? 'border-red-700 bg-red-950/60' : 'border-gray-800 bg-black/60'}`}>
            <span className={`font-mono text-xl ${GAME_DURATION - timeElapsed <= 60 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(Math.max(0, GAME_DURATION - timeElapsed))}
            </span>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 uppercase tracking-widest">Kills</span>
              <span className="text-2xl font-bold text-purple-400">{kills}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 uppercase tracking-widest">Gold</span>
              <span className="text-2xl font-bold text-yellow-500">{gold}</span>
            </div>
          </div>
        </div>

        {activeBoss && (
          <BossHPBar name={activeBoss.name} hp={activeBoss.hp} maxHp={activeBoss.maxHp} />
        )}
      </div>

      {/* Weapons panel — left side */}
      {weapons.length > 0 && (
        <div className="absolute left-3 top-1/2 flex w-40 -translate-y-1/2 flex-col gap-1.5">
          <span className="px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Poderes</span>
          {weapons.map((w) => <WeaponChip key={w.id} w={w} />)}
        </div>
      )}

      {/* Bottom — HP + XP bars */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2.5 px-6 pb-5">
        {/* HP */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-1 flex items-center justify-between px-0.5">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-300">
              <span>❤</span> Vida
            </span>
            <span className="font-mono text-xs text-gray-300">{Math.ceil(playerHp)} / {playerMaxHp}</span>
          </div>
          <div className={`relative h-5 overflow-hidden rounded-full border bg-gray-950/80 ${lowHp ? 'border-red-500/80' : 'border-gray-700/70'}`}>
            <div
              className={`h-full rounded-full transition-[width] duration-150 ${lowHp ? 'bg-linear-to-r from-red-700 to-red-500 animate-pulse' : 'bg-linear-to-r from-emerald-600 to-emerald-400'}`}
              style={{ width: `${hpPct}%` }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/15 to-transparent" />
          </div>
        </div>

        {/* XP */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-1 flex items-center justify-between px-0.5">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300">
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-cyan-200">Nv {playerLevel}</span> Experiência
            </span>
            <span className="font-mono text-xs text-gray-400">{playerXp} / {playerXpToNext}</span>
          </div>
          <div className="relative h-3.5 overflow-hidden rounded-full border border-gray-700/70 bg-gray-950/80">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-sky-400 transition-[width] duration-150"
              style={{ width: `${xpPct}%` }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/15 to-transparent" />
          </div>
        </div>
      </div>

      {bossAlert && <BossAlert name={bossAlert} />}
    </div>
  )
}
