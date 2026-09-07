# Combo Lab — Beyblade X Workshop

A Y2K/pixel-art companion app for Beyblade X: a combo configurator, part
wiki, tier lists, comparison tool, battle simulator, and release-strategy
compendium, all built on one shared part dataset.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Zustand.

## Run it

```bash
npm install
npm run dev
```

## Pages

- **Garage** (`/`) — home hub with tiles linking to every feature.
- **Configurator** (`/configurator`) — build a Blade + Ratchet + Bit combo with
  a live per-blade crest icon, animated stat bars, legality checks, saved
  builds (localStorage), PNG export, and shareable build codes.
- **Wiki** (`/wiki`) — searchable/filterable database of every part (line,
  region of release, Hasbro Western name where known) with a table and card
  view and a detail panel.
- **Tier Lists** (`/tier-lists`) — computed S–D tier lists per category with
  Attack/Defense/Stamina/Overall meta toggles, plus a pointer-drag "make your
  own" mode saved per category.
- **Compare** (`/compare`) — side-by-side stat cards for any two same-category
  parts with delta bars and an auto-generated plain-language breakdown.
- **Battle** (`/battle`) — simulate a match with an animated clash arena and
  spin-power meters; either side can be your Configurator build, a random CPU
  combo, or a custom build-on-the-spot, with best-of 1/3/5 series support.
- **Compendium** (`/compendium`) — an expandable almanac of Beyblade X's
  release strategies (retail, CX boosters, starters, limited drops, etc).

## Data

`src/data/parts.ts` is the single source of truth for every Blade, Ratchet,
and Bit; all other pages derive from it.

**Line names**: Basic, CX (Custom Line — combo blades built from a named Lock
Chip + two blade halves), and UX (Unique Line — single-mold boosters) are
Takara Tomy's real line names. `Limited` is this app's own tag for
convention/region exclusives, not an official line.

**Stat honesty**: the only stat categories confirmed on real packaging are a
single Attack/Defense/Stamina/Balance "Type" label (Takara Tomy JP boxes) and
separate numeric Attack/Defense/Stamina bars (Hasbro Western boxes).
`burstResistance` and `dash` are gameplay stats this app models to make the
simulator and comparisons work — they are not printed on any retail box.
Every numeric value is a reconstructed 0–10 composite, so every part carries
`confidence: 'estimated'`, surfaced in the Wiki as an "unofficial/estimated"
badge. Regions and Hasbro names are noted where reasonably corroborated
against public sources, but exact product codes/dates are approximate —
treat this as a strong gameplay approximation, not a citation source. Swap in
verified numbers as you confirm them; the schema in `src/data/types.ts` is
built to make that a one-line change per part.
