import { useMemo, useState } from 'react'
import { BITS, BLADES, RATCHETS } from '../data/parts'
import type { AnyPart, PartCategory } from '../data/types'
import { STAT_LABELS } from '../data/types'
import LineBadge from '../components/LineBadge'
import StatBars from '../components/StatBars'
import { diffStats, generateComparisonText } from '../lib/compare'

const CATEGORIES: { key: PartCategory; label: string; parts: AnyPart[] }[] = [
  { key: 'Blade', label: 'Beys / Blades', parts: BLADES },
  { key: 'Ratchet', label: 'Ratchets', parts: RATCHETS },
  { key: 'Bit', label: 'Bits', parts: BITS },
]

export default function Compare() {
  const [category, setCategory] = useState<PartCategory>('Blade')
  const parts = CATEGORIES.find((c) => c.key === category)!.parts
  const [aId, setAId] = useState(parts[0].id)
  const [bId, setBId] = useState(parts[1]?.id ?? parts[0].id)

  const a = parts.find((p) => p.id === aId) ?? parts[0]
  const b = parts.find((p) => p.id === bId) ?? parts[0]

  const diffs = useMemo(() => diffStats(a, b), [a, b])
  const text = useMemo(() => generateComparisonText(a, b), [a, b])

  function changeCategory(key: PartCategory) {
    setCategory(key)
    const list = CATEGORIES.find((c) => c.key === key)!.parts
    setAId(list[0].id)
    setBId(list[1]?.id ?? list[0].id)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => changeCategory(c.key)}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] ${category === c.key ? 'bg-basic text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <PartCard label="PART A" part={a} parts={parts} value={aId} onChange={setAId} />
        <PartCard label="PART B" part={b} parts={parts} value={bId} onChange={setBId} />
      </div>

      <div className="pixel-border bg-panel-2 p-3 mb-4" style={{ borderColor: '#000' }}>
        <div className="font-pixel text-[10px] text-slate-300 mb-3">STAT DELTA</div>
        <div className="space-y-2">
          {diffs.map((d) => (
            <div key={d.key} className="flex items-center gap-2 text-sm">
              <span className="w-32 shrink-0 text-slate-400">{STAT_LABELS[d.key]}</span>
              <span className="w-10 text-right">{d.a}</span>
              <div className="flex-1 h-3 bg-black/40 relative pixel-border" style={{ borderColor: '#000' }}>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30" />
                {d.delta !== 0 && (
                  <div
                    className={`absolute top-0 bottom-0 ${d.delta > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{
                      left: d.delta > 0 ? '50%' : `${50 - Math.min(50, Math.abs(d.delta) * 5)}%`,
                      width: `${Math.min(50, Math.abs(d.delta) * 5)}%`,
                    }}
                  />
                )}
              </div>
              <span className="w-10">{d.b}</span>
              <span className={`w-16 text-right font-pixel text-[9px] ${d.delta > 0 ? 'text-green-400' : d.delta < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {d.delta > 0 ? `▲ ${d.delta}` : d.delta < 0 ? `▼ ${Math.abs(d.delta)}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pixel-border bg-panel p-4" style={{ borderColor: '#000' }}>
        <div className="font-pixel text-[10px] text-limited mb-2">BREAKDOWN</div>
        <div className="space-y-2 text-slate-300 text-sm">
          {text.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

function PartCard({
  label,
  part,
  parts,
  value,
  onChange,
}: {
  label: string
  part: AnyPart
  parts: AnyPart[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="pixel-border bg-panel-2 p-3" style={{ borderColor: '#000' }}>
      <div className="font-pixel text-[9px] text-slate-400 mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none mb-3"
        style={{ borderColor: '#000' }}
      >
        {parts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex justify-between items-center mb-2">
        <div className="font-pixel text-[11px] text-white">{part.name}</div>
        <LineBadge line={part.line} />
      </div>
      <StatBars stats={part.stats} compact />
    </div>
  )
}
