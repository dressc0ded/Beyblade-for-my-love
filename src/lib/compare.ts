import type { AnyPart, StatBlock } from '../data/types'
import { STAT_KEYS, STAT_LABELS } from '../data/types'

export interface StatDiff {
  key: keyof StatBlock
  label: string
  a: number
  b: number
  delta: number // a - b
}

export function diffStats(a: AnyPart, b: AnyPart): StatDiff[] {
  return STAT_KEYS.map((key) => ({
    key,
    label: STAT_LABELS[key],
    a: a.stats[key],
    b: b.stats[key],
    delta: Math.round((a.stats[key] - b.stats[key]) * 10) / 10,
  }))
}

const USE_CASE: Partial<Record<keyof StatBlock, { pro: string; con: string }>> = {
  attack: { pro: 'hits harder and can finish matches early with Spin/Burst Finishes', con: 'trades away raw knockout power' },
  defense: { pro: 'holds its ground better against aggressive attackers', con: 'gets pushed around more by heavy attack combos' },
  stamina: { pro: 'outlasts opponents in extended spin-stall matchups', con: 'runs out of spin sooner in long matches' },
  burstResistance: { pro: 'is harder to Burst Finish under repeated hits', con: 'is more vulnerable to Burst Finishes' },
  dash: { pro: 'accelerates faster and pressures early in the match', con: 'is slower to close distance early on' },
}

export function generateComparisonText(a: AnyPart, b: AnyPart): string[] {
  const diffs = diffStats(a, b).filter((d) => d.delta !== 0).sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
  if (diffs.length === 0) {
    return [`${a.name} and ${b.name} have identical stat lines - the choice comes down to line/rarity, spin behavior, or aesthetics.`]
  }
  const lines: string[] = []
  const top = diffs.slice(0, 3)
  const summary = top
    .map((d) => {
      const winner = d.delta > 0 ? a.name : b.name
      const loser = d.delta > 0 ? b.name : a.name
      return `${winner} has ${Math.abs(d.delta)} higher ${d.label} than ${loser}`
    })
    .join(', ')
  lines.push(`${summary}.`)

  const biggest = diffs[0]
  const info = USE_CASE[biggest.key]
  if (info) {
    const winner = biggest.delta > 0 ? a : b
    const loser = biggest.delta > 0 ? b : a
    lines.push(`Lean on ${winner.name} when you need a part that ${info.pro}. ${loser.name} ${info.con} by comparison.`)
  }

  const tradeoff = diffs.find((d) => d !== biggest && Math.sign(d.delta) !== Math.sign(biggest.delta))
  if (tradeoff) {
    const winner = tradeoff.delta > 0 ? a : b
    lines.push(`The tradeoff: ${winner.name} pulls ahead on ${tradeoff.label} instead, so match the pick to the matchup you're facing.`)
  }

  if (a.line !== b.line) {
    lines.push(`Note this compares across release lines (${a.line} vs ${b.line}) - availability and rarity differ even though both are legal tournament parts.`)
  }
  return lines
}
