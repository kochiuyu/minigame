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
