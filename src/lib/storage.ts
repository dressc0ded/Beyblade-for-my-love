import type { SavedBuild } from '../data/types'

const KEY = 'combolab.saved-builds.v1'

export function loadSavedBuilds(): SavedBuild[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedBuild[]) : []
  } catch {
    return []
  }
}

export function persistSavedBuilds(builds: SavedBuild[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(builds))
  } catch {
    // storage unavailable (private mode, quota) - fail silently, build stays in-memory
  }
}

const TIER_KEY = 'combolab.custom-tierlist.v1'

export function loadCustomTierList(): Record<string, string[]> | null {
  try {
    const raw = localStorage.getItem(TIER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function persistCustomTierList(data: Record<string, string[]>) {
  try {
    localStorage.setItem(TIER_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}
