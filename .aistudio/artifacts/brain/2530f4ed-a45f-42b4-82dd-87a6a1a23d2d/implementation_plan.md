# Implementation Plan: Hawk-Dove Brinkmanship & Ultimatum Bargaining

Add two classic game theory simulations to the Solo Lab suite:
1. **Hawk-Dove / Chicken (Game 15)**: High-stakes anti-coordination, brinkmanship, and evolutionary stable strategies (ESS).
2. **Ultimatum Bargaining (Game 16)**: The clash between subgame-perfect Nash equilibrium (rational selfishness) and empirical human fairness (inequity aversion).

---

## 1. Game Mechanics & Payoffs

### Game 15: Hawk-Dove Brinkmanship (Game of Chicken)
- **Concept**: Anti-coordination and credible threats.
- **Actions**:
  - `Dove` (Swerve / Share)
  - `Hawk` (Drive Straight / Fight)
- **Payoffs**:
  - Mutual Dove: Shared Resource $(+3, +3)$
  - Mutual Hawk: Catastrophic Collision $(-10, -10)$
  - You Hawk, Bot Dove: Hawk Exploits Dove $(+6, 0)$
  - You Dove, Bot Hawk: Dove Concedes to Hawk $(0, +6)$
- **Equilibria**:
  - Two Pure Nash Equilibria: $(\text{Hawk}, \text{Dove})$ and $(\text{Dove}, \text{Hawk})$.
  - Mixed Strategy Nash Equilibrium: Randomize Hawk with probability $p = 3/13 \approx 23\%$.

### Game 16: Ultimatum Bargaining & Fairness
- **Concept**: Subgame-perfect Nash equilibrium vs. behavioral inequity aversion.
- **Actions**:
  - Propose an offer $O \in [0, 10]$ out of a $\$10.00$ stake (Proposer keeps $\$10 - O$).
  - Opponent bot decides whether to **Accept** or **Reject**.
- **Payoffs**:
  - If Accepted: Proposer gets $\$10 - O$, Responder gets $\$O$.
  - If Rejected: Both get $\$0$ (mutual destruction).
- **Equilibria**:
  - Subgame Perfect Nash (SPNE): Responder accepts any $O > 0$; Proposer offers minimal positive amount.
  - Empirical Reality: Offers below $\$3.00$ are frequently rejected out of spite/fairness norms; modal offer is $\$4.00-\$5.00$.

---

## 2. Dedicated Bot Personas & Behavioral Engines

### For Hawk-Dove (Game 15) in `src/services/botEngine.ts`:
1. **John Maynard Smith (Evolutionary Hawk)**: Relentlessly aggressive Hawk player daring the opponent to swerve or crash.
2. **Pax (Peaceful Dove)**: Pure pacifist; always plays Dove to eliminate the risk of a $-10$ catastrophe.
3. **ESS Calculator (Evolutionary Mixed Strategist)**: Randomizes Hawk with mathematical ESS frequency ($p = 23\%$).
4. **Bourgeois / Correlated Falcon**: Starts peaceful as Dove, but if provoked by a Hawk, escalates to Hawk in retaliation.

### For Ultimatum Bargaining (Game 16) in `src/services/botEngine.ts`:
1. **Homo Economicus (Rational Profit Maximizer)**: Strict subgame-perfect responder; accepts ANY offer $\ge \$1.00$.
2. **Equity Enforcer (50/50 Egalitarian)**: Rejects any offer strictly below $\$4.50$; prioritizes fairness over money.
3. **Spiteful Punisher (Inequity Averse)**: Rejects offers below $\$3.00$ to punish greed with zero payoff for both.
4. **Adaptive Negotiator (Dynamic Expectation)**: Adjusts its acceptance threshold each round based on your past generosity.

---

## 3. UI & Visual Components

### 1. `src/components/InteractiveMatrixVisualizer.tsx`
- **Hawk-Dove Visualizer (Module 15)**:
  - 2x2 interactive matrix with live highlighting of candidate action and anticipated bot move.
  - "Collision Danger Gauge" showing catastrophic loss potential $(-10)$ when hovering or selecting Hawk.
- **Ultimatum Bargaining Visualizer (Module 16)**:
  - Interactive split slider showing Proposer keep ($\$10 - O$) vs Responder receive ($\$O$).
  - Visual pie/bar divider and real-time bot acceptance likelihood zone (Green: safe, Amber: risky, Red: rejection danger).

### 2. `src/components/SoloLabView.tsx`
- Add Modules 15 and 16 to `availableModules` with custom icons (`🦅`, `🍰`), categories, and descriptions.
- Add state handlers for Hawk-Dove (`hawkChoice`) and Ultimatum (`ultimatumOffer`).
- Integrate round submission and history resolution for both modules.
- Pass appropriate theoretical benchmarks (Nash vs Pareto) to `TheoryDebrief`.

### 3. `src/components/TheoryDebrief.tsx`
- Add formal theory insight cards for Game 15 and Game 16:
  - **Hawk-Dove**: Evolutionarily Stable Strategy (ESS), mixed strategy calculations, Cuban Missile Crisis brinkmanship case study.
  - **Ultimatum**: Backward induction unravelling, Fehr-Schmidt inequity aversion model, real-world salary and labor union bargaining case study.

---

## 4. Verification Plan
- Run `lint_applet` (`tsc --noEmit`) to verify 0 type or import errors.
- Run `compile_applet` to confirm the production build succeeds.
- Test round submission, visualizer updates, thought streams, and theory debriefs for both new games.
