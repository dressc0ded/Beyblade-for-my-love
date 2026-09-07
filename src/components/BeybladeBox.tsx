import { BLADES } from '../data/parts'
import BladeIcon from './BladeIcon'

const ROMAN = ['I', 'II', 'III'] as const

function findBlade(name: string) {
  const q = name.trim().toLowerCase()
  if (!q) return undefined
  return (
    BLADES.find((b) => b.name.toLowerCase() === q) ??
    BLADES.find((b) => b.name.toLowerCase().startsWith(q)) ??
    BLADES.find((b) => b.name.toLowerCase().includes(q))
  )
}

/**
 * A stand-in for the hard plastic 3-slot cases players bring to real
 * Beyblade X events: a dark tray with a colored trim, round slot pockets
 * numbered I/II/III, and the launch order's blade name written beside each.
 */
export default function BeybladeBox({
  accent,
  names,
  onChange,
}: {
  accent: string
  names: [string, string, string]
  onChange: (index: number, value: string) => void
}) {
  return (
    <div className="pixel-border bg-[#141018] p-3" style={{ borderColor: '#000' }}>
      <div className="flex flex-col gap-2">
        {ROMAN.map((numeral, i) => {
          const blade = findBlade(names[i])
          return (
            <div key={numeral} className="flex items-center gap-2">
              <span className="font-pixel text-[11px] w-6 text-center shrink-0" style={{ color: accent }}>
                {numeral}
              </span>
              <div
                className="shrink-0 rounded-full flex items-center justify-center overflow-hidden"
                style={{ width: 44, height: 44, background: '#0a0710', border: `3px solid ${accent}`, boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)' }}
              >
                {blade ? (
                  <BladeIcon blade={blade} size={40} spinning={false} />
                ) : (
                  <span className="text-slate-600 text-lg">?</span>
                )}
              </div>
              <input
                value={names[i]}
                onChange={(e) => onChange(i, e.target.value)}
                placeholder={`Name of ${numeral === 'I' ? '1st' : numeral === 'II' ? '2nd' : '3rd'} beyblade`}
                className="flex-1 min-w-0 bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
                style={{ borderColor: '#000' }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
