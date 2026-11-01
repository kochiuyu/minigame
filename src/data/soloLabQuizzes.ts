export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const SOLO_LAB_QUIZZES: Record<number, QuizQuestion[]> = {
  // Game 1: One-Shot Prisoner's Dilemma
  1: [
    {
      id: 'pd-1',
      question: 'Why is Defecting called a "strictly dominant strategy" in the One-Shot Prisoner\'s Dilemma?',
      options: [
        'It yields a higher individual payoff regardless of what your opponent chooses',
        'It guarantees that both players earn the maximum collective total payoff',
        'It is only effective if your opponent chooses to cooperate',
        'It punishes past betrayals across multiple future rounds'
      ],
      correctIndex: 0,
      explanation: 'Defecting is strictly dominant because it gives you a strictly higher payoff whether the other player Cooperates (3 vs 2) or Defects (1 vs 0).'
    },
    {
      id: 'pd-2',
      question: 'What is the unique Nash Equilibrium of the One-Shot Prisoner\'s Dilemma?',
      options: [
        'Both players Cooperate',
        'Both players Defect',
        'One player Cooperates while the other Defects',
        'Randomly flipping a coin between Cooperate and Defect'
      ],
      correctIndex: 1,
      explanation: 'Mutual defection (Defect, Defect) is the unique Nash equilibrium because neither player can unilaterally improve their payoff by switching to Cooperate.'
    },
    {
      id: 'pd-3',
      question: 'Why is the Nash equilibrium in the Prisoner\'s Dilemma described as "Pareto inefficient"?',
      options: [
        'Both players could have earned higher payoffs (+2 vs +1) if both cooperated',
        'The game has no stable outcome where players can reach an agreement',
        'The winner takes all points while the loser receives zero',
        'The payoffs change randomly every time the game is played'
      ],
      correctIndex: 0,
      explanation: 'An outcome is Pareto inefficient when another feasible outcome (mutual cooperation) makes at least one player strictly better off without hurting anyone.'
    }
  ],

  // Game 13: Stag Hunt Coordination
  13: [
    {
      id: 'stag-1',
      question: 'How many pure-strategy Nash equilibria exist in the Stag Hunt?',
      options: [
        'Exactly one (Hunting Stag)',
        'Exactly two ((Stag, Stag) and (Hare, Hare))',
        'Zero pure-strategy equilibria',
        'Three pure-strategy equilibria'
      ],
      correctIndex: 1,
      explanation: 'Both (Stag, Stag) and (Hare, Hare) are stable pure Nash equilibria because neither player regrets their choice given the other\'s choice.'
    },
    {
      id: 'stag-2',
      question: 'Why is (Stag, Stag) called the "payoff-dominant" equilibrium?',
      options: [
        'It guarantees an individual +4 even if the other hunter leaves',
        'It yields the highest possible mutual payoff (+10 each) for both players',
        'It requires zero trust or coordination between players',
        'It is the only choice that eliminates all strategic risk'
      ],
      correctIndex: 1,
      explanation: '(Stag, Stag) is payoff-dominant because it delivers the highest mutual reward (+10 each) compared to any other equilibrium.'
    },
    {
      id: 'stag-3',
      question: 'Why do cautious players frequently choose Hare instead of Stag?',
      options: [
        'Hare is risk-dominant: it guarantees +4 without risking getting 0 if the partner retreats',
        'Hunting Hare awards +12 if the other player hunts Stag',
        'Hunting Hare punishes the opponent for cooperating',
        'Hunting Hare forces the other player to hunt Stag next round'
      ],
      correctIndex: 0,
      explanation: 'Hare is risk-dominant because you safely secure +4 without risking the catastrophic payoff of 0 if your partner fails to coordinate.'
    }
  ],

  // Game 15: Hawk-Dove Brinkmanship
  15: [
    {
      id: 'hawk-1',
      question: 'What are the two pure-strategy Nash equilibria in Hawk-Dove (Chicken)?',
      options: [
        '(Hawk, Hawk) and (Dove, Dove)',
        'One player chooses Hawk while the other chooses Dove ((Hawk, Dove) and (Dove, Hawk))',
        'Both players always retreat to Dove simultaneously',
        'Neither player ever chooses Hawk'
      ],
      correctIndex: 1,
      explanation: 'Hawk-Dove is an anti-coordination game where the stable pure outcomes occur when players choose opposite actions: (Hawk, Dove) and (Dove, Hawk).'
    },
    {
      id: 'hawk-2',
      question: 'Why is mutual aggression (Hawk, Hawk) NOT a Nash equilibrium?',
      options: [
        'Both players receive positive rewards',
        'Mutual collision yields a severe penalty (-5), so either player would strictly gain by deviating to Dove (0)',
        'It is impossible for both players to choose Hawk simultaneously',
        'It yields the maximum collective social surplus'
      ],
      correctIndex: 1,
      explanation: 'Facing a Hawk, switching to Dove yields 0 instead of the collision penalty (-5), meaning mutual Hawk is unstable.'
    },
    {
      id: 'hawk-3',
      question: 'In the symmetric mixed-strategy equilibrium of Hawk-Dove, how should players decide?',
      options: [
        'Always choose Dove 100% of the time',
        'Randomize between Hawk and Dove so the opponent is indifferent between their moves',
        'Choose Hawk if you are Player 1 and Dove if you are Player 2',
        'Alternate deterministic choices without regard to payoffs'
      ],
      correctIndex: 1,
      explanation: 'In mixed-strategy equilibrium, players randomize so the expected payoff of choosing Hawk equals the expected payoff of choosing Dove.'
    }
  ],

  // Game 18: Battle of the Sexes
  18: [
    {
      id: 'battle-1',
      question: 'What characterizes the pure-strategy Nash equilibria in Battle of the Sexes?',
      options: [
        'Players choose opposite activities to avoid each other',
        'Both players coordinate on the same event ((Opera, Opera) or (Football, Football))',
        'Only the compromise option where both stay home is stable',
        'Neither player attends any event'
      ],
      correctIndex: 1,
      explanation: 'Coordination is paramount: both (Opera, Opera) and (Football, Football) are Nash equilibria because neither player wants to be alone.'
    },
    {
      id: 'battle-2',
      question: 'Why is there strategic conflict in Battle of the Sexes despite both wanting to coordinate?',
      options: [
        'Mutual coordination yields negative payoffs',
        'Each player strictly prefers coordinating at their own favorite venue (+3 vs +2)',
        'One player is penalized whenever they agree with the other',
        'It is a zero-sum game where one player\'s gain is the other\'s loss'
      ],
      correctIndex: 1,
      explanation: 'While both prioritize being together over being apart, each player earns a higher payoff at their own preferred location.'
    },
    {
      id: 'battle-3',
      question: 'In a repeated setting without communication, how do fair players often resolve the conflict?',
      options: [
        'Always playing Defect every turn',
        'Alternating venues on alternating rounds to split the advantage equally',
        'Quitting the game after the first disagreement',
        'Sticking stubbornly to their own favorite venue indefinitely'
      ],
      correctIndex: 1,
      explanation: 'Alternating turns allows players to coordinate successfully on every round while equalizing cumulative payoffs over time.'
    }
  ],

  // Game 17: Matching Pennies (Zero-Sum)
  17: [
    {
      id: 'pennies-1',
      question: 'Why does Matching Pennies have NO pure-strategy Nash equilibrium?',
      options: [
        'It is strictly zero-sum: one player wants to match while the other wants to mismatch',
        'Both players have a dominant strategy to choose Heads',
        'Both players receive zero payoffs in every outcome',
        'The payoffs depend on a random roll of the dice'
      ],
      correctIndex: 0,
      explanation: 'In any pure outcome, the losing player always wants to unilaterally switch their penny, making any pure outcome unstable.'
    },
    {
      id: 'pennies-2',
      question: 'What is the unique Nash equilibrium strategy in Matching Pennies?',
      options: [
        'Always play Heads',
        'Randomize 50% Heads and 50% Tails (p = 0.50)',
        'Always play Tails',
        'Play Heads on odd rounds and Tails on even rounds'
      ],
      correctIndex: 1,
      explanation: 'Randomizing with probability 0.5 makes you completely unpredictable and guarantees an expected payoff of 0 regardless of what your opponent chooses.'
    },
    {
      id: 'pennies-3',
      question: 'According to von Neumann\'s Minimax Theorem, what does randomizing 50/50 achieve?',
      options: [
        'It guarantees an automatic victory over any opponent',
        'It minimizes your maximum possible loss against an opponent searching for exploitable patterns',
        'It forces the opponent to play Heads',
        'It doubles the total points available in the game'
      ],
      correctIndex: 1,
      explanation: 'The minimax strategy protects you from exploitation by securing an expected payoff of 0 even against an opponent seeking patterns in your play.'
    }
  ],

  // Game 16: Ultimatum Bargaining & Fairness
  16: [
    {
      id: 'ultimatum-1',
      question: 'What does backward induction (Subgame Perfect Nash Equilibrium) predict for a selfish responder?',
      options: [
        'Reject any offer below $5',
        'Accept any positive offer (even $1 or 1 cent) because something is better than nothing',
        'Always reject all offers regardless of size',
        'Split the money evenly 50/50'
      ],
      correctIndex: 1,
      explanation: 'A purely selfish responder prefers $1 over $0, so backward induction predicts the proposer offers the minimum possible amount and the responder accepts.'
    },
    {
      id: 'ultimatum-2',
      question: 'What do behavioral economics experiments show real human responders actually do?',
      options: [
        'Accept every offer regardless of size',
        'Routinely reject unfair low offers (below 20-30%) to punish greedy proposers',
        'Give all money away to the proposer',
        'Demand 100% of the pot'
      ],
      correctIndex: 1,
      explanation: 'Real humans possess social preferences for fairness and frequently sacrifice monetary payoff to punish perceived unfairness.'
    },
    {
      id: 'ultimatum-3',
      question: 'Why is the proposer\'s optimal empirical strategy usually around $4 to $5 instead of $1?',
      options: [
        'The game rules legally mandate an equal split',
        'Offering $4-$5 maximizes expected payoff by avoiding costly responder rejections',
        'Proposers are forbidden from offering odd numbers',
        'Lower offers are automatically rounded up by the referee'
      ],
      correctIndex: 1,
      explanation: 'Anticipating that low offers face high rejection rates, rational proposers offer $4-$5 to maximize their expected earnings.'
    }
  ],

  // Game 19: The Trust Game (Investment)
  19: [
    {
      id: 'trust-1',
      question: 'What is the Subgame Perfect Nash Equilibrium (SPNE) predicted by backward induction in the Trust Game?',
      options: [
        'Investor sends $0 because a self-interested Trustee will return $0 at the final node',
        'Investor sends $10 and Trustee returns $15',
        'Trustee gives all money back to the investor',
        'Both players share the initial endowment equally'
      ],
      correctIndex: 0,
      explanation: 'By backward induction, the investor anticipates that a purely selfish trustee will return nothing, so the investor invests $0.'
    },
    {
      id: 'trust-2',
      question: 'Why does investing the full $10 create the greatest potential social surplus?',
      options: [
        'It eliminates all risk for the investor',
        'The investment is tripled (3x), turning $10 into $30 of total wealth for the pair',
        'The trustee is legally bound to return $20',
        'It guarantees that both players finish with identical scores'
      ],
      correctIndex: 1,
      explanation: 'The 3x investment multiplier expands total wealth from $10 to $30, creating massive mutual gains if trust and reciprocity hold.'
    },
    {
      id: 'trust-3',
      question: 'What behavioral mechanism allows positive trust to be sustained in human interactions?',
      options: [
        'Random coin tosses',
        'Negative interest rates',
        'Reciprocity, reputation, and social norms of trustworthiness',
        'Government subsidies'
      ],
      correctIndex: 2,
      explanation: 'Human trust is sustained by reciprocal fairness and fear of reputational loss in ongoing social interactions.'
    }
  ],

  // Game 12: Public Goods Dilemma
  12: [
    {
      id: 'public-1',
      question: 'In the Public Goods game, why is contributing 0 points the individually dominant strategy?',
      options: [
        'Every point kept is worth 1.0 to you, but each point contributed returns only 0.4 to you individually',
        'Points placed into the public pool are lost forever',
        'Only the highest contributor receives a payout',
        'It prevents other players from participating'
      ],
      correctIndex: 0,
      explanation: 'Since each invested token returns less than 1.0 back to the individual contributor (e.g. 0.4x), keeping tokens is individually dominant.'
    },
    {
      id: 'public-2',
      question: 'What is the "Tragedy of the Commons" or "Free-Rider Problem" demonstrated here?',
      options: [
        'When everyone follows their dominant strategy to keep points, total group welfare is minimized',
        'The public pool overflows and crashes the system',
        'The player who contributes first wins automatically',
        'The game has no mathematical solution'
      ],
      correctIndex: 0,
      explanation: 'When everyone free-rides, the group ends up at the inefficient Nash equilibrium with far less total payoff than full mutual contribution.'
    },
    {
      id: 'public-3',
      question: 'What mechanism has been proven in experimental economics to sustain high contributions?',
      options: [
        'Peer punishment of free-riders and transparent communication',
        'Forbidding players from seeing outcomes',
        'Increasing the number of rounds without feedback',
        'Removing the multiplier completely'
      ],
      correctIndex: 0,
      explanation: 'Experiments show that enabling communication or peer punishment of free-riders rapidly restores and sustains cooperative public funding.'
    }
  ],

  // Game 6: Repeated Prisoner's Dilemma
  6: [
    {
      id: 'rpd-1',
      question: 'Why can mutual cooperation be sustained in an infinitely repeated or indefinite Prisoner\'s Dilemma?',
      options: [
        'Defection is physically disabled after round 1',
        'The "shadow of the future" allows players to reward cooperation and credibly punish defection in later rounds',
        'The payoffs change so that Cooperate becomes dominant in every single round',
        'The bot always copies your name'
      ],
      correctIndex: 1,
      explanation: 'Future interactions create a credible threat of retaliation, making the long-run cost of being punished outweigh the short-term temptation to defect.'
    },
    {
      id: 'rpd-2',
      question: 'What are the key traits that made Axelrod\'s "Tit-for-Tat" strategy famously successful?',
      options: [
        'Being sneaky, unpredictable, and defecting first',
        'Nice (never defect first), Provocable (retaliate immediately), and Forgiving (cooperate when the opponent returns to cooperation)',
        'Always defecting regardless of history',
        'Never retaliating even when exploited'
      ],
      correctIndex: 1,
      explanation: 'Tit-for-Tat begins with cooperation, immediately punishes defection, but instantly forgives when the counterpart cooperates again.'
    },
    {
      id: 'rpd-3',
      question: 'If a repeated game has a strictly known and fixed final round (e.g. exactly 5 rounds), what does backward induction predict?',
      options: [
        'Both players defect on every single round from round 1 to round 5',
        'Players cooperate until round 10',
        'Full cooperation is mathematically guaranteed',
        'Players alternate moves peacefully'
      ],
      correctIndex: 0,
      explanation: 'In the final round, there is no future to punish defection, so both defect; unwinding backwards, cooperation unravels on every round.'
    }
  ],

  // Game 7: Second-Price Vickrey Auction
  7: [
    {
      id: 'vickrey-1',
      question: 'Why is bidding your exact true valuation a weakly dominant strategy in a Vickrey auction?',
      options: [
        'Because your bid determines whether you win, but NOT the price you pay if you win',
        'Because the highest bidder receives the item for free',
        'Because bidding higher guarantees you pay less than anyone else',
        'Because the seller inspects your valuation before the auction'
      ],
      correctIndex: 0,
      explanation: 'Since the winner pays the second-highest bid, your bid only decides whether you win when profitable; it never affects what you pay.'
    },
    {
      id: 'vickrey-2',
      question: 'What happens if you overbid above your true valuation ($80) and bid $100?',
      options: [
        'You are guaranteed to make a larger profit',
        'You risk winning against an opponent who bid $90 and paying $90 for an item only worth $80 (a net loss of -$10)',
        'The seller discounts the final price by 50%',
        'Nothing changes under any circumstances'
      ],
      correctIndex: 1,
      explanation: 'Overbidding never increases your profit when you would have won anyway, but risks forcing you to buy at a price exceeding your valuation.'
    },
    {
      id: 'vickrey-3',
      question: 'What happens if you underbid below your valuation ($80) and bid $60?',
      options: [
        'You lower the price you pay if you win',
        'You never lower the price you pay, but you risk missing out on a profitable win if an opponent bids $70',
        'You automatically double your score',
        'The auction rules cancel your bid'
      ],
      correctIndex: 1,
      explanation: 'Underbidding cannot reduce your purchase price (which depends solely on the second bid) and can only cause you to lose profitable items.'
    }
  ],

  // Game 14: Bertrand Duopoly Competition
  14: [
    {
      id: 'bertrand-1',
      question: 'In the classic Bertrand model with identical products and constant marginal cost ($20), what is the unique Nash equilibrium?',
      options: [
        'Both firms price at monopoly price ($80) to maximize joint profits',
        'Both firms price at marginal cost ($20), earning zero economic profit',
        'One firm charges $50 and the other charges $100',
        'Prices fluctuate randomly between $0 and $100'
      ],
      correctIndex: 1,
      explanation: 'Even with only two firms, price competition undercuts any price above marginal cost until price equals cost ($20).'
    },
    {
      id: 'bertrand-2',
      question: 'Why is this outcome known as the "Bertrand Paradox"?',
      options: [
        'It requires infinite firms to reach competitive prices',
        'Just two competing firms are sufficient to reproduce the perfectly competitive zero-profit price outcome',
        'Lowering prices decreases quantity demanded',
        'Neither firm wants to make any sales'
      ],
      correctIndex: 1,
      explanation: 'It is paradoxical that intense price competition between just two sellers drives economic profits all the way to zero.'
    },
    {
      id: 'bertrand-3',
      question: 'How do real-world companies avoid the zero-profit Bertrand trap?',
      options: [
        'Product differentiation, brand loyalty, capacity constraints, and patents',
        'Lowering product quality below competitor levels',
        'Refusing to advertise',
        'Hiring identical suppliers'
      ],
      correctIndex: 0,
      explanation: 'Differentiating products or creating brand value prevents consumers from switching purely based on a one-cent price difference.'
    }
  ],

  // Game 11: Keynesian Beauty Contest (2/3 of Average)
  11: [
    {
      id: 'beauty-1',
      question: 'What is the unique Nash equilibrium of the 2/3 of the Average game (numbers 0 to 100)?',
      options: [
        '50',
        '33',
        '0',
        '67'
      ],
      correctIndex: 2,
      explanation: 'Through iterated reasoning, 2/3 of 50 is ~33, 2/3 of 33 is ~22, cascading all the way down to 0, which is the unique Nash equilibrium.'
    },
    {
      id: 'beauty-2',
      question: 'If naive players pick randomly around 50 (Level-0), what does a "Level-1" player pick?',
      options: [
        '2/3 of 50 ≈ 33',
        '0',
        '100',
        '67'
      ],
      correctIndex: 0,
      explanation: 'A Level-1 thinker assumes others choose randomly (mean ~50) and best-responds by picking 2/3 × 50 ≈ 33.'
    },
    {
      id: 'beauty-3',
      question: 'Why does guessing 0 often lose in real-world human experiments?',
      options: [
        '0 is mathematically disqualified by game rules',
        'Real opponents do not possess infinite levels of reasoning; winning requires anticipating the actual depth of thinking in the room',
        '0 is a strictly dominated strategy',
        'The winner is the player furthest from 2/3 of the average'
      ],
      correctIndex: 1,
      explanation: 'To win a Beauty Contest, you must match what people actually do (typically Level 1 or 2, around 20-35), not theoretical infinite-step equilibrium.'
    }
  ],

  // Game 20: Centipede Game (Backward Induction)
  20: [
    {
      id: 'centipede-1',
      question: 'What does backward induction (SPNE) predict for the Centipede Game?',
      options: [
        'Player 1 takes the pot at Node 1 on the very first move',
        'Both players pass all the way to the final node to maximize total pot size',
        'Player 2 takes the pot at the final node',
        'Players flip coins at each node'
      ],
      correctIndex: 0,
      explanation: 'By backward induction from the final node, each player anticipates the other will take next turn, causing cooperation to unravel immediately to Node 1.'
    },
    {
      id: 'centipede-2',
      question: 'Why is the backward induction outcome ((Take at Node 1)) considered a paradox of rationality?',
      options: [
        'Taking at Node 1 leaves players with trivial payouts ($2 / $0) when passing could have generated $8 each',
        'The game has no mathematical solution',
        'Taking at Node 1 violates game rules',
        'The total points in the pot decrease over time'
      ],
      correctIndex: 0,
      explanation: 'Strict individual rationality leads to an outcome where both players earn vastly less than what mutual trust would have achieved.'
    },
    {
      id: 'centipede-3',
      question: 'What do empirical lab experiments with human subjects reveal in the Centipede Game?',
      options: [
        'Over 90% of humans take at Node 1',
        'Most humans pass for several nodes, allowing the pot to grow substantially before defecting',
        'Humans never take the pot under any circumstances',
        'Humans always pass to the very end'
      ],
      correctIndex: 1,
      explanation: 'Real players regularly exhibit bounded rationality or altruistic trust, passing for several rounds to expand the collective pie.'
    }
  ],

  // Game 2: Launch-or-Wait (Sequential Entry & First-Mover Advantage)
  2: [
    {
      id: 'launch-1',
      question: 'What constitutes a "first-mover advantage" in sequential extensive-form games?',
      options: [
        'Committing to an action first and forcing the follower to choose their best response to your commitment',
        'Receiving automatic bonus points for acting before a timer runs out',
        'Guaranteeing that the follower earns zero points',
        'Eliminating all competitive uncertainty in future rounds'
      ],
      correctIndex: 0,
      explanation: 'A first mover shapes the game tree by committing to an action, forcing subsequent players to adapt to an established market reality.'
    },
    {
      id: 'launch-2',
      question: 'How do game theorists solve for the Subgame Perfect Nash Equilibrium (SPNE) in sequential games?',
      options: [
        'Backward induction: solve optimal choices at terminal subgames first, then fold back to the initial node',
        'Simultaneous matrix reduction: calculate dominant strategies assuming actions are hidden',
        'Calculate the simple average of all four terminal payoffs',
        'Choose whichever action maximizes the rival\'s payoff'
      ],
      correctIndex: 0,
      explanation: 'Backward induction solves extensive-form games by determining optimal choices at terminal subgames first, then rolling values backwards to the initial root.'
    },
    {
      id: 'launch-3',
      question: 'Why might being the second mover be advantageous in certain real-world markets?',
      options: [
        'Second movers can learn from pioneer mistakes and free-ride on costly consumer education and R&D',
        'Second movers are legally guaranteed higher market share',
        'First movers are always required to subsidize followers',
        'Sequential games mathematically favor the second player in all configurations'
      ],
      correctIndex: 0,
      explanation: 'Second-mover advantages include reverse-engineering technology, observing consumer adoption hurdles, and entering with lower capital expenditure.'
    }
  ],

  // Game 3: Simultaneous Price Competition (Bertrand 2x2)
  3: [
    {
      id: 'bertrand2x2-1',
      question: 'What is the unique Nash equilibrium of this simultaneous 2x2 pricing game?',
      options: [
        'Both firms choose Low Price',
        'Both firms choose High Price',
        'One firm chooses High Price while the other chooses Low Price',
        'There is no Nash equilibrium in this game'
      ],
      correctIndex: 0,
      explanation: 'Choosing Low Price strictly dominates High Price (3 > 2 and 1 > 0), leading to the unique Nash equilibrium where both set Low Price.'
    },
    {
      id: 'bertrand2x2-2',
      question: 'Why do both firms set Low Price even though Both High Price yields higher profits (+2 vs +1)?',
      options: [
        'Individual temptation to undercut (+3) and fear of being undercut (0) drive both to Low Price',
        'High Price is prohibited by antitrust law in this simulation',
        'Customers refuse to buy when prices are high',
        'Low Price guarantees monopoly profits'
      ],
      correctIndex: 0,
      explanation: 'Each firm has a unilateral incentive to undercut the rival for higher profit, trapping both in a suboptimal price war (Bertrand trap).'
    },
    {
      id: 'bertrand2x2-3',
      question: 'How does Bertrand price competition differ when played repeatedly versus one-shot?',
      options: [
        'Repeated play allows tacit collusion supported by the credible threat of retaliatory price wars',
        'Repeated play always drives prices down to zero immediately',
        'Firms are legally forced to merge in repeated games',
        'Repetition has no impact on strategic incentives'
      ],
      correctIndex: 0,
      explanation: 'In repeated games, the shadow of the future allows firms to maintain monopoly high prices through trigger strategies or Tit-for-Tat retaliation.'
    }
  ],

  // Game 4: Promotion Timing (3x3 Mixed Strategy Coordination)
  4: [
    {
      id: 'timing-1',
      question: 'What type of game is Promotion Timing?',
      options: [
        'An anti-coordination game where players want to avoid choosing the same day',
        'A pure coordination game where players want to match choices',
        'A sequential zero-sum game',
        'A dominant strategy prisoner\'s dilemma'
      ],
      correctIndex: 0,
      explanation: 'In anti-coordination games, players benefit when they choose different actions (different promotion days) to avoid dividing market attention.'
    },
    {
      id: 'timing-2',
      question: 'Why does no pure-strategy symmetric Nash equilibrium exist where both choose the same day?',
      options: [
        'If you know your rival\'s chosen day, you have a strict incentive to switch to a different day',
        'The game rules disallow choosing the same day',
        'Promotion days must be drawn from a lottery',
        'Both players always prefer Friday'
      ],
      correctIndex: 0,
      explanation: 'Clashing yields 0 points, so any predictable schedule invites the rival to choose an alternative open day to capture 1 point.'
    },
    {
      id: 'timing-3',
      question: 'In the unique symmetric mixed-strategy Nash equilibrium, what is the optimal probability of picking each day?',
      options: [
        'Exactly 1/3 for Monday, 1/3 for Wednesday, and 1/3 for Friday',
        '100% on Friday because it is payday',
        '50% on Monday and 50% on Friday, never Wednesday',
        '0% on all days'
      ],
      correctIndex: 0,
      explanation: 'Randomizing uniformly (p = 1/3 across all 3 days) leaves your rival completely indifferent between all choices, making your strategy unexploitable.'
    }
  ],

  // Game 5: Entry Deterrence & Strategic Commitment
  5: [
    {
      id: 'deter-1',
      question: 'Why is an empty verbal threat by an incumbent ("I will fight a price war if you enter") non-credible?',
      options: [
        'Once entry occurs, accommodating yields higher ex-post profit (+2) than mutually destructive fighting (-2)',
        'Entrants can sue incumbents for antitrust violations',
        'Verbal threats are always legally binding',
        'Price wars always reward both firms'
      ],
      correctIndex: 0,
      explanation: 'Without commitment, fighting after entry is subgame-imperfect because accommodating yields higher ex-post profit than self-destructive price wars.'
    },
    {
      id: 'deter-2',
      question: 'How does an incumbent make their deterrence threat credible?',
      options: [
        'By making an irreversible upfront investment (sinking capital or building excess capacity)',
        'By asking the entrant politely not to enter',
        'By promising to pay the entrant a dividend',
        'By keeping maximum flexibility to change decisions later'
      ],
      correctIndex: 0,
      explanation: 'Sunk capital or excess capacity changes the payoff structure so that fighting is no longer an empty bluff, credibly deterring entry.'
    },
    {
      id: 'deter-3',
      question: 'In the game tree, what is the Subgame Perfect Nash Equilibrium (SPNE) when the incumbent can commit?',
      options: [
        'Incumbent Commits capacity; Entrant stays out (Monopoly payoff +4)',
        'Incumbent stays flexible; Entrant stays out',
        'Incumbent Commits; Entrant enters and both fight',
        'Both firms exit the industry'
      ],
      correctIndex: 0,
      explanation: 'Sinking commitment capacity leaves the entrant facing -2 if entering vs 0 if staying out, forcing the entrant to stay out and granting the incumbent monopoly profits (+4).'
    }
  ],

  // Game 8: First-Price Sealed-Bid Auction & Winner's Curse
  8: [
    {
      id: 'fp-auction-1',
      question: 'Why should a rational bidder "shade" their bid below their true valuation in a first-price auction?',
      options: [
        'If you bid your exact valuation, your profit upon winning is $0 (Profit = Value - Bid)',
        'Shading your bid guarantees that you always win the auction',
        'Auction rules penalize truthful bids',
        'Bidding higher than value is the only way to earn profit'
      ],
      correctIndex: 0,
      explanation: 'In a first-price auction, the winner pays their own bid. To earn a positive surplus (v - b > 0), you must submit a bid strictly below your private value.'
    },
    {
      id: 'fp-auction-2',
      question: 'In a symmetric 2-bidder auction with uniform valuations on [0, 10], what is the Bayes-Nash equilibrium bid?',
      options: [
        'Bid exactly half your valuation (b = v / 2)',
        'Bid your full valuation (b = v)',
        'Bid zero regardless of valuation',
        'Bid 10 points every round'
      ],
      correctIndex: 0,
      explanation: 'The equilibrium bidding strategy with N=2 uniform bidders is b*(v) = (N-1)/N * v = v/2, balancing win probability against profit margin.'
    },
    {
      id: 'fp-auction-3',
      question: 'What causes the "Winner\'s Curse" in common-value auctions?',
      options: [
        'Winning implies your estimate of the item\'s value was the most overly optimistic among all bidders',
        'The auctioneer takes the prize back after the auction ends',
        'Winners are required to pay double their submitted bid',
        'Losers are legally forced to pay a penalty fee'
      ],
      correctIndex: 0,
      explanation: 'In common-value auctions, the winner is usually whoever had the highest, most optimistic estimation error, frequently leading to losses if bids are not shaded for selection bias.'
    }
  ],

  // Game 9: Split-the-Pie Bargaining (Outside Options & Demands)
  9: [
    {
      id: 'pie-1',
      question: 'What happens if the sum of both players\' demands exceeds the 10-point pie?',
      options: [
        'Negotiations collapse and both players receive only their outside option (1 pt each)',
        'The player with the higher demand gets the whole pie',
        'The excess points are donated to charity',
        'Demands are automatically rounded down by half'
      ],
      correctIndex: 0,
      explanation: 'In Nash demand bargaining with outside options, incompatible demands cause the negotiation to collapse to the disagreement threat point.'
    },
    {
      id: 'pie-2',
      question: 'Why is the 50/50 split ($5, $5) a prominent "Schelling focal point"?',
      options: [
        'It is symmetric, intuitive, and minimizes perceptions of unfairness or greed',
        'It is the only mathematically possible split',
        'The game interface forces players to pick 5',
        'Demanding 5 guarantees an outside option bonus'
      ],
      correctIndex: 0,
      explanation: 'Symmetry and equity make the equal split a natural focal point (Schelling point) around which expectations coordinate without prior communication.'
    },
    {
      id: 'pie-3',
      question: 'How does an increase in a player\'s outside option change their bargaining power?',
      options: [
        'It improves their leverage because they can credibly walk away from unfavorable offers',
        'It decreases their leverage by making them appear uncooperative',
        'It has no mathematical impact on Nash bargaining solutions',
        'It forces the other player to take 100% of the pie'
      ],
      correctIndex: 0,
      explanation: 'A stronger outside option raises a player\'s disagreement payoff (threat point), allowing them to demand a larger share of the surplus.'
    }
  ],

  // Game 10: Costly Signaling & Asymmetric Information (Spence)
  10: [
    {
      id: 'signal-1',
      question: 'What fundamental market failure occurs in Akerlof\'s Lemon Market when quality is unobservable?',
      options: [
        'Buyers only offer an average price, causing high-quality sellers to exit until only lemons remain',
        'Sellers produce too much high-quality inventory',
        'Prices skyrocket due to excessive consumer competition',
        'All sellers make identical monopoly profits'
      ],
      correctIndex: 0,
      explanation: 'When buyers cannot verify quality, they only pay the average market value. High-quality sellers withdraw, leaving only lemons (adverse selection).'
    },
    {
      id: 'signal-2',
      question: 'What is the "single-crossing property" that makes a signal credible in Spence\'s signaling model?',
      options: [
        'Sending the signal must be strictly cheaper or easier for high-quality types than for low-quality types',
        'The signal can only be verified once per year',
        'High and low types face identical signaling costs',
        'The signal must be completely free of charge'
      ],
      correctIndex: 0,
      explanation: 'If low-quality types find the signal too costly to mimic, high-quality types can use it to separate themselves credibly in equilibrium.'
    },
    {
      id: 'signal-3',
      question: 'What is the difference between a "Separating Equilibrium" and a "Pooling Equilibrium"?',
      options: [
        'In separating, different types take different actions; in pooling, all types take the same action',
        'In separating, nobody trades; in pooling, everyone trades',
        'Separating only works with monetary payoffs; pooling only works with non-monetary payoffs',
        'Pooling is always Pareto-optimal'
      ],
      correctIndex: 0,
      explanation: 'In a separating equilibrium, high types signal while low types do not, revealing true quality; in a pooling equilibrium, all types mimic each other so uncertainty persists.'
    }
  ]
};

export const getQuizForGame = (gameId: number): QuizQuestion[] => {
  return SOLO_LAB_QUIZZES[gameId] || SOLO_LAB_QUIZZES[1];
};
