export interface GlossaryEntry {
  id: string;
  title: string;
  shortTag: string;
  definition: string;
  example?: string;
  aliases?: string[];
}

export const GLOSSARY_TERMS: Record<string, GlossaryEntry> = {
  'nash-equilibrium': {
    id: 'nash-equilibrium',
    title: 'Nash Equilibrium',
    shortTag: 'Core Solution Concept',
    definition: 'A state where no player can gain a higher payoff by unilaterally switching their strategy while all other players keep theirs unchanged. Neither player regrets their choice given what the other chose.',
    aliases: ['nash', 'nash equilibrium', 'nash equilibria', 'ne']
  },
  'spne': {
    id: 'spne',
    title: 'Subgame Perfect Nash Equilibrium (SPNE)',
    shortTag: 'Sequential Refinement',
    definition: 'A refined Nash equilibrium for sequential games where players make optimal, credible choices at every stage and node, ruling out non-credible threats or empty bluffs.',
    aliases: ['spne', 'subgame perfect equilibrium', 'subgame perfection', 'subgame perfect nash equilibrium', 'subgame perfect']
  },
  'backward-induction': {
    id: 'backward-induction',
    title: 'Backward Induction',
    shortTag: 'Sequential Solution Method',
    definition: 'A problem-solving technique that works backward from the final decision nodes to determine what rational players will do at earlier stages of the game.',
    aliases: ['backward induction', 'backward reasoning']
  },
  'dominant-strategy': {
    id: 'dominant-strategy',
    title: 'Dominant Strategy',
    shortTag: 'Strategic Dominance',
    definition: 'An action that yields a strictly higher (or weakly superior) payoff than any other alternative, regardless of what choice opponents make.',
    aliases: ['dominant strategy', 'strictly dominant', 'weakly dominant', 'dominant strategy defection', 'dominant']
  },
  'mixed-strategy': {
    id: 'mixed-strategy',
    title: 'Mixed Strategy',
    shortTag: 'Probabilistic Strategy',
    definition: 'A strategy where a player deliberately randomizes across two or more actions with specific probabilities, keeping opponents guessing to prevent being exploited.',
    aliases: ['mixed strategy', 'mixed-strategy', 'mixed strategy nash equilibrium', 'mixed-strategy ne', 'minimax randomization']
  },
  'minimax': {
    id: 'minimax',
    title: 'Minimax Theorem',
    shortTag: 'Zero-Sum Optimization',
    definition: 'A foundational principle in zero-sum games where a player chooses a strategy that minimizes their maximum possible loss (or minimizes their opponent\'s best possible payoff).',
    aliases: ['minimax', 'minimax ev', 'minimax theorem']
  },
  'ess': {
    id: 'ess',
    title: 'Evolutionarily Stable Strategy (ESS)',
    shortTag: 'Evolutionary Game Theory',
    definition: 'A strategy that, once adopted by the majority of a population, cannot be invaded or outcompeted by any rare alternative mutant strategy over time.',
    aliases: ['ess', 'evolutionary stable strategy', 'evolutionarily stable strategy', 'mixed ess', 'symmetric mixed ess']
  },
  'free-riding': {
    id: 'free-riding',
    title: 'Free-Riding',
    shortTag: 'Social Dilemma',
    definition: 'Enjoying the benefits of a collective resource or public good without contributing a fair share toward its creation or upkeep.',
    aliases: ['free-riding', 'free riding', 'free-rider', 'free rider', 'free-riders', 'free riders']
  },
  'pareto-efficiency': {
    id: 'pareto-efficiency',
    title: 'Pareto Efficiency',
    shortTag: 'Welfare Economics',
    definition: 'An outcome where no player can be made better off without making at least one other player worse off. A Pareto optimum leaves no mutually beneficial gains on the table.',
    aliases: ['pareto efficiency', 'pareto optimum', 'pareto optimal', 'pareto-dominated', 'pareto-dominates', 'pareto']
  },
  'tit-for-tat': {
    id: 'tit-for-tat',
    title: 'Tit-for-Tat',
    shortTag: 'Repeated Games',
    definition: 'A reciprocal strategy that begins by cooperating on the first round and thereafter copies whatever action the opponent played on the previous round.',
    aliases: ['tit-for-tat', 'tit for tat', 'tft']
  },
  'social-optimum': {
    id: 'social-optimum',
    title: 'Social Optimum',
    shortTag: 'Collective Welfare',
    definition: 'The outcome that maximizes the total combined payoffs or welfare of all players in the game, generating the largest overall economic pie.',
    aliases: ['social optimum', 'social maximum', 'socially optimal', 'joint maximum']
  },
  'payoff-dominance': {
    id: 'payoff-dominance',
    title: 'Payoff Dominance',
    shortTag: 'Coordination Concept',
    definition: 'A Nash equilibrium where every player earns a strictly higher payoff than in any other equilibrium in the same game (such as mutual Stag in Stag Hunt).',
    aliases: ['payoff dominance', 'payoff-dominant', 'payoff dominant']
  },
  'risk-dominance': {
    id: 'risk-dominance',
    title: 'Risk Dominance',
    shortTag: 'Coordination Concept',
    definition: 'A Nash equilibrium that carries less risk if the other player hesitates or behaves unpredictably, having the largest basin of strategic attraction (such as mutual Hare).',
    aliases: ['risk dominance', 'risk-dominant', 'risk dominant']
  },
  'bertrand-competition': {
    id: 'bertrand-competition',
    title: 'Bertrand Price Competition',
    shortTag: 'Oligopoly Theory',
    definition: 'A pricing game where competing firms set prices simultaneously. If products are identical, price undercutting cascades down to marginal cost (P = MC), wiping out all economic profit.',
    aliases: ['bertrand', 'bertrand competition', 'bertrand paradox', 'bertrand nash']
  },
  'vickrey-auction': {
    id: 'vickrey-auction',
    title: 'Vickrey Auction (Second-Price Sealed-Bid)',
    shortTag: 'Auction Theory',
    definition: 'A sealed-bid auction where the highest bidder wins the item but pays the second-highest bid. Bidding your exact private valuation (b = v) is a weakly dominant strategy.',
    aliases: ['vickrey', 'vickrey auction', 'second-price auction', 'second price auction', 'truthful bidding']
  },
  'beauty-contest': {
    id: 'beauty-contest',
    title: 'Keynesian Beauty Contest (Guess 2/3 of Avg)',
    shortTag: 'Cognitive Hierarchy',
    definition: 'A game where players guess numbers aiming to hit 2/3 of the group average. Strategic depth cascades downward (Level-0 ~50, Level-1 ~33, Level-2 ~22) to the unique Nash equilibrium of 0.',
    aliases: ['beauty contest', 'guess 2/3', '2/3 of average', 'level-k reasoning', 'iterated dominance']
  },
  'ultimatum-game': {
    id: 'ultimatum-game',
    title: 'Ultimatum Bargaining',
    shortTag: 'Bargaining & Fairness',
    definition: 'A sequential game where a proposer offers a split of a prize, and the responder can accept or veto it to zero. SPNE predicts offering minimal positive crumbs, but humans veto unfair offers under 30%.',
    aliases: ['ultimatum', 'ultimatum game', 'ultimatum bargaining']
  },
  'trust-game': {
    id: 'trust-game',
    title: 'Trust Game (Berg-Dickhaut-McCabe)',
    shortTag: 'Social Capital',
    definition: 'An investor transfers capital that triples (3x) to a trustee, who decides how much to return. Backward induction predicts zero trust, yet human reciprocity unlocks high mutual wealth.',
    aliases: ['trust game', 'investment game', 'berg-dickhaut-mccabe']
  },
  'hawk-dove': {
    id: 'hawk-dove',
    title: 'Hawk-Dove (Game of Chicken)',
    shortTag: 'Anti-Coordination',
    definition: 'A conflict game where players choose between aggression (Hawk) and conciliation (Dove). Mutual aggression causes catastrophic collision (-10), creating a mixed ESS of 23% Hawk.',
    aliases: ['hawk-dove', 'game of chicken', 'chicken game', 'hawk dove']
  },
  'battle-of-sexes': {
    id: 'battle-of-sexes',
    title: 'Battle of the Sexes',
    shortTag: 'Coordination Game',
    definition: 'A game with two pure Nash equilibria where both players want to coordinate on the same venue, but disagree on which event is best. Alternating turns achieves egalitarian efficiency.',
    aliases: ['battle of the sexes', 'battle of sexes', 'bach or stravinsky']
  },
  'public-goods': {
    id: 'public-goods',
    title: 'Public Goods Dilemma',
    shortTag: 'Collective Action',
    definition: 'A multi-player dilemma where voluntary contributions create a shared social surplus, but private incentives lead to dominant-strategy free-riding and under-provision.',
    aliases: ['public goods', 'public goods dilemma', 'voluntary contribution mechanism']
  }
};

/**
 * Finds a glossary entry by key or any known alias (case-insensitive).
 */
export function getGlossaryEntry(query: string): GlossaryEntry | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();

  // Direct lookup
  if (GLOSSARY_TERMS[clean]) {
    return GLOSSARY_TERMS[clean];
  }

  // Lookup by aliases or title
  for (const entry of Object.values(GLOSSARY_TERMS)) {
    if (entry.id.toLowerCase() === clean) return entry;
    if (entry.title.toLowerCase() === clean) return entry;
    if (entry.aliases && entry.aliases.some(a => a.toLowerCase() === clean)) {
      return entry;
    }
  }

  // Substring match fallback for phrases like "SPNE Dominant Strategy"
  for (const entry of Object.values(GLOSSARY_TERMS)) {
    if (clean.includes(entry.title.toLowerCase())) return entry;
    if (entry.aliases && entry.aliases.some(a => clean.includes(a.toLowerCase()))) {
      return entry;
    }
  }

  return undefined;
}

/**
 * Formats a count with the correct singular or plural noun.
 * Ensures '1 round' / 'N rounds', '1 chain' / 'N chains', '1 match' / 'N matches', etc.
 */
export function formatUnit(count: number, singular: string, plural?: string): string {
  const noun = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${noun}`;
}

export function pluralWord(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}
