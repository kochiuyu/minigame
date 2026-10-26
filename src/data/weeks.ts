import { WeekConfig } from '../types';

export const WEEKS: WeekConfig[] = [
  {
    id: 1,
    title: "Week 1: Prisoner's Dilemma",
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
    id: 2,
    title: "Week 2: Launch-or-Wait",
    purpose: "Experience first-mover advantage and practice backward induction.",
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
    title: "Week 3: Simultaneous Pricing",
    purpose: "Discover the concept of Nash Equilibrium by playing a simultaneous-move game.",
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
    id: 4,
    title: "Week 4: Random Promotion-Day",
    purpose: "Understand why being unpredictable can be a highly valuable strategy.",
    strategies: "Choose Monday, Wednesday, or Friday to launch your promotion.",
    payoffs: "If you pick the same day as your partner, you clash (0 pts). If you pick different days, success (1 pt).",
    instructions: [
      "Find a partner. Secretly choose a day in Step 1 and LOCK it.",
      "Reveal at the same time. If you clash, you both lose impact!",
      "Play two rounds in a row with the SAME partner to see if you can outguess them."
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
    id: 5,
    title: "Week 5: The Commitment Game",
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
    id: 6,
    title: "Week 6: Repeated Game & Triggers",
    purpose: "Experience how repetition and a 'trigger strategy' can sustain cooperation.",
    strategies: "Play Cooperate or Defect over multiple rounds with the SAME person.",
    payoffs: "Same payoffs as Week 1. BUT, if anyone defects once, the trigger forces BOTH to defect forever.",
    instructions: [
      "Stay with the SAME partner for ALL rounds.",
      "Secretly lock your choice in Step 1. Reveal, then record partner in Step 2.",
      "THE CATCH: If EITHER of you chooses 'Defect' even once, you must BOTH choose 'Defect' for all remaining rounds."
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
      const trigger = (data.myChoice === 'Defect' || data.partnerChoice === 'Defect') 
        ? "⚠️ TRIGGER ACTIVATED!" : "Cooperation maintained.";
      return { "Your Score": `${score} points`, "Status": trigger };
    }
  },
  {
    id: 7,
    title: "Week 7: Second-Price Sealed-Bid Auction",
    purpose: "Understand the dominant strategy of bidding your true value in a second-price auction.",
    strategies: "Submit a sealed bid for an item. The highest bidder wins, but pays the SECOND-highest bid amount.",
    payoffs: "Assume you value the item at exactly 10 points. Profit = 10 - (Price Paid). Losers get 0.",
    partners: 3,
    instructions: [
      "Form groups of 3 to 4. Assume you all value the item at 10 points.",
      "Lock your own bid secretly in Step 1.",
      "Gather the group's bids and record them in Step 2.",
      "Lock Step 2 to see who won and what they pay!"
    ],
    fields: [
      { id: 'myBid', label: 'Your Bid', type: 'number', step: 1 },
      { id: 'bid2', label: "Partner 1's Bid", type: 'number', step: 2 },
      { id: 'bid3', label: "Partner 2's Bid", type: 'number', step: 2 },
      { id: 'bid4', label: "Partner 3's Bid (Optional)", type: 'number', step: 2 }
    ],
    calculate: (data) => {
      const bids = [data.myBid, data.bid2, data.bid3, data.bid4]
        .map(b => (typeof b === 'string' ? parseFloat(b) : (typeof b === 'number' ? b : NaN)))
        .filter(b => !isNaN(b));
      const myBid = typeof data.myBid === 'string' ? parseFloat(data.myBid) : (typeof data.myBid === 'number' ? data.myBid : NaN);
      const highestBid = Math.max(...bids);
      
      // Sort bids descending to find second highest
      const sortedBids = [...bids].sort((a, b) => b - a);
      const secondHighest = sortedBids.length > 1 ? sortedBids[1] : 0;
      
      const highestBiddersCount = bids.filter(b => b === highestBid).length;
      
      if (myBid === highestBid) {
        if (highestBiddersCount > 1) {
          return { "Status": "Tied for Win!", "Price Paid": highestBid, "Your Profit": `${10 - highestBid} points` };
        }
        return { "Status": "You Won!", "Price Paid": secondHighest, "Your Profit": `${10 - secondHighest} points` };
      } else {
        return { "Status": "You Lost.", "Highest Bid": highestBid, "Your Profit": "0 points" };
      }
    }
  },
  {
    id: 8,
    title: "Week 8: Winner's Curse & Collusion",
    purpose: "Experience the risk of overpaying (winner's curse) and the temptation of cartels.",
    strategies: "Bid in a standard First-Price Sealed-Bid auction. In some rounds you must bid silently; in others, you can try to collude.",
    payoffs: "Highest bidder wins and pays their bid. Profit = (True Value revealed later) - (Winning Bid).",
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
            const profit = tv - highestBid;
            result["Your Profit/Loss"] = profit >= 0 ? `+${profit}` : `${profit} (Winner's Curse!)`;
          } else {
            result["Your Profit/Loss"] = "0 (Didn't buy)";
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
    id: 9,
    title: "Week 9: Split-the-Pie Negotiation",
    purpose: "Feel how time limits and 'outside options' affect bargaining power.",
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
    id: 10,
    title: "Week 10: Costly Signaling",
    purpose: "See why only costly signals can separate high quality from low quality.",
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
  }
];
