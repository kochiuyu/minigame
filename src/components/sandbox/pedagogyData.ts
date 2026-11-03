export interface GamePedagogy {
  role: string;
  objective: string;
  intuitionDilemma: string;
  equilibriumConcept: string;
  policyIntervention: string;
  formalProof: {
    title: string;
    assumptions: string[];
    steps: string[];
    conclusion: string;
  };
}

export const PEDAGOGY_DATA: Record<number, GamePedagogy> = {
  // 1. Prisoner's Dilemma
  1: {
    role: "Arrested Suspect / Strategic Partner",
    objective: "Minimize prison sentence / Maximize individual points",
    intuitionDilemma: "Both players achieve higher payoffs by cooperating (R = 2 each), yet each individually achieves higher payoffs by defecting regardless of what the partner chooses.",
    equilibriumConcept: "Strict Dominance Nash Equilibrium: (Defect, Defect) yields (P = 1, P = 1). The social optimum (R = 2, R = 2) is strictly unstable.",
    policyIntervention: "External contract enforcement, legal liability, or reputational repeat play where the cheat temptation is penalized (T < R).",
    formalProof: {
      title: "Strict Dominance of Defection",
      assumptions: [
        "Payoffs satisfy canonical condition: T > R > P > S and 2R > T + S.",
        "Simultaneous single-shot game without communication."
      ],
      steps: [
        "If partner plays Cooperate: Payoff(Defect) = T, Payoff(Cooperate) = R. Since T > R, Defect is the unique best response.",
        "If partner plays Defect: Payoff(Defect) = P, Payoff(Cooperate) = S. Since P > S, Defect is the unique best response.",
        "Defect yields strictly higher payoffs across all partner strategies: Defect strictly dominates Cooperate.",
        "By iterated elimination of strictly dominated strategies, (Defect, Defect) is the unique Nash Equilibrium."
      ],
      conclusion: "Individual rationality guarantees Pareto-inferior outcome P < R without institutional intervention."
    }
  },

  // 2. Sequential Entry
  2: {
    role: "First-Mover Tech Startup / Second-Mover Rival",
    objective: "Maximize long-term market valuation while factoring in rival entry reaction",
    intuitionDilemma: "Entering first seems to guarantee monopoly profits, but if duopoly entry is profitable for the rival, the market splits and entry costs are sunk.",
    equilibriumConcept: "Subgame Perfect Nash Equilibrium (SPNE) solved via backward induction: Player 1 anticipates Player 2's optimal entry response before committing.",
    policyIntervention: "Patent protection, exclusive licensing, or regulatory entry barriers that ensure duopoly payoffs for second-movers drop below entry costs.",
    formalProof: {
      title: "Backward Induction Rollback",
      assumptions: [
        "Monopoly value M, Duopoly value D, Fixed entry setup cost K.",
        "Second mover enters iff Payoff(Enter) = D - K > 0."
      ],
      steps: [
        "Subgame 2 (P1 Launched): Second mover compares D - K vs 0. If D > K, rival Enters; if D < K, rival Stays Out.",
        "Subgame 1 (P1 Waited): Second mover compares M - K vs 0. Second mover captures monopoly M - K.",
        "Rollback to P1: If D > K, P1 receives duopoly D - K. P1 Launches iff D - K >= 0.",
        "First-mover advantage exists when D >= K, preempting rival monopoly."
      ],
      conclusion: "Backward induction eliminates non-credible threats and determines the credible market structure."
    }
  },

  // 3. Price Competition (Bertrand 2x2)
  3: {
    role: "Retail Competitor / Pricing Manager",
    objective: "Set retail prices to maximize operating margins without losing market share",
    intuitionDilemma: "Both stores want high margins, but cutting price by $1 steals 100% of demand, triggering a mutually destructive price war down to zero profit.",
    equilibriumConcept: "Bertrand Trap: Low Price strictly dominates High Price in static competition. Both firms earn low or zero economic profit.",
    policyIntervention: "Price-Matching Guarantees: By promising to match any rival price, a firm removes the rival's incentive to undercut, sustaining high prices.",
    formalProof: {
      title: "Neutralizing Price Cuts via Price-Matching Policies",
      assumptions: [
        "Two firms selling homogeneous goods. High price margin H, Low price margin L with H > L > 0.",
        "Price matching policy guarantees matching any lower advertised competitor price."
      ],
      steps: [
        "Without policy: If rival plays High, undercutting to Low yields 100% demand. Dominant strategy is Low.",
        "With policy: If Firm 1 commits to price-match, Firm 2 undercutting to Low no longer captures 100% demand.",
        "Firm 2's demand remains split 50/50 at price Low, yielding profit L/2 < H/2.",
        "Undercutting incentive is destroyed; (High, High) becomes a stable collusive Nash equilibrium."
      ],
      conclusion: "Seemingly pro-consumer price-match guarantees function as anti-competitive tacit collusion devices."
    }
  },

  // 4. Promotion Timing (3x3 Mixed)
  4: {
    role: "Department Store VP of Promotions",
    objective: "Select weekday promotional dates to capture shoppers while avoiding promotional clashes",
    intuitionDilemma: "Running promotions on the same day as rivals splits customer volume in half; running promotions on different days captures distinct shopper segments.",
    equilibriumConcept: "Mixed Strategy Nash Equilibrium (MSNE): No deterministic schedule is stable; players must randomize across days to keep rivals indifferent.",
    policyIntervention: "Industry promotional calendars, pre-scheduled retail association clearance weeks, or digital targeted promotions.",
    formalProof: {
      title: "Mixed Strategy Indifference Condition",
      assumptions: [
        "Days {Mon, Wed, Fri}. Shopper volume S_d. Tie splits volume 50/50.",
        "Mixed strategy probability vector p = (p_M, p_W, p_F)."
      ],
      steps: [
        "Expected payoff for playing Day d: E[U(d)] = p_d * (S_d / 2) + sum_{k != d} p_k * S_d.",
        "In MSNE, expected payoffs across all actively played days must be equal: E[U(Mon)] = E[U(Wed)] = E[U(Fri)].",
        "Solving the linear system sum p_d = 1 yields the unique equilibrium randomization probabilities.",
        "Predictable schedules invite unilateral exploitation; randomization guarantees defense."
      ],
      conclusion: "Unpredictability is the unique rational defense against tactical counter-programming."
    }
  },

  // 5. Entry Deterrence Commitment
  5: {
    role: "Incumbent Monopolist / Market Challenger",
    objective: "Deter potential entrants through credible irreversible strategic investments",
    intuitionDilemma: "An incumbent may verbally threaten a price war if a rival enters, but once the rival actually enters, price wars hurt the incumbent, making the threat non-credible.",
    equilibriumConcept: "Subgame Perfection & Credible Commitment (Dixit): Irreversible capacity investment lowers post-entry marginal cost, making price wars rational post-entry.",
    policyIntervention: "Antitrust scrutiny of excessive excess capacity accumulation, predatory pricing enforcement, and regulatory barriers.",
    formalProof: {
      title: "Credibility via Irreversible Sunk Cost",
      assumptions: [
        "Incumbent chooses Capacity {Invest C, Do Not Invest}. Challenger chooses {Enter, Stay Out}.",
        "Without capacity: Incumbent prefers Accommodate (profit 4) over Fight (profit 1) post-entry.",
        "With capacity: Irreversible sunk investment lowers post-entry cost; Fight yields 3 while Accommodate yields 2."
      ],
      steps: [
        "Subgame without investment: Challenger knows Incumbent will Accommodate. Challenger enters.",
        "Subgame with investment: Incumbent's post-entry best response switches from Accommodate to Fight (3 > 2).",
        "Challenger anticipates Fight (profit -1 < 0) and chooses Stay Out.",
        "Incumbent compares profit: (Monopoly with capacity - C) > (Duopoly accommodation)."
      ],
      conclusion: "Burning bridges / sinking costs transforms an empty threat into a subgame-perfect deterrence."
    }
  },

  // 6. Repeated Trust (Folk Theorem)
  6: {
    role: "Long-Term Supply Chain Partner",
    objective: "Maximize the present value of ongoing mutual cooperation across indefinite rounds",
    intuitionDilemma: "Short-term defection always yields an immediate cash bonus, but forfeits all future gains from trust when the partner retaliates with a Grim Trigger.",
    equilibriumConcept: "Friedman's Folk Theorem: Perpetual cooperation is a Subgame Perfect Nash Equilibrium if the discount factor delta exceeds the critical threshold delta*.",
    policyIntervention: "Escrow platforms, verified commercial ratings, and high-frequency repeat transaction records that increase the shadow of the future.",
    formalProof: {
      title: "Folk Theorem Threshold Derivation",
      assumptions: [
        "Stage payoffs: Cooperation R, Temptation T, Punishment P. Discount factor delta in (0, 1).",
        "Grim Trigger strategy: Cooperate until rival defects; defect forever thereafter."
      ],
      steps: [
        "Present value of perpetual cooperation: V_coop = R + delta * R + delta^2 * R + ... = R / (1 - delta).",
        "Present value of cheating in period 0: V_cheat = T + delta * P + delta^2 * P + ... = T + delta * P / (1 - delta).",
        "Cooperation is incentive compatible iff V_coop >= V_cheat.",
        "R / (1 - delta) >= T + delta * P / (1 - delta) <=> delta >= (T - R) / (T - P) = delta*."
      ],
      conclusion: "When the future is valued sufficiently (delta >= delta*), infinite retaliation sustains honest cooperation."
    }
  },

  // 7. Vickrey 2nd-Price Auction
  7: {
    role: "Private-Value Auction Bidder",
    objective: "Win the asset at the minimum possible price without overpaying beyond true valuation",
    intuitionDilemma: "Bidders instinctively think bidding below true value saves money, or bidding above value guarantees winning.",
    equilibriumConcept: "Dominant Strategy Truthful Bidding: Bidding exactly your private valuation (b = v) weakly dominates all other bids, regardless of rival bids.",
    policyIntervention: "Vickrey mechanism adoption in digital advertising (Google Ads / ad exchanges) and procurement auctions to eliminate complex bid shading.",
    formalProof: {
      title: "Weak Dominance of Truthful Bidding",
      assumptions: [
        "Bidder valuation v, bid b. Highest rival bid r. Winner pays r.",
        "Payoff: v - r if b > r; 0 if b < r; tie split if b = r."
      ],
      steps: [
        "Case 1 (b > v): If r >= b > v, payoff is 0 (same as b = v). If b > r > v, bidder wins but pays r > v, incurring negative surplus v - r < 0. Bidding b = v avoids this loss.",
        "Case 2 (b < v): If r <= b < v, bidder wins and pays r (same as b = v). If b < r < v, bidder loses and earns 0, but bidding b = v would have won with positive surplus v - r > 0.",
        "Case 3 (b = v): Yields optimal outcome across every conceivable rival bid r."
      ],
      conclusion: "Truthful bidding b* = v is a dominant strategy; no competitor knowledge or estimation is required."
    }
  },

  // 8. First-Price Auction
  8: {
    role: "Competitive Procurement Bidder",
    objective: "Balance the probability of winning against the profit margin earned upon winning",
    intuitionDilemma: "Bidding your true valuation leaves zero profit if you win. You must shade your bid below value, but shading too low lowers your probability of winning.",
    equilibriumConcept: "Bayesian Nash Equilibrium: Symmetrical bidders shade bids according to the equilibrium bidding function b*(v) = ((N-1)/N) * v for uniform values.",
    policyIntervention: "Auction reserve prices, setting floor bids to extract consumer surplus for the auctioneer.",
    formalProof: {
      title: "Optimal Bid Shading Derivation",
      assumptions: [
        "N risk-neutral bidders with private values v_i ~ Uniform[0, 1].",
        "Bidding function b(v) is strictly increasing and differentiable."
      ],
      steps: [
        "Probability of winning with bid b: Prob(b > b(V_j) for all j) = Prob(V_j < b^-1(b))^(N-1) = (b^-1(b))^(N-1).",
        "Bidder i chooses b to maximize expected surplus: Max_b (v_i - b) * (b^-1(b))^(N-1).",
        "Taking FOC with respect to bid b and imposing symmetry b = b(v) yields the differential equation b'(v) = (N-1)(v - b(v)) / v.",
        "Integrating with boundary condition b(0) = 0 yields b*(v) = ((N-1) / N) * v."
      ],
      conclusion: "As competition N increases, bid shading vanishes ((N-1)/N -> 1) and bids approach true valuations."
    }
  },

  // 9. Split the Pie Bargaining
  9: {
    role: "Corporate Merger Negotiator",
    objective: "Capture the maximum share of joint economic surplus while guarding against negotiation breakdown",
    intuitionDilemma: "Equal 50/50 splits feel fair, but if one party has a lucrative outside option (threat point) or superior patience, the bargaining outcome shifts dramatically.",
    equilibriumConcept: "Generalized Nash Bargaining Solution: Maximizes the asymmetric Nash product (x_1 - d_1)^alpha * (x_2 - d_2)^(1-alpha).",
    policyIntervention: "Binding arbitration, third-party mediation, and establishing institutional fallback minimums.",
    formalProof: {
      title: "Nash Bargaining Product Maximization",
      assumptions: [
        "Total surplus S. Disagreement threat points d1, d2 with d1 + d2 < S. Bargaining power alpha in (0, 1).",
        "Surplus allocation (x1, x2) subject to x1 + x2 = S, x1 >= d1, x2 >= d2."
      ],
      steps: [
        "Objective: Maximize ln[ (x1 - d1)^alpha * (S - x1 - d2)^(1-alpha) ] = alpha * ln(x1 - d1) + (1-alpha) * ln(S - x1 - d2).",
        "FOC with respect to x1: alpha / (x1 - d1) - (1 - alpha) / (S - x1 - d2) = 0.",
        "Rearranging: alpha * (S - x1 - d2) = (1 - alpha) * (x1 - d1).",
        "Solving for x1: x1* = d1 + alpha * (S - d1 - d2); x2* = d2 + (1 - alpha) * (S - d1 - d2)."
      ],
      conclusion: "Each player receives their fallback threat point plus their proportional share of net surplus."
    }
  },

  // 10. Costly Signaling (Spence)
  10: {
    role: "Job Applicant / Hiring Executive",
    objective: "Signal unobservable high productivity through education credentials that are prohibitively costly for low-skill types",
    intuitionDilemma: "Why spend years and thousands on degrees that teach no job-specific skills? Because credentials separate high-ability workers from low-ability imitators.",
    equilibriumConcept: "Separating Perfect Bayesian Equilibrium (PBE): High-ability types acquire educational signal e*, while low-ability types acquire zero education.",
    policyIntervention: "Public subsidies for skill credentialing, direct performance trials, and anti-credentialism hiring reforms.",
    formalProof: {
      title: "Spence Single-Crossing Condition",
      assumptions: [
        "Productivity theta in {theta_L, theta_H} with theta_H > theta_L. Wages w = E[theta | e].",
        "Cost of education c(e, theta) = e / theta. Note: dc/de is strictly lower for theta_H."
      ],
      steps: [
        "Incentive Compatibility for Low Type: Wage(theta_L) >= Wage(theta_H) - c(e*, theta_L) => theta_L >= theta_H - e* / theta_L => e* >= theta_L * (theta_H - theta_L).",
        "Incentive Compatibility for High Type: Wage(theta_H) - c(e*, theta_H) >= Wage(theta_L) => theta_H - e* / theta_H >= theta_L => e* <= theta_H * (theta_H - theta_L).",
        "Least-cost separating equilibrium (Riley condition): e* = theta_L * (theta_H - theta_L).",
        "High types invest in education purely to prevent pooling with low types."
      ],
      conclusion: "Education serves as an informational filter; if costs are equalized, signaling fails entirely."
    }
  },

  // 11. Beauty Contest (2/3 Average)
  11: {
    role: "Keynesian Financial Speculator",
    objective: "Guess closest to 2/3 of the average guess among all participating market players",
    intuitionDilemma: "If people guess randomly around 50, you should guess 33. But if others think of 33, you should guess 22. How deep does strategic reasoning go?",
    equilibriumConcept: "Iterated Elimination of Weakly Dominated Strategies: The unique Nash Equilibrium is 0 (or 1 in integer bounds).",
    policyIntervention: "Market circuit breakers, macro-prudential liquidity reserves, and transparency releases to anchor second-order expectations.",
    formalProof: {
      title: "Iterated Elimination of Dominated Strategies",
      assumptions: [
        "Guesses g_i in [0, 100]. Target T = (2/3) * (1/N) * sum g_i.",
        "Common knowledge of rationality."
      ],
      steps: [
        "Round 1: Maximum possible average is 100. Target cannot exceed 2/3 * 100 = 66.7. All guesses > 66.7 are strictly dominated.",
        "Round 2: Since no rational player guesses > 66.7, maximum average is 66.7. Target cannot exceed (2/3)^2 * 100 = 44.4.",
        "Round k: Maximum surviving guess is bounded by (2/3)^k * 100.",
        "As k -> infinity, (2/3)^k -> 0. The unique surviving profile is g_i = 0 for all i."
      ],
      conclusion: "In real experiments, average reasoning depth is Level 2–3 (guesses ~22–33); playing Nash (0) against humans loses!"
    }
  },

  // 12. Public Goods
  12: {
    role: "Community Member / Co-Investor",
    objective: "Maximize total individual wealth between private consumption and shared public goods",
    intuitionDilemma: "Investing $1 into the public pool multiplies into $2 shared by all 4 members ($0.50 per person). Society gains $1 net, but the individual investor loses $0.50!",
    equilibriumConcept: "Free-Rider Dominance: Because MPCR = m/N < 1, zero contribution is a strictly dominant strategy, leading to 100% underfunding.",
    policyIntervention: "Tax-funded mandatory contributions, matching grants (lowering private contribution cost), and social ostracism / public disclosure.",
    formalProof: {
      title: "Marginal Per-Capita Return (MPCR) Dominance",
      assumptions: [
        "Endowment E. Contribution c_i in [0, E]. Group size N. Multiplier m with 1 < m < N.",
        "Individual payoff: U_i = (E - c_i) + (m / N) * sum c_j."
      ],
      steps: [
        "Derivative with respect to own contribution: dU_i / dc_i = -1 + m / N.",
        "Since m < N, MPCR = m / N < 1, which implies dU_i / dc_i < 0 strictly.",
        "For any contribution by others, contributing 0 yields strictly higher individual payoff than contributing c_i > 0.",
        "Social derivative: sum (dU_j / dc_i) = -1 + N * (m / N) = m - 1 > 0. Social optimum requires c_i = E."
      ],
      conclusion: "Private return (-$0.50/$) contradicts social return (+$1.00/$), causing catastrophic under-provision."
    }
  },

  // 13. Stag Hunt
  13: {
    role: "Tribal Hunter / Collaborative Engineer",
    objective: "Choose between hunting high-value Stag (requires full team) or hunting safe Hare (solo)",
    intuitionDilemma: "Hunting Stag yields massive payoff if your partner coordinates, but leaves you with 0 if they panic. Hare guarantees food with zero partner risk.",
    equilibriumConcept: "Equilibrium Selection Conflict: Payoff Dominance (Stag, Stag) vs. Risk Dominance (Hare, Hare).",
    policyIntervention: "Focal point leadership, binding mutual vows, pre-play communication, and insurance safety nets against partner defection.",
    formalProof: {
      title: "Harsanyi-Selten Risk Dominance Threshold",
      assumptions: [
        "Payoffs: Stag/Stag = (S, S), Hare/Hare = (H, H), Stag/Hare = (0, H), Hare/Stag = (H, 0) with S > H > 0.",
        "Belief probability that partner plays Stag is p."
      ],
      steps: [
        "Expected payoff from hunting Stag: E[U(Stag)] = p * S + (1 - p) * 0 = p * S.",
        "Expected payoff from hunting Hare: E[U(Hare)] = p * H + (1 - p) * H = H.",
        "Stag is optimal iff E[U(Stag)] >= E[U(Hare)] <=> p * S >= H <=> p >= H / S = p*.",
        "If confidence p < H/S, rational agents select the risk-dominant Hare equilibrium, abandoning the social optimum."
      ],
      conclusion: "Coordination failures arise not from malice, but from strategic fear of counterpart hesitation."
    }
  },

  // 14. Continuous Bertrand Duopoly
  14: {
    role: "Industrial Commodity Pricing Executive",
    objective: "Set continuous price P in [MC, 100] to capture market demand Q = max(0, 100 - P)",
    intuitionDilemma: "Setting price above marginal cost yields profit, but if your rival sets P - 0.01, they capture the entire market and you earn zero.",
    equilibriumConcept: "The Bertrand Paradox: With identical goods and constant marginal cost, price equals marginal cost (P1 = P2 = MC) and economic profit is zero.",
    policyIntervention: "Horizontal product differentiation, capacity constraints (Edgeworth cycle), or search friction / brand loyalty.",
    formalProof: {
      title: "Bertrand Discontinuous Best-Response Jump",
      assumptions: [
        "Homogeneous good, demand Q(P) = 100 - P, constant marginal cost MC.",
        "Firm with lowest price captures 100% demand. Tied prices split demand 50/50."
      ],
      steps: [
        "If Firm 2 sets P2 > MC, Firm 1's profit is maximized by setting P1 = P2 - epsilon, capturing all demand: Pi_1 = (P2 - epsilon - MC) * Q(P2).",
        "Firm 2 responds by setting P2 = P1 - epsilon.",
        "Undercutting continues iteratively until P1 = P2 = MC.",
        "At P = MC, no firm can undercut (profit becomes negative) and neither can raise price (demand drops to 0)."
      ],
      conclusion: "Just two competitors suffice to eliminate all monopoly rents under pure price competition."
    }
  },

  // 15. Hawk-Dove Brinkmanship
  15: {
    role: "Military Commander / Territorial Competitor",
    objective: "Secure contested territory/prize V while avoiding devastating bilateral conflict cost C",
    intuitionDilemma: "Playing aggressive Hawk intimidates peaceful Doves, but when two Hawks collide, mutual injury severely exceeds the value of the prize.",
    equilibriumConcept: "Evolutionarily Stable Strategy (ESS) in Mixed Strategies: Equilibrium aggressive population fraction p*(Hawk) = V / C.",
    policyIntervention: "Clear property rights conventions ('Bourgeois strategy': defend if owner, yield if intruder) to eliminate conflict.",
    formalProof: {
      title: "ESS Mixing Probability Derivation",
      assumptions: [
        "Prize value V, catastrophic injury cost C with C > V > 0.",
        "Payoffs: Hawk vs Hawk = (V - C)/2; Hawk vs Dove = V; Dove vs Dove = V/2; Dove vs Hawk = 0."
      ],
      steps: [
        "Let p be the probability of playing Hawk. Expected payoff to Hawk: E[W_H] = p * (V - C)/2 + (1 - p) * V = V - p * (V + C)/2.",
        "Expected payoff to Dove: E[W_D] = p * 0 + (1 - p) * V/2 = (1 - p) * V/2.",
        "In mixed ESS equilibrium, E[W_H] = E[W_D]: V - p * (V + C)/2 = (1 - p) * V/2.",
        "Simplifying: V - p*V/2 - p*C/2 = V/2 - p*V/2 => V/2 = p*C/2 => p* = V / C."
      ],
      conclusion: "As the injury cost C escalates relative to prize V, the rational population must become strictly more peaceful."
    }
  },

  // 16. Ultimatum Bargaining
  16: {
    role: "Proposer / Responder",
    objective: "Propose a split of $10 that the responder will accept, or decide whether to reject an unfair offer",
    intuitionDilemma: "Standard theory says responders should accept any positive offer ($1 > $0), but human pride and inequity aversion cause responders to burn money to punish unfair proposers.",
    equilibriumConcept: "Subgame Perfect Nash: Proposer offers epsilon ($1) and Responder accepts. Behavioral Equilibrium: Offers center around $4–$5 due to fear of rejection.",
    policyIntervention: "Anonymous double-blind bargaining, algorithmic division rules, or structured counter-offer stages.",
    formalProof: {
      title: "Inequity Aversion Rejection Threshold (Fehr-Schmidt)",
      assumptions: [
        "Total pot M. Proposer offers s, keeps M - s. Responder utility: U_R(s) = s - alpha * max(M - 2s, 0).",
        "alpha measures responder aversion to disadvantageous inequality."
      ],
      steps: [
        "If responder rejects, payoff is 0. Responder accepts iff U_R(s) >= 0.",
        "For an unfair offer s < M/2: s - alpha * (M - 2s) >= 0 => s * (1 + 2*alpha) >= alpha * M.",
        "Minimum Acceptable Offer (MAO): s* = (alpha / (1 + 2*alpha)) * M.",
        "If alpha = 1 (strong fairness preference), MAO s* = (1/3) * M = 33.3% of the pot."
      ],
      conclusion: "Emotionally rational rejection converts fairness into a credible economic bargaining power."
    }
  },

  // 17. Matching Pennies
  17: {
    role: "Attacker / Inspector",
    objective: "Out-guess the opponent's choice in a pure zero-sum strategic conflict",
    intuitionDilemma: "Any predictable pattern—like favoring Heads because it feels intuitive—is instantly detected and exploited by the opponent.",
    equilibriumConcept: "Minimax Theorem (Von Neumann): The unique equilibrium requires perfect randomization (p* = 0.5, q* = 0.5 for symmetric payoffs).",
    policyIntervention: "Randomized audit protocols (IRS audits, TSA baggage checks) to prevent evasion.",
    formalProof: {
      title: "Minimax Zero-Sum Theorem",
      assumptions: [
        "Zero-sum 2x2 matrix: Player 1 (Matcher) wins +1 on match; Player 2 (Mismatcher) wins +1 on mismatch.",
        "No pure strategy Nash equilibrium exists."
      ],
      steps: [
        "Let p = Prob(Player 1 plays Heads). Player 2's expected payoffs: E[U_2(Heads)] = -p + (1-p) = 1 - 2p; E[U_2(Tails)] = p - (1-p) = 2p - 1.",
        "Player 1 chooses p to equalize Player 2's payoffs: 1 - 2p = 2p - 1 => 4p = 2 => p* = 0.5.",
        "Symmetrically, Player 2 chooses q = Prob(Heads) such that Player 1 is indifferent: q* = 0.5.",
        "Expected value of the game is exactly 0 for both players."
      ],
      conclusion: "Deliberate randomization is the only strategy that cannot be exploited by an intelligent rival."
    }
  },

  // 18. Battle of the Sexes
  18: {
    role: "Coordinating Partner",
    objective: "Coordinate on the same event while pursuing your personal preference",
    intuitionDilemma: "Both players prefer attending the same event over being separated, but each prefers a different destination.",
    equilibriumConcept: "Two Pure Nash Equilibria (Opera, Opera) & (Football, Football), plus one Pareto-inefficient Mixed Nash Equilibrium.",
    policyIntervention: "Alternating turn-taking conventions, coin-flip arbitration, or side payments.",
    formalProof: {
      title: "Coordination & Mixed Inefficiency",
      assumptions: [
        "Payoffs: (Opera, Opera) = (3, 2); (Football, Football) = (2, 3); split = (0, 0).",
        "Let p = Prob(P1 plays Opera), q = Prob(P2 plays Opera)."
      ],
      steps: [
        "P1 chooses p to make P2 indifferent: E[U_2(Opera)] = 2p; E[U_2(Football)] = 3(1-p).",
        "Equating: 2p = 3 - 3p => p* = 3/5 = 0.60.",
        "P2 chooses q to make P1 indifferent: E[U_1(Opera)] = 3q; E[U_1(Football)] = 2(1-q).",
        "Equating: 3q = 2 - 2q => q* = 2/5 = 0.40.",
        "Expected payoff in mixed equilibrium: E[U_1] = 3 * (2/5) = 1.2 pts (drastically worse than both pure equilibria: 2 or 3 pts)."
      ],
      conclusion: "Uncoordinated mixed strategies result in frequent coordination failures and deadweight welfare loss."
    }
  },

  // 19. The Trust Game
  19: {
    role: "Investor (Trustor) / Trustee",
    objective: "Generate wealth through investment multiplication and share the returned surplus",
    intuitionDilemma: "Sending money triples the investment, creating massive social surplus. But once the trustee has the money, pure self-interest dictates keeping 100% and returning $0.",
    equilibriumConcept: "Subgame Perfection: Trustee returns 0, so Investor sends 0 (zero surplus). Empirical Outcome: Reciprocity generates substantial investment and returns.",
    policyIntervention: "Third-party escrow accounts, smart contracts, and reputational collateral.",
    formalProof: {
      title: "Backward Induction vs. Reciprocal Capital",
      assumptions: [
        "Investor sends S in [0, 10]. Multiplier M = 3. Trustee receives 3S and returns R in [0, 3S].",
        "Investor payoff: 10 - S + R. Trustee payoff: 3S - R."
      ],
      steps: [
        "Subgame at Node 2: Trustee chooses R to maximize 3S - R. Since d/dR = -1 < 0, optimal return is R* = 0.",
        "Node 1: Investor anticipates R* = 0. Investor chooses S to maximize 10 - S + 0. Since d/dS = -1 < 0, S* = 0.",
        "SPNE outcome: (S* = 0, R* = 0). Total wealth created is 10 instead of potential 30.",
        "If Trustee utility includes guilt aversion U_T = (3S - R) - gamma * max(S - R, 0), return R >= S is sustained."
      ],
      conclusion: "Without trust or enforcement, potential 300% economic multiplication is entirely forfeited."
    }
  },

  // 20. The Centipede Paradox
  20: {
    role: "Sequential Player",
    objective: "Pass the growing coin pot to multiply wealth across sequential rounds without getting betrayed",
    intuitionDilemma: "Passing doubles the pot every turn. If both pass to the end, both walk away rich. But whoever takes the pot first gets slightly more than the other.",
    equilibriumConcept: "Backward Induction Paradox (Rosenthal): Iterating backwards from the final round proves the unique SPNE is to Take on Round 1!",
    policyIntervention: "Graduated withdrawal penalties, delayed escrow disbursement, and institutional loyalty bonuses.",
    formalProof: {
      title: "Inductive Unraveling to Round 1",
      assumptions: [
        "Pot grows sequentially over T rounds. In round t, Player i can Pass (grows pot) or Take (gets 2^t, rival gets 2^(t-2))."
      ],
      steps: [
        "Terminal round T: Player whose turn it is compares Take (high payoff) vs Pass (end of game). Take strictly dominates.",
        "Round T-1: Player knows the opponent will Take in round T. Therefore, passing yields less than Taking immediately in round T-1.",
        "Inductive hypothesis: If it is optimal to Take in round k+1, it is optimal to Take in round k.",
        "By backward induction, Player 1 must Take at the very first node (t = 1)."
      ],
      conclusion: "Backward induction predicts immediate collapse, yet empirical human players cooperate for many rounds."
    }
  },

  // 21. Cournot Duopoly
  21: {
    role: "Industrial Manufacturing Executive",
    objective: "Choose production quantity q_i to maximize corporate operating profit given market price P = A - b*(q_1 + q_2)",
    intuitionDilemma: "Producing more units increases your sales volume, but drives down the clearing market price for every unit sold by both firms.",
    equilibriumConcept: "Cournot-Nash Equilibrium: The intersection of reaction functions BR_1(q_2) and BR_2(q_1), producing q* = (A - c)/(3b).",
    policyIntervention: "Antitrust production quota limits, cartel surveillance, and trade import tariffs.",
    formalProof: {
      title: "Cournot Reaction Function Derivation",
      assumptions: [
        "Inverse market demand P = A - b*(q1 + q2). Constant marginal cost c with A > c.",
        "Profit for Firm 1: Pi_1 = (A - b*q1 - b*q2 - c) * q1."
      ],
      steps: [
        "First-Order Condition (FOC): dPi_1 / dq1 = A - 2b*q1 - b*q2 - c = 0.",
        "Best-Response function: BR_1(q2) = (A - c - b*q2) / (2b).",
        "Imposing symmetry q1 = q2 = q* in BR_1: q* = (A - c - b*q*) / (2b) => 2b*q* = A - c - b*q* => 3b*q* = A - c.",
        "Cournot Nash quantity: q* = (A - c) / (3b). Market price P* = (A + 2c) / 3."
      ],
      conclusion: "Cournot yields higher output and lower prices than a monopoly, but lower output than perfect competition."
    }
  },

  // 22. Hotelling Beach (Spatial)
  22: {
    role: "Storefront Location Planner",
    objective: "Locate on a 1km beachfront [0, 1] to capture maximum walking bathers",
    intuitionDilemma: "Spreading apart (locations 0.25 and 0.75) minimizes customer walking distance and maximizes social welfare, but each store wants to sneak toward the center to steal the other's customers.",
    equilibriumConcept: "Principle of Minimum Differentiation: Both stores cluster at the exact center (x1 = x2 = 0.50).",
    policyIntervention: "Municipal zoning laws, minimum commercial distance requirements, and environmental buffer zones.",
    formalProof: {
      title: "Centripetal Incentive to Median Cluster",
      assumptions: [
        "Customers distributed uniformly on [0, 1]. Prices fixed. Customers visit closest store.",
        "Store 1 at x1, Store 2 at x2 with x1 <= x2. Midpoint m = (x1 + x2) / 2."
      ],
      steps: [
        "Store 1 market share: S_1 = m = (x1 + x2) / 2. Derivative with respect to x1: dS_1 / dx1 = 1/2 > 0.",
        "Store 1 always gains market share by moving right toward Store 2, as long as x1 < x2.",
        "Store 2 market share: S_2 = 1 - m = 1 - (x1 + x2)/2. dS_2 / dx2 = -1/2 < 0. Store 2 moves left toward Store 1.",
        "The unique Nash equilibrium occurs when both locate at the median: x1* = x2* = 0.50."
      ],
      conclusion: "Strategic location competition eliminates product diversity, forcing identical centrist positioning."
    }
  },

  // 23. Colonel Blotto (3 Fronts)
  23: {
    role: "Campaign Strategist / Field General",
    objective: "Allocate 100 troops across 3 battlefields to win the majority of fronts",
    intuitionDilemma: "Spreading troops equally (33, 33, 34) is vulnerable to a rival who concentrates (50, 50, 0); but concentrating on 2 fronts loses if the rival anticipates your vacant front.",
    equilibriumConcept: "Multi-Dimensional Resource Allocation: No pure strategy Nash equilibrium exists; optimal play requires randomized troop deployments.",
    policyIntervention: "Intelligence gathering, aerial surveillance, and dynamic real-time troop redeployment protocols.",
    formalProof: {
      title: "Cyclic Dominance in Blotto Games",
      assumptions: [
        "100 total troops. Allocations (x1, x2, x3) with sum x_i = 100.",
        "Win front i if x_i > y_i. Objective: Win at least 2 out of 3 fronts."
      ],
      steps: [
        "Profile A (Balanced: 33, 33, 34) is defeated by Profile B (Focused: 40, 40, 20), which wins fronts 1 and 2.",
        "Profile B is defeated by Profile C (Targeted: 0, 50, 50), which wins fronts 2 and 3.",
        "Profile C is defeated by Profile A (wins fronts 1 and 3).",
        "Formally: Win relation is non-transitive (cyclic Rock-Paper-Scissors structure)."
      ],
      conclusion: "Fixed troop distributions invite counter-concentration; defense requires strategic troop uncertainty."
    }
  },

  // 24. Common-Value Oil Auction
  24: {
    role: "Offshore Oil Exploration Geologist",
    objective: "Bid for drilling rights where the true oil reserve value V is identical for all bidders, but signals are noisy",
    intuitionDilemma: "If everyone estimates the tract's value and bids aggressively, the winner is simply the bidder who had the most overly optimistic error—leading to financial ruin!",
    equilibriumConcept: "The Winner's Curse: Conditioning your bid on winning requires assuming your signal was the highest among all N bidders.",
    policyIntervention: "Independent certified geological surveys, exploratory joint ventures, and disciplined bid haircuts.",
    formalProof: {
      title: "Bidding Haircut to Avert Winner's Curse",
      assumptions: [
        "Common value V ~ Uniform[0, V_max]. Each bidder receives noisy estimate X_i = V + epsilon_i.",
        "Winning condition: Bidding highest implies X_i = max(X_1, ..., X_N) = X_(N)."
      ],
      steps: [
        "Naive bidding: Bidding E[V | X_i = x] results in winning only when X_i was the maximum noise error.",
        "Expected value conditional on winning: E[V | X_i = max X_j] < E[V | X_i].",
        "If you do not adjust for this selection bias, E[Profit | Win] = E[V | Win] - Bid < 0 (Winner's Curse).",
        "Equilibrium bid function must condition on being the highest: b*(x) = E[V | X_1 = x, X_(2) = x].",
        "This requires a severe discount (haircut) that deepens as the number of rival bidders N grows."
      ],
      conclusion: "The more competitors in a common-value auction, the more conservatively you must bid to avoid bankruptcy."
    }
  },

  // 25. Escalating Dollar Auction
  25: {
    role: "Auction Contestant",
    objective: "Win a $1 bill in ascending bids, knowing the second-highest bidder must also pay their full bid",
    intuitionDilemma: "You bid $0.80 for $1.00. Rival bids $0.90. If you stop, you lose $0.80. If you bid $1.00, you break even. If rival bids $1.10, you bid $1.20 to lose $0.20 instead of $1.00!",
    equilibriumConcept: "Sunk Cost Escalation Trap: Bidders bid far above the face value of the prize to minimize immediate losses.",
    policyIntervention: "Hard pre-commitment stop-loss rules, entry qualification fees, and auctioneer transparency restrictions.",
    formalProof: {
      title: "Dynamic Programming of Sunk Cost Escalation",
      assumptions: [
        "Item value V = $1. Current high bid b_H, second bid b_L with b_H > b_L.",
        "Rule: Both top two bidders pay their bids; only high bidder receives V."
      ],
      steps: [
        "Decision for second bidder at bid b_L: Pass (incur loss -b_L) vs. Raise to b_H + delta (prospective payoff V - (b_H + delta)).",
        "Raising is locally rational if: V - (b_H + delta) > -b_L <=> b_H - b_L < V - delta.",
        "Once both bids exceed V, bidders are no longer playing to gain profit, but to minimize losses: -b_L vs -(b_H + delta - V).",
        "Since loss from raising (-$0.20) is less than loss from dropping out (-$1.00), bids escalate indefinitely."
      ],
      conclusion: "The only rational move in a Dollar Auction is never to enter (b = 0) in the first place."
    }
  },

  // 26. Traveler's Dilemma (Basu)
  26: {
    role: "Airline Passenger with Damaged Luggage",
    objective: "Claim an integer valuation between $2 and $100 for identical damaged antique vases",
    intuitionDilemma: "If both claim $100, both receive $100. But if you claim $99, you get $99 + $2 reward = $101, while your rival gets $99 - $2 penalty = $97. Strict logic unravels down to $2!",
    equilibriumConcept: "Iterated Elimination of Strictly Dominated Strategies: Unique Nash Equilibrium is ($2, $2). Human empirical play consistently clusters at ($98–$100).",
    policyIntervention: "Standardized fixed reimbursement tables and higher compensation caps to eliminate competitive undercutting.",
    formalProof: {
      title: "Iterated Dominance Unraveling to Minimal Floor",
      assumptions: [
        "Claims x, y in {2, 3, ..., 100}. Reward/Penalty R >= 2.",
        "Payoff to player claiming x: If x = y: x. If x < y: x + R. If x > y: y - R."
      ],
      steps: [
        "Consider claim 100 vs claim 99: If rival plays 100: Payoff(99) = 101 > Payoff(100) = 100. If rival plays < 100: Claim 99 yields >= claim 100. Claim 100 is weakly dominated by 99.",
        "Once 100 is eliminated, claim 99 is dominated by 98 by the identical argument.",
        "Iterating across all integers from 100 down to 3 eliminates every strategy above 2.",
        "The unique surviving profile by iterated dominance is (x* = 2, y* = 2)."
      ],
      conclusion: "Basu's paradox proves that hyper-rational backward induction can be disastrously ill-suited to human reality."
    }
  },

  // 27. Renewable Fishery Commons
  27: {
    role: "Trawler Fleet Operations Director",
    objective: "Maximize annual catch profit without depleting the reproductive ocean fish biomass below collapse",
    intuitionDilemma: "Leaving fish in the ocean allows the stock to regenerate for next year. But fish you leave behind are simply caught today by rival fleets!",
    equilibriumConcept: "Bioeconomic Open-Access Tragedy of the Commons: Fleet expansion continues until economic rent is completely dissipated.",
    policyIntervention: "Individual Transferable Quotas (ITQs), marine protected reserve zones, and seasonal fleet limits.",
    formalProof: {
      title: "Gordon-Schaefer Bioeconomic Commons Model",
      assumptions: [
        "Biomass growth G(S) = r*S*(1 - S/K). Catch H = q*E*S where E is total fishing effort.",
        "Revenue P*H, fishing cost c*E. Sustainable yield requires H = G(S)."
      ],
      steps: [
        "Open-access equilibrium: Boats enter until total industry profit is zero: Pi = P*q*E*S - c*E = 0 => S_open = c / (P*q).",
        "Social optimum: Maximize joint resource rent: Max_E [ P*q*E*S(E) - c*E ].",
        "FOC yields Maximum Economic Yield (MEY) stock: S_MEY = (K/2) + c/(2*P*q) > S_open.",
        "Open access overfishes past the biological maximum sustainable yield, risking reproductive collapse."
      ],
      conclusion: "Without property rights or ITQs, private competition drives self-sustaining natural assets to extinction."
    }
  },

  // 28. Market for Lemons (Akerlof)
  28: {
    role: "Used Car Buyer / Dealership Owner",
    objective: "Purchase used vehicles where sellers know true quality theta in [2000, 8000], but buyers only observe the market average",
    intuitionDilemma: "Buyers are willing to pay for average quality. But owners of high-quality 'peaches' refuse to sell at the average price, leaving only 'lemons' in the market!",
    equilibriumConcept: "Adverse Selection Death Spiral: Information asymmetry eliminates high-quality trade, causing market unravelling.",
    policyIntervention: "Lemon laws, mandatory vehicle inspection certifications (CARFAX), and dealer warranties.",
    formalProof: {
      title: "Akerlof's Adverse Selection Unraveling",
      assumptions: [
        "Car quality theta ~ Uniform[2000, 8000]. Seller valuation = theta; Buyer valuation = 1.2 * theta.",
        "Sellers put cars on market iff offered price P >= theta."
      ],
      steps: [
        "At offered price P, only sellers with quality theta <= P supply cars.",
        "Average quality of supplied cars: E[theta | theta <= P] = (2000 + P) / 2.",
        "Buyer expected valuation for cars on the market: V_buyer = 1.2 * (2000 + P) / 2 = 1200 + 0.6 * P.",
        "Buyers will trade only if V_buyer >= P <=> 1200 + 0.6 * P >= P <=> 1200 >= 0.4 * P <=> P <= 3000.",
        "Any price P > 3000 causes buyers to lose money on average, removing all cars with quality > 3000 from the market."
      ],
      conclusion: "Asymmetric information acts as an implicit tax on quality, destroying mutually beneficial gains from trade."
    }
  }
};
