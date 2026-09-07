import { useCallback, useEffect, useRef, useState } from 'react'
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

  const computed = assignTiers(parts, (p) => metaScore(p.stats, meta))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="pixel-border bg-panel-2 p-3 mb-4 flex flex-wrap gap-3 items-center" style={{ borderColor: '#000' }}>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
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
            type="button"
            onClick={() => setMode('computed')}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] ${mode === 'computed' ? 'bg-custom text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            META TIER LIST
          </button>
          <button
            type="button"
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
                type="button"
                onClick={() => setMeta(m)}
                className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] capitalize ${meta === m ? 'bg-limited text-black' : 'bg-black/30 text-slate-300'}`}
                style={{ borderColor: '#000' }}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="pixel-border bg-panel-2 p-3 mb-4 text-slate-300 text-sm" style={{ borderColor: '#000' }}>
            <span className="font-pixel text-[9px] text-slate-200">METHODOLOGY: </span>
            Each part's score is a weighted sum of its Attack / Defense / Stamina / Burst Resistance / Dash ratings.
            The <strong className="text-white capitalize">{meta}</strong> view weights{' '}
            {meta === 'overall'
              ? 'every stat equally'
              : `${meta} (and its supporting stats like ${meta === 'attack' ? 'Dash' : 'Burst Resistance'}) far more heavily than the rest`}
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
        <CustomTierList key={category} category={category} parts={parts} />
      )}
    </div>
  )
}

const ROWS = [...TIERS, 'Unranked'] as const
type RowKey = (typeof ROWS)[number]

function loadInitialBuckets(category: PartCategory, parts: AnyPart[]): Record<RowKey, string[]> {
  const saved = loadCustomTierList()
  const initial = { S: [], A: [], B: [], C: [], D: [], Unranked: [] } as Record<RowKey, string[]>
  const seen = new Set<string>()
  if (saved) {
    for (const tier of TIERS) {
      const ids = (saved[`${category}:${tier}`] ?? []).filter((id) => parts.some((p) => p.id === id) && !seen.has(id))
      ids.forEach((id) => seen.add(id))
      initial[tier] = ids
    }
  }
  initial.Unranked = parts.filter((p) => !seen.has(p.id)).map((p) => p.id)
  return initial
}

function CustomTierList({ category, parts }: { category: PartCategory; parts: AnyPart[] }) {
  const [buckets, setBuckets] = useState<Record<RowKey, string[]>>(() => loadInitialBuckets(category, parts))
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [hoverRow, setHoverRow] = useState<RowKey | null>(null)
  const rowRefs = useRef<Partial<Record<RowKey, HTMLDivElement | null>>>({})
  const dragOriginRow = useRef<RowKey | null>(null)

  useEffect(() => {
    const all = loadCustomTierList() ?? {}
    for (const tier of ROWS) {
      all[`${category}:${tier}`] = buckets[tier] ?? []
    }
    persistCustomTierList(all)
  }, [buckets, category])

  const rowAtPoint = useCallback((x: number, y: number): RowKey | null => {
    for (const tier of ROWS) {
      const el = rowRefs.current[tier]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return tier
    }
    return null
  }, [])

  const endDrag = useCallback(
    (drop: boolean, x: number, y: number) => {
      if (dragId) {
        if (drop) {
          const target = rowAtPoint(x, y)
          if (target) {
            setBuckets((prev) => {
              const next: Record<RowKey, string[]> = { S: [], A: [], B: [], C: [], D: [], Unranked: [] }
              for (const key of ROWS) next[key] = prev[key].filter((id) => id !== dragId)
              next[target] = [...next[target], dragId]
              return next
            })
          }
        }
      }
      setDragId(null)
      setHoverRow(null)
      dragOriginRow.current = null
    },
    [dragId, rowAtPoint],
  )

  useEffect(() => {
    if (!dragId) return
    function onMove(e: PointerEvent) {
      setDragPos({ x: e.clientX, y: e.clientY })
      setHoverRow(rowAtPoint(e.clientX, e.clientY))
    }
    function onUp(e: PointerEvent) {
      endDrag(true, e.clientX, e.clientY)
    }
    function onCancel() {
      endDrag(false, 0, 0)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [dragId, rowAtPoint, endDrag])

  function startDrag(e: React.PointerEvent, id: string, fromRow: RowKey) {
    e.preventDefault()
    dragOriginRow.current = fromRow
    setDragId(id)
    setDragPos({ x: e.clientX, y: e.clientY })
  }

  function partById(id: string) {
    return parts.find((p) => p.id === id)!
  }

  return (
    <div className="space-y-2" style={{ touchAction: dragId ? 'none' : undefined }}>
      <div className="text-slate-300 text-sm mb-2">
        Press and drag a part chip into a row to rank it. Saved automatically per category.
      </div>
      {ROWS.map((tier) => (
        <div
          key={tier}
          data-tier={tier}
          ref={(el) => {
            rowRefs.current[tier] = el
          }}
          className="flex pixel-border overflow-hidden min-h-14 transition-colors"
          style={{ borderColor: '#000', background: hoverRow === tier ? 'rgba(255,255,255,0.12)' : undefined }}
        >
          <div
            className="font-pixel text-sm w-14 flex items-center justify-center shrink-0"
            style={{
              background: tier === 'Unranked' ? '#334155' : TIER_COLORS[tier as Tier],
              color: tier === 'Unranked' ? '#e2e8f0' : '#0b0817',
            }}
          >
            {tier === 'Unranked' ? '?' : tier}
          </div>
          <div className="flex flex-wrap gap-2 p-2 flex-1 bg-panel-2">
            {buckets[tier].map((id) => (
              <div
                key={id}
                onPointerDown={(e) => startDrag(e, id, tier)}
                className="pixel-border bg-black/30 px-2 py-1 text-sm select-none cursor-grab active:cursor-grabbing"
                style={{ borderColor: '#000', opacity: dragId === id ? 0.25 : 1, touchAction: 'none' }}
              >
                {partById(id).name}
              </div>
            ))}
          </div>
        </div>
      ))}

      {dragId && (
        <div
          className="pixel-border bg-black/80 px-2 py-1 text-sm pointer-events-none fixed z-50"
          style={{ borderColor: '#000', left: dragPos.x + 12, top: dragPos.y + 12 }}
        >
          {partById(dragId).name}
        </div>
      )}
    </div>
  )
}
