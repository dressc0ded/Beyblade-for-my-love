import type { Blade } from '../data/types'
import { LINE_COLORS } from '../data/types'

/**
 * Every blade gets its own deterministic pixel "crest" instead of a single
 * generic spinning placeholder. The pattern is seeded from the blade's id,
 * so the same part always renders the same emblem, but no two blades share
 * one - closer to how each real Beyblade has a unique face-bolt sticker.
 */

function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 4-column half-grid mirrored horizontally into an 8-wide symmetric crest. */
function generateCrest(seed: number, rows = 8, cols = 4): boolean[][] {
  const rand = mulberry32(seed)
  const half: boolean[][] = []
  for (let y = 0; y < rows; y++) {
    const row: boolean[] = []
    for (let x = 0; x < cols; x++) {
      const edgeBias = x === cols - 1 ? 0.3 : x === 0 ? 0.55 : 0.45
      row.push(rand() < edgeBias)
    }
    half.push(row)
  }
  return half.map((row) => [...row, ...[...row].reverse()])
}

const TYPE_RING: Record<Blade['type'], string> = {
  Attack: '#f87171',
  Defense: '#60a5fa',
  Stamina: '#4ade80',
  Balance: '#e5e7eb',
}

export default function BladeIcon({ blade, size = 200, spinning = true }: { blade: Blade; size?: number; spinning?: boolean }) {
  const seed = hashString(blade.id)
  const crest = generateCrest(seed)
  const rows = crest.length
  const cols = crest[0].length
  const cell = 64 / cols
  const cellY = 44 / rows
  const line = LINE_COLORS[blade.line]
  const ring = TYPE_RING[blade.type]

  return (
    <div className="relative mx-auto pixel-border bg-black/40 flex items-center justify-center" style={{ width: size, height: size, borderColor: '#000' }}>
      <div
        style={{
          width: size * 0.82,
          height: size * 0.82,
          animation: spinning ? `crest-spin ${Math.max(2.5, 6 - blade.stats.dash * 0.4)}s linear infinite` : undefined,
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges">
          <circle cx="50" cy="50" r="47" fill="none" stroke={ring} strokeWidth="3" />
          <circle cx="50" cy="50" r="41" fill={line.accent} stroke="#000" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="#150a24" stroke="#000" strokeWidth="1.5" />
          {crest.map((row, y) =>
            row.map((on, x) =>
              on ? (
                <rect
                  key={`${x}-${y}`}
                  x={18 + x * cell}
                  y={28 + y * cellY}
                  width={cell}
                  height={cellY}
                  fill={line.text}
                  opacity={0.92}
                />
              ) : null,
            ),
          )}
          <circle cx="50" cy="50" r="30" fill="none" stroke={line.border} strokeWidth="1.5" />
          {blade.spinDirection === 'Right' ? (
            <path d="M74 34 a24 24 0 0 1 6 12 l-6 -2 l4 6 l-8 -1 z" fill={ring} />
          ) : (
            <path d="M26 34 a24 24 0 0 0 -6 12 l6 -2 l-4 6 l8 -1 z" fill={ring} />
          )}
        </svg>
      </div>
      <style>{`@keyframes crest-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  )
}
