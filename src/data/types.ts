// Shared data schema for Combo Lab. Every part pool (Blades, Ratchets, Bits)
// is derived from these types so the wiki, configurator, tier lists,
// comparison tool, and simulator all read from one source of truth.

/**
 * Official Takara Tomy line names: Basic (BX- single releases), CX (Custom
 * Line - combo blades built from a Lock Chip + two blade halves), and UX
 * (Unique Line - single-mold boosters with their own numbering). `Limited`
 * is not an official line - it's this app's tag for convention/region
 * exclusives, which can cut across any of the three real lines.
 */
export type Line = 'Basic' | 'CX' | 'UX' | 'Limited'

export type BladeType = 'Attack' | 'Defense' | 'Stamina' | 'Balance'

export type SpinDirection = 'Right' | 'Left'

/** Whether a part fits a standard Basic-line shaft or a wide CX combo shaft. */
export type ShaftType = 'Standard' | 'CX'

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Convention Exclusive'

/** Where a part has actually shipped at retail (or convention/promo distribution). */
export type Region = 'Japan' | 'North America' | 'Europe' | 'Asia (ex-Japan)'

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
  /** Every region this part has actually been sold in, e.g. ['Japan'] for a Takara Tomy-only single booster. */
  regions: Region[]
  notes?: string
}

export interface Blade extends PartBase {
  category: 'Blade'
  type: BladeType
  spinDirection: SpinDirection
  shaftType: ShaftType
  /** true for CX-line blades assembled from a Lock Chip + two blade halves */
  isComboBlade: boolean
  /** CX-exclusive named part that joins the two blade halves (e.g. "Dran", "Wizard") */
  lockChip?: string
  /** Hasbro's Western retail name, when it differs from the Takara Tomy name */
  hasbroName?: string
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
  Basic: { accent: '#22d3ee', bg: '#0e3a44', text: '#a5f3fc', border: '#67e8f9' },
  UX: { accent: '#ec4899', bg: '#4a0f30', text: '#fbcfe8', border: '#f472b6' },
  CX: { accent: '#f97316', bg: '#6b3a1d', text: '#fed7aa', border: '#fb923c' },
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
