# DOTE 3090 - Game Theory Mini-Games

An interactive classroom companion web application for DOTE 3090 (Game Theory), rewritten as a modern React SPA using TypeScript, Vite, and Tailwind CSS.

## Features

- **10 Weekly Mini-Games & Strategic Scenarios**:
  - **Week 1: Prisoner's Dilemma** (Simultaneous cooperation vs. betrayal)
  - **Week 2: Launch-or-Wait** (Sequential moves, first-mover advantage & backward induction)
  - **Week 3: Simultaneous Pricing** (Competitive pricing & Nash Equilibrium)
  - **Week 4: Random Promotion-Day** (Mixed strategy & unpredictability)
  - **Week 5: The Commitment Game** (Credible threats & irreversible commitments)
  - **Week 6: Repeated Game & Triggers** (Trigger strategies & grim trigger cooperation)
  - **Week 7: Second-Price Sealed-Bid Auction** (Vickrey auction dominant bidding strategies)
  - **Week 8: Winner's Curse & Collusion** (First-price sealed bid, winner's curse, & cartels)
  - **Week 9: Split-the-Pie Negotiation** (Bargaining power, outside options & disagreement points)
  - **Week 10: Costly Signaling** (Separating vs. pooling equilibria via credible signals)
- **Step-by-Step Round Flow**:
  - Step 1: Input student alias/group members, select strategic action, and lock choices with immutable timestamps.
  - Step 2: Record opponent/group members' choices and calculate payoffs in real-time.
- **Dynamic Scoring & Rules Engine**: Automatically computes payoffs, profits, winner declarations, or triggers based on formal game-theoretic models.
- **Local Persistence**: Automatically stores student profile (Name, Student ID, Alias), round choices, lock timestamps, and weekly reflections across browser sessions using `localStorage`.
- **Submission Generator**: Formats completed rounds, timestamps, results, and weekly reflections into a clean text summary ready for one-click clipboard copying into Canvas/Blackboard.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```
