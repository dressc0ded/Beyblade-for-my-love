import type { StatBlock } from '../data/types'
import { STAT_KEYS, STAT_LABELS } from '../data/types'

const BAR_COLORS: Record<keyof StatBlock, string> = {
  attack: '#f87171',
  defense: '#60a5fa',
  stamina: '#4ade80',
  burstResistance: '#facc15',
  dash: '#c084fc',
}

export function StatBar({ label, value, color, max = 10 }: { label: string; value: number; color: string; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[11px] mb-1 text-slate-300">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="h-3 bg-black/50 pixel-border" style={{ borderColor: '#000' }}>
        <div
          className="h-full stat-chunk"
          style={{
            width: `${pct}%`,
            background: color,
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0, rgba(0,0,0,0.25) 3px, transparent 3px, transparent 9px)',
          }}
        />
      </div>
    </div>
  )
}

export default function StatBars({ stats, compact = false }: { stats: StatBlock; compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      {STAT_KEYS.map((key) => (
        <StatBar key={key} label={STAT_LABELS[key]} value={stats[key]} color={BAR_COLORS[key]} />
      ))}
    </div>
  )
}
