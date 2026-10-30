import React, { useState, useMemo } from 'react';
import { WeekConfig } from '../types';
import { WhatIfSandbox } from './WhatIfSandbox';

interface InstructorDashboardProps {
  currentWeek: WeekConfig;
  onSelectWeek: (weekId: number) => void;
  allWeeks: WeekConfig[];
  currentRound: number;
  onSelectRound: (roundNum: number) => void;
  totalRounds: number;
  onSetTotalRounds: (rounds: number) => void;
}

type InstructorTab = 'results' | 'progress' | 'controls';

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  currentWeek,
  onSelectWeek,
  allWeeks,
  currentRound,
  onSelectRound,
  totalRounds,
  onSetTotalRounds
}) => {
  const [activeTab, setActiveTab] = useState<InstructorTab>('results');
  const [roomCode] = useState('DOTE-3090');
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [instructorTrueValue, setInstructorTrueValue] = useState('14');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeMessage, setActiveMessage] = useState('Welcome! Please lock your Step 1 choices on count of three.');
  const [showProjectorMode, setShowProjectorMode] = useState(false);
  const [showDebriefSandbox, setShowDebriefSandbox] = useState(false);
  const [trialSeed, setTrialSeed] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Student progress filter & search state
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleGenerateFreshCohortTrial = () => {
    setTrialSeed(prev => prev + 1);
    showToast(`🎲 Generated fresh randomized trial for Round ${currentRound}!`);
  };

  // Simulated active classroom cohort dynamically adjusted by trialSeed
  const totalEnrolled = 32;
  const activeOnline = useMemo(() => {
    return 26 + ((trialSeed * 7 + currentRound) % 7);
  }, [trialSeed, currentRound]);
  const pairsMatched = Math.floor(activeOnline / 2);

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      onSelectRound(currentRound + 1);
    } else {
      onSetTotalRounds(totalRounds + 1);
      onSelectRound(totalRounds + 1);
    }
  };

  const handlePrevRound = () => {
    if (currentRound > 1) onSelectRound(currentRound - 1);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastMessage.trim()) {
      setActiveMessage(broadcastMessage.trim());
      setBroadcastMessage('');
      showToast('📢 Broadcast notification dispatched to all student devices!');
    }
  };

  // 32-student master cohort roster with dynamic completion tracking across all games
  const studentCohort = useMemo(() => {
    const rawNames = [
      { id: '3090101', name: 'Alex Rivera', alias: 'AlphaStrategist' },
      { id: '3090102', name: 'Morgan Chen', alias: 'ShadowFox' },
      { id: '3090103', name: 'Jordan Taylor', alias: 'GameFox' },
      { id: '3090104', name: 'Sam Patel', alias: 'VickreyAce' },
      { id: '3090105', name: 'Taylor Brooks', alias: 'CleverFalcon' },
      { id: '3090106', name: 'Casey Patel', alias: 'QuantumWolf' },
      { id: '3090107', name: 'Riley Zhang', alias: 'SolarOtter' },
      { id: '3090108', name: 'Avery Morales', alias: 'BrightLynx' },
      { id: '3090109', name: 'Chris Miller', alias: 'DeltaPlayer' },
      { id: '3090110', name: 'Jamie Davis', alias: 'SilentHawk' },
      { id: '3090111', name: 'Cameron Diaz', alias: 'PatienceFirst' },
      { id: '3090112', name: 'Skyler White', alias: 'EquilibriumSeeker' },
      { id: '3090113', name: 'Quinn Adams', alias: 'BayesMaster' },
      { id: '3090114', name: 'Dakota Johnson', alias: 'FocalAnchor' },
      { id: '3090115', name: 'Peyton Reed', alias: 'TitForTatPro' },
      { id: '3090116', name: 'Reese Witherspoon', alias: 'CentipedeRider' },
      { id: '3090117', name: 'Kendall Jenner', alias: 'BertrandBaron' },
      { id: '3090118', name: 'Rowan Atkinson', alias: 'LevelTwoThinker' },
      { id: '3090119', name: 'Emerson Lake', alias: 'AltruistHeart' },
      { id: '3090120', name: 'Finley Cooper', alias: 'AuctionWhiz' },
      { id: '3090121', name: 'Hayden Christensen', alias: 'HawkDominator' },
      { id: '3090122', name: 'Sawyer Nelson', alias: 'DovePeacekeeper' },
      { id: '3090123', name: 'Harper Lee', alias: 'StagSeeker' },
      { id: '3090124', name: 'Elliot Page', alias: 'MinimaxMaster' },
      { id: '3090125', name: 'Ariel Winter', alias: 'TrustTripler' },
      { id: '3090126', name: 'Logan Paul', alias: 'GrimRetaliator' },
      { id: '3090127', name: 'Spencer Hastings', alias: 'BackwardInduction' },
      { id: '3090128', name: 'Micah Bell', alias: 'FreeRiderCheck' },
      { id: '3090129', name: 'Shiloh Jolie', alias: 'UltimatumJudge' },
      { id: '3090130', name: 'Eden Hazard', alias: 'PennyFlipper' },
      { id: '3090131', name: 'Kai Havertz', alias: 'CoordinationStar' },
      { id: '3090132', name: 'Rory Gilmore', alias: 'StanfordNash' }
    ];

    return rawNames.map((s, idx) => {
      // Deterministic per-student completion tracking across all games in allWeeks
      const isOnline = idx < activeOnline;
      const gameCompletions = allWeeks.map(g => {
        const hash = (trialSeed * 37 + idx * 19 + g.id * 13) % 100;
        // Current active game has specific round-based state
        const isCurrentGame = g.id === currentWeek.id;
        let status: 'completed' | 'in_progress' | 'pending' = 'pending';
        let score = 0;

        if (isCurrentGame) {
          if (!isOnline) {
            status = 'pending';
            score = 0;
          } else if (idx % 5 === 4) {
            status = 'in_progress';
            score = 0;
          } else {
            status = 'completed';
            score = Math.max(1, ((trialSeed * 7 + idx * 3 + currentRound) % 5) + 1);
          }
        } else {
          if (hash < 68) {
            status = 'completed';
            score = (hash % 6) + 1;
          } else if (hash < 82) {
            status = 'in_progress';
            score = 0;
          } else {
            status = 'pending';
            score = 0;
          }
        }

        return {
          gameId: g.id,
          gameIcon: g.icon,
          gameTitle: g.shortTitle || g.title,
          status,
          score
        };
      });

      const completedCount = gameCompletions.filter(c => c.status === 'completed').length;
      const currentGameRecord = gameCompletions.find(c => c.gameId === currentWeek.id);
      const totalScore = gameCompletions.reduce((acc, c) => acc + c.score, 0);

      return {
        id: s.id,
        name: s.name,
        alias: s.alias,
        isOnline,
        gameCompletions,
        completedCount,
        totalGames: allWeeks.length,
        completionPct: Math.round((completedCount / allWeeks.length) * 100),
        currentGameStatus: currentGameRecord?.status || 'pending',
        currentGameScore: currentGameRecord?.score || 0,
        totalScore
      };
    });
  }, [allWeeks, currentWeek.id, activeOnline, trialSeed, currentRound]);

  // Filtered student cohort for the completion matrix
  const filteredStudents = useMemo(() => {
    return studentCohort.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.alias.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.id.includes(studentSearch);

      if (!matchesSearch) return false;
      if (statusFilter === 'completed') return student.currentGameStatus === 'completed';
      if (statusFilter === 'pending') return student.currentGameStatus !== 'completed';
      return true;
    });
  }, [studentCohort, studentSearch, statusFilter]);

  // Dynamic Auction Students for Live Roster & CSV
  const auctionStudents = useMemo(() => {
    const rawRoster = studentCohort.slice(0, 8);
    const isSecondPrice = currentWeek.id === 7;

    return rawRoster.map((s, idx) => {
      const hashVal = ((trialSeed * 23 + currentRound * 17 + idx * 11) % 10) + 1;
      const val = hashVal;
      const bSeed = (trialSeed * 31 + idx * 7) % 100;
      let bid = val;
      if (isSecondPrice) {
        if (bSeed < 60) bid = val;
        else if (bSeed < 85) bid = Math.max(0.5, Math.round((val - 0.5) * 2) / 2);
        else bid = Math.round((val + 1) * 2) / 2;
      } else {
        bid = Math.max(0.5, Math.round(val * 0.75 * 2) / 2);
      }
      return {
        ...s,
        val,
        bid
      };
    }).sort((a, b) => b.bid - a.bid);
  }, [studentCohort, trialSeed, currentRound, currentWeek.id]);

  // Dynamic Dyads for Repeated / 2-Player Games
  const dyadPairs = useMemo(() => {
    return [
      {
        table: 'Pair #1',
        p1: 'Alex R. (AlphaStrategist)',
        p2: 'Morgan C. (ShadowFox)',
        trajectory: currentRound === 1 ? '[C,C]' : currentRound === 2 ? '[C,C] · [C,C]' : '[C,C] · [C,C] · [C,C]',
        trustStatus: 'Mutual Trust Intact',
        score1: currentRound * 2,
        score2: currentRound * 2,
        c1: 'Cooperate',
        c2: 'Cooperate'
      },
      {
        table: 'Pair #2',
        p1: 'Jordan T. (GameFox)',
        p2: 'Sam P. (VickreyAce)',
        trajectory: '[C,C] · [D,C] · [D,D]',
        trustStatus: 'Retaliation Phase',
        score1: 3 + (currentRound - 1),
        score2: currentRound - 1,
        c1: 'Defect',
        c2: 'Defect'
      },
      {
        table: 'Pair #3',
        p1: 'Casey L. (QuantumWolf)',
        p2: 'Taylor B. (CleverFalcon)',
        trajectory: '[C,C] · [D,C] · [C,C]',
        trustStatus: 'Tit-for-Tat Forgiven',
        score1: 2 + currentRound,
        score2: 1 + currentRound,
        c1: 'Cooperate',
        c2: 'Cooperate'
      },
      {
        table: 'Pair #4',
        p1: 'Chris M. (BrightLynx)',
        p2: 'Jamie D. (SilentHawk)',
        trajectory: '[D,D] · [D,D] · [D,D]',
        trustStatus: 'Defection Trap',
        score1: currentRound,
        score2: currentRound,
        c1: 'Defect',
        c2: 'Defect'
      }
    ];
  }, [currentRound]);

  const handleExportCSV = () => {
    let rows: string[] = [];
    if (currentWeek.id === 7 || currentWeek.id === 8) {
      const isSecondPrice = currentWeek.id === 7;
      const highestBid = auctionStudents[0]?.bid || 0;
      const secondBid = auctionStudents[1]?.bid || 0;
      const clearing = isSecondPrice ? secondBid : highestBid;

      rows = auctionStudents.map((s, idx) => {
        const isWinner = idx === 0;
        const profit = isWinner ? s.val - clearing : 0;
        return `${s.id},"${s.name}","${s.alias}","${currentWeek.title}",${currentRound},${isWinner ? 'Winner' : 'Outbid'},${s.val},${s.bid},${profit}`;
      });

      const csvContent =
        "data:text/csv;charset=utf-8," +
        "StudentID,Name,Alias,Topic,Round,Status,Valuation,Bid,Profit\n" +
        rows.join("\n") + "\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `DOTE3090_Trial${trialSeed}_Auction_Round${currentRound}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      rows = studentCohort.map(s => {
        return `${s.id},"${s.name}","${s.alias}","${currentWeek.title}",${currentRound},${s.currentGameStatus},${s.currentGameScore},${s.completedCount}/${s.totalGames}`;
      });
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "StudentID,Name,Alias,ActiveTopic,Round,ActiveGameStatus,ActiveGameScore,OverallModulesCompleted\n" +
        rows.join("\n") + "\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `DOTE3090_Gradebook_Trial${trialSeed}_Round${currentRound}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    showToast('📥 Gradebook CSV exported successfully!');
  };

  // Helper metrics for selected game
  const gameMetrics = useMemo(() => {
    const id = currentWeek.id;
    if (id === 1) {
      return {
        metric1Title: 'Cooperation Rate',
        metric1Value: '64%',
        metric1Sub: '18 of 28 chose Cooperate',
        metric2Title: 'Average Payoff',
        metric2Value: '1.71 pts',
        metric2Sub: 'Nash (D,D) pays 1.00 pt',
        metric3Title: 'Defection Rate',
        metric3Value: '36%',
        metric3Sub: '10 of 28 chose Defect',
        nashPrediction: '100% Defection (Strict Dominant Strategy)',
        nashOutcomeText: 'Strict Nash Equilibrium is (Defect, Defect) yielding (1, 1). Rational self-interest drives players into this Pareto-inferior trap.',
        humanInsightText: 'In single-shot play without prior reputation, real human subjects cooperate 40%–65% of the time due to social preferences, warm glow, and altruistic norms.'
      };
    }
    if (id === 6) {
      return {
        metric1Title: 'Mutual Cooperation Rate',
        metric1Value: '68%',
        metric1Sub: '19 of 28 pairs played (C,C)',
        metric2Title: 'Average Dyad Payoff',
        metric2Value: '3.64 pts/rd',
        metric2Sub: 'Maximum potential: 4.00 pts',
        metric3Title: 'Retaliation / Defection Rate',
        metric3Value: '32%',
        metric3Sub: '9 pairs triggered punishment',
        nashPrediction: 'Folk Theorem Sustained Cooperation (Tit-for-Tat / Grim Trigger)',
        nashOutcomeText: 'When discount factor delta is sufficiently large, credible retaliatory threats sustain the Pareto-efficient (C,C) profile as a Subgame Perfect Nash Equilibrium.',
        humanInsightText: 'Axelrod proved responsive reciprocity (Tit-for-Tat) dominates unprovoked hostility because it is nice, retaliatory, forgiving, and transparent.'
      };
    }
    if (id === 7) {
      return {
        metric1Title: 'Truthful Bidding Rate (b = v)',
        metric1Value: '61%',
        metric1Sub: '17 of 28 bid exact value',
        metric2Title: 'Average Winner Profit',
        metric2Value: '+2.1 pts',
        metric2Sub: 'Clearing price: 2nd highest bid',
        metric3Title: 'Shading / Underbidding Rate',
        metric3Value: '25%',
        metric3Sub: '7 of 28 forewent profit',
        nashPrediction: 'b*(v) = v (Weakly Dominant Strategy)',
        nashOutcomeText: 'In a second-price sealed-bid auction, bidding your exact valuation weakly dominates all other bids regardless of competitor beliefs.',
        humanInsightText: 'Human subjects often carry over bid-shading heuristics from first-price auctions, or mistakenly fear that bidding high will force them to pay their own bid.'
      };
    }
    if (id === 8) {
      return {
        metric1Title: 'Shaded Bidding Rate',
        metric1Value: '71%',
        metric1Sub: '20 of 28 shaded their bids',
        metric2Title: 'Average Winning Bid',
        metric2Value: '6.4 pts',
        metric2Sub: 'Pays own bid upon winning',
        metric3Title: 'Winner\'s Curse Rate',
        metric3Value: '18%',
        metric3Sub: '5 paid above true item value',
        nashPrediction: 'b*(v) = (N-1)/N * v (Bayesian Nash)',
        nashOutcomeText: 'Bidders must shade below private estimate to balance margin against probability of winning. In common value auctions, failing to shade produces Winner\'s Curse.',
        humanInsightText: 'Students frequently fall victim to Winner\'s Curse in early rounds because winning implies you held the most optimistic (overestimated) signal in the room.'
      };
    }
    if (id === 9) {
      return {
        metric1Title: 'Stag Coordination Rate',
        metric1Value: '57%',
        metric1Sub: '16 of 28 hunted Stag',
        metric2Title: 'Coordination Success',
        metric2Value: '71%',
        metric2Sub: 'Matching choices achieved',
        metric3Title: 'Hare (Safe / Risk-Dominant)',
        metric3Value: '43%',
        metric3Sub: '12 picked safe 3 pts',
        nashPrediction: 'Two Pure Equilibria: (Stag, Stag) & (Hare, Hare)',
        nashOutcomeText: '(Stag, Stag) is Pareto payoff-dominant (5, 5), while (Hare, Hare) is risk-dominant (3, 3) because Hare guarantees 3 points regardless of partner choice.',
        humanInsightText: 'Strategic uncertainty drives players toward Hare. Assurance mechanisms (pre-play cheap talk, mutual history) are required to coordinate on Stag.'
      };
    }
    if (id === 10) {
      return {
        metric1Title: 'Marginal Cost Pricing Rate',
        metric1Value: '46%',
        metric1Sub: '13 firms priced at MC ($2)',
        metric2Title: 'Average Market Price',
        metric2Value: '$3.80',
        metric2Sub: 'Monopoly price: $10',
        metric3Title: 'Collusive / High Pricing',
        metric3Value: '21%',
        metric3Sub: '6 firms undercut colluders',
        nashPrediction: 'P1 = P2 = MC = $2 (Bertrand Paradox)',
        nashOutcomeText: 'With homogeneous goods and constant marginal cost, intense price competition drives market prices down to marginal cost with only two firms.',
        humanInsightText: 'Students initially attempt to collude at monopoly prices ($8–$10), but unilateral temptation to undercut by $0.50 rapidly sparks a price war down to MC.'
      };
    }
    if (id === 11) {
      return {
        metric1Title: 'Mean Class Guess',
        metric1Value: '27.4',
        metric1Sub: 'Target (2/3 of mean): 18.3',
        metric2Title: 'Level-1 Guessers (~33)',
        metric2Value: '50%',
        metric2Sub: '14 of 28 assumed Level-0',
        metric3Title: 'Nash Guessers (0)',
        metric3Value: '8%',
        metric3Sub: '2 of 28 played equilibrium',
        nashPrediction: 'Unique Nash Equilibrium: Guess 0',
        nashOutcomeText: 'Iterated elimination of weakly dominated strategies eliminates any guess > 66.7, then > 44.4, unraveling to the unique fixed point of 0.',
        humanInsightText: 'Playing the pure Nash equilibrium (0) loses! Winning requires depth of reasoning: anticipating that peers will reason to Level-1 (~33) or Level-2 (~22).'
      };
    }
    if (id === 12) {
      return {
        metric1Title: 'Average Contribution Rate',
        metric1Value: '54%',
        metric1Sub: '5.4 / 10 tokens contributed',
        metric2Title: 'Group Pool Multiplier',
        metric2Value: '1.6x',
        metric2Sub: '0.4x marginal private return',
        metric3Title: 'Free-Rider Rate (0–2 pts)',
        metric3Value: '18%',
        metric3Sub: '5 free-rode on peers',
        nashPrediction: 'Zero Contribution (Dominant Strategy)',
        nashOutcomeText: 'Since the marginal per-capita return (0.4x) is less than 1.0x, free-riding is a dominant strategy for self-interested rational players.',
        humanInsightText: 'Empirical contributions start high (~50%) via conditional cooperation, then decay over repeated rounds as cooperators witness free-riding and punish the pool.'
      };
    }
    if (id === 13) {
      return {
        metric1Title: 'Aggressive (Hawk) Rate',
        metric1Value: '39%',
        metric1Sub: '11 of 28 played Hawk',
        metric2Title: 'Mutual Crash Rate (H, H)',
        metric2Value: '14%',
        metric2Sub: 'Severe payoff penalty (-5, -5)',
        metric3Title: 'Accommodating (Dove) Rate',
        metric3Value: '61%',
        metric3Sub: '17 shared the territory',
        nashPrediction: 'Two Pure Asymmetric + One Mixed ESS',
        nashOutcomeText: 'Pure equilibria: (Hawk, Dove) and (Dove, Hawk). Symmetric mixed-strategy Nash equilibrium dictates Hawk with probability V/C.',
        humanInsightText: 'Players use asymmetries and commitment signals (swerving first vs throwing away the steering wheel) to establish deterrence without costly crashes.'
      };
    }
    if (id === 14) {
      return {
        metric1Title: 'Fair Offer Rate (40%–50%)',
        metric1Value: '72%',
        metric1Sub: '20 of 28 proposed $4–$5',
        metric2Title: 'Rejection Rate (< $3)',
        metric2Value: '68%',
        metric2Sub: 'Low offers rejected',
        metric3Title: 'Average Offer Proposed',
        metric3Value: '$4.20',
        metric3Sub: 'Out of $10 total pie',
        nashPrediction: 'Proposer offers $1 (or $0.01); Responder accepts',
        nashOutcomeText: 'Subgame perfection: since $1 > $0, rational responders accept any positive amount, so the proposer extracts virtually the entire surplus.',
        humanInsightText: 'Real responders possess strong inequity aversion: they willingly pay money to punish unfair offers (<30%), enforcing social fairness norms.'
      };
    }
    if (id === 15) {
      return {
        metric1Title: 'Heads Selection Rate',
        metric1Value: '48%',
        metric1Sub: 'Near-perfect 50/50 balance',
        metric2Title: 'Tails Selection Rate',
        metric2Value: '52%',
        metric2Sub: 'No exploitable pure bias',
        metric3Title: 'Matcher Win Rate',
        metric3Value: '50%',
        metric3Sub: 'Zero-sum net balance',
        nashPrediction: 'Mixed Strategy Nash: 50% Heads, 50% Tails',
        nashOutcomeText: 'No pure Nash equilibrium exists. The unique minimax equilibrium requires each player to randomize uniformly 50/50 to remain unexploitable.',
        humanInsightText: 'Humans struggle to generate true randomness, exhibiting serial correlation (avoiding streaks of 3+ heads) that algorithmic bots can exploit.'
      };
    }
    if (id === 16) {
      return {
        metric1Title: 'Successful Coordination',
        metric1Value: '64%',
        metric1Sub: '18 of 28 agreed on venue',
        metric2Title: 'Miscoordination Rate',
        metric2Value: '36%',
        metric2Sub: 'Both earned 0 points',
        metric3Title: 'Option A (Football) Split',
        metric3Value: '54%',
        metric3Sub: 'vs 46% Option B (Opera)',
        nashPrediction: 'Two Pure Equilibria + Mixed Strategy Nash',
        nashOutcomeText: 'Both players prefer to coordinate rather than clash, but disagree on which equilibrium is preferred. Mixed strategy yields frequent coordination failure.',
        humanInsightText: 'Real subjects use focal points (Schelling salience), alternating turns across repeated rounds, or pre-play communication to break deadlock.'
      };
    }
    if (id === 17) {
      return {
        metric1Title: 'Average Amount Sent',
        metric1Value: '5.8 / 10',
        metric1Sub: 'Tripled upon transfer',
        metric2Title: 'Average Return Ratio',
        metric2Value: '1.42x',
        metric2Sub: 'Reciprocity rewards trust',
        metric3Title: 'High-Trust Investors ($8+)',
        metric3Value: '43%',
        metric3Sub: '12 sent maximum tokens',
        nashPrediction: 'Backward Induction: Send $0, Return $0',
        nashOutcomeText: 'In the final stage, a selfish Trustee returns $0. Anticipating this, the rational Investor sends $0 in Stage 1, leaving total surplus at 10.',
        humanInsightText: 'Trust generates mutual surplus: investors routinely send >50% of endowment, and trustees reciprocate by returning more than the principal.'
      };
    }
    // Default to Centipede Game (id 20)
    return {
      metric1Title: 'Node 1 Immediate Take (SPNE)',
      metric1Value: '7%',
      metric1Sub: '2 of 28 ended at Node 1',
      metric2Title: 'Average Chain Depth',
      metric2Value: 'Node 4.2',
      metric2Sub: 'Chain reaches 70% depth',
      metric3Title: 'Deep / Terminal Cooperation',
      metric3Value: '39%',
      metric3Sub: '11 reached Nodes 5–6',
      nashPrediction: 'SPNE: Take Immediately at Node 1 (2, 0)',
      nashOutcomeText: 'By strict backward induction, Player 2 would Take at Node 6; knowing this, Player 1 Takes at Node 5; cascading backwards to an immediate Node 1 Take.',
      humanInsightText: 'Real subjects pass because the opportunity cost of trusting is low ($1) while the welfare multiplier is huge ($8 vs $2), demonstrating bounded rationality and altruism.'
    };
  }, [currentWeek.id]);

  // ==========================================
  // PROJECTOR FULL-SCREEN PRESENTATION MODE
  // ==========================================
  if (showProjectorMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0F17] text-slate-100 overflow-y-auto font-sans p-6 lg:p-10 flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
                <span className="font-mono text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
                  ● Live Classroom Projector
                </span>
                <span>·</span>
                <span>DOTE 3090 Experimental Economics</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-slate-300">{activeOnline} Students Connected</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{currentWeek.icon}</span>
                <span>{currentWeek.title}</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Join Room Code</div>
                <div className="text-2xl font-mono font-black text-blue-400 tracking-widest leading-none">
                  {roomCode}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 font-mono text-sm">
                  <button
                    onClick={handlePrevRound}
                    disabled={currentRound <= 1}
                    className="px-2.5 py-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Previous Round"
                  >
                    ◀
                  </button>
                  <span className="px-2 font-bold text-white tabular-nums">
                    Round {currentRound} / {totalRounds}
                  </span>
                  <button
                    onClick={handleNextRound}
                    className="px-2.5 py-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Next Round"
                  >
                    ▶
                  </button>
                </div>

                <button
                  onClick={handleGenerateFreshCohortTrial}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>🎲</span>
                  <span>Fresh Trial</span>
                </button>

                <button
                  onClick={() => setShowDebriefSandbox(prev => !prev)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    showDebriefSandbox
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-500/30'
                      : 'bg-slate-900 text-indigo-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono">∫</span>
                  <span>{showDebriefSandbox ? 'Hide Curves' : 'Debrief Curves'}</span>
                </button>

                <button
                  onClick={() => setShowProjectorMode(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  ✕ Exit Projector
                </button>
              </div>
            </div>
          </div>

          {activeMessage && (
            <div className="mt-4 bg-slate-900/90 border border-amber-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm text-amber-200">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 bg-amber-500/20 rounded">
                  BROADCAST
                </span>
                <span>{activeMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Projector Body Grid */}
        <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Classroom Action Distribution</h2>
                <p className="text-xs text-slate-400">Aggregate telemetry across {activeOnline} active participants</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-500/15 text-blue-300 rounded border border-blue-500/30">
                Round {currentRound} Results
              </span>
            </div>

            {/* KPI Triad */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl">
                <span className="text-purple-300 text-xs font-medium block mb-1">{gameMetrics.metric1Title}</span>
                <span className="text-2xl font-black font-mono tabular-nums text-purple-200">{gameMetrics.metric1Value}</span>
              </div>
              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                <span className="text-slate-300 text-xs font-medium block mb-1">{gameMetrics.metric2Title}</span>
                <span className="text-2xl font-black font-mono tabular-nums text-emerald-300">{gameMetrics.metric2Value}</span>
              </div>
              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                <span className="text-amber-400 text-xs font-medium block mb-1">{gameMetrics.metric3Title}</span>
                <span className="text-2xl font-black font-mono tabular-nums text-amber-300">{gameMetrics.metric3Value}</span>
              </div>
            </div>

            {/* Debrief callout */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <div>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] block">
                  Textbook Theory Prediction:
                </span>
                <p className="text-slate-200 font-medium">{gameMetrics.nashOutcomeText}</p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[11px] block">
                  Observed Human Student Behavior:
                </span>
                <p className="text-slate-300">{gameMetrics.humanInsightText}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {showDebriefSandbox ? (
              <WhatIfSandbox game={currentWeek} />
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {currentWeek.id === 7 || currentWeek.id === 8 ? 'Live Market Clearing Ladder' : 'Dyad Interaction Status'}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    Round {currentRound} Standings
                  </span>
                </div>

                <div className="overflow-x-auto">
                  {currentWeek.id === 7 || currentWeek.id === 8 ? (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-medium">
                          <th className="pb-2">Bidder</th>
                          <th className="pb-2">Valuation</th>
                          <th className="pb-2">Bid</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {auctionStudents.slice(0, 6).map((s, idx) => {
                          const isWinner = idx === 0;
                          const isPricePayer = currentWeek.id === 7 ? idx === 1 : idx === 0;
                          const secondBid = auctionStudents[1]?.bid || 0;
                          const clearing = currentWeek.id === 7 ? secondBid : (auctionStudents[0]?.bid || 0);
                          const profit = isWinner ? Math.round((s.val - clearing) * 10) / 10 : 0;
                          return (
                            <tr key={s.id}>
                              <td className="py-2.5 font-bold text-white">{s.name} ({s.alias})</td>
                              <td className="py-2.5 font-mono tabular-nums text-slate-300">{s.val} pts</td>
                              <td className="py-2.5 font-mono tabular-nums text-blue-400 font-bold">{s.bid} pts</td>
                              <td className="py-2.5">
                                {isWinner ? (
                                  <span className="text-emerald-400 font-bold">● Won Auction</span>
                                ) : isPricePayer && currentWeek.id === 7 ? (
                                  <span className="text-amber-400 font-bold">🏷️ Set 2nd Price</span>
                                ) : (
                                  <span className="text-slate-500">○ Outbid</span>
                                )}
                              </td>
                              <td className="py-2.5 text-right font-mono tabular-nums font-bold text-emerald-400">
                                {profit > 0 ? `+${profit}` : profit} pts
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-medium">
                          <th className="pb-2">Dyad</th>
                          <th className="pb-2">Participants</th>
                          <th className="pb-2">Trajectory</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {dyadPairs.map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 font-bold text-white">{p.table}</td>
                            <td className="py-2.5">{p.p1.split(' ')[0]} & {p.p2.split(' ')[0]}</td>
                            <td className="py-2.5">
                              <span className="font-mono tabular-nums font-bold text-slate-300">
                                {p.trajectory}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className={p.trustStatus.includes('Intact') ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                                {p.trustStatus}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono tabular-nums font-bold text-white">
                              {p.score1} : {p.score2}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>MobLab-Style Classroom Experiment Simulator · Dynamic Trial Seed #{trialSeed}</span>
          <button
            onClick={() => setShowDebriefSandbox(prev => !prev)}
            className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
          >
            {showDebriefSandbox ? 'Switch to Live Leaderboard' : 'Switch to Interactive What-If Curves'}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // STANDARD INSTRUCTOR DASHBOARD VIEW
  // ==========================================
  return (
    <div className="space-y-6">
      {/* 1. Main Plain-Language Portal Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px]">
                🎓 Instructor Portal
              </span>
              <span className="text-slate-400 font-medium">Session Room:</span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {roomCode}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isSessionActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                {isSessionActive ? '● Session Live' : '❚❚ Paused'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Classroom Economics Laboratory Hub
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Configure experimental sessions, observe real-time class decision distributions, compare collective student behavior directly against theoretical Nash equilibria, and track student completion across all laboratory games.
            </p>
          </div>

          {/* Quick Header Action Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateFreshCohortTrial}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="Generate a fresh randomized trial for this round"
            >
              <span>🎲</span>
              <span>Fresh Trial</span>
            </button>
            <button
              onClick={() => setShowProjectorMode(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Open full-screen display for classroom presentation"
            >
              <span>📺</span>
              <span>Projector View</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              title="Export complete gradebook and telemetry data"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Live Cohort Quick Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Connected Students</span>
            <span className="text-base font-bold text-white font-mono tabular-nums">
              {activeOnline} / {totalEnrolled} Online
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Active Dyads Matched</span>
            <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
              {pairsMatched} Pairs Matched
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Current Pace & Round</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                onClick={handlePrevRound}
                disabled={currentRound <= 1}
                className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer font-bold"
                title="Previous Round"
              >
                ◀
              </button>
              <span className="font-bold text-white font-mono tabular-nums">
                Rd {currentRound} of {totalRounds}
              </span>
              <button
                onClick={handleNextRound}
                className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer font-bold"
                title="Next Round"
              >
                ▶
              </button>
              <button
                onClick={() => onSetTotalRounds(totalRounds + 1)}
                className="px-1.5 py-0.5 bg-blue-700 hover:bg-blue-600 rounded text-[10px] font-bold text-white cursor-pointer"
                title="Add an extra round"
              >
                +1
              </button>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Active Laboratory Experiment</span>
            <select
              value={currentWeek.id}
              onChange={(e) => onSelectWeek(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 w-full font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {Array.from(new Set(allWeeks.map(w => w.category || 'Classroom Games'))).map(cat => (
                <optgroup key={cat} label={cat} className="bg-slate-900 text-amber-300 font-bold">
                  {allWeeks.filter(w => (w.category || 'Classroom Games') === cat).map(w => (
                    <option key={w.id} value={w.id} className="bg-slate-800 text-slate-100 font-normal">
                      {w.icon} {w.shortTitle || w.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white hover:text-purple-200 text-sm font-bold ml-2">×</button>
        </div>
      )}

      {/* Active Broadcast Alert */}
      {activeMessage && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-amber-400 text-[10px] px-2 py-0.5 bg-amber-500/20 rounded">
              CLASS NOTICE
            </span>
            <span className="font-medium">{activeMessage}</span>
          </div>
          <button
            onClick={() => setActiveMessage('')}
            className="text-amber-400 hover:text-amber-200 font-bold ml-2 text-sm cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Three Dedicated Instructor Tabs */}
      <div className="space-y-4">
        {/* Tab Buttons Strip */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>📊</span>
            <span>Class Results & Theory Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>📋</span>
            <span>Student Progress & Completion Matrix</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-200 font-mono">
              32
            </span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'controls'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>⚙️</span>
            <span>Session Setup & Controls</span>
          </button>
        </div>

        {/* Tab Header Banner explaining what each tab shows */}
        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <span className="text-base leading-none">ℹ️</span>
          <div>
            {activeTab === 'results' && (
              <p>
                <strong className="text-white font-semibold">Live Results & Theory Benchmark:</strong> Review real-time student choice distributions, cooperation/coordination rates, average payoffs, and empirical deviations next to textbook Nash equilibrium predictions.
              </p>
            )}
            {activeTab === 'progress' && (
              <p>
                <strong className="text-white font-semibold">Student Progress & Completion Matrix:</strong> Track which students have completed which games across all 12 laboratory modules, monitor individual scores, completion timestamps, and gradebook progress.
              </p>
            )}
            {activeTab === 'controls' && (
              <p>
                <strong className="text-white font-semibold">Session Setup & Controls:</strong> Manage classroom pace, advance rounds synchronously, broadcast announcements, reveal hidden values, and launch full-screen projector mode.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Embedded What-If Lecture Debrief Sandbox (When toggled on) */}
      {showDebriefSandbox && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              ∫ Dynamic Payoff Curve Debrief Simulator
            </span>
            <button
              onClick={() => setShowDebriefSandbox(false)}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Close Sandbox ✕
            </button>
          </div>
          <WhatIfSandbox game={currentWeek} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CLASS RESULTS & THEORY BENCHMARK */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Top 4 Clear Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                {gameMetrics.metric1Title}
              </span>
              <div className="text-2xl font-black font-mono tabular-nums text-purple-200">
                {gameMetrics.metric1Value}
              </div>
              <p className="text-[11px] text-slate-400">{gameMetrics.metric1Sub}</p>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                {gameMetrics.metric2Title}
              </span>
              <div className="text-2xl font-black font-mono tabular-nums text-emerald-300">
                {gameMetrics.metric2Value}
              </div>
              <p className="text-[11px] text-slate-400">{gameMetrics.metric2Sub}</p>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                {gameMetrics.metric3Title}
              </span>
              <div className="text-2xl font-black font-mono tabular-nums text-amber-300">
                {gameMetrics.metric3Value}
              </div>
              <p className="text-[11px] text-slate-400">{gameMetrics.metric3Sub}</p>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                Active Submissions Tracked
              </span>
              <div className="text-2xl font-black font-mono tabular-nums text-blue-200">
                {activeOnline} / {totalEnrolled}
              </div>
              <p className="text-[11px] text-slate-400">100% of online participants in Round {currentRound}</p>
            </div>
          </div>

          {/* Main Grid: Distribution Chart + Side-by-Side Theory Benchmark */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Chart: Choice Distribution */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Distribution of Student Choices
                  </h3>
                  <p className="text-xs text-slate-400">
                    Empirical classroom selections in {currentWeek.shortTitle || currentWeek.title} (Round {currentRound})
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  {activeOnline} Decisions
                </span>
              </div>

              {/* Dynamic Game-Specific Choice Distribution Bars */}
              {currentWeek.id === 6 ? (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-purple-300 font-bold">Mutual Trust (C, C) · Folk Theorem</span>
                      <span className="font-mono tabular-nums text-white">19 Dyads (68%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: '68%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-300 font-bold">Unilateral Defection (D, C) / (C, D)</span>
                      <span className="font-mono tabular-nums text-white">5 Dyads (18%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '18%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Mutual Defection Trap (D, D)</span>
                      <span className="font-mono tabular-nums text-white">4 Dyads (14%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full transition-all" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>
              ) : currentWeek.id === 7 || currentWeek.id === 8 ? (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-blue-400 font-bold">Truthful Bidding (b = v) · Weakly Dominant</span>
                      <span className="font-mono tabular-nums text-white">17 Students (61%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: '61%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Shaded / Underbidding (b &lt; v)</span>
                      <span className="font-mono tabular-nums text-white">7 Students (25%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full transition-all" style={{ width: '25%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-400 font-bold">Overbidding (b &gt; v · Winner's Curse Risk)</span>
                      <span className="font-mono tabular-nums text-white">4 Students (14%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>
              ) : currentWeek.id === 11 ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Level-0 (~50 · Random / Anchor)</span>
                      <span className="font-mono tabular-nums text-white">6 Students (21%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: '21%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-indigo-400 font-bold">Level-1 (~33 · 2/3 of 50)</span>
                      <span className="font-mono tabular-nums text-white">14 Students (50%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-purple-400 font-bold">Level-2 (~22 · 2/3 of 33)</span>
                      <span className="font-mono tabular-nums text-white">6 Students (21%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '21%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-emerald-400 font-bold">Nash Equilibrium (0 · Complete Induction)</span>
                      <span className="font-mono tabular-nums text-white">2 Students (8%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>
              ) : currentWeek.id === 12 ? (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-emerald-400 font-bold">High Contribution (8–10 tokens · Altruistic)</span>
                      <span className="font-mono tabular-nums text-white">11 Students (39%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '39%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-blue-400 font-bold">Conditional Cooperators (4–7 tokens)</span>
                      <span className="font-mono tabular-nums text-white">12 Students (43%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '43%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-400 font-bold">Free-Riders (0–3 tokens · Strict Nash)</span>
                      <span className="font-mono tabular-nums text-white">5 Students (18%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '18%' }} />
                    </div>
                  </div>
                </div>
              ) : currentWeek.id === 20 ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Node 1 Take (SPNE · Zero Trust)</span>
                      <span className="font-mono tabular-nums text-white">2 Students (7%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: '7%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-400 font-bold">Nodes 2–4 Exit (Moderate Bounded Trust)</span>
                      <span className="font-mono tabular-nums text-white">15 Students (54%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '54%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-emerald-400 font-bold">Nodes 5–6 / Terminal (High Cooperation)</span>
                      <span className="font-mono tabular-nums text-white">11 Students (39%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '39%' }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-blue-400 font-bold">Cooperative / High Coordination Option</span>
                      <span className="font-mono tabular-nums text-white">18 Students (64%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '64%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-400 font-bold">Defection / Selfish / Pure Nash Option</span>
                      <span className="font-mono tabular-nums text-white">10 Students (36%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '36%' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theory Benchmark Comparison Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>⚖️</span>
                  <span>Nash Equilibrium vs. Empirical Play</span>
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Game Theory
                </span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block">
                  Textbook Game-Theoretic Prediction:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {gameMetrics.nashOutcomeText}
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-400 block">
                  Observed Human Classroom Play:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {gameMetrics.humanInsightText}
                </p>
              </div>

              <div className="p-3.5 bg-blue-950/30 rounded-xl border border-blue-900/40 text-xs text-blue-200 leading-relaxed">
                <strong className="text-blue-300 font-bold block mb-0.5">💡 Lecture Discussion Prompt:</strong>
                Ask the class: &quot;Why did our collective behavior deviate from textbook Nash equilibrium? What would happen if we repeated this game 100 times with public reputation?&quot;
              </div>
            </div>
          </div>

          {/* Connected Roster / Standings Preview */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {currentWeek.id === 7 || currentWeek.id === 8 ? 'Live Auction Bidder Standings' : 'Live Dyad & Partner Trajectories'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Round {currentRound} Standings
              </span>
            </div>

            <div className="overflow-x-auto">
              {currentWeek.id === 7 || currentWeek.id === 8 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-2">Bidder Codename</th>
                      <th className="pb-2">Drawn Valuation</th>
                      <th className="pb-2">Sealed Bid</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {auctionStudents.slice(0, 5).map((s, idx) => {
                      const isWinner = idx === 0;
                      const isPricePayer = currentWeek.id === 7 ? idx === 1 : idx === 0;
                      const secondBid = auctionStudents[1]?.bid || 0;
                      const clearing = currentWeek.id === 7 ? secondBid : (auctionStudents[0]?.bid || 0);
                      const profit = isWinner ? Math.round((s.val - clearing) * 10) / 10 : 0;
                      return (
                        <tr key={s.id}>
                          <td className="py-2.5 font-bold text-white">{s.name} ({s.alias})</td>
                          <td className="py-2.5 font-mono tabular-nums">{s.val} pts</td>
                          <td className="py-2.5 font-mono tabular-nums text-blue-400 font-bold">{s.bid} pts</td>
                          <td className="py-2.5">
                            {isWinner ? (
                              <span className="text-emerald-400 font-bold">● Won Auction</span>
                            ) : isPricePayer && currentWeek.id === 7 ? (
                              <span className="text-amber-400 font-bold">🏷️ Set 2nd Price</span>
                            ) : (
                              <span className="text-slate-500">○ Outbid</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right font-mono tabular-nums font-bold text-emerald-400">
                            {profit > 0 ? `+${profit}` : profit} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-2">Table / Pair</th>
                      <th className="pb-2">Participants</th>
                      <th className="pb-2">Trajectory (Rounds 1–{currentRound})</th>
                      <th className="pb-2">Trust Dynamic</th>
                      <th className="pb-2 text-right">Cumulative Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {dyadPairs.map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-white">{p.table}</td>
                        <td className="py-2.5">{p.p1.split(' ')[0]} & {p.p2.split(' ')[0]}</td>
                        <td className="py-2.5 font-mono tabular-nums font-bold text-slate-300">
                          {p.trajectory}
                        </td>
                        <td className="py-2.5">
                          <span className={p.trustStatus.includes('Intact') || p.trustStatus.includes('Forgiven') ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                            {p.trustStatus}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums font-bold text-white">
                          {p.score1} pts : {p.score2} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT PROGRESS & COMPLETION MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Cohort Progress Overview KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs block mb-1">Total Enrolled</span>
              <span className="text-2xl font-black font-mono text-white">32</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Official Roster</span>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs block mb-1">Active Online</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{activeOnline}</span>
              <span className="text-[11px] text-emerald-500/80 block mt-0.5">Connected Now</span>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs block mb-1">Current Game Submissions</span>
              <span className="text-2xl font-black font-mono text-blue-400">
                {studentCohort.filter(s => s.currentGameStatus === 'completed').length} / 32
              </span>
              <span className="text-[11px] text-blue-400/80 block mt-0.5">{currentWeek.shortTitle || currentWeek.title}</span>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs block mb-1">Mean Modules Finished</span>
              <span className="text-2xl font-black font-mono text-purple-400">
                {(studentCohort.reduce((acc, s) => acc + s.completedCount, 0) / 32).toFixed(1)} / {allWeeks.length}
              </span>
              <span className="text-[11px] text-purple-400/80 block mt-0.5">Average Progress</span>
            </div>
          </div>

          {/* Search, Filter & Legend Bar */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student name, student ID, or codename..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Filter:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({studentCohort.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Completed Current ({studentCohort.filter(s => s.currentGameStatus === 'completed').length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Pending ({studentCohort.filter(s => s.currentGameStatus !== 'completed').length})
              </button>
            </div>

            {/* Legend */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 pl-3 border-l border-slate-800">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Done</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                <span>Not Started</span>
              </div>
            </div>
          </div>

          {/* Student Game Completion Matrix Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Student Cohort Game Completion Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredStudents.length} of 32 students · Checkmarks indicate verified lab submissions
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Active Game: <span className="text-blue-300 font-bold">{currentWeek.icon} {currentWeek.shortTitle || currentWeek.title}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                    <th className="py-3 px-4">Student ID & Name</th>
                    <th className="py-3 px-3">Codename</th>
                    <th className="py-3 px-3">Current Game Status</th>
                    <th className="py-3 px-3">Total Progress</th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>Laboratory Modules (12 Games)</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${student.isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} title={student.isOnline ? 'Online' : 'Offline'} />
                          <span>{student.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 pl-4">{student.id}</div>
                      </td>

                      {/* Alias */}
                      <td className="py-3 px-3 font-mono text-blue-300">
                        @{student.alias}
                      </td>

                      {/* Current Game Status */}
                      <td className="py-3 px-3">
                        {student.currentGameStatus === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span>✓ Completed</span>
                            <span className="font-mono">({student.currentGameScore} pts)</span>
                          </span>
                        ) : student.currentGameStatus === 'in_progress' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <span>◐ In Progress</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
                            <span>○ Not Started</span>
                          </span>
                        )}
                      </td>

                      {/* Total Progress Bar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${student.completionPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-300">
                            {student.completedCount}/{student.totalGames}
                          </span>
                        </div>
                      </td>

                      {/* Per-Game Completion Checklist Badges */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {student.gameCompletions.map((gc) => (
                            <div
                              key={gc.gameId}
                              title={`${gc.gameIcon} ${gc.gameTitle}: ${gc.status === 'completed' ? `Completed (${gc.score} pts)` : gc.status === 'in_progress' ? 'In Progress' : 'Not Started'}`}
                              className={`relative group w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all cursor-default ${
                                gc.status === 'completed'
                                  ? 'bg-emerald-950/80 border border-emerald-600/70 text-emerald-300'
                                  : gc.status === 'in_progress'
                                  ? 'bg-amber-950/80 border border-amber-500/60 text-amber-300'
                                  : 'bg-slate-950 border border-slate-800 text-slate-600'
                              } ${gc.gameId === currentWeek.id ? 'ring-2 ring-blue-500' : ''}`}
                            >
                              <span>{gc.gameIcon}</span>
                              {gc.status === 'completed' && (
                                <span className="absolute -top-1 -right-1 text-[8px] bg-emerald-500 text-slate-950 rounded-full w-3 h-3 flex items-center justify-center font-black">
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => showToast(`🔔 Reminder sent to ${student.name} (@${student.alias})!`)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] transition-colors cursor-pointer"
                        >
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SESSION SETUP & CONTROLS */}
      {/* ========================================================================= */}
      {activeTab === 'controls' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Control 1: Session Status */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>⏯️</span>
                  <span>Session State (Live / Paused)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allow or pause new student decision inputs in real time.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSessionActive(prev => !prev);
                  showToast(isSessionActive ? '❚❚ Classroom session paused.' : '● Classroom session is now live!');
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isSessionActive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isSessionActive ? '● Session Currently Live (Click to Pause)' : '❚❚ Session Paused (Click to Resume)'}
              </button>
            </div>

            {/* Control 2: Classroom Pace & Rounds */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Classroom Pace & Round Stepper</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronously advance all student pairs to the next experimental round.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevRound}
                  disabled={currentRound <= 1}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  ◀ Prev Round
                </button>
                <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white text-center">
                  Round {currentRound} / {totalRounds}
                </div>
                <button
                  onClick={handleNextRound}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Next Round ▶
                </button>
                <button
                  onClick={() => {
                    onSetTotalRounds(totalRounds + 1);
                    showToast(`Added extra Round ${totalRounds + 1}!`);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                  title="Add extra round"
                >
                  +1 Rd
                </button>
              </div>
            </div>

            {/* Control 3: Active Laboratory Module */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🎮</span>
                  <span>Active Laboratory Module</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select which game or experiment is currently active for the class.
                </p>
              </div>
              <select
                value={currentWeek.id}
                onChange={(e) => {
                  onSelectWeek(parseInt(e.target.value, 10));
                  showToast('Updated active experiment module!');
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {Array.from(new Set(allWeeks.map(w => w.category || 'Classroom Games'))).map(cat => (
                  <optgroup key={cat} label={cat} className="bg-slate-900 text-amber-300 font-bold">
                    {allWeeks.filter(w => (w.category || 'Classroom Games') === cat).map(w => (
                      <option key={w.id} value={w.id} className="bg-slate-800 text-slate-100 font-normal">
                        {w.icon} {w.shortTitle || w.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Control 4: Class Announcement Broadcast */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3 md:col-span-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📢</span>
                  <span>Class Announcement Broadcast</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Push an urgent banner or prompt directly to all student screens.
                </p>
              </div>
              <form onSubmit={handleBroadcast} className="space-y-3">
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. '30 seconds left to lock Step 1 decisions before simultaneous reveal...'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none font-medium"
                />
                <div className="flex justify-end gap-2">
                  {activeMessage && (
                    <button
                      type="button"
                      onClick={() => setActiveMessage('')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                    >
                      Clear Active Notice
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Broadcast to Students
                  </button>
                </div>
              </form>
            </div>

            {/* Control 5: Fresh Randomized Cohort Trial */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🎲</span>
                  <span>Generate Fresh Randomized Trial</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Re-randomize student valuation draws and dyad partner pairings.
                </p>
              </div>
              <button
                onClick={handleGenerateFreshCohortTrial}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🎲</span>
                <span>Roll Fresh Trial Seed (#{trialSeed + 1})</span>
              </button>
            </div>

            {/* Control 6: True Item Value Reveal (Auction / Winner's Curse) */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Reveal True Item Value (Auction / Winner's Curse)</span>
                </h3>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  Publish the true valuation so students can compute Winner's Curse profit.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={instructorTrueValue}
                  onChange={(e) => setInstructorTrueValue(e.target.value)}
                  className="w-24 bg-slate-950 border border-purple-700/80 rounded-xl p-2 font-mono tabular-nums font-bold text-purple-200 text-xs"
                />
                <button
                  onClick={() => {
                    setActiveMessage(`The True Item Value is officially revealed: $${instructorTrueValue}! Enter it into your Post-Round reveal field.`);
                    showToast(`Revealed True Value: $${instructorTrueValue}`);
                  }}
                  className="flex-1 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Broadcast Value (${instructorTrueValue})
                </button>
              </div>
            </div>

            {/* Control 7: Projector Presentation Mode */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📺</span>
                  <span>Projector Presentation Mode</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Launch high-contrast fullscreen view formatted for lecture hall screens.
                </p>
              </div>
              <button
                onClick={() => setShowProjectorMode(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📺</span>
                <span>Open Projector View</span>
              </button>
            </div>

            {/* Control 8: Gradebook CSV Data Export */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📥</span>
                  <span>Export Gradebook & Decisions CSV</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Download student-level row-by-row decisions, valuations, and payoffs.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📥</span>
                <span>Export Telemetry CSV</span>
              </button>
            </div>

            {/* Control 9: Interactive Payoff Curves Sandbox */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <span>∫</span>
                  <span>Interactive Payoff Curves Sandbox</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Open mathematical payoff curves to visually debrief equilibrium conditions.
                </p>
              </div>
              <button
                onClick={() => setShowDebriefSandbox(prev => !prev)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  showDebriefSandbox
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-900/60'
                }`}
              >
                {showDebriefSandbox ? 'Hide Payoff Curves Sandbox' : 'Launch Payoff Curves Sandbox'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
