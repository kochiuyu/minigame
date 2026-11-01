# Solo Lab 20-Game Catalog Expansion Plan

Expand Solo Lab from 13 games to all **20 games** to achieve 100% feature and content parity with Live Class. Every newly integrated game features curated behavioral bot opponents, interactive payoff/outcome visualizers, deep dive theory debriefs, and end-of-game equilibrium quizzes with persistent high-score badges.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during the interactive interview:
> - **Game Scope**: Implemented all 7 missing games (Games 2, 3, 4, 5, 8, 9, 10) to reach complete 20/20 parity with Live Class.
> - **Bot Personalities**: Curated behavioral personas with diverse strategic rationales (e.g., Nash rational, aggressive/exploitative, cautious/fair, and erratic) rather than rigid formulaic bots.
> - **Full Parity**: Full integration across all steps: Interactive Rule Visualizer (Step 1), Live Choice Previews (Step 2), Match Outcome Illuminations (Step 3), Theory Debrief (Step 4), and 3-Question Equilibrium Quizzes (Step 5).
> - **Single-Round Flow**: All 7 newly added games follow single-round gameplay with instant "Play Again" replays, preserving Game 6 (Repeated Prisoner's Dilemma) as the sole multi-round game.

---

## 1. Overview & Catalog Architecture

All 20 games are now active in Solo Lab's pedagogical difficulty progression (Easy $\to$ Medium $\to$ Hard):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SOLO LAB 20-GAME CATALOG                        │
├────────────────────────────────┬───────────────────────────────────────┤
│ EXISTING (13 Games)            │ NEW ADDITIONS (7 Games)               │
├────────────────────────────────┼───────────────────────────────────────┤
│ Game 1: One-Shot PD            │ Game 2: Launch-or-Wait (Sequential)   │
│ Game 13: Stag Hunt             │ Game 3: Price Competition (Bertrand)  │
│ Game 15: Hawk-Dove             │ Game 4: Promotion Timing (3x3 Mixed)  │
│ Game 18: Battle of the Sexes   │ Game 5: Entry Deterrence & Commitment │
│ Game 17: Matching Pennies      │ Game 8: First-Price Auction (Shading) │
│ Game 16: Ultimatum Bargaining  │ Game 9: Split-the-Pie (Outside Opt)   │
│ Game 19: The Trust Game        │ Game 10: Costly Signaling (Spence)    │
│ Game 12: Public Goods          │                                       │
│ Game 6: Repeated PD            │                                       │
│ Game 7: Vickrey 2nd-Price      │                                       │
│ Game 14: Bertrand Duopoly      │                                       │
│ Game 11: Beauty Contest (2/3)  │                                       │
│ Game 20: Centipede Game        │                                       │
└────────────────────────────────┴───────────────────────────────────────┘
```

### Detailed Breakdown of the 7 New Games

1. **Game 2: Launch-or-Wait (Sequential First-Mover Advantage)** [COMPLETED]
   - *Category*: Bargaining & Sequential Markets
   - *Mechanic*: First mover chooses Launch or Wait. Second mover observes and chooses Enter or Stay Out.
   - *Bots*: Atlas (Backward Inducer), Shelby (Timid Follower), Viper (Aggressive Second Mover).
   - *Visualizer*: Two-stage extensive-form tree with highlighted path and terminal payoff nodes.

2. **Game 3: Simultaneous Price Competition (Bertrand 2×2)** [COMPLETED]
   - *Category*: Foundations & Dominance
   - *Mechanic*: Simultaneous choice between High Price ($2) and Low Price ($1).
   - *Bots*: Slicer (Relentless Cutter), Harmony (Collusive Optimist), Dice (Randomizer).
   - *Visualizer*: 2×2 normal-form payoff matrix with pure Nash Equilibrium marker at (Low, Low).

3. **Game 4: Promotion Timing (3×3 Mixed Strategy Coordination)** [COMPLETED]
   - *Category*: Zero-Sum & Mixed Strategies
   - *Mechanic*: Choose launch day: Monday, Wednesday, or Friday. Clashing on the same day yields 0; separate days yield +1.
   - *Bots*: Entropy (Uniform 1/3 Randomizer), Apex (Weekend Bias), Shift (Counter-Cyclical).
   - *Visualizer*: 3×3 matrix showing zeroed diagonal clashes and positive off-diagonals.

4. **Game 5: Entry Deterrence & Strategic Commitment** [COMPLETED]
   - *Category*: Extensive Form & Commitment
   - *Mechanic*: Incumbent decides to Commit (invest in capacity) or Stay Flexible. Rival decides to Enter or Stay Out.
   - *Bots*: Fortress (Credible Commitment Deterrent), Scout (Timid Entrant), Goliath (Aggressive Entrant).
   - *Visualizer*: Extensive-form tree displaying threat credibility and duopoly vs monopoly payoffs.

5. **Game 8: First-Price Sealed-Bid Auction & Winner's Curse** [COMPLETED]
   - *Category*: Auctions & Mechanism Design
   - *Mechanic*: Private valuation drawn uniformly from $1–$10. Highest bidder wins and pays their own bid (incentive to shade bid).
   - *Bots*: Nash Shader (bids $v/2$), Maximus (Aggressive Bidder), Bargain Hunter (Deep Shader).
   - *Visualizer*: Bid shading comparison scale ($v$ vs $b$) and shaded profit margin gauge.

6. **Game 9: Split-the-Pie Bargaining (Outside Options)** [COMPLETED]
   - *Category*: Bargaining & Behavioral Fairness
   - *Mechanic*: Simultaneous demand for a share of 10 points. If $D_1 + D_2 \le 10$, both get demand; if $>10$, deal collapses to outside option (1 pt).
   - *Bots*: Justice (50/50 Egalitarian), Maximus (Hardball Demander), Pax (Accommodating Shareholder).
   - *Visualizer*: Overlapping demands gauge highlighting conflict zone vs surplus allocation.

7. **Game 10: Costly Signaling & Asymmetric Information** [COMPLETED]
   - *Category*: Information Economics
   - *Mechanic*: High-quality vs Low-quality seller chooses whether to invest in a costly warranty/credential. Buyer chooses Trust or Don't Trust.
   - *Bots*: Veritas (Spence Auditor), Cynic (Lemon Skeptic), Optimist (Credulous Buyer).
   - *Visualizer*: Signaling tree highlighting Separating Equilibrium vs Pooling Equilibrium paths.

---

## 2. Implementation Status & File Modifications

- [x] **`src/services/botEngine.ts`**:
  - Implemented all 7 bot rosters with full backstories, strategy profiles, and decision functions.
  - Updated `getBotsForGame(gameId)` switch to route all 20 games to their custom rosters.
- [x] **`src/data/soloLabQuizzes.ts`**:
  - Added 3-question multiple choice quizzes for each of the 7 new games (covering first-mover advantage, backward induction, Bertrand undercutting, mixed-strategy unexploitability, credible commitment, first-price bid shading, Winner's Curse, Schelling focal points, outside options, and Spence separating/pooling equilibria).
- [x] **`src/components/InteractiveMatrixVisualizer.tsx`**:
  - Added normal-form matrix configurations for Game 3 (Bertrand 2×2 High/Low Price) and Game 4 (3×3 Promotion Timing: Mon, Wed, Fri with clash diagonals).
  - Dynamic `th colSpan={config.colActions.length}` to cleanly support any $N \times M$ matrix grid.
- [x] **`src/components/SequentialVisualizer.tsx`**:
  - Added specialized visual outcome diagrams for:
    - Game 2: Extensive-form sequential decision tree (Launch vs Wait $\to$ Enter vs Stay Out with SPNE marker).
    - Game 5: Strategic commitment deterrence tree (Commit capacity vs Stay Flexible $\to$ Challenger response).
    - Game 8: First-Price Sealed-Bid comparison scale ($v$ vs $b$ vs Nash $v/2$ and winning profit margin).
    - Game 9: Split-the-Pie demand compatibility bar ($D_1 + D_2 \le 10$ vs collapse to outside options).
    - Game 10: Spence costly signaling information tree (Nature Type $\to$ Costly Signal vs Cheap Talk $\to$ Buyer Trust).
- [x] **`src/components/SoloLabView.tsx`**:
  - Expanded `availableModules` to all 20 games with icons, titles, categories, and difficulty.
  - Added state hooks and Step 2 controls for all games (buttons, sliders, quality cards).
  - Implemented payoff calculations and decoupled Game 9 from Game 16.
  - Added Step 1 quick rules, Step 2 live previews, Step 3 takeaways and outcome illuminations, and Step 4 theory debriefs.
  - Verified `resetExperiment` resets state for all games.
- [x] **Build & Verification**:
  - `lint_applet` passed (`tsc --noEmit` exited 0).
  - `compile_applet` passed (Vite build successful).
