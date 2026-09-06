import { create } from 'zustand'
import { BITS, BLADES, RATCHETS } from '../data/parts'
import type { SavedBuild } from '../data/types'
import { loadSavedBuilds, persistSavedBuilds } from '../lib/storage'

interface BuildState {
  bladeId: string
  ratchetId: string
  bitId: string
  setBlade: (id: string) => void
  setRatchet: (id: string) => void
  setBit: (id: string) => void
  savedBuilds: SavedBuild[]
  saveCurrentBuild: (name: string) => void
  deleteBuild: (id: string) => void
  loadBuild: (build: SavedBuild) => void
}

export const useBuildStore = create<BuildState>((set, get) => ({
  bladeId: BLADES[0].id,
  ratchetId: RATCHETS[0].id,
  bitId: BITS[0].id,
  setBlade: (id) => set({ bladeId: id }),
  setRatchet: (id) => set({ ratchetId: id }),
  setBit: (id) => set({ bitId: id }),
  savedBuilds: loadSavedBuilds(),
  saveCurrentBuild: (name) => {
    const { bladeId, ratchetId, bitId, savedBuilds } = get()
    const build: SavedBuild = { id: crypto.randomUUID(), name, bladeId, ratchetId, bitId, createdAt: Date.now() }
    const next = [build, ...savedBuilds]
    persistSavedBuilds(next)
    set({ savedBuilds: next })
  },
  deleteBuild: (id) => {
    const next = get().savedBuilds.filter((b) => b.id !== id)
    persistSavedBuilds(next)
    set({ savedBuilds: next })
  },
  loadBuild: (build) => set({ bladeId: build.bladeId, ratchetId: build.ratchetId, bitId: build.bitId }),
}))

export function getBladeById(id: string) {
  return BLADES.find((b) => b.id === id) ?? BLADES[0]
}
export function getRatchetById(id: string) {
  return RATCHETS.find((r) => r.id === id) ?? RATCHETS[0]
}
export function getBitById(id: string) {
  return BITS.find((b) => b.id === id) ?? BITS[0]
}
