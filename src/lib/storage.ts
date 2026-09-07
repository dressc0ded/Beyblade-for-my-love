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

export interface LeaderboardEntry {
  name: string
  wins: number
}

const LEADERBOARD_KEY = 'combolab.gameplay-leaderboard.v1'

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY)
    return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : []
  } catch {
    return []
  }
}

function persistLeaderboard(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries))
  } catch {
    // ignore
  }
}

/** Records a win for `name`, creating the entry if it doesn't exist yet, and returns the updated board. */
export function recordWin(name: string): LeaderboardEntry[] {
  const trimmed = name.trim() || 'Player'
  const entries = loadLeaderboard()
  const existing = entries.find((e) => e.name.toLowerCase() === trimmed.toLowerCase())
  if (existing) existing.wins += 1
  else entries.push({ name: trimmed, wins: 1 })
  entries.sort((a, b) => b.wins - a.wins)
  persistLeaderboard(entries)
  return entries
}
