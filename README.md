# Combo Lab — Beyblade X Workshop

A pixel-art, 16-bit-styled companion app for Beyblade X: a combo configurator,
part wiki, tier lists, comparison tool, battle simulator, and release-strategy
compendium, all built on one shared part dataset.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Zustand.

## Run it

```bash
npm install
npm run dev
```

## Pages

- **Garage** (`/`) — home hub with pixel-art tiles linking to every feature.
- **Configurator** (`/configurator`) — build a Blade + Ratchet + Bit combo with a
  live preview, animated stat bars, legality checks, saved builds (localStorage),
  PNG export, and shareable build codes.
- **Wiki** (`/wiki`) — searchable/filterable database of every part with a
  table and card view and a detail panel.
- **Tier Lists** (`/tier-lists`) — computed S–D tier lists per category with
  Attack/Defense/Stamina/Overall meta toggles, plus a drag-and-drop "make your
  own" mode saved per category.
- **Compare** (`/compare`) — side-by-side stat cards for any two same-category
  parts with delta bars and an auto-generated plain-language breakdown.
- **Battle** (`/battle`) — simulate a match (vs. CPU or a custom build) with an
  animated spin-power meter, finish types (Spin/Over/Burst/Xtreme), and best-of
  3/5 series support.
- **Compendium** (`/compendium`) — an expandable almanac of Beyblade X's
  release strategies (retail, CX boosters, starters, limited drops, etc).

## Data

`src/data/parts.ts` is the single source of truth for every Blade, Ratchet,
and Bit; all other pages derive from it. Stat numbers are a gameplay-style
0–10 composite, not an official manufacturer figure, so every part is marked
`confidence: 'estimated'` and the Wiki surfaces an "unofficial/estimated"
badge. Swap in verified numbers as you confirm them — the schema in
`src/data/types.ts` is built to make that a one-line change per part.
