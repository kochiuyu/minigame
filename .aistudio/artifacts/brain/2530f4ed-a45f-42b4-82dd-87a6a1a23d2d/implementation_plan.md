# Implementation Plan: Deepening Gameplay Depth Across the 24-Game Curriculum

The user confirmed keeping the curriculum focused at **24 authoritative games** and dedicating development to **deepening gameplay depth**, with priority on **Tragedy of the Commons Renewable Fishery dynamics**.

## Proposed Enhancements

### 1. Deepen Game 12: Renewable Fishery & Tragedy of the Commons Mode
* **Context**: Module 12 is currently the Public Goods Dilemma. We will deepen it into an immersive dual-view simulation:
  * **Tokens vs. Ocean Fishery Toggle**: Allow students to toggle between abstract tokens and a tangible **Renewable Coastal Fishery**.
  * **Stock Regeneration Dynamics**: Each round, remaining fish stock regenerates by $1.6\times$ (up to environmental carrying capacity). Overharvesting depletes the breeding stock and causes environmental collapse; cooperative quota management sustains maximum sustainable yield (MSY).
  * **Visual Fishery Health Bar**: Live ecological indicator showing fish population health (Overfished, Healthy, Abundant).

### 2. Specialized Interactive Visualizers for Tier 7 & 8 Games
* **Game 21 (Cournot Duopoly)**:
  * Interactive Best-Response Diagram: Displays the downward-sloping reaction curves $q_1^*(q_2) = (90 - q_2)/2$ and $q_2^*(q_1)$, highlighting the intersection at Cournot-Nash $(30, 30)$ vs. Cartel Collusion $(22.5, 22.5)$.
* **Game 22 (Hotelling Beach)**:
  * Live Beach Territory Heatmap: Displays both vendor locations on the boardwalk beach with color-coded customer catchment zones (Blue for Player, Amber for Bot) and the exact dividing midpoint.
* **Game 23 (Colonel Blotto)**:
  * 3-Front Side-by-Side Battlefield Clash: Visual battalion comparison for Pass A, Pass B, and Pass C showing troop counts, front victor flags, and strategic surplus/deficit.
* **Game 24 (Common-Value Oil Lease Auction)**:
  * Winner's Curse Distribution Chart: Visualizes the true reservoir value $V$, the two noisy signals, and the bids on a value line, explicitly shading the "Winner's Curse Danger Zone" ($Bid > V$).

### 3. Counterfactual Bot Intelligence in Step 3/4 Debrief
* **"What Would Other Bots Have Done?" Analysis**:
  * In Step 3 (Result) and Step 4 (Theory Debrief), show a compact comparison card showing what payoff the player would have achieved if facing each of the other two bot archetypes for that game with the same decision.
* **Marginal Sensitivity Gauge**:
  * Shows how the player's payoff would have changed with a slight adjustment (e.g. $\pm 1$ bid, $\pm 5$ units, or alternate coin face).

## Files to Modify
1. `src/components/SoloLabView.tsx`:
   - Add Fishery visual mode & ecological status for Game 12.
   - Integrate visualizers for Games 21, 22, 23, and 24 into Step 2 / Step 3.
   - Add counterfactual bot comparison card to the result debrief.
2. `src/components/SequentialVisualizer.tsx`:
   - Expand rendering support for Cournot, Hotelling, Blotto, and Common-Value Auction diagrams.
3. `src/data/gameStories.ts`:
   - Add enhanced ecological fishery context and quota stewardship detail to Game 12 story.

## Verification Plan
1. Run `compile_applet` (`npm run build`) to ensure build passes without syntax errors.
2. Run `lint_applet` (`tsc --noEmit`) to verify strict TypeScript adherence.
3. Test all 24 games in the UI, especially Game 12 Fishery mode and Games 21–24 visualizers.
