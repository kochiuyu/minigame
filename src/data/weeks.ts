import { GameConfig } from '../types';

export const GAMES: GameConfig[] = [
  {
    id: 1,
    title: "Prisoner's Dilemma (Single-Shot)",
    shortTitle: "Prisoner's Dilemma",
    category: "Social Dilemmas & Trust",
    icon: "🤝",
    keyTakeaway: "Dominant strategy defection drives rational agents into a Pareto-inferior trap without repeated interactions.",
    purpose: "Understand why rational players often end up in a lose-lose outcome even when cooperation is better.",
    strategies: "You can choose to 'Cooperate' (work together) or 'Defect' (betray your partner).",
    payoffs: "Both Cooperate = 2 pts each. Both Defect = 1 pt each. If one Defects and one Cooperates, Defector gets 3 pts, Cooperator gets 0 pts.",
    instructions: [
      "Find a partner. Select Cooperate or Defect in Step 1 and LOCK it.",
      "On the count of three, reveal your choices simultaneously.",
      "Record your partner's choice in Step 2 and lock it to calculate your score.",
      "Find a NEW partner for the next round!"
    ],
    fields: [
      { id: 'myChoice', label: 'Your Choice', type: 'select', options: ['Cooperate', 'Defect'], step: 1 },
      { id: 'partnerChoice', label: "Partner's Choice", type: 'select', options: ['Cooperate', 'Defect'], step: 2 }
    ],
    calculate: (data) => {
      let score = 0;
      if (data.myChoice === 'Cooperate' && data.partnerChoice === 'Cooperate') score = 2;
      else if (data.myChoice === 'Cooperate' && data.partnerChoice === 'Defect') score = 0;
      else if (data.myChoice === 'Defect' && data.partnerChoice === 'Cooperate') score = 3;
      else if (data.myChoice === 'Defect' && data.partnerChoice === 'Defect') score = 1;
      return { "Your Score": `${score} points` };
    }
  },
  {
    id: 6,
    title: "Repeated Trust & Retaliation",
    shortTitle: "Repeated Trust Dilemma",
    category: "Social Dilemmas & Trust",
    icon: "🔁",
    keyTakeaway: "The 'shadow of the future' enables sustained cooperation when retaliatory strategies (Tit-for-Tat, Grim Trigger) are credible.",
    purpose: "Experience how repeated interactions and reactive strategies sustain long-run cooperation that fails in one-shot games.",
    strategies: "Play Cooperate (C) or Defect (D) across multiple rounds with the SAME counterparty.",
    payoffs: "Both Cooperate = (2, 2) pts · You Defect, Partner Cooperates = (3, 0) pts · You Cooperate, Partner Defects = (0, 3) pts · Both Defect = (1, 1) pts.",
    partners: 1,
    instructions: [
      "You are paired with the SAME partner for all repeated rounds.",
      "Choose Cooperate (C) or Defect (D) each round.",
      "Your choices are remembered and directly trigger your partner's strategic retaliation in future rounds."
    ],
    fields: [
      { id: 'myChoice', label: 'Your Choice', type: 'select', options: ['Cooperate', 'Defect'], step: 1 },
      { id: 'partnerChoice', label: "Partner's Choice", type: 'select', options: ['Cooperate', 'Defect'], step: 2 }
    ],
    calculate: (data) => {
      let score = 0;
      let status = "";
      if (data.myChoice === 'Cooperate' && data.partnerChoice === 'Cooperate') {
        score = 2;
        status = "Mutual Cooperation (+2 pts)";
      } else if (data.myChoice === 'Cooperate' && data.partnerChoice === 'Defect') {
        score = 0;
        status = "Sucker's Payoff (0 pts) · Partner Defected";
      } else if (data.myChoice === 'Defect' && data.partnerChoice === 'Cooperate') {
        score = 3;
        status = "Temptation (+3 pts) · Partner Betrayed";
      } else if (data.myChoice === 'Defect' && data.partnerChoice === 'Defect') {
        score = 1;
        status = "Mutual Defection (+1 pt) · Punishment Phase";
      }
      return { "Your Score": `${score} points`, "Status": status };
    }
  },
  {
    id: 12,
    title: "Public Goods Game (Free-Rider Dilemma)",
    shortTitle: "Public Goods Game",
    category: "Social Dilemmas & Trust",
    icon: "🌍",
    keyTakeaway: "Group welfare is maximized when everyone contributes, but individual incentives tempt players to free-ride.",
    purpose: "Feel the classic social dilemma: investing in public welfare yields shared multiplier benefits, but selfish free-riding tempts every participant.",
    strategies: "Each round, you have a private endowment of 10 points. Decide how many points (0 to 10) to contribute to the group pool.",
    payoffs: "All contributions in your 4-player group are pooled, multiplied by 1.6x, and split equally (0.4x per player). Final Score = (10 - Your Contribution) + (0.4 * Total Pool).",
    partners: 3,
    instructions: [
      "Choose how many points of your 10-point endowment to invest in the collective group pool (0 to 10).",
      "The pooled tokens are multiplied by 1.6x and distributed equally to all 4 members regardless of their contribution.",
      "Watch whether the group maintains high cooperation or decays into free-riding!"
    ],
    fields: [
      { id: 'myContribution', label: 'Your Contribution (0 to 10 pts)', type: 'number', step: 1, min: 0, max: 10, defaultValue: 5 },
      { id: 'groupContributions', label: 'Total Group Contributions', type: 'number', step: 2 },
      { id: 'groupReturn', label: 'Return from Group Pool', type: 'number', step: 2 }
    ],
    calculate: (data) => {
      const myContr = typeof data.myContribution === 'number' ? data.myContribution : parseFloat(String(data.myContribution || '0'));
      const groupContr = typeof data.groupContributions === 'number' ? data.groupContributions : parseFloat(String(data.groupContributions || (myContr * 4)));
      const poolMultiplier = 1.6;
      const share = Math.round((groupContr * poolMultiplier / 4) * 10) / 10;
      const kept = Math.max(0, 10 - myContr);
      const totalScore = Math.round((kept + share) * 10) / 10;
      return {
        "Tokens Kept": `${kept} pts`,
        "Your Pool Share": `+${share} pts`,
        "Your Score": `${totalScore} points`
      };
    }
  },
  {
    id: 7,
    title: "Second-Price Sealed-Bid Auction (Vickrey)",
    shortTitle: "Vickrey 2nd-Price Auction",
    category: "Auctions & Market Design",
    icon: "🏷️",
    keyTakeaway: "Truthful bidding (bidding your exact private valuation) is a dominant strategy, eliminating winner's curse.",
    purpose: "Explore why second-price auctions induce truthful bidding as a dominant strategy without fear of overpaying.",
    strategies: "Each round, the system draws your private valuation uniformly from 1 to 10 points (each with equal 10% chance). You can submit any bid.",
    payoffs: "Highest bidder wins and pays the 2nd highest bid. Profit = Valuation - Price Paid. Losers pay nothing and earn 0.",
    partners: 0,
    instructions: [
      "Review your private valuation drawn uniformly from 1 to 10 points.",
      "Enter and submit your sealed bid (bids can be any number: integers or decimals).",
      "View the auction outcome: winning bid, clearing price, and your profit!"
    ],
    fields: [
      { id: 'drawnValuation', label: 'Drawn Valuation', type: 'number', step: 1 },
      { id: 'myBid', label: 'Your Bid', type: 'number', step: 1 },
      { id: 'clearingPrice', label: 'Clearing Price', type: 'number', step: 2 },
      { id: 'winningBid', label: 'Winning Bid', type: 'number', step: 2 },
      { id: 'profit', label: 'Profit', type: 'number', step: 2 }
    ],
    calculate: (data) => {
      const val = typeof data.drawnValuation === 'number' ? data.drawnValuation : parseFloat(String(data.drawnValuation || '0'));
      const bid = typeof data.myBid === 'number' ? data.myBid : parseFloat(String(data.myBid || '0'));
      const clearing = typeof data.clearingPrice === 'number' ? data.clearingPrice : parseFloat(String(data.clearingPrice || '0'));
      const isWinner = data.isWinner === 'true' || data.isWinner === true;
      const profit = isWinner ? Math.round((val - clearing) * 100) / 100 : 0;
      return {
        "Status": isWinner ? "You Won the Auction!" : "Item Sold to Competitor",
        "Your Valuation": `${val} pts`,
        "Your Bid": `${bid} pts`,
        "Price Paid": `${clearing} pts`,
        "Your Score": `${profit} points`
      };
    }
  },
  {
    id: 8,
    title: "First-Price Sealed-Bid Auction & Winner's Curse",
    shortTitle: "First-Price Auction",
    category: "Auctions & Market Design",
    icon: "🎯",
    keyTakeaway: "Bidders shade their bids below value to capture surplus, balancing win probability against margin.",
    purpose: "Experience strategic bid shading and the risk of overpaying (winner's curse) when bidders pay their own bid.",
    strategies: "Bid in a standard First-Price Sealed-Bid auction. In some rounds you bid silently; in others, you can discuss cartels.",
    payoffs: "Highest bidder wins and pays their own bid. Profit = True Value - Winning Bid. Losers earn 0.",
    partners: 3,
    instructions: [
      "Play in groups of 3-4. Lock your own bid in Step 1.",
      "Record everyone else's bids in Step 2 to find the winner.",
      "Wait for the Instructor to reveal the True Value, then enter it at the bottom!"
    ],
    fields: [
      { id: 'rule', label: 'Rule', type: 'select', options: ['Independent (Silent)', 'Collusion Allowed'], step: 1 },
      { id: 'myBid', label: 'Your Bid', type: 'number', step: 1 },
      { id: 'bid2', label: "Partner 1's Bid", type: 'number', step: 2 },
      { id: 'bid3', label: "Partner 2's Bid", type: 'number', step: 2 },
      { id: 'bid4', label: "Partner 3's Bid (Optional)", type: 'number', step: 2 },
      { id: 'trueValue', label: 'True Value (Revealed by Instructor)', type: 'number', postReveal: true }
    ],
    calculate: (data) => {
      const bids = [data.myBid, data.bid2, data.bid3, data.bid4]
        .map(b => (typeof b === 'string' ? parseFloat(b) : (typeof b === 'number' ? b : NaN)))
        .filter(b => !isNaN(b));
      const highestBid = Math.max(...bids);
      const myBidNum = typeof data.myBid === 'string' ? parseFloat(data.myBid) : (typeof data.myBid === 'number' ? data.myBid : NaN);
      const isWinner = myBidNum === highestBid;
      
      const result: Record<string, string | number> = {
        "Did you win?": isWinner ? "Yes" : "No",
        "Highest Bid": highestBid
      };

      if (data.trueValue !== undefined && data.trueValue !== '') {
        const tv = typeof data.trueValue === 'string' ? parseFloat(data.trueValue) : Number(data.trueValue);
        if (!isNaN(tv)) {
          if (isWinner) {
            const profit = Math.round((tv - highestBid) * 100) / 100;
            result["Your Profit/Loss"] = profit >= 0 ? `+${profit} pts` : `${profit} pts (Winner's Curse!)`;
            result["Your Score"] = `${profit} points`;
          } else {
            result["Your Profit/Loss"] = "0 (Didn't buy)";
            result["Your Score"] = "0 points";
          }
        } else {
          result["Your Profit/Loss"] = "Awaiting True Value...";
        }
      } else {
        result["Your Profit/Loss"] = "Awaiting True Value...";
      }
      return result;
    }
  },
  {
    id: 11,
    title: "Keynesian Beauty Contest (Guess 2/3 of Average)",
    shortTitle: "Beauty Contest (2/3 Avg)",
    category: "Strategic Thinking & Coordination",
    icon: "💭",
    keyTakeaway: "Demonstrates cognitive depth of reasoning (Level-0, Level-1, Level-2) and iterative elimination of dominated strategies.",
    purpose: "Experience levels of strategic thinking: outguessing not just the average, but guessing what other people guess others will guess.",
    strategies: "Pick any number between 0 and 100 (decimals permitted).",
    payoffs: "Target = 2/3 × (Cohort Average). The player whose guess is closest to the Target wins 5 points!",
    instructions: [
      "Enter a number between 0 and 100 in Step 1.",
      "The class average is calculated, and the Target is exactly 2/3 of the class average.",
      "The closest guess wins the round!"
    ],
    fields: [
      { id: 'myGuess', label: 'Your Guess (0 to 100)', type: 'number', step: 1, min: 0, max: 100, defaultValue: 33 },
      { id: 'classAverage', label: 'Class Average', type: 'number', step: 2 },
      { id: 'targetValue', label: 'Target (2/3 of Avg)', type: 'number', step: 2 }
    ],
    calculate: (data) => {
      const myG = typeof data.myGuess === 'number' ? data.myGuess : parseFloat(String(data.myGuess || '33'));
      const target = typeof data.targetValue === 'number' ? data.targetValue : parseFloat(String(data.targetValue || '22.2'));
      const diff = Math.round(Math.abs(myG - target) * 10) / 10;
      const isWinner = data.isWinner === 'true' || data.isWinner === true || diff <= 2;
      return {
        "Distance to Target": `${diff}`,
        "Status": isWinner ? "Winner! Closest to 2/3 of Average" : "Within reasonable depth of reasoning",
        "Your Score": isWinner ? "5 points" : "1 point"
      };
    }
  },
  {
    id: 4,
    title: "Promotion Timing (Mixed Strategy Coordination)",
    shortTitle: "Promotion Timing",
    category: "Strategic Thinking & Coordination",
    icon: "🎲",
    keyTakeaway: "Predictability destroys value; players randomize moves to prevent rivals from exploiting patterns.",
    purpose: "Understand why unpredictability is valuable and experience mixed-strategy Nash equilibria in competitive timing.",
    strategies: "Choose Monday, Wednesday, or Friday to launch your store promotion.",
    payoffs: "If you pick the same day as your rival, you clash and split attention (0 pts). If you pick different days, you capture shoppers (1 pt).",
    instructions: [
      "Find a partner. Secretly choose a day in Step 1 and LOCK it.",
      "Reveal at the same time. If you clash, you both lose impact!",
      "Play multiple rounds to see if you can outguess your rival's pattern."
    ],
    fields: [
      { id: 'myDay', label: 'Your Day', type: 'select', options: ['Monday', 'Wednesday', 'Friday'], step: 1 },
      { id: 'partnerDay', label: "Partner's Day", type: 'select', options: ['Monday', 'Wednesday', 'Friday'], step: 2 }
    ],
    calculate: (data) => {
      if (data.myDay === data.partnerDay) return { "Outcome": "CLASH! Promotion failed.", "Your Score": "0 points" };
      return { "Outcome": "Different Days. Success!", "Your Score": "1 point" };
    }
  },
  {
    id: 9,
    title: "Split-the-Pie Bargaining (Ultimatum & Outside Options)",
    shortTitle: "Split the Pie Bargaining",
    category: "Bargaining & Markets",
    icon: "🥧",
    keyTakeaway: "Deadline pressure and outside options shape negotiation leverage and fairness norms.",
    purpose: "Feel how time limits, bargaining friction, and 'outside options' affect division of surplus in human negotiations.",
    strategies: "You and a partner have 60 seconds to demand a portion of 10 points.",
    payoffs: "If Demands sum to <= 10, you get your demand. If Demands sum > 10, deal fails and you get your Outside Option (1 pt).",
    instructions: [
      "Find a partner. You have 60 seconds to negotiate how to split 10 points.",
      "Lock your demanded share in Step 1.",
      "Record your partner's demanded share in Step 2."
    ],
    fields: [
      { id: 'myDemand', label: 'Your Demand (Out of 10)', type: 'number', step: 1 },
      { id: 'partnerDemand', label: "Partner's Demand", type: 'number', step: 2 }
    ],
    calculate: (data) => {
      const myDem = typeof data.myDemand === 'string' ? parseFloat(data.myDemand) : Number(data.myDemand);
      const partnerDem = typeof data.partnerDemand === 'string' ? parseFloat(data.partnerDemand) : Number(data.partnerDemand);
      const total = myDem + partnerDem;
      if (total <= 10) {
        return { "Status": "Deal Reached!", "Your Score": `${data.myDemand} points` };
      } else {
        return { "Status": `Deal Failed (Total = ${total})`, "Your Score": "1 point (Outside Option)" };
      }
    }
  },
  {
    id: 2,
    title: "Launch-or-Wait (Sequential First-Mover Advantage)",
    shortTitle: "Sequential Entry",
    category: "Bargaining & Markets",
    icon: "🚀",
    keyTakeaway: "Backward induction in extensive-form games reveals how first movers lock in favorable equilibria.",
    purpose: "Experience first-mover advantage and practice backward induction in sequential game trees.",
    strategies: "First Mover chooses to 'Launch' or 'Wait'. Second Mover observes this, then chooses to 'Enter' or 'Stay Out'.",
    payoffs: "Launch + Stay Out: FM gets 4, SM gets 1. Launch + Enter: Both get 2. Wait + Enter: FM gets 1, SM gets 4. Wait + Stay Out: Both get 0.",
    instructions: [
      "Find a partner. Decide who is First Mover and Second Mover. Lock your role in Step 1.",
      "First Mover locks their choice in Step 1. (If you are Second Mover, wait).",
      "Second Mover sees the choice, decides, and you record it in Step 2."
    ],
    fields: [
      { id: 'myRole', label: 'Your Role', type: 'select', options: ['First Mover', 'Second Mover'], step: 1 },
      { id: 'fmChoice', label: 'First Mover Choice', type: 'select', options: ['Launch', 'Wait'], step: 1 },
      { id: 'smChoice', label: 'Second Mover Choice', type: 'select', options: ['Enter', 'Stay Out'], step: 2 }
    ],
    calculate: (data) => {
      let fmPoints = 0;
      let smPoints = 0;
      let outcome = "";
      if (data.fmChoice === 'Launch' && data.smChoice === 'Stay Out') { fmPoints = 4; smPoints = 1; outcome = "First Mover Wins Big!"; }
      else if (data.fmChoice === 'Launch' && data.smChoice === 'Enter') { fmPoints = 2; smPoints = 2; outcome = "Modest return for both."; }
      else if (data.fmChoice === 'Wait' && data.smChoice === 'Enter') { fmPoints = 1; smPoints = 4; outcome = "Second Mover Gains Advantage."; }
      else { fmPoints = 0; smPoints = 0; outcome = "Both missed out."; }
      const myScore = data.myRole === 'First Mover' ? fmPoints : smPoints;
      return { "Outcome": outcome, "Your Score": `${myScore} points` };
    }
  },
  {
    id: 3,
    title: "Simultaneous Price Competition (Bertrand)",
    shortTitle: "Price Competition",
    category: "Bargaining & Markets",
    icon: "⚡",
    keyTakeaway: "Price wars undercut rival margins down toward marginal cost in simultaneous pricing.",
    purpose: "Discover the concept of Nash Equilibrium by playing a simultaneous-move pricing game.",
    strategies: "Secretly choose to set a 'High Price' or 'Low Price' for your product.",
    payoffs: "Both High = 2 pts each. Both Low = 1 pt each. If one is Low and one is High, Low gets 3 pts, High gets 0 pts.",
    instructions: [
      "Find a partner. Secretly decide your price in Step 1 and LOCK it.",
      "Reveal at the same time.",
      "Enter your partner's price in Step 2 to see the outcome."
    ],
    fields: [
      { id: 'myPrice', label: 'Your Price', type: 'select', options: ['High Price', 'Low Price'], step: 1 },
      { id: 'partnerPrice', label: "Partner's Price", type: 'select', options: ['High Price', 'Low Price'], step: 2 }
    ],
    calculate: (data) => {
      let score = 0;
      if (data.myPrice === 'High Price' && data.partnerPrice === 'High Price') score = 2;
      else if (data.myPrice === 'High Price' && data.partnerPrice === 'Low Price') score = 0;
      else if (data.myPrice === 'Low Price' && data.partnerPrice === 'High Price') score = 3;
      else if (data.myPrice === 'Low Price' && data.partnerPrice === 'Low Price') score = 1;
      return { "Your Score": `${score} points` };
    }
  },
  {
    id: 5,
    title: "Entry Deterrence & Strategic Commitment",
    shortTitle: "Commitment & Deterrence",
    category: "Bargaining & Markets",
    icon: "🛑",
    keyTakeaway: "Only irreversible, costly commitments create credible threats that deter entry.",
    purpose: "See why only irreversible actions are credible threats or promises.",
    strategies: "Player A (Incumbent) decides to 'Commit' or 'Stay Flexible'. Player B (Rival) observes and decides to 'Enter' or 'Stay Out'.",
    payoffs: "Commit + Stay Out = Monopoly for A. Commit + Enter = Price War (bad for both). Flexible + Enter = Duopoly (Rival enters successfully).",
    instructions: [
      "Find a partner. Decide roles. Record roles and Incumbent's choice in Step 1.",
      "Player B hears the decision, then chooses. Record Rival's choice in Step 2."
    ],
    fields: [
      { id: 'myRole', label: 'Your Role', type: 'select', options: ['Player A (Incumbent)', 'Player B (Rival)'], step: 1 },
      { id: 'pA_Choice', label: 'Incumbent Choice', type: 'select', options: ['Commit', 'Stay Flexible'], step: 1 },
      { id: 'pB_Choice', label: 'Rival Choice', type: 'select', options: ['Enter', 'Stay Out'], step: 2 }
    ],
    calculate: (data) => {
      let outcome = "";
      if (data.pA_Choice === 'Commit' && data.pB_Choice === 'Stay Out') outcome = "Incumbent keeps monopoly. Threat worked!";
      else if (data.pA_Choice === 'Commit' && data.pB_Choice === 'Enter') outcome = "Price War! Devastating for both.";
      else if (data.pA_Choice === 'Stay Flexible' && data.pB_Choice === 'Enter') outcome = "Rival enters successfully.";
      else outcome = "Rival stayed out unnecessarily. Incumbent wins.";
      return { "Market Outcome": outcome };
    }
  },
  {
    id: 10,
    title: "Costly Signaling & Asymmetric Information",
    shortTitle: "Costly Signaling",
    category: "Bargaining & Markets",
    icon: "📜",
    keyTakeaway: "Cheap talk fails; only costly signals reliably separate high-quality from low-quality types.",
    purpose: "See why only costly signals can separate high quality from low quality in markets with asymmetric information.",
    strategies: "Seller decides to 'Buy Costly Signal' or 'No Signal'. Buyer decides to 'Trust' or 'Don't Trust'.",
    payoffs: "Signal costs the seller money. Buyers make profit trusting High Quality, but lose money trusting Low Quality.",
    instructions: [
      "Find a partner. Decide roles. Lock roles and Seller's signal choice in Step 1.",
      "Buyer observes the signal, then decides to trust or not. Record in Step 2."
    ],
    fields: [
      { id: 'myRole', label: 'Your Role', type: 'select', options: ['Seller (High Quality)', 'Seller (Low Quality)', 'Buyer'], step: 1 },
      { id: 'signal', label: 'Did Seller Signal?', type: 'select', options: ['Yes (Costly)', 'No'], step: 1 },
      { id: 'trust', label: 'Did Buyer Trust?', type: 'select', options: ['Yes', 'No'], step: 2 }
    ],
    calculate: (data) => {
      let outcome = "";
      if (data.signal === 'Yes (Costly)' && data.trust === 'Yes') outcome = "Signal worked! Buyer trusted.";
      else if (data.signal === 'No' && data.trust === 'Yes') outcome = "Buyer trusted blindly (risky!).";
      else if (data.signal === 'Yes (Costly)' && data.trust === 'No') outcome = "Signal failed. Money wasted.";
      else outcome = "No signal, no trust. Stagnant market.";
      return { "Market Outcome": outcome };
    }
  },
  {
    id: 13,
    title: "Stag Hunt Coordination (Trust & Assurance)",
    shortTitle: "Stag Hunt",
    category: "Strategic Coordination & Trust",
    icon: "🦌",
    keyTakeaway: "Payoff Dominance (Stag) vs. Risk Dominance (Hare). Both are Nash equilibria; mutual trust determines whether players achieve social maximum or safe mediocrity.",
    purpose: "Understand multiple equilibria and coordination failures where cooperation is an equilibrium, yet fear of betrayal pushes rational players to a safe, suboptimal outcome.",
    strategies: "Choose 'Hunt Stag' (high reward, requires coordination) or 'Hunt Hare' (safe solo guarantee).",
    payoffs: "Both Stag = (10, 10) pts · One Stag, One Hare = (0, 4) pts · Both Hare = (4, 4) pts.",
    partners: 1,
    instructions: [
      "You are paired with a hunting partner.",
      "Choose 'Hunt Stag' (needs partner) or 'Hunt Hare' (safe solo) in Step 1.",
      "Reveal choices simultaneously and record partner's choice in Step 2."
    ],
    fields: [
      { id: 'myChoice', label: 'Your Choice', type: 'select', options: ['Hunt Stag', 'Hunt Hare'], step: 1 },
      { id: 'partnerChoice', label: "Partner's Choice", type: 'select', options: ['Hunt Stag', 'Hunt Hare'], step: 2 }
    ],
    calculate: (data) => {
      let score = 0;
      let outcome = "";
      if (data.myChoice === 'Hunt Stag' && data.partnerChoice === 'Hunt Stag') {
        score = 10;
        outcome = "Mutual Stag! Payoff-dominant social optimum (+10 pts each).";
      } else if (data.myChoice === 'Hunt Stag' && data.partnerChoice === 'Hunt Hare') {
        score = 0;
        outcome = "Cooperation Starvation: You hunted Stag alone while partner took Hare (0 pts).";
      } else if (data.myChoice === 'Hunt Hare' && data.partnerChoice === 'Hunt Stag') {
        score = 4;
        outcome = "Safe Hare captured (+4 pts); partner starved on Stag.";
      } else {
        score = 4;
        outcome = "Mutual Hare: Risk-dominant safe equilibrium (+4 pts each).";
      }
      return { "Coordination Outcome": outcome, "Your Score": `${score} points` };
    }
  },
  {
    id: 14,
    title: "Bertrand Duopoly Price War (Continuous)",
    shortTitle: "Bertrand Duopoly",
    category: "Bargaining & Markets",
    icon: "🏷️",
    keyTakeaway: "The Bertrand Paradox: with homogeneous products, competition between only 2 firms drives prices down to marginal cost ($P = MC$), eliminating economic profits.",
    purpose: "Experience the temptation of undercutting rival prices and observe how price wars destroy industry profits compared to tacit collusion.",
    strategies: "Choose a market price between $10 and $50 (Marginal Cost = $10). Market demand is Q = 100 - P.",
    payoffs: "Lowest price captures 100% of demand: Profit = (P - 10) * (100 - P). Equal prices split demand 50/50. Higher price gets 0 sales.",
    partners: 1,
    fields: [
      { id: 'myPrice', label: 'Your Price ($10 - $50)', type: 'number', min: 10, max: 50, defaultValue: 35, step: 1 },
      { id: 'partnerPrice', label: "Rival's Price ($10 - $50)", type: 'number', min: 10, max: 50, defaultValue: 35, step: 1, postReveal: true }
    ],
    instructions: [
      "Set your product price between $10 and $50 in Step 1.",
      "Reveal rival's price in Step 2. Lowest price wins 100% of sales; ties split 50/50."
    ],
    calculate: (data) => {
      const p1 = Number(data.myPrice) || 35;
      const p2 = Number(data.partnerPrice) || 35;
      const mc = 10;
      let score = 0;
      let outcome = "";

      if (p1 < p2) {
        score = Math.round((p1 - mc) * Math.max(0, 100 - p1));
        outcome = `Price Undercutting Win! You captured 100% market share at $${p1}. Profit: $${score}`;
      } else if (p1 > p2) {
        score = 0;
        outcome = `Undercut by Rival! Rival priced at $${p2}. You sold 0 units ($0 profit).`;
      } else {
        score = Math.round(((p1 - mc) * Math.max(0, 100 - p1)) / 2);
        outcome = `Tied Price at $${p1}: Shared 50% market demand. Profit: $${score}`;
      }
      return { "Market Outcome": outcome, "Your Score": `${score} points` };
    }
  },
  {
    id: 15,
    title: "Hawk-Dove Brinkmanship (Game of Chicken)",
    shortTitle: "Hawk-Dove Brinkmanship",
    category: "Strategic Thinking & Coordination",
    icon: "🦅",
    keyTakeaway: "Anti-coordination and brinkmanship: mutual aggression triggers catastrophic collision (-10, -10), forcing players into dangerous psychological posturing.",
    purpose: "Experience the tension of anti-coordination: you want to do the opposite of your rival, but neither wants to blink first.",
    strategies: "Choose 'Dove' (Swerve / Share) or 'Hawk' (Drive Straight / Fight).",
    payoffs: "Both Dove = +3 each · Both Hawk = -10 each (Collision!) · Hawk vs Dove = +6 to Hawk, 0 to Dove.",
    partners: 1,
    instructions: [
      "Select Dove (peaceful) or Hawk (aggressive) in Step 1.",
      "Reveal simultaneously with your partner in Step 2.",
      "If both play Hawk, you both suffer a devastating -10 collision!"
    ],
    fields: [
      { id: 'myChoice', label: 'Your Move', type: 'select', options: ['Dove', 'Hawk'], step: 1 },
      { id: 'partnerChoice', label: "Partner's Move", type: 'select', options: ['Dove', 'Hawk'], step: 2 }
    ],
    calculate: (data) => {
      let score = 0;
      let outcome = "";
      if (data.myChoice === 'Dove' && data.partnerChoice === 'Dove') {
        score = 3;
        outcome = "Mutual Peace: Resource shared (+3 pts each).";
      } else if (data.myChoice === 'Hawk' && data.partnerChoice === 'Hawk') {
        score = -10;
        outcome = "COLLISION! Mutual aggression caused catastrophic crash (-10 pts each).";
      } else if (data.myChoice === 'Hawk' && data.partnerChoice === 'Dove') {
        score = 6;
        outcome = "Exploited Dove: You drove straight (+6 pts), partner swerved (0 pts).";
      } else {
        score = 0;
        outcome = "Conceded to Hawk: You swerved safely (0 pts), partner seized resource (+6 pts).";
      }
      return { "Contest Outcome": outcome, "Your Score": `${score} points` };
    }
  },
  {
    id: 16,
    title: "Ultimatum Bargaining & Behavioral Fairness",
    shortTitle: "Ultimatum Bargaining",
    category: "Bargaining & Markets",
    icon: "🍰",
    keyTakeaway: "Subgame perfection predicts responders accept any positive crumb ($1), but empirical human fairness spitefully vetoes offers under $3.",
    purpose: "Explore the divide between mathematical backward induction and human inequity aversion in single-shot bargaining.",
    strategies: "Proposer offers $O out of $10.00. Responder chooses to Accept or Reject.",
    payoffs: "Accepted: Proposer gets $(10 - O), Responder gets $O. Rejected: Both get $0.00.",
    partners: 1,
    instructions: [
      "Proposer decides how much of the $10.00 to offer to the Responder in Step 1.",
      "Responder evaluates the offer and chooses to Accept or Reject in Step 2.",
      "If Rejected, the entire $10 pie vanishes and both earn $0.00!"
    ],
    fields: [
      { id: 'proposerOffer', label: 'Offer to Responder ($0 - $10)', type: 'number', min: 0, max: 10, defaultValue: 4, step: 0.5 },
      { id: 'responderDecision', label: 'Responder Choice', type: 'select', options: ['Accept', 'Reject'], step: 2 }
    ],
    calculate: (data) => {
      const offer = Number(data.proposerOffer) || 4;
      const accepted = data.responderDecision === 'Accept';
      const myScore = accepted ? Math.round((10 - offer) * 10) / 10 : 0;
      return {
        "Status": accepted ? `Deal Accepted! Partner received $${offer.toFixed(2)}.` : "Offer Rejected! Pie destroyed.",
        "Your Score": `${myScore} points`
      };
    }
  },
  {
    id: 17,
    title: "Matching Pennies (Zero-Sum & Mixed Strategies)",
    shortTitle: "Matching Pennies",
    category: "Zero-Sum & Mixed Strategies",
    icon: "🪙",
    keyTakeaway: "Zero pure-strategy Nash equilibria exist. Unpredictable randomization (p = 0.5) is the unique minimax mixed-strategy equilibrium.",
    purpose: "Understand pure-conflict zero-sum dynamics, minimax theorem, and mixed-strategy Nash equilibria where any predictable pattern is exploited.",
    strategies: "Choose 'Heads' or 'Tails'. You are the Matcher (win if coins match); your partner is the Mismatcher (wins if coins differ).",
    payoffs: "Coins Match (H, H or T, T): You get +2 pts, Partner gets 0 pts. Coins Differ (H, T or T, H): You get 0 pts, Partner gets +2 pts.",
    partners: 1,
    instructions: [
      "Select Heads or Tails in Step 1 and LOCK it.",
      "Reveal choices simultaneously with your partner in Step 2.",
      "As Matcher, you score +2 if both choices match; partner scores +2 if they differ!"
    ],
    fields: [
      { id: 'myChoice', label: 'Your Choice', type: 'select', options: ['Heads', 'Tails'], step: 1 },
      { id: 'partnerChoice', label: "Partner's Choice", type: 'select', options: ['Heads', 'Tails'], step: 2 }
    ],
    calculate: (data) => {
      const match = data.myChoice === data.partnerChoice;
      const score = match ? 2 : 0;
      return {
        "Outcome": match ? `Match! Both played ${data.myChoice}` : `Mismatch! You: ${data.myChoice}, Partner: ${data.partnerChoice}`,
        "Your Score": `${score} points`
      };
    }
  },
  {
    id: 18,
    title: "Battle of the Sexes (Coordination with Conflicting Preferences)",
    shortTitle: "Battle of the Sexes",
    category: "Strategic Coordination & Trust",
    icon: "🎭",
    keyTakeaway: "Two asymmetric pure Nash equilibria exist; coordinating is mutually beneficial, but players dispute who yields to whose preference.",
    purpose: "Experience coordination games with conflicting interests and observe how focal points, conventions, and alternating turn-taking resolve deadlocks.",
    strategies: "Choose 'Opera' (your favorite) or 'Football' (your partner's favorite).",
    payoffs: "Both Opera: You get +3 pts, Partner gets +2 pts. Both Football: You get +2 pts, Partner gets +3 pts. Miscoordinate (different events): Both get 0 pts.",
    partners: 1,
    instructions: [
      "Choose Opera or Football secretly in Step 1.",
      "Reveal choices simultaneously with your partner in Step 2.",
      "If you choose different events, both get 0! If you coordinate, whoever gets their favorite event earns +3, the other earns +2."
    ],
    fields: [
      { id: 'myChoice', label: 'Your Choice', type: 'select', options: ['Opera', 'Football'], step: 1 },
      { id: 'partnerChoice', label: "Partner's Choice", type: 'select', options: ['Opera', 'Football'], step: 2 }
    ],
    calculate: (data) => {
      let score = 0;
      let outcome = "";
      if (data.myChoice === 'Opera' && data.partnerChoice === 'Opera') {
        score = 3;
        outcome = "Coordinated on Opera! You earn your top preference (+3 pts), partner earns +2 pts.";
      } else if (data.myChoice === 'Football' && data.partnerChoice === 'Football') {
        score = 2;
        outcome = "Coordinated on Football! Partner earns top preference (+3 pts), you earn +2 pts.";
      } else {
        score = 0;
        outcome = "Miscoordination Clash! You chose different events and both earn 0 pts.";
      }
      return { "Coordination Status": outcome, "Your Score": `${score} points` };
    }
  },
  {
    id: 19,
    title: "The Trust Game (Investment & Reciprocity)",
    shortTitle: "The Trust Game",
    category: "Social Dilemmas & Trust",
    icon: "🏦",
    keyTakeaway: "Standard backward induction predicts zero trust ($X=0, Y=0$), yet human reciprocity routinely creates surplus through mutual investment.",
    purpose: "Explore the Berg-Dickhaut-McCabe investment game to understand how trust generates economic surplus and how reciprocity sustains cooperation.",
    strategies: "As Investor, choose how many points (0 to 10) to send to the Trustee. Sent points are tripled (3x). The Trustee decides how much to return.",
    payoffs: "Investor Payoff = (10 - X) + Returned Y. Trustee Payoff = 3X - Returned Y.",
    partners: 1,
    instructions: [
      "You have an endowment of 10 points. Decide how many points (0 to 10) to invest with the Trustee in Step 1.",
      "Your investment is tripled (x3) upon reaching the Trustee.",
      "The Trustee decides how much of the tripled fund to return to you in Step 2."
    ],
    fields: [
      { id: 'amountSent', label: 'Amount Sent to Trustee (0 - 10 pts)', type: 'number', min: 0, max: 10, defaultValue: 5, step: 1 },
      { id: 'amountReturned', label: 'Amount Returned by Trustee', type: 'number', step: 2 }
    ],
    calculate: (data) => {
      const sent = Number(data.amountSent) || 0;
      const returned = Number(data.amountReturned) || 0;
      const kept = Math.max(0, 10 - sent);
      const totalScore = kept + returned;
      return {
        "Endowment Kept": `${kept} pts`,
        "Tripled Pool": `${sent * 3} pts`,
        "Amount Returned": `+${returned} pts`,
        "Your Score": `${totalScore} points`
      };
    }
  },
  {
    id: 20,
    title: "The Centipede Game (Sequential Backward Induction)",
    shortTitle: "Centipede Game",
    category: "Extensive Form & Backward Induction",
    icon: "🐛",
    keyTakeaway: "Subgame Perfect Nash Equilibrium (SPNE) predicts immediate Take at Node 1 (2, 0). Yet empirical players pass sequentially to reach higher nodes, achieving massive mutual welfare.",
    purpose: "Explore Rosenthal's famous Centipede paradox where strict theoretical backward induction causes cooperative unraveling, contrasting with behavioral trust and empirical lab findings.",
    strategies: "At your turn (Nodes 1, 3, 5), choose 'Pass' (grow the collective pot and hand move to opponent) or 'Take' (end game and take the larger share).",
    payoffs: "N1: (2, 0) · N2: (1, 4) · N3: (4, 2) · N4: (3, 6) · N5: (6, 4) · N6: (5, 8) · Terminal: (8, 8).",
    partners: 1,
    instructions: [
      "Players alternate decision nodes along a 6-node extensive-form tree.",
      "At your turn, choose 'Pass' to grow the pot and give your partner the move, or 'Take' to end the match.",
      "If both players Pass all 6 nodes, both receive the maximum cooperative terminal payoff of 8 points each."
    ],
    fields: [
      { id: 'exitNode', label: 'Node Where Match Ended', type: 'select', options: ['Node 1 (You Took)', 'Node 2 (Partner Took)', 'Node 3 (You Took)', 'Node 4 (Partner Took)', 'Node 5 (You Took)', 'Node 6 (Partner Took)', 'Terminal (Mutual Pass)'], step: 1 },
      { id: 'myAction', label: 'Your Final Action', type: 'select', options: ['Pass', 'Take'], step: 1 }
    ],
    calculate: (data) => {
      let myScore = 0;
      let botScore = 0;
      let outcome = "";

      if (data.exitNode === 'Node 1 (You Took)') {
        myScore = 2; botScore = 0;
        outcome = "You Took at Node 1! SPNE outcome achieved (+2 pts for you, 0 for partner).";
      } else if (data.exitNode === 'Node 2 (Partner Took)') {
        myScore = 1; botScore = 4;
        outcome = "Partner Took at Node 2 (+4 pts for partner, +1 pt for you).";
      } else if (data.exitNode === 'Node 3 (You Took)') {
        myScore = 4; botScore = 2;
        outcome = "You Took at Node 3 (+4 pts for you, +2 pts for partner).";
      } else if (data.exitNode === 'Node 4 (Partner Took)') {
        myScore = 3; botScore = 6;
        outcome = "Partner Took at Node 4 (+6 pts for partner, +3 pts for you).";
      } else if (data.exitNode === 'Node 5 (You Took)') {
        myScore = 6; botScore = 4;
        outcome = "You Took at Node 5 (+6 pts for you, +4 pts for partner).";
      } else if (data.exitNode === 'Node 6 (Partner Took)') {
        myScore = 5; botScore = 8;
        outcome = "Partner Took at Node 6 (+8 pts for partner, +5 pts for you).";
      } else {
        myScore = 8; botScore = 8;
        outcome = "Terminal Mutual Cooperation! Both passed all nodes (+8 pts each).";
      }

      return {
        "Match Outcome": outcome,
        "Your Score": `${myScore} points`,
        "Partner Score": `${botScore} points`
      };
    }
  }
];

// Backward compatibility alias for WEEKS
export const WEEKS = GAMES;

