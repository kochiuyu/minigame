# Implementation Plan: Canonical 1-to-28 Game Numbering & Curriculum Unification

Align and unify game numbering across the entire platform so that Solo Lab, What-If Lab, and all navigation dropdowns follow the exact same authoritative 8-tier progression from **Game 1 to Game 28**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user during the Phase 1 clarification interview:

- **Confirmed Sequence Source**: All views (Solo Lab, What-If Lab, and navigation dropdowns) strictly align with the **Solo Lab 8-tier pedagogical progression**.
- **Confirmed Numbering Convention**: Unified sequential numbering (**Game 1 to Game 28**) is displayed uniformly across all page headers, badges, card labels, and dropdown menus. Internal database IDs are mapped via an authoritative lookup (`src/data/curriculumOrder.ts`) so existing game logic, scoring, and calculations remain 100% stable without breaking backwards compatibility.

---

## 1. Overview & Root Cause Analysis

### The Problem
Previously, games were referenced using inconsistent numbering schemes:
1. **Random Internal IDs**: Games were created with arbitrary legacy IDs (`id: 1, 6, 12, 7, 13, 18, 15, 4, 17, 23, 21, 22, 2, 5, 20...`).
2. **Conflicting What-If Dropdown Labels**: In `App.tsx`, games were manually given sequential labels that contradicted their internal IDs (e.g., `id: 6` was labeled "Game 2", but the What-If header rendered `Game 6`).
3. **Mismatched Solo Lab Sequence**: In Solo Lab, `id: 3` (Price Competition) was the second game, while in What-If Lab it was listed as Game 17.

### The Solution
Established a single source of truth (`src/data/curriculumOrder.ts`) that maps internal game IDs to an authoritative **Curriculum Number (1 to 28)** and organizes them into the 8 canonical tiers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MASTER CURRICULUM SEQUENCE (GAMES 1 TO 28 ACROSS 8 TIERS)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: Foundations & Dominance                                             │
│   • Game 1  (id: 1)  🤝 One-Shot Prisoner's Dilemma                         │
│   • Game 2  (id: 3)  ⚡ Simultaneous Price Competition (Bertrand 2x2)       │
│                                                                             │
│ TIER 2: Coordination & Conflict                                             │
│   • Game 3  (id: 13) 🦌 Stag Hunt Coordination                              │
│   • Game 4  (id: 18) 🎭 Battle of the Sexes                                 │
│   • Game 5  (id: 15) 🦅 Hawk-Dove Brinkmanship                              │
│                                                                             │
│ TIER 3: Zero-Sum & Mixed Strategies                                         │
│   • Game 6  (id: 17) 🪙 Matching Pennies                                    │
│   • Game 7  (id: 4)  📅 Promotion Timing (3x3 Mixed)                        │
│   • Game 8  (id: 23) ⚔️ Colonel Blotto Resource War                         │
│                                                                             │
│ TIER 4: Extensive Form & Backward Induction                                 │
│   • Game 9  (id: 2)  🚀 Launch-or-Wait (Sequential Entry)                   │
│   • Game 10 (id: 5)  🏰 Entry Deterrence & Commitment                       │
│   • Game 11 (id: 20) 🐛 Centipede Game (Backward Induction)                 │
│                                                                             │
│ TIER 5: Repeated Games & Reciprocity                                        │
│   • Game 12 (id: 6)  🔁 Repeated Prisoner's Dilemma                         │
│   • Game 13 (id: 19) 🏦 The Trust Game (Investment)                         │
│   • Game 14 (id: 12) 🐟 Tragedy of the Commons & Coastal Fishery            │
│   • Game 15 (id: 27) 🌊 Renewable Ocean Fishery (Ostrom Commons)            │
│                                                                             │
│ TIER 6: Behavioral Bargaining & Fairness                                    │
│   • Game 16 (id: 16) 🍰 Ultimatum Bargaining & Fairness                     │
│   • Game 17 (id: 9)  🥧 Split-the-Pie (Outside Options)                     │
│   • Game 18 (id: 26) 🧳 Traveler's Dilemma (Basu Paradox)                   │
│                                                                             │
│ TIER 7: Industrial Organization & Markets                                   │
│   • Game 19 (id: 14) 🏷️ Bertrand Continuous Duopoly Price War              │
│   • Game 20 (id: 21) 🏭 Cournot Duopoly Competition (Quantity)              │
│   • Game 21 (id: 22) 🏖️ Hotelling's Spatial Competition (Beachfront)        │
│                                                                             │
│ TIER 8: Information Economics, Cognitive Levels & Auctions                  │
│   • Game 22 (id: 11) 💭 Keynesian Beauty Contest (2/3 of Average)           │
│   • Game 23 (id: 10) 📜 Costly Signaling & Adverse Selection (Spence)       │
│   • Game 24 (id: 7)  ⚖️ Second-Price Vickrey Auction                       │
│   • Game 25 (id: 8)  🎯 First-Price Sealed-Bid Auction                      │
│   • Game 26 (id: 24) 🛢️ Common-Value Oil Lease Auction (Winner's Curse)     │
│   • Game 27 (id: 25) 💸 The Escalating Dollar Auction                       │
│   • Game 28 (id: 28) 🍋 Market for Lemons (Akerlof Adverse Selection)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Architecture & File Modifications

### A. Authoritative Curriculum Mapping (`src/data/curriculumOrder.ts`) [COMPLETED]
Created a single shared utility module exporting:
- `CURRICULUM_ENTRIES`: Ordered array of all 28 games with their `curriculumNumber` (1–28), `internalId`, `tierNumber`, `tierTitle`, `title`, and `icon`.
- `CURRICULUM_TIERS`: Grouped tiers for easy dropdown rendering.
- Helper functions:
  - `getCurriculumNumber(internalId: number): number`
  - `getInternalId(curriculumNumber: number): number`

### B. What-If Lab Dropdown & App Routing (`src/App.tsx`) [COMPLETED]
- Replaced the hardcoded `<optgroup>` list in `<select id="sandbox-model-select">` with dynamic tier mapping from `CURRICULUM_TIERS`.
- Handled `sandboxGameId === 999` cleanly as "Universal 2×2 Matrix Solver (Custom Homework / Scratchpad)".
- Passed `sandboxGameId` into the `<Header ... />` component.

### C. What-If Sandbox & Pedagogy Presentation [COMPLETED]
- `src/components/WhatIfSandbox.tsx`: Active Game Context Header now displays `{game.id === 999 ? 'Custom Tool' : `Game ${getCurriculumNumber(game.id)}`}: {game.title}`.
- Matrix solver tab toggle remains visible strictly for 2×2 matrix games (`id: 1, 3, 13, 15, 17, 18, 999`), preserving clear focus for all 22 other models.
- `src/components/sandbox/GamePedagogyCard.tsx`: Updated Panel A header badge to render `{gameId === 999 ? 'Custom Tool' : `Game ${getCurriculumNumber(gameId)}`}`.

### D. Solo Lab View & Debrief Sync [COMPLETED]
- `src/components/SoloLabView.tsx`: Step 3 and Step 4 transition buttons now display `Game ${currentModuleIndex}: {activeModule.shortTitle}`.
- `src/components/TheoryDebrief.tsx`: What-If button displays `∫ Test in What-If Sandbox (Game {getCurriculumNumber(data.gameId)})`.
- Clicking from any game in Solo Lab launches What-If Lab directly into the identical game number.

### E. Global Header & Catalog Dropdown [COMPLETED]
- `src/components/Header.tsx`:
  - Solo mode indicator: `Game X of 28`.
  - Sandbox mode indicator: `Game X of 28` (or `Custom 2×2 Solver`).
  - Live mode indicator: `Game X: Title`.
  - Catalog dropdown: Prefixed every game title with `Game ${getCurriculumNumber(game.id)}: ${title}`.

---

## 3. Verification & Execution Status

- [x] **Curriculum Map**: Created `src/data/curriculumOrder.ts`.
- [x] **What-If Dropdown & App State**: Synchronized in `src/App.tsx`.
- [x] **Sandbox & Pedagogy Headers**: Updated in `WhatIfSandbox.tsx` and `GamePedagogyCard.tsx`.
- [x] **Solo Lab & Debrief Buttons**: Updated in `SoloLabView.tsx` and `TheoryDebrief.tsx`.
- [x] **Global Header**: Updated in `Header.tsx`.
- [x] **Lint Verification**: `tsc --noEmit` passed with 0 errors.
- [x] **Build Verification**: `npm run build` compiled cleanly.
