import { useEffect, useMemo, useState } from 'react'
import { BITS, BLADES, RATCHETS } from '../data/parts'
import type { AnyPart, PartCategory } from '../data/types'
import LineBadge from '../components/LineBadge'
import { assignTiers, metaScore, type Meta, type Tier } from '../lib/stats'
import { loadCustomTierList, persistCustomTierList } from '../lib/storage'

const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D']
const TIER_COLORS: Record<Tier, string> = { S: '#f97316', A: '#facc15', B: '#4ade80', C: '#60a5fa', D: '#94a3b8' }
const CATEGORIES: { key: PartCategory; label: string; parts: AnyPart[] }[] = [
  { key: 'Blade', label: 'Beys / Blades', parts: BLADES },
  { key: 'Ratchet', label: 'Ratchets', parts: RATCHETS },
  { key: 'Bit', label: 'Bits', parts: BITS },
]
const METAS: Meta[] = ['overall', 'attack', 'defense', 'stamina']

export default function TierLists() {
  const [category, setCategory] = useState<PartCategory>('Blade')
  const [meta, setMeta] = useState<Meta>('overall')
  const [mode, setMode] = useState<'computed' | 'custom'>('computed')

  const parts = CATEGORIES.find((c) => c.key === category)!.parts

  const computed = useMemo(() => assignTiers(parts, (p) => metaScore(p.stats, meta)), [parts, meta])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="pixel-border bg-panel-2 p-3 mb-4 flex flex-wrap gap-3 items-center" style={{ borderColor: '#000' }}>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] ${category === c.key ? 'bg-basic text-white' : 'bg-black/30 text-slate-300'}`}
              style={{ borderColor: '#000' }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setMode('computed')}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] ${mode === 'computed' ? 'bg-custom text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            META TIER LIST
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] ${mode === 'custom' ? 'bg-custom text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            MAKE YOUR OWN
          </button>
        </div>
      </div>

      {mode === 'computed' ? (
        <>
          <div className="flex gap-2 mb-3">
            {METAS.map((m) => (
              <button
                key={m}
                onClick={() => setMeta(m)}
                className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] capitalize ${meta === m ? 'bg-limited text-black' : 'bg-black/30 text-slate-300'}`}
                style={{ borderColor: '#000' }}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="pixel-border bg-panel-2 p-3 mb-4 text-slate-400 text-sm" style={{ borderColor: '#000' }}>
            <span className="font-pixel text-[9px] text-slate-300">METHODOLOGY: </span>
            Each part's score is a weighted sum of its Attack / Defense / Stamina / Burst Resistance / Dash ratings.
            The <strong className="text-white capitalize">{meta}</strong> view weights{' '}
            {meta === 'overall'
              ? 'every stat equally'
              : `${meta} (and its supporting stats like ${meta === 'attack' ? 'Dash' : meta === 'defense' ? 'Burst Resistance' : 'Burst Resistance'}) far more heavily than the rest`}
            . Parts are then bucketed into tiers by rank: top ~12% S, next ~23% A, middle ~30% B, next ~20% C, bottom ~15% D — so
            tiers reflect relative standing within this dataset, not a fixed numeric cutoff. This is a gameplay-style estimate, not an
            official competitive-usage ranking.
          </div>
          <div className="space-y-2">
            {TIERS.map((tier) => (
              <div key={tier} className="flex pixel-border bg-panel-2 overflow-hidden" style={{ borderColor: '#000' }}>
                <div
                  className="font-pixel text-lg w-14 flex items-center justify-center shrink-0"
                  style={{ background: TIER_COLORS[tier], color: '#0b0817' }}
                >
                  {tier}
                </div>
                <div className="flex flex-wrap gap-2 p-2">
                  {computed
                    .filter((c) => c.tier === tier)
                    .map((c) => (
                      <div key={c.item.id} className="pixel-border bg-black/30 px-2 py-1 text-sm flex items-center gap-1" style={{ borderColor: '#000' }}>
                        {c.item.name}
                        <LineBadge line={c.item.line} className="ml-1" />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <CustomTierList category={category} parts={parts} />
      )}
    </div>
  )
}

function CustomTierList({ category, parts }: { category: PartCategory; parts: AnyPart[] }) {
  const storageKeyPrefix = category
  const [buckets, setBuckets] = useState<Record<string, string[]>>(() => {
    const saved = loadCustomTierList()
    const initial: Record<string, string[]> = { S: [], A: [], B: [], C: [], D: [], Unranked: [] }
    const seen = new Set<string>()
    if (saved) {
      for (const tier of TIERS) {
        const ids = (saved[`${storageKeyPrefix}:${tier}`] ?? []).filter((id) => parts.some((p) => p.id === id) && !seen.has(id))
        ids.forEach((id) => seen.add(id))
        initial[tier] = ids
      }
    }
    initial.Unranked = parts.filter((p) => !seen.has(p.id)).map((p) => p.id)
    return initial
  })

  useEffect(() => {
    const all = loadCustomTierList() ?? {}
    for (const tier of [...TIERS, 'Unranked']) {
      all[`${storageKeyPrefix}:${tier}`] = buckets[tier] ?? []
    }
    persistCustomTierList(all)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buckets])

  function moveTo(id: string, target: string) {
    setBuckets((prev) => {
      const next: Record<string, string[]> = {}
      for (const key of Object.keys(prev)) next[key] = prev[key].filter((x) => x !== id)
      next[target] = [...(next[target] ?? []), id]
      return next
    })
  }

  function partById(id: string) {
    return parts.find((p) => p.id === id)!
  }

  return (
    <div className="space-y-2">
      <div className="text-slate-400 text-sm mb-2">Drag part chips between rows to build your own tier list. Saved automatically per category.</div>
      {[...TIERS, 'Unranked' as const].map((tier) => (
        <div
          key={tier}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData('text/plain')
            if (id) moveTo(id, tier)
          }}
          className="flex pixel-border bg-panel-2 overflow-hidden min-h-14"
          style={{ borderColor: '#000' }}
        >
          <div
            className="font-pixel text-sm w-14 flex items-center justify-center shrink-0"
            style={{ background: tier === 'Unranked' ? '#334155' : TIER_COLORS[tier as Tier], color: tier === 'Unranked' ? '#e2e8f0' : '#0b0817' }}
          >
            {tier === 'Unranked' ? '?' : tier}
          </div>
          <div className="flex flex-wrap gap-2 p-2 flex-1">
            {(buckets[tier] ?? []).map((id) => (
              <div
                key={id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', id)}
                className="pixel-border bg-black/30 px-2 py-1 text-sm cursor-grab active:cursor-grabbing"
                style={{ borderColor: '#000' }}
              >
                {partById(id).name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
