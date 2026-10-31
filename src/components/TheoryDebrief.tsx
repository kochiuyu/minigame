import React from 'react';
import { BotArchetype, BOT_PROFILES, GameSpecificBot } from '../services/botEngine';
import { MathFormula, FormattedMathText } from './MathFormula';
import { GlossaryTerm, AnnotateGlossaryText, formatUnit, pluralWord } from './GlossaryTerm';

export interface DebriefData {
  gameTitle: string;
  gameId: number;
  botInfo: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    color: string;
    tagline?: string;
  };
  botArchetype?: BotArchetype;
  playerTotalScore: number;
  botTotalScore: number;
  nashBenchmarkScore: number;
  paretoOptimumScore: number;
  roundCount: number;
  roundsSummary: Array<{
    round: number;
    playerAction: any;
    botAction: any;
    playerPayoff: number;
    botPayoff: number;
    botRationale: string;
    playerValuation?: number;
    botValuation?: number;
  }>;
}

interface TheoryDebriefProps {
  data: DebriefData;
  availableBots?: GameSpecificBot[];
  onOpenWhatIfSandbox: (gameId: number) => void;
  onRestartExperiment: () => void;
  onChangeBot: (botId: string) => void;
}

export const TheoryDebrief: React.FC<TheoryDebriefProps> = ({
  data,
  availableBots = [],
  onOpenWhatIfSandbox,
  onRestartExperiment,
  onChangeBot
}) => {
  const botProfile = data.botInfo || (data.botArchetype ? BOT_PROFILES[data.botArchetype] : BOT_PROFILES.RECIPROCAL);

  // Calculate efficiency percentage relative to Pareto optimum
  const efficiency = Math.min(
    100,
    Math.max(0, Math.round((data.playerTotalScore / (data.paretoOptimumScore || 1)) * 100))
  );

  // Dynamic educational content based on gameId
  const getGameTheoryInsights = () => {
    switch (data.gameId) {
      case 1:
        return {
          concept: "Dominant Strategies & The Prisoner's Dilemma Trap",
          formula: "U_i(\\text{Defect} \\mid s_{-i}) > U_i(\\text{Cooperate} \\mid s_{-i}) \\quad \\forall s_{-i}",
          keyFinding:
            "Because Defect strictly dominates Cooperate (yielding 3 > 2 against Cooperate and 1 > 0 against Defect), rational self-interest drives both players to defect, even though mutual cooperation (+2 each) Pareto-dominates mutual defection (+1 each).",
          caseStudy: "The Cold War Arms Race: The US and Soviet Union both spent vast resources stockpiling warheads; unilateral disarmament carried lethal risk (0 pts), but mutual armament left both sides impoverished and less secure (1 pt each).",
          rulesSummary: [
            "Strict Dominance: Defecting yields a strictly higher payoff regardless of whether the opponent cooperates or defects.",
            "Nash Equilibrium: (Defect, Defect) is the unique Nash equilibrium yielding ($1, $1).",
            "Pareto Inefficiency: The equilibrium outcome is socially inefficient; both players strictly prefer ($2, $2), but defection remains the dominant temptation."
          ]
        };
      case 6:
        return {
          concept: "The Folk Theorem & The Power of Reciprocity",
          formula: "U_i(Defect | Cooperate) = 3 > U_i(Cooperate | Cooperate) = 2",
          keyFinding:
            data.botArchetype === 'RECIPROCAL'
              ? "Because Tit-for-Tat forgives and rewards cooperation, sustained mutual cooperation yielded higher cumulative payoffs than endless mutual defection."
              : data.botArchetype === 'GREEDY'
              ? "When facing an unconditional defector, your best response was forced to become Defect as well, locking both players into the suboptimal Nash trap ($1 each)."
              : "Against an equilibrium solver under backward induction, the finite horizon unravels trust from the final round backwards.",
          caseStudy: "OPEC Oil Cartels: Member nations agree on production caps to sustain high oil prices, but each individual country faces a short-term temptation to pump excess barrels.",
          rulesSummary: [
            "Dominant Strategy: In a single round, Defect yields strictly higher payoff regardless of opponent choice.",
            "Nash Equilibrium: (Defect, Defect) yields ($1, $1), which is Pareto-dominated by (Cooperate, Cooperate) ($2, $2).",
            "Repeated Game Horizon: Mutual trust can be sustained in infinite or probabilistic horizons when the discount factor δ ≥ (T - R)/(T - P)."
          ]
        };
      case 11:
        return {
          concept: "Level-k Strategic Depth & Keynesian Beauty Contests",
          formula: "x^* = \\left(\\frac{2}{3}\\right)^k \\times 50 \\xrightarrow{k \\to \\infty} 0",
          keyFinding:
            "A winning guess requires anticipating not the true mathematical optimum (0), but the actual cognitive depth of the cohort. Level-0 guesses 50, Level-1 guesses 33, Level-2 guesses 22.",
          caseStudy: "Stock Market Speculation: As John Maynard Keynes observed, professional investors do not judge assets by intrinsic value, but by what average opinion expects average opinion to be.",
          rulesSummary: [
            "Iterated Elimination: Any guess > 66.7 is strictly dominated because 2/3 of maximum 100 is 66.7.",
            "Convergence: Eliminating dominated numbers iteratively drives the unique Nash Equilibrium to 0.",
            "Behavioral Gap: Real human populations rarely exceed Level-2 reasoning (typical winning classroom guesses are 20-25)."
          ]
        };
      case 7:
        return {
          concept: "Dominant Strategy Incentive Compatibility in Vickrey Auctions",
          formula: "\\text{Clearing Price} = \\max_{j \\neq i} b_j, \\quad \\Pi_i = v_i - \\max_{j \\neq i} b_j",
          keyFinding:
            "In a Second-Price Sealed-Bid auction, bidding your exact valuation (b_i = v_i) weakly dominates all other bids. Overbidding risks negative profit; underbidding risks missing profitable wins.",
          caseStudy: "Google & eBay Ad Auctions: Google's sponsored search auctions and eBay's automated proxy bidding are engineered around second-price mechanics to induce truthful bidding.",
          rulesSummary: [
            "Decoupled Price: Your bid determines WHETHER you win, but NOT the price you pay.",
            "Weakly Dominant: For any competitor bids, b = v gives payoff at least as high as b > v or b < v.",
            "Winner's Curse Avoidance: Truthful bidding prevents overpaying when estimates are noisy."
          ]
        };
      case 13:
        return {
          concept: "Payoff Dominance vs. Risk Dominance in Coordination Games",
          formula: "\\text{Nash}_1 = (\\text{Stag}, \\text{Stag}) \\; [10, 10], \\quad \\text{Nash}_2 = (\\text{Hare}, \\text{Hare}) \\; [4, 4]",
          keyFinding:
            data.botArchetype === 'RECIPROCAL'
              ? "Because Tit-for-Tat signaled trust with Stag on Round 1, you successfully coordinated on the Pareto-superior social maximum (+10 points each)."
              : data.botArchetype === 'GREEDY'
              ? "The Risk-Averse Greedy bot refused to trust you and hunted Hare, punishing your Stag attempt with 0 points and driving coordination down to the safe (4, 4) equilibrium."
              : "In a Stag Hunt, both cooperation and safety are Nash equilibria. The outcome depends entirely on strategic assurance and trust.",
          caseStudy: "Technology Format Standards: Like Blu-ray vs. HD-DVD, consumers and studios must coordinate on the same format to reap benefits; fear of miscoordination creates market paralysis.",
          rulesSummary: [
            "Multiple Equilibria: Unlike Prisoner's Dilemma, mutual cooperation (Stag, Stag) IS an equilibrium that neither player wants to deviate from unilaterally.",
            "Payoff Dominance: (Stag, Stag) generates 2.5x more welfare than (Hare, Hare).",
            "Risk Dominance: Hunting Hare has zero strategic risk: you get +4 whether your partner cooperates or deserts you."
          ]
        };
      case 14:
        return {
          concept: "The Bertrand Paradox & Cutthroat Price Wars",
          formula: "P_1^* = P_2^* = MC = \\$10 \\implies \\Pi_1 = \\Pi_2 = \\$0",
          keyFinding:
            data.botArchetype === 'GREEDY'
              ? "The Undercutting bot drove a relentless price war down to marginal cost ($10), triggering the classic Bertrand Paradox where profits evaporate."
              : data.botArchetype === 'RECIPROCAL'
              ? "By matching monopoly pricing ($40), you achieved tacit collusion and shared massive industry profits ($900+ points)."
              : "In homogeneous duopoly with price competition, just two competitors are enough to replicate perfectly competitive prices.",
          caseStudy: "Airline Ticket Price Wars: Algorithmic fare scrapers continuously undercut rival fares by $1, driving ticket prices down to marginal fuel costs unless capacity is constrained.",
          rulesSummary: [
            "Discontinuous Demand: Selling at $0.50 below rival captures 100% of market demand.",
            "Bertrand Paradox: Even with only 2 firms, price competition forces price down to marginal cost ($P = MC$).",
            "Tacit Collusion: Cooperative pricing ($P = $40) is fragile and requires mutual discipline and swift punishment of undercutting."
          ]
        };
      case 12:
        return {
          concept: "Public Goods Dilemma & Marginal Per-Capita Return (MPCR)",
          formula: "\\text{MPCR} = \\frac{1.6}{2} = 0.8 < 1.0 \\quad (\\text{Nash} = 0, \\text{Social Optimum} = 20 \\text{ tokens} \\implies 32 \\text{ pts})",
          keyFinding:
            data.botArchetype === 'GREEDY'
              ? "The Greedy Free-Rider contributed 0 tokens, pocketing their full private endowment while capturing 80% dividends on your public contributions."
              : "When players reciprocate, public contributions multiply group welfare by 160%, achieving the Pareto-efficient cooperative frontier.",
          caseStudy: "Global Climate Treaties: Reducing carbon emissions benefits the entire global biosphere, but individual nations pay 100% of the abatement cost while receiving only a fraction of the climate dividend.",
          rulesSummary: [
            "Individual Dominance: Since each token placed in public returns only 0.80 points to the contributor (1.6x / 2 players), individual rationality dictates contributing 0.",
            "Collective Tragedy: If everyone follows individual rationality, all earn 20 points. If everyone cooperates, all earn 32 points.",
            "Conditional Cooperation: Human societies enforce contributions through peer punishment, social reputation, and transparent audits."
          ]
        };
      case 15:
        return {
          concept: "Evolutionarily Stable Strategies (ESS) & The Game of Chicken",
          formula: "p^*(\\text{Hawk}) = \\frac{V}{C} = \\frac{3}{13} \\approx 23\\%, \\quad \\Pi(\\text{Hawk}, \\text{Hawk}) = -10",
          keyFinding:
            data.botInfo?.id === 'maynard_hawk'
              ? "Against an unyielding Hawk committed to brinkmanship, your optimal best response was to swerve with Dove (0 pts), avoiding catastrophic mutual destruction (-10 pts)."
              : data.botInfo?.id === 'pax_dove'
              ? "Because Pax always played peaceful Dove, you could aggressively exploit with Hawk (+6 pts) or coordinate peacefully with Dove (+3 pts)."
              : "In Hawk-Dove, mutual aggression leads to catastrophe (-10, -10). The unique symmetric mixed-strategy Nash equilibrium requires randomizing Hawk with probability p = 23%.",
          caseStudy: "The 1962 Cuban Missile Crisis: Kennedy and Khrushchev engaged in nuclear brinkmanship, escalating tension until one superpower blinked and conceded to avert mutual thermonuclear destruction.",
          rulesSummary: [
            "Anti-Coordination: Unlike Prisoner's Dilemma, you want to do the OPPOSITE of your rival: if they Hawk, play Dove; if they Dove, play Hawk.",
            "Pure Equilibria: Two asymmetric Nash equilibria: (Hawk, Dove) [6, 0] and (Dove, Hawk) [0, 6].",
            "Evolutionarily Stable Strategy: When contest cost exceeds value (C > V), a pure population of Hawks cannot survive, giving rise to mixed ESS."
          ]
        };
      case 9:
      case 16:
        return {
          concept: "Subgame Perfection vs. Empirical Inequity Aversion (Fehr-Schmidt)",
          formula: "U_i = x_i - \\alpha_i \\max(x_j - x_i, 0) - \\beta_i \\max(x_i - x_j, 0), \\quad \\text{SPNE: Offer } \\epsilon > 0",
          keyFinding:
            data.botInfo?.id === 'equity_enforcer'
              ? "Justitia rejected offers below $4.50, demonstrating how egalitarian norms destroy economic surplus to punish unequal distribution."
              : data.botInfo?.id === 'homo_economicus'
              ? "Homo Economicus accepted any positive amount, proving the subgame-perfect prediction where rational self-interest accepts crumbs over zero."
              : "Across global laboratory experiments, human responders routinely veto proposals below $3.00, proving that human utility incorporates fairness and spiteful punishment of greed.",
          caseStudy: "Union Collective Bargaining & Strikes: Labor unions will stage prolonged, costly strikes (burning millions in wages and profits) rather than accept what workers perceive as an insulting, unfair wage offer.",
          rulesSummary: [
            "Subgame Perfect Nash: A rational responder accepts any positive offer (x > 0); the proposer should offer the minimum positive sum and keep the rest.",
            "Behavioral Rejection: Responders routinely reject offers under 30% of the pie, sacrificing personal earnings to penalize perceived greed.",
            "Inequity Aversion: Human decision-makers experience psychological disutility from disadvantageous inequality (alpha parameter in Fehr-Schmidt model)."
          ]
        };
      case 17:
        return {
          concept: "Minimax Theorem & Mixed-Strategy Nash Equilibrium",
          formula: "\\Pi_1(p, q) = 2pq + 2(1-p)(1-q) \\implies p^* = q^* = \\frac{1}{2}, \\quad v^* = 1.0",
          keyFinding:
            data.botInfo?.id === 'von_neumann_minimax'
              ? "Against pure von Neumann randomization (p = 0.5), no strategic pattern or psychic guessing could alter your expected payoff of 1.0 pt per round."
              : data.botInfo?.id === 'ada_pattern_hunter'
              ? "Ada exploited human cognitive biases (such as the gambler's fallacy or repeat-after-win tendencies), anticipating your move and forcing mismatches."
              : "In Matching Pennies, zero pure-strategy equilibria exist. Randomizing with exact 50/50 probability is the unique minimax solution that renders your play unexploitable.",
          caseStudy: "Penalty Kicks in Elite Football: Empirical econometric studies of FIFA penalty shootouts (Palacios-Huerta, 2003) show that world-class strikers and goalkeepers randomize kicking left vs. right in exact alignment with mixed-strategy Nash equilibrium to prevent anticipation.",
          rulesSummary: [
            "Zero Pure Equilibria: In every cell of the matrix, the losing player has an immediate unilateral incentive to switch choices.",
            "Indifference Principle: At a mixed-strategy Nash equilibrium, your probability mixture makes your opponent indifferent between all their pure actions.",
            "Minimax Security: Playing p = 0.5 guarantees your security level regardless of how brilliant or devious the opponent's strategy is."
          ]
        };
      case 18:
        return {
          concept: "Multiple Equilibria, Strategic Commitment & Turn-Taking",
          formula: "\\text{Pure}_1 = (\\text{Opera}, \\text{Opera}) \\; [3, 2], \\quad \\text{Pure}_2 = (\\text{Football}, \\text{Football}) \\; [2, 3], \\quad p^* = \\frac{3}{5}, \\; q^* = \\frac{2}{5}",
          keyFinding:
            data.botInfo?.id === 'cleo_turn_taker'
              ? "Cleo's alternating turn-taking achieved fair egalitarian efficiency: alternating between Opera and Football yielded an average payoff of 2.5 pts each without a single clash."
              : data.botInfo?.id === 'boris_stalwart'
              ? "Boris demonstrated the immense power of commitment: by refusing to budge from Football, he forced you to either concede (+2) or take zero in a spiteful crash."
              : "In Battle of the Sexes, both players desire coordination, but disagree on which equilibrium to select. Without communication, mixed strategies produce frequent, painful miscoordination clashes.",
          caseStudy: "Tech Compatibility & Charging Standards: When tech giants like Apple and the EU negotiated standard USB-C connectors, both agreed universal standards benefit consumers, but disputes centered on whose proprietary design should prevail.",
          rulesSummary: [
            "Coordination with Conflict: Unlike pure coordination (where players agree on favorite outcome), players here have opposing preferences over multiple equilibria.",
            "Commitment Advantage: Burning bridges or publicly committing first forces the rival to play the best response that accommodates your preference.",
            "Turn-Taking Conventions: In repeated games, social norms like alternating turns achieve symmetric Pareto-efficient outcomes."
          ]
        };
      case 19:
        return {
          concept: "Berg-Dickhaut-McCabe Trust & Behavioral Reciprocity",
          formula: "\\text{SPNE: } X^* = 0, \\; Y^*(X) = 0 \\implies \\Pi_1 = 10, \\; \\Pi_2 = 0 \\quad (\\text{Social Max: } X = 10, \\; Y = 15 \\implies \\Pi_1 = 15, \\; \\Pi_2 = 15)",
          keyFinding:
            data.botInfo?.id === 'gage_fair_reciprocator'
              ? "Gage returned 50% of the tripled investment (1.5x), proving how mutual trust and reciprocity unlock the full 30-token social optimum (15 pts each)."
              : data.botInfo?.id === 'silas_selfish_trustee'
              ? "Silas demonstrated textbook Homo Economicus: in single-shot backward induction, a selfish trustee returns $0, penalizing the vulnerable investor."
              : "Across thousands of laboratory trust experiments, humans send over 50% of their endowment, and trustees reciprocate enough to generate positive returns for both parties.",
          caseStudy: "Angel Venture Capital: Seed-stage startup investing is fundamentally a real-world Trust Game. Angels wire millions of dollars to founders before product-market fit; high social trust and reputational reciprocity enable startup innovation.",
          rulesSummary: [
            "Backward Induction (SPNE): Selfish rationality predicts zero trust (X = 0), leaving the investor with 10 pts and trustee with 0 pts (total joint payoff 10 pts).",
            "Social Maximum: Sending all 10 pts triples capital to 30 pts (total joint payoff 30 pts); with a fair 50/50 return, both players receive 15 pts each.",
            "Reciprocal Norms: Real markets and laboratory interactions rely on social trust, guilt aversion, and mutual fairness to overcome the zero-trust trap."
          ]
        };
      case 20:
        return {
          concept: "Backward Induction & Rosenthal's Centipede Paradox",
          formula: "\\text{SPNE: } s_1^* = \\text{Take at } N_1 \\implies (2, 0) \\quad \\text{vs.} \\quad \\text{Social Optimum: } (8, 8)",
          keyFinding:
            data.botInfo?.id === 'always_defect_centipede'
              ? "Zero executed textbook backward induction: defecting at his very first opportunity (Node 2) to claim 4 pts (leaving you with 1 pt), validating the cold Subgame Perfect Nash Equilibrium (SPNE)."
              : data.botInfo?.id === 'tit_for_tat_centipede'
              ? "Echo reciprocated your trust by passing at earlier nodes to grow the collective pot, allowing you to reach advanced nodes and multiply wealth 4x beyond the SPNE prediction!"
              : "Backward induction predicts that rational self-interest unravels from the final terminal node back to Node 1, ending the game immediately for (2, 0). Yet real human experiments (McKelvey & Palfrey, 1992) show players routinely Pass, generating massive mutual gains.",
          caseStudy: "Venture Capital Milestone Tranches: In high-growth startups, investors do not deploy $50M on Day 1. Instead, they release capital sequentially in tranches (Seed -> Series A -> Series B). Each milestone passed increases valuation and mutual surplus, relying on sequential reciprocal trust rather than immediate liquidation.",
          rulesSummary: [
            "Subgame Perfect Unraveling: At Node 6, Bot takes (8 > 7). Anticipating this, Player takes at Node 5 (6 > 5). This logic ripples all the way back to Node 1, predicting an immediate (2, 0) exit.",
            "Rosenthal's Paradox: The SPNE prediction is Pareto-dominated by almost every subsequent outcome in the game. Pure theoretical rationality yields the single worst collective outcome.",
            "Empirical Altruism & Bounded Rationality: Laboratory experiments find only ~7% of games end at Node 1. Real humans use altruism, quantal response (noise), or conditional trust to build huge mutual surpluses."
          ]
        };
      default:
        return {
          concept: "Game Theoretic Strategic Equilibrium",
          formula: "u_i(s_i^*, s_{-i}^*) \\ge u_i(s_i, s_{-i}^*) \\quad \\forall s_i",
          keyFinding: "The outcome of interaction depends on the strategic alignment of mutual best responses.",
          caseStudy: "Corporate price wars and strategic patent licensing.",
          rulesSummary: [
            "Strategic Interdependence: Your optimal decision depends directly on the choices of your rivals.",
            "Equilibrium Stability: At a Nash equilibrium, no player has a unilateral incentive to deviate."
          ]
        };
    }
  };

  const insights = getGameTheoryInsights();

  const getWholeMatchFrequencies = () => {
    const rounds = data.roundsSummary || [];
    const count = rounds.length || 1;
    const pScore = data.playerTotalScore ?? 0;
    const bScore = data.botTotalScore ?? 0;
    let equilibriumBenchmark = "";
    let studentFrequencies = "";
    let gapSentence = "";

    const getScoreCmp = (p: number, b: number, isDollar: boolean = false) => {
      const pStr = isDollar ? `$${Number(p.toFixed(2))}` : `${p}`;
      const bStr = isDollar ? `$${Number(b.toFixed(2))}` : `${b}`;
      if (p > b) {
        return `You outscored the bot ${pStr} to ${bStr}`;
      } else if (b > p) {
        return `The bot outscored you ${bStr} to ${pStr}`;
      } else {
        return `You tied with the bot ${pStr} to ${bStr}`;
      }
    };

    switch (data.gameId) {
      case 1:
      case 6: {
        const coop = rounds.filter(r => r.playerAction === 'Cooperate').length;
        const defect = count - coop;
        const pct = Math.round((coop / count) * 100);
        const scoreCmp = getScoreCmp(pScore, bScore, true);
        equilibriumBenchmark = `100% Defection / 0% Cooperate · SPNE Defection: $1.00/round each ($${(count * 1).toFixed(2)} each over ${formatUnit(count, 'round')}) vs Pareto Optimum: $2.00/round each ($${(count * 2).toFixed(2)} each over ${formatUnit(count, 'round')})`;
        studentFrequencies = `${coop}/${count} Cooperate (${pct}%) · ${defect}/${count} Defect (${100 - pct}%)`;
        if (pct <= 15) {
          gapSentence = pScore <= bScore
            ? `Close to equilibrium: ${scoreCmp}. You defected in ${100 - pct}% of rounds (cooperated in only ${pct}%), adhering closely to the SPNE dominant strategy, though mutual defection locked both of you into the low-payoff trap ($1.00/rd).`
            : `Close to equilibrium: ${scoreCmp}. You defected in ${100 - pct}% of rounds, following dominant strategy defection and capitalizing on ${botProfile.name}'s cooperative openings.`;
        } else if (pct <= 49) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. You cooperated in ${pct}% of rounds, but unilateral cooperative gestures were repeatedly exploited by defection.`
            : `Noticeable deviation: ${scoreCmp}. You cooperated in ${pct}% of rounds, earning points through selective reciprocity while avoiding prolonged defection feuds.`;
        } else {
          gapSentence = pScore < bScore
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You attempted high cooperation (${pct}% Cooperate), but ${botProfile.name} defected unsparingly against your goodwill.`
            : `Productive deviation from theory: ${scoreCmp}. By choosing Cooperate in ${pct}% of rounds rather than the 100% Defect SPNE prediction, you cultivated mutual reciprocity with ${botProfile.name}, generating mutual payoffs that substantially Pareto-dominated the SPNE defection trap.`;
        }
        break;
      }
      case 13: {
        const stag = rounds.filter(r => r.playerAction === 'Stag').length;
        const hare = count - stag;
        const pct = Math.round((stag / count) * 100);
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `Payoff-Dominant Nash: +10 pts/round each (${count * 10} pts over ${formatUnit(count, 'round')}) · Risk-Dominant Nash: +4 pts/round each (${count * 4} pts over ${formatUnit(count, 'round')})`;
        studentFrequencies = `${stag}/${count} Stag (${pct}%) · ${hare}/${count} Hare (${100 - pct}%)`;
        if (pct >= 80) {
          gapSentence = pScore < bScore
            ? `Close to equilibrium: ${scoreCmp}. You committed to the payoff-dominant Stag equilibrium in ${pct}% of rounds, but suffered miscoordination penalties when ${botProfile.name} retreated to safe Hare.`
            : `Close to equilibrium: ${scoreCmp}. You committed firmly to the payoff-dominant Stag equilibrium in ${pct}% of rounds, helped by mutual assurance and coordinated trust with ${botProfile.name}.`;
        } else if (pct <= 20) {
          gapSentence = pScore >= bScore
            ? `Close to equilibrium: ${scoreCmp}. You hunted safe Hare in ${100 - pct}% of rounds, adhering strictly to the risk-dominant safe Nash equilibrium (+4 pts/rd) to eliminate all vulnerability to betrayal.`
            : `Close to equilibrium: ${scoreCmp}. You locked into the risk-dominant Hare strategy (${100 - pct}%), securing safety but falling behind as ${botProfile.name} captured higher Stag returns.`;
        } else if (pct >= 35 && pct <= 65) {
          gapSentence = `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You split choices across Stag (${pct}%) and Hare (${100 - pct}%), as strategic hesitation and mutual miscoordination caused both players to oscillate between ambition and fear.`;
        } else {
          gapSentence = pScore >= bScore
            ? `Noticeable deviation: ${scoreCmp}. You chose Stag in ${pct}% of rounds, adapting effectively by hunting Stag when assurance was present and retreating to Hare when trust faltered.`
            : `Noticeable deviation: ${scoreCmp}. You chose Stag in ${pct}% of rounds, but uncoordinated switches caused you to waste turns hunting Stag alone.`;
        }
        break;
      }
      case 14: {
        const prices = rounds.map(r => Number(r.playerAction) || 0);
        const avg = Math.round(prices.reduce((a, b) => a + b, 0) / count);
        const undercut = rounds.filter(r => Number(r.playerAction) < Number(r.botAction)).length;
        const scoreCmp = getScoreCmp(pScore, bScore, true);
        equilibriumBenchmark = `Bertrand Nash: $0 profit/round ($0 over ${formatUnit(count, 'round')} at P = MC = $10.00) · Monopoly Collusion ($40): $450 profit/round each ($${count * 450} each over ${formatUnit(count, 'round')})`;
        studentFrequencies = `Average Price: $${avg}.00 · ${undercut}/${count} Undercut Wins`;
        if (avg <= 13) {
          gapSentence = pScore < bScore
            ? `Close to equilibrium: ${scoreCmp}. Your average price of $${avg}.00 was near marginal cost ($10), but ${botProfile.name} underpriced you on key rounds to capture all market demand.`
            : `Close to equilibrium: ${scoreCmp}. Your average price of $${avg}.00 was within $${avg - 10} of marginal cost ($10), reproducing the zero-profit Bertrand paradox where competitive undercutting wipes out economic margins.`;
        } else if (avg <= 26) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. Your average price of $${avg}.00 was midway between cost and monopoly, but ${botProfile.name} timed aggressive undercuts whenever you posted higher margins.`
            : `Noticeable deviation: ${scoreCmp}. Your average price of $${avg}.00 hovered midway between marginal cost ($10) and monopoly ($40), balancing price margins against market share capture.`;
        } else {
          gapSentence = pScore < bScore
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You attempted high collusive pricing ($${avg}.00 avg), but ${botProfile.name} undercut the cartel consistently to capture all demand.`
            : `Productive deviation from theory: ${scoreCmp}. Your average price of $${avg}.00 stood $${avg - 10} above marginal cost, demonstrating tacit collusion that generated joint profit while avoiding the cutthroat Bertrand trap.`;
        }
        break;
      }
      case 7: {
        const truthful = rounds.filter(r => Math.abs(Number(r.playerAction) - (r.playerValuation || 0)) < 0.01).length;
        const overbid = rounds.filter(r => Number(r.playerAction) > (r.playerValuation || 0) + 0.01).length;
        const underbid = rounds.filter(r => Number(r.playerAction) < (r.playerValuation || 0) - 0.01).length;
        const pct = Math.round((truthful / count) * 100);
        const scoreCmp = getScoreCmp(pScore, bScore, true);
        equilibriumBenchmark = `Weakly Dominant Strategy: 100% Truthful Bidding (Bid = Exact Valuation b = v across all ${formatUnit(count, 'auction')})`;
        studentFrequencies = `${truthful}/${count} Truthful Bids (${pct}%) · ${overbid} Overbids · ${underbid} Underbids`;
        if (pct >= 85) {
          gapSentence = pScore >= bScore
            ? `Close to equilibrium: ${scoreCmp}. You played the weakly dominant strategy of truthful bidding (b = v) in ${pct}% of auctions, letting the second-price clearing mechanism protect your profit margins.`
            : `Close to equilibrium: ${scoreCmp}. You bid truthfully in ${pct}% of rounds, following dominant strategy theory; although ${botProfile.name} realized higher valuation draws, your truthful discipline guaranteed you never suffered the Winner's Curse.`;
        } else if (pct >= 50) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. You bid truthfully in ${pct}% of rounds but deviated in others (${overbid} overbids, ${underbid} underbids), eroding your margins.`
            : `Noticeable deviation: ${scoreCmp}. You bid truthfully in ${pct}% of rounds with occasional deviations, winning key auctions without severe winner's curse penalties.`;
        } else {
          gapSentence = pScore < bScore
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You deviated from your valuation in ${count - truthful}/${count} auctions (${overbid > underbid ? 'frequently overbidding due to competitive fever' : 'underbidding and forfeiting profitable lots'}), falling behind due to distorted first-price bidding habits.`
            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You deviated in ${count - truthful}/${count} auctions, yet finished ahead due to favorable valuation spreads, though dominant strategy theory confirms truthful bidding maximizes expected profits.`;
        }
        break;
      }
      case 11: {
        const guesses = rounds.map(r => Number(r.playerAction) || 0);
        const avg = Math.round(guesses.reduce((a, b) => a + b, 0) / count);
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `Guess = 0 (Unique Nash: 5 pts/round each on tie, ${count * 5} pts over ${formatUnit(count, 'round')}; L0 ~50, L1 ~33, L2 ~22)`;
        studentFrequencies = `Average Guess: ${avg} (Iterated Benchmarks: L0 ~50, L1 ~33, L2 ~22, Nash: 0)`;
        if (avg <= 10) {
          gapSentence = pScore < bScore
            ? `Close to equilibrium: ${scoreCmp}. Although your average guess of ${avg} approached the mathematical Nash equilibrium (0), competitors only reason 1–2 steps ahead (~22 to ~33), meaning pure game theory overshot human opponents.`
            : `Close to equilibrium: ${scoreCmp}. Your average guess of ${avg} approached the theoretical Nash equilibrium of 0, successfully winning contests as the field iterated downward.`;
        } else if (avg <= 35) {
          gapSentence = pScore >= bScore
            ? `Noticeable deviation: ${scoreCmp}. Your average guess of ${avg} departed from mathematical equilibrium (0) but won contests because targeting Level-1 (~33) or Level-2 (~22) accurately anticipates human bounded rationality.`
            : `Noticeable deviation: ${scoreCmp}. Your average guess of ${avg} targeted intermediate cognitive depth, but ${botProfile.name} anticipated the group average more accurately.`;
        } else {
          gapSentence = pScore < bScore
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Your average guess of ${avg} anchored near the intuitive midpoint (~50), falling behind because you did not apply iterative 2/3 elimination.`
            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Your average guess of ${avg} anchored near the intuitive center (~50), winning rounds only because your opponents also exhibited Level-0 heuristics.`;
        }
        break;
      }
      case 12: {
        const contribs = rounds.map(r => Number(r.playerAction) || 0);
        const avg = Math.round((contribs.reduce((a, b) => a + b, 0) / count) * 10) / 10;
        const pct = Math.round((avg / 20) * 100);
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `Nash Trap: 20 pts/round each (${count * 20} pts over ${formatUnit(count, 'round')}) · Social Optimum: 32 pts/round each (${count * 32} pts over ${formatUnit(count, 'round')})`;
        studentFrequencies = `Average Contribution: ${avg}/20 Tokens (${pct}% Giving Rate)`;
        if (pct <= 15) {
          gapSentence = pScore >= bScore
            ? `Close to equilibrium: ${scoreCmp}. You contributed only ${avg}/20 tokens (${pct}%), adhering closely to the free-riding dominant strategy and keeping your private endowment safe while collecting pool dividends.`
            : `Close to equilibrium: ${scoreCmp}. You contributed only ${avg}/20 tokens (${pct}%), adhering to the dominant free-riding strategy, but mutual low contributions trapped both players at low scores.`;
        } else if (pct <= 45) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. You contributed an average of ${avg}/20 tokens (${pct}%), but ${botProfile.name} free-rode on your public funding. Many people are conditional cooperators who are willing to contribute if others do, but cooperation tends to collapse when free-riders go unpunished.`
            : `Noticeable deviation: ${scoreCmp}. You contributed an average of ${avg}/20 tokens (${pct}%), balancing prosocial public investment with defensive self-preservation.`;
        } else {
          gapSentence = pScore < bScore
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You contributed generously (${pct}% of endowment), but suffered free-rider exploitation as ${botProfile.name} contributed less. Many people are conditional cooperators who are willing to contribute if others do, but cooperation tends to collapse when free-riders go unpunished.`
            : `Productive deviation from theory: ${scoreCmp}. By contributing ${pct}% of your endowment (${avg}/20 tokens) rather than the 0-token dominant strategy, you unlocked mutual wealth multiplication through reciprocal collective investment.`;
        }
        break;
      }
      case 15: {
        const hawk = rounds.filter(r => r.playerAction === 'Hawk').length;
        const dove = count - hawk;
        const pct = Math.round((hawk / count) * 100);
        const crashes = rounds.filter(r => r.playerAction === 'Hawk' && r.botAction === 'Hawk').length;
        const hawkEssGap = Math.abs(pct - 23);
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `Per round: Peaceful Sharing (Dove, Dove) = +3 pts/rd each · Exploit (Hawk, Dove) = +6 pts/rd vs 0 · Collision = -10 pts/rd each [Over ${formatUnit(count, 'round')}: Dove/Dove = +${count * 3} each · Mixed ESS = ~${(count * 2.3).toFixed(1)} each]`;
        studentFrequencies = `${hawk}/${count} Hawk (${pct}%) · ${dove}/${count} Dove (${100 - pct}%) · ${crashes} Fight${crashes === 1 ? '' : 's'}`;
        if (hawkEssGap <= 8) {
          gapSentence = pScore < bScore
            ? `Close to equilibrium: ${scoreCmp}. Although your overall mix was near the 23% ESS benchmark (${pct}% Hawk), the ORDER of your choices was predictable, resulting in ${crashes} mutual fight${crashes === 1 ? '' : 's'} (-10 pts each); a true mixed strategy must also be unpredictable round to round to prevent an opponent from anticipating your aggression.`
            : `Close to equilibrium: ${scoreCmp}. You chose Hawk in ${pct}% of rounds (within ${hawkEssGap}% of the 23% mixed ESS benchmark), using randomized deterrence effectively to secure resources with no costly Hawk-Hawk fights.`;
        } else if (hawkEssGap <= 25) {
          gapSentence = pScore < bScore
            ? pct < 23
              ? `Noticeable deviation: ${scoreCmp}. You played Hawk in only ${pct}% of rounds (yielding too frequently compared to the 23% ESS mix); always yielding gets exploited by an aggressive bot, surrendering territory without contesting it despite having ${crashes > 0 ? `${crashes} costly fight${crashes === 1 ? '' : 's'}` : 'no costly Hawk-Hawk fights'}.`
              : `Noticeable deviation: ${scoreCmp}. You played Hawk in ${pct}% of rounds (exceeding the 23% ESS mix); aggressive over-escalation triggered ${crashes} costly Hawk-Hawk fight${crashes === 1 ? '' : 's'} (-10 pts each), dragging down your score.`
            : `Noticeable deviation: ${scoreCmp}. You played Hawk in ${pct}% of rounds (a ${hawkEssGap}% gap from 23% ESS), staying ahead by timing your aggressive claims when ${botProfile.name} yielded, with no costly Hawk-Hawk fights.`;
        } else {
          gapSentence = pScore < bScore
            ? pct < 23
              ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You played Hawk in only ${pct}% of rounds; always yielding gets exploited by an aggressive bot, handing 6 points per round to ${botProfile.name} while earning 0, even with no costly Hawk-Hawk fights.`
              : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You played Hawk in ${pct}% of rounds; stubborn aggression against an unyielding opponent resulted in ${crashes} devastating Hawk-Hawk fight${crashes === 1 ? '' : 's'} (-10 pts each), turning competition into mutual destruction.`
            : `Productive deviation from theory: ${scoreCmp}. You played Hawk in ${pct}% of rounds, departing widely from the 23% ESS baseline, yet forced concessions from ${botProfile.name} while avoiding costly Hawk-Hawk fights.`;
        }
        break;
      }
      case 9:
      case 16: {
        const offers = rounds.map(r => Number(r.playerAction) || 0);
        const avg = Math.round((offers.reduce((a, b) => a + b, 0) / count) * 10) / 10;
        const accepted = rounds.filter(r => r.botAction === 'Accept').length;
        const pct = Math.round((avg / 10) * 100);
        const scoreCmp = getScoreCmp(pScore, bScore, true);
        equilibriumBenchmark = `SPNE: Proposer $9.00/round ($${(count * 9).toFixed(2)} over ${formatUnit(count, 'round')}) · Responder $1.00/round ($${(count * 1).toFixed(2)} over ${formatUnit(count, 'round')})`;
        studentFrequencies = `Average Offer: $${avg.toFixed(2)} of $10.00 (${pct}% Share) · ${accepted}/${formatUnit(count, 'match', 'matches')} Accepted`;
        if (avg <= 1.50) {
          gapSentence = pScore < bScore || accepted < count
            ? `Close to equilibrium: ${scoreCmp}. Your average offer of $${avg.toFixed(2)} adhered strictly to the 10% SPNE prediction ($1.00), but ${botProfile.name} vetoed low-ball offers to $0 to punish perceived greed.`
            : `Close to equilibrium: ${scoreCmp}. Your average offer of $${avg.toFixed(2)} adhered closely to the 10% SPNE prediction ($1.00), helped by finding a rational partner who accepted positive crumbs.`;
        } else if (avg <= 3.20) {
          gapSentence = pScore < bScore || accepted < count
            ? `Noticeable deviation: ${scoreCmp}. Your average offer of $${avg.toFixed(2)} (${pct}%) fell into the 20–30% danger zone, where rejections destroyed surplus.`
            : `Noticeable deviation: ${scoreCmp}. Your average offer of $${avg.toFixed(2)} (${pct}%) earned points by probing the boundary of acceptable bargaining concessions.`;
        } else {
          gapSentence = pScore >= bScore * 0.8
            ? `Productive deviation from theory: ${scoreCmp}. Your average offer of $${avg.toFixed(2)} (${pct}%) departed substantially from the selfish $1 SPNE prediction to satisfy social fairness norms, securing agreement in ${accepted}/${formatUnit(count, 'match', 'matches')} and avoiding costly vetoes.`
            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Offering $${avg.toFixed(2)} (${pct}%) ensured guaranteed agreement, though high generosity conceded the majority of the surplus to your partner.`;
        }
        break;
      }
      case 17: {
        const heads = rounds.filter(r => r.playerAction === 'Heads').length;
        const tails = count - heads;
        const pct = Math.round((heads / count) * 100);
        const wins = rounds.filter(r => r.playerAction === r.botAction).length;
        const penniesGap = Math.abs(pct - 50);
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `Unique Mixed Equilibrium (Minimax): 1.0 pt/round each (${(count * 1.0).toFixed(1)} pts over ${formatUnit(count, 'round')}) · Stake per round: +2 pts for winner, 0 for loser (50/50 mix)`;
        studentFrequencies = `${heads}/${count} Heads (${pct}%) · ${tails}/${count} Tails (${100 - pct}%) · Matched ${wins}/${count} (${Math.round((wins / count) * 100)}% Win Rate)`;
        if (penniesGap <= 6) {
          gapSentence = pScore < bScore
            ? `Close to equilibrium: ${scoreCmp}. Although your overall choice mix was near theoretical 50/50 (${pct}% Heads / ${100 - pct}% Tails), the ORDER of your choices was predictable, allowing ${botProfile.name} to anticipate your sequence; a true mixed strategy must also be unpredictable round to round, not just 50/50 in aggregate.`
            : `Close to equilibrium: ${scoreCmp}. Your choice frequency was ${pct}% Heads and ${100 - pct}% Tails (within ${penniesGap}% of theoretical 50/50), maintaining true round-to-round unpredictability that prevented pattern exploitation and protected your expected payoff.`;
        } else if (penniesGap <= 18) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. Your choice frequency was ${pct}% Heads and ${100 - pct}% Tails (a ${penniesGap}% gap from 50/50), and the ORDER of your choices looked predictable to ${botProfile.name}; a true mixed strategy must also be unpredictable round to round, in addition to maintaining a 50/50 frequency balance.`
            : `Noticeable deviation: ${scoreCmp}. Your choice frequency tilted slightly to ${pct}% Heads (a ${penniesGap}% gap from 50/50), yet you outscored ${botProfile.name} by timing your coin shifts effectively.`;
        } else {
          gapSentence = pScore < bScore
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Your choices tilted heavily to ${pct >= 50 ? `${pct}% Heads` : `${100 - pct}% Tails`} (a large ${penniesGap}% gap from 50/50), and the ORDER of your choices looked predictable, allowing ${botProfile.name} to anticipate your habits; a true mixed strategy must be unpredictable round to round, not anchored to recognizable patterns.`
            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You heavily favored ${pct >= 50 ? 'Heads' : 'Tails'} (${pct >= 50 ? pct : 100 - pct}%), yet stayed ahead because your opponent failed to counter your directional anchor quickly enough.`;
        }
        break;
      }
      case 18: {
        const opera = rounds.filter(r => r.playerAction === 'Opera').length;
        const football = count - opera;
        const pct = Math.round((opera / count) * 100);
        const coords = rounds.filter(r => (r.playerAction === 'Opera' && r.botAction === 'Opera') || (r.playerAction === 'Football' && r.botAction === 'Football')).length;
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `Coordinated Payoffs: +3 or +2 pts/round (+${count * 3} or +${count * 2} pts over ${formatUnit(count, 'round')}) · Miscoordination: 0 pts/round (0 pts over ${formatUnit(count, 'round')})`;
        studentFrequencies = `${opera}/${count} Opera (${pct}%) · ${football}/${count} Football (${100 - pct}%) · Coordinated: ${coords}/${count}`;
        if (coords >= Math.round(count * 0.7) || pct === 100 || pct === 0) {
          gapSentence = pScore < bScore
            ? `Close to equilibrium: ${scoreCmp}. Although you coordinated in ${coords}/${count} rounds, you repeatedly conceded to the bot's preferred venue rather than alternating turns fairly.`
            : (40 <= pct && pct <= 60)
            ? `Close to equilibrium: ${scoreCmp}. You coordinated across rounds with an even ${pct}% Opera / ${100 - pct}% Football split, establishing an egalitarian turn-taking convention that maximized joint welfare.`
            : `Close to equilibrium: ${scoreCmp}. You coordinated successfully in ${coords}/${count} rounds, asserting preference priority to lead scoring.`;
        } else if (coords >= Math.round(count * 0.4)) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. You coordinated in ${coords}/${count} rounds, but miscoordination clashes reduced your score as neither player established a clear convention.`
            : `Noticeable deviation: ${scoreCmp}. You coordinated in ${coords}/${count} rounds, capturing surplus by asserting your preferred venue whenever coordination succeeded.`;
        } else {
          gapSentence = `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Miscoordination destroyed surplus in ${count - coords}/${count} rounds because both players stubbornly insisted on their own favorite event, collapsing payoffs to zero.`;
        }
        break;
      }
      case 19: {
        const invs = rounds.map(r => Number(r.playerAction) || 0);
        const avg = Math.round((invs.reduce((a, b) => a + b, 0) / count) * 10) / 10;
        const pct = Math.round((avg / 10) * 100);
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `SPNE: Investor keeps 10 pts/round, Trustee gets 0 (${count * 10} vs 0 over ${formatUnit(count, 'round')}) · Social Maximum: 15 pts each/round for fair 50/50 return (${count * 15} pts each over ${formatUnit(count, 'round')}; 30 pts/round joint total)`;
        studentFrequencies = `Average Transfer: ${avg}/10 pts (${pct}% Trust Rate)`;
        if (pct <= 15) {
          gapSentence = pScore >= bScore
            ? `Close to equilibrium: ${scoreCmp}. You transferred only ${avg}/10 pts (${pct}% trust rate), strictly adhering to the 0-point SPNE baseline and protecting your endowment from trustee moral hazard.`
            : `Close to equilibrium: ${scoreCmp}. You transferred only ${avg}/10 pts (${pct}% trust rate), adhering to SPNE backward induction; you kept your capital safe, but missed out on the 3x surplus growth available through mutual trust.`;
        } else if (pct <= 45) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. You entrusted an average of ${avg}/10 pts (${pct}%), but earned less because the trustee returned too little surplus.`
            : `Noticeable deviation: ${scoreCmp}. You entrusted an average of ${avg}/10 pts (${pct}%), earning points by prudently probing ${botProfile.name}'s trustworthiness.`;
        } else {
          gapSentence = pScore < bScore && pScore <= count * 10
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You placed high trust in ${botProfile.name} by transferring ${pct}% of your endowment, but suffered losses because your partner exploited your vulnerability and kept the tripled wealth.`
            : `Productive deviation from theory: ${scoreCmp}. By entrusting ${pct}% of your capital (${avg}/10 pts) instead of the 0-point SPNE prediction, you unlocked reciprocal wealth multiplication to generate high mutual returns with ${botProfile.name}.`;
        }
        break;
      }
      case 20: {
        const n1Takes = rounds.filter(r => String(r.playerAction).includes('Node 1')).length;
        const passedN1 = count - n1Takes;
        const pct = Math.round((passedN1 / count) * 100);
        const scoreCmp = getScoreCmp(pScore, bScore);
        equilibriumBenchmark = `SPNE Defection: +2 pts/chain for you, 0 for bot (${count * 2} vs 0 over ${formatUnit(count, 'chain')}) · Social Optimum: +8 pts each/chain (${count * 8} pts each over ${formatUnit(count, 'chain')})`;
        studentFrequencies = `${n1Takes}/${count} Node 1 Takes · ${passedN1}/${count} Chains Passed Beyond Node 1 (${pct}% Passing Rate)`;
        if (pct <= 15) {
          gapSentence = pScore >= bScore
            ? `Close to equilibrium: ${scoreCmp}. You took at Node 1 in ${n1Takes}/${count} chains (${100 - pct}% immediate defection), adhering to SPNE backward induction and securing +2 pts while giving the bot 0.`
            : `Close to equilibrium: ${scoreCmp}. You followed backward induction by taking at Node 1, guaranteeing +2 pts per chain but leaving the 16-point cooperative jackpot unclaimed.`;
        } else if (pct <= 50) {
          gapSentence = pScore < bScore
            ? `Noticeable deviation: ${scoreCmp}. You passed beyond Node 1 in ${pct}% of chains, but ${botProfile.name} took early at intermediate nodes, leaving you with lower payoffs.`
            : `Noticeable deviation: ${scoreCmp}. You passed beyond Node 1 in ${pct}% of chains, timing your exits to claim larger shares before the bot could defect.`;
        } else {
          gapSentence = pScore < bScore && pScore <= count * 2
            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You consistently passed to grow the collective pot (${pct}% passing rate), but earned less because the bot defected ahead of you at advanced nodes.`
            : `Productive deviation from theory: ${scoreCmp}. You passed beyond Node 1 in ${pct}% of chains, directly defying the cold backward induction prediction to build sequential reciprocal wealth with ${botProfile.name}.`;
        }
        break;
      }
      default: {
        equilibriumBenchmark = "Symmetric Nash Equilibrium Best Response Profile";
        studentFrequencies = `${count} Decision Rounds Completed`;
        gapSentence = "Strategic alignment of mutual actions determined comparative performance against theoretical benchmark.";
        break;
      }
    }

    return { equilibriumBenchmark, studentFrequencies, gapSentence };
  };

  const wholeMatchStats = getWholeMatchFrequencies();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <span>🎓 Formal Game Theory Debrief</span>
            <span>·</span>
            <span className="text-slate-400">Experiment Complete</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            {data.gameTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Opponent faced:{' '}
            <span className={`font-bold ${botProfile.color}`}>
              {botProfile.avatar} {botProfile.name} ({botProfile.title})
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onOpenWhatIfSandbox(data.gameId)}
            className="w-full sm:w-auto min-h-[56px] px-5 py-3.5 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>∫ Test in What-If Sandbox</span>
          </button>
          <button
            type="button"
            onClick={onRestartExperiment}
            className="w-full sm:w-auto min-h-[56px] px-5 py-3.5 rounded-2xl text-base font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            🔄 Restart Experiment
          </button>
        </div>
      </div>

      {/* Scoreboard Metrics Cards - Stack cleanly on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Cumulative Payoff</div>
          <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">
            {data.playerTotalScore} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="text-[11px] text-blue-400 font-semibold mt-1">
            {efficiency}% of <GlossaryTerm term="pareto-efficiency">Pareto Optimum</GlossaryTerm>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bot Cumulative Payoff</div>
          <div className="text-2xl font-black text-slate-200 font-mono tabular-nums mt-1">
            {data.botTotalScore} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className={`text-[11px] font-semibold mt-1 ${botProfile.color}`}>
            {data.playerTotalScore >= data.botTotalScore ? '✓ You outperformed bot' : 'Bot extracted surplus'}
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <GlossaryTerm term="nash-equilibrium">Nash Benchmark</GlossaryTerm>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono tabular-nums mt-1">
            {data.nashBenchmarkScore} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            Standard Rational Choice
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <GlossaryTerm term="social-optimum">Social Optimum</GlossaryTerm> (<GlossaryTerm term="pareto-efficiency">Pareto</GlossaryTerm>)
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-1">
            {data.paretoOptimumScore} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            Maximum Group Welfare
          </div>
        </div>
      </div>

      {/* Whole Match Choice Frequencies & Theoretical Equilibrium Comparison */}
      <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚖️ Whole Match Decisions vs. Equilibrium Prediction</span>
            <span className="text-slate-600">·</span>
            <span className="text-blue-400 font-mono">{formatUnit((data.roundsSummary || []).length, 'Round')} Analyzed</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-300">
            Total Points: <strong className="text-emerald-400">You: {data.playerTotalScore}</strong> vs <strong className={botProfile.color}>{botProfile.name}: {data.botTotalScore}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-rose-900/50 space-y-1.5">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
              <span><GlossaryTerm term="nash-equilibrium">Equilibrium Prediction Benchmark</GlossaryTerm></span>
              <span className="font-mono text-rose-300">Theory</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white font-mono leading-snug">
              <AnnotateGlossaryText text={wholeMatchStats.equilibriumBenchmark} />
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-emerald-900/50 space-y-1.5">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>Your Actual Choice Frequencies</span>
              <span className="font-mono text-emerald-300">{(data.roundsSummary || []).length} {pluralWord((data.roundsSummary || []).length, 'Rd', 'Rds')} Played</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white font-mono leading-snug">
              {wholeMatchStats.studentFrequencies}
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-blue-900/50 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong className="text-sky-300 font-semibold block sm:inline mb-1 sm:mb-0">Gap Interpretation: </strong>
          <span><AnnotateGlossaryText text={wholeMatchStats.gapSentence} /></span>
        </div>
      </div>

      {/* Comparative Payoff Bar Chart Against Theoretical Benchmarks */}
      {(() => {
        const maxScoreVal = Math.max(
          data.playerTotalScore,
          data.botTotalScore,
          data.nashBenchmarkScore,
          data.paretoOptimumScore,
          1
        );
        const calcPercent = (val: number) =>
          Math.min(100, Math.max(4, Math.round((val / maxScoreVal) * 100)));

        const diffFromNash = Math.round((data.playerTotalScore - data.nashBenchmarkScore) * 10) / 10;

        return (
          <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊 Comparative Payoff Bar Chart</span>
                <span className="text-slate-600">·</span>
                <span className="text-blue-400 font-mono">Normalized against Equilibrium Frontiers</span>
              </div>
              <div className="text-xs font-mono font-bold">
                {diffFromNash >= 0 ? (
                  <span className="text-emerald-400">▲ +${diffFromNash} above <GlossaryTerm term="nash-equilibrium">Nash Equilibrium</GlossaryTerm></span>
                ) : (
                  <span className="text-rose-400">▼ -${Math.abs(diffFromNash)} below <GlossaryTerm term="nash-equilibrium">Nash Equilibrium</GlossaryTerm></span>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* 1. Student Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>Your Performance</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    ${data.playerTotalScore} pts
                  </span>
                </div>
                <div className="h-5 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded transition-all duration-700 shadow-sm"
                    style={{ width: `${calcPercent(data.playerTotalScore)}%` }}
                  />
                </div>
              </div>

              {/* 2. Bot Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold flex items-center gap-1.5 ${botProfile.color}`}>
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    <span>{botProfile.name} ({botProfile.title})</span>
                  </span>
                  <span className="font-mono font-bold text-slate-300">
                    ${data.botTotalScore} pts
                  </span>
                </div>
                <div className="h-5 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center p-0.5">
                  <div
                    className="h-full bg-slate-600 rounded transition-all duration-700"
                    style={{ width: `${calcPercent(data.botTotalScore)}%` }}
                  />
                </div>
              </div>

              {/* 3. Nash Benchmark Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span><GlossaryTerm term="nash-equilibrium">Nash Equilibrium Benchmark</GlossaryTerm> (Rational Self-Interest)</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    ${data.nashBenchmarkScore} pts
                  </span>
                </div>
                <div className="h-5 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center p-0.5">
                  <div
                    className="h-full bg-amber-600/80 rounded transition-all duration-700 border-r-2 border-amber-300"
                    style={{ width: `${calcPercent(data.nashBenchmarkScore)}%` }}
                  />
                </div>
              </div>

              {/* 4. Pareto Social Optimum Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span><GlossaryTerm term="pareto-efficiency">Pareto Social Optimum</GlossaryTerm> (Max Group Efficiency)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${data.paretoOptimumScore} pts
                  </span>
                </div>
                <div className="h-5 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center p-0.5">
                  <div
                    className="h-full bg-emerald-600/80 rounded transition-all duration-700 border-r-2 border-emerald-300"
                    style={{ width: `${calcPercent(data.paretoOptimumScore)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Core Theoretical Insight Breakdown */}
      <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>📚 Formal Theory Model</span>
              <span className="text-slate-600">·</span>
              <span><AnnotateGlossaryText text={insights.concept} /></span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
              Theoretical Foundation & Equilibrium Dynamics
            </h3>
          </div>
          <div className="bg-slate-950 px-3.5 py-2.5 rounded-xl border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium overflow-x-auto max-w-full shadow-inner flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80 border-r border-slate-800 pr-2 select-none shrink-0">
              EQUATION
            </span>
            <div className="text-amber-200 text-sm leading-none flex items-center">
              <MathFormula math={insights.formula} />
            </div>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <FormattedMathText text={insights.keyFinding} />
        </div>

        {/* Key Game Theory Principles list */}
        <div className="space-y-2 pt-2 border-t border-slate-900">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Key Formal Principles
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {insights.rulesSummary.map((rule, idx) => {
              const [head, ...rest] = rule.split(':');
              return (
                <div key={idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-bold text-white mb-1">{head}:</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <FormattedMathText text={rest.join(':')} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real World Case Study */}
        <div className="bg-blue-950/30 border border-blue-900/50 p-3.5 rounded-xl flex items-start gap-3 mt-3">
          <span className="text-lg">🏛️</span>
          <div>
            <div className="text-xs font-bold text-blue-300">Real-World Application & Market Design:</div>
            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              <FormattedMathText text={insights.caseStudy} />
            </div>
          </div>
        </div>
      </div>

      {/* Try Against Another Game Persona */}
      {availableBots.length > 0 && (
        <div className="bg-slate-950/60 p-3 sm:p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-white mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>Face a Different Strategic Opponent in this Game:</span>
            <span className="text-[10px] text-slate-400 font-mono">Swipe horizontally to pick · Touch card to switch</span>
          </div>
          <div className="overflow-x-auto flex gap-3 pb-2 pt-1 touch-pan-x snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {availableBots.map(b => {
              const isCurrent = data.botInfo.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChangeBot(b.id)}
                  className={`min-h-[56px] min-w-[220px] sm:min-w-[260px] p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex items-center shrink-0 snap-start active:scale-[0.98] ${
                    isCurrent
                      ? `${b.badgeBg} ${b.badgeBorder} border-blue-500 ring-2 ring-blue-400/40 shadow-lg text-white`
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-3xl shrink-0">{b.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-white flex items-center gap-1.5 truncate">
                        <span className="truncate">{b.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-500 text-white font-black px-1.5 py-0.5 rounded-full shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-bold truncate mt-0.5 ${b.color}`}>{b.title}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
