export interface CounterfactualComparison {
  earnedPayoff: number;
  bestPayoff: number;
  bestActionLabel: string;
  isBestResponse: boolean;
  difference: number;
  takeaway: string;
}

/**
 * Computes 'What you got vs. what you could have got' counterfactual comparison
 * for every Solo Lab game against the opponent's actual move.
 */
export function computeWhatYouCouldHaveGot(
  moduleId: number,
  playerActionRaw: string | number,
  botActionRaw: string | number | any,
  earnedPayoff: number,
  context: {
    studentValuation?: number;
    botValuation?: number;
    activeBotId?: string;
    botName?: string;
    signalingType?: string;
    centipedeNode?: number;
    cvTrueValue?: number;
    cvPlayerSignal?: number;
    cvBotSignal?: number;
    isDollarGame?: boolean;
    history?: any[];
  }
): CounterfactualComparison {
  const pActionStr = String(playerActionRaw);
  const bActionStr = String(botActionRaw);

  let bestPayoff = earnedPayoff;
  let bestActionLabel = pActionStr;
  let takeaway = '';

  switch (moduleId) {
    // -------------------------------------------------------------------------
    // Module 1 & 6: Prisoner's Dilemma (One-Shot & Repeated)
    // -------------------------------------------------------------------------
    case 1:
    case 6: {
      const isBotCoop = bActionStr.toLowerCase().includes('coop');
      if (isBotCoop) {
        // Cooperate gives 2, Defect gives 3
        bestPayoff = 3;
        bestActionLabel = 'Defect';
        if (pActionStr.toLowerCase().includes('coop')) {
          takeaway = 'Defecting would have earned you 1 pt more than cooperating against this opponent.';
        } else {
          takeaway = 'Defecting was your best response against this opponent, maximizing your points.';
        }
      } else {
        // Cooperate gives 0, Defect gives 1
        bestPayoff = 1;
        bestActionLabel = 'Defect';
        if (pActionStr.toLowerCase().includes('coop')) {
          takeaway = 'Defecting would have earned you 1 pt more than cooperating against this opponent.';
        } else {
          takeaway = 'Defecting was your best response against this opponent, securing 1 pt instead of 0 pts.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 2: Launch-or-Wait (Sequential Entry)
    // -------------------------------------------------------------------------
    case 2: {
      const isBotStayOut = bActionStr.toLowerCase().includes('stay out');
      if (isBotStayOut) {
        // Launch gives 4, Wait gives 0
        bestPayoff = 4;
        bestActionLabel = 'Launch';
        if (pActionStr.toLowerCase().includes('wait')) {
          takeaway = 'Launching would have earned you 4 pts more than waiting when your rival stays out.';
        } else {
          takeaway = 'Launching was your best response, capturing the market for 4 pts.';
        }
      } else {
        // Launch gives 2, Wait gives 1
        bestPayoff = 2;
        bestActionLabel = 'Launch';
        if (pActionStr.toLowerCase().includes('wait')) {
          takeaway = 'Launching would have earned you 1 pt more than waiting by committing first.';
        } else {
          takeaway = 'Launching was your best response, securing 2 pts through first-mover commitment.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 3: Simultaneous Price Competition (Bertrand 2x2)
    // -------------------------------------------------------------------------
    case 3: {
      const isBotHigh = bActionStr.toLowerCase().includes('high');
      if (isBotHigh) {
        bestPayoff = 3;
        bestActionLabel = 'Low Price';
        if (pActionStr.toLowerCase().includes('high')) {
          takeaway = 'Choosing Low Price would have earned you 1 pt more than High Price by undercutting the bot.';
        } else {
          takeaway = 'Choosing Low Price was your best response, undercutting your rival for 3 pts.';
        }
      } else {
        bestPayoff = 1;
        bestActionLabel = 'Low Price';
        if (pActionStr.toLowerCase().includes('high')) {
          takeaway = 'Choosing Low Price would have earned you 1 pt more than High Price against an undercutting rival.';
        } else {
          takeaway = 'Choosing Low Price was your best response, matching your rival to avoid getting wiped out.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 4: Promotion Timing (3x3 Mixed Strategy)
    // -------------------------------------------------------------------------
    case 4: {
      bestPayoff = 1;
      const days = ['Friday', 'Saturday', 'Sunday'];
      const altDay = days.find(d => !bActionStr.includes(d)) || 'Saturday';
      bestActionLabel = `Different Day (${altDay})`;

      if (earnedPayoff === 1) {
        takeaway = `Picking a different day from the bot was your best response, earning 1 pt by avoiding a schedule clash.`;
      } else {
        takeaway = `Picking ${altDay} instead of ${pActionStr} would have earned you 1 pt more by avoiding promotion clash.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 5: Entry Deterrence & Strategic Commitment
    // -------------------------------------------------------------------------
    case 5: {
      const isBotStayOut = bActionStr.toLowerCase().includes('stay out');
      if (isBotStayOut) {
        bestPayoff = 4;
        bestActionLabel = 'Commit or Stay Flexible';
        takeaway = 'Your move successfully deterred entry, earning you the maximum monopoly payoff of 4 pts.';
      } else {
        // Bot Entered
        bestPayoff = 2;
        bestActionLabel = 'Stay Flexible';
        if (pActionStr.toLowerCase().includes('commit')) {
          takeaway = 'Staying Flexible would have earned you 4 pts more than Committing by accommodating the entrant.';
        } else {
          takeaway = 'Staying Flexible was your best response, accommodating entry for 2 pts instead of a price war.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 7: Second-Price Vickrey Auction
    // -------------------------------------------------------------------------
    case 7: {
      const val = context.studentValuation ?? 8;
      const bBid = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 0;
      if (val > bBid) {
        bestPayoff = Math.round((val - bBid) * 10) / 10;
        bestActionLabel = `Bid True Value ($${val}.00)`;
        if (earnedPayoff < bestPayoff) {
          takeaway = `Bidding your true valuation ($${val}.00) would have won the item for a profit of $${bestPayoff.toFixed(2)}.`;
        } else {
          takeaway = `Your bid was a winning best response, securing the item for a profit of $${bestPayoff.toFixed(2)}.`;
        }
      } else {
        bestPayoff = 0;
        bestActionLabel = `Bid True Value ($${val}.00)`;
        if (earnedPayoff < 0) {
          takeaway = `Bidding your true value ($${val}.00) would have saved you from overpaying by $${Math.abs(earnedPayoff).toFixed(2)}.`;
        } else {
          takeaway = `Refraining from overbidding above your value was your best response, avoiding a loss.`;
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 8: First-Price Sealed-Bid Auction
    // -------------------------------------------------------------------------
    case 8: {
      const val = context.studentValuation ?? 8;
      const bBid = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 0;
      if (val > bBid + 0.5) {
        const optimalBid = Math.round((bBid + 0.5) * 10) / 10;
        bestPayoff = Math.round((val - optimalBid) * 10) / 10;
        bestActionLabel = `$${optimalBid.toFixed(2)}`;
        const diff = Math.round((bestPayoff - earnedPayoff) * 10) / 10;
        if (diff > 0.05) {
          takeaway = `Bidding $${optimalBid.toFixed(2)} would have earned you $${diff.toFixed(2)} more by winning with higher profit margin.`;
        } else {
          takeaway = `Your bid won the auction near optimal profit margin against this opponent.`;
        }
      } else {
        bestPayoff = 0;
        bestActionLabel = `Bid $\le $${val.toFixed(2)}`;
        if (earnedPayoff < 0) {
          takeaway = `Bidding at or below your valuation would have avoided an unprofitable purchase.`;
        } else {
          takeaway = `Passing on an overbid auction was your best response, avoiding a negative return.`;
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 9: Split-the-Pie (Demand Game)
    // -------------------------------------------------------------------------
    case 9: {
      const bDemand = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 5;
      const maxPossibleDemand = Math.max(1, Math.round((10 - bDemand) * 10) / 10);
      bestPayoff = maxPossibleDemand;
      bestActionLabel = `Demand ${maxPossibleDemand} pts`;

      if (earnedPayoff === 1 && maxPossibleDemand > 1) {
        takeaway = `Demanding ${maxPossibleDemand} pts would have earned you ${maxPossibleDemand - 1} pts more by reaching a deal instead of crashing to outside options.`;
      } else if (earnedPayoff < bestPayoff) {
        const diff = Math.round((bestPayoff - earnedPayoff) * 10) / 10;
        takeaway = `Demanding ${maxPossibleDemand} pts would have captured ${diff} pts more without exceeding the 10 pt pie.`;
      } else {
        takeaway = `Your demand was an exact best response, claiming the maximum pie remaining against the bot.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 10: Costly Signaling & Asymmetric Information (Spence)
    // -------------------------------------------------------------------------
    case 10: {
      const isHighQuality = context.signalingType === 'High Quality';
      const isBotTrusting = bActionStr.toLowerCase().includes('trust');
      const sigCost = isHighQuality ? 2 : 5;

      if (isBotTrusting) {
        // If bot trusts anyway, saving signal cost is best response
        bestPayoff = 10;
        bestActionLabel = 'No (Free)';
        if (pActionStr.toLowerCase().includes('yes')) {
          takeaway = `Skipping the costly signal would have saved you ${sigCost} pts since the bot trusted you regardless.`;
        } else {
          takeaway = 'Skipping the signal was your best response, securing 10 pts without spending anything on certification.';
        }
      } else {
        // Bot doesn't trust
        bestPayoff = 3;
        bestActionLabel = 'No (Free)';
        if (pActionStr.toLowerCase().includes('yes')) {
          takeaway = `Skipping the signal would have saved you ${sigCost} pts since the bot did not reward the signal.`;
        } else {
          takeaway = 'Skipping the signal was your best response, conserving tokens when facing a skeptical buyer.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 11: Keynesian Beauty Contest (2/3 of Average)
    // -------------------------------------------------------------------------
    case 11: {
      bestPayoff = 10;
      const bGuess = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 33;
      // Target against bot is 1/2 of bot's guess
      const targetGuess = Math.round(bGuess / 2);
      bestActionLabel = `Guess ${targetGuess}`;

      if (earnedPayoff === 10) {
        takeaway = `Your guess was closer to 2/3 of the average, winning the full 10 pt prize!`;
      } else if (earnedPayoff === 5) {
        takeaway = `Guessing ${targetGuess} would have broken the tie to win the full 10 pt prize instead of splitting 5 pts.`;
      } else {
        takeaway = `Guessing ${targetGuess} would have matched the 2/3 average and won you the 10 pt prize.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 12: Public Goods Dilemma / Commons
    // -------------------------------------------------------------------------
    case 12: {
      const bContr = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 10;
      // Payoff: (20 - c) + 0.8 * (c + bContr) = 20 + 0.8*bContr - 0.2*c
      // Best individual response is c = 0
      bestPayoff = Math.round((20 + 0.8 * bContr) * 10) / 10;
      bestActionLabel = '0 pts';

      const diff = Math.round((bestPayoff - earnedPayoff) * 10) / 10;

      if (diff > 0.05) {
        takeaway = `Contributing 0 pts would have earned you ${diff} pts more by keeping your private tokens while sharing the bot's pool.`;
      } else {
        takeaway = 'Contributing 0 pts was your payoff-maximizing best response against this opponent.';
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 13: Stag Hunt Coordination
    // -------------------------------------------------------------------------
    case 13: {
      const isBotStag = bActionStr.toLowerCase().includes('stag');
      if (isBotStag) {
        bestPayoff = 10;
        bestActionLabel = 'Stag';
        if (pActionStr.toLowerCase().includes('hare')) {
          takeaway = 'Choosing Stag would have earned you 6 pts more than Hare when your partner coordinated.';
        } else {
          takeaway = 'Choosing Stag was your best response, coordinating for the mutual 10 pt payoff.';
        }
      } else {
        bestPayoff = 4;
        bestActionLabel = 'Hare';
        if (pActionStr.toLowerCase().includes('stag')) {
          takeaway = 'Choosing Hare would have earned you 4 pts more than Stag when your partner defected.';
        } else {
          takeaway = 'Choosing Hare was your best response, securing 4 pts when your partner played safe.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 14: Bertrand Price Competition (Continuous)
    // -------------------------------------------------------------------------
    case 14: {
      const bPrice = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 25;
      if (bPrice > 11) {
        const undercutPrice = bPrice - 1;
        bestPayoff = Math.max(0, (undercutPrice - 10) * (100 - undercutPrice));
        bestActionLabel = `$${undercutPrice}.00`;
        const diff = Math.round(bestPayoff - earnedPayoff);
        if (diff > 1) {
          takeaway = `Pricing at $${undercutPrice}.00 would have earned you $${diff} more by undercutting the bot and capturing 100% of demand.`;
        } else {
          takeaway = `Your price was near the optimal undercut price against this competitor.`;
        }
      } else {
        bestPayoff = 0;
        bestActionLabel = '$10.00 (Cost)';
        takeaway = 'Pricing at marginal cost ($10) was the best response against aggressive price competition.';
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 15: Hawk-Dove Brinkmanship
    // -------------------------------------------------------------------------
    case 15: {
      const isBotDove = bActionStr.toLowerCase().includes('dove');
      if (isBotDove) {
        bestPayoff = 6;
        bestActionLabel = 'Hawk';
        if (pActionStr.toLowerCase().includes('dove')) {
          takeaway = 'Playing Hawk would have earned you 3 pts more by taking advantage of your opponent’s concession.';
        } else {
          takeaway = 'Playing Hawk was your best response, capturing 6 pts against a conciliatory Dove.';
        }
      } else {
        bestPayoff = 0;
        bestActionLabel = 'Dove';
        if (pActionStr.toLowerCase().includes('hawk')) {
          takeaway = 'Playing Dove would have saved you 10 pts by avoiding a mutually destructive collision.';
        } else {
          takeaway = 'Playing Dove was your best response, avoiding a -10 pt crash against an aggressive Hawk.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 16: Ultimatum Bargaining ($10 Pie)
    // -------------------------------------------------------------------------
    case 16: {
      const isAccepted = bActionStr.toLowerCase().includes('accept');

      // Acceptance thresholds by bot archetype
      let threshold = 2.5;
      if (context.activeBotId === 'equity_enforcer') threshold = 4.5;
      else if (context.activeBotId === 'spiteful_punisher') threshold = 3.0;
      else if (context.activeBotId === 'homo_economicus') threshold = 0.5;

      bestPayoff = Math.round((10 - threshold) * 10) / 10;
      bestActionLabel = `Offer $${threshold.toFixed(2)}`;

      if (isAccepted) {
        const diff = Math.round((bestPayoff - earnedPayoff) * 10) / 10;
        if (diff > 0.4) {
          takeaway = `Offering $${threshold.toFixed(2)} would have earned you $${diff.toFixed(2)} more while still being accepted.`;
        } else {
          takeaway = `Your offer successfully closed the deal near the optimal split for $${earnedPayoff.toFixed(2)}.`;
        }
      } else {
        takeaway = `Offering $${threshold.toFixed(2)} would have earned you $${bestPayoff.toFixed(2)} instead of walking away with $0.00.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 17: Matching Pennies (Zero-Sum)
    // -------------------------------------------------------------------------
    case 17: {
      const isBotHeads = bActionStr.toLowerCase().includes('heads');
      bestPayoff = 2;
      bestActionLabel = isBotHeads ? 'Heads' : 'Tails';

      if (earnedPayoff === 2) {
        takeaway = `Matching ${bestActionLabel} was your best response, winning +2 pts against this opponent.`;
      } else {
        takeaway = `Playing ${bestActionLabel} would have earned you 2 pts more by matching the bot's coin.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 18: Battle of the Sexes
    // -------------------------------------------------------------------------
    case 18: {
      const isBotOpera = bActionStr.toLowerCase().includes('opera');
      if (isBotOpera) {
        bestPayoff = 3;
        bestActionLabel = 'Opera';
        if (pActionStr.toLowerCase().includes('football')) {
          takeaway = 'Choosing Opera would have coordinated with your partner and earned you 3 pts instead of 0 pts.';
        } else {
          takeaway = 'Choosing Opera was your best response, coordinating for 3 pts.';
        }
      } else {
        bestPayoff = 2;
        bestActionLabel = 'Football';
        if (pActionStr.toLowerCase().includes('opera')) {
          takeaway = 'Choosing Football would have coordinated with your partner and earned you 2 pts instead of 0 pts.';
        } else {
          takeaway = 'Choosing Football was your best response, conceding to avoid a 0 pt clash.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 19: The Trust Game
    // -------------------------------------------------------------------------
    case 19: {
      if (context.activeBotId === 'selfish_trustee') {
        bestPayoff = 10;
        bestActionLabel = '0 pts';
        const diff = Math.round((10 - earnedPayoff) * 10) / 10;
        if (diff > 0.05) {
          takeaway = `Investing 0 pts would have kept your full 10 pt endowment against an unreciprocating trustee.`;
        } else {
          takeaway = 'Investing 0 pts was your best response against an unreciprocating trustee.';
        }
      } else if (context.activeBotId === 'fair_reciprocator') {
        bestPayoff = 15;
        bestActionLabel = '10 pts';
        const diff = Math.round((15 - earnedPayoff) * 10) / 10;
        if (diff > 0.05) {
          takeaway = `Investing 10 pts would have earned you ${diff} pts more by fully utilizing the 1.5x return rate.`;
        } else {
          takeaway = 'Investing the maximum 10 pts was your best response, unlocking 15 pts.';
        }
      } else {
        // Opportunistic trustee: sweet spot at 6
        bestPayoff = 12;
        bestActionLabel = '6 pts';
        const diff = Math.round((12 - earnedPayoff) * 10) / 10;
        if (diff > 0.05) {
          takeaway = `Investing 6 pts would have earned you ${diff} pts more by staying below the bot's greed threshold.`;
        } else {
          takeaway = 'Your investment level was an optimal best response against this trustee.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 20: Centipede Game
    // -------------------------------------------------------------------------
    case 20: {
      const myNode = context.centipedeNode ?? 1;
      const didBotTake = bActionStr.toLowerCase().includes('take');
      if (didBotTake) {
        // If bot took right after player passed, player could have taken on their own turn
        const takePayoff = myNode === 1 ? 2 : myNode === 3 ? 4 : 6;
        bestPayoff = takePayoff;
        bestActionLabel = `Take at Node ${myNode}`;
        if (pActionStr.toLowerCase().includes('pass')) {
          takeaway = `Taking at Node ${myNode} would have earned you 1 pt more than letting the bot exit first.`;
        } else {
          takeaway = `Taking at Node ${myNode} was your best response, pre-empting the bot's exit.`;
        }
      } else {
        // Bot passed or endgame
        bestPayoff = Math.max(earnedPayoff, 6);
        bestActionLabel = 'Pass';
        takeaway = 'Passing allowed the shared pot to grow, achieving mutual gains.';
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 21: Cournot Duopoly Competition
    // -------------------------------------------------------------------------
    case 21: {
      const botQ = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 30;
      // Best response formula: q* = (90 - botQ) / 2
      const optimalQ = Math.max(0, Math.round(((90 - botQ) / 2) * 10) / 10);
      const optTotalQ = optimalQ + botQ;
      const optPrice = Math.max(0, 100 - optTotalQ);
      const optProfit = Math.round((optimalQ * (optPrice - 10)) / 100 * 100) / 100;

      bestPayoff = optProfit;
      bestActionLabel = `${optimalQ} units`;

      const diff = Math.round((bestPayoff - earnedPayoff) * 100) / 100;
      if (diff > 0.2) {
        takeaway = `Producing ${optimalQ} units would have earned you $${diff.toFixed(2)} more than ${pActionStr} against the bot's ${botQ} units.`;
      } else {
        takeaway = `Producing ${pActionStr} was an optimal best response against the bot's ${botQ} units.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 22: Hotelling's Spatial Competition
    // -------------------------------------------------------------------------
    case 22: {
      const botLoc = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 50;
      let optLoc = 50;
      let optShare = 50;

      if (botLoc < 50) {
        optLoc = botLoc + 1;
        optShare = Math.round((100 - (botLoc + optLoc) / 2) * 10) / 10;
      } else if (botLoc > 50) {
        optLoc = botLoc - 1;
        optShare = Math.round(((botLoc + optLoc) / 2) * 10) / 10;
      } else {
        optLoc = 50;
        optShare = 50;
      }

      bestPayoff = optShare;
      bestActionLabel = `Pos ${optLoc}`;

      const diff = Math.round((bestPayoff - earnedPayoff) * 10) / 10;
      if (diff > 1.5) {
        takeaway = `Placing your stand at Pos ${optLoc} would have captured ${diff} more beachgoers than ${pActionStr}.`;
      } else {
        takeaway = `Your location placement was an effective best response, capturing ${earnedPayoff}% of beachgoers.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 23: Colonel Blotto Resource War
    // -------------------------------------------------------------------------
    case 23: {
      bestPayoff = 1;

      // Parse opponent's actual allocation from botActionRaw
      let botA = 34;
      let botB = 33;
      let botC = 33;
      if (typeof botActionRaw === 'object' && botActionRaw !== null) {
        botA = botActionRaw.a ?? 34;
        botB = botActionRaw.b ?? 33;
        botC = botActionRaw.c ?? 33;
      } else if (typeof botActionRaw === 'string') {
        const match = botActionRaw.match(/Passes\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (match) {
          botA = parseInt(match[1], 10);
          botB = parseInt(match[2], 10);
          botC = parseInt(match[3], 10);
        }
      }

      // Sort fronts by bot strength to find the two easiest passes to conquer
      const fronts = [
        { name: 'Pass A', troops: botA },
        { name: 'Pass B', troops: botB },
        { name: 'Pass C', troops: botC }
      ];
      fronts.sort((f1, f2) => f1.troops - f2.troops);
      const target1 = fronts[0];
      const target2 = fronts[1];

      // Minimal troops required to conquer each target
      const need1 = target1.troops + 1;
      const need2 = target2.troops + 1;
      const remainingForTarget2 = 100 - need1;

      bestActionLabel = `${need1} on ${target1.name}, ${remainingForTarget2} on ${target2.name}`;

      if (earnedPayoff === 1) {
        takeaway = `Your battalion allocation conquered the battlefield against ${context.botName || 'the opponent'}'s (${botA}/${botB}/${botC}) deployment for a +1 pt victory!`;
      } else {
        const action1Desc = target1.troops === 0 ? `1 battalion to ${target1.name} (beating 0)` : `${need1} battalions to ${target1.name} (beating ${target1.troops})`;
        const action2Desc = `${need2}+ to ${target2.name} (beating ${target2.troops})`;
        takeaway = `Allocating ${action1Desc} and ${action2Desc} would have conquered 2 fronts for a +1 pt win.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 24: Common-Value Auction & Winner's Curse
    // -------------------------------------------------------------------------
    case 24: {
      const trueVal = context.cvTrueValue ?? 50;
      const bBid = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 45;

      if (trueVal > bBid + 0.5) {
        bestPayoff = Math.round((trueVal - (bBid + 0.5)) * 100) / 100;
        bestActionLabel = `$${(bBid + 0.5).toFixed(2)}`;
        if (earnedPayoff < bestPayoff) {
          takeaway = `Bidding just above the bot ($${bestActionLabel}) would have secured the lease for a profit of $${bestPayoff.toFixed(2)}.`;
        } else {
          takeaway = `Your bid was a profitable best response, securing the lease without falling into the Winner's Curse.`;
        }
      } else {
        bestPayoff = 0;
        bestActionLabel = '$0.00 (Pass)';
        if (earnedPayoff < 0) {
          takeaway = `Bidding below the bot would have saved you $${Math.abs(earnedPayoff).toFixed(2)} from the Winner's Curse.`;
        } else {
          takeaway = `Letting the bot overpay was your best response, avoiding a Winner's Curse loss.`;
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 25: Dollar Auction Escalation Trap
    // -------------------------------------------------------------------------
    case 25: {
      const bBid = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 0.5;
      if (bBid >= 1.0) {
        bestPayoff = 0;
        bestActionLabel = '$0.00 (Pass)';
        if (earnedPayoff < 0) {
          takeaway = `Refusing to bid would have saved you $${Math.abs(earnedPayoff).toFixed(2)} from the sunk-cost escalation trap.`;
        } else {
          takeaway = 'Refusing to bid against an irrational escalation was your payoff-maximizing move.';
        }
      } else {
        const optBid = Math.round((bBid + 0.1) * 10) / 10;
        if (optBid < 1.0) {
          bestPayoff = Math.round((1.0 - optBid) * 100) / 100;
          bestActionLabel = `$${optBid.toFixed(2)}`;
          if (earnedPayoff < bestPayoff) {
            takeaway = `Bidding $${optBid.toFixed(2)} would have won the dollar for a profit of $${bestPayoff.toFixed(2)}.`;
          } else {
            takeaway = `Winning the dollar at $${optBid.toFixed(2)} captured a positive profit margin.`;
          }
        } else {
          bestPayoff = 0;
          bestActionLabel = '$0.00 (Pass)';
          takeaway = 'Refusing to bid above $1.00 prevented escalation losses.';
        }
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 26: Traveler's Dilemma
    // -------------------------------------------------------------------------
    case 26: {
      const bClaim = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 98;
      const optClaim = Math.max(2, bClaim - 1);
      bestPayoff = optClaim + 2;
      bestActionLabel = `$${optClaim}`;

      const pClaim = parseFloat(pActionStr.replace(/[^0-9.]/g, '')) || 100;
      if (pClaim > bClaim) {
        takeaway = `Claiming $${optClaim} would have earned you the +$2 bonus ($${bestPayoff}) instead of the -$2 penalty ($${earnedPayoff}).`;
      } else if (pClaim === bClaim) {
        takeaway = `Claiming $${optClaim} would have earned you $1 more ($${bestPayoff}) by undercutting the bot for the +$2 bonus.`;
      } else if (pClaim === optClaim) {
        takeaway = `Claiming $${optClaim} was your best response, winning the maximum undercut payout ($${bestPayoff}).`;
      } else {
        takeaway = `Claiming $${optClaim} would have earned you $${bestPayoff - earnedPayoff} more than $${pClaim} against this opponent.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 27: Renewable Ocean Fishery (Ostrom Commons)
    // -------------------------------------------------------------------------
    case 27: {
      const bEffort = parseFloat(bActionStr.replace(/[^0-9.]/g, '')) || 4;
      // Search optimal effort in [1..10]
      let maxHarvest = -999;
      let optEffort = 4;
      for (let e = 1; e <= 10; e++) {
        const tot = e + bEffort;
        const rev = tot > 12 ? 1.0 : tot > 8 ? 2.4 : 3.5;
        const profit = Math.round(e * (rev - 1.5) * 10) / 10;
        if (profit > maxHarvest) {
          maxHarvest = profit;
          optEffort = e;
        }
      }

      bestPayoff = maxHarvest;
      bestActionLabel = `${optEffort} trawlers`;

      const diff = Math.round((bestPayoff - earnedPayoff) * 10) / 10;
      if (diff > 0.5) {
        takeaway = `Deploying ${optEffort} trawlers would have earned you ${diff} pts more by optimizing yield before stock depletion.`;
      } else {
        takeaway = `Your fleet effort of ${pActionStr} was an effective best response against the rival fleet.`;
      }
      break;
    }

    // -------------------------------------------------------------------------
    // Module 28: Market for Lemons
    // -------------------------------------------------------------------------
    case 28: {
      const isAccepted = bActionStr.toLowerCase().includes('accept');
      if (isAccepted) {
        if (earnedPayoff < 0) {
          bestPayoff = 0;
          bestActionLabel = 'Lower Offer / Pass';
          takeaway = `Offering a lower price (or passing) would have avoided buying a lemon at a loss of $${Math.abs(earnedPayoff).toFixed(2)}.`;
        } else {
          bestPayoff = earnedPayoff;
          bestActionLabel = pActionStr;
          takeaway = `Your offer of ${pActionStr} was accepted and earned a positive return of $${earnedPayoff.toFixed(2)}.`;
        }
      } else {
        bestPayoff = 0;
        bestActionLabel = 'Fair Value Offer';
        takeaway = 'Your offer was rejected, resulting in a neutral $0.00 outcome.';
      }
      break;
    }

    default: {
      bestPayoff = earnedPayoff;
      bestActionLabel = pActionStr;
      takeaway = 'Your decision achieved the optimal payoff against this opponent.';
      break;
    }
  }

  const isBestResponse = earnedPayoff >= bestPayoff - 0.01;
  const difference = Math.max(0, Math.round((bestPayoff - earnedPayoff) * 100) / 100);

  return {
    earnedPayoff,
    bestPayoff,
    bestActionLabel,
    isBestResponse,
    difference,
    takeaway
  };
}
