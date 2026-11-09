import React, { useState, useMemo, useEffect } from 'react';
import { WeekConfig } from '../types';
import { WhatIfSandbox } from './WhatIfSandbox';
import { getDebriefDistribution } from '../utils/instructorDebriefEngine';

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
  const [roomCode] = useState('CLASSROOM');
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

  // Close projector mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showProjectorMode) {
        setShowProjectorMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showProjectorMode]);

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
    return isSessionActive ? 26 + ((trialSeed * 7 + currentRound) % 7) : 0;
  }, [isSessionActive, trialSeed, currentRound]);
  const pairsMatched = Math.floor(activeOnline / 2);

  // Live dynamic choice distribution & theoretical Nash debrief data
  const debriefDist = useMemo(() => {
    return getDebriefDistribution(
      currentWeek.id,
      activeOnline,
      trialSeed,
      currentRound,
      isSessionActive
    );
  }, [currentWeek.id, activeOnline, trialSeed, currentRound, isSessionActive]);

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
      link.setAttribute("download", `GameTheory_Trial${trialSeed}_Auction_Round${currentRound}.csv`);
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
      link.setAttribute("download", `GameTheory_Gradebook_Trial${trialSeed}_Round${currentRound}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    showToast('📥 Gradebook CSV exported successfully!');
  };

  // Helper metrics for selected game
  // Helper metrics for selected game synchronized 100% with debriefDist
  const gameMetrics = useMemo(() => {
    const id = currentWeek.id;
    const bars = debriefDist.bars;
    const total = debriefDist.totalSubmissions;

    if (!debriefDist.hasData || bars.length === 0 || total === 0) {
      return {
        metric1Title: 'Primary Choice',
        metric1Value: '0%',
        metric1Sub: '0 of 0 submissions',
        metric2Title: 'Secondary Choice',
        metric2Value: '0%',
        metric2Sub: '0 of 0 submissions',
        metric3Title: 'Equilibrium Play',
        metric3Value: '0%',
        metric3Sub: '0 of 0 submissions',
        nashPrediction: debriefDist.nashPredictionHeadline,
        nashOutcomeText: debriefDist.nashOutcomeExplanation,
        humanInsightText: debriefDist.behavioralInsight
      };
    }

    if (id === 1) {
      // Prisoner's Dilemma
      const cBar = bars[0]; // Cooperate
      const dBar = bars[1]; // Defect
      return {
        metric1Title: 'Cooperation Rate',
        metric1Value: `${cBar?.percentage ?? 0}%`,
        metric1Sub: `${cBar?.count ?? 0} of ${total} chose Cooperate`,
        metric2Title: 'Defection Rate (Nash)',
        metric2Value: `${dBar?.percentage ?? 0}%`,
        metric2Sub: `${dBar?.count ?? 0} of ${total} chose Defect`,
        metric3Title: 'Dominant Strategy Play',
        metric3Value: `${dBar?.percentage ?? 0}%`,
        metric3Sub: `${dBar?.count ?? 0} of ${total} played Nash`,
        nashPrediction: '100% Defection (Strict Dominant Strategy)',
        nashOutcomeText: 'Strict Nash Equilibrium is (Defect, Defect) yielding (1, 1). Rational self-interest drives players into this Pareto-inferior trap.',
        humanInsightText: 'In single-shot play without prior reputation, real human subjects cooperate 40%–65% of the time due to social preferences, warm glow, and altruistic norms.'
      };
    }

    if (id === 6) {
      // Repeated PD
      const cBar = bars[0]; // Sustained (C,C)
      const rBar = bars[1]; // Retaliation
      const dBar = bars[2]; // Persistent Defection
      return {
        metric1Title: 'Mutual Cooperation Rate',
        metric1Value: `${cBar?.percentage ?? 0}%`,
        metric1Sub: `${cBar?.count ?? 0} of ${total} sustained (C,C)`,
        metric2Title: 'Retaliation / Trigger Rate',
        metric2Value: `${rBar?.percentage ?? 0}%`,
        metric2Sub: `${rBar?.count ?? 0} of ${total} disciplined defection`,
        metric3Title: 'Persistent Defection',
        metric3Value: `${dBar?.percentage ?? 0}%`,
        metric3Sub: `${dBar?.count ?? 0} of ${total} pairs triggered trap`,
        nashPrediction: 'Folk Theorem Sustained Cooperation (Tit-for-Tat / Grim Trigger)',
        nashOutcomeText: 'When discount factor delta is sufficiently large, credible retaliatory threats sustain the Pareto-efficient (C,C) profile as a Subgame Perfect Nash Equilibrium.',
        humanInsightText: 'Axelrod proved responsive reciprocity (Tit-for-Tat) dominates unprovoked hostility because it is nice, retaliatory, forgiving, and transparent.'
      };
    }

    if (id === 7) {
      // Vickrey Auction
      const tBar = bars[0]; // Truthful
      const sBar = bars[1]; // Shaded
      const oBar = bars[2]; // Overbidding
      return {
        metric1Title: 'Truthful Bidding Rate (b = v)',
        metric1Value: `${tBar?.percentage ?? 0}%`,
        metric1Sub: `${tBar?.count ?? 0} of ${total} bid exact valuation`,
        metric2Title: 'Shading / Underbidding Rate',
        metric2Value: `${sBar?.percentage ?? 0}%`,
        metric2Sub: `${sBar?.count ?? 0} of ${total} forewent profit`,
        metric3Title: 'Overbidding Rate (b > v)',
        metric3Value: `${oBar?.percentage ?? 0}%`,
        metric3Sub: `${oBar?.count ?? 0} of ${total} risked winner's curse`,
        nashPrediction: 'b*(v) = v (Weakly Dominant Strategy)',
        nashOutcomeText: 'In a second-price sealed-bid auction, bidding your exact valuation weakly dominates all other bids regardless of competitor beliefs.',
        humanInsightText: 'Human subjects often carry over bid-shading heuristics from first-price auctions, or mistakenly fear that bidding high will force them to pay their own bid.'
      };
    }

    if (id === 8) {
      // First-Price Auction
      const sBar = bars[0]; // Shading
      const tBar = bars[1]; // Truthful / Zero-margin
      const oBar = bars[2]; // Overbidding
      return {
        metric1Title: 'Shaded Bidding Rate (b < v)',
        metric1Value: `${sBar?.percentage ?? 0}%`,
        metric1Sub: `${sBar?.count ?? 0} of ${total} shaded their bids`,
        metric2Title: 'Zero-Margin Bidding Rate',
        metric2Value: `${tBar?.percentage ?? 0}%`,
        metric2Sub: `${tBar?.count ?? 0} of ${total} bid full valuation`,
        metric3Title: 'Winner\'s Curse Rate',
        metric3Value: `${oBar?.percentage ?? 0}%`,
        metric3Sub: `${oBar?.count ?? 0} of ${total} paid above valuation`,
        nashPrediction: 'b*(v) = (N-1)/N * v (Bayesian Nash)',
        nashOutcomeText: 'Bidders must shade below private estimate to balance margin against probability of winning. In common value auctions, failing to shade produces Winner\'s Curse.',
        humanInsightText: 'Students frequently fall victim to Winner\'s Curse in early rounds because winning implies you held the most optimistic (overestimated) signal in the room.'
      };
    }

    if (id === 9 || id === 13) {
      // Stag Hunt
      const sBar = bars[0]; // Stag
      const hBar = bars[1]; // Hare
      return {
        metric1Title: 'Stag Coordination Rate',
        metric1Value: `${sBar?.percentage ?? 0}%`,
        metric1Sub: `${sBar?.count ?? 0} of ${total} hunted Stag`,
        metric2Title: 'Hare (Safe / Risk-Dominant)',
        metric2Value: `${hBar?.percentage ?? 0}%`,
        metric2Sub: `${hBar?.count ?? 0} of ${total} picked safe 3 pts`,
        metric3Title: 'Payoff-Dominant Alignment',
        metric3Value: `${sBar?.percentage ?? 0}%`,
        metric3Sub: `${sBar?.count ?? 0} of ${total} achieved mutual trust`,
        nashPrediction: 'Two Pure Equilibria: (Stag, Stag) & (Hare, Hare)',
        nashOutcomeText: '(Stag, Stag) is Pareto payoff-dominant (5, 5), while (Hare, Hare) is risk-dominant (3, 3) because Hare guarantees 3 points regardless of partner choice.',
        humanInsightText: 'Strategic uncertainty drives players toward Hare. Assurance mechanisms (pre-play cheap talk, mutual history) are required to coordinate on Stag.'
      };
    }

    if (id === 3 || id === 10 || id === 14) {
      // Price Competition / Bertrand
      const b0 = bars[0];
      const b1 = bars[1];
      const b2 = bars[2] || bars[1];
      return {
        metric1Title: b0?.label ? `${b0.label.split('(')[0].trim()} Rate` : 'High Price Rate',
        metric1Value: `${b0?.percentage ?? 0}%`,
        metric1Sub: `${b0?.count ?? 0} of ${total} submissions`,
        metric2Title: b1?.label ? `${b1.label.split('(')[0].trim()} Rate` : 'Undercutting Rate',
        metric2Value: `${b1?.percentage ?? 0}%`,
        metric2Sub: `${b1?.count ?? 0} of ${total} submissions`,
        metric3Title: 'Marginal Cost / Nash Play',
        metric3Value: `${(bars.find(b => b.isNash) || b2)?.percentage ?? 0}%`,
        metric3Sub: `${(bars.find(b => b.isNash) || b2)?.count ?? 0} of ${total} in equilibrium`,
        nashPrediction: 'P1 = P2 = MC (Bertrand Paradox)',
        nashOutcomeText: 'With homogeneous goods and constant marginal cost, intense price competition drives market prices down to marginal cost with only two firms.',
        humanInsightText: 'Students initially attempt to collude at monopoly prices, but unilateral temptation to undercut rapidly sparks a price war down to MC.'
      };
    }

    if (id === 11) {
      // Beauty Contest
      const l0Bar = bars[0];
      const l1Bar = bars[1];
      const l2Bar = bars[2];
      const nashBar = bars[3];
      return {
        metric1Title: 'Level-1 Guessers (~33)',
        metric1Value: `${l1Bar?.percentage ?? 0}%`,
        metric1Sub: `${l1Bar?.count ?? 0} of ${total} best-responded to L0`,
        metric2Title: 'Level-0 Guessers (~50)',
        metric2Value: `${l0Bar?.percentage ?? 0}%`,
        metric2Sub: `${l0Bar?.count ?? 0} of ${total} unreflective / naive`,
        metric3Title: 'Depth of Reasoning (L2 + Nash)',
        metric3Value: `${(l2Bar?.percentage ?? 0) + (nashBar?.percentage ?? 0)}%`,
        metric3Sub: `${(l2Bar?.count ?? 0) + (nashBar?.count ?? 0)} of ${total} stepped 2+ ahead`,
        nashPrediction: 'Unique Nash Equilibrium: Guess 0',
        nashOutcomeText: 'Iterated elimination of weakly dominated strategies eliminates any guess > 66.7, then > 44.4, unraveling to the unique fixed point of 0.',
        humanInsightText: 'Playing the pure Nash equilibrium (0) loses! Winning requires depth of reasoning: anticipating that peers will reason to Level-1 (~33) or Level-2 (~22).'
      };
    }

    if (id === 12) {
      // Public Goods
      const highBar = bars[0];
      const midBar = bars[1];
      const lowBar = bars[2];
      return {
        metric1Title: 'High Contribution Rate',
        metric1Value: `${highBar?.percentage ?? 0}%`,
        metric1Sub: `${highBar?.count ?? 0} of ${total} contributed majority`,
        metric2Title: 'Moderate / Conditional Rate',
        metric2Value: `${midBar?.percentage ?? 0}%`,
        metric2Sub: `${midBar?.count ?? 0} of ${total} contributed moderately`,
        metric3Title: 'Free-Rider Rate (Nash Dominant)',
        metric3Value: `${lowBar?.percentage ?? 0}%`,
        metric3Sub: `${lowBar?.count ?? 0} of ${total} free-rode on peers`,
        nashPrediction: 'Zero Contribution (Dominant Strategy)',
        nashOutcomeText: 'Since the marginal per-capita return (0.4x) is less than 1.0x, free-riding is a dominant strategy for self-interested rational players.',
        humanInsightText: 'Empirical contributions start high (~50%) via conditional cooperation, then decay over repeated rounds as cooperators witness free-riding and punish the pool.'
      };
    }

    if (id === 2 || id === 15) {
      // Hawk-Dove
      const hawkBar = bars[0];
      const doveBar = bars[1];
      return {
        metric1Title: 'Aggressive (Hawk) Rate',
        metric1Value: `${hawkBar?.percentage ?? 0}%`,
        metric1Sub: `${hawkBar?.count ?? 0} of ${total} played Hawk`,
        metric2Title: 'Accommodating (Dove) Rate',
        metric2Value: `${doveBar?.percentage ?? 0}%`,
        metric2Sub: `${doveBar?.count ?? 0} of ${total} shared territory`,
        metric3Title: 'Aggressive Bias vs ESS',
        metric3Value: `${hawkBar?.percentage ?? 0}%`,
        metric3Sub: 'Theoretical ESS: 50% Hawk',
        nashPrediction: 'Two Pure Asymmetric + One Mixed ESS',
        nashOutcomeText: 'Pure equilibria: (Hawk, Dove) and (Dove, Hawk). Symmetric mixed-strategy Nash equilibrium dictates Hawk with probability V/C.',
        humanInsightText: 'Players use asymmetries and commitment signals (swerving first vs throwing away the steering wheel) to establish deterrence without costly crashes.'
      };
    }

    if (id === 5 || id === 16) {
      // Ultimatum / Deterrence
      const b0 = bars[0];
      const b1 = bars[1];
      const b2 = bars[2];
      return {
        metric1Title: b0?.label ? `${b0.label.split('(')[0].trim()} Rate` : 'Fair Offer Rate',
        metric1Value: `${b0?.percentage ?? 0}%`,
        metric1Sub: `${b0?.count ?? 0} of ${total} submissions`,
        metric2Title: b1?.label ? `${b1.label.split('(')[0].trim()} Rate` : 'Skewed / Low Rate',
        metric2Value: `${b1?.percentage ?? 0}%`,
        metric2Sub: `${b1?.count ?? 0} of ${total} submissions`,
        metric3Title: b2?.label ? `${b2.label.split('(')[0].trim()} Rate` : 'Subgame Perfect Nash',
        metric3Value: `${b2?.percentage ?? 0}%`,
        metric3Sub: `${b2?.count ?? 0} of ${total} played SPNE`,
        nashPrediction: debriefDist.nashPredictionHeadline,
        nashOutcomeText: debriefDist.nashOutcomeExplanation,
        humanInsightText: debriefDist.behavioralInsight
      };
    }

    if (id === 17) {
      // Matching Pennies or Trust
      const b0 = bars[0];
      const b1 = bars[1];
      const b2 = bars[2];
      return {
        metric1Title: b0?.label ? `${b0.label.split('(')[0].trim()} Rate` : 'Heads / High Trust',
        metric1Value: `${b0?.percentage ?? 0}%`,
        metric1Sub: `${b0?.count ?? 0} of ${total} submissions`,
        metric2Title: b1?.label ? `${b1.label.split('(')[0].trim()} Rate` : 'Tails / Moderate',
        metric2Value: `${b1?.percentage ?? 0}%`,
        metric2Sub: `${b1?.count ?? 0} of ${total} submissions`,
        metric3Title: b2?.label ? `${b2.label.split('(')[0].trim()} Rate` : 'Minimax Deviation',
        metric3Value: `${b2 ? b2.percentage : Math.abs((b0?.percentage ?? 50) - 50)}%`,
        metric3Sub: b2 ? `${b2.count} of ${total} submissions` : 'Deviation from 50/50 minimax',
        nashPrediction: debriefDist.nashPredictionHeadline,
        nashOutcomeText: debriefDist.nashOutcomeExplanation,
        humanInsightText: debriefDist.behavioralInsight
      };
    }

    if (id === 18) {
      // Battle of the Sexes
      const aBar = bars[0];
      const bBar = bars[1];
      return {
        metric1Title: 'Option A (Football / Arena)',
        metric1Value: `${aBar?.percentage ?? 0}%`,
        metric1Sub: `${aBar?.count ?? 0} of ${total} chose Option A`,
        metric2Title: 'Option B (Opera / Concert)',
        metric2Value: `${bBar?.percentage ?? 0}%`,
        metric2Sub: `${bBar?.count ?? 0} of ${total} chose Option B`,
        metric3Title: 'Coordination Asymmetry',
        metric3Value: `${Math.abs((aBar?.percentage ?? 50) - (bBar?.percentage ?? 50))}% delta`,
        metric3Sub: 'Mixed strategy miscoordinates 50%',
        nashPrediction: debriefDist.nashPredictionHeadline,
        nashOutcomeText: debriefDist.nashOutcomeExplanation,
        humanInsightText: debriefDist.behavioralInsight
      };
    }

    // Default handler for all other games (e.g. Blotto, Centipede, Cournot, Hotelling, etc.)
    const b0 = bars[0];
    const b1 = bars[1];
    const b2 = bars[2] || bars.find(b => b.isNash) || bars[1];
    return {
      metric1Title: b0?.label ? `${b0.label.split('(')[0].trim()} Rate` : 'Primary Decision',
      metric1Value: `${b0?.percentage ?? 0}%`,
      metric1Sub: `${b0?.count ?? 0} of ${total} submissions`,
      metric2Title: b1?.label ? `${b1.label.split('(')[0].trim()} Rate` : 'Secondary Decision',
      metric2Value: `${b1?.percentage ?? 0}%`,
      metric2Sub: `${b1?.count ?? 0} of ${total} submissions`,
      metric3Title: b2?.label ? `${b2.label.split('(')[0].trim()} Rate` : 'Equilibrium Benchmark',
      metric3Value: `${b2?.percentage ?? 0}%`,
      metric3Sub: `${b2?.count ?? 0} of ${total} in equilibrium`,
      nashPrediction: debriefDist.nashPredictionHeadline,
      nashOutcomeText: debriefDist.nashOutcomeExplanation,
      humanInsightText: debriefDist.behavioralInsight
    };
  }, [currentWeek.id, debriefDist]);

  // ==========================================
  // PROJECTOR FULL-SCREEN PRESENTATION MODE
  // ==========================================
  if (showProjectorMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0F17] text-slate-100 overflow-y-auto font-sans p-6 sm:p-8 lg:p-12 flex flex-col justify-between space-y-6 select-none">
        {/* Projector Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 mb-1 font-mono">
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-[11px] sm:text-xs">
                ● Live Classroom Projector
              </span>
              <span>·</span>
              <span>Game Theory Lab</span>
              <span>·</span>
              <span className="text-slate-300 font-bold">Room: {roomCode}</span>
              <span>·</span>
              <span className="text-sky-300 font-bold">{debriefDist.totalSubmissions} Decisions Tracked</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{currentWeek.icon}</span>
              <span>{currentWeek.title}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Round navigation */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 font-mono text-sm sm:text-base">
              <button
                onClick={handlePrevRound}
                disabled={currentRound <= 1}
                className="px-3 py-1.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer font-bold"
                title="Previous Round"
              >
                ◀
              </button>
              <span className="px-3 font-bold text-white tabular-nums">
                Round {currentRound} / {totalRounds}
              </span>
              <button
                onClick={handleNextRound}
                className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer font-bold"
                title="Next Round"
              >
                ▶
              </button>
            </div>

            <button
              onClick={handleGenerateFreshCohortTrial}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>🎲</span>
              <span>Fresh Trial</span>
            </button>

            {/* Obvious prominent exit button */}
            <button
              onClick={() => setShowProjectorMode(false)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-black bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-400 shadow-2xl transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              title="Exit Projector View (or press Escape)"
            >
              <span>✕</span>
              <span>Exit Projector View</span>
            </button>
          </div>
        </div>

        {/* Projector Body: Only Chart & Equilibrium Gap Summary */}
        {!debriefDist.hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-900/60 border-2 border-dashed border-slate-700/80 rounded-3xl space-y-4 my-8">
            <div className="text-6xl mb-2">📊</div>
            <h2 className="text-3xl font-black text-white">No Student Decisions Recorded Yet</h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Waiting for students in room <strong className="font-mono text-blue-400">{roomCode}</strong> to lock their Round {currentRound} decisions, or click <span className="text-purple-300 font-bold">&ldquo;🎲 Fresh Trial&rdquo;</span> to simulate a live cohort.
            </p>
            <button
              onClick={handleGenerateFreshCohortTrial}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-base font-bold rounded-2xl transition-all shadow-xl cursor-pointer mt-4"
            >
              <span>🎲</span>
              <span>Simulate Active Student Cohort</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            {/* One-Line Equilibrium Gap Summary at very large text */}
            <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-blue-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-sky-400 font-mono mb-2">
                <span className="text-xl">⚡</span>
                <span>Equilibrium Gap Summary</span>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-amber-300 leading-tight tracking-tight">
                &ldquo;{debriefDist.equilibriumGap}&rdquo;
              </p>
            </div>

            {/* Main Live Chart & Nash Benchmark Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-1">
              {/* Left 7 cols: Choice Distribution Bars */}
              <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Classroom Choice Distribution
                      </h2>
                      <p className="text-sm text-slate-400 mt-0.5">
                        Empirical decisions from {debriefDist.totalSubmissions} participants in Round {currentRound}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold px-3 py-1 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/40">
                      Live Telemetry
                    </span>
                  </div>

                  {/* Distribution Bars */}
                  <div className="space-y-6">
                    {debriefDist.bars.map((bar) => (
                      <div key={bar.id} className="space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg sm:text-xl font-bold text-white">
                              {bar.label}
                            </span>
                            {bar.isNash && (
                              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
                                <span>⭐</span>
                                <span>Nash Eq</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-mono font-black text-sky-300 tabular-nums">
                              {bar.percentage}%
                            </span>
                            <span className="text-sm sm:text-base font-mono text-slate-400 font-semibold">
                              ({bar.count} students)
                            </span>
                          </div>
                        </div>

                        {bar.sublabel && (
                          <p className="text-xs sm:text-sm text-slate-400 font-medium">
                            {bar.sublabel}
                          </p>
                        )}

                        {/* Bar Track */}
                        <div className="w-full bg-slate-950 rounded-2xl h-8 sm:h-10 p-1 border border-slate-800/80 overflow-hidden flex items-center">
                          <div
                            className={`${bar.color} h-full rounded-xl transition-all duration-700 flex items-center justify-end pr-3`}
                            style={{ width: `${Math.max(6, bar.percentage)}%` }}
                          >
                            <span className="text-xs sm:text-sm font-mono font-bold text-white drop-shadow">
                              {bar.percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-400">
                          <span className="text-slate-500">Student Share: {bar.count} of {debriefDist.totalSubmissions}</span>
                          <span className={bar.isNash ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                            Theoretical Benchmark: {bar.nashPredictionText}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Theoretical Nash Equilibrium Prediction */}
              <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-emerald-400 font-mono mb-1">
                      <span>⚖️</span>
                      <span>Theoretical Prediction Benchmark</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Nash Equilibrium Model
                    </h3>
                  </div>

                  <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block font-mono">
                      Textbook Equilibrium Profile
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-emerald-200 leading-snug">
                      {debriefDist.nashPredictionHeadline}
                    </p>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                      {debriefDist.nashOutcomeExplanation}
                    </p>
                  </div>

                  <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-blue-400 block font-mono">
                      Behavioral Reality & Human Deviations
                    </span>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {debriefDist.behavioralInsight}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-400 flex items-center justify-between">
                  <span>Projector View · Large Screen Mode</span>
                  <span className="font-mono text-slate-500">Press Esc to exit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projector Footer Strip */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Game Theory Lab · Live Debrief Mode</span>
          <span className="font-mono text-slate-400">Trial #{trialSeed} · Room PIN: {roomCode}</span>
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
                {debriefDist.totalSubmissions} / {totalEnrolled}
              </div>
              <p className="text-[11px] text-slate-400">100% of online participants in Round {currentRound}</p>
            </div>
          </div>

          {/* One-Line Equilibrium Gap Summary Banner */}
          {debriefDist.hasData && (
            <div className="p-4 bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border border-blue-500/50 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <span className="text-2xl shrink-0">⚡</span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 font-mono block">
                  Equilibrium Gap Summary
                </span>
                <p className="text-base sm:text-lg font-black text-amber-300 leading-snug">
                  &ldquo;{debriefDist.equilibriumGap}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Main Grid: Distribution Chart + Side-by-Side Theory Benchmark */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Chart: Choice Distribution */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>📊</span>
                    <span>Distribution of Student Choices</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Empirical classroom selections in {currentWeek.shortTitle || currentWeek.title} (Round {currentRound})
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                    {debriefDist.totalSubmissions} Decisions
                  </span>
                  <button
                    onClick={() => setShowProjectorMode(true)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
                    title="Launch full-screen projector view for classroom debrief"
                  >
                    <span>📺</span>
                    <span>Projector</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Game-Specific Choice Distribution Bars or Friendly Empty State */}
              {!debriefDist.hasData ? (
                <div className="text-center py-10 px-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
                  <div className="text-4xl">📊</div>
                  <h4 className="text-base font-bold text-white">No Student Decisions Recorded Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Waiting for students in room <strong className="font-mono text-blue-400">{roomCode}</strong> to lock their Round {currentRound} decisions, or click below to simulate a cohort.
                  </p>
                  <button
                    onClick={handleGenerateFreshCohortTrial}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer mt-1"
                  >
                    <span>🎲</span>
                    <span>Simulate Active Student Cohort</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {debriefDist.bars.map((bar) => (
                    <div key={bar.id} className="space-y-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-1.5 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-200 font-bold">{bar.label}</span>
                          {bar.isNash && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                              ⭐ Nash
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono tabular-nums text-sky-300 font-black text-sm">
                            {bar.percentage}%
                          </span>
                          <span className="font-mono tabular-nums text-slate-400 text-xs">
                            ({bar.count} students)
                          </span>
                        </div>
                      </div>

                      {bar.sublabel && (
                        <p className="text-[11px] text-slate-400">
                          {bar.sublabel}
                        </p>
                      )}

                      {/* Bar Track */}
                      <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800/80 overflow-hidden flex items-center">
                        <div
                          className={`${bar.color} h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
                          style={{ width: `${Math.max(6, bar.percentage)}%` }}
                        >
                          <span className="text-[10px] font-mono font-bold text-white drop-shadow">
                            {bar.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Share: {bar.count} / {debriefDist.totalSubmissions}</span>
                        <span className={bar.isNash ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                          Benchmark: {bar.nashPredictionText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theory Benchmark Comparison Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>⚖️</span>
                  <span>Nash Equilibrium vs. Empirical Play</span>
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Game Theory
                </span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block font-mono">
                  Textbook Game-Theoretic Prediction:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  {debriefDist.nashPredictionHeadline}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/60 mt-1">
                  {debriefDist.nashOutcomeExplanation}
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-400 block font-mono">
                  Observed Human Classroom Play:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {debriefDist.behavioralInsight}
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
