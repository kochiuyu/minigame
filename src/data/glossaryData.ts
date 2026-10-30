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
