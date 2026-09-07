import type { Region } from '../data/types'

export function regionLabel(regions: Region[]): string {
  if (regions.length === 1 && regions[0] === 'Japan') return 'Japan only (Takara Tomy)'
  if (regions.includes('Japan') && regions.length > 1) return `Japan + ${regions.filter((r) => r !== 'Japan').join(', ')} (Hasbro)`
  return regions.join(', ')
}
