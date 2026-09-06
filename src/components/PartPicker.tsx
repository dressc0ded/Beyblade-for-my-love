import type { AnyPart } from '../data/types'
import { LINE_COLORS } from '../data/types'

export default function PartPicker<T extends AnyPart>({
  label,
  parts,
  selectedId,
  onSelect,
}: {
  label: string
  parts: T[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="pixel-border bg-panel-2 p-3" style={{ borderColor: '#000' }}>
      <div className="font-pixel text-[10px] text-slate-300 mb-2">{label}</div>
      <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto pr-1">
        {parts.map((part) => {
          const active = part.id === selectedId
          const c = LINE_COLORS[part.line]
          return (
            <button
              key={part.id}
              onClick={() => onSelect(part.id)}
              className={`pixel-btn text-left px-2 py-1.5 pixel-border flex items-center justify-between gap-2 ${
                active ? 'bg-white/10' : 'bg-black/20'
              }`}
              style={{ borderColor: active ? c.border : '#000' }}
            >
              <span className="text-sm truncate">{part.name}</span>
              <span
                className="font-pixel text-[8px] px-1 py-0.5 shrink-0"
                style={{ background: c.bg, color: c.text }}
              >
                {part.line[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
