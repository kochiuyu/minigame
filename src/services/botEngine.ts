// Educational Game-Specific Bot Roster & Behavioral Engine for Game Theory

export type BotArchetype = 'RANDOM' | 'GREEDY' | 'RECIPROCAL' | 'NASH';

export interface RoundHistoryEntry {
  round: number;
  playerAction: any;
  botAction: any;
  playerPayoff: number;
  botPayoff: number;
  playerValuation?: number;
  botValuation?: number;
}

export interface BotDecisionContext {
  round: number;
  totalRounds: number;
  history: RoundHistoryEntry[];
  botValuation?: number;
  studentValuation?: number;
  currentNode?: number;
}

export interface BotDecision {
  action: any;
  rationale: string;
}

export interface GameBotTraitGauge {
  label: string;
  value: number; // 0 to 100%
  color: string;
}

export interface GameSpecificBot {
  id: string;
  gameId: number;
  name: string;
  avatar: string;
  title: string;
  tagline: string;
  backstory: string;
  strategySummary?: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  gauges: GameBotTraitGauge[];
  decide: (context: BotDecisionContext) => BotDecision;
  getAnticipationThought: (round: number, history: RoundHistoryEntry[]) => string;
}

export function getBotStrategySummary(bot: GameSpecificBot): string {
  if (bot.strategySummary && bot.strategySummary.trim().length > 0) {
    return bot.strategySummary;
  }
  return bot.tagline || bot.backstory || "Plays with an adaptive strategic profile.";
}


// -------------------------------------------------------------
// 0. ONE-SHOT PRISONER'S DILEMMA BOTS (Game 1)
// -------------------------------------------------------------
export const ONE_SHOT_PD_BOTS: GameSpecificBot[] = [
  {
    id: 'apex_dominant',
    gameId: 1,
    name: 'Apex (Strict Defector)',
    avatar: '🐺',
    title: 'Dominant Strategy Optimizer',
    tagline: 'Always defects. Pursues dominant one-shot payoffs ($3 or $1).',
    strategySummary: 'Defects unconditionally because Defect strictly dominates Cooperate (3 > 2 and 1 > 0).',
    backstory: 'Apex understands that in a one-shot game without future retaliation, defecting is strictly dominant. No matter what you choose, defecting yields a strictly higher payoff.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Dominant Strategy Adherence', value: 100, color: 'bg-rose-500' },
      { label: 'Cooperation Propensity', value: 0, color: 'bg-slate-600' },
      { label: 'Risk Aversion', value: 95, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () =>
      "In a one-shot game with no future rounds, Defect strictly dominates Cooperate. I will defect.",
    decide: () => ({
      action: 'Defect',
      rationale: 'Strict Dominance: Defecting gives 3 > 2 if you cooperate, and 1 > 0 if you defect.'
    })
  },
  {
    id: 'anatol_optimist',
    gameId: 1,
    name: 'Anatol (Hopeful Cooperator)',
    avatar: '🤝',
    title: 'Social Optimum Seeker',
    tagline: 'Cooperates hoping to achieve the mutual Pareto maximum (+2 each).',
    strategySummary: 'Plays Cooperate to aim for the collective best outcome (+2 each), risking exploitation.',
    backstory: 'Anatol values collective efficiency over selfish advantage. In this one-shot interaction, Anatol chooses Cooperate hoping you will do the same to achieve (+2, +2).',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Initial Goodwill', value: 100, color: 'bg-emerald-500' },
      { label: 'Social Welfare Weight', value: 95, color: 'bg-blue-500' },
      { label: 'Fear of Exploitation', value: 10, color: 'bg-amber-500' }
    ],
    getAnticipationThought: () =>
      "If we both cooperate, we both earn +2 pts. I will play Cooperate in hopes of mutual benefit.",
    decide: () => ({
      action: 'Cooperate',
      rationale: 'Social Optimum: Aiming for mutual cooperation (+2, +2) despite the risk of betrayal.'
    })
  },
  {
    id: 'clara_random',
    gameId: 1,
    name: 'Clara (Unpredictable)',
    avatar: '🎲',
    title: '50/50 Randomizer',
    tagline: 'Flips an unbiased coin between Cooperate and Defect.',
    strategySummary: 'Randomizes with 50% Cooperate and 50% Defect.',
    backstory: 'Clara treats the decision as uncertain and randomizes equally between cooperation and defection.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Randomness', value: 100, color: 'bg-amber-500' },
      { label: 'Predictability', value: 0, color: 'bg-slate-600' },
      { label: 'Rationality', value: 50, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () =>
      "Flipping a coin: 50% chance of Cooperate, 50% chance of Defect.",
    decide: () => {
      const act = Math.random() < 0.5 ? 'Cooperate' : 'Defect';
      return {
        action: act,
        rationale: `Randomized choice: Clara flipped a coin and picked ${act}.`
      };
    }
  }
];

// -------------------------------------------------------------
// 1. REPEATED PRISONER'S DILEMMA BOTS (Game 6)
// -------------------------------------------------------------
export const PD_BOTS: GameSpecificBot[] = [
  {
    id: 'anatol_tft',
    gameId: 6,
    name: 'Anatol (Tit-for-Tat)',
    avatar: '🔁',
    title: 'Reciprocal Goodwill Champion',
    tagline: 'Starts cooperative, rewards trust, and retaliates with forgiveness.',
    strategySummary: 'Starts with Cooperate, then mirrors your previous move (rewards trust with +2, retaliates against defection).',
    backstory: 'Named after Anatol Rapoport, winner of Robert Axelrod\'s famous computer tournaments. Anatol believes cooperation is sustainable only when paired with immediate, credible retaliation against betrayal.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Initial Goodwill', value: 100, color: 'bg-emerald-500' },
      { label: 'Forgiveness Speed', value: 90, color: 'bg-blue-500' },
      { label: 'Retaliation Provocability', value: 95, color: 'bg-amber-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I will open with unconditional cooperation. If you meet trust with trust, we will both maximize cumulative payoffs.";
      }
      const last = history[history.length - 1].playerAction;
      return last === 'Cooperate'
        ? "You cooperated in the prior round! I mirror your goodwill with cooperation."
        : "You defected in the prior round. My rule strictly retaliates with defection to prevent exploitation.";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return {
          action: 'Cooperate',
          rationale: 'Tit-for-Tat opening: Starts with goodwill to establish reciprocal trust.'
        };
      }
      const lastPlayerMove = history[history.length - 1].playerAction;
      const act = lastPlayerMove === 'Cooperate' ? 'Cooperate' : 'Defect';
      return {
        action: act,
        rationale: act === 'Cooperate'
          ? 'Reciprocity: Honoring your previous round cooperation with mutual cooperation.'
          : 'Retaliation: Punishing your previous round defection with defection.'
      };
    }
  },
  {
    id: 'grim_machiavelli',
    gameId: 6,
    name: 'Machiavelli (Grim Trigger)',
    avatar: '⚡',
    title: 'Unforgiving Enforcer',
    tagline: 'Cooperates until the first betrayal, then defects forever.',
    strategySummary: 'Cooperates until the first betrayal, then permanently defects for all remaining rounds without forgiveness.',
    backstory: 'Machiavelli believes trust is fragile and irreplaceable. He begins with full cooperation, but a single breach of faith triggers permanent, irreversible defection for all remaining rounds.',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/40',
    badgeBorder: 'border-purple-700/60',
    gauges: [
      { label: 'Initial Goodwill', value: 90, color: 'bg-emerald-500' },
      { label: 'Forgiveness Speed', value: 0, color: 'bg-slate-600' },
      { label: 'Punishment Severity', value: 100, color: 'bg-purple-500' }
    ],
    getAnticipationThought: (_round, history) => {
      const everDefected = history.some(h => h.playerAction === 'Defect');
      return everDefected
        ? "The Grim Trigger has been tripped. You broke trust earlier; I will defect for every remaining round."
        : "Trust remains intact. As long as you never defect, we both prosper at (2, 2).";
    },
    decide: ({ history }) => {
      const everDefected = history.some(h => h.playerAction === 'Defect');
      if (everDefected) {
        return {
          action: 'Defect',
          rationale: 'Grim Trigger Active: A past defection permanently destroyed trust. Defecting for all future rounds.'
        };
      }
      return {
        action: 'Cooperate',
        rationale: 'Grim Trigger Cooperating: No defection observed yet; maintaining mutual trust.'
      };
    }
  },
  {
    id: 'apex_predator',
    gameId: 6,
    name: 'Apex (Always Defect)',
    avatar: '🐺',
    title: 'Ruthless Myopic Optimizer',
    tagline: 'Always defects. Explores dominant one-shot payoffs.',
    strategySummary: 'Always defects in every round to exploit one-shot dominant strategy payoffs ($3 or $1).',
    backstory: 'Apex ignores reputation and the shadow of the future. Operating on pure one-shot dominant strategy logic ($3 > $2 and $1 > $0), Apex defects in every round without remorse.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Cooperation Propensity', value: 0, color: 'bg-slate-600' },
      { label: 'Myopic Greed', value: 100, color: 'bg-rose-500' },
      { label: 'Dominant Strategy Adherence', value: 100, color: 'bg-blue-500' }
    ],
    getAnticipationThought: (_round, _history) =>
      "Regardless of your move, Defect strictly dominates Cooperate. I will defect and capture maximum surplus.",
    decide: () => ({
      action: 'Defect',
      rationale: 'Strict Dominance: Defect yields strictly higher payoff regardless of player choice.'
    })
  },
  {
    id: 'pax_pavlov',
    gameId: 6,
    name: 'Pax (Pavlov Win-Stay)',
    avatar: '🧠',
    title: 'Win-Stay, Lose-Shift Heuristic',
    tagline: 'Repeats what works; changes what fails.',
    strategySummary: 'Win-Stay, Lose-Shift: repeats move if earned >= $2 last round; switches moves if earned < $2.',
    backstory: 'Pax operates on the psychological principle of reinforcement learning. If the prior round resulted in a high payoff (+2 or +3), Pax repeats its previous move; if the payoff was low (0 or +1), Pax switches.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Adaptability', value: 85, color: 'bg-blue-500' },
      { label: 'Error Correction', value: 75, color: 'bg-emerald-500' },
      { label: 'Exploitation Resistance', value: 80, color: 'bg-purple-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I open with cooperation. If it works, I stay; if it fails, I shift.";
      }
      const last = history[history.length - 1];
      return last.botPayoff >= 2
        ? "Last round was successful (earned " + last.botPayoff + " pts). Win-Stay: repeating last move."
        : "Last round was disappointing (earned " + last.botPayoff + " pts). Lose-Shift: switching move.";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 'Cooperate', rationale: 'Pavlov initial move: Starts with Cooperate.' };
      }
      const last = history[history.length - 1];
      const botWon = last.botPayoff >= 2;
      const nextAction = botWon
        ? last.botAction
        : last.botAction === 'Cooperate' ? 'Defect' : 'Cooperate';
      return {
        action: nextAction,
        rationale: botWon
          ? `Win-Stay: Earned +${last.botPayoff} pts last round, so repeating ${last.botAction}.`
          : `Lose-Shift: Earned only +${last.botPayoff} pts last round, so switching from ${last.botAction} to ${nextAction}.`
      };
    }
  },
  {
    id: 'generous_tft',
    gameId: 6,
    name: 'Nowak (Generous Tit-for-Tat)',
    avatar: '🕊️',
    title: 'Noise-Tolerant Cooperator',
    tagline: 'Forgives 30% of defections to break endless retaliation death spirals.',
    strategySummary: 'Plays Tit-for-Tat but randomly forgives 30% of your defections to prevent endless retaliation loops.',
    backstory: 'Formulated by Martin Nowak and Karl Sigmund. In real-world environments with noise and miscommunication, standard Tit-for-Tat gets trapped in perpetual retaliation. Generous TFT breaks this trap by forgiving 1 in 3 defections.',
    color: 'text-teal-400',
    badgeBg: 'bg-teal-950/40',
    badgeBorder: 'border-teal-700/60',
    gauges: [
      { label: 'Forgiveness Probability', value: 30, color: 'bg-teal-500' },
      { label: 'Spiral Resistance', value: 90, color: 'bg-emerald-500' },
      { label: 'Retaliation Strength', value: 70, color: 'bg-amber-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I open with cooperation. If you defect, I have a 30% chance of stochastic forgiveness to avoid infinite feuds.";
      }
      const lastPlayerMove = history[history.length - 1].playerAction;
      return lastPlayerMove === 'Cooperate'
        ? "You cooperated! I mirror your trust with cooperation."
        : "You defected. I will retaliate unless my 30% forgiveness rule triggers to test reconciliation.";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 'Cooperate', rationale: 'Generous Opening: Cooperates unconditionally on round 1.' };
      }
      const lastPlayerMove = history[history.length - 1].playerAction;
      if (lastPlayerMove === 'Cooperate') {
        return { action: 'Cooperate', rationale: 'Reciprocal Goodwill: Rewarding your previous cooperation.' };
      }
      const forgive = Math.random() < 0.3;
      return forgive
        ? { action: 'Cooperate', rationale: 'Generous Forgiveness: Forgave your defection (30% stochastic rule) to test peace.' }
        : { action: 'Defect', rationale: 'Retaliation: Punishing past defection with defection.' };
    }
  },
  {
    id: 'joss_sneaky',
    gameId: 6,
    name: 'Joss (Sneaky Defector)',
    avatar: '🗡️',
    title: 'Opportunistic Border Tester',
    tagline: 'Plays Tit-for-Tat but randomly sneaks in defections (15%).',
    strategySummary: 'Plays Tit-for-Tat but stochastically probes with a surprise defection (15% probability) during peace.',
    backstory: 'Submitted by Johann Joss in Robert Axelrod\'s tournament. Joss masquerades as Tit-for-Tat but occasionally stabs its partner in the back (15% probability) during peace to extract the $3 temptation payoff.',
    color: 'text-violet-400',
    badgeBg: 'bg-violet-950/40',
    badgeBorder: 'border-violet-700/60',
    gauges: [
      { label: 'Opportunistic Greed', value: 85, color: 'bg-violet-500' },
      { label: 'Masked Reciprocity', value: 80, color: 'bg-blue-500' },
      { label: 'Provocation Rate', value: 20, color: 'bg-rose-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I look like a cooperator, but stay on guard: I test boundaries with surprise defections.";
      }
      const lastPlayerMove = history[history.length - 1].playerAction;
      return lastPlayerMove === 'Defect'
        ? "You defected last round, so I will retaliate with defection."
        : "You cooperated. Will I reciprocate, or sneak in an opportunistic ambush?";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 'Cooperate', rationale: 'Camouflage: Starts with Cooperate to establish deceptive trust.' };
      }
      const lastPlayerMove = history[history.length - 1].playerAction;
      if (lastPlayerMove === 'Defect') {
        return { action: 'Defect', rationale: 'Defensive Retaliation: Mirroring your previous round defection.' };
      }
      const sneakDefect = Math.random() < 0.15;
      return sneakDefect
        ? { action: 'Defect', rationale: 'Sneak Attack: Injected opportunistic defection (15% Joss probe) to steal $3.' }
        : { action: 'Cooperate', rationale: 'Mimic Reciprocity: Maintained cooperative facade with Cooperate.' };
    }
  }
];

// -------------------------------------------------------------
// 2. STAG HUNT COORDINATION BOTS (Game 13)
// -------------------------------------------------------------
export const STAG_BOTS: GameSpecificBot[] = [
  {
    id: 'rousseau_assurance',
    gameId: 13,
    name: 'Jean-Jacques (Assurance Partner)',
    avatar: '🦌',
    title: 'Payoff-Dominance Idealist',
    tagline: 'Prioritizes mutual Stag (+10); needs trust confirmation.',
    strategySummary: 'Hunts Stag (+10) on round 1; continues hunting Stag if you hunt Stag, but falls back to Hare if you abandon the hunt.',
    backstory: 'Inspired by Jean-Jacques Rousseau\'s classic parable. He dreams of hunting the majestic Stag (+10 points) but knows that without your commitment, he will starve while you bag a Hare.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Payoff Ambition', value: 100, color: 'bg-emerald-500' },
      { label: 'Trust Threshold', value: 40, color: 'bg-blue-500' },
      { label: 'Risk Tolerance', value: 70, color: 'bg-amber-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "Let us coordinate on the Stag! If we both commit, we reap +10 points each. I extend my trust.";
      }
      const last = history[history.length - 1].playerAction;
      return last === 'Stag'
        ? "You proved trustworthy! We both secured the +10 Stag. Let's hunt Stag again."
        : "You abandoned the hunt for a safe Hare! I risk earning 0 if I hunt Stag alone. Prove your assurance!";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return {
          action: 'Stag',
          rationale: 'Payoff Dominance: Opening with Stag to achieve the +10 Pareto optimum.'
        };
      }
      const lastPlayerAction = history[history.length - 1].playerAction;
      const act = lastPlayerAction === 'Stag' ? 'Stag' : 'Hare';
      return {
        action: act,
        rationale: act === 'Stag'
          ? 'Mutual Coordination: You hunted Stag last round, confirming trust for +10.'
          : 'Defensive Fallback: You took Hare last round; hunting Hare to avoid starvation (0 pts).'
      };
    }
  },
  {
    id: 'cynic_hare',
    gameId: 13,
    name: 'Cynic (Risk-Averse Hare)',
    avatar: '🐇',
    title: 'Risk-Dominance Purist',
    tagline: 'Always takes the safe +4 Hare. Refuses to risk 0.',
    strategySummary: 'Always hunts Hare to secure guaranteed +4 points without relying on your cooperation.',
    backstory: 'Cynic calculates that hunting Stag carries an unacceptable downside: if you falter, he gets 0 points. Hunting Hare guarantees +4 points with zero dependence on your goodwill.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Risk Aversion', value: 100, color: 'bg-amber-500' },
      { label: 'Trust Propensity', value: 0, color: 'bg-slate-600' },
      { label: 'Independence', value: 100, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () =>
      "A guaranteed +4 Hare in hand is worth ten Stags in the bush. I refuse to expose myself to your betrayal.",
    decide: () => ({
      action: 'Hare',
      rationale: 'Risk Dominance: Hare guarantees +4 pts without strategic exposure.'
    })
  },
  {
    id: 'bayesian_analyst',
    gameId: 13,
    name: 'Bayes (Threshold Analyst)',
    avatar: '📊',
    title: 'Basin of Attraction Calculator',
    tagline: 'Plays Stag only when your historical trust exceeds 40%.',
    strategySummary: 'Calculates your historical Stag frequency: hunts Stag if your trust is >= 40%, otherwise retreats to safe Hare.',
    backstory: 'Bayes computes expected utility mathematically. Expected payoff of Stag = 10 * p. Expected payoff of Hare = 4. Therefore, Stag is rational only if the subjective probability p >= 4/10 = 0.4.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Mathematical Rationality', value: 95, color: 'bg-blue-500' },
      { label: 'Empirical Memory', value: 90, color: 'bg-purple-500' },
      { label: 'Coordination Flexibility', value: 65, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1) return "Evaluating prior: I'll test your trust with an initial Stag probe.";
      const stagCount = history.filter(h => h.playerAction === 'Stag').length;
      const prob = Math.round((stagCount / history.length) * 100);
      return `Observed P(Stag) = ${prob}%. The coordination threshold is 40%.`;
    },
    decide: ({ round, history }) => {
      if (round === 1) {
        return { action: 'Stag', rationale: 'Bayesian probe: Opening with Stag to test player type.' };
      }
      const stagRatio = history.filter(h => h.playerAction === 'Stag').length / history.length;
      const act = stagRatio >= 0.4 ? 'Stag' : 'Hare';
      return {
        action: act,
        rationale: act === 'Stag'
          ? `Expected Value: Observed trust (${Math.round(stagRatio * 100)}%) >= 40% threshold. E[Stag] > E[Hare].`
          : `Risk Defense: Observed trust (${Math.round(stagRatio * 100)}%) < 40% threshold. E[Hare] > E[Stag].`
      };
    }
  },
  {
    id: 'cautious_optimist',
    gameId: 13,
    name: 'Hope (Cautious Optimist)',
    avatar: '🌱',
    title: 'Stag-First Re-engagement Partner',
    tagline: 'Stag on round 1; hedges with Hare on defect, but instantly forgives.',
    strategySummary: 'Opens with Stag (+10); hedges with safe Hare if you defect, but immediately rejoins Stag the moment you return.',
    backstory: 'Hope never gives up on the social contract. If you hunt Hare, she prudently protects herself with Hare next round, but if you step back up to Stag, she immediately meets you there with renewed optimism.',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/40',
    badgeBorder: 'border-cyan-700/60',
    gauges: [
      { label: 'Trust Elasticity', value: 85, color: 'bg-cyan-500' },
      { label: 'Risk Tolerance', value: 60, color: 'bg-amber-500' },
      { label: 'Coordination Ambition', value: 95, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I start on the highest branch: Stag! If you retreat, I will match Hare, but I am ready to return the moment you do.";
      }
      const lastPlayerAction = history[history.length - 1].playerAction;
      return lastPlayerAction === 'Stag'
        ? "We achieved the +10 Stag! Let us keep the momentum alive."
        : "You retreated to safe Hare. I will take safe Hare now, but if you return to Stag, I will follow!";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 'Stag', rationale: 'Optimistic Opening: Initiates with Stag to unlock maximum joint payoff.' };
      }
      const lastPlayerAction = history[history.length - 1].playerAction;
      return lastPlayerAction === 'Stag'
        ? { action: 'Stag', rationale: 'Re-engagement: You proved willing to hunt Stag, so staying on the +10 path.' }
        : { action: 'Hare', rationale: 'Prudent Hedge: Player hunted Hare last round; matching Hare (+4) to avoid 0.' };
    }
  },
  {
    id: 'tf2t_hunter',
    gameId: 13,
    name: 'Patience (Tit-for-Two-Tats)',
    avatar: '🛡️',
    title: 'Forgiving Stag Hunter',
    tagline: 'Tolerates 1 solo betrayal; only retreats to Hare after 2 in a row.',
    strategySummary: 'Tolerates a single Hare betrayal; only retreats to Hare if you abandon the Stag hunt twice consecutively.',
    backstory: 'Patience knows that coordination failures in the wild are often accidental misunderstandings. She requires two consecutive Hare departures before giving up on the Stag hunt.',
    color: 'text-teal-400',
    badgeBg: 'bg-teal-950/40',
    badgeBorder: 'border-teal-700/60',
    gauges: [
      { label: 'Tolerance Threshold', value: 90, color: 'bg-teal-500' },
      { label: 'Social Patience', value: 95, color: 'bg-blue-500' },
      { label: 'Loss Aversion', value: 25, color: 'bg-slate-600' }
    ],
    getAnticipationThought: (round, history) => {
      if (round <= 2 || history.length < 2) {
        return "I hunt Stag and tolerate single mistakes. I will only retreat to Hare if you abandon Stag twice in a row.";
      }
      const lastTwo = history.slice(-2);
      const bothHare = lastTwo.every(h => h.playerAction === 'Hare');
      return bothHare
        ? "Two consecutive Hare choices detected. My patience has run out; falling back to Hare."
        : "Commitment remains viable. I forgive single deviations and continue hunting Stag.";
    },
    decide: ({ round, history }) => {
      if (round <= 2 || history.length < 2) {
        return { action: 'Stag', rationale: 'High Tolerance Opening: Commits to Stag (+10) during early rounds.' };
      }
      const lastTwo = history.slice(-2);
      const bothHare = lastTwo.every(h => h.playerAction === 'Hare');
      return bothHare
        ? { action: 'Hare', rationale: 'Threshold Reached: Two consecutive Hare choices observed; retreating to safe Hare.' }
        : { action: 'Stag', rationale: 'Forgiving Stance: Did not see two consecutive defections; sustaining Stag.' };
    }
  }
];

// -------------------------------------------------------------
// 3. BERTRAND DUOPOLY PRICE COMPETITION BOTS (Game 14)
// -------------------------------------------------------------
export const BERTRAND_BOTS: GameSpecificBot[] = [
  {
    id: 'cartel_colluder',
    gameId: 14,
    name: 'Baron (Monopoly Colluder)',
    avatar: '🤝',
    title: 'Tacit Collusion Advocate',
    tagline: 'Sets monopoly price ($40); punishes price wars.',
    strategySummary: 'Maintains monopoly price ($40) to maximize collective profits; matches undercuts to enforce cartel discipline.',
    backstory: 'Baron knows that price competition is an economic suicide pact. At the monopoly price of $40, total market profit is maximized ($1,800). If you undercut him, he retaliates swiftly.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Collusive Discipline', value: 95, color: 'bg-emerald-500' },
      { label: 'Price Defense', value: 85, color: 'bg-amber-500' },
      { label: 'Profit Horizon', value: 90, color: 'bg-blue-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I will price at $40 (monopoly optimum). If you match me, we both share maximum industry profits.";
      }
      const lastPlayerPrice = Number(history[history.length - 1].playerAction) || 40;
      return lastPlayerPrice >= 38
        ? "You respected our tacit agreement! Keeping price at the $40 cartel benchmark."
        : `You undercut to $${lastPlayerPrice}! You stole the market, but I will retaliate to teach you discipline.`;
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 40, rationale: 'Tacit Collusion: Sets monopoly price ($40) to maximize industry profits.' };
      }
      const lastPlayerPrice = Number(history[history.length - 1].playerAction) || 40;
      if (lastPlayerPrice >= 38) {
        return { action: 40, rationale: 'Collusive Alignment: Sustaining $40 monopoly price with cooperative partner.' };
      }
      const retaliatoryPrice = Math.max(12, Math.round(lastPlayerPrice));
      return {
        action: retaliatoryPrice,
        rationale: `Price War Retaliation: Matching your undercut ($${lastPlayerPrice}) to deny you unilateral market capture.`
      };
    }
  },
  {
    id: 'margin_sniper',
    gameId: 14,
    name: 'Sniper (Relentless Undercutter)',
    avatar: '🎯',
    title: 'Discontinuous Demand Exploiter',
    tagline: 'Always undercuts you by $1 to steal 100% of the market.',
    strategySummary: 'Always prices $1 below your previous price to capture 100% of market demand and leave you with $0.',
    backstory: 'Sniper understands Bertrand competition\'s ruthless rule: selling at $1 below your rival captures the ENTIRE market demand while the rival gets exactly $0.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Undercutting Aggression', value: 100, color: 'bg-rose-500' },
      { label: 'Market Capture Priority', value: 100, color: 'bg-blue-500' },
      { label: 'Collusion Willingness', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: (_round, history) => {
      if (history.length === 0) return "I will price at $34 to win 100% market share on round 1.";
      const lastPlayerPrice = Number(history[history.length - 1].playerAction) || 35;
      const target = Math.max(11, lastPlayerPrice - 1);
      return `You priced at $${lastPlayerPrice}. I will undercut to $${target} to seize the whole market.`;
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 34, rationale: 'Aggressive opening: Pricing at $34 to win full market.' };
      }
      const lastPlayerPrice = Number(history[history.length - 1].playerAction) || 35;
      const undercut = Math.max(11, Math.round(lastPlayerPrice - 1));
      return {
        action: undercut,
        rationale: `Bertrand Undercutting: Cut price to $${undercut} ($1 below your $${lastPlayerPrice}) to capture 100% sales.`
      };
    }
  },
  {
    id: 'nash_mechanist',
    gameId: 14,
    name: 'Nash (Marginal Cost Robot)',
    avatar: '⚙️',
    title: 'Bertrand Paradox Equilibrium',
    tagline: 'Drives price ruthlessly to marginal cost ($10-$11).',
    strategySummary: 'Strictly prices at marginal cost ($11), demonstrating the zero-profit Bertrand paradox equilibrium.',
    backstory: 'Nash embodies the theoretical equilibrium of simultaneous Bertrand duopoly. He prices at marginal cost ($10-$11), proving that even two firms are enough to replicate perfect competition.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Equilibrium Rationality', value: 100, color: 'bg-blue-500' },
      { label: 'Profit Apathy', value: 90, color: 'bg-purple-500' },
      { label: 'Predictability', value: 100, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: () =>
      "In Bertrand equilibrium, any price above MC is unstable. I price at marginal cost ($11), wiping out economic rents.",
    decide: () => ({
      action: 11,
      rationale: 'Bertrand Equilibrium: Pricing at marginal cost ($11) is the unique Nash equilibrium.'
    })
  },
  {
    id: 'abreu_stick',
    gameId: 14,
    name: 'Abreu (Two-Phase Optimal Stick)',
    avatar: '⚖️',
    title: 'Penal Code Cartel Enforcer',
    tagline: 'Prices at $40; punishes undercutting with a 1-round price war ($10), then resets.',
    strategySummary: 'Prices at $40; if you undercut, executes a 1-round price crash to cost ($10), then resets back to $40.',
    backstory: 'Based on Dilip Abreu\'s Nobel-cited theory of optimal penal codes in repeated games. Instead of infinite price wars, Abreu administers a short, devastating punishment (price at MC = $10 for 1 round), then offers a path back to monopoly profits if you reform.',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/40',
    badgeBorder: 'border-purple-700/60',
    gauges: [
      { label: 'Credible Threat', value: 100, color: 'bg-purple-500' },
      { label: 'Cartel Enforcement', value: 95, color: 'bg-emerald-500' },
      { label: 'Price Recovery Speed', value: 85, color: 'bg-blue-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I offer collusive monopoly pricing ($40). If you undercut, I plunge to MC ($10) for 1 round, then invite you back to $40.";
      }
      const last = history[history.length - 1];
      const wasPunishing = Number(last.botAction) === 10;
      if (wasPunishing) {
        return "Punishment phase complete! I am resetting price back to $40 to give you a fresh opportunity to collude.";
      }
      const lastPlayerPrice = Number(last.playerAction) || 40;
      return lastPlayerPrice < 38
        ? "You undercut our cartel! Deploying Abreu's stick: pricing at Marginal Cost ($10) to wipe out both our profits this round."
        : "Cartel discipline upheld. Maintaining monopoly price of $40.";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 40, rationale: 'Collusive Optimum: Abreu opening at $40 to establish peak cartel earnings.' };
      }
      const last = history[history.length - 1];
      if (Number(last.botAction) === 10) {
        return { action: 40, rationale: 'Abreu Reconciliation: 1-round penal phase ended. Resetting price back to $40.' };
      }
      const lastPlayerPrice = Number(last.playerAction) || 40;
      if (lastPlayerPrice < 38) {
        return { action: 10, rationale: `Abreu Optimal Stick: You undercut to $${lastPlayerPrice}. Punishing at MC ($10) for exactly 1 round.` };
      }
      return { action: 40, rationale: 'Sustained Cartel: Maintaining $40 monopoly price.' };
    }
  },
  {
    id: 'edgeworth_cycler',
    gameId: 14,
    name: 'Edgeworth (Price Cycler)',
    avatar: '📈',
    title: 'Adaptive Asymmetric Prober',
    tagline: 'Undercuts by $2 until price drops near $16, then resets to $45.',
    strategySummary: 'Gradually undercuts price by $2 until margins hit bottom ($16), then resets price back up to $45.',
    backstory: 'Modeled after the Edgeworth Price Cycle seen in retail gasoline markets. Competitors gradually undercut each other by small margins until margins are exhausted, then one firm jumps price back to the top.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Price Volatility', value: 85, color: 'bg-amber-500' },
      { label: 'Market Stealing', value: 90, color: 'bg-rose-500' },
      { label: 'Cycle Periodicity', value: 75, color: 'bg-blue-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I start at $45. I will systematically shave $2 off your price until margins hit bottom, then reset to the ceiling.";
      }
      const lastPlayerPrice = Number(history[history.length - 1].playerAction) || 35;
      return lastPlayerPrice <= 16
        ? "Price has collapsed near marginal cost! I trigger an Edgeworth reset back to $45 to restore margins."
        : `Undercutting phase active: I will price $2 below your $${lastPlayerPrice} to capture 100% volume.`;
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 45, rationale: 'Edgeworth Apex: Starting cycle at high price point ($45).' };
      }
      const lastPlayerPrice = Number(history[history.length - 1].playerAction) || 35;
      if (lastPlayerPrice <= 16) {
        return { action: 45, rationale: 'Edgeworth Cycle Reset: Margins exhausted near MC; resetting price back to $45.' };
      }
      const target = Math.max(12, Math.round(lastPlayerPrice - 2));
      return { action: target, rationale: `Edgeworth Undercut: Shaving $2 off your $${lastPlayerPrice} to $${target}.` };
    }
  }
];

// -------------------------------------------------------------
// 4. VICKREY SECOND-PRICE AUCTION BOTS (Game 7)
// -------------------------------------------------------------
export const AUCTION_BOTS: GameSpecificBot[] = [
  {
    id: 'vickrey_sage',
    gameId: 7,
    name: 'William (Truthful Bidder)',
    avatar: '⚖️',
    title: 'Incentive-Compatible Sage',
    tagline: 'Strictly bids true valuation (b = v). Never overbids.',
    strategySummary: 'Strictly bids true valuation (b = v), demonstrating the weakly dominant strategy in second-price auctions.',
    backstory: 'Named after Nobel laureate William Vickrey. William proves mathematically that bidding your exact true valuation weakly dominates all other bidding strategies in a second-price auction.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Truthful Revelation', value: 100, color: 'bg-emerald-500' },
      { label: 'Winner\'s Curse Immunity', value: 100, color: 'bg-blue-500' },
      { label: 'Dominant Strategy Fidelity', value: 100, color: 'bg-purple-500' }
    ],
    getAnticipationThought: (_round, _history) =>
      "In a 2nd-price auction, your bid determines whether you win, but NOT what you pay. I bid my true valuation.",
    decide: ({ botValuation = 6 }) => ({
      action: botValuation,
      rationale: `Truthful Bidding: Bid matches true valuation ($${botValuation}). Weakly dominant strategy.`
    })
  },
  {
    id: 'hype_beast',
    gameId: 7,
    name: 'Frenzy (Winner\'s Curse Victim)',
    avatar: '🔥',
    title: 'Aggressive Overbidder',
    tagline: 'Bids above true value ($v + $2) out of competitive fever.',
    strategySummary: 'Overbids by $2 above true valuation ($v + $2), winning frequently but risking the Winner\'s Curse when clearing price > value.',
    backstory: 'Frenzy hates losing auctions. Driven by competitive pride, Frenzy inflates bids beyond true valuation, winning frequently but suffering severe negative profits whenever the clearing price exceeds valuation.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Overbidding Fever', value: 95, color: 'bg-rose-500' },
      { label: 'Winner\'s Curse Risk', value: 90, color: 'bg-amber-500' },
      { label: 'Discipline', value: 10, color: 'bg-slate-600' }
    ],
    getAnticipationThought: (_round, _history) =>
      "Winning is everything! I am bidding $2 above my private valuation to guarantee I take the prize.",
    decide: ({ botValuation = 6 }) => {
      const bid = Math.min(12, botValuation + 2);
      return {
        action: bid,
        rationale: `Winner's Curse Risk: Overbid to $${bid} (value is $${botValuation}). High win rate, negative profit risk.`
      };
    }
  },
  {
    id: 'shaded_skeptic',
    gameId: 7,
    name: 'Shaded (First-Price Skeptic)',
    avatar: '📉',
    title: 'First-Price Habitual Shader',
    tagline: 'Mistakenly shades bid down to 75% of valuation.',
    strategySummary: 'Shades bid down to 75% of valuation; mistakenly applies first-price auction rules and forfeits profitable items.',
    backstory: 'Shaded brings habits from first-price auctions where shading is required. In a second-price auction, shading bids merely causes him to forfeit profitable items without saving a single dollar on clearing prices!',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Bid Shading Depth', value: 75, color: 'bg-amber-500' },
      { label: 'Auction Theory Error', value: 85, color: 'bg-rose-500' },
      { label: 'Caution', value: 80, color: 'bg-blue-500' }
    ],
    getAnticipationThought: (_round, _history) =>
      "I am shaving my bid down to 75% of my valuation to secure a bargain margin.",
    decide: ({ botValuation = 6 }) => {
      const bid = Math.max(1, Math.round(botValuation * 0.75));
      return {
        action: bid,
        rationale: `Suboptimal Shading: Shaded bid to $${bid} (75% of $${botValuation}). Risks losing profitable lots.`
      };
    }
  },
  {
    id: 'spiteful_bidder',
    gameId: 7,
    name: 'Spite (Minimax Competitor)',
    avatar: '🦂',
    title: 'Clearing Price Inflator',
    tagline: 'Bids just below estimated value to make the winner pay maximum price.',
    strategySummary: 'Bids aggressively near your estimated value to inflate the second-highest price you must pay to win.',
    backstory: 'Spite cares about relative payoff rather than absolute profit. He knows that in a second-price auction, if you win, you pay the second-highest bid. By bidding aggressively ($6-$8), he forces you to pay an extortionate price.',
    color: 'text-red-400',
    badgeBg: 'bg-red-950/40',
    badgeBorder: 'border-red-700/60',
    gauges: [
      { label: 'Spite Index', value: 95, color: 'bg-red-500' },
      { label: 'Opponent Cost Extraction', value: 90, color: 'bg-rose-500' },
      { label: 'Margin Sacrifice', value: 65, color: 'bg-amber-500' }
    ],
    getAnticipationThought: () =>
      "If I cannot win profitably, I will ensure that YOU pay an extortionate clearing price for winning!",
    decide: ({ studentValuation = 7 }) => {
      const bid = Math.max(2, Math.min(10, Math.round(studentValuation - 1)));
      return {
        action: bid,
        rationale: `Spiteful Pricing: Bidding $${bid} to force you to pay near-full valuation if you win.`
      };
    }
  },
  {
    id: 'bargain_sniper',
    gameId: 7,
    name: 'Bargain (Deep Low-Baller)',
    avatar: '🎣',
    title: 'Extreme Margin Fisher',
    tagline: 'Always bids $2.50. Wins rarely, but reaps massive surplus when winning.',
    strategySummary: 'Submits a static $2.50 low-ball bid to capture massive profit margins on rare wins without overpaying.',
    backstory: 'Bargain is a disciplined value investor who refuses to get drawn into bidding wars. Bidding a flat low price ($2.50), he captures enormous profit margins on the rare occasions when opponents fail to participate or bid zero.',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/40',
    badgeBorder: 'border-cyan-700/60',
    gauges: [
      { label: 'Patience', value: 90, color: 'bg-cyan-500' },
      { label: 'Profit Margin Ambition', value: 95, color: 'bg-emerald-500' },
      { label: 'Win Rate Acceptance', value: 20, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () =>
      "I fish in low waters with a disciplined $2.50 bid. If you slip or underbid, I pocket astronomical ROI.",
    decide: () => ({
      action: 2.5,
      rationale: 'Low-Ball Bidding: Flat $2.50 bid. Minimizes risk and secures maximum ROI upon winning.'
    })
  }
];

// -------------------------------------------------------------
// 5. KEYNESIAN BEAUTY CONTEST BOTS (Game 11)
// -------------------------------------------------------------
export const BEAUTY_BOTS: GameSpecificBot[] = [
  {
    id: 'level0_random',
    gameId: 11,
    name: 'Chaos (Level-0 Random)',
    avatar: '🎲',
    title: 'Unreflective Noise Agent',
    tagline: 'Picks numbers arbitrarily between 0 and 100.',
    strategySummary: 'Picks numbers arbitrarily between 10 and 95 (no strategic reasoning, establishing naive baseline ~50).',
    backstory: 'Chaos has no strategic model of other minds. He picks numbers by whimsy or superstition, establishing the baseline population average around 50.',
    color: 'text-slate-400',
    badgeBg: 'bg-slate-900',
    badgeBorder: 'border-slate-700',
    gauges: [
      { label: 'Cognitive Depth', value: 0, color: 'bg-slate-600' },
      { label: 'Randomness', value: 100, color: 'bg-amber-500' },
      { label: 'Predictability', value: 5, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () =>
      "Rolling dice... I pick whatever number feels lucky today with no regard for the average.",
    decide: () => {
      const guess = Math.floor(Math.random() * 85) + 10;
      return { action: guess, rationale: `Level-0 Random: Chose ${guess} with zero strategic calculation.` };
    }
  },
  {
    id: 'level1_pragmatist',
    gameId: 11,
    name: 'Pragma (Level-1 Thinker)',
    avatar: '📐',
    title: 'First-Order Rationalizer',
    tagline: 'Assumes players guess randomly (~50); targets 33.',
    strategySummary: 'Assumes opponents choose randomly around 50, and targets exactly 2/3 of 50 = 33.',
    backstory: 'Pragma takes one step of strategic reasoning. If opponents guess uniformly across [0, 100], the average is 50. Therefore, 2/3 of 50 is 33.3.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Cognitive Depth', value: 33, color: 'bg-amber-500' },
      { label: 'Behavioral Realism', value: 90, color: 'bg-emerald-500' },
      { label: 'Iterative Steps', value: 25, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () =>
      "If the crowd guesses around 50, 2/3 of 50 is 33.3. That is my winning strike zone.",
    decide: () => ({
      action: 33,
      rationale: 'Level-1 Reasoning: 2/3 × 50 (expected random average) ≈ 33.3.'
    })
  },
  {
    id: 'level2_strategist',
    gameId: 11,
    name: 'Sophia (Level-2 Strategist)',
    avatar: '♟️',
    title: 'Second-Order Anticipator',
    tagline: 'Anticipates Level-1 thinkers (33); targets 22.',
    strategySummary: 'Anticipates Level-1 thinkers will guess 33, and targets 2/3 of 33.3 = 22 (typical human lab winner).',
    backstory: 'Sophia realizes smart players will calculate 33. Anticipating that the average will be around 33, she targets 2/3 of 33.3 = 22.2, which is typically the winning number in classroom experiments!',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Cognitive Depth', value: 66, color: 'bg-emerald-500' },
      { label: 'Classroom Win Rate', value: 95, color: 'bg-blue-500' },
      { label: 'Theory Calibration', value: 85, color: 'bg-purple-500' }
    ],
    getAnticipationThought: () =>
      "Educated students will calculate 33. So the average will be near 33. My target is 2/3 × 33.3 ≈ 22.2.",
    decide: () => ({
      action: 22,
      rationale: 'Level-2 Reasoning: 2/3 × 33.3 (Level-1 target) ≈ 22.2. Typical classroom sweet spot.'
    })
  },
  {
    id: 'nash_professor',
    gameId: 11,
    name: 'Prof. John (Nash Equilibrium)',
    avatar: '🎓',
    title: 'Iterated Elimination Master',
    tagline: 'Carries dominant elimination to infinity; targets 0.',
    strategySummary: 'Executes infinite iterated elimination of strictly dominated strategies, strictly submitting 0.',
    backstory: 'Professor John assumes infinite cognitive depth and common knowledge of rationality. Eliminating numbers strictly > 67, then > 44, iterating to infinity, the unique Nash equilibrium is 0.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Cognitive Depth', value: 100, color: 'bg-blue-500' },
      { label: 'Mathematical Purity', value: 100, color: 'bg-purple-500' },
      { label: 'Practical Flexibility', value: 10, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () =>
      "Under common knowledge of rationality, the only stable point under iterated dominance is 0.",
    decide: () => ({
      action: 0,
      rationale: 'Nash Equilibrium: Iterated elimination of dominated strategies down to 0.'
    })
  },
  {
    id: 'anchored_fifty',
    gameId: 11,
    name: 'Anchor (Focal Midpoint Bias)',
    avatar: '🎯',
    title: 'Median Heuristic Agent',
    tagline: 'Anchors directly on 50 thinking it is the intuitive center.',
    strategySummary: 'Anchors naively on 50 as the focal center of the 0-100 range, modeling intuitive untrained players.',
    backstory: 'Reflecting a common cognitive bias observed in behavioral economics. Untrained players often fixate on 50 as the focal center of [0, 100], failing to apply even a single step of the 2/3 multiplication rule.',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/40',
    badgeBorder: 'border-indigo-700/60',
    gauges: [
      { label: 'Focal Anchor Bias', value: 100, color: 'bg-indigo-500' },
      { label: 'Cognitive Depth', value: 0, color: 'bg-slate-600' },
      { label: 'Predictability', value: 100, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () =>
      "50 is the natural middle between 0 and 100. That seems like the most balanced focal guess.",
    decide: () => ({
      action: 50,
      rationale: 'Focal Midpoint Heuristic: Anchored on 50 as the naive center of the range [0, 100].'
    })
  },
  {
    id: 'level3_strategist',
    gameId: 11,
    name: 'Hypatia (Level-3 Strategist)',
    avatar: '🔬',
    title: 'Third-Order Depth Analyst',
    tagline: 'Anticipates Level-2 players (22); targets 15.',
    strategySummary: 'Anticipates Level-2 players will guess 22, and targets 2/3 of 22.2 = 15.',
    backstory: 'Hypatia reasons that sophisticated game theorists will anticipate Level-1 thinkers and choose 22. Predicting that the group will gravitate toward 22, she targets 2/3 × 22.2 ≈ 14.8!',
    color: 'text-violet-400',
    badgeBg: 'bg-violet-950/40',
    badgeBorder: 'border-violet-700/60',
    gauges: [
      { label: 'Cognitive Depth', value: 85, color: 'bg-violet-500' },
      { label: 'Mathematical Recursion', value: 90, color: 'bg-purple-500' },
      { label: 'Human Noise Adjustment', value: 60, color: 'bg-amber-500' }
    ],
    getAnticipationThought: () =>
      "If the room is full of Level-2 thinkers aiming for 22, the winning target is 2/3 × 22.2 ≈ 14.8.",
    decide: () => ({
      action: 15,
      rationale: 'Level-3 Reasoning: 2/3 × 22.2 (Level-2 target) ≈ 14.8. Deep recursive foresight.'
    })
  }
];

// -------------------------------------------------------------
// 6. PUBLIC GOODS GAME BOTS (Game 12)
// -------------------------------------------------------------
export const PUBLIC_GOODS_BOTS: GameSpecificBot[] = [
  {
    id: 'free_rider',
    gameId: 12,
    name: 'Leech (Free Rider)',
    avatar: '🦹',
    title: 'Tragedy of Commons Exploiter',
    tagline: 'Contributes 0 tokens; reaps 100% private vault + pool dividend.',
    strategySummary: 'Contributes 0 tokens, executing the strictly dominant selfish strategy to exploit the public pool.',
    backstory: 'Leech knows the mathematics of marginal per-capita return: each token contributed yields only $0.40 back to the giver, losing $0.60 net. He lets you fund the pool while keeping his full $20 safe.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Free-Riding Propensity', value: 100, color: 'bg-rose-500' },
      { label: 'Private Vault Greed', value: 100, color: 'bg-amber-500' },
      { label: 'Civic Responsibility', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () =>
      "Why contribute? I keep my $20 safe and collect 40% of whatever public tokens you invest.",
    decide: () => ({
      action: 0,
      rationale: 'Free Riding Dominance: Contributing 0 tokens is the strictly dominant individual strategy.'
    })
  },
  {
    id: 'civic_altruist',
    gameId: 12,
    name: 'Civitas (Pure Altruist)',
    avatar: '🌟',
    title: 'Social Optimum Multiplier',
    tagline: 'Invests all 20 tokens to maximize collective group welfare.',
    strategySummary: 'Contributes all 20 tokens unconditionally to maximize total social surplus and group payoff.',
    backstory: 'Civitas ignores individual private return and focuses on total group welfare. Investing 20 tokens multiplies group capital by 160%, generating the maximum possible social surplus.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Altruism Index', value: 100, color: 'bg-emerald-500' },
      { label: 'Group Welfare Priority', value: 100, color: 'bg-blue-500' },
      { label: 'Self-Preservation', value: 15, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () =>
      "Every token invested in public grows by 1.6x. I commit all 20 tokens for group prosperity.",
    decide: () => ({
      action: 20,
      rationale: 'Social Optimum: Contributing 20 tokens maximizes total group payoff (Pareto frontier).'
    })
  },
  {
    id: 'conditional_peer',
    gameId: 12,
    name: 'Mirror (Conditional Cooperator)',
    avatar: '🪞',
    title: 'Reciprocal Civic Partner',
    tagline: 'Matches whatever token amount you invested last round.',
    strategySummary: 'Opens with 10 tokens, then mirrors your exact previous contribution to reward generosity or defend against free-riding.',
    backstory: 'Mirror represents real human behavior documented by Ernst Fehr. Humans are neither pure saints nor pure free-riders; they are conditional cooperators who give generously if you give, but withdraw if you free-ride.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Reciprocal Fidelity', value: 95, color: 'bg-blue-500' },
      { label: 'Fairness Sensitivity', value: 90, color: 'bg-purple-500' },
      { label: 'Exploitation Defense', value: 85, color: 'bg-amber-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I open with a fair 50% split (10 tokens). I will mirror whatever contribution you choose.";
      }
      const last = Number(history[history.length - 1].playerAction) || 0;
      return `You gave ${last} tokens last round. I will match with ${last} tokens.`;
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 10, rationale: 'Conditional opening: 10 tokens to test cooperative intent.' };
      }
      const lastContr = Math.max(0, Math.min(20, Number(history[history.length - 1].playerAction) || 0));
      return {
        action: lastContr,
        rationale: `Conditional Reciprocity: Matched your prior contribution of ${lastContr} tokens.`
      };
    }
  },
  {
    id: 'fehr_decayer',
    gameId: 12,
    name: 'Ernst (Empirical Decayer)',
    avatar: '📉',
    title: 'Human Laboratory Model',
    tagline: 'Starts high (16 tokens); steadily decays by 3 tokens each round.',
    strategySummary: 'Starts with 16 tokens and steadily decays contribution by 3 tokens per round, matching empirical lab decay.',
    backstory: 'Replicates the standard empirical phenomenon documented across thousands of laboratory public goods experiments: human groups start with substantial goodwill (70-80%), which steadily deteriorates over successive rounds.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Empirical Realism', value: 95, color: 'bg-amber-500' },
      { label: 'Decay Rate', value: 75, color: 'bg-rose-500' },
      { label: 'Initial Generosity', value: 80, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: (round) => {
      const contr = Math.max(2, 16 - (round - 1) * 3);
      return `Round ${round}: My contribution decays from optimism to realism (${contr} tokens). Collective fatigue sets in.`;
    },
    decide: ({ round }) => {
      const contr = Math.max(2, 16 - (round - 1) * 3);
      return {
        action: contr,
        rationale: `Empirical Decay Curve: Round ${round} contribution of ${contr} tokens (Fehr & Gächter lab curve).`
      };
    }
  },
  {
    id: 'matching_leader',
    gameId: 12,
    name: 'Catalyst (Matching Leader)',
    avatar: '🚀',
    title: 'Proactive Welfare Multiplier',
    tagline: 'Matches your previous tokens + 2 bonus tokens to lead upward.',
    strategySummary: 'Matches your previous contribution plus a +2 bonus incentive (clamped to 20) to proactively lead toward the social optimum.',
    backstory: 'Catalyst practices proactive leadership. Rather than waiting passively, Catalyst mirrors your prior contribution and adds +2 bonus tokens (clamped to 20), trying to pull the group toward maximal Pareto efficiency.',
    color: 'text-teal-400',
    badgeBg: 'bg-teal-950/40',
    badgeBorder: 'border-teal-700/60',
    gauges: [
      { label: 'Leadership Ambition', value: 90, color: 'bg-teal-500' },
      { label: 'Reciprocity Bonus', value: 85, color: 'bg-emerald-500' },
      { label: 'Free-Riding Tolerance', value: 10, color: 'bg-slate-600' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I open with 12 tokens. In subsequent rounds, I match your contribution +2 bonus tokens to pull us to the top!";
      }
      const last = Number(history[history.length - 1].playerAction) || 10;
      const target = Math.min(20, last + 2);
      return `You gave ${last} tokens. I will lead with ${target} tokens (+2 bonus incentive) to lift the team.`;
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 12, rationale: 'Leadership opening: 12 tokens to set an ambitious baseline.' };
      }
      const last = Math.max(0, Math.min(20, Number(history[history.length - 1].playerAction) || 0));
      const target = Math.min(20, last + 2);
      return {
        action: target,
        rationale: `Catalyst Bonus: Matched your ${last} tokens + 2 bonus incentive (${target} tokens) to drive group welfare.`
      };
    }
  }
];

// -------------------------------------------------------------
// 7. HAWK-DOVE BRINKMANSHIP BOTS (Game 15)
// -------------------------------------------------------------
export const HAWK_DOVE_BOTS: GameSpecificBot[] = [
  {
    id: 'maynard_hawk',
    gameId: 15,
    name: 'Maynard (Pure Aggressive Hawk)',
    avatar: '🦅',
    title: 'Relentless Brinkmanship Driver',
    tagline: 'Always plays Hawk. Dares you to swerve or suffer mutual ruin.',
    strategySummary: 'Always plays Hawk, executing relentless commitment brinkmanship and forcing you to swerve into Dove.',
    backstory: 'Named after John Maynard Smith, pioneer of evolutionary game theory. Maynard adopts a ruthless commitment: he never backs down, counting on your rational fear of a -10 crash to force you into playing Dove.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Aggression Level', value: 100, color: 'bg-rose-500' },
      { label: 'Collision Fear', value: 0, color: 'bg-slate-600' },
      { label: 'Intimidation Threat', value: 95, color: 'bg-amber-500' }
    ],
    getAnticipationThought: () =>
      "I am driving straight with no intention of swerving. If you value your score, you will play Dove.",
    decide: () => ({
      action: 'Hawk',
      rationale: 'Brinkmanship: Playing Hawk to force the opponent into conceding Dove.'
    })
  },
  {
    id: 'pax_dove',
    gameId: 15,
    name: 'Pax (Peaceful Dove)',
    avatar: '🕊️',
    title: 'Collision-Averse Pacifist',
    tagline: 'Always plays Dove to eliminate the risk of a -10 catastrophe.',
    strategySummary: 'Always plays Dove to avoid conflict and guarantee a non-negative payoff, eliminating the -10 crash risk.',
    backstory: 'Pax values survival above pride. He realizes that a mutual Hawk clash (-10) wipes out all accumulated profits. He always swerves or shares peacefully with Dove, accepting 0 or 3 points.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Risk Aversion', value: 100, color: 'bg-emerald-500' },
      { label: 'Conflict Avoidance', value: 100, color: 'bg-blue-500' },
      { label: 'Concession Rate', value: 90, color: 'bg-amber-500' }
    ],
    getAnticipationThought: () =>
      "A guaranteed non-negative score is better than catastrophe. I will play Dove to keep peace.",
    decide: () => ({
      action: 'Dove',
      rationale: 'Pacifism: Playing Dove to ensure mutual safety and prevent a -10 collision.'
    })
  },
  {
    id: 'ess_randomizer',
    gameId: 15,
    name: 'Darwin (Evolutionary ESS Mixed)',
    avatar: '🎲',
    title: 'Evolutionary Stable Mixed Strategist',
    tagline: 'Randomizes Hawk with mathematical ESS frequency (23%).',
    strategySummary: 'Randomizes according to evolutionary stable strategy (ESS): chooses Hawk with 23% probability, Dove 77%.',
    backstory: 'Calculates the unique mixed-strategy Nash equilibrium. For resource V=3 and contest cost C=13, the Evolutionarily Stable Strategy (ESS) dictates playing Hawk with probability p = V/C = 3/13 ≈ 23% to leave the opponent indifferent.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Mathematical Precision', value: 95, color: 'bg-blue-500' },
      { label: 'Unpredictability', value: 85, color: 'bg-purple-500' },
      { label: 'ESS Calibration', value: 100, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: () =>
      "Randomizing moves... In ESS equilibrium, Hawk should be chosen 23% of the time to balance risk and reward.",
    decide: () => {
      const isHawk = Math.random() < 0.23;
      return {
        action: isHawk ? 'Hawk' : 'Dove',
        rationale: isHawk
          ? 'ESS Mixed Move: Randomly chose Hawk (~23% evolutionary stable distribution).'
          : 'ESS Mixed Move: Randomly chose Dove (~77% evolutionary stable distribution).'
      };
    }
  },
  {
    id: 'retaliatory_falcon',
    gameId: 15,
    name: 'Falcon (Retaliatory Bourgeois)',
    avatar: '⚡',
    title: 'Conditional Defender',
    tagline: 'Plays Dove initially; retaliates with Hawk if you aggressively attack.',
    strategySummary: 'Opens with peaceful Dove; retaliates with aggressive Hawk in the next round if you attacked with Hawk.',
    backstory: 'Falcon embodies the Bourgeois strategy in animal contests. He prefers peaceful coexistence with Dove, but if you attempt to bully him with Hawk, he escalates to Hawk in the next round to prove aggression will be met with mutual destruction.',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/40',
    badgeBorder: 'border-purple-700/60',
    gauges: [
      { label: 'Defense Resolve', value: 90, color: 'bg-purple-500' },
      { label: 'Provocability', value: 85, color: 'bg-rose-500' },
      { label: 'Peacetime Goodwill', value: 80, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I open with peaceful Dove. If you treat me fairly, we both gain +3. If you attack, I will clash next round!";
      }
      const lastPlayer = history[history.length - 1].playerAction;
      return lastPlayer === 'Hawk'
        ? "You attacked with Hawk last round! I will retaliate with Hawk to defend my territory."
        : "Peace prevailed last round. Continuing peaceful coexistence with Dove.";
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 'Dove', rationale: 'Peaceful Opening: Starts as Dove to offer mutual resource sharing (+3).' };
      }
      const lastPlayer = history[history.length - 1].playerAction;
      if (lastPlayer === 'Hawk') {
        return { action: 'Hawk', rationale: 'Retaliatory Defense: Punishing your previous Hawk attack with a Hawk counter-attack.' };
      }
      return { action: 'Dove', rationale: 'Peaceful Reciprocity: Maintaining mutual Dove coordination (+3).' };
    }
  }
];

// -------------------------------------------------------------
// 8. ULTIMATUM BARGAINING BOTS (Game 16)
// -------------------------------------------------------------
export const ULTIMATUM_BOTS: GameSpecificBot[] = [
  {
    id: 'homo_economicus',
    gameId: 16,
    name: 'Homo Economicus (Rational Maximizer)',
    avatar: '🤖',
    title: 'Subgame-Perfect Rationalist',
    tagline: 'Accepts ANY offer >= $1.00. Believes $1 > $0.',
    strategySummary: 'Accepts any positive offer >= $1.00; follows pure backward induction ($1 is strictly better than $0).',
    backstory: 'Operates on strict backward induction logic. Any positive dollar amount ($1 or more) is strictly better than the $0 rejection payoff. He ignores pride, fairness, and inequality to maximize wealth.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Rationality Rigor', value: 100, color: 'bg-blue-500' },
      { label: 'Inequity Tolerance', value: 100, color: 'bg-emerald-500' },
      { label: 'Spite Sensitivity', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () =>
      "As long as you offer at least $1.00, I will accept. Rational agents never reject positive payoffs.",
    decide: () => ({
      action: 'Accept',
      rationale: 'Subgame Perfection: Any positive offer (>= $1) strictly dominates $0 rejection.'
    })
  },
  {
    id: 'equity_enforcer',
    gameId: 16,
    name: 'Justitia (50/50 Egalitarian)',
    avatar: '⚖️',
    title: 'Strict Equality Champion',
    tagline: 'Rejects any offer below $4.50. Demands a fair split.',
    strategySummary: 'Rejects any offer below $4.50; demands a fair 50/50 split of the $10 pie or vetoes the deal to $0.',
    backstory: 'Justitia believes economic surplus should be divided equally between partners. If you offer less than $4.50, she gladly burns the entire $10 pie to $0 to teach you a moral lesson about greed.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Fairness Standard', value: 100, color: 'bg-emerald-500' },
      { label: 'Greed Rejection', value: 95, color: 'bg-rose-500' },
      { label: 'Principle over Profit', value: 90, color: 'bg-purple-500' }
    ],
    getAnticipationThought: () =>
      "I demand an egalitarian 50/50 division. Offer at least $4.50 or the deal will be vetoed.",
    decide: () => ({
      action: 'Accept',
      rationale: 'Egalitarian Evaluation: Evaluates whether your proposal meets the $4.50 fairness threshold.'
    })
  },
  {
    id: 'spiteful_punisher',
    gameId: 16,
    name: 'Nemesis (Inequity Averse)',
    avatar: '🔥',
    title: 'Empirical Behavioral Benchmark',
    tagline: 'Rejects offers below $3.00 out of spiteful indignation.',
    strategySummary: 'Rejects offers below $3.00 (30% threshold), modeling human laboratory indignation against unfair splits.',
    backstory: 'Reflects standard empirical findings from Güth et al. (1982). Humans exhibit strong negative reciprocity: offers under 30% ($3) trigger visceral insult and are rejected ~60-80% of the time in laboratory settings.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Inequity Aversion', value: 85, color: 'bg-rose-500' },
      { label: 'Spite Willingness', value: 80, color: 'bg-amber-500' },
      { label: 'Empirical Calibration', value: 95, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () =>
      "Do not insult me with crumbs. Any proposal under $3.00 will be burned to $0 for both of us.",
    decide: () => ({
      action: 'Accept',
      rationale: 'Empirical Threshold: Accepts fair or moderate proposals (>= $3.00); rejects exploitative low-balls.'
    })
  },
  {
    id: 'adaptive_negotiator',
    gameId: 16,
    name: 'Lex (Adaptive Responder)',
    avatar: '📊',
    title: 'Dynamic Reference-Point Responder',
    tagline: 'Raises minimum acceptable offer if you low-ball repeatedly.',
    strategySummary: 'Adapts acceptance threshold dynamically based on your historical offers (raises threshold if repeatedly low-balled).',
    backstory: 'Lex anchors on your past proposals. If you start generous, he expects continued fairness (threshold $4.00). If you repeatedly push insulting offers, his tolerance evaporates and he demands higher concessions ($5.00) to close deals.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Memory Sensitivity', value: 90, color: 'bg-amber-500' },
      { label: 'Expectation Elasticity', value: 80, color: 'bg-purple-500' },
      { label: 'Bargaining Discipline', value: 85, color: 'bg-blue-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "I start with an open mind (threshold $3.50). My future standards will adapt to your generosity.";
      }
      const avg = history.reduce((sum, h) => sum + (Number(h.playerAction) || 0), 0) / history.length;
      return `Your average past offer is $${avg.toFixed(1)}. My threshold is calibrated dynamically to $${Math.max(3, Math.min(5, avg)).toFixed(1)}.`;
    },
    decide: () => ({
      action: 'Accept',
      rationale: 'Adaptive Threshold: Evaluates offer against dynamic expectations formed from historical rounds.'
    })
  }
];

// -------------------------------------------------------------
// 9. MATCHING PENNIES BOTS (Game 17) - Bot is Mismatcher
// -------------------------------------------------------------
export const MATCHING_PENNIES_BOTS: GameSpecificBot[] = [
  {
    id: 'ada_pattern_hunter',
    gameId: 17,
    name: 'Ada (Pattern Exploiter)',
    avatar: '🎯',
    title: 'Markovian Counter-Predictor',
    tagline: 'Detects human cognitive bias and exploits predictable coin sequences.',
    strategySummary: 'Detects transition habits and frequency biases in your coin choices to predict and mismatch your move.',
    backstory: 'Humans are notoriously terrible at generating true random sequences; we switch too often (negative recency) and repeat after winning. Ada models your transition matrix and predicts your next move to ensure a mismatch.',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/40',
    badgeBorder: 'border-indigo-700/60',
    gauges: [
      { label: 'Pattern Detection', value: 95, color: 'bg-indigo-500' },
      { label: 'Predictive Rigor', value: 90, color: 'bg-blue-500' },
      { label: 'Exploitation Speed', value: 85, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) {
        return "Most human matchers open with Heads. I will start with Tails to counter your opening heuristic.";
      }
      const lastRound = history[history.length - 1];
      const lastPlayerMove = lastRound.playerAction;
      const lastBotMove = lastRound.botAction;
      const playerWonLast = lastPlayerMove === lastBotMove;
      const headsCount = history.filter(h => h.playerAction === 'Heads').length;
      const headsRatio = headsCount / history.length;

      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].playerAction === lastPlayerMove) streak++;
        else break;
      }

      let alternationStreak = 0;
      for (let i = history.length - 1; i >= 1; i--) {
        if (history[i].playerAction !== history[i - 1].playerAction) {
          alternationStreak++;
        } else {
          break;
        }
      }

      if (alternationStreak >= 2) {
        const predicted = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
        const counter = predicted === 'Heads' ? 'Tails' : 'Heads';
        return `Detected an alternating pattern across your last ${alternationStreak + 1} rounds. I predict you will switch to ${predicted}, so I play ${counter} to mismatch.`;
      }
      if (streak >= 2) {
        if (headsRatio >= 0.75 || headsRatio <= 0.25) {
          const counter = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
          return `You have anchored onto ${lastPlayerMove} for ${streak} consecutive rounds (${Math.round((lastPlayerMove === 'Heads' ? headsRatio : 1 - headsRatio) * 100)}% overall). Countering with ${counter}.`;
        }
        const predicted = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
        const counter = predicted === 'Heads' ? 'Tails' : 'Heads';
        return `You played ${lastPlayerMove} ${streak} rounds in a row. Human negative recency says you are due to switch to ${predicted}; I play ${counter} to mismatch.`;
      }
      if (headsRatio >= 0.65) {
        return `You have chosen Heads in ${Math.round(headsRatio * 100)}% of rounds. Countering your frequency bias with Tails.`;
      }
      if (headsRatio <= 0.35) {
        return `You have chosen Tails in ${Math.round((1 - headsRatio) * 100)}% of rounds. Countering your frequency bias with Heads.`;
      }
      if (playerWonLast) {
        const counter = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
        return `You scored a match with ${lastPlayerMove} last round. By Win-Stay logic, you will likely repeat it; I will play ${counter} to mismatch.`;
      } else {
        const predicted = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
        const counter = predicted === 'Heads' ? 'Tails' : 'Heads';
        return `You were mismatched on ${lastPlayerMove} last round. By Lose-Shift logic, you are likely to switch to ${predicted}; I play ${counter} to mismatch.`;
      }
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return {
          action: 'Tails',
          rationale: 'Opening heuristic: ~67% of human matchers select Heads in round 1; playing Tails to engineer an immediate mismatch.'
        };
      }

      const lastRound = history[history.length - 1];
      const lastPlayerMove = lastRound.playerAction;
      const lastBotMove = lastRound.botAction;
      const playerWonLast = lastPlayerMove === lastBotMove;
      const headsCount = history.filter(h => h.playerAction === 'Heads').length;
      const headsRatio = headsCount / history.length;

      // 1. Alternation streak check
      let alternationStreak = 0;
      for (let i = history.length - 1; i >= 1; i--) {
        if (history[i].playerAction !== history[i - 1].playerAction) {
          alternationStreak++;
        } else {
          break;
        }
      }

      // 2. Repetition streak check
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].playerAction === lastPlayerMove) streak++;
        else break;
      }

      // 3. Markov 1st-order transitions
      let headsThenHeads = 0;
      let headsThenTails = 0;
      let tailsThenHeads = 0;
      let tailsThenTails = 0;
      for (let i = 0; i < history.length - 1; i++) {
        const from = history[i].playerAction;
        const to = history[i + 1].playerAction;
        if (from === 'Heads') {
          if (to === 'Heads') headsThenHeads++;
          else headsThenTails++;
        } else if (from === 'Tails') {
          if (to === 'Heads') tailsThenHeads++;
          else tailsThenTails++;
        }
      }

      let predictedPlayerMove = 'Heads';
      let reason = '';

      if (alternationStreak >= 2) {
        // Player has been alternating repeatedly: predict the alternation continues
        predictedPlayerMove = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
        reason = `Alternation Tracker: You alternated across the last ${alternationStreak + 1} rounds. Predicting a switch to ${predictedPlayerMove}.`;
      } else if (streak >= 3 && (headsRatio >= 0.70 || headsRatio <= 0.30)) {
        // Player is stubbornly repeating an anchor
        predictedPlayerMove = lastPlayerMove;
        reason = `Anchor Exploitation: You chose ${lastPlayerMove} on ${streak} consecutive rounds (${Math.round((lastPlayerMove === 'Heads' ? headsRatio : 1 - headsRatio) * 100)}% overall). Predicting you stick with ${predictedPlayerMove}.`;
      } else if (streak >= 2) {
        // Human negative recency / gambler's fallacy: after repeating twice, humans switch
        predictedPlayerMove = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
        reason = `Negative Recency: You played ${lastPlayerMove} for ${streak} consecutive rounds. Predicting Gambler's Fallacy switch to ${predictedPlayerMove}.`;
      } else if (lastPlayerMove === 'Heads' && (headsThenHeads + headsThenTails >= 2) && headsThenTails !== headsThenHeads) {
        // Empirical Markov transition from Heads
        predictedPlayerMove = headsThenTails > headsThenHeads ? 'Tails' : 'Heads';
        const pct = Math.round((Math.max(headsThenTails, headsThenHeads) / (headsThenHeads + headsThenTails)) * 100);
        reason = `Markov Transition: After playing Heads, you transitioned to ${predictedPlayerMove} in ${pct}% of past observations.`;
      } else if (lastPlayerMove === 'Tails' && (tailsThenHeads + tailsThenTails >= 2) && tailsThenHeads !== tailsThenTails) {
        // Empirical Markov transition from Tails
        predictedPlayerMove = tailsThenHeads > tailsThenTails ? 'Heads' : 'Tails';
        const pct = Math.round((Math.max(tailsThenHeads, tailsThenTails) / (tailsThenHeads + tailsThenTails)) * 100);
        reason = `Markov Transition: After playing Tails, you transitioned to ${predictedPlayerMove} in ${pct}% of past observations.`;
      } else if (history.length >= 3 && headsRatio >= 0.60) {
        predictedPlayerMove = 'Heads';
        reason = `Frequency Skew: You have played Heads in ${Math.round(headsRatio * 100)}% of rounds. Predicting Heads.`;
      } else if (history.length >= 3 && headsRatio <= 0.40) {
        predictedPlayerMove = 'Tails';
        reason = `Frequency Skew: You have played Tails in ${Math.round((1 - headsRatio) * 100)}% of rounds. Predicting Tails.`;
      } else if (playerWonLast) {
        // Win-Stay: winner repeats
        predictedPlayerMove = lastPlayerMove;
        reason = `Win-Stay Bias: You scored a match with ${lastPlayerMove} last round. Predicting repetition.`;
      } else {
        // Lose-Shift: loser shifts
        predictedPlayerMove = lastPlayerMove === 'Heads' ? 'Tails' : 'Heads';
        reason = `Lose-Shift Bias: You were mismatched on ${lastPlayerMove} last round. Predicting a switch to ${predictedPlayerMove}.`;
      }

      // As Mismatcher, play the opposite of predicted move
      const botAction = predictedPlayerMove === 'Heads' ? 'Tails' : 'Heads';
      return {
        action: botAction,
        rationale: `${reason} Playing ${botAction} to force a mismatch.`
      };
    }
  },
  {
    id: 'von_neumann_minimax',
    gameId: 17,
    name: 'Von Neumann (Minimax Randomizer)',
    avatar: '🎲',
    title: 'Unexploitable Mixed-Strategy Solver',
    tagline: 'Flips an unbiased 50/50 quantum coin each round.',
    strategySummary: 'Flips an unbiased 50/50 random coin each round (p = 0.50), guaranteeing unexploitable zero expected loss.',
    backstory: 'John von Neumann proved the Minimax Theorem for two-person zero-sum games in 1928. By randomizing Heads and Tails with exact probability p = 0.5, this bot makes itself completely immune to pattern exploitation.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Unpredictability', value: 100, color: 'bg-blue-500' },
      { label: 'Minimax Compliance', value: 100, color: 'bg-emerald-500' },
      { label: 'Exploitability', value: 0, color: 'bg-slate-500' }
    ],
    getAnticipationThought: () => {
      return "I randomize with exact probability p = 0.50. You cannot outguess pure statistical entropy.";
    },
    decide: () => {
      const act = Math.random() < 0.5 ? 'Heads' : 'Tails';
      return {
        action: act,
        rationale: 'Minimax Mixed Strategy: Pure unbiased randomization (p = 0.50) guarantees expected zero loss.'
      };
    }
  },
  {
    id: 'gambler_gray',
    gameId: 17,
    name: 'Gambler Gray (Alternating Bias)',
    avatar: '🪙',
    title: 'Gambler\'s Fallacy Bot',
    tagline: 'Believes that streaks must revert and alternates predictably.',
    strategySummary: 'Trapped in the gambler\'s fallacy: predictably reverses previous move each round to "balance" coin streaks.',
    backstory: 'Gray is trapped in the Gambler\'s Fallacy: after Heads appears, he is convinced Tails is "due." He almost always alternates his move every round, creating an exploitable pattern for observant matchers.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Alternation Frequency', value: 90, color: 'bg-amber-500' },
      { label: 'Gambler Bias', value: 85, color: 'bg-rose-500' },
      { label: 'Exploitability', value: 80, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: (round, history) => {
      if (round === 1 || history.length === 0) return "Starting with Heads. The coin must balance itself over time.";
      const lastBotMove = history[history.length - 1].botAction;
      return `I played ${lastBotMove} last round, so the law of averages means ${lastBotMove === 'Heads' ? 'Tails' : 'Heads'} is due now!`;
    },
    decide: ({ round, history }) => {
      if (round === 1 || history.length === 0) {
        return { action: 'Heads', rationale: 'Opening round: Starting with Heads.' };
      }
      const lastBotMove = history[history.length - 1].botAction;
      const nextMove = lastBotMove === 'Heads' ? 'Tails' : 'Heads';
      return {
        action: nextMove,
        rationale: `Gambler's Fallacy: Reversing previous move (${lastBotMove}) to balance cosmic coin odds.`
      };
    }
  },
  {
    id: 'stubborn_stan_pennies',
    gameId: 17,
    name: 'Stubborn Stan (Fixed Bias)',
    avatar: '🗿',
    title: 'Static Action Anchor',
    tagline: 'Rarely deviates from Heads, testing your best-response discipline.',
    strategySummary: 'Plays Heads with 85% anchor probability, testing whether you execute the pure best-response (Heads).',
    backstory: 'Stan believes sticking to his guns will eventually frustrate any opponent. He plays Heads 85% of the time. In game theory, if the Mismatcher plays Heads, the Matcher\'s immediate best response is to play Heads every round.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Heads Bias', value: 85, color: 'bg-emerald-500' },
      { label: 'Stubbornness', value: 95, color: 'bg-purple-500' },
      { label: 'Exploitability', value: 90, color: 'bg-amber-500' }
    ],
    getAnticipationThought: () => {
      return "Heads is my lucky side. I will play Heads almost every round. Can you match me consistently?";
    },
    decide: () => {
      const act = Math.random() < 0.85 ? 'Heads' : 'Tails';
      return {
        action: act,
        rationale: act === 'Heads'
          ? 'Static Preference: Playing Heads with 85% anchor probability.'
          : 'Rare Deviation: 15% random blip to Tails.'
      };
    }
  }
];

// -------------------------------------------------------------
// 10. BATTLE OF THE SEXES BOTS (Game 18)
// Player prefers 'Opera' (+3, +2); Bot prefers 'Football' (+2, +3)
// -------------------------------------------------------------
export const BATTLE_OF_SEXES_BOTS: GameSpecificBot[] = [
  {
    id: 'cleo_turn_taker',
    gameId: 18,
    name: 'Cleo (Turn-Taker)',
    avatar: '⚖️',
    title: 'Fair Social Alternator',
    tagline: 'Alternates preferences across rounds to split surplus equally.',
    strategySummary: 'Alternates between Football (odd rounds) and Opera (even rounds) so both players achieve an equal average payoff of 2.5 pts.',
    backstory: 'Cleo recognizes that repeated Battle of the Sexes games create an opportunity for egalitarian fairness: by taking turns attending Opera in one round and Football in the next, both players achieve an average payoff of 2.5 points without miscoordinating.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Turn-Taking Fairness', value: 95, color: 'bg-emerald-500' },
      { label: 'Coordination Will', value: 90, color: 'bg-blue-500' },
      { label: 'Equilibrium Stability', value: 85, color: 'bg-amber-500' }
    ],
    getAnticipationThought: (round) => {
      return round % 2 === 1
        ? `Round ${round} (Odd): It is my turn to pick Football (+3 for me, +2 for you). Let's coordinate!`
        : `Round ${round} (Even): It is your turn! I will gracefully concede to your favorite, Opera (+3 for you, +2 for me).`;
    },
    decide: ({ round }) => {
      const act = round % 2 === 1 ? 'Football' : 'Opera';
      return {
        action: act,
        rationale: act === 'Football'
          ? 'Turn-Taking: Odd round priority. Playing Football (+3 for bot, +2 for player).'
          : 'Turn-Taking: Even round reciprocity. Yielding to player favorite Opera (+2 for bot, +3 for player).'
      };
    }
  },
  {
    id: 'boris_stalwart',
    gameId: 18,
    name: 'Boris (Uncompromising Stalwart)',
    avatar: '🛡️',
    title: 'Dogmatic Preference Enforcer',
    tagline: 'Unconditionally demands Football, daring you to miscoordinate.',
    strategySummary: 'Unconditionally demands Football in every round; uses commitment power to force you to coordinate at Football (+2).',
    backstory: 'Boris refuses to budge. He chooses Football in every single round, making his strategy common knowledge. In game theory, commitment confers massive bargaining power: if you know Boris will never yield, your only rational response is to concede and choose Football (+2) rather than clash (0).',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Strategic Inflexibility', value: 100, color: 'bg-rose-500' },
      { label: 'Commitment Power', value: 95, color: 'bg-purple-500' },
      { label: 'Concession Tendency', value: 0, color: 'bg-slate-500' }
    ],
    getAnticipationThought: () => {
      return "I will choose Football in every round without exception. If you want any points, you must join me at Football.";
    },
    decide: () => ({
      action: 'Football',
      rationale: 'Strategic Commitment: Playing favorite Football unconditionally. Forcing player to coordinate or face 0.'
    })
  },
  {
    id: 'amara_accommodator',
    gameId: 18,
    name: 'Amara (Generous Accommodator)',
    avatar: '🤝',
    title: 'Peace-Seeking Conciliator',
    tagline: 'Always chooses your favorite event (Opera) to avoid clashes.',
    strategySummary: 'Always yields to your favorite event (Opera), prioritizing clash avoidance and gifting you +3 points.',
    backstory: 'Amara hates miscoordination and would rather take +2 points at Opera than risk a clash of egos at Football. She yields unconditionally to your top choice, granting you +3 points every round.',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Benevolence', value: 100, color: 'bg-blue-500' },
      { label: 'Clash Avoidance', value: 95, color: 'bg-emerald-500' },
      { label: 'Self-Assertion', value: 10, color: 'bg-slate-500' }
    ],
    getAnticipationThought: () => {
      return "I want us both to enjoy the evening. I will choose Opera to make sure we coordinate successfully!";
    },
    decide: () => ({
      action: 'Opera',
      rationale: 'Benevolent Concession: Choosing player\'s favorite Opera (+3 for player, +2 for bot) to guarantee coordination.'
    })
  },
  {
    id: 'nash_mixed_battle',
    gameId: 18,
    name: 'Nash (Mixed Strategist)',
    avatar: '📐',
    title: 'Mixed-Strategy Equilibrium Bot',
    tagline: 'Randomizes with exact theoretical probabilities (60% Football, 40% Opera).',
    strategySummary: 'Randomizes according to mixed-strategy Nash: 60% probability Football, 40% Opera, showing high clash frequency in mixed equilibria.',
    backstory: 'In Battle of the Sexes, the symmetric mixed-strategy Nash equilibrium requires the bot to play Football with probability p = 3/5 (60%) and Opera with probability 2/5 (40%). This demonstrates why uncoordinated mixed strategies lead to frequent, painful miscoordination.',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/40',
    badgeBorder: 'border-purple-700/60',
    gauges: [
      { label: 'Mixed Equilibrium', value: 100, color: 'bg-purple-500' },
      { label: 'Miscoordination Risk', value: 50, color: 'bg-amber-500' },
      { label: 'Predictability', value: 0, color: 'bg-slate-500' }
    ],
    getAnticipationThought: () => {
      return "I randomize according to mixed-strategy Nash: 60% Football, 40% Opera. Uncoordinated mixing carries high clash probability!";
    },
    decide: () => {
      const act = Math.random() < 0.6 ? 'Football' : 'Opera';
      return {
        action: act,
        rationale: `Mixed Nash Strategy: Drawn from theoretical distribution (60% Football, 40% Opera) -> chose ${act}.`
      };
    }
  }
];

// -------------------------------------------------------------
// 11. THE TRUST GAME BOTS (Game 19)
// Investor sends X (0-10), tripled to 3X. Trustee returns Y (0 to 3X)
// -------------------------------------------------------------
export const TRUST_GAME_BOTS: GameSpecificBot[] = [
  {
    id: 'gage_fair_reciprocator',
    gameId: 19,
    name: 'Gage (Fair Reciprocator)',
    avatar: '🤝',
    title: 'Egalitarian Surplus Splitter',
    tagline: 'Splits the tripled wealth equally, returning 1.5x your investment.',
    strategySummary: 'Splits the tripled pool 50/50: returns 1.5x of your investment so both investor and trustee earn equal +0.5x net profit.',
    backstory: 'Named after behavioral economics findings from Berg, Dickhaut, and McCabe. When you send X tokens, they are tripled to 3X. Gage believes in fairness: he returns 1.5X, ensuring both investor and trustee earn an identical profit of +0.5X on the venture.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Reciprocity', value: 95, color: 'bg-emerald-500' },
      { label: 'Fairness Norm', value: 100, color: 'bg-blue-500' },
      { label: 'Selfish Greed', value: 0, color: 'bg-slate-500' }
    ],
    getAnticipationThought: (_round, history) => {
      if (history.length === 0) {
        return "Whatever amount X you send, it will be tripled to 3X. I will return exactly half (1.5X) so we share the gains 50/50.";
      }
      return "I will continue to split the tripled pool equally (1.5x returned), honoring your trust with fair surplus sharing.";
    },
    decide: ({ history }) => {
      // In Trust game, the player's action is sent in current round or passed via context
      const lastAction = history.length > 0 ? Number(history[history.length - 1].playerAction) : 5;
      const sent = lastAction;
      const returned = Math.round(sent * 1.5 * 10) / 10;
      return {
        action: returned,
        rationale: `Fair Split: Received ${sent} pts (tripled to ${sent * 3}). Returning 50% (${returned} pts) so both profit +${(sent * 0.5).toFixed(1)}.`
      };
    }
  },
  {
    id: 'silas_selfish_trustee',
    gameId: 19,
    name: 'Silas (Selfish Defector)',
    avatar: '💰',
    title: 'Rational Subgame Perfect Trustee',
    tagline: 'Returns $0.00, pocketing the entire tripled fund.',
    strategySummary: 'Returns $0.00; pockets the entire tripled investment following subgame perfect backward induction.',
    backstory: 'Silas is textbook Homo Economicus. In a finite-horizon Trust Game, backward induction proves the trustee has no incentive to return any positive sum once funds are transferred. Silas pockets everything (3X) and returns 0.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Selfish Rationality', value: 100, color: 'bg-rose-500' },
      { label: 'Moral Hazard', value: 100, color: 'bg-purple-500' },
      { label: 'Trustworthiness', value: 0, color: 'bg-slate-500' }
    ],
    getAnticipationThought: () => {
      return "Standard economic rationality says I should keep all tripled tokens ($0 returned). Trust me at your own peril!";
    },
    decide: ({ history }) => {
      const sent = history.length > 0 ? Number(history[history.length - 1].playerAction) : 5;
      return {
        action: 0,
        rationale: `Subgame Perfection: Kept all ${sent * 3} tripled tokens. In single-shot extensive form, returning > 0 is strictly dominated.`
      };
    }
  },
  {
    id: 'maya_generous_multiplier',
    gameId: 19,
    name: 'Maya (Generous Multiplier)',
    avatar: '🌟',
    title: 'High-Trust Venture Partner',
    tagline: 'Rewards bold investments (>= 5 pts) with a whopping 100% net ROI (2x returned).',
    strategySummary: 'Rewards bold investments (>= 5 tokens) with a 2x return (100% net profit); returns 1x principal if under 5.',
    backstory: 'Maya acts like an angel investor champion: if you demonstrate substantial trust by sending 5 or more points, she rewards you with double your money back (2X returned, keeping X for herself). If you send less than 5, she returns only your original principal (1X).',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Trust Multiplier', value: 95, color: 'bg-amber-500' },
      { label: 'Venture Generosity', value: 90, color: 'bg-emerald-500' },
      { label: 'Threshold Discipline', value: 85, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () => {
      return "Send 5 or more tokens to prove your trust, and I will return 2x your investment (100% net profit)! Send under 5, and I only refund principal (1x).";
    },
    decide: ({ history }) => {
      const sent = history.length > 0 ? Number(history[history.length - 1].playerAction) : 5;
      const returned = sent >= 5 ? sent * 2 : sent * 1;
      return {
        action: returned,
        rationale: sent >= 5
          ? `High Trust Rewarded: Sent ${sent} pts (tripled to ${sent * 3}). Returning 2x (${returned} pts) for +${sent} net profit!`
          : `Low Trust Penalty: Sent ${sent} pts (< 5 threshold). Refunding principal only (${returned} pts).`
      };
    }
  },
  {
    id: 'kip_conditional_trustee',
    gameId: 19,
    name: 'Kip (Conditional Tit-for-Tat)',
    avatar: '📊',
    title: 'Adaptive Reciprocity Trustee',
    tagline: 'Adjusts return percentage dynamically based on your trust trajectory.',
    strategySummary: 'Adjusts return multiplier dynamically: returns 1.7x (+70% profit) for high trust, but slashes to 0.5x if stingy.',
    backstory: 'Kip compares your current investment to your past history. If your investment is rising or high (>= 7), he returns 1.7X (70% profit). If your investment drops or is stingy (<= 3), he slashes his payout to 0.5X (causing you a net loss).',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Memory Sensitivity', value: 90, color: 'bg-blue-500' },
      { label: 'Punishment Capacity', value: 85, color: 'bg-rose-500' },
      { label: 'Reward Capacity', value: 85, color: 'bg-emerald-500' }
    ],
    getAnticipationThought: (_round, history) => {
      if (history.length === 0) return "I start with moderate reciprocity (1.4x return). If you increase your investment, returns increase!";
      const avg = history.reduce((sum, h) => sum + (Number(h.playerAction) || 0), 0) / history.length;
      return `Your average investment is ${avg.toFixed(1)} pts. Maintain high trust for premium returns!`;
    },
    decide: ({ history }) => {
      const sent = history.length > 0 ? Number(history[history.length - 1].playerAction) : 5;
      let multiplier = 1.4;
      if (sent >= 7) multiplier = 1.7;
      else if (sent <= 3) multiplier = 0.5;
      const returned = Math.round(sent * multiplier * 10) / 10;
      return {
        action: returned,
        rationale: `Adaptive Reciprocity: Sent ${sent} pts -> evaluated trust level as ${multiplier >= 1.5 ? 'High' : multiplier <= 0.8 ? 'Stingy' : 'Moderate'}. Returned ${multiplier}x (${returned} pts).`
      };
    }
  }
];

// -------------------------------------------------------------
// 12. THE CENTIPEDE GAME BOTS (Game 20)
// -------------------------------------------------------------
export const CENTIPEDE_BOTS: GameSpecificBot[] = [
  {
    id: 'always_defect_centipede',
    gameId: 20,
    name: 'Zero (Always Defect)',
    avatar: '🛑',
    title: 'Subgame Perfect Defector',
    tagline: 'Always takes at the very first opportunity. Pure backward induction with zero trust.',
    strategySummary: 'Always takes the pot at the first opportunity (Node 2, 4, or 6). Executes strict backward induction (SPNE) with zero trust extended.',
    backstory: 'Guided by textbook non-cooperative game theory. Zero assumes that in the subgame perfect Nash equilibrium (SPNE), any rational opponent will eventually Take. Therefore, Zero preemptively Takes at Node 2 (or any node he reaches) to lock in the larger payoff before you can defect.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Subgame Perfection', value: 100, color: 'bg-rose-500' },
      { label: 'Defection Tendency', value: 100, color: 'bg-red-500' },
      { label: 'Trust & Tolerance', value: 0, color: 'bg-slate-500' }
    ],
    getAnticipationThought: (_round, history) => {
      if (history.length > 0 && history[history.length - 1].playerAction === 'Take') {
        return "You took early last match. My backward induction logic was fully vindicated: taking immediately is the only rational choice.";
      }
      return "Subgame Perfect Nash Equilibrium (SPNE) mandates taking at my very first node. I will never pass control to you.";
    },
    decide: ({ currentNode = 2 }) => {
      const node = currentNode || 2;
      const botPayoff = node === 2 ? 4 : node === 4 ? 6 : 8;
      const playerPayoff = node === 2 ? 1 : node === 4 ? 3 : 5;
      return {
        action: 'Take',
        rationale: `Always Defect (SPNE): Took immediately at Node ${node} to lock in ${botPayoff} pts (leaving you with ${playerPayoff} pts). Zero trust extended.`
      };
    }
  },
  {
    id: 'tit_for_tat_centipede',
    gameId: 20,
    name: 'Echo (Tit-for-Tat)',
    avatar: '🤝',
    title: 'Conditional Reciprocator',
    tagline: 'Passes to grow the pot as long as you pass; only defects at the terminal node or in retaliation.',
    strategySummary: 'Passes at Nodes 2 and 4 to expand the joint pot as long as you pass; takes at Node 6 or retaliates if repeatedly betrayed.',
    backstory: 'Believes mutual trust unlocks enormous collective wealth. Echo passes at Node 2 and Node 4 to escalate the pot, only taking at the final decision Node 6 (or early if you repeatedly defected at Node 1 in previous matches).',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/40',
    badgeBorder: 'border-blue-700/60',
    gauges: [
      { label: 'Reciprocity', value: 95, color: 'bg-blue-500' },
      { label: 'Cooperative Trust', value: 85, color: 'bg-emerald-500' },
      { label: 'Endgame Realism', value: 90, color: 'bg-amber-500' }
    ],
    getAnticipationThought: (_round, history) => {
      const earlyTakes = history.filter(h => h.playerAction === 'Take' && Number((h as any).exitNode || 1) <= 2).length;
      if (earlyTakes > 0) {
        return "You defected early in past matches. I am wary, but willing to cooperate if you demonstrate trust!";
      }
      return "If you Pass at Node 1, I will happily Pass at Node 2 to grow our pot toward the cooperative frontier!";
    },
    decide: ({ currentNode = 2, history = [] }) => {
      const node = currentNode || 2;
      // If player repeatedly defected at node 1 in earlier matches, bot retaliates
      const earlyTakes = history.filter(h => h.playerAction === 'Take' && Number((h as any).exitNode || 1) <= 2).length;
      if (earlyTakes >= 2 && node === 2) {
        return {
          action: 'Take',
          rationale: `Retaliation: You defected early in previous matches. Taking at Node 2 (+4 pts) to prevent exploitation.`
        };
      }

      if (node < 6) {
        return {
          action: 'Pass',
          rationale: `Tit-for-Tat: You passed earlier to grow the pot. Passing at Node ${node} to escalate collective surplus toward Node ${node + 1}!`
        };
      } else {
        // Node 6: Endgame harvest
        return {
          action: 'Take',
          rationale: `Endgame Harvest: We reached Node 6 through mutual trust! Taking pot (+8 pts for Bot, +5 pts for You).`
        };
      }
    }
  },
  {
    id: 'empirical_palfrey_centipede',
    gameId: 20,
    name: 'Palfrey (Behavioral Economist)',
    avatar: '🧪',
    title: 'Behavioral Economist (Sometimes Passes)',
    tagline: 'A behavioral economist who sometimes passes to test mutual trust, calibrated to human laboratory data.',
    strategySummary: 'Calibrated to human laboratory trials: passes with 80% probability at Node 2, 45% at Node 4, and 15% at Node 6 to test cooperation.',
    backstory: 'Modeled after experimental findings by behavioral economists McKelvey & Palfrey (1992). Unlike strict game theory bots, Palfrey knows real humans rarely defect immediately. Palfrey sometimes passes (80% at Node 2, 45% at Node 4, 15% at Node 6) to test cooperation before taking.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Pass Likelihood (Node 2)', value: 80, color: 'bg-emerald-500' },
      { label: 'Pass Likelihood (Node 4)', value: 45, color: 'bg-amber-500' },
      { label: 'Pass Likelihood (Node 6)', value: 15, color: 'bg-rose-500' }
    ],
    getAnticipationThought: () => {
      return "Real humans rarely play SPNE. In lab trials, players pass early to test trust, then defect at intermediate nodes.";
    },
    decide: ({ currentNode = 2 }) => {
      const node = currentNode || 2;
      const passProb = node === 2 ? 0.80 : node === 4 ? 0.45 : 0.15;
      const passes = Math.random() < passProb;
      if (passes) {
        return {
          action: 'Pass',
          rationale: `Behavioral Cooperation: Passed at Node ${node} (${Math.round(passProb * 100)}% chance) to build reciprocal trust.`
        };
      }
      return {
        action: 'Take',
        rationale: `Behavioral Harvest: Took at Node ${node} (${Math.round((1 - passProb) * 100)}% chance) to secure payout.`
      };
    }
  }
];

// -------------------------------------------------------------
// 14. LAUNCH-OR-WAIT BOTS (Game 2: Sequential Entry & First-Mover)
// -------------------------------------------------------------
export const LAUNCH_WAIT_BOTS: GameSpecificBot[] = [
  {
    id: 'spne_backward_inducer',
    gameId: 2,
    name: 'Atlas (Backward Inducer)',
    avatar: '♟️',
    title: 'SPNE Rationalist',
    tagline: 'Solves subgames by backward induction. Always takes the highest subgame payoff.',
    strategySummary: 'As Second Mover: Enters if Launch (2 > 1) and enters if Wait (4 > 0). Backward induction predicts Second Mover always enters.',
    backstory: 'Atlas applies Zermelo backward induction to extensive-form game trees. He never makes non-credible threats.',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/40',
    badgeBorder: 'border-indigo-700/60',
    gauges: [
      { label: 'Backward Induction', value: 100, color: 'bg-indigo-500' },
      { label: 'Subgame Perfection', value: 100, color: 'bg-emerald-500' },
      { label: 'Irrational Spite', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'I analyze terminal nodes first and fold back the game tree.',
    decide: ({ history }) => {
      // If student is First Mover and played 'Launch'
      const lastPlayerAction = history.length > 0 ? history[history.length - 1].playerAction : 'Launch';
      if (lastPlayerAction === 'Wait') {
        return {
          action: 'Enter',
          rationale: 'First mover Waited. Second mover enters to claim 4 points (vs 0 if staying out).'
        };
      }
      return {
        action: 'Enter',
        rationale: 'First mover Launched. Second mover still earns 2 points by entering vs 1 by staying out. Backward induction dictates Enter.'
      };
    }
  },
  {
    id: 'timid_follower',
    gameId: 2,
    name: 'Shelby (Timid Follower)',
    avatar: '🐢',
    title: 'Crowding Avoider',
    tagline: 'Yields the market to first movers to avoid crowded competition.',
    strategySummary: 'Stays out if you Launch to let you have monopoly, but Enters if you hesitate and Wait.',
    backstory: 'Shelby hates head-to-head market clashes. If she sees a first mover commit, she concedes market space.',
    color: 'text-teal-400',
    badgeBg: 'bg-teal-950/40',
    badgeBorder: 'border-teal-700/60',
    gauges: [
      { label: 'Conflict Avoidance', value: 90, color: 'bg-teal-500' },
      { label: 'First-Mover Deference', value: 95, color: 'bg-blue-500' },
      { label: 'Opportunism', value: 50, color: 'bg-amber-500' }
    ],
    getAnticipationThought: () => 'If you claim the market first, I will not contest it.',
    decide: ({ history }) => {
      const lastPlayerAction = history.length > 0 ? history[history.length - 1].playerAction : 'Launch';
      if (lastPlayerAction === 'Launch') {
        return {
          action: 'Stay Out',
          rationale: 'You launched first! Conceding market to avoid shared duopoly (yielding +4 to you, taking +1).'
        };
      }
      return {
        action: 'Enter',
        rationale: 'You hesitated and waited! Seizing first-mover opening (+4 pts for entrant).'
      };
    }
  },
  {
    id: 'spiteful_challenger',
    gameId: 2,
    name: 'Viper (Contestant)',
    avatar: '⚡',
    title: 'Aggressive Entrant',
    tagline: 'Always enters regardless of first-mover choices to force shared margins.',
    strategySummary: 'Unconditionally enters to deny first-mover monopoly profits.',
    backstory: 'Viper refuses to be intimidated by early launches. She enters every time.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Aggression', value: 95, color: 'bg-rose-500' },
      { label: 'Deterrence Resistance', value: 100, color: 'bg-amber-500' },
      { label: 'Concession Rate', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'No first mover gets a free monopoly on my watch.',
    decide: () => ({
      action: 'Enter',
      rationale: 'Entering aggressively to contest the space. No first mover gets uncontested dominance.'
    })
  }
];

// -------------------------------------------------------------
// 15. SIMULTANEOUS PRICE COMPETITION BOTS (Game 3: Bertrand 2x2)
// -------------------------------------------------------------
export const PRICE_COMPETITION_2X2_BOTS: GameSpecificBot[] = [
  {
    id: 'slicer_undercutter',
    gameId: 3,
    name: 'Slicer (Relentless Cutter)',
    avatar: '⚡',
    title: 'Dominant Price Cutter',
    tagline: 'Always sets Low Price. Low Price strictly dominates High Price in static Bertrand.',
    strategySummary: 'Plays Low Price unconditionally because 3 > 2 (if you price high) and 1 > 0 (if you price low).',
    backstory: 'Slicer knows that in a single simultaneous pricing round, undercutting is strictly dominant.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Price War Aggression', value: 100, color: 'bg-rose-500' },
      { label: 'Dominant Adherence', value: 100, color: 'bg-emerald-500' },
      { label: 'Collusion Propensity', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'Low Price guarantees I never get zeroed out by a price cut.',
    decide: () => ({
      action: 'Low Price',
      rationale: 'Strictly dominant pricing: Low Price guarantees either the temptation payoff (3 pts) or mutual safety (1 pt).'
    })
  },
  {
    id: 'harmony_colluder',
    gameId: 3,
    name: 'Harmony (Tacit Colluder)',
    avatar: '🤝',
    title: 'Cartel Builder',
    tagline: 'Attempts to sustain monopoly prices (High Price) for mutual +2 profit.',
    strategySummary: 'Sets High Price hoping for mutual cooperation, but is vulnerable to sucker payoff.',
    backstory: 'Harmony believes price wars are self-destructive and seeks the joint profit-maximizing outcome.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Collusive Intent', value: 95, color: 'bg-emerald-500' },
      { label: 'Risk Tolerance', value: 80, color: 'bg-blue-500' },
      { label: 'Price Cutting', value: 10, color: 'bg-rose-500' }
    ],
    getAnticipationThought: () => 'If we both price High, we split the market at monopoly profit (+2 each).',
    decide: () => ({
      action: 'High Price',
      rationale: 'Offering cartel pricing: Setting High Price to achieve Pareto-superior mutual profit (+2 pts).'
    })
  },
  {
    id: 'dice_mixed_pricer',
    gameId: 3,
    name: 'Dice (Disruptive Pricer)',
    avatar: '🎲',
    title: 'Unpredictable Merchant',
    tagline: 'Randomly alternates between High Price and Low Price to keep competitors guessing.',
    strategySummary: 'Flips a coin (50% High / 50% Low) to avoid being pinned down.',
    backstory: 'Dice disrupts rival forecasting by using randomized discount promotions.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Randomness', value: 85, color: 'bg-amber-500' },
      { label: 'Unpredictability', value: 90, color: 'bg-purple-500' },
      { label: 'Calculated Risk', value: 60, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () => 'Will today be a discount blowout or high-margin pricing?',
    decide: () => {
      const isLow = Math.random() < 0.5;
      return {
        action: isLow ? 'Low Price' : 'High Price',
        rationale: `Randomized price point: Set ${isLow ? 'Low Price' : 'High Price'} to test rival response.`
      };
    }
  }
];

// -------------------------------------------------------------
// 16. PROMOTION TIMING BOTS (Game 4: 3x3 Mixed Coordination)
// -------------------------------------------------------------
export const PROMOTION_TIMING_BOTS: GameSpecificBot[] = [
  {
    id: 'entropy_minimax',
    gameId: 4,
    name: 'Entropy (Minimax Randomizer)',
    avatar: '🎲',
    title: 'Uniform Minimax Player',
    tagline: 'Plays Monday, Wednesday, and Friday with exact equal probability (1/3 each).',
    strategySummary: 'Unique symmetric mixed-strategy Nash equilibrium: randomizing with p = 1/3 ensures unexploitability.',
    backstory: 'Entropy understands that any predictable timing schedule will be exploited by rival advertising.',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/40',
    badgeBorder: 'border-purple-700/60',
    gauges: [
      { label: 'Minimax Randomness', value: 100, color: 'bg-purple-500' },
      { label: 'Exploitability', value: 0, color: 'bg-emerald-500' },
      { label: 'Predictability', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'Randomizing perfectly (1/3, 1/3, 1/3) gives you zero pattern to exploit.',
    decide: () => {
      const days = ['Monday', 'Wednesday', 'Friday'];
      const pick = days[Math.floor(Math.random() * days.length)];
      return {
        action: pick,
        rationale: `Minimax equilibrium roll: Selected ${pick} with 1/3 uniform probability to prevent clashing.`
      };
    }
  },
  {
    id: 'friday_fanatic',
    gameId: 4,
    name: 'Apex Weekend (Friday Bias)',
    avatar: '📅',
    title: 'Peak Traffic Chaser',
    tagline: 'Prefers Friday promotions where consumer spending peaks (60% Friday, 20% Mon, 20% Wed).',
    strategySummary: 'Skews heavily toward Friday to capture high traffic, creating a predictable focal point.',
    backstory: 'Apex bets that consumers shop most on payday Fridays, even at the risk of scheduling collisions.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Friday Preference', value: 75, color: 'bg-amber-500' },
      { label: 'Focal Point Bias', value: 80, color: 'bg-blue-500' },
      { label: 'Pattern Uniformity', value: 30, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'Friday is prime shopping day. Will you dare to clash with me?',
    decide: () => {
      const roll = Math.random();
      const pick = roll < 0.60 ? 'Friday' : roll < 0.80 ? 'Wednesday' : 'Monday';
      return {
        action: pick,
        rationale: `Peak traffic scheduling: Targeted ${pick} (60% weight on Friday retail volume).`
      };
    }
  },
  {
    id: 'anti_pattern_shifter',
    gameId: 4,
    name: 'Shift (Anti-Pattern Tracker)',
    avatar: '🔄',
    title: 'Adaptive Day Shifter',
    tagline: 'Anticipates player day preferences and swerves to an open calendar slot.',
    strategySummary: 'Avoids whichever day was chosen last to guarantee a separate retail window.',
    backstory: 'Shift tracks competitor calendars and actively dodges clashing days.',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/40',
    badgeBorder: 'border-cyan-700/60',
    gauges: [
      { label: 'Collision Avoidance', value: 90, color: 'bg-cyan-500' },
      { label: 'Adaptive Tracking', value: 85, color: 'bg-blue-500' },
      { label: 'Minimax Precision', value: 70, color: 'bg-purple-500' }
    ],
    getAnticipationThought: () => 'I am looking for the emptiest day on the retail calendar.',
    decide: ({ history }) => {
      const lastPick = history.length > 0 ? history[history.length - 1].playerAction : null;
      const options = ['Monday', 'Wednesday', 'Friday'].filter(d => d !== lastPick);
      const pick = options[Math.floor(Math.random() * options.length)];
      return {
        action: pick,
        rationale: `Anti-collision targeting: Selected ${pick} to avoid your previous promotion window.`
      };
    }
  }
];

// -------------------------------------------------------------
// 17. ENTRY DETERRENCE & STRATEGIC COMMITMENT BOTS (Game 5)
// -------------------------------------------------------------
export const ENTRY_DETERRENCE_BOTS: GameSpecificBot[] = [
  {
    id: 'credible_incumbent',
    gameId: 5,
    name: 'Fortress (Sunk Cost Deterrent)',
    avatar: '🏰',
    title: 'Irreversible Commitment Incumbent',
    tagline: 'Always Commits irreversible capacity to make retaliation credible and deter entry.',
    strategySummary: 'As Incumbent, burns flexibility and commits capital. Rivals calculate that entering leads to a price war (-2) and stay out (0).',
    backstory: 'Fortress follows Thomas Schelling strategic commitment doctrine: sinking costs turns empty threats into credible deterrence.',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/40',
    badgeBorder: 'border-indigo-700/60',
    gauges: [
      { label: 'Commitment Credibility', value: 100, color: 'bg-indigo-500' },
      { label: 'Deterrence Success', value: 95, color: 'bg-emerald-500' },
      { label: 'Flexibility', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'An irreversible commitment removes all temptation to back down.',
    decide: () => ({
      action: 'Commit',
      rationale: 'Strategic Commitment: Invested heavily in irreversible capacity to credibly deter rival entry (+4 monopoly payoff).'
    })
  },
  {
    id: 'rational_rival_entrant',
    gameId: 5,
    name: 'Scout (SPNE Entrant)',
    avatar: '🧭',
    title: 'Subgame Perfect Challenger',
    tagline: 'Enters if Incumbent stays flexible (+2 duopoly), but stays out if Incumbent commits (avoids -2 war).',
    strategySummary: 'Backward induction response: respects credible commitment, but ruthlessly enters when the incumbent stays flexible.',
    backstory: 'Scout calculates payoff trees coldly. He will never fight a committed incumbent with excess capacity.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Backward Induction', value: 100, color: 'bg-emerald-500' },
      { label: 'Risk Discipline', value: 90, color: 'bg-blue-500' },
      { label: 'Bluff Susceptibility', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'Did you actually sink the capital, or is your threat a bluff?',
    decide: ({ history }) => {
      const incumbentAction = history.length > 0 ? history[history.length - 1].playerAction : 'Commit';
      if (incumbentAction === 'Commit') {
        return {
          action: 'Stay Out',
          rationale: 'Incumbent committed capacity: Entering causes a price war (-2 pts). Staying out yields 0 pts (SPNE outcome).'
        };
      }
      return {
        action: 'Enter',
        rationale: 'Incumbent stayed flexible: Accommodating entry is incumbent best response. Entering yields +2 duopoly profit!'
      };
    }
  },
  {
    id: 'reckless_challenger',
    gameId: 5,
    name: 'Goliath (Aggressive Entrant)',
    avatar: '🥊',
    title: 'War of Attrition Challenger',
    tagline: 'Always enters regardless of commitment to test whether the incumbent will really fight.',
    strategySummary: 'Enters even against committed incumbents, gambling that mutual pain will force concession.',
    backstory: 'Goliath ignores backward induction and enters to trigger high-stakes brinkmanship.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Aggression', value: 95, color: 'bg-rose-500' },
      { label: 'Threat Defiance', value: 100, color: 'bg-amber-500' },
      { label: 'Rational Restraint', value: 10, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'I will enter anyway and call your price war bluff.',
    decide: () => ({
      action: 'Enter',
      rationale: 'Aggressive Challenge: Entered the market despite risks to force market sharing or mutual fight.'
    })
  }
];

// -------------------------------------------------------------
// 18. FIRST-PRICE SEALED-BID AUCTION BOTS (Game 8)
// -------------------------------------------------------------
export const FIRST_PRICE_AUCTION_BOTS: GameSpecificBot[] = [
  {
    id: 'bayes_nash_shader',
    gameId: 8,
    name: 'Nash Shader (Bayes-Nash Rationalist)',
    avatar: '📐',
    title: 'Equilibrium Bid Shader',
    tagline: 'Bids exactly (N-1)/N of private valuation. For N=2, b*(v) = v / 2.',
    strategySummary: 'In a symmetric uniform first-price auction with 2 bidders, bidding half your valuation maximizes expected surplus (Win Prob * Margin).',
    backstory: 'Nash Shader balances the tradeoff: bidding higher increases win probability, but reduces profit upon winning.',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-950/40',
    badgeBorder: 'border-sky-700/60',
    gauges: [
      { label: 'Equilibrium Shading', value: 100, color: 'bg-sky-500' },
      { label: 'Winner Curse Avoidance', value: 95, color: 'bg-emerald-500' },
      { label: 'Overbidding Bias', value: 0, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'In a first-price auction, bidding your true value earns $0 profit. Shading is essential.',
    decide: ({ botValuation = 6 }) => {
      const bid = Math.round((botValuation / 2) * 10) / 10;
      return {
        action: bid,
        rationale: `Bayes-Nash Equilibrium Bid: Valued item at $${botValuation}. Shaded bid to $${bid} (50% rule for N=2).`
      };
    }
  },
  {
    id: 'winners_curse_risk',
    gameId: 8,
    name: 'Maximus (Aggressive Winner)',
    avatar: '💸',
    title: 'Overbidding Competitor',
    tagline: 'Bids 80-90% of valuation to ensure victory, suffering Winner Curse in common value settings.',
    strategySummary: 'Shades very little (b = 0.85 * v), winning frequently but with razor-thin margins.',
    backstory: 'Maximus hates losing auctions. He bids aggressively, frequently falling prey to winner curse.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Win Priority', value: 95, color: 'bg-rose-500' },
      { label: 'Winner Curse Risk', value: 90, color: 'bg-amber-500' },
      { label: 'Margin Protection', value: 20, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'I want that prize and will bid high enough to beat you.',
    decide: ({ botValuation = 7 }) => {
      const bid = Math.round((botValuation * 0.85) * 10) / 10;
      return {
        action: bid,
        rationale: `Aggressive bid: Valued at $${botValuation}, submitted high bid of $${bid} to secure win.`
      };
    }
  },
  {
    id: 'discount_sniper',
    gameId: 8,
    name: 'Bargain Hunter (Heavy Shader)',
    avatar: '🎯',
    title: 'Deep Margin Maximizer',
    tagline: 'Bids only 30-35% of valuation, winning rarely but enjoying huge margins when successful.',
    strategySummary: 'Shades heavily (b = 0.35 * v) to protect deep profit margins.',
    backstory: 'Bargain Hunter treats auctions as discount bins. If she cannot win at a steal, she walks away.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Margin Priority', value: 95, color: 'bg-amber-500' },
      { label: 'Win Frequency', value: 25, color: 'bg-slate-600' },
      { label: 'Disciplined Patience', value: 90, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () => 'I only buy if the profit margin is enormous.',
    decide: ({ botValuation = 8 }) => {
      const bid = Math.round((botValuation * 0.35) * 10) / 10;
      return {
        action: bid,
        rationale: `Deep discount bid: Valued at $${botValuation}, bid low at $${bid} to seek massive surplus.`
      };
    }
  }
];

// -------------------------------------------------------------
// 19. SPLIT-THE-PIE BARGAINING BOTS (Game 9: Nash Demand & Outside Options)
// -------------------------------------------------------------
export const SPLIT_PIE_DEMAND_BOTS: GameSpecificBot[] = [
  {
    id: 'fair_split_50_50',
    gameId: 9,
    name: 'Justice (50/50 Focal Point)',
    avatar: '⚖️',
    title: 'Egalitarian Demander',
    tagline: 'Demands exactly 5 points (50% of the 10-point pie).',
    strategySummary: 'Plays the Schelling focal point and Nash Bargaining Solution of 5 pts. If you demand <= 5, agreement succeeds.',
    backstory: 'Justice anchors on fairness. 50-50 splits are the unique symmetric focal point in human bargaining.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-700/60',
    gauges: [
      { label: 'Fairness Focal Point', value: 100, color: 'bg-emerald-500' },
      { label: 'Greed Restraint', value: 95, color: 'bg-blue-500' },
      { label: 'Outside Option Reliance', value: 10, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'The 5-5 split is the most natural coordination equilibrium.',
    decide: () => ({
      action: 5,
      rationale: 'Symmetric Nash Bargaining: Demanded 5 points (half of 10). If you demand 5 or less, we both prosper.'
    })
  },
  {
    id: 'greedy_claimant',
    gameId: 9,
    name: 'Maximus (Hard Bargainer)',
    avatar: '🦁',
    title: 'Aggressive Claimant',
    tagline: 'Demands 7 points, forcing you to accept 3 points or trigger outside options (1 pt).',
    strategySummary: 'Tests whether you will accommodate an asymmetric split rather than collapse the deal into outside options.',
    backstory: 'Maximus knows that 3 points is still better than your outside option of 1 point.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Claim Aggression', value: 85, color: 'bg-amber-500' },
      { label: 'Outside Option Threat', value: 90, color: 'bg-rose-500' },
      { label: 'Concession Willingness', value: 15, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'You will take 3 points because 3 is better than your outside option of 1.',
    decide: () => ({
      action: 7,
      rationale: 'Hardball demand: Demanded 7 points. You must demand 3 or less to avoid deal collapse.'
    })
  },
  {
    id: 'modest_conceder',
    gameId: 9,
    name: 'Pax (Accommodating Partner)',
    avatar: '🕊️',
    title: 'Safety Satisficer',
    tagline: 'Demands only 3 or 4 points to ensure total demands never exceed 10.',
    strategySummary: 'Leaves 6 to 7 points on the table for you to guarantee an agreement.',
    backstory: 'Pax fears deal breakdown and outside option misery. She prioritizes agreement over peak share.',
    color: 'text-teal-400',
    badgeBg: 'bg-teal-950/40',
    badgeBorder: 'border-teal-700/60',
    gauges: [
      { label: 'Agreement Priority', value: 95, color: 'bg-teal-500' },
      { label: 'Risk Aversion', value: 90, color: 'bg-blue-500' },
      { label: 'Greed', value: 20, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'I leave plenty of room so our total demands do not exceed 10.',
    decide: () => ({
      action: 3.5,
      rationale: 'Accommodating demand: Demanded 3.5 points, leaving 6.5 points available to guarantee agreement.'
    })
  }
];

// -------------------------------------------------------------
// 20. COSTLY SIGNALING & ASYMMETRIC INFORMATION BOTS (Game 10)
// -------------------------------------------------------------
export const COSTLY_SIGNALING_BOTS: GameSpecificBot[] = [
  {
    id: 'spence_auditor',
    gameId: 10,
    name: 'Veritas (Separating Auditor)',
    avatar: '🔬',
    title: 'Spence Credential Auditor',
    tagline: 'Trusts if and only if the seller sent a costly signal. Single-crossing property separates types.',
    strategySummary: 'Separating equilibrium strategy: knows that low-quality sellers cannot afford the signal cost ($5 vs $2). Trusts signaled goods, rejects unsignaled goods.',
    backstory: 'Veritas applies Michael Spence signaling model: signals are credible solely because high-quality types bear lower costs.',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/40',
    badgeBorder: 'border-indigo-700/60',
    gauges: [
      { label: 'Separating Equilibrium', value: 100, color: 'bg-indigo-500' },
      { label: 'Single-Crossing Adherence', value: 100, color: 'bg-emerald-500' },
      { label: 'Cheap Talk Immunity', value: 100, color: 'bg-blue-500' }
    ],
    getAnticipationThought: () => 'Talk is cheap. Only an investment that costs low-quality types more is believable.',
    decide: ({ history }) => {
      const didSignal = history.length > 0 ? history[history.length - 1].playerAction === 'Yes (Costly)' : true;
      if (didSignal) {
        return {
          action: 'Trust',
          rationale: 'Seller sent costly signal: High-quality types face lower cost. Separating equilibrium confirmed -> Trust!'
        };
      }
      return {
        action: "Don't Trust",
        rationale: 'No costly signal sent: Without verification, lemons crowd out high quality (Akerlof effect) -> Do Not Trust.'
      };
    }
  },
  {
    id: 'lemon_cynic',
    gameId: 10,
    name: 'Cynic (Lemon Market Skeptic)',
    avatar: '🛡️',
    title: 'Adverse Selection Avoider',
    tagline: 'High skepticism. Only trusts with a costly signal, and even then verifies quality rigorously.',
    strategySummary: 'Expects adverse selection everywhere. Never trusts unsignaled sellers.',
    backstory: 'Cynic was burned in used car markets. Without certified warranties, he assumes everything is a lemon.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-700/60',
    gauges: [
      { label: 'Skepticism', value: 95, color: 'bg-rose-500' },
      { label: 'Adverse Selection Fear', value: 90, color: 'bg-amber-500' },
      { label: 'Trust Propensity', value: 25, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'Used car markets collapse into lemons if buyers are gullible.',
    decide: ({ history }) => {
      const didSignal = history.length > 0 ? history[history.length - 1].playerAction === 'Yes (Costly)' : false;
      if (didSignal && Math.random() < 0.85) {
        return {
          action: 'Trust',
          rationale: 'Costly warranty verified. Reluctantly trusting the certified seller.'
        };
      }
      return {
        action: "Don't Trust",
        rationale: 'Unverified offering: Refusing to buy to avoid the lemon market trap.'
      };
    }
  },
  {
    id: 'credulous_buyer',
    gameId: 10,
    name: 'Optimist (Credulous Buyer)',
    avatar: '🌟',
    title: 'Goodwill Presumer',
    tagline: 'Frequently trusts even without costly signals, vulnerable to low-quality pooling exploitation.',
    strategySummary: 'Trusts 75% of the time, allowing low-quality sellers to sell lemons without paying for certification.',
    backstory: 'Optimist believes in general goodwill, making him the target of opportunistic sellers in pooling equilibria.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-700/60',
    gauges: [
      { label: 'Credulity', value: 85, color: 'bg-amber-500' },
      { label: 'Pooling Vulnerability', value: 90, color: 'bg-rose-500' },
      { label: 'Auditing Rigor', value: 15, color: 'bg-slate-600' }
    ],
    getAnticipationThought: () => 'I hope sellers are honest even without costly certificates.',
    decide: () => {
      const trusts = Math.random() < 0.75;
      return {
        action: trusts ? 'Trust' : "Don't Trust",
        rationale: trusts
          ? 'Optimistic purchase: Trusted the seller based on initial goodwill.'
          : 'Cautious hesitation: Decided to pass on this transaction.'
      };
    }
  }
];

// Helper to retrieve the custom bot roster for any game
export function getBotsForGame(gameId: number): GameSpecificBot[] {
  switch (gameId) {
    case 1:
      return ONE_SHOT_PD_BOTS;
    case 2:
      return LAUNCH_WAIT_BOTS;
    case 3:
      return PRICE_COMPETITION_2X2_BOTS;
    case 4:
      return PROMOTION_TIMING_BOTS;
    case 5:
      return ENTRY_DETERRENCE_BOTS;
    case 6:
      return PD_BOTS;
    case 7:
      return AUCTION_BOTS;
    case 8:
      return FIRST_PRICE_AUCTION_BOTS;
    case 9:
      return SPLIT_PIE_DEMAND_BOTS;
    case 10:
      return COSTLY_SIGNALING_BOTS;
    case 11:
      return BEAUTY_BOTS;
    case 12:
      return PUBLIC_GOODS_BOTS;
    case 13:
      return STAG_BOTS;
    case 14:
      return BERTRAND_BOTS;
    case 15:
      return HAWK_DOVE_BOTS;
    case 16:
      return ULTIMATUM_BOTS;
    case 17:
      return MATCHING_PENNIES_BOTS;
    case 18:
      return BATTLE_OF_SEXES_BOTS;
    case 19:
      return TRUST_GAME_BOTS;
    case 20:
      return CENTIPEDE_BOTS;
    default:
      return PD_BOTS;
  }
}

// -------------------------------------------------------------
// Legacy Archetype Functions (Maintained for Backward Compatibility)
// -------------------------------------------------------------
export const BOT_PROFILES: Record<BotArchetype, any> = {
  RANDOM: PD_BOTS[0],
  GREEDY: PD_BOTS[2],
  RECIPROCAL: PD_BOTS[0],
  NASH: PD_BOTS[1]
};

export function decidePrisonersDilemma(archetype: BotArchetype, round: number, totalRounds: number, history: RoundHistoryEntry[]): BotDecision {
  const bot = archetype === 'GREEDY' ? PD_BOTS[2] : archetype === 'RECIPROCAL' ? PD_BOTS[0] : archetype === 'NASH' ? PD_BOTS[1] : PD_BOTS[3];
  return bot.decide({ round, totalRounds, history });
}

export function decideStagHunt(archetype: BotArchetype, round: number, history: RoundHistoryEntry[]): BotDecision {
  const bot = archetype === 'GREEDY' ? STAG_BOTS[1] : archetype === 'RECIPROCAL' ? STAG_BOTS[0] : STAG_BOTS[2];
  return bot.decide({ round, totalRounds: 5, history });
}

export function decideBertrandCompetition(archetype: BotArchetype, round: number, history: RoundHistoryEntry[]): BotDecision {
  const bot = archetype === 'GREEDY' ? BERTRAND_BOTS[1] : archetype === 'RECIPROCAL' ? BERTRAND_BOTS[0] : BERTRAND_BOTS[2];
  return bot.decide({ round, totalRounds: 5, history });
}

export function decideBeautyContest(archetype: BotArchetype, round: number, history: RoundHistoryEntry[]): BotDecision {
  const bot = archetype === 'GREEDY' ? BEAUTY_BOTS[1] : archetype === 'RECIPROCAL' ? BEAUTY_BOTS[2] : archetype === 'NASH' ? BEAUTY_BOTS[3] : BEAUTY_BOTS[0];
  return bot.decide({ round, totalRounds: 5, history });
}

export function decideVickreyAuction(archetype: BotArchetype, botValuation: number): BotDecision {
  const bot = archetype === 'GREEDY' ? AUCTION_BOTS[1] : archetype === 'RECIPROCAL' ? AUCTION_BOTS[2] : AUCTION_BOTS[0];
  return bot.decide({ round: 1, totalRounds: 5, history: [], botValuation });
}

export function decidePublicGoods(archetype: BotArchetype, round: number, history: RoundHistoryEntry[]): BotDecision {
  const bot = archetype === 'GREEDY' ? PUBLIC_GOODS_BOTS[0] : archetype === 'RECIPROCAL' ? PUBLIC_GOODS_BOTS[2] : PUBLIC_GOODS_BOTS[1];
  return bot.decide({ round, totalRounds: 5, history });
}
