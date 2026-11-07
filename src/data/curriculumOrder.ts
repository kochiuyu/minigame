export interface CurriculumEntry {
  curriculumNumber: number; // 1 to 28
  internalId: number;       // maps to GameConfig.id
  title: string;
  shortTitle: string;
  icon: string;
  tierNumber: number;       // 1 to 8
  tierTitle: string;
}

export const CURRICULUM_ENTRIES: CurriculumEntry[] = [
  // TIER 1: Foundations & Dominance
  {
    curriculumNumber: 1,
    internalId: 1,
    title: "One-Shot Prisoner's Dilemma",
    shortTitle: "Prisoner's Dilemma",
    icon: "🤝",
    tierNumber: 1,
    tierTitle: "Tier 1: Foundations & Dominance"
  },
  {
    curriculumNumber: 2,
    internalId: 3,
    title: "Simultaneous Price Competition",
    shortTitle: "Price Competition",
    icon: "⚡",
    tierNumber: 1,
    tierTitle: "Tier 1: Foundations & Dominance"
  },

  // TIER 2: Coordination & Conflict
  {
    curriculumNumber: 3,
    internalId: 13,
    title: "Stag Hunt Coordination",
    shortTitle: "Stag Hunt",
    icon: "🦌",
    tierNumber: 2,
    tierTitle: "Tier 2: Coordination & Conflict"
  },
  {
    curriculumNumber: 4,
    internalId: 18,
    title: "Battle of the Sexes",
    shortTitle: "Battle of the Sexes",
    icon: "🎭",
    tierNumber: 2,
    tierTitle: "Tier 2: Coordination & Conflict"
  },
  {
    curriculumNumber: 5,
    internalId: 15,
    title: "Hawk-Dove Brinkmanship",
    shortTitle: "Hawk-Dove",
    icon: "🦅",
    tierNumber: 2,
    tierTitle: "Tier 2: Coordination & Conflict"
  },

  // TIER 3: Zero-Sum & Mixed Strategies
  {
    curriculumNumber: 6,
    internalId: 17,
    title: "Matching Pennies (Zero-Sum)",
    shortTitle: "Matching Pennies",
    icon: "🪙",
    tierNumber: 3,
    tierTitle: "Tier 3: Zero-Sum & Mixed Strategies"
  },
  {
    curriculumNumber: 7,
    internalId: 4,
    title: "Promotion Timing (3x3 Mixed)",
    shortTitle: "Promotion Timing",
    icon: "📅",
    tierNumber: 3,
    tierTitle: "Tier 3: Zero-Sum & Mixed Strategies"
  },
  {
    curriculumNumber: 8,
    internalId: 23,
    title: "Colonel Blotto Resource War",
    shortTitle: "Colonel Blotto",
    icon: "⚔️",
    tierNumber: 3,
    tierTitle: "Tier 3: Zero-Sum & Mixed Strategies"
  },

  // TIER 4: Extensive Form & Backward Induction
  {
    curriculumNumber: 9,
    internalId: 2,
    title: "Launch-or-Wait (Sequential Entry)",
    shortTitle: "Sequential Entry",
    icon: "🚀",
    tierNumber: 4,
    tierTitle: "Tier 4: Extensive Form & Backward Induction"
  },
  {
    curriculumNumber: 10,
    internalId: 5,
    title: "Entry Deterrence & Commitment",
    shortTitle: "Entry Deterrence",
    icon: "🏰",
    tierNumber: 4,
    tierTitle: "Tier 4: Extensive Form & Backward Induction"
  },
  {
    curriculumNumber: 11,
    internalId: 20,
    title: "Centipede Game (Backward Induction)",
    shortTitle: "Centipede Game",
    icon: "🐛",
    tierNumber: 4,
    tierTitle: "Tier 4: Extensive Form & Backward Induction"
  },

  // TIER 5: Repeated Games & Reciprocity
  {
    curriculumNumber: 12,
    internalId: 6,
    title: "Repeated Prisoner's Dilemma",
    shortTitle: "Repeated Dilemma",
    icon: "🔁",
    tierNumber: 5,
    tierTitle: "Tier 5: Repeated Games & Reciprocity"
  },
  {
    curriculumNumber: 13,
    internalId: 19,
    title: "The Trust Game (Investment)",
    shortTitle: "The Trust Game",
    icon: "🏦",
    tierNumber: 5,
    tierTitle: "Tier 5: Repeated Games & Reciprocity"
  },
  {
    curriculumNumber: 14,
    internalId: 12,
    title: "Tragedy of the Commons & Coastal Fishery",
    shortTitle: "Commons & Fishery",
    icon: "🐟",
    tierNumber: 5,
    tierTitle: "Tier 5: Repeated Games & Reciprocity"
  },
  {
    curriculumNumber: 15,
    internalId: 27,
    title: "Renewable Ocean Fishery (Ostrom Commons)",
    shortTitle: "Renewable Fishery",
    icon: "🌊",
    tierNumber: 5,
    tierTitle: "Tier 5: Repeated Games & Reciprocity"
  },

  // TIER 6: Bargaining & Behavioral Fairness
  {
    curriculumNumber: 16,
    internalId: 16,
    title: "Ultimatum Bargaining & Fairness",
    shortTitle: "Ultimatum Bargaining",
    icon: "🍰",
    tierNumber: 6,
    tierTitle: "Tier 6: Bargaining & Behavioral Fairness"
  },
  {
    curriculumNumber: 17,
    internalId: 9,
    title: "Split-the-Pie (Outside Options)",
    shortTitle: "Split the Pie",
    icon: "🥧",
    tierNumber: 6,
    tierTitle: "Tier 6: Bargaining & Behavioral Fairness"
  },
  {
    curriculumNumber: 18,
    internalId: 26,
    title: "Traveler's Dilemma (Basu Paradox)",
    shortTitle: "Traveler's Dilemma",
    icon: "🧳",
    tierNumber: 6,
    tierTitle: "Tier 6: Bargaining & Behavioral Fairness"
  },

  // TIER 7: Industrial Organization & Markets
  {
    curriculumNumber: 19,
    internalId: 14,
    title: "Bertrand Duopoly Competition",
    shortTitle: "Bertrand Duopoly",
    icon: "🏷️",
    tierNumber: 7,
    tierTitle: "Tier 7: Industrial Organization & Markets"
  },
  {
    curriculumNumber: 20,
    internalId: 21,
    title: "Cournot Duopoly Competition",
    shortTitle: "Cournot Duopoly",
    icon: "🏭",
    tierNumber: 7,
    tierTitle: "Tier 7: Industrial Organization & Markets"
  },
  {
    curriculumNumber: 21,
    internalId: 22,
    title: "Hotelling's Spatial Competition",
    shortTitle: "Hotelling Beach",
    icon: "🏖️",
    tierNumber: 7,
    tierTitle: "Tier 7: Industrial Organization & Markets"
  },

  // TIER 8: Information Economics, Cognitive Levels & Auctions
  {
    curriculumNumber: 22,
    internalId: 11,
    title: "Keynesian Beauty Contest (2/3 of Average)",
    shortTitle: "Beauty Contest",
    icon: "💭",
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions"
  },
  {
    curriculumNumber: 23,
    internalId: 10,
    title: "Costly Signaling & Adverse Selection",
    shortTitle: "Costly Signaling",
    icon: "📜",
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions"
  },
  {
    curriculumNumber: 24,
    internalId: 7,
    title: "Second-Price Vickrey Auction",
    shortTitle: "Vickrey Auction",
    icon: "⚖️",
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions"
  },
  {
    curriculumNumber: 25,
    internalId: 8,
    title: "First-Price Sealed-Bid Auction",
    shortTitle: "First-Price Auction",
    icon: "🎯",
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions"
  },
  {
    curriculumNumber: 26,
    internalId: 24,
    title: "Common-Value Oil Lease Auction",
    shortTitle: "Common-Value Auction",
    icon: "🛢️",
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions"
  },
  {
    curriculumNumber: 27,
    internalId: 25,
    title: "The Escalating Dollar Auction",
    shortTitle: "Dollar Auction",
    icon: "💸",
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions"
  },
  {
    curriculumNumber: 28,
    internalId: 28,
    title: "Market for Lemons (Akerlof Adverse Selection)",
    shortTitle: "Lemons Market",
    icon: "🍋",
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions"
  }
];

// Quick lookup helper: internal ID -> curriculum number (1 to 28)
export const getCurriculumNumber = (internalId: number): number => {
  const match = CURRICULUM_ENTRIES.find(e => e.internalId === internalId);
  return match ? match.curriculumNumber : internalId;
};

// Quick lookup helper: curriculum number (1 to 28) -> internal ID
export const getInternalId = (curriculumNumber: number): number => {
  const match = CURRICULUM_ENTRIES.find(e => e.curriculumNumber === curriculumNumber);
  return match ? match.internalId : curriculumNumber;
};

// Grouped by tier for rendering dropdowns and navigations
export const CURRICULUM_TIERS = Array.from(
  new Set(CURRICULUM_ENTRIES.map(e => e.tierTitle))
).map(tierTitle => ({
  tierTitle,
  entries: CURRICULUM_ENTRIES.filter(e => e.tierTitle === tierTitle)
}));

/**
 * Single plain-language takeaway sentence (strictly 25 words or fewer) for each game.
 * Uses plain vocabulary, zero unexplained jargon, or terms matched with GlossaryTerm.
 */
export const getGameTakeawaySentence = (internalId: number): string => {
  switch (internalId) {
    case 1:
      return "Tempting individual betrayals leave both sides worse off than if you had trusted each other and cooperated.";
    case 2:
      return "Moving first lets you commit to a bold move, forcing your rival to back off and yield the market.";
    case 3:
      return "Relentlessly cutting prices to steal customers triggers a price war where both sellers wipe out their own profits.";
    case 4:
      return "When rival promotions clash, staying unpredictable is the only way to prevent your competitor from outmaneuvering you.";
    case 5:
      return "Investing early in visible capacity makes your threat to fight credible, keeping rivals from entering your market.";
    case 6:
      return "Repeated interactions build cooperation because the fear of future retaliation keeps both players honest over time.";
    case 7:
      return "In a second-price auction, bidding your true value wins whenever profitable without ever overpaying.";
    case 8:
      return "Bidding below your true value balances your chance of winning with the profit you pocket upon victory.";
    case 9:
      return "Demanding too much collapses the deal, making fair splits around 50/50 the most resilient agreement.";
    case 10:
      return "A signal only proves your quality if it is too costly for lower-quality rivals to copy.";
    case 11:
      return "Winning requires thinking just one step ahead of the crowd rather than jumping to pure mathematical theory.";
    case 12:
      return "Without rules or enforcement against freeloading, voluntary contributions erode as players withhold their own funds.";
    case 13:
      return "Targeting the big prize requires mutual trust, because playing safe guarantees a modest reward with zero risk.";
    case 14:
      return "Undercutting rivals by a single dollar forces a spiral where neither seller makes any profit.";
    case 15:
      return "When neither side yields, catastrophic collision costs far more than whatever prize you were fighting over.";
    case 16:
      return "Real partners reject insultingly low offers, proving that fairness matters as much as raw monetary payoff.";
    case 17:
      return "In zero-sum clashes, staying unpredictable is essential so opponents cannot anticipate and exploit your habit.";
    case 18:
      return "Coordinating on a shared activity beats miscoordinating with zero, even when you prefer different venues.";
    case 19:
      return "Sending money creates value, but successful partnerships depend on the trustee returning a fair share.";
    case 20:
      return "Passing grows the shared pot to its maximum, but requires mutual patience so neither player defects early.";
    case 21:
      return "Setting output preserves profit margins, but the temptation to overproduce makes cooperation difficult to sustain.";
    case 22:
      return "Rival sellers cluster in the center to protect their flank from being captured by competitors.";
    case 23:
      return "Spreading troops evenly invites defeat against rivals who sacrifice one front to concentrate on two.";
    case 24:
      return "Bidding cautiously protects you from the Winner's Curse of overpaying based on an overly optimistic estimate.";
    case 25:
      return "The only winning move in an escalating sunk-cost bidding trap is refusing to place the first bid.";
    case 26:
      return "Claiming near the maximum payout rewards both travelers far more than the theoretical race to the bottom.";
    case 27:
      return "Without harvest limits, individual incentives deplete the shared fish stock until the entire fishery collapses.";
    case 28:
      return "Low offer prices drive high-quality sellers away, leaving only defective lemons in the market.";
    default:
      return "Understanding your opponent's incentives reveals the most profitable and resilient strategic response.";
  }
};
