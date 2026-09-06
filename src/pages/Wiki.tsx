import { useMemo, useState } from 'react'
import { ALL_PARTS } from '../data/parts'
import type { AnyPart, Line, PartCategory, StatBlock } from '../data/types'
import { STAT_KEYS, STAT_LABELS } from '../data/types'
import LineBadge from '../components/LineBadge'
import StatBars from '../components/StatBars'

const CATEGORIES: (PartCategory | 'All')[] = ['All', 'Blade', 'Ratchet', 'Bit']
const LINES: (Line | 'All')[] = ['All', 'Basic', 'Unique', 'Custom', 'Limited']

function dominantStat(stats: StatBlock): keyof StatBlock {
  return STAT_KEYS.reduce((best, key) => (stats[key] > stats[best] ? key : best), STAT_KEYS[0])
}

export default function Wiki() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<PartCategory | 'All'>('All')
  const [line, setLine] = useState<Line | 'All'>('All')
  const [statFocus, setStatFocus] = useState<keyof StatBlock | 'All'>('All')
  const [sortBy, setSortBy] = useState<'name' | 'releaseDate' | 'rarity'>('name')
  const [view, setView] = useState<'table' | 'card'>('card')
  const [selected, setSelected] = useState<AnyPart | null>(null)

  const filtered = useMemo(() => {
    let list = ALL_PARTS.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (line !== 'All' && p.line !== line) return false
      if (statFocus !== 'All' && dominantStat(p.stats) !== statFocus) return false
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'releaseDate') return a.releaseDate.localeCompare(b.releaseDate)
      return a.rarity.localeCompare(b.rarity)
    })
    return list
  }, [query, category, line, statFocus, sortBy])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="pixel-border bg-panel-2 p-3 mb-4 flex flex-wrap gap-3 items-end" style={{ borderColor: '#000' }}>
        <div>
          <div className="font-pixel text-[9px] text-slate-400 mb-1">SEARCH</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Part name..."
            className="bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
            style={{ borderColor: '#000' }}
          />
        </div>
        <Select label="CATEGORY" value={category} onChange={setCategory} options={CATEGORIES} />
        <Select label="LINE" value={line} onChange={setLine} options={LINES} />
        <Select
          label="STAT FOCUS"
          value={statFocus}
          onChange={setStatFocus}
          options={['All', ...STAT_KEYS] as (keyof StatBlock | 'All')[]}
          display={(v) => (v === 'All' ? 'All' : STAT_LABELS[v as keyof StatBlock])}
        />
        <Select label="SORT" value={sortBy} onChange={setSortBy} options={['name', 'releaseDate', 'rarity']} />
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setView('card')}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] ${view === 'card' ? 'bg-basic text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            CARDS
          </button>
          <button
            onClick={() => setView('table')}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] ${view === 'table' ? 'bg-basic text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            TABLE
          </button>
        </div>
      </div>

      <div className="text-slate-400 text-sm mb-2">{filtered.length} parts found</div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="pixel-btn pixel-border bg-panel-2 p-3 text-left"
              style={{ borderColor: '#000' }}
            >
              <div className="flex justify-between items-start">
                <div className="font-pixel text-[10px] text-white">{p.name}</div>
                <LineBadge line={p.line} />
              </div>
              <div className="text-slate-400 text-sm mt-1">{p.category} · {p.rarity}</div>
              <div className="text-slate-500 text-xs mt-1">unofficial/estimated stats</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="pixel-border bg-panel-2 overflow-x-auto" style={{ borderColor: '#000' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-pixel text-[9px] text-slate-400 border-b border-white/10">
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Line</th>
                <th className="p-2">Rarity</th>
                <th className="p-2">Released</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setSelected(p)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-slate-400">{p.category}</td>
                  <td className="p-2"><LineBadge line={p.line} /></td>
                  <td className="p-2 text-slate-400">{p.rarity}</td>
                  <td className="p-2 text-slate-400">{p.releaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4" onClick={() => setSelected(null)}>
          <div
            className="pixel-border bg-panel p-5 max-w-md w-full"
            style={{ borderColor: '#000' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-pixel text-[12px] text-white">{selected.name}</div>
                <div className="text-slate-400 text-sm">{selected.category}</div>
              </div>
              <LineBadge line={selected.line} />
            </div>
            <div className="text-slate-400 text-sm space-y-1 mb-3">
              <div>Rarity: {selected.rarity}</div>
              <div>Released: {selected.releaseDate}</div>
              {'spinDirection' in selected && <div>Spin: {selected.spinDirection}</div>}
              {'type' in selected && <div>Archetype: {selected.type}</div>}
              {'movementType' in selected && <div>Movement: {selected.movementType}</div>}
              <div className="text-amber-400">⚠ {selected.confidence === 'estimated' ? 'unofficial/estimated data' : 'official data'}</div>
              {selected.notes && <div className="text-slate-500 italic">{selected.notes}</div>}
            </div>
            <StatBars stats={selected.stats} />
            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full pixel-btn pixel-border bg-panel-2 py-1 font-pixel text-[9px] text-white"
              style={{ borderColor: '#000' }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  display,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: T[]
  display?: (v: T) => string
}) {
  return (
    <div>
      <div className="font-pixel text-[9px] text-slate-400 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
        style={{ borderColor: '#000' }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {display ? display(o) : o}
          </option>
        ))}
      </select>
    </div>
  )
}
