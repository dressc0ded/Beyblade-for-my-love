// Shared data schema for Combo Lab. Every part pool (Blades, Ratchets, Bits)
// is derived from these types so the wiki, configurator, tier lists,
// comparison tool, and simulator all read from one source of truth.

export type Line = 'Basic' | 'Unique' | 'Custom' | 'Limited'

export type BladeType = 'Attack' | 'Defense' | 'Stamina' | 'Balance'

export type SpinDirection = 'Right' | 'Left'

/** Whether a part fits a standard Basic-line shaft or a wide CX combo shaft. */
export type ShaftType = 'Standard' | 'CX'

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Convention Exclusive'

/**
 * Data confidence: most numeric stats below are a community-style 0-10
 * composite (not an official Takara Tomy/Hasbro number) reconstructed from
 * the part's real-world reputation and packaging bar charts. `estimated`
 * parts should show an "unofficial/estimated" tag in the UI.
 */
export type Confidence = 'official' | 'estimated'

export interface StatBlock {
  attack: number
  defense: number
  stamina: number
  burstResistance: number
  dash: number
}

export interface PartBase {
  id: string
  name: string
  line: Line
  releaseDate: string // YYYY-MM (approximate for estimated entries)
  rarity: Rarity
  confidence: Confidence
  notes?: string
}

export interface Blade extends PartBase {
  category: 'Blade'
  type: BladeType
  spinDirection: SpinDirection
  shaftType: ShaftType
  /** true for Custom-line blades assembled from two combinable halves */
  isComboBlade: boolean
  weightGrams: number
  stats: StatBlock
}

export interface Ratchet extends PartBase {
  category: 'Ratchet'
  /** e.g. "3-60" -> 3 protrusions, 60 height */
  protrusions: number
  height: number
  compatibleShafts: ShaftType[]
  weightGrams: number
  stats: StatBlock
}

export interface Bit extends PartBase {
  category: 'Bit'
  shortCode: string
  movementType: string
  compatibleShafts: ShaftType[]
  weightGrams: number
  stats: StatBlock
}

export type AnyPart = Blade | Ratchet | Bit
export type PartCategory = AnyPart['category']

export interface Combo {
  blade: Blade
  ratchet: Ratchet
  bit: Bit
}

export interface SavedBuild {
  id: string
  name: string
  bladeId: string
  ratchetId: string
  bitId: string
  createdAt: number
}

export const LINE_COLORS: Record<Line, { accent: string; bg: string; text: string; border: string }> = {
  Basic: { accent: '#3b82f6', bg: '#1d3a6b', text: '#bfdbfe', border: '#60a5fa' },
  Unique: { accent: '#a855f7', bg: '#3b1d6b', text: '#e9d5ff', border: '#c084fc' },
  Custom: { accent: '#f97316', bg: '#6b3a1d', text: '#fed7aa', border: '#fb923c' },
  Limited: { accent: '#facc15', bg: '#6b5a1d', text: '#fef9c3', border: '#fde047' },
}

export const STAT_KEYS: (keyof StatBlock)[] = ['attack', 'defense', 'stamina', 'burstResistance', 'dash']

export const STAT_LABELS: Record<keyof StatBlock, string> = {
  attack: 'Attack',
  defense: 'Defense',
  stamina: 'Stamina',
  burstResistance: 'Burst Resistance',
  dash: 'Dash',
}
