// Mission Engine for the What-If Laboratory
// Provides prominent guiding questions, challenge goals, automated solution evaluations,
// and plain-language verdicts for all 28 curriculum games + custom matrix tool.

export interface MissionVerdict {
  isSolved: boolean;
  statusText: string;
  verdictHeadline: string;
  explanation: string;
  welfareChangeText?: string;
  isParetoOptimal?: boolean;
}

export interface GameMission {
  gameId: number;
  guidingQuestion: string;
  challengeGoal: string;
  targetMetricName: string;
}

export const GAME_MISSIONS: Record<number, GameMission> = {
  1: {
    gameId: 1,
    guidingQuestion: "Can legal penalties or bonuses make mutual cooperation the rational choice?",
    challengeGoal: "Eliminate defection as a dominant strategy so both players rationally cooperate.",
    targetMetricName: "Equilibrium Stability"
  },
  2: {
    gameId: 2,
    guidingQuestion: "Can a first mover credibly deter rival entry without unprofitable price wars?",
    challengeGoal: "Set market costs or commitments so rival entry yields negative payoff, protecting monopoly.",
    targetMetricName: "First-Mover Monopoly Capture"
  },
  3: {
    gameId: 3,
    guidingQuestion: "Can price-matching guarantees stop destructive price-slashing price wars?",
    challengeGoal: "Enable price-matching policy so neither store has an incentive to undercut the other.",
    targetMetricName: "Price War Neutralization"
  },
  4: {
    gameId: 4,
    guidingQuestion: "Can retail stores avoid price clashes without formal illegal collusion?",
    challengeGoal: "Balance promotional schedules so stores coordinate on separate shopping days.",
    targetMetricName: "Schedule Coordination"
  },
  5: {
    gameId: 5,
    guidingQuestion: "Does sinking capital into idle capacity credibly scare off new entrants?",
    challengeGoal: "Invest sufficient capacity so rival anticipates aggressive post-entry pricing and stays out.",
    targetMetricName: "Credible Entry Deterrence"
  },
  6: {
    gameId: 6,
    guidingQuestion: "How patient must partners be for the shadow of the future to sustain cooperation?",
    challengeGoal: "Raise discount factor delta above the threshold where future punishment outweighs cheating temptation.",
    targetMetricName: "Repeat Cooperation Stability"
  },
  7: {
    gameId: 7,
    guidingQuestion: "Why is truthful bidding a dominant strategy regardless of rival behavior?",
    challengeGoal: "Verify that bidding exactly your valuation never forfeits surplus or causes overpayment.",
    targetMetricName: "Truthful Dominance"
  },
  8: {
    gameId: 8,
    guidingQuestion: "How much bid shading maximizes expected surplus against uncertain rivals?",
    challengeGoal: "Calculate the optimal bid discount below true valuation that balances winning odds with profit margin.",
    targetMetricName: "Optimal Bid Shading"
  },
  9: {
    gameId: 9,
    guidingQuestion: "How do outside threat options and bargaining power shift the final split?",
    challengeGoal: "Alter threat points and bargaining power to capture more than 50% of the surplus.",
    targetMetricName: "Generalized Nash Surplus"
  },
  10: {
    gameId: 10,
    guidingQuestion: "Can education credential costs separate high-productivity talent from low?",
    challengeGoal: "Set credential costs such that only high-type workers find education profitable (separating equilibrium).",
    targetMetricName: "Separating Equilibrium"
  },
  11: {
    gameId: 11,
    guidingQuestion: "Can a group reach rational expectations through iterated steps of strategic thinking?",
    challengeGoal: "Iterate average guesses downward to zero through higher-level recursive reasoning.",
    targetMetricName: "Level-k Convergence"
  },
  12: {
    gameId: 12,
    guidingQuestion: "What tax or collective multiplier prevents free-riders from destroying public goods?",
    challengeGoal: "Adjust public return multiplier or enforcement so full contribution becomes individual best response.",
    targetMetricName: "Public Welfare Optimization"
  },
  13: {
    gameId: 13,
    guidingQuestion: "What assurance makes the risky cooperative stag hunt safer than hunting hare?",
    challengeGoal: "Reduce risk dominance threshold so players coordinate on the high-payoff Stag equilibrium.",
    targetMetricName: "Payoff Dominance Coordination"
  },
  14: {
    gameId: 14,
    guidingQuestion: "Does product differentiation or capacity limits relieve cutthroat Bertrand pricing?",
    challengeGoal: "Maintain prices above marginal cost without triggering complete demand loss to the rival.",
    targetMetricName: "Operating Margin Protection"
  },
  15: {
    gameId: 15,
    guidingQuestion: "When does escalating to Hawk become more dangerous than submitting to Dove?",
    challengeGoal: "Make injury cost exceed resource prize so mutual brinkmanship aggression is deterred.",
    targetMetricName: "Anti-Brinkmanship Stability"
  },
  16: {
    gameId: 16,
    guidingQuestion: "What minimum proposal survives fairness-sensitive emotional rejection?",
    challengeGoal: "Propose an offer that exceeds the responder's minimum acceptable offer (MAO) to prevent total loss.",
    targetMetricName: "Fairness Acceptance"
  },
  17: {
    gameId: 17,
    guidingQuestion: "Why must unpredictable mixed randomization be used in zero-sum conflict?",
    challengeGoal: "Find the mixed strategy probability that leaves the rival unable to exploit your moves.",
    targetMetricName: "Minimax Exploitation Defense"
  },
  18: {
    gameId: 18,
    guidingQuestion: "How can asymmetric partners coordinate when they prefer different venues?",
    challengeGoal: "Establish communication or focal points so both players meet at the same event.",
    targetMetricName: "Coordination Success"
  },
  19: {
    gameId: 19,
    guidingQuestion: "What return rate makes sending money to an anonymous trustee rational?",
    challengeGoal: "Increase trustee return percentage so sending the full endowment maximizes investor net return.",
    targetMetricName: "Trust Gain Realization"
  },
  20: {
    gameId: 20,
    guidingQuestion: "Why does backward induction predict early exit while human players pass money forward?",
    challengeGoal: "Observe how trust and reciprocity grow the shared pot exponentially despite game-theoretic unraveling.",
    targetMetricName: "Reciprocal Welfare Multiplication"
  },
  21: {
    gameId: 21,
    guidingQuestion: "What output quantity balances market revenue against price collapse?",
    challengeGoal: "Produce the exact Cournot-Nash quantity where neither firm has an incentive to flood the market.",
    targetMetricName: "Cournot Oligopoly Balance"
  },
  22: {
    gameId: 22,
    guidingQuestion: "Why do competing vendors cluster in the center instead of dispersing evenly?",
    challengeGoal: "Verify the Principle of Minimum Differentiation where both vendors locate at 50% on the beach.",
    targetMetricName: "Median Location Equilibrium"
  },
  23: {
    gameId: 23,
    guidingQuestion: "How does troop concentration beat an evenly distributed defender across 3 battlefields?",
    challengeGoal: "Concentrate forces on two fronts (e.g. 50/50/0) to win a 2-1 majority against balanced 34/33/33.",
    targetMetricName: "Blotto Front Concentration"
  },
  24: {
    gameId: 24,
    guidingQuestion: "How severely must you discount bids to avoid the devastating Winner's Curse?",
    challengeGoal: "Bid below your private signal estimate to account for winning only when rival estimates were lower.",
    targetMetricName: "Winner's Curse Avoidance"
  },
  25: {
    gameId: 25,
    guidingQuestion: "At what point does escalation trap rational bidders into paying $2 for $1?",
    challengeGoal: "Stop bidding before sunk costs exceed the prize value to avoid irrational escalation of commitment.",
    targetMetricName: "Escalation Trap Prevention"
  },
  26: {
    gameId: 26,
    guidingQuestion: "Why does backward induction collapse human cooperation at $100 down to $2?",
    challengeGoal: "Identify the minimal penalty reward R that prevents players from undercutting each other.",
    targetMetricName: "Undercutting Neutralization"
  },
  27: {
    gameId: 27,
    guidingQuestion: "What fishing quota prevents renewable ocean fish stocks from collapsing to zero?",
    challengeGoal: "Limit fleet effort so total extraction remains strictly below the stock's maximum sustainable yield.",
    targetMetricName: "Sustainable Yield Equilibrium"
  },
  28: {
    gameId: 28,
    guidingQuestion: "Can buyer pricing or warranties prevent high-quality cars from exiting the market?",
    challengeGoal: "Set price high enough that high-quality peaches remain on the market without buyer insolvency.",
    targetMetricName: "Adverse Selection Prevention"
  },
  999: {
    gameId: 999,
    guidingQuestion: "Can adjusting payoff payoffs transform a destructive trap into a win-win equilibrium?",
    challengeGoal: "Shift payoffs so a win-win cooperative cell becomes a stable Nash Equilibrium.",
    targetMetricName: "Nash Equilibrium Alignment"
  }
};

// Evaluates whether a given game's state resolves the core dilemma
export function evaluateGameVerdict(gameId: number, params: Record<string, any>): MissionVerdict {
  switch (gameId) {
    case 1: {
      // Prisoner's Dilemma
      const { temptation = 3, reward = 2, punishment = 1, sucker = 0 } = params;
      const isCoopStable = reward >= temptation && sucker >= punishment;
      const defectionStrictlyDominates = temptation > reward && punishment > sucker;

      if (isCoopStable) {
        return {
          isSolved: true,
          statusText: "DILEMMA SOLVED",
          verdictHeadline: "Mutual Cooperation is Now the Stable Equilibrium",
          explanation: "Because the penalty for cheating exceeds the gain (Reward >= Temptation), neither player has a reason to betray the other.",
          welfareChangeText: "+100% Social Surplus Gained",
          isParetoOptimal: true
        };
      } else if (defectionStrictlyDominates) {
        return {
          isSolved: false,
          statusText: "STRATEGIC TRAP ACTIVE",
          verdictHeadline: "Defection Strictly Dominates Cooperation",
          explanation: "Each player earns more by defecting regardless of what the partner chooses (T > R and P > S). Both end up at low payoff.",
          welfareChangeText: "Social Loss: Mutual Betrayal"
        };
      } else {
        return {
          isSolved: reward > punishment,
          statusText: reward > punishment ? "DILEMMA MITIGATED" : "STRATEGIC TRAP ACTIVE",
          verdictHeadline: reward > punishment ? "Cooperation is Conditionally Viable" : "Coordination Broken",
          explanation: "Payoffs no longer form a strict Prisoner's Dilemma; outcomes now depend on mutual trust and expectations."
        };
      }
    }

    case 2: {
      // Sequential Entry
      const { duopolyVal = 2, costToEnter = 1 } = params;
      const rivalEnters = duopolyVal - costToEnter > 0;
      if (!rivalEnters) {
        return {
          isSolved: true,
          statusText: "DILEMMA SOLVED",
          verdictHeadline: "First-Mover Captures Sustainable Monopoly",
          explanation: "Entry costs exceed rival duopoly profits, making rival entry irrational. First-mover enjoys unshared market.",
          welfareChangeText: "Monopoly Maintained"
        };
      }
      return {
        isSolved: false,
        statusText: "STRATEGIC TRAP ACTIVE",
        verdictHeadline: "Rival Entry Erodes First-Mover Advantage",
        explanation: "Because duopoly profits exceed entry costs, the rival will enter. Market splits into duopoly.",
        welfareChangeText: "Profits Split into Duopoly"
      };
    }

    case 3: {
      // Price Matching
      const { hasPriceMatchPolicy = false } = params;
      if (hasPriceMatchPolicy) {
        return {
          isSolved: true,
          statusText: "DILEMMA SOLVED",
          verdictHeadline: "Price War Neutralized via Matching Guarantee",
          explanation: "Committing to match rival prices removes their incentive to undercut. Both stores maintain high margins.",
          welfareChangeText: "+100% Margin Retention"
        };
      }
      return {
        isSolved: false,
        statusText: "STRATEGIC TRAP ACTIVE",
        verdictHeadline: "Bertrand Trap: Undercutting Triggers Margin Collapse",
        explanation: "Without price-matching, cutting prices by $1 steals all demand, forcing both stores down to marginal cost.",
        welfareChangeText: "Margins Slapped to Zero"
      };
    }

    case 6: {
      // Repeated PD discount factor
      const { delta = 0.75, temptation = 3, reward = 2, punishment = 1 } = params;
      const criticalDelta = (temptation - reward) / (temptation - punishment);
      const isCoopSustainable = delta >= criticalDelta;
      if (isCoopSustainable) {
        return {
          isSolved: true,
          statusText: "DILEMMA SOLVED",
          verdictHeadline: "Shadow of Future Sustains Infinite Cooperation",
          explanation: `Discount factor (${delta.toFixed(2)}) exceeds threshold (${criticalDelta.toFixed(2)}). Future retaliation deters cheating.`,
          welfareChangeText: "Sustained Maximum Cooperation"
        };
      }
      return {
        isSolved: false,
        statusText: "STRATEGIC TRAP ACTIVE",
        verdictHeadline: "Impatience Triggers Cooperation Collapse",
        explanation: `Discount factor (${delta.toFixed(2)}) is below threshold (${criticalDelta.toFixed(2)}). Immediate cheat gain outweighs future penalties.`,
        welfareChangeText: "Cooperation Unravels"
      };
    }

    case 7: {
      // Vickrey 2nd Price
      const { myBid = 7, trueVal = 7 } = params;
      const isTruthful = Math.abs(myBid - trueVal) < 0.01;
      if (isTruthful) {
        return {
          isSolved: true,
          statusText: "OPTIMAL BIDDING",
          verdictHeadline: "Truthful Bidding is Strictly Dominant",
          explanation: "In a 2nd-price auction, your bid decides if you win, but the competitor's bid decides what you pay. Truthful bid is optimal.",
          welfareChangeText: "Maximum Expected Surplus"
        };
      }
      return {
        isSolved: false,
        statusText: myBid > trueVal ? "RISK OF OVERPAYMENT" : "RISK OF LOST SURPLUS",
        verdictHeadline: myBid > trueVal ? "Overbidding Risks Winner's Curse" : "Underbidding Risks Forfeiting Profitable Item",
        explanation: "Deviating from your true valuation never improves your payoff in a 2nd-price auction.",
        welfareChangeText: "Suboptimal Bidding Policy"
      };
    }

    case 12: {
      // Public Goods
      const { myContr = 5, multiplier = 1.6 } = params;
      const mpcr = multiplier / 4;
      if (mpcr >= 1) {
        return {
          isSolved: true,
          statusText: "DILEMMA SOLVED",
          verdictHeadline: "Cooperation is Now Individually Dominant",
          explanation: `Marginal return per dollar (${mpcr.toFixed(2)}) >= $1. Contributing is self-rewarding even without altruism.`,
          welfareChangeText: "Maximum Group Surplus"
        };
      } else if (myContr === 10) {
        return {
          isSolved: true,
          statusText: "SOCIAL OPTIMUM REACHED",
          verdictHeadline: "Full Contribution Maximizes Group Welfare",
          explanation: "Despite free-rider temptation, full investment generates the highest possible collective surplus.",
          welfareChangeText: "Group Welfare Maximized"
        };
      }
      return {
        isSolved: false,
        statusText: "STRATEGIC TRAP ACTIVE",
        verdictHeadline: "Free-Rider Problem Depletes Shared Fund",
        explanation: `Each $1 contributed only returns $${mpcr.toFixed(2)} to the investor. Individual incentive is to contribute $0.`,
        welfareChangeText: "Underfunded Public Good"
      };
    }

    case 15: {
      // Hawk-Dove
      const { resourceVal = 6, injuryCost = 20 } = params;
      const isCostlyWar = injuryCost > resourceVal;
      if (isCostlyWar) {
        return {
          isSolved: true,
          statusText: "BRINKMANSHIP RESTRAINED",
          verdictHeadline: "Injury Cost Deters Constant Hawk Escalation",
          explanation: "Because injury exceeds prize value (Cost > Value), mutual fight is disastrous (-7). Mixed strategy or Dove preferred.",
          welfareChangeText: "Mutual Destruction Averted"
        };
      }
      return {
        isSolved: false,
        statusText: "STRATEGIC TRAP ACTIVE",
        verdictHeadline: "Hawk Dominates: Aggression Unconstrained",
        explanation: "Prize exceeds injury cost. Both players fight as Hawks, escalating conflict permanently.",
        welfareChangeText: "Escalated Confrontation"
      };
    }

    case 16: {
      // Ultimatum Game
      const { propose = 4, mao = 3 } = params;
      const isAccepted = propose >= mao;
      if (isAccepted) {
        return {
          isSolved: true,
          statusText: "DEAL ACCEPTED",
          verdictHeadline: "Offer Satisfies Fairness Threshold",
          explanation: `Your offer of $${propose} meets or exceeds the responder's minimum acceptable offer ($${mao}). Both walk away with money.`,
          welfareChangeText: "Positive Mutual Payoffs"
        };
      }
      return {
        isSolved: false,
        statusText: "OFFER REJECTED",
        verdictHeadline: "Inequity Aversion Destroys Entire Pie",
        explanation: `Offering $${propose} is below responder's threshold ($${mao}). Emotional rejection yields $0 to both players.`,
        welfareChangeText: "100% Surplus Lost"
      };
    }

    case 24: {
      // Common-Value Oil Lease
      const { myBid = 52, trueVal = 50, rivalBid = 48 } = params;
      const iWon = myBid > rivalBid;
      const profit = iWon ? trueVal - myBid : 0;
      if (iWon && profit >= 0) {
        return {
          isSolved: true,
          statusText: "PROFITABLE WIN",
          verdictHeadline: "Disciplined Bidding Avoids Winner's Curse",
          explanation: `You won the oil lease at $${myBid.toFixed(2)} and secured +$${profit.toFixed(2)} profit.`,
          welfareChangeText: `+$${profit.toFixed(2)} Net Gain`
        };
      } else if (iWon && profit < 0) {
        return {
          isSolved: false,
          statusText: "WINNER'S CURSE SUFFERED",
          verdictHeadline: "You Won the Auction but Lost Money",
          explanation: `You bid $${myBid.toFixed(2)} on a lease only worth $${trueVal.toFixed(2)}. Net loss of -$${Math.abs(profit).toFixed(2)}.`,
          welfareChangeText: `-$${Math.abs(profit).toFixed(2)} Net Loss`
        };
      }
      return {
        isSolved: true,
        statusText: "CONSERVATIVE BID",
        verdictHeadline: "Rival Overbid; You Escaped Loss",
        explanation: "Rival won the lease. By maintaining bid discipline, you avoided overpaying for an uncertain tract."
      };
    }

    case 27: {
      // Fishery Commons
      const { effortP1 = 4, effortP2 = 4 } = params;
      const totalEffort = effortP1 + effortP2;
      if (totalEffort <= 6) {
        return {
          isSolved: true,
          statusText: "SUSTAINABLE HARVEST",
          verdictHeadline: "Fishery Extraction Remains Within Carrying Capacity",
          explanation: `Combined fleet effort (${totalEffort} boats) allows fish stocks to regenerate annually, sustaining high yield.`,
          welfareChangeText: "Sustainable Maximum Yield"
        };
      }
      return {
        isSolved: false,
        statusText: "TRAGEDY OF THE COMMONS",
        verdictHeadline: "Overfishing Collapses Renewable Ocean Stock",
        explanation: `Combined effort of ${totalEffort} boats exceeds natural regeneration rate. Fish stocks decline toward extinction.`,
        welfareChangeText: "Depleted Common Resource"
      };
    }

    case 28: {
      // Lemons Market
      const { buyerPrice = 5000 } = params;
      const peachMinPrice = 6000;
      if (buyerPrice >= peachMinPrice) {
        return {
          isSolved: true,
          statusText: "MARKET RESTORED",
          verdictHeadline: "High-Quality Cars Enter the Market",
          explanation: `Offer price ($${buyerPrice.toLocaleString()}) covers the peach seller reserve ($${peachMinPrice.toLocaleString()}). Market adverse selection avoided.`,
          welfareChangeText: "High Quality Trade Active"
        };
      }
      return {
        isSolved: false,
        statusText: "ADVERSE SELECTION ACTIVE",
        verdictHeadline: "Gresham's Law: Lemons Drive Out Peaches",
        explanation: `Offer price ($${buyerPrice.toLocaleString()}) is below peach seller cost. Only defective lemons will be sold.`,
        welfareChangeText: "Market Degraded into Lemons"
      };
    }

    default: {
      // Generic default
      return {
        isSolved: true,
        statusText: "EXPLORATION ACTIVE",
        verdictHeadline: "Hypothesis Simulation Live",
        explanation: "Adjust the levers to test how individual incentives shift the equilibrium outcome."
      };
    }
  }
}
