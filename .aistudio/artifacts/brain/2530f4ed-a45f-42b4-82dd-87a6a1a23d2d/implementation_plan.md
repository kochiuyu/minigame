# Implementation Plan: Top 6 High-Impact Improvements for DOTE3090 Game Theory Lab

This plan outlines the 6 highest-impact, student-centered improvements for the DOTE3090 Game Theory Experiment Lab, ranked by value for university students and designed to fit into single, focused builds.

---

## Ranked Improvement Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RANKED IMPROVEMENT ROADMAP (BY VALUE FOR STUDENTS)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. [Fun & Clarity]     Visual "Payoff Radar & Regret Flash" in Step 3       │
│ 2. [Simpler Text]      3-Bullet "TL;DR Executive Briefing" on Step 1 Rules  │
│ 3. [Mobile Layout]     Sticky Thumb-Friendly Action Dock on Step 2 Choices  │
│ 4. [Bot Balance]       Adaptive Bounded Rationality & Opponent Thought Bubbles│
│ 5. [Instructor Portal] Real-Time Classroom Distribution & Equilibrium Gap   │
│ 6. [Fun & Retention]   Equilibrium Mastery Streaks & Tier Completion Badges │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Rank 1: Visual "Payoff Radar & Regret Flash" (Step 3: Outcome & Results)
- **Pedagogical Value**: Immediate intuitive feedback on strategic optimality without reading paragraphs of numbers.
- **One-Sentence Description**: Displays an instant visual matrix comparison directly after a round resolves showing "What You Earned vs. What You Could Have Earned (Counterfactual Regret)", turning raw point totals into instantaneous strategic intuition.
- **Key Deliverables**:
  - Color-coded payoff difference highlight (Green for optimal, Amber for unexploited surplus).
  - One-line takeaway: e.g., *"By pricing at $3.00 instead of $4.00, you captured +$1.00 more than undercutting."*
- **Files Likely Affected**:
  - `src/components/SoloLabView.tsx`
  - `src/components/InteractiveMatrixVisualizer.tsx`

---

### Rank 2: 3-Bullet "TL;DR Executive Briefing" (Step 1: Rules & Setup)
- **Pedagogical Value**: Eliminates cognitive overload so students can start playing within 10 seconds.
- **One-Sentence Description**: Condenses the narrative story on Step 1 into three 10-word bullet chips (Your Role, Available Choices, Win Condition) by default, keeping the detailed background story accessible under a clean "Historical / Market Context" expander.
- **Key Deliverables**:
  - Standardized 3-chip banner at top of Step 1 (`Role` | `Choice` | `Win Condition`).
  - Narrative text collapsed by default into an expandable card.
- **Files Likely Affected**:
  - `src/data/gameStories.ts`
  - `src/components/SoloLabView.tsx`

---

### Rank 3: Sticky Thumb-Friendly Mobile Action Dock (Step 2: Choice Arena)
- **Pedagogical Value**: Effortless one-handed classroom play on student smartphones.
- **One-Sentence Description**: Anchors decision buttons and bid/price sliders into a persistent bottom dock on mobile screens so students never have to scroll past diagrams or rule text to submit their choices.
- **Key Deliverables**:
  - Fixed mobile bottom-bar container (`sticky bottom-0 z-20`) for primary action buttons.
  - Safe padding offset to prevent overlapping content.
- **Files Likely Affected**:
  - `src/components/SoloLabView.tsx`

---

### Rank 4: Adaptive Bounded Rationality & Opponent Thought Bubbles (Bot Balance)
- **Pedagogical Value**: Realistic human-like play that teaches students how people actually deviate from pure Nash equilibria.
- **One-Sentence Description**: Rebalances bot decision distributions across the 8 tiers so entry-level opponents exhibit human bounded rationality (e.g. Level-1 Keynesian guesses, fair-minded Ultimatum offers) while displaying animated thought bubbles before decisions.
- **Key Deliverables**:
  - Adjusted noise and heuristic weights in `botEngine.ts`.
  - Dynamic anticipation thought bubble rendered during the bot's turn.
- **Files Likely Affected**:
  - `src/services/botEngine.ts`
  - `src/components/SoloLabView.tsx`

---

### Rank 5: Real-Time Classroom Distribution Heatmap & "Equilibrium Gap" (Instructor Portal)
- **Pedagogical Value**: Instantly gives instructors the data needed to lead rich classroom debriefs.
- **One-Sentence Description**: Adds a live 1-click visual histogram showing aggregated student choices compared against the theoretical Nash prediction on the instructor projector view, highlighting behavioral anomalies in real time.
- **Key Deliverables**:
  - Live frequency distribution chart overlaying theoretical equilibrium benchmark.
  - One-click "Projector Spotlight" toggle for full-screen classroom presentation.
- **Files Likely Affected**:
  - `src/components/InstructorDashboard.tsx`

---

### Rank 6: Equilibrium Mastery Streaks & Tier Completion Badges (Fun & Retention)
- **Pedagogical Value**: Sustains student engagement and motivation throughout the 28-game curriculum.
- **One-Sentence Description**: Introduces a lightweight mastery tracker that records completed games and consecutive quiz scores with unlockable tier badges, rewarding students for completing the curriculum.
- **Key Deliverables**:
  - Visual tier progress bar in top navigation.
  - Milestone unlock toasts upon completing each of the 8 curriculum tiers.
- **Files Likely Affected**:
  - `src/components/SoloLabView.tsx`
  - `src/components/Header.tsx`

---

## Implementation Strategy & Next Steps

Each improvement is fully decoupled and sized for a single focused build turn. Please review and select which improvement you would like to proceed with first.
