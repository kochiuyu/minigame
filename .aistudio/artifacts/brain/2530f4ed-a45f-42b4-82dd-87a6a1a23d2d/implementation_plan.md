# What-If Lab Overhaul: Interactive Visual Simulator & Payoff Response Maps

Transform the What-If Laboratory from a text-heavy dashboard into an interactive, visual-first economic simulator. The centerpiece of every game becomes a live, dynamic payoff response map or equilibrium curve that reacts instantly to direct scrubbing sliders, replacing dense paragraphs with visual meters, coordinate landscapes, and glanceable metric chips.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan strictly adheres to the 3 decisions confirmed by the user in Phase 1:
> 1. **Visual Centerpiece**: A live interactive graph / payoff response map (reaction curve coordinates, equilibrium fixed points, and response surfaces) dominating the screen.
> 2. **Drastic Text Reduction**: Replace multi-line explanatory paragraphs and narrative cards with visual gauges, status indicators, and compact metric chips.
> 3. **Engaging Interaction**: Direct scrubbing sliders and interactive visual markers that animate the graphs and equilibrium coordinates in real time.

---

## 1. Overview & Core Concept

- **The Problem**: Currently, students opening the What-If Lab encounter multiple stacked panels with heavy paragraphs ("Role Context", "Strategic Tension", "Why this model matters", analytical derivations). This cognitive overload drives users away before they explore the dynamics.
- **The Solution**: A visual laboratory where game theory comes alive graphically. Students drag policy and payoff sliders and directly watch the reaction curves shift, equilibrium points migrate across $(p, q)$ coordinate space, and harvest curves cross sustainability thresholds.
- **Key Value**: Immediate spatial and visual intuition for Nash equilibria, strategic dominance, and mechanism design—learning by seeing rather than reading walls of text.

---

## 2. User Experience & Visual Design

### 2.1 The Two-Zone Visual Stage Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ WHAT-IF VISUAL SIMULATOR (Game Title)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1-Line Mission Headline & Status Gauge: [======|=====] 78% Cooperation     │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ LIVE VISUAL GRAPH (60% Width)        │ INTERACTIVE LEVERS & GAUGES (40%)    │
│                                      │                                      │
│  q (P2)                              │ ⚡ Quick Scenario Chips              │
│   1 ┌───────────────────────────┐    │ [ Baseline ] [ Tipping ] [ Enforce ] │
│     │            ★ Nash (p*,q*) │    │                                      │
│     │           ↗ (Cooperation) │    │ Direct Scrubbing Sliders:            │
│     │                           │    │ • Cheating Gain (T):  ──●──── 3.0    │
│     │                           │    │ • Mutual Reward (R):  ────●── 3.5    │
│     │ ↙ Defect                  │    │ • Penalty Fine (P):   ──●──── 1.0    │
│   0 └───────────────────────────┘    │                                      │
│     0                         1 p(P1)│ Live Gauges & Glanceable Chips:      │
│   Live Reaction Curves & Heatmap     │ • Stability:  [ Stable Nash ]        │
│   Point animates in real-time as     │ • Social Surplus: +$4.00 (+100%)     │
│   sliders are scrubbed.              │ • Defection Advantage: -0.50 (Dead)  │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ 📐 Go deeper: Analytical Proof & Case Study (Collapsed single-line drawer)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Game-Specific Visual Centerpieces

1. **Matrix Games (Prisoner's Dilemma, Stag Hunt, Hawk-Dove, Battle of Sexes, Matching Pennies, 2x2 Price)**:
   - **Live 2D Strategy Phase Space $(p, q)$**:
     - Coordinates: $p = \text{Prob}(R_1)$ on X-axis, $q = \text{Prob}(C_1)$ on Y-axis.
     - Dynamic vector flow field and Nash equilibrium markers $(\star)$ that move smoothly across the plane as payoffs are scrubbed.
     - Immediate visual demonstration of when the defection sink $(0, 0)$ flips into a cooperative basin of attraction $(1, 1)$.
2. **Auction Games (Vickrey 2nd-Price & 1st-Price Auctions)**:
   - **Live Bidding Profit & Surplus Curve**:
     - Plotting expected surplus $E[\pi]$ against bid $b \in [0, 10]$.
     - Highlighting the dominant truthful point $b = v$ (Game 7) or the shaded peak $b^* = \frac{N-1}{N} v$ (Game 8).
3. **Public Goods & Resource Commons (Games 12 & 27)**:
   - **Renewable Stock Reproduction vs. Harvest S-Curve**:
     - Natural logistic growth parabola $g(S)$ plotted against fishing effort line $H(E, S)$.
     - Real-time visual intersection showing Sustainable Yield vs. Extinction Collapse.
4. **Duopolies (Cournot & Bertrand, Games 14 & 21)**:
   - **Live Reaction Function Cross $(R_1(q_2), R_2(q_1))$**:
     - Visual intersection showing the Cournot equilibrium output migrating as marginal costs or market size sliders move.
5. **Linear City & Bargaining (Hotelling & Split-the-Pie, Games 9 & 22)**:
   - **Interactive Beach Strip & Surplus Splitter**:
     - Live vendor territory split visualizer with moving market boundary line.

### 2.3 Radical Text Reduction

- **Removed**: Multi-paragraph narrative summaries, redundant role descriptions, verbose "why this matters" commentary.
- **Replaced with**:
  - Compact **Equilibrium Meter**: Visual status bar (`[====|====]`) indicating distance to Pareto efficiency.
  - **Single-Line Punchy Verdict**: Concise 12-to-15 word summary directly below the graph.
  - **Glanceable Numeric Metric Chips**: High-contrast, unboxed figures with colored indicators (`+$2.00 surplus`, `Nash: Stable`, `Friction: Neutralized`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: SVG Coordinate Landscapes vs. Heavy Canvas Libraries**
  - *Chosen Approach*: Clean, lightweight, reactive SVG visualizers rendered directly in React with Tailwind CSS.
  - *Why*: Instant zero-latency 60fps responsiveness on mobile devices and desktop without loading external heavy chart bundles (like Chart.js or D3), keeping the app lightweight and accessible.
- **Decision 2: Direct Scrubbing with Immediate Vector Updates**
  - *Chosen Approach*: Native HTML range inputs styled as sleek scrubbing bars that mutate state directly on `onChange`, updating SVG coordinates simultaneously.
  - *Why*: Provides tactile, immediate cause-and-effect learning where students physically feel the tipping points.
- **Decision 3: Preserving Academic Rigor in a Collapsed Drawer**
  - *Chosen Approach*: Keep the full formal mathematical proof, analytical assumptions, and market design case studies inside a collapsed drawer at the bottom.
  - *Why*: Satisfies advanced students and instructors without cluttering the interactive visual workspace for everyday learners.

---

## 4. Technical Architecture & Data Strategy

### Component Hierarchy & Module Breakdown

```
src/components/sandbox/
├── WhatIfVisualStage.tsx          # Master visual stage router (renders SVG centerpieces)
├── visualizers/
│   ├── PhaseSpace2DVisualizer.tsx # Live (p, q) Nash coordinate landscape for 2x2 games
│   ├── AuctionSurplusVisualizer.tsx# Expected profit curves for 1st & 2nd price auctions
│   ├── CommonsResourceVisualizer.tsx # Logistic growth vs harvest curves for fishery & public goods
│   ├── ReactionFunctionVisualizer.tsx # Duopoly reaction curve intersections
│   └── TerritoryStripVisualizer.tsx   # Hotelling linear beach & bargaining territory
├── missionEngine.ts               # Verdict logic & numerical evaluation
└── GamePedagogyCard.tsx           # Compact banner & collapsed proof drawer
```

### Key Technical Sequences

1. User scrubs a slider (e.g., Temptation $T$ in Prisoner's Dilemma).
2. React state updates immediately with no debounce lag.
3. SVG coordinate transforms calculate new $(p^*, q^*)$ fixed points and curve intersections.
4. Visual equilibrium marker $(\star)$ and flow arrows re-render at 60fps with CSS transition smoothing.
5. Single-line verdict and efficiency meter update reactively.

---

## 5. Verification Plan

1. **Compilation**: Verify build with `compile_applet` and type-checking with `lint_applet`.
2. **Visual & Interaction Verification**:
   - Check that scrubbing sliders smoothly moves the equilibrium point across the phase space graph.
   - Verify that text clutter is eliminated and layout fits cleanly on phone and desktop screens.
   - Verify that clicking "Quick Scenarios" snaps the graph to key economic milestones.
