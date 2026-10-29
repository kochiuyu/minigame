import React from 'react';
import { BotArchetype, BOT_PROFILES, GameSpecificBot } from '../services/botEngine';
import { MathFormula, FormattedMathText } from './MathFormula';

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
          formula: "\\text{MPCR} = \\frac{1.6}{4} = 0.4 < 1.0 \\quad (\\text{Nash} = 0, \\text{Social Optimum} = 20)",
          keyFinding:
            data.botArchetype === 'GREEDY'
              ? "The Greedy Free-Rider contributed 0 tokens, pocketing their full private endowment while capturing 40% of your public contributions."
              : "When players reciprocate, public contributions multiply group welfare by 160%, achieving the Pareto-efficient cooperative frontier.",
          caseStudy: "Global Climate Treaties: Reducing carbon emissions benefits the entire global biosphere, but individual nations pay 100% of the abatement cost while receiving only a fraction of the climate dividend.",
          rulesSummary: [
            "Individual Dominance: Since each token placed in public returns only $0.40, individual rationality dictates contributing 0.",
            "Collective Tragedy: If everyone follows individual rationality, all earn $20. If everyone cooperates, all earn $32.",
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
          formula: "\\text{SPNE: } X^* = 0, \\; Y^*(X) = 0 \\implies \\Pi_1 = 10, \\; \\Pi_2 = 0 \\quad (\\text{Social Max: } X = 10, \\; Y = 15)",
          keyFinding:
            data.botInfo?.id === 'gage_fair_reciprocator'
              ? "Gage returned 50% of the tripled investment (1.5x), proving how mutual trust and reciprocity unlock the full 30-token social optimum."
              : data.botInfo?.id === 'silas_selfish_trustee'
              ? "Silas demonstrated textbook Homo Economicus: in single-shot backward induction, a selfish trustee returns $0, penalizing the vulnerable investor."
              : "Across thousands of laboratory trust experiments, humans send over 50% of their endowment, and trustees reciprocate enough to generate positive returns for both parties.",
          caseStudy: "Angel Venture Capital: Seed-stage startup investing is fundamentally a real-world Trust Game. Angels wire millions of dollars to founders before product-market fit; high social trust and reputational reciprocity enable startup innovation.",
          rulesSummary: [
            "Backward Induction Failure: Selfish rationality predicts zero trust (X = 0), trapping society in a zero-growth safe state (10 pts).",
            "Trust as Capital Multiplier: Entrusting funds triples wealth (3x), creating 20 points of brand-new economic surplus.",
            "Reciprocal Norms: Human trustworthiness is sustained by fairness norms, guilt aversion, and reciprocal goodwill."
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
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onOpenWhatIfSandbox(data.gameId)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
          >
            <span>∫ Test in What-If Sandbox</span>
          </button>
          <button
            type="button"
            onClick={onRestartExperiment}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center flex-1 sm:flex-none"
          >
            Restart
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
            {efficiency}% of Pareto Optimum
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
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nash Benchmark</div>
          <div className="text-2xl font-black text-amber-400 font-mono tabular-nums mt-1">
            {data.nashBenchmarkScore} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            Standard Rational Choice
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Social Optimum (Pareto)</div>
          <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-1">
            {data.paretoOptimumScore} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            Maximum Group Welfare
          </div>
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
                  <span className="text-emerald-400">▲ +${diffFromNash} above Nash Equilibrium</span>
                ) : (
                  <span className="text-rose-400">▼ -${Math.abs(diffFromNash)} below Nash Equilibrium</span>
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
                    <span>Nash Equilibrium Benchmark (Rational Self-Interest)</span>
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
                    <span>Pareto Social Optimum (Max Group Efficiency)</span>
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
              <span>{insights.concept}</span>
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
            <span className="text-[10px] text-slate-400">Click to switch opponent persona and run a new trial</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {availableBots.map(b => {
              const isCurrent = data.botInfo.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChangeBot(b.id)}
                  className={`w-full min-h-[44px] p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center ${
                    isCurrent
                      ? `${b.badgeBg} ${b.badgeBorder} border-2 ring-1 ring-blue-500/30`
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 w-full">
                    <span className="text-xl shrink-0">{b.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white break-words">{b.name}</div>
                      <div className={`text-[11px] leading-tight break-words ${b.color}`}>{b.title}</div>
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
