import type { Bit, Blade, Ratchet, StatBlock } from '../data/types'
import { STAT_KEYS } from '../data/types'

const WEIGHTS = { blade: 0.45, ratchet: 0.3, bit: 0.25 }

export function comboStats(blade: Blade, ratchet: Ratchet, bit: Bit): StatBlock {
  const out = {} as StatBlock
  for (const key of STAT_KEYS) {
    const value = blade.stats[key] * WEIGHTS.blade + ratchet.stats[key] * WEIGHTS.ratchet + bit.stats[key] * WEIGHTS.bit
    out[key] = Math.round(value * 10) / 10
  }
  return out
}

export function comboWeight(blade: Blade, ratchet: Ratchet, bit: Bit): number {
  return Math.round((blade.weightGrams + ratchet.weightGrams + bit.weightGrams) * 10) / 10
}

export type Meta = 'attack' | 'defense' | 'stamina' | 'overall'

const META_WEIGHTS: Record<Meta, StatBlock> = {
  attack: { attack: 2.2, defense: 0.4, stamina: 0.3, burstResistance: 0.4, dash: 1.2 },
  defense: { attack: 0.3, defense: 2.2, stamina: 0.6, burstResistance: 1.6, dash: 0.2 },
  stamina: { attack: 0.2, defense: 0.6, stamina: 2.2, burstResistance: 1.0, dash: 0.1 },
  overall: { attack: 1, defense: 1, stamina: 1, burstResistance: 1, dash: 1 },
}

export function metaScore(stats: StatBlock, meta: Meta): number {
  const w = META_WEIGHTS[meta]
  return STAT_KEYS.reduce((sum, key) => sum + stats[key] * w[key], 0)
}

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D'

/** Rank-based quantile bucketing so tiers stay meaningful at any dataset size. */
export function assignTiers<T>(items: T[], scoreFn: (item: T) => number): { item: T; score: number; tier: Tier }[] {
  const scored = items.map((item) => ({ item, score: scoreFn(item) })).sort((a, b) => b.score - a.score)
  const n = scored.length
  return scored.map((entry, i) => {
    const pct = n <= 1 ? 0 : i / (n - 1)
    let tier: Tier
    if (pct <= 0.12) tier = 'S'
    else if (pct <= 0.35) tier = 'A'
    else if (pct <= 0.65) tier = 'B'
    else if (pct <= 0.85) tier = 'C'
    else tier = 'D'
    return { ...entry, tier }
  })
}
