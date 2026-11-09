import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '../types';
import {
  RoundHistoryEntry,
  getBotsForGame,
  getBotStrategySummary
} from '../services/botEngine';
import { TheoryDebrief, DebriefData } from './TheoryDebrief';
import { AnnotateGlossaryText, formatUnit, pluralWord } from './GlossaryTerm';
import { drawValuation } from '../utils/auctionEngine';
import { safeStorage } from '../utils/safeStorage';
import { getQuizForGame } from '../data/soloLabQuizzes';
import { InteractiveMatrixVisualizer } from './InteractiveMatrixVisualizer';
import { SequentialVisualizer } from './SequentialVisualizer';
import { getGameStory, getGameQuickChips } from '../data/gameStories';
import { computeWhatYouCouldHaveGot } from '../utils/counterfactualEngine';
import { getGameTakeawaySentence } from '../data/curriculumOrder';

export interface SoloLabRoundHistoryEntry extends RoundHistoryEntry {
  botRationale: string;
  botThought?: string;
}

interface SoloLabViewProps {
  allGames: GameConfig[];
  onOpenWhatIfSandbox: (gameId: number) => void;
  onSwitchToLiveClass: () => void;
  onModuleChange?: (
    moduleId: number,
    label: string,
    gameIndex?: number,
    totalGames?: number,
    completedGamesCount?: number
  ) => void;
  studentId?: string;
}

export interface SoloLabTier {
  tierNumber: number;
  tierTitle: string;
  category: string;
  icon: string;
  gameIds: number[];
}

export const SOLOLAB_TIERS: SoloLabTier[] = [
  {
    tierNumber: 1,
    tierTitle: "Tier 1: Foundations & Dominance",
    category: "Foundations & Dominance",
    icon: "🏛️",
    gameIds: [1, 3]
  },
  {
    tierNumber: 2,
    tierTitle: "Tier 2: Coordination & Conflict",
    category: "Coordination & Conflict",
    icon: "🤝",
    gameIds: [13, 18, 15]
  },
  {
    tierNumber: 3,
    tierTitle: "Tier 3: Zero-Sum & Mixed Strategies",
    category: "Zero-Sum & Mixed Strategies",
    icon: "🎲",
    gameIds: [17, 4, 23]
  },
  {
    tierNumber: 4,
    tierTitle: "Tier 4: Extensive Form & Backward Induction",
    category: "Extensive Form & Backward Induction",
    icon: "♟️",
    gameIds: [2, 5, 20]
  },
  {
    tierNumber: 5,
    tierTitle: "Tier 5: Repeated Games & Reciprocity",
    category: "Repeated Games & Reciprocity",
    icon: "🔁",
    gameIds: [6, 19, 12, 27]
  },
  {
    tierNumber: 6,
    tierTitle: "Tier 6: Bargaining & Behavioral Fairness",
    category: "Bargaining & Behavioral Fairness",
    icon: "🍰",
    gameIds: [16, 9, 26]
  },
  {
    tierNumber: 7,
    tierTitle: "Tier 7: Industrial Organization & Markets",
    category: "Industrial Organization & Markets",
    icon: "🏭",
    gameIds: [14, 21, 22]
  },
  {
    tierNumber: 8,
    tierTitle: "Tier 8: Information, Levels & Auctions",
    category: "Information, Levels & Auctions",
    icon: "⚖️",
    gameIds: [11, 10, 7, 8, 24, 25, 28]
  }
];

// Signed payoff formatter that ensures negative points display as '-10 pts' instead of '+-10 pts'
export const formatSignedPayoff = (val: number, isDollar: boolean = false): string => {
  if (isDollar) {
    return val >= 0 ? `+$${Number(val.toFixed(2))}` : `-$${Number(Math.abs(val).toFixed(2))}`;
  }
  if (val > 0) return `+${val} ${pluralWord(val, 'pt', 'pts')}`;
  if (val < 0) return `-${Math.abs(val)} ${pluralWord(val, 'pt', 'pts')}`;
  return `0 pts`;
};

export const formatSignedPayoffShort = (val: number, isDollar: boolean = false): string => {
  if (isDollar) {
    return val >= 0 ? `+$${Number(val.toFixed(2))}` : `-$${Number(Math.abs(val).toFixed(2))}`;
  }
  if (val > 0) return `+${val}`;
  if (val < 0) return `-${Math.abs(val)}`;
  return `0`;
};

export const SoloLabView: React.FC<SoloLabViewProps> = ({
  allGames: _allGames,
  onOpenWhatIfSandbox,
  onSwitchToLiveClass: _onSwitchToLiveClass,
  onModuleChange,
  studentId
}) => {
  // Solo Lab Supported Educational Modules (Organized into an Authoritative 8-Tier Curriculum: 24 Games Total)
  const availableModules: Array<{
    id: number;
    title: string;
    shortTitle: string;
    icon: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
  }> = [
    // TIER 1: Foundations & Dominance
    {
      id: 1,
      title: "One-Shot Prisoner's Dilemma",
      shortTitle: "One-Shot Dilemma",
      icon: "🤝",
      category: "Foundations & Dominance",
      difficulty: 'Easy',
      description: "Experience the fundamental conflict between individual temptation and collective welfare in a single simultaneous decision."
    },
    {
      id: 3,
      title: "Simultaneous Price Competition",
      shortTitle: "Price Competition",
      icon: "⚡",
      category: "Foundations & Dominance",
      difficulty: 'Easy',
      description: "Choose High Price or Low Price. Witness how undercutting temptation drives both firms to a low-profit Nash equilibrium."
    },

    // TIER 2: Coordination & Conflict
    {
      id: 13,
      title: "Stag Hunt Coordination",
      shortTitle: "Stag Hunt",
      icon: "🦌",
      category: "Coordination & Conflict",
      difficulty: 'Easy',
      description: "Navigate multiple Nash equilibria: will you risk hunting the +10 Stag, or retreat to the safe +4 Hare?"
    },
    {
      id: 18,
      title: "Battle of the Sexes",
      shortTitle: "Battle of the Sexes",
      icon: "🎭",
      category: "Coordination & Conflict",
      difficulty: 'Easy',
      description: "Coordinate on Opera vs Football when preferences clash. Will you concede, insist on your favorite, or alternate turns?"
    },
    {
      id: 15,
      title: "Hawk-Dove Brinkmanship",
      shortTitle: "Hawk-Dove",
      icon: "🦅",
      category: "Coordination & Conflict",
      difficulty: 'Easy',
      description: "Navigate dangerous anti-coordination: will you play aggressive Hawk or peaceful Dove when mutual aggression causes catastrophic collision?"
    },

    // TIER 3: Mixed Strategies & Zero-Sum
    {
      id: 17,
      title: "Matching Pennies (Zero-Sum)",
      shortTitle: "Matching Pennies",
      icon: "🪙",
      category: "Zero-Sum & Mixed Strategies",
      difficulty: 'Medium',
      description: "Experience pure zero-sum conflict with zero pure-strategy Nash equilibria. Outguess the bot or randomize with p = 0.5!"
    },
    {
      id: 4,
      title: "Promotion Timing (3x3 Mixed)",
      shortTitle: "Promotion Timing",
      icon: "📅",
      category: "Zero-Sum & Mixed Strategies",
      difficulty: 'Medium',
      description: "Launch promotions on Monday, Wednesday, or Friday. Clashing yields 0; unexploitability requires 1/3 randomization."
    },
    {
      id: 23,
      title: "Colonel Blotto Resource War",
      shortTitle: "Colonel Blotto",
      icon: "⚔️",
      category: "Zero-Sum & Mixed Strategies",
      difficulty: 'Hard',
      description: "Deploy 100 battalions across 3 fronts (A, B, C). Win 2 of 3 fronts to conquer territory; outfox your rival's troop concentration!"
    },

    // TIER 4: Extensive Form & Backward Induction
    {
      id: 2,
      title: "Launch-or-Wait (Sequential Entry)",
      shortTitle: "Sequential Entry",
      icon: "🚀",
      category: "Extensive Form & Backward Induction",
      difficulty: 'Easy',
      description: "Experience first-mover commitment in a sequential game tree: will the follower enter or stay out?"
    },
    {
      id: 5,
      title: "Entry Deterrence & Commitment",
      shortTitle: "Entry Deterrence",
      icon: "🏰",
      category: "Extensive Form & Backward Induction",
      difficulty: 'Medium',
      description: "Sunk costs vs empty threats: commit irreversible capital to credibly deter rival entry and maintain monopoly profits."
    },
    {
      id: 20,
      title: "Centipede Game (Backward Induction)",
      shortTitle: "Centipede Game",
      icon: "🐛",
      category: "Extensive Form & Backward Induction",
      difficulty: 'Hard',
      description: "Take turns with the bot. Take ends the game for the points shown; Pass lets the bot play next."
    },

    // TIER 5: Repeated Games & Trust
    {
      id: 6,
      title: "Repeated Prisoner's Dilemma",
      shortTitle: "Repeated Dilemma",
      icon: "🔁",
      category: "Repeated Games & Reciprocity",
      difficulty: 'Medium',
      description: "Test reciprocal strategies across repeated rounds. Can Tit-for-Tat sustain cooperation against opportunistic defectors?"
    },
    {
      id: 19,
      title: "The Trust Game (Investment)",
      shortTitle: "The Trust Game",
      icon: "🏦",
      category: "Repeated Games & Reciprocity",
      difficulty: 'Medium',
      description: "Invest up to 10 points to triple your capital (3x). Will the trustee reciprocate with a fair return, or defect and keep everything?"
    },
    {
      id: 12,
      title: "Tragedy of the Commons & Coastal Fishery",
      shortTitle: "Commons & Fishery",
      icon: "🐟",
      category: "Repeated Games & Reciprocity",
      difficulty: 'Medium',
      description: "Manage common pool resources: conserve breeding stock to let marine life regenerate at 1.6x, or overharvest and collapse the fishery."
    },
    {
      id: 27,
      title: "Renewable Ocean Fishery (Ostrom Commons)",
      shortTitle: "Renewable Fishery",
      icon: "🌊",
      category: "Repeated Games & Reciprocity",
      difficulty: 'Hard',
      description: "Balance fleet harvest effort with biological regeneration. Overharvesting triggers irreversible collapse; quota coordination maximizes sustainable yield."
    },

    // TIER 6: Behavioral Bargaining & Fairness
    {
      id: 16,
      title: "Ultimatum Bargaining & Fairness",
      shortTitle: "Ultimatum Bargaining",
      icon: "🍰",
      category: "Bargaining & Behavioral Fairness",
      difficulty: 'Medium',
      description: "Propose a split of $10 to a responder bot who can accept or reject. If rejected, both get $0!"
    },
    {
      id: 9,
      title: "Split-the-Pie (Outside Options)",
      shortTitle: "Split the Pie",
      icon: "🥧",
      category: "Bargaining & Behavioral Fairness",
      difficulty: 'Medium',
      description: "Simultaneously demand your share of 10 points. If total demands exceed 10, deal collapses to outside options (1 pt)!"
    },
    {
      id: 26,
      title: "Traveler's Dilemma (Basu Paradox)",
      shortTitle: "Traveler's Dilemma",
      icon: "🧳",
      category: "Bargaining & Behavioral Fairness",
      difficulty: 'Medium',
      description: "Claim $2 to $100 for lost luggage with ±$2 bonus/penalty. Backward induction collapses to $2, yet humans earn ~50x more near $100!"
    },

    // TIER 7: Industrial Organization & Market Competition
    {
      id: 14,
      title: "Bertrand Duopoly Competition",
      shortTitle: "Bertrand Duopoly",
      icon: "🏷️",
      category: "Industrial Organization & Markets",
      difficulty: 'Hard',
      description: "Witness the Bertrand Paradox: how price competition between two identical sellers drives market price down to cost."
    },
    {
      id: 21,
      title: "Cournot Duopoly Competition",
      shortTitle: "Cournot Duopoly",
      icon: "🏭",
      category: "Industrial Organization & Markets",
      difficulty: 'Hard',
      description: "Simultaneously choose production output (q). Higher industry supply pushes price down; balance volume vs profit margins!"
    },
    {
      id: 22,
      title: "Hotelling's Spatial Competition",
      shortTitle: "Hotelling Beach",
      icon: "🏖️",
      category: "Industrial Organization & Markets",
      difficulty: 'Medium',
      description: "Place your ice cream stand along a 0–100 boardwalk. Minimum differentiation pulls both sellers to the center (location 50)!"
    },

    // TIER 8: Information Economics, Cognitive Levels & Auctions
    {
      id: 11,
      title: "Keynesian Beauty Contest (2/3 of Average)",
      shortTitle: "Beauty Contest",
      icon: "💭",
      category: "Information, Levels & Auctions",
      difficulty: 'Hard',
      description: "Guess 2/3 of the average. Outsmart competitors by anticipating whether they think 0, 1, 2, or infinite steps ahead."
    },
    {
      id: 10,
      title: "Costly Signaling & Adverse Selection",
      shortTitle: "Costly Signaling",
      icon: "📜",
      category: "Information, Levels & Auctions",
      difficulty: 'Hard',
      description: "Overcome Akerlof's lemon market trap using Spence's costly signaling to separate high quality from low quality."
    },
    {
      id: 7,
      title: "Second-Price Vickrey Auction",
      shortTitle: "Vickrey Auction",
      icon: "⚖️",
      category: "Information, Levels & Auctions",
      difficulty: 'Hard',
      description: "Discover why truthful bidding is a weakly dominant strategy in a second-price sealed-bid auction."
    },
    {
      id: 8,
      title: "First-Price Sealed-Bid Auction",
      shortTitle: "First-Price Auction",
      icon: "🎯",
      category: "Information, Levels & Auctions",
      difficulty: 'Hard',
      description: "Balance win probability against profit margins. Shade your bid below valuation, but beware the Winner's Curse!"
    },
    {
      id: 24,
      title: "Common-Value Oil Lease Auction",
      shortTitle: "Common-Value Auction",
      icon: "🛢️",
      category: "Information, Levels & Auctions",
      difficulty: 'Hard',
      description: "Bid on an unknown common oil reservoir with noisy seismic estimates. Beware the Winner's Curse: winning often means you overpaid!"
    },
    {
      id: 25,
      title: "The Escalating Dollar Auction",
      shortTitle: "Dollar Auction",
      icon: "💸",
      category: "Information, Levels & Auctions",
      difficulty: 'Hard',
      description: "Bid on a $1.00 bill where the 2nd-place bidder also forfeits their bid! Watch how sunk costs drive rational players into catastrophic escalation traps."
    },
    {
      id: 28,
      title: "Market for Lemons (Akerlof Adverse Selection)",
      shortTitle: "Lemons Market",
      icon: "🍋",
      category: "Information, Levels & Auctions",
      difficulty: 'Hard',
      description: "Negotiate purchase prices for cars with unobservable quality. Low offers drive high-quality peaches away, causing the entire market to unravel."
    }
  ];

  const effectiveStudentId = studentId || (() => {
    try {
      const rawInfo = safeStorage.getItem('gameTheoryStudentInfo');
      if (rawInfo) {
        const parsed = JSON.parse(rawInfo);
        if (parsed.id) return parsed.id;
      }
      const rawAuth = safeStorage.getItem('gameTheoryAuthSession');
      if (rawAuth) {
        const parsed = JSON.parse(rawAuth);
        if (parsed.id) return parsed.id;
      }
    } catch {
      // fallback
    }
    return 'default_student';
  })();

  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);

  // Mastery Streak: consecutive games where student reached the best response (stored per student)
  const [masteryStreak, setMasteryStreak] = useState<number>(() => {
    try {
      const studentSaved = safeStorage.getItem(`sololab_streak_${effectiveStudentId}`);
      if (studentSaved !== null) return parseInt(studentSaved, 10) || 0;
      const legacy = safeStorage.getItem('sololab_mastery_streak');
      if (legacy !== null) return parseInt(legacy, 10) || 0;
    } catch {
      // ignore
    }
    return 0;
  });

  const saveMasteryStreak = (streak: number) => {
    setMasteryStreak(streak);
    try {
      safeStorage.setItem(`sololab_streak_${effectiveStudentId}`, String(streak));
      safeStorage.setItem('sololab_mastery_streak', String(streak));
    } catch {
      // ignore
    }
  };

  const [completedGameIds, setCompletedGameIds] = useState<number[]>(() => {
    try {
      const studentSaved = safeStorage.getItem(`sololab_completed_${effectiveStudentId}`);
      if (studentSaved) return JSON.parse(studentSaved);
      const saved = safeStorage.getItem('sololab_completed_games');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markGameCompleted = (gameId: number) => {
    setCompletedGameIds(prev => {
      if (!prev.includes(gameId)) {
        const next = [...prev, gameId];
        try {
          safeStorage.setItem(`sololab_completed_${effectiveStudentId}`, JSON.stringify(next));
          safeStorage.setItem('sololab_completed_games', JSON.stringify(next));
        } catch {
          // ignore storage error
        }
        return next;
      }
      return prev;
    });
  };

  // Sync state if student changes
  useEffect(() => {
    try {
      const studentSavedStreak = safeStorage.getItem(`sololab_streak_${effectiveStudentId}`);
      if (studentSavedStreak !== null) {
        setMasteryStreak(parseInt(studentSavedStreak, 10) || 0);
      }
      const studentSavedCompleted = safeStorage.getItem(`sololab_completed_${effectiveStudentId}`);
      if (studentSavedCompleted) {
        setCompletedGameIds(JSON.parse(studentSavedCompleted));
      }
    } catch {
      // ignore
    }
  }, [effectiveStudentId]);

  // One-line friendly completion toast & banner state
  const [gameCompletionToast, setGameCompletionToast] = useState<{
    visible: boolean;
    message: string;
    isBestResponse: boolean;
    streak: number;
  }>({
    visible: false,
    message: '',
    isBestResponse: false,
    streak: 0
  });

  // Auto-dismiss floating toast after 6 seconds
  useEffect(() => {
    if (!gameCompletionToast.visible) return;
    const timer = setTimeout(() => {
      setGameCompletionToast(prev => ({ ...prev, visible: false }));
    }, 6000);
    return () => clearTimeout(timer);
  }, [gameCompletionToast.visible, gameCompletionToast.message]);

  // Game picker view mode: 'tiers' shows full 8-Tier Curriculum sections; 'carousel' shows horizontal cards
  const [pickerViewMode, setPickerViewMode] = useState<'tiers' | 'carousel'>('tiers');

  // Tier badge calculation helper
  const getTierBadge = (tier: SoloLabTier, tierIdx: number) => {
    const totalCount = tier.gameIds.length;
    const playedCount = tier.gameIds.filter(id => completedGameIds.includes(id)).length;

    if (totalCount > 0 && playedCount === totalCount) {
      return {
        status: 'completed' as const,
        badgeLabel: '✓ Done',
        badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-600/80 shadow-xs whitespace-nowrap',
        playedCount,
        totalCount
      };
    }

    if (playedCount > 0) {
      return {
        status: 'in_progress' as const,
        badgeLabel: `${playedCount}/${totalCount} played`,
        badgeClass: 'bg-blue-950/90 text-blue-300 border-blue-600/80 shadow-xs whitespace-nowrap',
        playedCount,
        totalCount
      };
    }

    const prevTier = tierIdx > 0 ? SOLOLAB_TIERS[tierIdx - 1] : null;
    const prevPlayed = prevTier ? prevTier.gameIds.filter(id => completedGameIds.includes(id)).length : 0;
    const isUnlocked = tierIdx === 0 || prevPlayed > 0;

    if (isUnlocked) {
      return {
        status: 'in_progress' as const,
        badgeLabel: `0/${totalCount} played`,
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-xs whitespace-nowrap',
        playedCount,
        totalCount
      };
    }

    return {
      status: 'locked' as const,
      badgeLabel: '🔒 Locked',
      badgeClass: 'bg-slate-900/90 text-slate-400 border-slate-800 shadow-xs whitespace-nowrap',
      playedCount,
      totalCount
    };
  };

  const activeModuleIndex = availableModules.findIndex(m => m.id === selectedModuleId);
  const currentModuleIndex = activeModuleIndex >= 0 ? activeModuleIndex + 1 : 1;
  const totalModulesCount = availableModules.length;
  const activeModule = availableModules[activeModuleIndex] || availableModules[0];

  const nextModuleIndex = (currentModuleIndex % totalModulesCount) + 1;
  const nextModule = availableModules[nextModuleIndex - 1];

  // Quick Check Quiz Persistent Best Scores & Active State
  const [bestQuizScores, setBestQuizScores] = useState<Record<number, number>>(() => {
    try {
      const saved = safeStorage.getItem('sololab_best_quiz_scores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          const normalized: Record<number, number> = {};
          Object.entries(parsed).forEach(([k, v]) => {
            const numKey = Number(k);
            if (!isNaN(numKey) && typeof v === 'number') {
              normalized[numKey] = v;
            }
          });
          return normalized;
        }
      }
      return {};
    } catch {
      return {};
    }
  });

  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  useEffect(() => {
    setQuizQuestionIndex(0);
    setQuizAnswers([null, null, null]);
    setIsQuizCompleted(false);
  }, [selectedModuleId]);

  const currentQuizQuestions = getQuizForGame(selectedModuleId);
  const currentQuizQ = currentQuizQuestions[quizQuestionIndex] || currentQuizQuestions[0];
  const quizSelectedOption = quizAnswers[quizQuestionIndex] ?? null;

  // Running score: answered count and correct count updated immediately after each answer
  const quizAnsweredCount = quizAnswers.filter(ans => ans !== null).length;
  const quizCorrectCount = quizAnswers.reduce<number>((acc, ans, idx) => {
    if (ans !== null && currentQuizQuestions[idx] && ans === currentQuizQuestions[idx].correctIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);
  const quizScore = quizCorrectCount;

  const saveBestQuizScore = (score: number, moduleId: number) => {
    setBestQuizScores(prev => {
      const currentBest = prev[moduleId] ?? -1;
      if (score > currentBest || prev[moduleId] === undefined) {
        const updated = { ...prev, [moduleId]: Math.max(score, prev[moduleId] ?? 0) };
        try {
          safeStorage.setItem('sololab_best_quiz_scores', JSON.stringify(updated));
        } catch {
          // ignore storage error
        }
        return updated;
      }
      return prev;
    });
  };

  const handleSelectQuizOption = (optIdx: number) => {
    if (quizAnswers[quizQuestionIndex] !== null) return;
    const nextAnswers = [...quizAnswers];
    nextAnswers[quizQuestionIndex] = optIdx;
    setQuizAnswers(nextAnswers);

    // If this choice completes all questions in the quiz, persist best score right away
    const allAnswered = nextAnswers.filter(a => a !== null).length === currentQuizQuestions.length;
    if (allAnswered) {
      const finalScore = nextAnswers.reduce<number>((acc, ans, idx) => {
        if (ans !== null && currentQuizQuestions[idx] && ans === currentQuizQuestions[idx].correctIndex) {
          return acc + 1;
        }
        return acc;
      }, 0);
      saveBestQuizScore(finalScore, selectedModuleId);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizQuestionIndex < currentQuizQuestions.length - 1) {
      setQuizQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizCompleted(true);
      const finalScore = quizAnswers.reduce<number>((acc, ans, idx) => {
        if (ans !== null && currentQuizQuestions[idx] && ans === currentQuizQuestions[idx].correctIndex) {
          return acc + 1;
        }
        return acc;
      }, 0);
      saveBestQuizScore(finalScore, selectedModuleId);
    }
  };

  const handleRetryQuiz = () => {
    setQuizQuestionIndex(0);
    setQuizAnswers([null, null, null]);
    setIsQuizCompleted(false);
  };

  const activeGameBots = getBotsForGame(selectedModuleId);
  const [selectedBotId, setSelectedBotId] = useState<string>(activeGameBots[0].id);

  useEffect(() => {
    const bots = getBotsForGame(selectedModuleId);
    setSelectedBotId(bots[0].id);
  }, [selectedModuleId]);

  const activeBot = activeGameBots.find(b => b.id === selectedBotId) || activeGameBots[0];

  // Only Repeated Prisoner's Dilemma (Game 6) has 5 rounds; all other 12 games are single-round matches
  const totalRounds = selectedModuleId === 6 ? 5 : 1;
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [history, setHistory] = useState<SoloLabRoundHistoryEntry[]>([]);
  const [isRoundResolved, setIsRoundResolved] = useState<boolean>(false);
  const [lastRoundResult, setLastRoundResult] = useState<SoloLabRoundHistoryEntry | null>(null);
  const [isExperimentFinished, setIsExperimentFinished] = useState<boolean>(false);

  // Phone-First Horizontal Step Flow State: 1 = Rules, 2 = Choice, 3 = Result, 4 = Go Deeper
  const [activeStep, setActiveStep] = useState<number>(1);
  // Briefing mode: 'simple' for fast 5-second rules vs 'expert' for full pre-match strategy intelligence
  const [briefingMode, setBriefingMode] = useState<'simple' | 'expert'>(() => {
    try {
      const saved = safeStorage.getItem('gameTheoryBriefingMode');
      if (saved === 'simple' || saved === 'expert') return saved;
    } catch {
      // fallback
    }
    return 'simple';
  });

  const toggleBriefingMode = (mode: 'simple' | 'expert') => {
    setBriefingMode(mode);
    try {
      safeStorage.setItem('gameTheoryBriefingMode', mode);
    } catch {
      // ignore
    }
  };

  // Simple Mode compact bot picker dropdown state
  const [isSimpleBotPickerOpen, setIsSimpleBotPickerOpen] = useState<boolean>(false);
  const simpleBotPickerRef = useRef<HTMLDivElement>(null);

  // Simple Mode counterpart bot strategy intel popover state
  const [isBotIntelOpen, setIsBotIntelOpen] = useState<boolean>(false);
  const botIntelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (simpleBotPickerRef.current && !simpleBotPickerRef.current.contains(event.target as Node)) {
        setIsSimpleBotPickerOpen(false);
      }
      if (botIntelRef.current && !botIntelRef.current.contains(event.target as Node)) {
        setIsBotIntelOpen(false);
      }
    };
    if (isSimpleBotPickerOpen || isBotIntelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSimpleBotPickerOpen, isBotIntelOpen]);

  // Collapsible 'Background and full rules' state for Step 1 (collapsed by default)
  const [isFullRulesExpanded, setIsFullRulesExpanded] = useState<boolean>(false);

  // Bot animated thought bubble & thinking anticipation state for choice/result flow
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [currentBotThought, setCurrentBotThought] = useState<string>('');

  // Compact Game Picker toggle (default false so game selection collapses once selected)
  const [isGamePickerExpanded, setIsGamePickerExpanded] = useState<boolean>(false);

  useEffect(() => {
    setIsSimpleBotPickerOpen(false);
    setIsBotIntelOpen(false);
    setIsFullRulesExpanded(false);
  }, [selectedModuleId]);

  // Real measured height of the mobile sticky action dock (for dynamic Step 2 bottom padding)
  const [mobileDockHeight, setMobileDockHeight] = useState<number>(72);
  const mobileDockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mobileDockRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
        setMobileDockHeight(Math.round(rect.height));
      }
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          if (h > 0) {
            setMobileDockHeight(Math.round(h));
          }
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, [activeStep, isRoundResolved, selectedModuleId, isGamePickerExpanded]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToStep = (step: number) => {
    setActiveStep(step);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: (step - 1) * width,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const calculatedStep = Math.min(5, Math.max(1, Math.round(scrollLeft / clientWidth) + 1));
      if (calculatedStep !== activeStep) {
        setActiveStep(calculatedStep);
      }
    }
  };

  // Keep scroll aligned on window resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        const width = scrollContainerRef.current.clientWidth;
        scrollContainerRef.current.scrollLeft = (activeStep - 1) * width;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeStep]);

  // Game Selection Carousel State & Navigation
  const gameCarouselRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const isInitialMountRef = useRef<boolean>(true);

  // Compute active card index from scroll position: scrollLeft / (card width + gap)
  const computeActiveIndexFromScroll = (): number => {
    if (!gameCarouselRef.current) return 0;
    const container = gameCarouselRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return 0;

    const firstCard = children[0];
    let cardStep = firstCard.offsetWidth;
    if (children.length > 1) {
      cardStep = children[1].offsetLeft - children[0].offsetLeft;
    }
    if (cardStep <= 0) {
      cardStep = container.clientWidth * 0.85 + 16;
    }

    const rawIndex = Math.round(container.scrollLeft / cardStep);
    return Math.min(children.length - 1, Math.max(0, rawIndex));
  };

  const handleCarouselScroll = () => {
    if (!gameCarouselRef.current) return;
    const idx = computeActiveIndexFromScroll();
    setActiveCardIndex(idx);
  };

  // Scroll to a specific card index (used by dots and returning to last-played game)
  const scrollToCard = (targetIndex: number, smooth: boolean = true) => {
    if (!gameCarouselRef.current) return;
    const container = gameCarouselRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    const clampedIndex = Math.max(0, Math.min(availableModules.length - 1, targetIndex));
    if (children[clampedIndex]) {
      const card = children[clampedIndex];
      const targetLeft = card.offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: smooth ? 'smooth' : 'auto'
      });
      setActiveCardIndex(clampedIndex);
    }
  };

  // Arrows scroll exactly one card width left or right with smooth behavior
  const handleArrowScroll = (direction: 'left' | 'right') => {
    if (!gameCarouselRef.current) return;
    const container = gameCarouselRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    let stepWidth = children[0].offsetWidth;
    if (children.length > 1) {
      stepWidth = children[1].offsetLeft - children[0].offsetLeft;
    }
    if (stepWidth <= 0) {
      stepWidth = container.clientWidth * 0.85 + 16;
    }

    const delta = direction === 'left' ? -stepWidth : stepWidth;
    container.scrollBy({
      left: delta,
      behavior: 'smooth'
    });
  };

  // Keyboard Left / Right arrow navigation for the game carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInput) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleArrowScroll('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleArrowScroll('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mouse Wheel horizontal scroll support over carousel
  const handleCarouselWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 5) {
      if (!gameCarouselRef.current) return;
      gameCarouselRef.current.scrollBy({
        left: e.deltaY * 1.25,
        behavior: 'auto'
      });
    }
  };

  // Mouse Drag to scroll horizontal carousel
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameCarouselRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - gameCarouselRef.current.offsetLeft;
    scrollLeftRef.current = gameCarouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !gameCarouselRef.current) return;
    const x = e.pageX - gameCarouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.25;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    gameCarouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Always start scrolled to card 1 (index 0) on initial load.
  // Return to the last-played game's card when returning/switching.
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (gameCarouselRef.current) {
        gameCarouselRef.current.scrollTo({ left: 0, behavior: 'instant' });
      }
      setActiveCardIndex(0);
      return;
    }

    // When selectedModuleId changes, return carousel to that game's card
    const idx = availableModules.findIndex(m => m.id === selectedModuleId);
    if (idx >= 0) {
      scrollToCard(idx, true);
    }
  }, [selectedModuleId]);

  // IntersectionObserver to accurately track the active visible card
  useEffect(() => {
    const container = gameCarouselRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const indexAttr = entry.target.getAttribute('data-card-index');
            if (indexAttr !== null) {
              const idx = parseInt(indexAttr, 10);
              if (!isNaN(idx)) {
                setActiveCardIndex(idx);
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5
      }
    );

    children.forEach((child) => observer.observe(child));

    return () => {
      observer.disconnect();
    };
  }, [availableModules.length]);

  // Each card's Play button opens exactly that card's game using gameId from card (never active index)
  const handlePlayGame = (gameId: number) => {
    setSelectedModuleId(gameId);
    resetExperiment(undefined, gameId);
    setIsGamePickerExpanded(false);
    try {
      safeStorage.setItem('sololab_last_played_game', String(gameId));
    } catch {
      // Ignore storage error
    }
    scrollToStep(1);
    if (arenaRef.current) {
      arenaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Game-specific decision state
  const [pdChoice, setPdChoice] = useState<'Cooperate' | 'Defect'>('Cooperate');
  const [price2x2Choice, setPrice2x2Choice] = useState<'High Price' | 'Low Price'>('High Price');
  const [stagChoice, setStagChoice] = useState<'Stag' | 'Hare'>('Stag');
  const [hawkChoice, setHawkChoice] = useState<'Hawk' | 'Dove'>('Dove');
  const [launchChoice, setLaunchChoice] = useState<'Launch' | 'Wait'>('Launch');
  const [timingChoice, setTimingChoice] = useState<'Monday' | 'Wednesday' | 'Friday'>('Friday');
  const [ultimatumOffer, setUltimatumOffer] = useState<number>(4);
  const [pieDemand, setPieDemand] = useState<number>(5);
  const [penniesChoice, setPenniesChoice] = useState<'Heads' | 'Tails'>('Heads');
  const [battleChoice, setBattleChoice] = useState<'Opera' | 'Football'>('Opera');
  const [trustInvestment, setTrustInvestment] = useState<number>(5);
  const [deterrenceChoice, setDeterrenceChoice] = useState<'Commit' | 'Stay Flexible'>('Commit');
  const [bertrandPrice, setBertrandPrice] = useState<number>(35);
  const [studentValuation] = useState<number>(() => drawValuation('student', 1, 1, 10));
  const [botValuation] = useState<number>(() => drawValuation('bot', 1, 1, 10));
  const [auctionBid, setAuctionBid] = useState<number>(studentValuation);
  const [fpAuctionBid, setFpAuctionBid] = useState<number>(() => Math.round((studentValuation / 2) * 10) / 10);
  const [beautyGuess, setBeautyGuess] = useState<number>(33);
  const [publicGoodsContr, setPublicGoodsContr] = useState<number>(10);
  const [signalingType] = useState<'High Quality' | 'Low Quality'>(() => Math.random() < 0.5 ? 'High Quality' : 'Low Quality');
  const [signalingChoice, setSignalingChoice] = useState<'Yes (Costly)' | 'No'>('Yes (Costly)');

  // Centipede Game state (ID 20)
  const [centipedeNode, setCentipedeNode] = useState<number>(1);
  const [centipedePath, setCentipedePath] = useState<Array<{ node: number; player: 'You' | 'Bot'; action: 'Pass' | 'Take' }>>([]);
  const [centipedeChoice, setCentipedeChoice] = useState<'Pass' | 'Take'>('Pass');
  const [_centipedeExitNode, setCentipedeExitNode] = useState<number | undefined>(undefined);
  const [_centipedeExitAction, setCentipedeExitAction] = useState<string | undefined>(undefined);

  // Cournot Duopoly Quantity Competition (ID 21)
  const [cournotQuantity, setCournotQuantity] = useState<number>(30);

  // Hotelling's Spatial Competition (ID 22)
  const [hotellingLocation, setHotellingLocation] = useState<number>(50);

  // Colonel Blotto Resource War (ID 23)
  const [blottoA, setBlottoA] = useState<number>(34);
  const [blottoB, setBlottoB] = useState<number>(33);
  const [blottoC, setBlottoC] = useState<number>(33);

  // Common-Value Oil Lease Auction & Winner's Curse (ID 24)
  const [cvTrueValue, setCvTrueValue] = useState<number>(() => Math.floor(Math.random() * 41) + 30);
  const [cvPlayerSignal, setCvPlayerSignal] = useState<number>(() => Math.max(10, Math.min(90, Math.round(50 + (Math.random() * 20 - 10)))));
  const [cvBotSignal, setCvBotSignal] = useState<number>(() => Math.max(10, Math.min(90, Math.round(50 + (Math.random() * 20 - 10)))));
  const [cvBid, setCvBid] = useState<number>(44);

  // Dollar Auction (ID 25)
  const [dollarBid, setDollarBid] = useState<number>(0.8);

  // Traveler's Dilemma (ID 26)
  const [travelerClaim, setTravelerClaim] = useState<number>(98);

  // Renewable Fishery Commons (ID 27)
  const [fisheryEffort, setFisheryEffort] = useState<number>(4);

  // Market for Lemons (ID 28)
  const [lemonPrice, setLemonPrice] = useState<number>(5000);

  // Game 12: Tragedy of the Commons Fishery View Toggle (Fishery vs Token View)
  const [isFisheryView, setIsFisheryView] = useState<boolean>(true);

  // Expert Mode toggle for formal 2x2 payoff matrix & sequential visualizers
  const [showExpertMatrix, setShowExpertMatrix] = useState<boolean>(false);

  const isDollarGame = selectedModuleId === 6 || selectedModuleId === 14 || selectedModuleId === 7 || selectedModuleId === 8 || selectedModuleId === 16 || selectedModuleId === 9 || selectedModuleId === 21 || selectedModuleId === 24 || selectedModuleId === 25 || selectedModuleId === 26 || selectedModuleId === 28;

  const getSelectedActionForGame = (): string | undefined => {
    switch (selectedModuleId) {
      case 1:
      case 6:
        return pdChoice;
      case 3:
        return price2x2Choice;
      case 4:
        return timingChoice;
      case 13:
        return stagChoice;
      case 15:
        return hawkChoice;
      case 18:
        return battleChoice;
      case 17:
        return penniesChoice;
      case 2:
        return launchChoice;
      case 5:
        return deterrenceChoice;
      case 10:
        return signalingChoice;
      case 21:
        return `${cournotQuantity} units`;
      case 22:
        return `Location ${hotellingLocation}`;
      case 23:
        return `Passes (${blottoA}, ${blottoB}, ${blottoC})`;
      case 24:
        return `$${cvBid.toFixed(2)}`;
      case 25:
        return `$${dollarBid.toFixed(2)}`;
      case 26:
        return `$${travelerClaim}`;
      case 27:
        return `${fisheryEffort} boats`;
      case 28:
        return `$${lemonPrice.toLocaleString()}`;
      default:
        return undefined;
    }
  };

  // Sync active module label with parent
  useEffect(() => {
    if (selectedModuleId === 20) {
      const label = `Node ${centipedeNode} of 6 Chain (Player: 1, 3, 5 · Bot: 2, 4, 6)`;
      onModuleChange?.(20, label, currentModuleIndex, totalModulesCount, completedGameIds.length);
    } else {
      onModuleChange?.(
        selectedModuleId,
        `Game ${currentModuleIndex} of ${totalModulesCount}`,
        currentModuleIndex,
        totalModulesCount,
        completedGameIds.length
      );
    }
  }, [selectedModuleId, centipedeNode, currentModuleIndex, totalModulesCount, completedGameIds.length, onModuleChange]);

  // Reset experiment
  const resetExperiment = (newBotId?: string, newModuleId?: number) => {
    if (newModuleId) {
      setSelectedModuleId(newModuleId);
      const nextGameBots = getBotsForGame(newModuleId);
      setSelectedBotId(newBotId || nextGameBots[0].id);
    } else if (newBotId) {
      setSelectedBotId(newBotId);
    }
    setCurrentRound(1);
    setHistory([]);
    setIsRoundResolved(false);
    setIsBotThinking(false);
    setCurrentBotThought('');
    setLastRoundResult(null);
    setIsExperimentFinished(false);
    setPdChoice('Cooperate');
    setPrice2x2Choice('High Price');
    setStagChoice('Stag');
    setHawkChoice('Dove');
    setLaunchChoice('Launch');
    setTimingChoice('Friday');
    setDeterrenceChoice('Commit');
    setUltimatumOffer(4);
    setPieDemand(5);
    setPenniesChoice('Heads');
    setBattleChoice('Opera');
    setTrustInvestment(5);
    setBertrandPrice(35);
    setAuctionBid(studentValuation);
    setFpAuctionBid(Math.round((studentValuation / 2) * 10) / 10);
    setBeautyGuess(33);
    setPublicGoodsContr(10);
    setSignalingChoice('Yes (Costly)');
    setCentipedeChoice('Pass');
    setCentipedeNode(1);
    setCentipedePath([]);
    setCentipedeExitNode(undefined);
    setCentipedeExitAction(undefined);
    setCournotQuantity(30);
    setHotellingLocation(50);
    setBlottoA(34);
    setBlottoB(33);
    setBlottoC(33);
    setDollarBid(0.8);
    setTravelerClaim(98);
    setFisheryEffort(4);
    setLemonPrice(5000);

    const freshTrue = Math.floor(Math.random() * 41) + 30;
    const freshPlayerNoise = Math.floor(Math.random() * 21) - 10;
    const freshBotNoise = Math.floor(Math.random() * 21) - 10;
    const freshPlayerSignal = Math.max(10, Math.min(90, freshTrue + freshPlayerNoise));
    const freshBotSignal = Math.max(10, Math.min(90, freshTrue + freshBotNoise));
    setCvTrueValue(freshTrue);
    setCvPlayerSignal(freshPlayerSignal);
    setCvBotSignal(freshBotSignal);
    setCvBid(Math.max(10, freshPlayerSignal - 6));

    // Reset Quiz state for new experiment
    setQuizQuestionIndex(0);
    setQuizAnswers([null, null, null]);
    setIsQuizCompleted(false);

    // Reset to Step 1 (or Step 2 on restart of same game)
    setActiveStep(1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Submit player's decision for the active round with animated bot thought bubble anticipation
  const handleSubmitRound = () => {
    if (isBotThinking) return;

    const roundHistoryForBot: RoundHistoryEntry[] = history.map(h => ({
      round: h.round,
      playerAction: h.playerAction,
      botAction: h.botAction,
      playerPayoff: h.playerPayoff,
      botPayoff: h.botPayoff,
      playerValuation: h.playerValuation,
      botValuation: h.botValuation
    }));

    let thought = "";
    try {
      thought = activeBot.getAnticipationThought(currentRound, roundHistoryForBot);
    } catch {
      thought = "Deciding strategy based on the payoff matrix and prior interactions.";
    }
    if (!thought || thought.trim().length === 0) {
      thought = "Deciding my move according to my strategic profile.";
    }

    setCurrentBotThought(thought);
    setIsBotThinking(true);

    setTimeout(() => {
      executeSubmitRound(thought, roundHistoryForBot);
    }, 950);
  };

  const executeSubmitRound = (resolvedThought: string, roundHistoryForBot: RoundHistoryEntry[]) => {
    let playerAction: any;
    let playerPayoff = 0;
    let botPayoff = 0;

    const botDecision = activeBot.decide({
      round: currentRound,
      totalRounds,
      history: roundHistoryForBot,
      botValuation: selectedModuleId === 24 ? cvBotSignal : botValuation,
      studentValuation: selectedModuleId === 24 ? cvPlayerSignal : studentValuation
    });

    if (selectedModuleId === 6 || selectedModuleId === 1) {
      // Prisoner's Dilemma (One-Shot or Repeated)
      playerAction = pdChoice;
      const botAction = botDecision.action;

      if (playerAction === 'Cooperate' && botAction === 'Cooperate') {
        playerPayoff = 2;
        botPayoff = 2;
      } else if (playerAction === 'Cooperate' && botAction === 'Defect') {
        playerPayoff = 0;
        botPayoff = 3;
      } else if (playerAction === 'Defect' && botAction === 'Cooperate') {
        playerPayoff = 3;
        botPayoff = 0;
      } else {
        playerPayoff = 1;
        botPayoff = 1;
      }
    } else if (selectedModuleId === 3) {
      // Simultaneous Price Competition (Bertrand 2x2)
      playerAction = price2x2Choice;
      const botAction = botDecision.action;
      if (playerAction === 'High Price' && botAction === 'High Price') {
        playerPayoff = 2; botPayoff = 2;
      } else if (playerAction === 'High Price' && botAction === 'Low Price') {
        playerPayoff = 0; botPayoff = 3;
      } else if (playerAction === 'Low Price' && botAction === 'High Price') {
        playerPayoff = 3; botPayoff = 0;
      } else {
        playerPayoff = 1; botPayoff = 1;
      }
    } else if (selectedModuleId === 2) {
      // Launch-or-Wait (Sequential Entry)
      playerAction = launchChoice;
      const botAction = botDecision.action;
      if (playerAction === 'Launch' && botAction === 'Stay Out') {
        playerPayoff = 4; botPayoff = 1;
      } else if (playerAction === 'Launch' && botAction === 'Enter') {
        playerPayoff = 2; botPayoff = 2;
      } else if (playerAction === 'Wait' && botAction === 'Enter') {
        playerPayoff = 1; botPayoff = 4;
      } else {
        playerPayoff = 0; botPayoff = 0;
      }
    } else if (selectedModuleId === 4) {
      // Promotion Timing (3x3 Mixed Strategy)
      playerAction = timingChoice;
      const botAction = botDecision.action;
      if (playerAction === botAction) {
        playerPayoff = 0; botPayoff = 0;
      } else {
        playerPayoff = 1; botPayoff = 1;
      }
    } else if (selectedModuleId === 5) {
      // Entry Deterrence & Strategic Commitment
      playerAction = deterrenceChoice;
      const botAction = botDecision.action;
      if (playerAction === 'Commit' && botAction === 'Stay Out') {
        playerPayoff = 4; botPayoff = 0;
      } else if (playerAction === 'Commit' && botAction === 'Enter') {
        playerPayoff = -2; botPayoff = -2;
      } else if (playerAction === 'Stay Flexible' && botAction === 'Enter') {
        playerPayoff = 2; botPayoff = 2;
      } else {
        playerPayoff = 4; botPayoff = 0;
      }
    } else if (selectedModuleId === 8) {
      // First-Price Sealed-Bid Auction
      playerAction = fpAuctionBid;
      const botAction = Number(botDecision.action);
      if (playerAction > botAction) {
        playerPayoff = Math.round((studentValuation - playerAction) * 10) / 10;
        botPayoff = 0;
      } else if (botAction > playerAction) {
        playerPayoff = 0;
        botPayoff = Math.round((botValuation - botAction) * 10) / 10;
      } else {
        playerPayoff = Math.round(((studentValuation - playerAction) / 2) * 10) / 10;
        botPayoff = Math.round(((botValuation - botAction) / 2) * 10) / 10;
      }
    } else if (selectedModuleId === 9) {
      // Split-the-Pie Bargaining (Demand Game with Outside Options)
      playerAction = pieDemand;
      const botAction = Number(botDecision.action);
      const totalDemands = Math.round((playerAction + botAction) * 10) / 10;
      if (totalDemands <= 10) {
        playerPayoff = playerAction;
        botPayoff = botAction;
      } else {
        playerPayoff = 1;
        botPayoff = 1;
      }
    } else if (selectedModuleId === 10) {
      // Costly Signaling & Asymmetric Information (Spence)
      playerAction = signalingChoice;
      const botAction = botDecision.action;
      const isHighQuality = signalingType === 'High Quality';
      const signalCost = signalingChoice === 'Yes (Costly)' ? (isHighQuality ? 2 : 5) : 0;
      const revenue = botAction === 'Trust' ? 10 : 3;
      playerPayoff = revenue - signalCost;
      botPayoff = botAction === 'Trust' ? (isHighQuality ? 12 - 10 : 2 - 10) : 0;
    } else if (selectedModuleId === 13) {
      // Stag Hunt Coordination
      playerAction = stagChoice;
      const botAction = botDecision.action;

      if (playerAction === 'Stag' && botAction === 'Stag') {
        playerPayoff = 10;
        botPayoff = 10;
      } else if (playerAction === 'Stag' && botAction === 'Hare') {
        playerPayoff = 0;
        botPayoff = 4;
      } else if (playerAction === 'Hare' && botAction === 'Stag') {
        playerPayoff = 4;
        botPayoff = 0;
      } else {
        playerPayoff = 4;
        botPayoff = 4;
      }
    } else if (selectedModuleId === 14) {
      // Bertrand Price Competition
      playerAction = bertrandPrice;
      const botAction = Number(botDecision.action);
      const mc = 10;

      if (playerAction < botAction) {
        playerPayoff = Math.max(0, (playerAction - mc) * (100 - playerAction));
        botPayoff = 0;
      } else if (botAction < playerAction) {
        playerPayoff = 0;
        botPayoff = Math.max(0, (botAction - mc) * (100 - botAction));
      } else {
        const sharedProfit = Math.max(0, (playerAction - mc) * (100 - playerAction)) / 2;
        playerPayoff = sharedProfit;
        botPayoff = sharedProfit;
      }
    } else if (selectedModuleId === 7) {
      // Second-Price Vickrey Auction
      playerAction = auctionBid;
      const botAction = Number(botDecision.action);

      if (playerAction > botAction) {
        playerPayoff = Math.round((studentValuation - botAction) * 10) / 10;
        botPayoff = 0;
      } else if (botAction > playerAction) {
        playerPayoff = 0;
        botPayoff = Math.round((botValuation - playerAction) * 10) / 10;
      } else {
        playerPayoff = Math.round(((studentValuation - botAction) / 2) * 10) / 10;
        botPayoff = Math.round(((botValuation - playerAction) / 2) * 10) / 10;
      }
    } else if (selectedModuleId === 11) {
      // Keynesian Beauty Contest (2/3 of Average)
      playerAction = beautyGuess;
      const botAction = Number(botDecision.action);

      const avg = (playerAction + botAction) / 2;
      const target = Math.round((2 / 3) * avg * 10) / 10;

      const pDist = Math.abs(playerAction - target);
      const bDist = Math.abs(botAction - target);

      if (pDist < bDist) {
        playerPayoff = 10;
        botPayoff = 0;
      } else if (bDist < pDist) {
        playerPayoff = 0;
        botPayoff = 10;
      } else {
        playerPayoff = 5;
        botPayoff = 5;
      }
    } else if (selectedModuleId === 15) {
      // Hawk-Dove Brinkmanship
      playerAction = hawkChoice;
      const botAction = botDecision.action;

      if (playerAction === 'Dove' && botAction === 'Dove') {
        playerPayoff = 3;
        botPayoff = 3;
      } else if (playerAction === 'Hawk' && botAction === 'Hawk') {
        playerPayoff = -10;
        botPayoff = -10;
      } else if (playerAction === 'Hawk' && botAction === 'Dove') {
        playerPayoff = 6;
        botPayoff = 0;
      } else {
        playerPayoff = 0;
        botPayoff = 6;
      }
    } else if (selectedModuleId === 16) {
      // Ultimatum Bargaining ($10 Pie)
      playerAction = ultimatumOffer;
      let accepted = true;
      if (activeBot.id === 'equity_enforcer') {
        accepted = ultimatumOffer >= 4.5;
      } else if (activeBot.id === 'spiteful_punisher') {
        accepted = ultimatumOffer >= 3.0;
      } else if (activeBot.id === 'homo_economicus') {
        accepted = ultimatumOffer >= 0.5;
      } else {
        accepted = ultimatumOffer >= 2.5;
      }

      botDecision.action = accepted ? 'Accept' : 'Reject';
      if (accepted) {
        playerPayoff = Math.round((10 - ultimatumOffer) * 10) / 10;
        botPayoff = Math.round(ultimatumOffer * 10) / 10;
      } else {
        playerPayoff = 0;
        botPayoff = 0;
      }
    } else if (selectedModuleId === 17) {
      // Matching Pennies (Player = Matcher, Bot = Mismatcher)
      playerAction = penniesChoice;
      const botAction = botDecision.action;

      if (playerAction === botAction) {
        playerPayoff = 2;
        botPayoff = 0;
      } else {
        playerPayoff = 0;
        botPayoff = 2;
      }
    } else if (selectedModuleId === 18) {
      // Battle of the Sexes
      playerAction = battleChoice;
      const botAction = botDecision.action;

      if (playerAction === 'Opera' && botAction === 'Opera') {
        playerPayoff = 3;
        botPayoff = 2;
      } else if (playerAction === 'Football' && botAction === 'Football') {
        playerPayoff = 2;
        botPayoff = 3;
      } else {
        playerPayoff = 0;
        botPayoff = 0;
      }
    } else if (selectedModuleId === 19) {
      // The Trust Game (Investment triples)
      playerAction = trustInvestment;
      const tripled = trustInvestment * 3;
      let returned = 0;

      if (activeBot.id === 'selfish_trustee') {
        returned = 0;
      } else if (activeBot.id === 'fair_reciprocator') {
        returned = Math.round((tripled / 2) * 10) / 10;
      } else if (activeBot.id === 'opportunistic_trustee') {
        returned = trustInvestment > 6 ? Math.round(trustInvestment * 0.5) : trustInvestment;
      } else {
        returned = Math.round(trustInvestment * 1.2);
      }

      botDecision.action = returned;
      botDecision.rationale = `Received ${trustInvestment} pts (tripled to ${tripled}). Returned ${returned} pts.`;

      playerPayoff = (10 - trustInvestment) + returned;
      botPayoff = tripled - returned;
    } else if (selectedModuleId === 12) {
      // Public Goods Dilemma
      playerAction = publicGoodsContr;
      const botAction = Number(botDecision.action);
      const totalPool = playerAction + botAction;
      const share = Math.round((totalPool * 1.6 / 2) * 10) / 10;

      playerPayoff = (20 - playerAction) + share;
      botPayoff = (20 - botAction) + share;
    } else if (selectedModuleId === 20) {
      // Centipede Game
      const myNode = centipedeNode;
      const newPath = [...centipedePath, { node: myNode, player: 'You' as const, action: centipedeChoice }];
      setCentipedePath(newPath);

      if (centipedeChoice === 'Take') {
        if (myNode === 1) { playerPayoff = 2; botPayoff = 0; }
        else if (myNode === 3) { playerPayoff = 4; botPayoff = 2; }
        else if (myNode === 5) { playerPayoff = 6; botPayoff = 4; }
        playerAction = `Take at Node ${myNode}`;
        botDecision.action = 'Passed previously';
        setCentipedeExitNode(myNode);
        setCentipedeExitAction('Take (Player)');
        // Player Passed, now Bot's turn at Node + 1
        const botNode = myNode + 1;
        let botTakes = false;
        if (activeBot.id === 'always_defect_centipede' || activeBot.id === 'backward_induction_bot') {
          botTakes = true;
        } else if (activeBot.id === 'tit_for_tat_centipede' || activeBot.id === 'cooperative_centipede') {
          botTakes = botNode === 6;
        } else if (activeBot.id === 'empirical_palfrey_centipede') {
          // Bounded rationality: Palfrey passes early with human lab likelihoods
          const passProb = botNode === 2 ? 0.80 : botNode === 4 ? 0.45 : 0.15;
          botTakes = Math.random() >= passProb;
        } else {
          botTakes = Math.random() < 0.6;
        }

        if (botTakes) {
          if (botNode === 2) { playerPayoff = 1; botPayoff = 4; }
          else if (botNode === 4) { playerPayoff = 3; botPayoff = 6; }
          else if (botNode === 6) { playerPayoff = 5; botPayoff = 8; }
          playerAction = `Pass at Node ${myNode}`;
          botDecision.action = `Take at Node ${botNode}`;
          setCentipedeExitNode(botNode);
          setCentipedeExitAction(`Take (${activeBot.name})`);
          setCentipedePath(p => [...p, { node: botNode, player: 'Bot', action: 'Take' }]);
        } else {
          if (botNode === 6) {
            playerPayoff = 8;
            botPayoff = 8;
            playerAction = `Pass at Node ${myNode}`;
            botDecision.action = 'Pass at Node 6 (Terminal Optimum)';
            setCentipedeExitNode(6);
            setCentipedeExitAction('Terminal Cooperation');
            setCentipedePath(p => [...p, { node: 6, player: 'Bot', action: 'Pass' }]);
          } else {
            setCentipedeNode(botNode + 1);
            setCentipedePath(p => [...p, { node: botNode, player: 'Bot', action: 'Pass' }]);
            setIsBotThinking(false);
            return;
          }
        }
      }
    } else if (selectedModuleId === 21) {
      // Cournot Duopoly Competition
      // P = max(0, 100 - (q_player + q_bot)), MC = $10
      playerAction = `${cournotQuantity} units`;
      const botQ = Number(botDecision.action);
      const totalQ = cournotQuantity + botQ;
      const marketPrice = Math.max(0, 100 - totalQ);
      const playerMargin = marketPrice - 10;
      const botMargin = marketPrice - 10;
      const rawPlayerProfit = Math.round(cournotQuantity * playerMargin);
      const rawBotProfit = Math.round(botQ * botMargin);
      // Scaled to dollars: raw profit / 100
      playerPayoff = Math.round((rawPlayerProfit / 100) * 100) / 100;
      botPayoff = Math.round((rawBotProfit / 100) * 100) / 100;
      botDecision.action = `${botQ} units (P: $${marketPrice})`;
    } else if (selectedModuleId === 22) {
      // Hotelling's Spatial Competition (0 to 100 beach line)
      playerAction = `Location ${hotellingLocation}`;
      const botLoc = Number(botDecision.action);
      let pShare = 50;
      let bShare = 50;
      if (hotellingLocation < botLoc) {
        const midpoint = (hotellingLocation + botLoc) / 2;
        pShare = Math.round(midpoint * 10) / 10;
        bShare = Math.round((100 - midpoint) * 10) / 10;
      } else if (hotellingLocation > botLoc) {
        const midpoint = (botLoc + hotellingLocation) / 2;
        bShare = Math.round(midpoint * 10) / 10;
        pShare = Math.round((100 - midpoint) * 10) / 10;
      }
      playerPayoff = pShare;
      botPayoff = bShare;
      botDecision.action = `Location ${botLoc}`;
    } else if (selectedModuleId === 23) {
      // Colonel Blotto Resource War (3 Fronts A, B, C; sum = 100)
      playerAction = `Passes (${blottoA}, ${blottoB}, ${blottoC})`;
      const bObj = botDecision.action as { a?: number; b?: number; c?: number };
      const botA = bObj?.a ?? 34;
      const botB = bObj?.b ?? 33;
      const botC = bObj?.c ?? 33;
      let pFrontWins = 0;
      let bFrontWins = 0;
      if (blottoA > botA) pFrontWins++;
      else if (botA > blottoA) bFrontWins++;
      if (blottoB > botB) pFrontWins++;
      else if (botB > blottoB) bFrontWins++;
      if (blottoC > botC) pFrontWins++;
      else if (botC > blottoC) bFrontWins++;

      if (pFrontWins > bFrontWins) {
        playerPayoff = 1;
        botPayoff = -1;
      } else if (bFrontWins > pFrontWins) {
        playerPayoff = -1;
        botPayoff = 1;
      } else {
        playerPayoff = 0;
        botPayoff = 0;
      }
      botDecision.action = `Passes (${botA}, ${botB}, ${botC}) [${pFrontWins}-${bFrontWins} Fronts]`;
    } else if (selectedModuleId === 24) {
      // Common-Value Oil Lease Auction & Winner's Curse
      playerAction = `$${cvBid.toFixed(2)} (Signal: $${cvPlayerSignal.toFixed(2)})`;
      const botBidVal = Number(botDecision.action);
      if (cvBid > botBidVal) {
        playerPayoff = Math.round((cvTrueValue - cvBid) * 100) / 100;
        botPayoff = 0;
        botDecision.action = `$${botBidVal.toFixed(2)} (You won lease! True Value: $${cvTrueValue.toFixed(2)})`;
      } else if (botBidVal > cvBid) {
        botPayoff = Math.round((cvTrueValue - botBidVal) * 100) / 100;
        playerPayoff = 0;
        botDecision.action = `$${botBidVal.toFixed(2)} (Bot won lease! True Value: $${cvTrueValue.toFixed(2)})`;
      } else {
        // Tied bid
        playerPayoff = Math.round(((cvTrueValue - cvBid) / 2) * 100) / 100;
        botPayoff = Math.round(((cvTrueValue - botBidVal) / 2) * 100) / 100;
        botDecision.action = `$${botBidVal.toFixed(2)} (Tie split! True Value: $${cvTrueValue.toFixed(2)})`;
      }
    } else if (selectedModuleId === 25) {
      // The Escalating Dollar Auction (Shubik 1971)
      playerAction = `$${dollarBid.toFixed(2)}`;
      const botBidVal = Number(botDecision.action);
      if (dollarBid > botBidVal) {
        playerPayoff = Math.round((1.0 - dollarBid) * 100) / 100;
        botPayoff = -botBidVal;
        botDecision.action = `$${botBidVal.toFixed(2)} (You won $1 bill!)`;
      } else if (botBidVal > dollarBid) {
        playerPayoff = -dollarBid;
        botPayoff = Math.round((1.0 - botBidVal) * 100) / 100;
        botDecision.action = `$${botBidVal.toFixed(2)} (Bot won $1 bill!)`;
      } else {
        playerPayoff = Math.round((0.5 - dollarBid) * 100) / 100;
        botPayoff = Math.round((0.5 - botBidVal) * 100) / 100;
        botDecision.action = `$${botBidVal.toFixed(2)} (Tied split!)`;
      }
    } else if (selectedModuleId === 26) {
      // Traveler's Dilemma (Basu 1994)
      playerAction = `$${travelerClaim}`;
      const botClaimVal = Number(botDecision.action);
      if (travelerClaim < botClaimVal) {
        playerPayoff = travelerClaim + 2;
        botPayoff = travelerClaim - 2;
        botDecision.action = `$${botClaimVal} (You won +$2 reward!)`;
      } else if (botClaimVal < travelerClaim) {
        playerPayoff = botClaimVal - 2;
        botPayoff = botClaimVal + 2;
        botDecision.action = `$${botClaimVal} (Bot won +$2 reward!)`;
      } else {
        playerPayoff = travelerClaim;
        botPayoff = botClaimVal;
        botDecision.action = `$${botClaimVal} (Equal claims)`;
      }
    } else if (selectedModuleId === 27) {
      // Tragedy of the Commons Renewable Fishery (Hardin / Ostrom)
      playerAction = `${fisheryEffort} trawlers`;
      const botEffortVal = Number(botDecision.action);
      const totalEffort = fisheryEffort + botEffortVal;
      let revenuePerBoat = 3.5;
      if (totalEffort > 12) {
        revenuePerBoat = 1.0; // severe overfishing collapse
      } else if (totalEffort > 8) {
        revenuePerBoat = 2.4; // moderate depletion
      }
      playerPayoff = Math.round(fisheryEffort * (revenuePerBoat - 1.5) * 10) / 10;
      botPayoff = Math.round(botEffortVal * (revenuePerBoat - 1.5) * 10) / 10;
      botDecision.action = `${botEffortVal} trawlers (Total Fleet: ${totalEffort} boats · ${totalEffort > 12 ? 'Overfished!' : 'Stock Healthy'})`;
    } else if (selectedModuleId === 28) {
      // Market for Lemons & Asymmetric Quality (Akerlof 1970)
      playerAction = `$${lemonPrice.toLocaleString()}`;
      const isAccepted = String(botDecision.action).includes('Accept');
      if (isAccepted) {
        let buyerCarWorth = 6000;
        if (activeBot.id === 'lemon_peach') {
          buyerCarWorth = 9000; // 1.2 * 7500
        } else if (activeBot.id === 'lemon_clunker') {
          buyerCarWorth = 2640; // 1.2 * 2200
        } else if (activeBot.id === 'lemon_certified') {
          buyerCarWorth = 7800; // 1.2 * 6500
        }
        playerPayoff = Math.round(((buyerCarWorth - lemonPrice) / 100) * 100) / 100;
        botPayoff = Math.round(((lemonPrice - (buyerCarWorth / 1.2)) / 100) * 100) / 100;
      } else {
        playerPayoff = 0;
        botPayoff = 0;
      }
    }

    const roundResult: SoloLabRoundHistoryEntry = {
      round: currentRound,
      playerAction,
      botAction: botDecision.action,
      playerPayoff,
      botPayoff,
      botRationale: botDecision.rationale,
      botThought: resolvedThought,
      playerValuation: selectedModuleId === 7 ? studentValuation : selectedModuleId === 24 ? cvPlayerSignal : undefined,
      botValuation: selectedModuleId === 7 ? botValuation : selectedModuleId === 24 ? cvBotSignal : undefined
    };

    setLastRoundResult(roundResult);
    setHistory(prev => [...prev, roundResult]);
    setIsRoundResolved(true);
    setIsBotThinking(false);

    if (currentRound >= totalRounds) {
      markGameCompleted(selectedModuleId);

      const counterfactual = computeWhatYouCouldHaveGot(
        selectedModuleId,
        playerAction,
        botDecision.action,
        playerPayoff,
        {
          studentValuation: selectedModuleId === 7 ? studentValuation : selectedModuleId === 24 ? cvPlayerSignal : undefined,
          botValuation: selectedModuleId === 7 ? botValuation : selectedModuleId === 24 ? cvBotSignal : undefined,
          activeBotId: activeBot.id,
          botName: activeBot.name,
          signalingType,
          centipedeNode,
          cvTrueValue,
          cvPlayerSignal,
          cvBotSignal,
          isDollarGame,
          history: roundHistoryForBot
        }
      );

      const isBest = counterfactual.isBestResponse;
      const nextStreak = isBest ? masteryStreak + 1 : 0;
      saveMasteryStreak(nextStreak);

      const toastMessage = isBest
        ? (nextStreak > 1
            ? `Streak ${nextStreak}: you found the best response!`
            : `Streak 1: you found the best response!`)
        : `Streak reset: you scored ${formatSignedPayoffShort(playerPayoff, isDollarGame)} · Best response was ${counterfactual.bestActionLabel}`;

      setGameCompletionToast({
        visible: true,
        message: toastMessage,
        isBestResponse: isBest,
        streak: nextStreak
      });
    }

    // Automatically transition to Step 3: Result & Key Takeaway
    setTimeout(() => {
      scrollToStep(3);
    }, 60);
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      setIsRoundResolved(false);
      setIsBotThinking(false);
      setCurrentBotThought('');
      setLastRoundResult(null);
      setTimeout(() => {
        scrollToStep(2);
      }, 60);
    } else {
      setIsExperimentFinished(true);
    }
  };

  const playerTotalScore = Math.round(history.reduce((sum, h) => sum + h.playerPayoff, 0) * 10) / 10;
  const botTotalScore = Math.round(history.reduce((sum, h) => sum + h.botPayoff, 0) * 10) / 10;

  const debriefData: DebriefData = {
    gameTitle: availableModules[activeModuleIndex]?.title || 'Game Theory Simulation',
    gameId: selectedModuleId,
    botInfo: {
      id: activeBot.id,
      name: activeBot.name,
      title: activeBot.title,
      avatar: activeBot.avatar,
      color: activeBot.color,
      tagline: activeBot.tagline
    },
    playerTotalScore,
    botTotalScore,
    nashBenchmarkScore: selectedModuleId === 1 ? 1 : selectedModuleId === 6 ? totalRounds * 1 : selectedModuleId === 13 ? totalRounds * 4 : selectedModuleId === 21 ? 9.00 : selectedModuleId === 22 ? 50 : selectedModuleId === 23 ? 0 : selectedModuleId === 24 ? 4.00 : totalRounds * 2,
    paretoOptimumScore: selectedModuleId === 1 ? 2 : selectedModuleId === 6 ? totalRounds * 2 : selectedModuleId === 13 ? totalRounds * 10 : selectedModuleId === 21 ? 10.13 : selectedModuleId === 22 ? 50 : selectedModuleId === 23 ? 1 : selectedModuleId === 24 ? 6.00 : totalRounds * 6,
    roundCount: totalRounds,
    roundsSummary: history
  };

  // Helper for rendering large, thumb-friendly range sliders with ± stepper buttons
  const renderThumbSlider = ({
    label,
    value,
    min,
    max,
    step,
    unitPrefix = '',
    unitSuffix = '',
    displayValue,
    subtext,
    benchmarks,
    onChange
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unitPrefix?: string;
    unitSuffix?: string;
    displayValue?: string;
    subtext?: string;
    benchmarks?: { label: string; val: number }[];
    onChange: (v: number) => void;
  }) => {
    const handleDecrement = () => {
      const next = Math.max(min, Math.round((value - step) * 100) / 100);
      onChange(next);
    };
    const handleIncrement = () => {
      const next = Math.min(max, Math.round((value + step) * 100) / 100);
      onChange(next);
    };

    return (
      <div className="space-y-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-base sm:text-lg font-bold text-white">{label}</span>
          <span className="font-mono text-3xl sm:text-4xl font-black text-blue-400">
            {displayValue || `${unitPrefix}${value}${unitSuffix}`}
          </span>
        </div>

        {/* Stepper Buttons + Slider Row for Effortless Thumb Adjustment */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            aria-label="Decrease value"
            className="w-14 h-14 min-w-[56px] min-h-[56px] text-3xl font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl border border-slate-700 flex items-center justify-center cursor-pointer transition-all select-none shadow-md"
          >
            −
          </button>

          <div className="flex-1 relative flex items-center py-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-4 sm:h-5 bg-slate-800 rounded-full cursor-pointer touch-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            />
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            aria-label="Increase value"
            className="w-14 h-14 min-w-[56px] min-h-[56px] text-3xl font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl border border-slate-700 flex items-center justify-center cursor-pointer transition-all select-none shadow-md"
          >
            +
          </button>
        </div>

        {/* Preset Benchmark Chips (all touch targets >= 48px) */}
        {benchmarks && benchmarks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {benchmarks.map((b, bIdx) => (
              <button
                key={bIdx}
                type="button"
                onClick={() => onChange(b.val)}
                className={`min-h-[48px] px-4 py-2.5 rounded-xl text-xs sm:text-sm md:text-base font-mono font-bold transition-all cursor-pointer ${
                  value === b.val
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {subtext && (
          <p className="text-sm sm:text-base text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    );
  };

  // Fast 2-line rules for Simple mode (What to choose & How you score)
  const renderSimpleRules = (modId: number) => {
    switch (modId) {
      case 1:
        return {
          action: "Choose Cooperate (🤝) or Defect (⚔️) in a single simultaneous round.",
          payoff: "Both Cooperate: +2 pts each · Both Defect: +1 pt each · Unilateral Defector gets +3 pts, Cooperator gets 0 pts."
        };
      case 13:
        return {
          action: "Choose Stag (🦌, big reward requiring mutual trust) or Hare (🐇, safe solo reward).",
          payoff: "Both Stag: +10 pts each · Both Hare: +4 pts each · Solo Stag fails (0 pts) while Hare hunter gets +4 pts."
        };
      case 15:
        return {
          action: "Choose peaceful Dove (🕊️) to share, or aggressive Hawk (🦅) to fight.",
          payoff: "Both Dove: +3 pts each · Hawk vs Dove: Hawk takes +6 pts, Dove gets 0 · Mutual Hawk collision costs -10 pts each."
        };
      case 18:
        return {
          action: "Choose Opera (🎭, your favorite) or Football (⚽, bot's favorite) without communicating.",
          payoff: "Both Opera: +3 for you, +2 for Bot · Both Football: +2 for you, +3 for Bot · Clash on different events: 0 pts each."
        };
      case 17:
        return {
          action: "Pick Heads (👑) or Tails (🪙); you are the Matcher, trying to match the bot's coin.",
          payoff: "Coins Match: You win +2 pts (Bot gets 0) · Coins Differ: Bot wins +2 pts (You get 0)."
        };
      case 2:
        return {
          action: "As First Mover, decide whether to Launch (🚀) early or Wait (⏳).",
          payoff: "Launch + Stay Out: You +4, Bot +1 · Launch + Enter: You +2, Bot +2 · Wait + Enter: You +1, Bot +4 · Wait + Stay Out: 0 pts each."
        };
      case 3:
        return {
          action: "Choose High Price (🏷️) or Low Price (⚡) simultaneously with your rival.",
          payoff: "Both High: +2 pts each · Both Low: +1 pt each (Nash Trap) · Undercutting Low Price steals the market (+3 pts vs 0)."
        };
      case 4:
        return {
          action: "Choose Monday, Wednesday, or Friday to launch your store promotion.",
          payoff: "Different days: Success (+1 pt each) · Same day (Clash): Overlap ruins promotion impact (0 pts each)."
        };
      case 5:
        return {
          action: "As Incumbent, choose Commit (🏰, sink capacity) or Stay Flexible (🔄).",
          payoff: "Commit + Stay Out: Monopoly (+4, 0) · Commit + Enter: Price War (-2, -2) · Flexible + Enter: Duopoly (+2, +2)."
        };
      case 8:
        return {
          action: "Submit a sealed bid for the prize (Your private valuation is shown on screen).",
          payoff: "Highest bidder wins and pays their OWN bid. Profit = Valuation - Your Bid (Shade your bid below value!)."
        };
      case 9:
        return {
          action: "Simultaneously demand your share of 10 points (0 to 10 pts).",
          payoff: "If Demands sum ≤ 10: Both get demands · If Demands sum > 10: Deal collapses to Outside Options (+1 pt each)."
        };
      case 10:
        return {
          action: "As Seller, decide whether to Send Costly Signal (🔬, warranty) or No Signal (🤐).",
          payoff: "High Quality signal costs 2; Low Quality costs 5. If Buyer Trusts: +10 revenue. Separating equilibrium filters lemons!"
        };
      case 16:
        return {
          action: "Propose a split ($0 to $10) from the $10 pie to the Bot responder.",
          payoff: "If accepted: You keep ($10 - Offer), Bot gets Offer · If rejected: Both walk away with $0.00."
        };
      case 19:
        return {
          action: "Choose how many points (0 to 10) to transfer to the Trustee; transferred points triple (3x).",
          payoff: "You keep (10 - X) + Y returned · Trustee keeps 3X - Y returned (high trust expands the pie for both)."
        };
      case 12:
        return {
          action: "Choose how many of your 20 tokens (0 to 20) to contribute to the community pool.",
          payoff: "Kept tokens: +1 pt each · Pool tokens multiply by 1.6x and split equally (+0.80 pts/token each)."
        };
      case 6:
        return {
          action: "Play repeated rounds of Cooperate (🤝) or Defect (⚔️) against your opponent across 5 rounds.",
          payoff: "Sustained cooperation earns $2.00/round ($10 total); defection feud traps both at $1.00/round ($5 total)."
        };
      case 7:
        return {
          action: "Submit a sealed bid for the prize (Your private valuation is shown on screen).",
          payoff: "Highest bidder wins and pays the second-highest bid. Profit = Valuation - Winning Price (Losers pay $0)."
        };
      case 14:
        return {
          action: "Set your product price between $10 and $50 (Marginal production cost is $10).",
          payoff: "Lower price captures 100% of customers; undercutting gains sales, but pricing at cost ($10) drops profits to $0."
        };
      case 11:
        return {
          action: "Pick an integer guess between 0 and 100; target is 2/3 of the average of both guesses.",
          payoff: "Closest to target wins +10 pts (ties split +5 pts each). Think one step ahead of your rival's reasoning!"
        };
      case 20:
        return {
          action: "On your turn, Take ends the game. Pass gives the bot the next turn.",
          payoff: "Passing can lead to higher scores if the bot also passes. If both players pass all six turns, each earns 8 points."
        };
      case 21:
        return {
          action: "Choose quantity q (10 to 45 units) to produce simultaneously with your rival.",
          payoff: "Market Price P = $100 - (q1 + q2). Profit = q * (P - $10). Nash is 30 units each ($9.00); collusion is 22.5 units each ($10.13)."
        };
      case 22:
        return {
          action: "Place your ice cream stand along the boardwalk beach between position 0 and 100.",
          payoff: "Beachgoers visit the closer stand. Midpoint splits customers. Nash equilibrium pulls both stands to the median center (location 50, 50 pts each)."
        };
      case 23:
        return {
          action: "Allocate 100 battalions across 3 strategic passes (A, B, C; sum must equal 100).",
          payoff: "Whoever sends more troops to a pass wins that front. Win 2 of 3 passes to win the campaign (+1 pt vs -1 pt; ties score 0)."
        };
      case 24:
        return {
          action: "Submit a sealed bid for the oil lease based on your noisy seismic survey estimate ($V ± $10).",
          payoff: "High bidder wins and pays their own bid. Profit = True Reserve Value - Bid. Beware: winning often implies your survey was the most optimistic!"
        };
      default:
        return {
          action: "Make your strategic choice against the bot opponent.",
          payoff: "Review the payoff structure and choose the highest-expected return."
        };
    }
  };

  // 1-line How to Play bullets for each module
  const renderHowToPlayBullets = (modId: number) => {
    switch (modId) {
      case 1:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Choose <strong className="text-emerald-400">Cooperate (🤝)</strong> or <strong className="text-rose-400">Defect (⚔️)</strong> simultaneously in one round.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Mutual Coop = <strong className="text-emerald-400">+2 pts each</strong> · Mutual Defect = <strong className="text-rose-400">+1 pt each</strong> · Exploiter gets <strong className="text-amber-400">+3 pts</strong>, sucker gets <strong className="text-slate-400">0 pts</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Defecting yields higher points against any opponent move, making it a dominant strategy despite mutual cooperation being better for both." /></li>
          </>
        );
      case 6:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Choose <strong className="text-emerald-400">Cooperate (🤝)</strong> or <strong className="text-rose-400">Defect (⚔️)</strong> simultaneously each round across 5 rounds.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Mutual Coop = <strong className="text-emerald-400">+$2.00 each</strong> · Mutual Defect = <strong className="text-rose-400">+$1.00 each</strong> · Exploiter gets <strong className="text-amber-400">+$3.00</strong>, sucker gets <strong className="text-slate-400">$0.00</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Cooperative play yields double the Nash trap (+2 vs +1), sustained through credible retaliatory threats." /></li>
          </>
        );
      case 13:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Simultaneously choose high-reward <strong className="text-emerald-400">Stag (🦌)</strong> or safe <strong className="text-amber-400">Hare (🐇)</strong>.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Both Stag = <strong className="text-emerald-400">+10 pts each</strong> · Both Hare = <strong className="text-amber-300">+4 pts each</strong> · Solo Stag = <strong className="text-rose-400">0 pts</strong> (partner gets +4 pts).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Hunting Stag is payoff-dominant (+10); hunting Hare is risk-dominant (+4 guaranteed)." /></li>
          </>
        );
      case 14:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Select a product price between <strong className="text-white">$10 and $50</strong> (cost is MC = $10; demand is Q = 100 - P).</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Lower price captures <strong className="text-emerald-400">100% of profit</strong>; tied prices split profit <strong className="text-blue-300">50/50</strong>; higher price earns <strong className="text-rose-400">$0</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Temptation to undercut by $1 sparks a price war driving price down to marginal cost ($10)." /></li>
          </>
        );
      case 7:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Submit a sealed bid ($0 to $12) for an item you privately value at <strong className="text-emerald-400 font-mono">${studentValuation}.00</strong>.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Highest bidder wins and pays the <strong className="text-amber-400">second-highest bid</strong>; losing bidders pay <strong className="text-slate-400">$0</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Truthful bidding (b = v) is weakly dominant, eliminating winner's curse risk." /></li>
          </>
        );
      case 11:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Pick an integer guess between <strong className="text-white">0 and 100</strong>; target is <strong className="text-amber-300">2/3 of the average</strong> of both guesses.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Closest to the 2/3 target wins <strong className="text-emerald-400">+10 pts</strong>; ties split <strong className="text-blue-300">+5 pts each</strong>; further guess gets <strong className="text-rose-400">0 pts</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Outsmart your opponent by guessing their level of strategic depth (Level-0 ~50, Level-1 ~33, Level-2 ~22, Nash 0)." /></li>
          </>
        );
      case 12:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Receive <strong className="text-white">20 tokens</strong> each round; choose how many (0 to 20) to contribute to the community pool.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Kept tokens give <strong className="text-white">+1 pt each</strong>; pool tokens are multiplied by <strong className="text-emerald-400">1.6x</strong> and split equally (+0.80 pts/token).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Contributing 20 yields maximum +32 pts; free-riding tempts contributing 0 (Nash trap of 20 pts)." /></li>
          </>
        );
      case 15:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Simultaneously choose peaceful <strong className="text-emerald-400">Dove (🕊️)</strong> to share territory, or aggressive <strong className="text-rose-400">Hawk (🦅)</strong> to fight.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Both Dove = <strong className="text-emerald-400">+3 pts each</strong> · Hawk vs Dove = Hawk grabs <strong className="text-amber-400">+6 pts</strong>, Dove gets <strong className="text-slate-400">0 pts</strong> · Both Hawk = <strong className="text-rose-500 font-bold">-10 pts each</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Anti-coordinate: exploit Doves with Hawk (+6), but yield to Dove (0) when facing Hawk to avoid collision." /></li>
          </>
        );
      case 2:
        return (
          <>
            <li><strong className="text-white">Action:</strong> As First Mover, choose <strong className="text-emerald-400">Launch (🚀)</strong> or <strong className="text-amber-400">Wait (⏳)</strong>. Bot observes and chooses Enter or Stay Out.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Launch + Stay Out = <strong className="text-emerald-400">+4 pts</strong> (Bot gets +1) · Launch + Enter = <strong className="text-blue-300">+2 pts each</strong> · Wait + Enter = <strong className="text-rose-400">+1 pt</strong> (Bot gets +4).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Backward induction: committing first forces the follower to enter (2 > 1), achieving subgame perfection." /></li>
          </>
        );
      case 3:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Simultaneously set <strong className="text-blue-400">High Price (🏷️)</strong> or <strong className="text-amber-400">Low Price (⚡)</strong>.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Both High = <strong className="text-emerald-400">+2 pts each</strong> · Both Low = <strong className="text-rose-400">+1 pt each</strong> · Low beats High = <strong className="text-emerald-400">+3 pts</strong> to cutter, <strong className="text-slate-400">0 pts</strong> to high.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Low Price is strictly dominant (3 > 2, 1 > 0), trapping both firms in a Pareto-inferior price war." /></li>
          </>
        );
      case 4:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Choose <strong className="text-white">Monday, Wednesday, or Friday</strong> to launch a retail sale.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Different days = <strong className="text-emerald-400">+1 pt each</strong> · Clashing on the same day = <strong className="text-rose-400">0 pts each</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Anti-coordination: randomize uniformly with probability 1/3 to remain unexploitable." /></li>
          </>
        );
      case 5:
        return (
          <>
            <li><strong className="text-white">Action:</strong> As Incumbent, choose <strong className="text-indigo-400">Commit (🏰)</strong> or <strong className="text-amber-400">Stay Flexible (🔄)</strong>. Bot decides to Enter or Stay Out.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Commit + Stay Out = <strong className="text-emerald-400">+4 pts</strong> · Commit + Enter = <strong className="text-rose-400">-2 pts each</strong> (Price War) · Flexible + Enter = <strong className="text-blue-300">+2 pts each</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Credible commitment: sinking capital forces the entrant to calculate that entering yields -2 vs 0, deterring entry." /></li>
          </>
        );
      case 8:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Submit a sealed bid ($0 to $12) for an item you value at <strong className="text-emerald-400 font-mono">${studentValuation}.00</strong>.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Highest bidder wins and pays <strong className="text-amber-400">their own bid</strong>. Profit = Valuation - Winning Bid (Losers pay $0).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Shade your bid below true valuation (Bayes-Nash equilibrium: b = v/2) to maximize expected profit margin." /></li>
          </>
        );
      case 9:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Simultaneously demand a portion from <strong className="text-white">0 to 10 points</strong> from the 10-point pie.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> If Demands sum ≤ 10, you get your demand; if sum &gt; 10, deal collapses to <strong className="text-slate-400">+1 pt each (Outside Option)</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="The 50/50 split (5 pts each) is a natural Schelling focal point and the symmetric Nash bargaining solution." /></li>
          </>
        );
      case 10:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Nature assigns you <strong className="text-indigo-400 font-mono">{signalingType}</strong>. Decide to <strong className="text-indigo-400">Send Costly Signal (🔬)</strong> or <strong className="text-amber-400">No Signal (🤐)</strong>.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> High-Quality signal costs 2 pts; Low-Quality costs 5 pts. Buyer trusts only with costly signal (+10 revenue).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Spence single-crossing property: differential signal costs separate high quality from lemons in equilibrium." /></li>
          </>
        );
      case 16:
        return (
          <>
            <li><strong className="text-white">Action:</strong> As Proposer, offer an amount from <strong className="text-white">$0.00 to $10.00</strong> from a $10.00 prize pie to the Responder.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> If accepted, you keep <strong className="text-white">$10 - Offer</strong> and Responder gets <strong className="text-emerald-400">Offer</strong>; if rejected, both get <strong className="text-rose-400">$0.00</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Theory predicts offering $1, but human responders reject unfair offers (&lt;$3)." /></li>
          </>
        );
      case 17:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Choose <strong className="text-white">Heads (🪙)</strong> or <strong className="text-white">Tails (🪙)</strong>; you are Matcher and Bot is Mismatcher.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Coins match = you win <strong className="text-emerald-400">+2 pts</strong>, Bot gets 0 · Coins differ = Bot wins <strong className="text-amber-400">+2 pts</strong>, you get 0.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Pure zero-sum game; randomize 50/50 so your opponent cannot predict or exploit you." /></li>
          </>
        );
      case 18:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Choose between <strong className="text-purple-400">Opera (🎭)</strong> and <strong className="text-amber-400">Football (⚽)</strong> without prior communication.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Both Opera = <strong className="text-purple-300">+3 for you, +2 for Bot</strong> · Both Football = <strong className="text-amber-300">+2 for you, +3 for Bot</strong> · Clash = <strong className="text-rose-400">0 pts each</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Both prefer coordinating over clashing (0 pts), but disagree on which event is best." /></li>
          </>
        );
      case 19:
        return (
          <>
            <li><strong className="text-white">Action:</strong> As Investor, choose how many points (0 to 10) to send to the Trustee Bot.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Sent points triple (3x); Trustee returns Y pts: you get <strong className="text-white">(10 - X) + Y</strong>, Trustee keeps <strong className="text-white">3X - Y</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Self-interest predicts sending 0 pts (keeps 10); sending 10 triples to 30 pts (social optimum)." /></li>
          </>
        );
      case 20:
        return (
          <>
            <li><strong className="text-white">Turn Order:</strong> Alternating sequential turns: you choose at <strong className="text-sky-400">Nodes 1, 3, 5</strong>; Bot chooses at <strong className="text-amber-400">Nodes 2, 4, 6</strong>.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> <strong className="text-emerald-400">Pass</strong> doubles the pot and hands the turn; <strong className="text-rose-400">Take</strong> ends the match to claim the larger share.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Passing all 6 nodes awards the social optimum of +8 pts each; backward induction predicts taking immediately at Node 1 (2, 0)." /></li>
          </>
        );
      case 21:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Choose quantity <strong className="text-white">q (10 to 45 units)</strong> to produce (Demand P = 100 - Q; Marginal Cost = $10).</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Profit = <strong className="text-emerald-400">q × (P - $10)</strong>. Cournot-Nash is 30 units each (<strong className="text-emerald-400">+$9.00 each</strong>); Cartel Collusion is 22.5 units each (<strong className="text-amber-300">+$10.13 each</strong>).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Unlike Bertrand price wars, quantity choices sustain positive profit margins above cost." /></li>
          </>
        );
      case 22:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Select stand location <strong className="text-white">x (0 to 100)</strong> along the beach boardwalk.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Bathers go to closer stand; score = <strong className="text-emerald-400">number of customers captured</strong> (50 pts each in center).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Principle of Minimum Differentiation pulls competitors to the center (median consumer), even though quartile locations minimize consumer travel." /></li>
          </>
        );
      case 23:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Allocate 100 battalions across <strong className="text-white">Pass A, Pass B, Pass C</strong> (must sum to 100).</li>
            <li><strong className="text-amber-300">Payoffs:</strong> More troops win a pass; win ≥ 2 passes = <strong className="text-emerald-400">+1 pt</strong>, lose = <strong className="text-rose-400">-1 pt</strong>, tie = 0.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="No pure strategy exists; symmetric defense (34/33/33) loses to concentrated force (50/50/0)." /></li>
          </>
        );
      case 24:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Submit sealed bid for common oil tract given noisy seismic signal <strong className="text-white">s = V ± $10</strong>.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Highest bidder wins and pays own bid: Profit = <strong className="text-emerald-400">True Value - Your Bid</strong> (Loser gets $0).</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="To avoid the Winner's Curse (winning because your survey had the largest positive error), shade bids by at least $6 below signal." /></li>
          </>
        );
      case 25:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Submit a bid ($0.10 to $2.50) for a $1.00 bill.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Highest bidder gets $1.00 bill minus bid; <strong className="text-rose-400">second-highest bidder must ALSO pay their full bid</strong> and receives $0.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Beware the sunk cost trap: once bids pass $0.50, escalating to minimize losses causes catastrophic bankruptcy." /></li>
          </>
        );
      case 26:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Claim an integer reimbursement from <strong className="text-white">$2 to $100</strong> for identical lost luggage.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Lower claim is recognized: lower claimant gets <strong className="text-emerald-400">Claim + $2 bonus</strong>; higher claimant gets <strong className="text-rose-400">Lower Claim - $2 penalty</strong>. Equal claims get face value.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Iterated dominance predicts ($2, $2), but real human players coordinate near $100 for maximum payout." /></li>
          </>
        );
      case 27:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Deploy between <strong className="text-white">0 and 10 trawlers</strong> to harvest the common ocean fishery.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Total fleet size determines stock health: ≤8 boats = sustainable (+3.5 pts/boat); &gt;12 boats = overfishing collapse (+1.0 pt/boat). Operating cost: 1.5 pts/boat.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Observe Elinor Ostrom's quota stewardship to prevent collective tragedy of the commons." /></li>
          </>
        );
      case 28:
        return (
          <>
            <li><strong className="text-white">Action:</strong> Submit a purchase offer price ($1,000 to $9,000) for a used vehicle with unobservable quality.</li>
            <li><strong className="text-amber-300">Payoffs:</strong> Sellers only sell if offer ≥ car quality ($2,000 to $8,000). Buyer values quality at 1.2x. Profit = <strong className="text-emerald-400">1.2 × True Quality - Offer Price</strong>.</li>
            <li><strong className="text-sky-300">Goal: </strong><AnnotateGlossaryText text="Akerlof's Adverse Selection: Offering too little drives high-quality peaches away, leaving you with lemons." /></li>
          </>
        );
      default:
        return null;
    }
  };

  // Mobile Thumb-Friendly Action Dock Stepper Helper (>=56px touch targets)
  const renderCompactThumbStepper = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    displayStr: string,
    onChange: (v: number) => void
  ) => {
    return (
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl px-2 py-1 flex items-center justify-between gap-2 shadow-inner">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
          className="w-12 h-12 min-w-[48px] min-h-[48px] text-2xl font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-xl border border-slate-700 flex items-center justify-center shrink-0 cursor-pointer shadow select-none active:scale-95 transition-all"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>

        <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-1">
          <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-300">
            <span className="truncate">{label}</span>
            <span className="font-mono text-sm font-black text-blue-400 shrink-0 ml-1">
              {displayStr}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-blue-500 h-2 bg-slate-800 rounded-full cursor-pointer mt-0.5 touch-none"
          />
        </div>

        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))}
          className="w-12 h-12 min-w-[48px] min-h-[48px] text-2xl font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-xl border border-slate-700 flex items-center justify-center shrink-0 cursor-pointer shadow select-none active:scale-95 transition-all"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    );
  };

  // Render Thumb-Friendly Controls in Mobile Sticky Action Dock across all 28 games
  const renderMobileActionDockControls = () => {
    switch (selectedModuleId) {
      case 1:
      case 6:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setPdChoice('Cooperate')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                pdChoice === 'Cooperate'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🤝</span>
              <span>Cooperate</span>
            </button>
            <button
              type="button"
              onClick={() => setPdChoice('Defect')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                pdChoice === 'Defect'
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">⚔️</span>
              <span>Defect</span>
            </button>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setLaunchChoice('Launch')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                launchChoice === 'Launch'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🚀</span>
              <span>Launch Now</span>
            </button>
            <button
              type="button"
              onClick={() => setLaunchChoice('Wait')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                launchChoice === 'Wait'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">⏳</span>
              <span>Wait & Refine</span>
            </button>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setPrice2x2Choice('High Price')}
              className={`min-h-[48px] py-1.5 px-2 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                price2x2Choice === 'High Price'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🏷️</span>
              <span>High Price ($4)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrice2x2Choice('Low Price')}
              className={`min-h-[48px] py-1.5 px-2 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                price2x2Choice === 'Low Price'
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">⚡</span>
              <span>Low Price ($3)</span>
            </button>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-3 gap-1.5">
            {(['Monday', 'Wednesday', 'Friday'] as const).map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setTimingChoice(day)}
                className={`min-h-[48px] py-1.5 px-1 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                  timingChoice === day
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-300/60'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
                }`}
              >
                <span>📅</span>
                <span>{day.slice(0, 3)}</span>
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setDeterrenceChoice('Commit')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                deterrenceChoice === 'Commit'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🏰</span>
              <span>Commit</span>
            </button>
            <button
              type="button"
              onClick={() => setDeterrenceChoice('Stay Flexible')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                deterrenceChoice === 'Stay Flexible'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🔄</span>
              <span>Stay Flexible</span>
            </button>
          </div>
        );
      case 7:
        return renderCompactThumbStepper(`Vickrey Bid (Val: $${studentValuation})`, auctionBid, 0, 100, 1, `$${auctionBid}.00`, setAuctionBid);
      case 8:
        return renderCompactThumbStepper(`First-Price Bid (Val: $${studentValuation})`, fpAuctionBid, 0, 100, 0.5, `$${fpAuctionBid.toFixed(2)}`, setFpAuctionBid);
      case 9:
        return renderCompactThumbStepper("Pie Share Demand", pieDemand, 0, 10, 0.5, `$${pieDemand.toFixed(2)}`, setPieDemand);
      case 10:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSignalingChoice('Yes (Costly)')}
              className={`min-h-[48px] py-1.5 px-2 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                signalingChoice === 'Yes (Costly)'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🎓</span>
              <span>Earn Degree</span>
            </button>
            <button
              type="button"
              onClick={() => setSignalingChoice('No')}
              className={`min-h-[48px] py-1.5 px-2 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                signalingChoice === 'No'
                  ? 'bg-slate-700 border-slate-500 text-white shadow-lg ring-2 ring-slate-400/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">💼</span>
              <span>Direct Work</span>
            </button>
          </div>
        );
      case 11:
        return renderCompactThumbStepper("Beauty Contest Guess", beautyGuess, 0, 100, 1, `${beautyGuess}`, setBeautyGuess);
      case 12:
        return renderCompactThumbStepper("Fishery Tokens / Contr", publicGoodsContr, 0, 20, 1, `${publicGoodsContr} pts`, setPublicGoodsContr);
      case 13:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setStagChoice('Stag')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                stagChoice === 'Stag'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🦌</span>
              <span>Hunt Stag</span>
            </button>
            <button
              type="button"
              onClick={() => setStagChoice('Hare')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                stagChoice === 'Hare'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🐇</span>
              <span>Hunt Hare</span>
            </button>
          </div>
        );
      case 14:
        return renderCompactThumbStepper("Price / Gallon", bertrandPrice, 0, 10, 0.25, `$${bertrandPrice.toFixed(2)}`, setBertrandPrice);
      case 15:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setHawkChoice('Dove')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                hawkChoice === 'Dove'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🕊️</span>
              <span>Dove (Share)</span>
            </button>
            <button
              type="button"
              onClick={() => setHawkChoice('Hawk')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                hawkChoice === 'Hawk'
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🦅</span>
              <span>Hawk (Fight)</span>
            </button>
          </div>
        );
      case 16:
        return renderCompactThumbStepper("Offer to Responder", ultimatumOffer, 0, 10, 1, `$${ultimatumOffer}`, setUltimatumOffer);
      case 17:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setPenniesChoice('Heads')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                penniesChoice === 'Heads'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🪙</span>
              <span>Heads</span>
            </button>
            <button
              type="button"
              onClick={() => setPenniesChoice('Tails')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                penniesChoice === 'Tails'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🪙</span>
              <span>Tails</span>
            </button>
          </div>
        );
      case 18:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setBattleChoice('Opera')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                battleChoice === 'Opera'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg ring-2 ring-purple-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🎭</span>
              <span>Opera</span>
            </button>
            <button
              type="button"
              onClick={() => setBattleChoice('Football')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                battleChoice === 'Football'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">⚽</span>
              <span>Football</span>
            </button>
          </div>
        );
      case 19:
        return renderCompactThumbStepper("Trust Transfer", trustInvestment, 0, 10, 1, `$${trustInvestment}`, setTrustInvestment);
      case 20:
        return (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setCentipedeChoice('Pass')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                centipedeChoice === 'Pass'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">➡️</span>
              <span>Pass (Grow Pot)</span>
            </button>
            <button
              type="button"
              onClick={() => setCentipedeChoice('Take')}
              className={`min-h-[48px] py-1.5 px-3 rounded-xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                centipedeChoice === 'Take'
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-300/60'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg">🛑</span>
              <span>Take Pot (Exit)</span>
            </button>
          </div>
        );
      case 21:
        return renderCompactThumbStepper("Production Output", cournotQuantity, 10, 45, 0.5, `${cournotQuantity.toFixed(1)} units`, setCournotQuantity);
      case 22:
        return renderCompactThumbStepper("Beach Stand Location", hotellingLocation, 0, 100, 1, `Pos ${hotellingLocation}`, setHotellingLocation);
      case 23: {
        const blottoSum = blottoA + blottoB + blottoC;
        return (
          <div className="space-y-1 bg-slate-900/95 border border-slate-800 rounded-xl p-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-0.5">
              <span>Allocate 100 Battalions:</span>
              <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded font-black ${
                blottoSum === 100
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}>
                {blottoSum}/100 {blottoSum === 100 ? '✓' : `(${100 - blottoSum > 0 ? `+${100 - blottoSum}` : 100 - blottoSum})`}
              </span>
            </div>
            {/* 3 Fronts in a tight horizontal grid */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'A', val: blottoA, set: setBlottoA },
                { label: 'B', val: blottoB, set: setBlottoB },
                { label: 'C', val: blottoC, set: setBlottoC }
              ].map(f => (
                <div key={f.label} className="bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    disabled={f.val <= 0}
                    onClick={() => f.set(Math.max(0, f.val - 5))}
                    className="w-8 h-9 min-h-[44px] text-lg font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-md flex items-center justify-center shrink-0 disabled:opacity-20 cursor-pointer select-none"
                    aria-label={`Decrease Front ${f.label}`}
                  >
                    −
                  </button>
                  <div className="text-center min-w-0 flex-1">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Front {f.label}</div>
                    <div className="font-mono text-sm font-black text-amber-400 leading-tight">{f.val}</div>
                  </div>
                  <button
                    type="button"
                    disabled={f.val >= 100}
                    onClick={() => f.set(Math.min(100, f.val + 5))}
                    className="w-8 h-9 min-h-[44px] text-lg font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-md flex items-center justify-center shrink-0 disabled:opacity-20 cursor-pointer select-none"
                    aria-label={`Increase Front ${f.label}`}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
            {/* Quick Presets in 2-column stacked layout with >=13px font & >=44px touch targets */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => { setBlottoA(34); setBlottoB(33); setBlottoC(33); }}
                className="min-h-[44px] px-2 py-2 text-[13px] font-bold font-mono bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 rounded-xl border border-slate-700 flex items-center justify-center text-center cursor-pointer select-none active:scale-95 transition-all shadow-xs"
              >
                Balanced 34/33/33
              </button>
              <button
                type="button"
                onClick={() => { setBlottoA(50); setBlottoB(50); setBlottoC(0); }}
                className="min-h-[44px] px-2 py-2 text-[13px] font-bold font-mono bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 rounded-xl border border-slate-700 flex items-center justify-center text-center cursor-pointer select-none active:scale-95 transition-all shadow-xs"
              >
                2-Front 50/50/0
              </button>
              <button
                type="button"
                onClick={() => { setBlottoA(80); setBlottoB(10); setBlottoC(10); }}
                className="min-h-[44px] px-2 py-2 text-[13px] font-bold font-mono bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 rounded-xl border border-slate-700 col-span-2 flex items-center justify-center text-center cursor-pointer select-none active:scale-95 transition-all shadow-xs"
              >
                Blitz 80/10/10
              </button>
            </div>
          </div>
        );
      }
      case 24:
        return renderCompactThumbStepper(`Oil Lease Bid (Est: $${cvPlayerSignal.toFixed(0)})`, cvBid, 10, 100, 1, `$${cvBid.toFixed(2)}`, setCvBid);
      case 25:
        return renderCompactThumbStepper("Dollar Auction Bid", dollarBid, 0.1, 2.5, 0.1, `$${dollarBid.toFixed(2)}`, setDollarBid);
      case 26:
        return renderCompactThumbStepper("Traveler Luggage Claim", travelerClaim, 2, 100, 1, `$${travelerClaim}`, setTravelerClaim);
      case 27:
        return renderCompactThumbStepper("Ocean Trawlers", fisheryEffort, 0, 10, 1, `${fisheryEffort} boats`, setFisheryEffort);
      case 28:
        return renderCompactThumbStepper("Car Offer Price", lemonPrice, 1000, 9000, 250, `$${lemonPrice.toLocaleString()}`, setLemonPrice);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Floating Friendly Completion Toast (Visible on Step 1 or 2; automatically dismissed in Step 3 to prevent overlap with the in-page streak card) */}
      {gameCompletionToast.visible && activeStep !== 3 && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-2 sm:top-3 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300 bg-slate-900/95 box-border"
          style={{
            borderColor: gameCompletionToast.isBestResponse ? '#10b981' : '#6366f1',
            boxShadow: gameCompletionToast.isBestResponse
              ? '0 10px 30px -5px rgba(16, 185, 129, 0.35)'
              : '0 10px 30px -5px rgba(99, 102, 241, 0.35)'
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl sm:text-2xl shrink-0">
              {gameCompletionToast.isBestResponse ? '🔥' : '💡'}
            </span>
            <p className="text-xs sm:text-sm font-black text-white leading-snug break-words">
              {gameCompletionToast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGameCompletionToast(prev => ({ ...prev, visible: false }))}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 text-base font-bold min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Unified Compact Game & Step Control Strip */}
      <div className="w-full max-w-full overflow-hidden bg-slate-900/95 border border-slate-800/90 rounded-2xl px-2 sm:px-3 py-1.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Left: Previous Game Arrow + Current Active Game Info + Switcher */}
        <div className="flex items-center gap-1 sm:gap-2.5 w-full md:w-auto min-w-0 justify-between md:justify-start">
          <button
            type="button"
            onClick={() => {
              const prevIdx = activeModuleIndex > 0 ? activeModuleIndex - 1 : availableModules.length - 1;
              const prevMod = availableModules[prevIdx];
              if (prevMod) {
                handlePlayGame(prevMod.id);
              }
            }}
            aria-label="Previous game"
            className="min-h-[36px] min-w-[36px] w-9 h-9 rounded-xl text-base font-black flex items-center justify-center transition-all cursor-pointer shrink-0 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-700 shadow-sm active:scale-95"
            title="Previous Game"
          >
            <span>←</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 overflow-hidden px-0.5">
            <span className="text-xl sm:text-2xl shrink-0 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {activeModule?.icon || '🎮'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-hidden">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider shrink-0 whitespace-nowrap">
                  G{currentModuleIndex}/{totalModulesCount}
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border hidden sm:inline-block shrink-0 ${
                    activeModule?.difficulty === 'Easy'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : activeModule?.difficulty === 'Medium'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-rose-950 text-rose-300 border-rose-700'
                  }`}
                >
                  {activeModule?.difficulty}
                </span>
                {/* Mastery Streak Compact Chip on Game Selector */}
                <span
                  className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full border inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap ${
                    masteryStreak > 0
                      ? 'bg-amber-950/90 text-amber-300 border-amber-600/80 shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                  }`}
                  title="Mastery Streak: Consecutive games in which you reached the best response"
                >
                  <span className={masteryStreak > 0 ? "animate-pulse" : ""}>🔥</span>
                  <span>{masteryStreak}</span>
                </span>
                {completedGameIds.includes(selectedModuleId) && (
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-1 py-0.2 rounded-full inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                    ✓
                  </span>
                )}
                {bestQuizScores[selectedModuleId] !== undefined && (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.2 rounded-full hidden sm:inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                    🎯 {bestQuizScores[selectedModuleId]}/3
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white truncate leading-tight mt-0.5" title={activeModule?.title}>
                {activeModule?.shortTitle || activeModule?.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsGamePickerExpanded(prev => !prev);
              if (!isGamePickerExpanded) {
                setTimeout(() => {
                  const idx = availableModules.findIndex(m => m.id === selectedModuleId);
                  if (idx >= 0) scrollToCard(idx, false);
                }, 50);
              }
            }}
            className={`min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              isGamePickerExpanded
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isGamePickerExpanded ? "Collapse game picker" : "Browse all game simulations and 8 curriculum tiers"}
          >
            <span className="hidden sm:inline">Games</span>
            {masteryStreak > 0 && <span className="text-[10px] font-mono text-amber-300">🔥{masteryStreak}</span>}
            <span>{isGamePickerExpanded ? '▲' : '▾'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextIdx = activeModuleIndex < availableModules.length - 1 ? activeModuleIndex + 1 : 0;
              const nxtMod = availableModules[nextIdx];
              if (nxtMod) {
                handlePlayGame(nxtMod.id);
              }
            }}
            aria-label="Next game"
            className="min-h-[36px] min-w-[36px] w-9 h-9 rounded-xl text-base font-black flex items-center justify-center transition-all cursor-pointer shrink-0 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-700 shadow-sm active:scale-95"
            title="Next Game"
          >
            <span>→</span>
          </button>
        </div>

        {/* Right: Integrated Step Navigation Tabs */}
        <div className="flex items-center justify-center gap-1 w-full md:w-auto shrink-0 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {[
            { num: 1, label: '1 Rules', icon: '📜' },
            { num: 2, label: '2 Choice', icon: '🎮' },
            { num: 3, label: '3 Result', icon: '🏆', locked: !isRoundResolved },
            { num: 4, label: '4 Theory', icon: '🔍', locked: !isRoundResolved },
            { num: 5, label: '5 Quiz', icon: '⚡', locked: !isRoundResolved }
          ].map(s => {
            const isActive = activeStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (!s.locked) scrollToStep(s.num);
                }}
                disabled={s.locked}
                className={`min-h-[34px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 select-none ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : s.locked
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer'
                }`}
                title={s.locked ? 'Locked until round decision is submitted' : `Switch to Step ${s.num}`}
              >
                <span className="text-xs">{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
                {s.locked && <span className="text-[10px] text-slate-500">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Game Selection Carousel (only when isGamePickerExpanded is true) */}
      {isGamePickerExpanded && (
        /* Expanded Game Selection Carousel */
        <div className="space-y-3 bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-blue-900/40 shadow-2xl">
          {/* Expanded Carousel Toolbar with Close Button */}
          <div className="bg-slate-900/95 border border-slate-800/90 rounded-xl px-3 sm:px-4 py-2 shadow-md flex items-center justify-between gap-2">
            {/* Left: Left Arrow + Compact Game Counter & Completed Badge */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => handleArrowScroll('left')}
                disabled={activeCardIndex <= 0}
                aria-label="Previous game"
                className={`min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl text-xl font-black flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  activeCardIndex <= 0
                    ? 'opacity-25 cursor-not-allowed bg-slate-950 text-slate-600 border border-slate-800/60'
                    : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-700 shadow-sm active:scale-95'
                }`}
              >
                <span>←</span>
              </button>

              <div className="flex items-center gap-2 truncate">
                <span className="text-sm sm:text-base font-black text-white whitespace-nowrap">
                  Game {activeCardIndex + 1} of {totalModulesCount}
                </span>
                <span className="hidden sm:inline-block text-xs font-mono font-bold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/80 shrink-0">
                  {activeCardIndex + 1} / {totalModulesCount}
                </span>
                {completedGameIds.length > 0 && (
                  <span className="hidden md:inline-flex text-[11px] font-mono font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60 items-center gap-1 shrink-0">
                    <span>✓</span>
                    <span>{completedGameIds.length} Done</span>
                  </span>
                )}
                {masteryStreak > 0 && (
                  <span className="hidden sm:inline-flex text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-700/60 items-center gap-1 shrink-0">
                    <span>🔥</span>
                    <span>Streak {masteryStreak}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: 7-Dot Window + Right Arrow + Collapse Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Dots Indicator: 7-dot sliding window */}
              <div className="flex items-center gap-0.5 justify-center">
                {(() => {
                  const WINDOW_SIZE = 7;
                  let startDot = Math.max(0, activeCardIndex - Math.floor(WINDOW_SIZE / 2));
                  let endDot = startDot + WINDOW_SIZE;
                  if (endDot > totalModulesCount) {
                    endDot = totalModulesCount;
                    startDot = Math.max(0, endDot - WINDOW_SIZE);
                  }
                  const visibleIndices = Array.from({ length: endDot - startDot }, (_, k) => startDot + k);

                  return (
                    <>
                      {startDot > 0 && (
                        <button
                          type="button"
                          onClick={() => scrollToCard(0, true)}
                          className="text-[10px] text-slate-500 hover:text-white px-1 py-1 cursor-pointer font-mono font-bold"
                          title="Jump to Game 1"
                        >
                          «
                        </button>
                      )}
                      {visibleIndices.map(i => {
                        const m = availableModules[i];
                        const isCurrent = i === activeCardIndex;
                        const isDone = completedGameIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => scrollToCard(i, true)}
                            aria-label={`Jump to game ${i + 1}: ${m.shortTitle}`}
                            className="min-h-[36px] min-w-[16px] sm:min-w-[18px] px-0.5 py-1 flex items-center justify-center cursor-pointer"
                          >
                            <span
                              className={`transition-all rounded-full block ${
                                isCurrent
                                  ? 'w-5 sm:w-6 h-2 bg-blue-500 shadow-xs'
                                  : isDone
                                  ? 'w-2 h-2 bg-emerald-400/80 hover:bg-emerald-300'
                                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                              }`}
                            />
                          </button>
                        );
                      })}
                      {endDot < totalModulesCount && (
                        <button
                          type="button"
                          onClick={() => scrollToCard(totalModulesCount - 1, true)}
                          className="text-[10px] text-slate-500 hover:text-white px-1 py-1 cursor-pointer font-mono font-bold"
                          title="Jump to Game 20"
                        >
                          »
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() => handleArrowScroll('right')}
                disabled={activeCardIndex >= totalModulesCount - 1}
                aria-label="Next game"
                className={`min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl text-xl font-black flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  activeCardIndex >= totalModulesCount - 1
                    ? 'opacity-25 cursor-not-allowed bg-slate-950 text-slate-600 border border-slate-800/60'
                    : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-700 shadow-sm active:scale-95'
                }`}
              >
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGamePickerExpanded(false)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all ml-1 shrink-0"
                title="Collapse game list"
              >
                <span>▲ Hide List</span>
              </button>
            </div>
          </div>

          {/* View Switcher: 8 Curriculum Tiers vs Horizontal Carousel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setPickerViewMode('tiers')}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none whitespace-nowrap ${
                  pickerViewMode === 'tiers'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>📚 8 Tiers</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-200 border border-blue-700/60">
                  {SOLOLAB_TIERS.filter(t => t.gameIds.every(id => completedGameIds.includes(id))).length}/8
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPickerViewMode('carousel')}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none whitespace-nowrap ${
                  pickerViewMode === 'carousel'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>🎠 Carousel</span>
              </button>
            </div>

            {/* Quick Summary of Progress */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 px-1 justify-between sm:justify-end">
              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/70 border border-amber-700/50 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                <span>🔥</span> {masteryStreak} Streak
              </span>
              <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/70 border border-emerald-700/50 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                <span>✓</span> {completedGameIds.length}/{totalModulesCount} Done
              </span>
            </div>
          </div>

          {/* MODE 1: 8 Tiers Curriculum View (Native Page Flow, No Nested Scroll Traps) */}
          {pickerViewMode === 'tiers' && (
            <div className="space-y-4 pt-1">
              {SOLOLAB_TIERS.map((tier, tierIdx) => {
                const tierBadge = getTierBadge(tier, tierIdx);
                const tierModules = tier.gameIds
                  .map(id => availableModules.find(m => m.id === id))
                  .filter((m): m is NonNullable<typeof m> => Boolean(m));

                return (
                  <div
                    key={tier.tierNumber}
                    className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4.5 space-y-3 shadow-lg"
                  >
                    {/* Tier Header with Tier Badge: locked, in progress (x/y played), or completed */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl sm:text-3xl p-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                          {tier.icon}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                            {tier.tierTitle}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono block truncate">
                            {tier.category} · {tierModules.length} game{tierModules.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Explicit Tier Badge */}
                      <span
                        className={`text-xs sm:text-sm font-black px-3 py-1 rounded-full border self-start sm:self-auto shrink-0 ${tierBadge.badgeClass}`}
                      >
                        {tierBadge.badgeLabel}
                      </span>
                    </div>

                    {/* Games Grid inside this Tier */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tierModules.map(mod => {
                        const isSelected = mod.id === selectedModuleId;
                        const isDone = completedGameIds.includes(mod.id);
                        return (
                          <div
                            key={mod.id}
                            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 ${
                              isSelected
                                ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-950/60 ring-2 ring-blue-500/40 text-white'
                                : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                <span className="text-[11px] font-mono font-bold text-blue-400 uppercase">
                                  Game #{mod.id}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                      mod.difficulty === 'Easy'
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                        : mod.difficulty === 'Medium'
                                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                                        : 'bg-rose-950 text-rose-300 border-rose-700'
                                    }`}
                                  >
                                    {mod.difficulty}
                                  </span>
                                  {isDone && (
                                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/90 border border-emerald-600/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                      ✓ Done
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <span className="text-2xl shrink-0 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                                  {mod.icon}
                                </span>
                                <div className="min-w-0">
                                  <h5 className="text-sm sm:text-base font-black text-white leading-tight">
                                    {mod.title}
                                  </h5>
                                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                                    {mod.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePlayGame(mod.id)}
                              className={`w-full min-h-[48px] py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${
                                isSelected
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                                  : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-700'
                              }`}
                            >
                              <span>{isSelected ? '▶ Resume Playing' : 'Play Game →'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: Horizontal Swipeable Carousel */}
          {pickerViewMode === 'carousel' && (
          <div
            ref={gameCarouselRef}
            onScroll={handleCarouselScroll}
            onWheel={handleCarouselWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="overflow-x-auto flex gap-4 lg:gap-5 p-1 px-3 sm:px-4 pb-4 touch-auto snap-x snap-mandatory scroll-smooth scroll-pl-3 sm:scroll-pl-4 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {availableModules.map((mod, idx) => {
              const isSelected = mod.id === selectedModuleId;
              const isCompleted = completedGameIds.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  data-card-index={idx}
                  className={`w-[85vw] max-w-sm sm:w-[360px] md:w-[380px] lg:w-[400px] xl:w-[410px] shrink-0 snap-start snap-always p-5 lg:p-6 rounded-3xl border-2 transition-all flex flex-col justify-between gap-5 select-none ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 shadow-2xl shadow-blue-950/80 ring-2 ring-blue-500/50 text-white'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Game Number, Difficulty, and Done Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-mono font-bold text-blue-400 uppercase tracking-wider">
                        Game {idx + 1} of {totalModulesCount}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* Difficulty Label */}
                        <span
                          className={`text-xs sm:text-sm font-black px-3 py-1 rounded-full border ${
                            mod.difficulty === 'Easy'
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
                              : mod.difficulty === 'Medium'
                              ? 'bg-amber-950/90 text-amber-300 border-amber-700/80'
                              : 'bg-rose-950/90 text-rose-300 border-rose-700/80'
                          }`}
                        >
                          {mod.difficulty}
                        </span>
                        {/* Done Badge */}
                        {isCompleted && (
                          <span className="text-xs sm:text-sm font-black text-emerald-300 bg-emerald-950/90 border border-emerald-600/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <span>✓</span> Done
                          </span>
                        )}
                        {/* Quiz Best Score Badge */}
                        {bestQuizScores[mod.id] !== undefined && (
                          <span
                            className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                              bestQuizScores[mod.id] === 3
                                ? 'text-emerald-300 bg-emerald-950/90 border-emerald-600/80'
                                : 'text-amber-300 bg-amber-950/90 border-amber-600/80'
                            }`}
                            title={`Best score on Quick Check: ${bestQuizScores[mod.id]}/3`}
                          >
                            <span>🎯</span> Quiz {bestQuizScores[mod.id]}/3
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Game Icon & Name */}
                    <div className="flex items-start gap-3.5">
                      <span className="text-4xl lg:text-5xl shrink-0 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
                        {mod.icon}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl lg:text-[24px] font-black text-white tracking-tight leading-tight">
                          {mod.title}
                        </h3>
                        <div className="text-xs sm:text-sm font-mono text-slate-400 mt-1 truncate">
                          {mod.category}
                        </div>
                      </div>
                    </div>

                    {/* One-line Plain Description */}
                    <p className="text-base sm:text-base lg:text-[17px] text-slate-200 line-clamp-3 leading-relaxed font-normal">
                      {mod.description}
                    </p>
                  </div>

                  {/* Play Game Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (hasDraggedRef.current) {
                        hasDraggedRef.current = false;
                        return;
                      }
                      handlePlayGame(mod.id);
                    }}
                    className={`w-full min-h-[56px] lg:min-h-[62px] py-4 px-6 rounded-2xl font-black text-base sm:text-lg lg:text-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-950/80 ring-2 ring-blue-400/50'
                        : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-700 hover:border-slate-600 shadow-lg'
                    }`}
                  >
                    <span>{isSelected ? '▶ Resume Playing' : 'Play Game →'}</span>
                  </button>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Main Game Arena / Debrief Section */}
      <div ref={arenaRef} className="scroll-mt-4">
      {/* If Experiment Finished: Show Theory Debrief */}
      {isExperimentFinished ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-emerald-400 font-bold text-sm bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-lg font-mono">
                ✓ Game {currentModuleIndex} of {totalModulesCount} Complete
              </span>
              <span className="text-sm text-slate-200">
                You've completed {completedGameIds.length} of {totalModulesCount} games in the Solo Lab suite.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                markGameCompleted(selectedModuleId);
                resetExperiment(undefined, nextModule.id);
              }}
              className="min-h-[56px] px-6 py-3.5 rounded-2xl text-base font-black bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0"
            >
              <span>Proceed to Next Game (#{nextModuleIndex}: {nextModule.shortTitle}) →</span>
            </button>
          </div>
          <TheoryDebrief
            data={debriefData}
            availableBots={activeGameBots}
            onOpenWhatIfSandbox={onOpenWhatIfSandbox}
            onRestartExperiment={() => resetExperiment()}
            onChangeBot={(newBotId) => resetExperiment(newBotId)}
          />
        </div>
      ) : (
        /* Phone-First Step-By-Step Arena with Horizontal Swipe / Scroll-Snap */
        <div className="space-y-2">
          {/* Horizontal Swipeable Container with Scroll-Snap */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-start overflow-x-auto snap-x snap-mandatory scroll-smooth w-full touch-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* ========================================================================= */}
            {/* STEP 1: VERBAL STORY & BRIEFING                                           */}
            {/* ========================================================================= */}
            <div className={`w-full min-w-full shrink-0 snap-center snap-always px-1 sm:px-2 ${activeStep === 2 && !isRoundResolved ? 'max-h-0 lg:max-h-none overflow-hidden' : ''}`}>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-5 shadow-xl space-y-3.5 text-slate-100 max-w-4xl lg:max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                      Game {currentModuleIndex} of {totalModulesCount} · Step 1 of 5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                      {availableModules[activeModuleIndex]?.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {/* Segmented Quick / Full Rules Switcher */}
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          toggleBriefingMode('simple');
                          setIsFullRulesExpanded(false);
                        }}
                        className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          !isFullRulesExpanded
                            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>⚡ Quick</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleBriefingMode('expert');
                          setIsFullRulesExpanded(true);
                        }}
                        className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isFullRulesExpanded
                            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🔬 Full Rules</span>
                      </button>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      {availableModules[activeModuleIndex]?.category}
                    </span>
                  </div>
                </div>

                {(() => {
                  const quickChips = getGameQuickChips(selectedModuleId);
                  const gameStory = getGameStory(selectedModuleId);
                  const simpleRule = renderSimpleRules(selectedModuleId);

                  return (
                    <div className="space-y-4">
                      {/* ========================================================================= */}
                      {/* TOP 3 CHIPS: Your role, Your choices, How you win (Under ~10 words each)   */}
                      {/* ========================================================================= */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                        {/* Chip 1: Your role */}
                        <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-3.5 border border-blue-500/30 flex items-start gap-3 shadow-sm hover:border-blue-500/50 transition-colors">
                          <span className="text-xl sm:text-2xl p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                            🎭
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                              Your role
                            </span>
                            <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                              {quickChips.role}
                            </p>
                          </div>
                        </div>

                        {/* Chip 2: Your choices */}
                        <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-3.5 border border-emerald-500/30 flex items-start gap-3 shadow-sm hover:border-emerald-500/50 transition-colors">
                          <span className="text-xl sm:text-2xl p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                            ⚡
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                              Your choices
                            </span>
                            <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                              {quickChips.choices}
                            </p>
                          </div>
                        </div>

                        {/* Chip 3: How you win */}
                        <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-3.5 border border-amber-500/30 flex items-start gap-3 shadow-sm hover:border-amber-500/50 transition-colors">
                          <span className="text-xl sm:text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                            🏆
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                              How you win
                            </span>
                            <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                              {quickChips.howYouWin}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ========================================================================= */}
                      {/* OPPONENT STRIP & DIRECT CTA BUTTON                                         */}
                      {/* ========================================================================= */}
                      <div className="bg-slate-950/80 rounded-2xl p-3.5 sm:p-4 border border-slate-800 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Active Opponent Info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-2xl sm:text-3xl p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                              {activeBot.avatar}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                                <span>🤝 Counterpart / Opponent</span>
                                <span className="text-slate-500 font-normal">({gameStory.counterpartRole})</span>
                              </div>
                              <div className="text-sm sm:text-base font-black text-white flex items-baseline gap-1.5 flex-wrap">
                                <span className="break-words">{activeBot.name}</span>
                                <span className={`text-xs font-bold ${activeBot.color}`}>· {activeBot.title}</span>
                              </div>
                              <div className="text-xs text-amber-300/90 italic break-words">
                                "{activeBot.tagline}"
                              </div>
                            </div>
                          </div>

                          {/* Opponent Intel & Switcher Controls */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            {/* Strategy Intel Hover/Tap Trigger */}
                            <div className="relative shrink-0" ref={botIntelRef}>
                              <button
                                type="button"
                                onClick={() => setIsBotIntelOpen(prev => !prev)}
                                onMouseEnter={() => setIsBotIntelOpen(true)}
                                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                                  isBotIntelOpen
                                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                                    : 'bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 hover:text-white border-blue-800/70'
                                }`}
                                aria-expanded={isBotIntelOpen}
                                aria-label="View opponent strategy intelligence"
                                title="Preview opponent strategy intelligence"
                              >
                                <span>ⓘ</span>
                                <span>Intel</span>
                              </button>

                              {/* Strategy Intel Popover */}
                              {isBotIntelOpen && (
                                <div
                                  onMouseLeave={() => setIsBotIntelOpen(false)}
                                  className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] p-3.5 bg-slate-900/98 backdrop-blur-md border border-blue-500/50 rounded-2xl shadow-2xl shadow-black/90 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
                                >
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-xl p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
                                        {activeBot.avatar}
                                      </span>
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-white truncate">
                                          {activeBot.name}
                                        </div>
                                        <div className={`text-[10px] font-medium truncate ${activeBot.color}`}>
                                          {activeBot.title}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setIsBotIntelOpen(false)}
                                      className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                                      aria-label="Close intel popover"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  <div className="space-y-1.5 text-xs">
                                    <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">
                                      Strategy Heuristic:
                                    </div>
                                    <p className="text-slate-200 leading-relaxed font-normal bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                                      {getBotStrategySummary(activeBot)}
                                    </p>
                                  </div>

                                  {activeBot.gauges && activeBot.gauges.length > 0 && (
                                    <div className="space-y-1 pt-1 border-t border-slate-800/80">
                                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                                        Behavioral Traits:
                                      </div>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        {activeBot.gauges.slice(0, 2).map((gauge, gIdx) => (
                                          <div key={gIdx} className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800 text-[11px] flex items-center justify-between">
                                            <span className="text-slate-400 truncate">{gauge.label}</span>
                                            <span className={`font-mono font-bold ${gauge.color}`}>{gauge.value}%</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="text-[11px] text-amber-300/90 italic bg-amber-950/20 p-2 rounded-xl border border-amber-900/30">
                                    "{activeBot.tagline}"
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Bot Switcher Trigger */}
                            {activeGameBots.length > 1 && (
                              <div className="relative shrink-0" ref={simpleBotPickerRef}>
                                <button
                                  type="button"
                                  onClick={() => setIsSimpleBotPickerOpen(prev => !prev)}
                                  className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                  aria-expanded={isSimpleBotPickerOpen}
                                  aria-label="Change opponent bot"
                                >
                                  <span>🤖</span>
                                  <span>Change</span>
                                  <span className={`transition-transform duration-200 text-[10px] text-slate-400 ${isSimpleBotPickerOpen ? 'rotate-180' : ''}`}>▼</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isSimpleBotPickerOpen && (
                                  <div className="absolute right-0 top-full mt-2 z-40 w-72 max-w-[calc(100vw-2.5rem)] p-2.5 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl shadow-black/90 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5">
                                      <span>Choose Opponent ({activeGameBots.length})</span>
                                      <button
                                        type="button"
                                        onClick={() => setIsSimpleBotPickerOpen(false)}
                                        className="text-slate-400 hover:text-slate-200 text-xs px-1 cursor-pointer"
                                        aria-label="Close"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
                                      {activeGameBots.map(b => {
                                        const isSelected = activeBot.id === b.id;
                                        return (
                                          <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => {
                                              setSelectedBotId(b.id);
                                              setIsSimpleBotPickerOpen(false);
                                            }}
                                            className={`w-full min-h-[44px] p-2 rounded-xl text-left cursor-pointer transition-all flex items-center gap-2 border ${
                                              isSelected
                                                ? `${b.badgeBg} ${b.badgeBorder} border-blue-500 ring-1 ring-blue-400/50 text-white font-semibold shadow-md`
                                                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                                            }`}
                                          >
                                            <span className="text-xl shrink-0">{b.avatar}</span>
                                            <div className="min-w-0 flex-1">
                                              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                                                <span className="truncate">{b.name}</span>
                                                {isSelected && (
                                                  <span className="text-[9px] bg-blue-500 text-white font-black px-1.5 py-0.2 rounded-full shrink-0">
                                                    Active
                                                  </span>
                                                )}
                                              </div>
                                              <div className={`text-[10px] font-medium truncate ${b.color}`}>
                                                {b.title}
                                              </div>
                                            </div>
                                            {isSelected && (
                                              <span className="text-emerald-400 text-xs font-black shrink-0">✓</span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Primary Big Action Button */}
                        <button
                          type="button"
                          onClick={() => scrollToStep(2)}
                          className="w-full min-h-[56px] py-3.5 px-5 text-base sm:text-lg font-black bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all ring-1 ring-blue-400/40"
                        >
                          <span>Got it! Enter Scenario & Make Your Choice (Step 2) →</span>
                        </button>
                      </div>

                      {/* ========================================================================= */}
                      {/* EXPANDABLE SECTION: 'Background and full rules' (Collapsed by default)     */}
                      {/* ========================================================================= */}
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all">
                        {/* Toggle Header Button: Large tap target >= 52px */}
                        <button
                          type="button"
                          onClick={() => setIsFullRulesExpanded(prev => !prev)}
                          className="w-full min-h-[52px] sm:min-h-[56px] px-4 py-3 bg-slate-950 hover:bg-slate-900 active:bg-slate-900 border-b border-transparent data-[expanded=true]:border-slate-800 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                          data-expanded={isFullRulesExpanded}
                          aria-expanded={isFullRulesExpanded}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg sm:text-xl p-2 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                              📖
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                                <span>Background and full rules</span>
                                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                                  isFullRulesExpanded ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {isFullRulesExpanded ? 'Open' : 'Expand'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {isFullRulesExpanded
                                  ? 'Tap to collapse'
                                  : 'Story setup, point-form details, payoff rules & visualizer'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 hidden sm:inline">
                              {isFullRulesExpanded ? 'Collapse' : 'View full rules'}
                            </span>
                            <span className={`w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold transition-transform duration-200 ${
                              isFullRulesExpanded ? 'rotate-180 bg-blue-600/20 text-blue-400 border-blue-500/30' : ''
                            }`}>
                              ▼
                            </span>
                          </div>
                        </button>

                        {/* Collapsed/Expanded Content */}
                        {isFullRulesExpanded && (
                          <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200 border-t border-slate-800/80">
                            {/* Verbal Story Scenario */}
                            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
                                  <span>📖</span>
                                  <span>The Scenario</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-300 truncate">
                                  {gameStory.title}
                                </span>
                              </div>

                              {gameStory.hook && (
                                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                                  "{gameStory.hook}"
                                </p>
                              )}

                              {/* 3 Point-Form Bullets: Setup, Choices, Stakes */}
                              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                                <li className="flex items-start gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                                  <span className="font-bold text-blue-400 shrink-0 flex items-center gap-1">
                                    <span>📍</span>
                                    <span>Setup:</span>
                                  </span>
                                  <span className="leading-snug text-slate-200">{gameStory.setup}</span>
                                </li>
                                <li className="flex items-start gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                                  <span className="font-bold text-emerald-400 shrink-0 flex items-center gap-1">
                                    <span>⚡</span>
                                    <span>Choices:</span>
                                  </span>
                                  <span className="leading-snug text-slate-200">{gameStory.choices}</span>
                                </li>
                                <li className="flex items-start gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                                  <span className="font-bold text-amber-400 shrink-0 flex items-center gap-1">
                                    <span>⚖️</span>
                                    <span>Stakes:</span>
                                  </span>
                                  <span className="leading-snug text-slate-200">{gameStory.stakesDetail}</span>
                                </li>
                              </ul>
                            </div>

                            {/* Plain-Language Rules & Payoffs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 block">
                                  1. Action Mechanics
                                </span>
                                <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                                  {simpleRule.action}
                                </p>
                              </div>
                              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                                  2. Payoff Calculations
                                </span>
                                <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                                  {simpleRule.payoff}
                                </p>
                              </div>
                            </div>

                            {/* How to Play Bullets */}
                            <div className="bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-800/80 space-y-2">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                📜 Objective & Round Rules
                              </span>
                              <ul className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                                {renderHowToPlayBullets(selectedModuleId)}
                              </ul>
                            </div>

                            {/* Bot Backstory & Detailed Strategy Profile */}
                            <div className="bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                ♟️ Opponent Profile & Strategic Context
                              </span>
                              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40">
                                <span className="font-bold text-blue-300 text-xs uppercase tracking-wider block mb-1">
                                  Strategy Profile:
                                </span>
                                <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
                                  {getBotStrategySummary(activeBot)}
                                </p>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                {activeBot.backstory}
                              </p>
                            </div>

                            {/* Interactive Matrix / Sequential Visualizer */}
                            <div className="pt-2">
                              {[1, 3, 4, 6, 13, 15, 17, 18].includes(selectedModuleId) ? (
                                <InteractiveMatrixVisualizer
                                  gameId={selectedModuleId}
                                  botName={activeBot.name}
                                  botAvatar={activeBot.avatar}
                                  isDollarGame={isDollarGame}
                                />
                              ) : (
                                <SequentialVisualizer
                                  gameId={selectedModuleId}
                                  botName={activeBot.name}
                                  botAvatar={activeBot.avatar}
                                  studentValuation={studentValuation}
                                  botValuation={botValuation}
                                  ultimatumOffer={ultimatumOffer}
                                  trustInvestment={trustInvestment}
                                  auctionBid={selectedModuleId === 8 ? fpAuctionBid : auctionBid}
                                  bertrandPrice={bertrandPrice}
                                  beautyGuess={beautyGuess}
                                  publicGoodsContr={publicGoodsContr}
                                  centipedeNode={centipedeNode}
                                  launchChoice={launchChoice}
                                  deterrenceChoice={deterrenceChoice}
                                  pieDemand={pieDemand}
                                  signalingType={signalingType}
                                  signalingChoice={signalingChoice}
                                  cournotQuantity={cournotQuantity}
                                  botCournotQuantity={activeBot.id === 'cournot_cartel' ? 22.5 : activeBot.id === 'cournot_aggressive' ? 35 : 30}
                                  hotellingLocation={hotellingLocation}
                                  botHotellingLocation={activeBot.id === 'hotelling_pier' ? 15 : activeBot.id === 'hotelling_flank' ? (hotellingLocation < 50 ? 80 : 20) : 50}
                                  blottoAllocations={{ a: blottoA, b: blottoB, c: blottoC }}
                                  botBlottoAllocations={activeBot.id === 'blotto_blitz' || activeBot.id === 'blotto_clausewitz' ? { a: 50, b: 50, c: 0 } : activeBot.id === 'blotto_feint' ? { a: 60, b: 0, c: 40 } : { a: 34, b: 33, c: 33 }}
                                  cvBid={cvBid}
                                  botCvBid={activeBot.id === 'cv_naive' ? cvBotSignal : activeBot.id === 'cv_hubris' ? cvBotSignal + 2 : Math.max(10, cvBotSignal - 6)}
                                  cvTrueValue={cvTrueValue}
                                  cvPlayerSignal={cvPlayerSignal}
                                  cvBotSignal={cvBotSignal}
                                  dollarBid={dollarBid}
                                  botDollarBid={activeBot.id === 'dollar_escalator' ? Math.min(2.0, dollarBid + 0.1) : 0.5}
                                  travelerClaim={travelerClaim}
                                  botTravelerClaim={activeBot.id === 'traveler_undercutter' ? 98 : activeBot.id === 'traveler_rational' ? 2 : 100}
                                  fisheryEffort={fisheryEffort}
                                  botFisheryEffort={activeBot.id === 'fishery_industrialist' ? 8 : activeBot.id === 'fishery_steward' ? 3 : 4}
                                  lemonPrice={lemonPrice}
                                />
                              )}
                            </div>

                            {/* Secondary CTA inside expanded details */}
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => scrollToStep(2)}
                                className="w-full min-h-[52px] sm:min-h-[56px] py-3 px-5 text-base sm:text-lg font-black bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
                              >
                                <span>Continue to Decision Console (Step 2) →</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 2: MAKE YOUR CHOICE (DECISION CONSOLE)                                */}
            {/* ========================================================================= */}
            <div
              className="w-full min-w-full shrink-0 snap-center snap-always px-1 sm:px-2 lg:!pb-0"
              style={{
                paddingBottom: activeStep === 2 && !isRoundResolved && !isGamePickerExpanded ? `${mobileDockHeight + 12}px` : undefined
              }}
            >
              <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 ${activeStep === 2 && !isRoundResolved ? 'pb-2 sm:pb-5 lg:pb-6' : ''} shadow-xl space-y-4 lg:space-y-5 text-slate-100 max-w-4xl lg:max-w-7xl mx-auto`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                      {selectedModuleId === 20
                        ? `Node ${centipedeNode} of 6 Chain · Step 2 of 5`
                        : totalRounds > 1
                        ? `Round ${currentRound} of ${totalRounds} · Step 2 of 5`
                        : `Single-Round Decision · Step 2 of 5`}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                      {selectedModuleId === 20
                        ? `Submit Node ${centipedeNode} Decision`
                        : totalRounds > 1
                        ? `Submit Round ${currentRound} Decision`
                        : `Submit Your Decision`}
                    </h2>
                  </div>

                  {/* Progress dots (only for multi-round games) */}
                  {totalRounds > 1 && (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      {Array.from({ length: totalRounds }).map((_, idx) => {
                        const r = idx + 1;
                        const isDone = r < currentRound || (r === currentRound && isRoundResolved);
                        const isCurrent = r === currentRound && !isRoundResolved;
                        return (
                          <div
                            key={r}
                            className={`h-2.5 rounded-full transition-all ${
                              isDone ? 'w-6 bg-blue-500' : isCurrent ? 'w-8 bg-amber-400 animate-pulse' : 'w-4 bg-slate-800'
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop Cockpit Grid (Zero-Scroll on Desktop, Natural Touch Flow on Mobile) */}
                <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
                  {/* LEFT COLUMN: Bot Opponent Intelligence & Quick Rules Context */}
                  <div className="lg:col-span-5 space-y-3.5">
                    {/* Bot Thought Stream & Opponent Identity Card */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                            {activeBot.avatar}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-white break-words">{activeBot.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/80 shrink-0">
                                Opponent
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 break-words mt-0.5">{activeBot.tagline}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 shrink-0 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/50">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                          Live
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                          💭 Anticipation Stream
                        </span>
                        <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed">
                          "{activeBot.getAnticipationThought(
                            currentRound,
                            history.map(h => ({
                              round: h.round,
                              playerAction: h.playerAction,
                              botAction: h.botAction,
                              playerPayoff: h.playerPayoff,
                              botPayoff: h.botPayoff,
                              playerValuation: h.playerValuation,
                              botValuation: h.botValuation
                            }))
                          )}"
                        </p>
                      </div>
                    </div>

                    {/* Quick Rules & Objective Reference Card */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🎯</span> Quick Rules & Context
                        </span>
                        <button
                          type="button"
                          onClick={() => scrollToStep(1)}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                        >
                          Full Rules →
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
                        <p>
                          <strong className="text-white">Goal: </strong>
                          {activeModule?.description || "Select your best strategic action to maximize your points."}
                        </p>
                        <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-900 flex items-center justify-between">
                          <span>Type: <strong className="text-slate-200">{totalRounds > 1 ? `Repeated (${totalRounds} Rounds)` : 'One-Shot Match'}</strong></span>
                          <span>Difficulty: <strong className="text-slate-200">{activeModule?.difficulty}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Expert Toggle, Action Cards, Payoff Matrix, and Primary Confirm Button */}
                  <div className={`lg:col-span-7 ${!showExpertMatrix && !isBotThinking ? 'hidden lg:block' : ''} ${showExpertMatrix ? 'space-y-3.5' : 'space-y-0 lg:space-y-3.5'}`}>

                  {/* Single Compact Payoff Matrix Switch (Aligned Inline with Action Title - on mobile shown only when matrix is active) */}
                  <div className={`items-center justify-between gap-2 pb-0.5 ${showExpertMatrix ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>Select your strategic action:</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                      <span className="text-xs font-semibold text-slate-300">
                        {showExpertMatrix ? '📐 Full Matrix' : '⚡ Simple View'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showExpertMatrix}
                        onClick={() => setShowExpertMatrix(prev => !prev)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          showExpertMatrix ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                        title={showExpertMatrix ? 'Switch to simplified decision view' : 'Reveal full payoff matrix'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            showExpertMatrix ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                {/* Interactive Controls per Game (Desktop Cockpit View - On Mobile, anchored in bottom Action Dock) */}
                <div className="space-y-4 hidden lg:block">
                  {/* Module 1 & 6: Prisoner's Dilemma */}
                  {(selectedModuleId === 1 || selectedModuleId === 6) && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPdChoice('Cooperate')}
                          className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            pdChoice === 'Cooperate'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">🤝</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Cooperate</div>
                              <div className="text-xs sm:text-sm text-emerald-300 font-bold mt-0.5">
                                {selectedModuleId === 6 ? '+$2.00 if both coop · $0.00 if bot defects' : '+2 pts if both coop · 0 pts if bot defects'}
                              </div>
                              <div className="text-[11px] text-emerald-400/70 font-medium mt-0.5">
                                Mutual win if trusted · Sucker's payoff if betrayed
                              </div>
                            </div>
                          </div>
                          {pdChoice === 'Cooperate' && <span className="text-emerald-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPdChoice('Defect')}
                          className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            pdChoice === 'Defect'
                              ? 'bg-rose-950/70 border-rose-500 text-white shadow-xl ring-2 ring-rose-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">⚔️</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Defect</div>
                              <div className="text-xs sm:text-sm text-rose-300 font-bold mt-0.5">
                                {selectedModuleId === 6 ? '+$3.00 if bot coops · +$1.00 if both defect' : '+3 pts if bot coops · +1 pt if both defect'}
                              </div>
                              <div className="text-[11px] text-rose-400/70 font-medium mt-0.5">
                                Dominant choice (+1 pt higher against any bot move)
                              </div>
                            </div>
                          </div>
                          {pdChoice === 'Defect' && <span className="text-rose-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 13: Stag Hunt */}
                  {selectedModuleId === 13 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">Select your target:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setStagChoice('Stag')}
                          className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            stagChoice === 'Stag'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">🦌</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Hunt Stag</div>
                              <div className="text-xs sm:text-sm text-emerald-300 font-bold mt-0.5">
                                +10 pts if both hunt Stag · 0 pts if bot hunts Hare
                              </div>
                              <div className="text-[11px] text-emerald-400/70 font-medium mt-0.5">
                                Payoff-dominant · Requires mutual trust
                              </div>
                            </div>
                          </div>
                          {stagChoice === 'Stag' && <span className="text-emerald-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setStagChoice('Hare')}
                          className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            stagChoice === 'Hare'
                              ? 'bg-amber-950/70 border-amber-500 text-white shadow-xl ring-2 ring-amber-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">🐇</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Hunt Hare</div>
                              <div className="text-xs sm:text-sm text-amber-300 font-bold mt-0.5">
                                +4 pts guaranteed (regardless of bot move)
                              </div>
                              <div className="text-[11px] text-amber-400/70 font-medium mt-0.5">
                                Risk-dominant · Zero coordination risk
                              </div>
                            </div>
                          </div>
                          {stagChoice === 'Hare' && <span className="text-amber-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 15: Hawk-Dove Brinkmanship */}
                  {selectedModuleId === 15 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">Select your posture:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setHawkChoice('Dove')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            hawkChoice === 'Dove'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🕊️</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Dove (Share)</div>
                              <div className="text-xs sm:text-sm text-emerald-300 font-semibold">+3 pts if both share · 0 if bot fights</div>
                            </div>
                          </div>
                          {hawkChoice === 'Dove' && <span className="text-emerald-400 font-bold text-sm">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setHawkChoice('Hawk')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            hawkChoice === 'Hawk'
                              ? 'bg-rose-950/70 border-rose-500 text-white shadow-xl ring-2 ring-rose-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🦅</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Hawk (Fight)</div>
                              <div className="text-xs sm:text-sm text-rose-300 font-semibold">+6 pts if bot shares · -10 pts collision</div>
                            </div>
                          </div>
                          {hawkChoice === 'Hawk' && <span className="text-rose-400 font-bold text-sm">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 18: Battle of the Sexes */}
                  {selectedModuleId === 18 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">Select your event:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setBattleChoice('Opera')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            battleChoice === 'Opera'
                              ? 'bg-purple-950/70 border-purple-500 text-white shadow-xl ring-2 ring-purple-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">🎭</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Opera</div>
                              <div className="text-xs sm:text-sm text-purple-300 font-bold mt-0.5">
                                +3 pts if bot picks Opera · 0 pts if split
                              </div>
                              <div className="text-[11px] text-purple-400/70 font-medium mt-0.5">
                                Your preferred event · Mutual coordination required
                              </div>
                            </div>
                          </div>
                          {battleChoice === 'Opera' && <span className="text-purple-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setBattleChoice('Football')}
                          className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            battleChoice === 'Football'
                              ? 'bg-amber-950/70 border-amber-500 text-white shadow-xl ring-2 ring-amber-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">⚽</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Football</div>
                              <div className="text-xs sm:text-sm text-amber-300 font-bold mt-0.5">
                                +2 pts if bot picks Football · 0 pts if split
                              </div>
                              <div className="text-[11px] text-amber-400/70 font-medium mt-0.5">
                                Bot's preferred event · Concession prevents 0 pt clash
                              </div>
                            </div>
                          </div>
                          {battleChoice === 'Football' && <span className="text-amber-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 17: Matching Pennies */}
                  {selectedModuleId === 17 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">Select coin face (You are Matcher):</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPenniesChoice('Heads')}
                          className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            penniesChoice === 'Heads'
                              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-xl ring-2 ring-indigo-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">👑</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Heads</div>
                              <div className="text-xs sm:text-sm text-indigo-300 font-bold mt-0.5">
                                +2 pts if bot picks Heads · -2 pts if Tails
                              </div>
                              <div className="text-[11px] text-indigo-400/70 font-medium mt-0.5">
                                Pure conflict zero-sum · Matcher wins on agreement
                              </div>
                            </div>
                          </div>
                          {penniesChoice === 'Heads' && <span className="text-indigo-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPenniesChoice('Tails')}
                          className={`min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            penniesChoice === 'Tails'
                              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-xl ring-2 ring-indigo-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-3xl shrink-0">🪙</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl text-white">Tails</div>
                              <div className="text-xs sm:text-sm text-indigo-300 font-bold mt-0.5">
                                +2 pts if bot picks Tails · -2 pts if Heads
                              </div>
                              <div className="text-[11px] text-indigo-400/70 font-medium mt-0.5">
                                Pure conflict zero-sum · Matcher wins on agreement
                              </div>
                            </div>
                          </div>
                          {penniesChoice === 'Tails' && <span className="text-indigo-400 font-bold text-sm shrink-0">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 20: Centipede Game */}
                  {selectedModuleId === 20 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">Your turn at Node {centipedeNode}:</div>
                      <p className="rounded-xl border border-sky-800/60 bg-sky-950/30 p-3 text-sm text-sky-100 leading-relaxed">
                        <strong>Why these points?</strong> They are fixed example scores, not a pot calculated each turn. Take ends the game with the scores shown. Pass can lead to more points, but lets the bot decide next. For example, Take at Node 1 gives you 2 and the bot 0; if you Pass and the bot Takes at Node 2, you get 1 and the bot gets 4.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setCentipedeChoice('Pass')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            centipedeChoice === 'Pass'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🤝</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Pass (Continue)</div>
                              <div className="text-xs sm:text-sm text-emerald-300 font-semibold">Let the bot play next</div>
                            </div>
                          </div>
                          {centipedeChoice === 'Pass' && <span className="text-emerald-400 font-bold text-sm">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setCentipedeChoice('Take')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            centipedeChoice === 'Take'
                              ? 'bg-rose-950/70 border-rose-500 text-white shadow-xl ring-2 ring-rose-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🛑</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Take (End Match)</div>
                              <div className="text-xs sm:text-sm text-rose-300 font-semibold">
                                Take now: You {centipedeNode === 1 ? 2 : centipedeNode === 3 ? 4 : 6} · Bot {centipedeNode === 1 ? 0 : centipedeNode === 3 ? 2 : 4}
                              </div>
                            </div>
                          </div>
                          {centipedeChoice === 'Take' && <span className="text-rose-400 font-bold text-sm">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 14: Bertrand Price Competition */}
                  {selectedModuleId === 14 && renderThumbSlider({
                    label: "Set Your Product Price ($10 - $50):",
                    value: bertrandPrice,
                    min: 10,
                    max: 50,
                    step: 1,
                    unitPrefix: "$",
                    unitSuffix: ".00",
                    benchmarks: [
                      { label: "$10 (MC)", val: 10 },
                      { label: "$25 (Mid)", val: 25 },
                      { label: "$39 (Undercut)", val: 39 },
                      { label: "$40 (Monopoly)", val: 40 },
                      { label: "$50 (Max)", val: 50 }
                    ],
                    subtext: "💡 Pricing Rule: Undercutting your rival by $1 wins 100% of demand. If both price at cost ($10), profits drop to $0!",
                    onChange: setBertrandPrice
                  })}

                  {/* Module 7: Vickrey Auction */}
                  {selectedModuleId === 7 && renderThumbSlider({
                    label: `Your Sealed Bid (Private Value: $${studentValuation}.00):`,
                    value: auctionBid,
                    min: 0,
                    max: 12,
                    step: 0.5,
                    unitPrefix: "$",
                    unitSuffix: ".00",
                    benchmarks: [
                      { label: "$0 (Free)", val: 0 },
                      { label: `True Value ($${studentValuation})`, val: studentValuation },
                      { label: "$12 (Max)", val: 12 }
                    ],
                    subtext: `💡 Vickrey Rule: Highest bidder wins and pays 2nd-highest bid. Bidding your true value ($${studentValuation}.00) is weakly dominant!`,
                    onChange: setAuctionBid
                  })}

                  {/* Module 11: Keynesian Beauty Contest */}
                  {selectedModuleId === 11 && renderThumbSlider({
                    label: "Your Integer Guess (0 to 100):",
                    value: beautyGuess,
                    min: 0,
                    max: 100,
                    step: 1,
                    displayValue: `${beautyGuess}`,
                    benchmarks: [
                      { label: "0 (Nash)", val: 0 },
                      { label: "22 (Level 2)", val: 22 },
                      { label: "33 (Level 1)", val: 33 },
                      { label: "50 (Level 0)", val: 50 },
                      { label: "100 (Max)", val: 100 }
                    ],
                    subtext: "💡 Rule: Target is 2/3 of average. Anticipate how many reasoning steps competitors will take!",
                    onChange: setBeautyGuess
                  })}

                  {/* Module 12: Tragedy of the Commons & Renewable Coastal Fishery */}
                  {selectedModuleId === 12 && (
                    <div className="space-y-3.5">
                      {/* Theme Toggle Strip */}
                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pl-1">
                          Scenario Theme:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setIsFisheryView(true)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                              isFisheryView
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>🐟</span>
                            <span>Coastal Fishery (Ecology)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFisheryView(false)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                              !isFisheryView
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>🪙</span>
                            <span>Tokens View (Abstract)</span>
                          </button>
                        </div>
                      </div>

                      {isFisheryView ? (
                        <div className="space-y-3 bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-cyan-900/60 shadow-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div>
                              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                                🌊 Common Pool Fishery Stock Simulator
                              </span>
                              <div className="text-sm font-semibold text-slate-200 mt-0.5">
                                Assigned Conservation Fleet: <strong className="text-cyan-300">{publicGoodsContr} / 20 trawlers</strong>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border self-start sm:self-auto ${
                              publicGoodsContr < 6
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                : publicGoodsContr < 15
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            }`}>
                              {publicGoodsContr < 6
                                ? '⚠️ Overfished Biomass'
                                : publicGoodsContr < 15
                                ? '⚖️ Moderately Harvested'
                                : '🌿 Thriving Marine Reserve'}
                            </span>
                          </div>

                          {renderThumbSlider({
                            label: "Trawlers Assigned to Conservation Reserve (0 to 20):",
                            value: publicGoodsContr,
                            min: 0,
                            max: 20,
                            step: 1,
                            displayValue: `${publicGoodsContr} Boats Conserving (${20 - publicGoodsContr} Harvested Privately)`,
                            benchmarks: [
                              { label: "0 (Deplete Stock)", val: 0 },
                              { label: "5 (Heavy Catch)", val: 5 },
                              { label: "10 (Quota)", val: 10 },
                              { label: "15 (Protective)", val: 15 },
                              { label: "20 (Max Sustainable)", val: 20 }
                            ],
                            subtext: "💡 Marine Stock Dynamics: Conserved breeding fish multiply by 1.6x, producing +0.80 pts of seafood for both fleets per boat conserved. Privatizing trawlers keeps +1.00 pt of private catch for yourself, but drives aggregate fishery stock toward extinction.",
                            onChange: setPublicGoodsContr
                          })}
                        </div>
                      ) : (
                        renderThumbSlider({
                          label: "Tokens Contributed to Public Pool (0 to 20):",
                          value: publicGoodsContr,
                          min: 0,
                          max: 20,
                          step: 1,
                          displayValue: `${publicGoodsContr} / 20 Tokens`,
                          benchmarks: [
                            { label: "0 (Free-Ride)", val: 0 },
                            { label: "5 (Low)", val: 5 },
                            { label: "10 (Half)", val: 10 },
                            { label: "15 (High)", val: 15 },
                            { label: "20 (Social Max)", val: 20 }
                          ],
                          subtext: `💡 Pool returns 0.80 pts/token to each person. You keep ${20 - publicGoodsContr} private tokens (+1 pt each).`,
                          onChange: setPublicGoodsContr
                        })
                      )}
                    </div>
                  )}

                  {/* Module 2: Launch-or-Wait (Sequential Entry) */}
                  {selectedModuleId === 2 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">As First Mover, select your action:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setLaunchChoice('Launch')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            launchChoice === 'Launch'
                              ? 'bg-blue-950/70 border-blue-500 text-white shadow-xl ring-2 ring-blue-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🚀</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Launch Early</div>
                              <div className="text-xs sm:text-sm text-blue-300 font-semibold">+4 pts if rival stays out · +2 pts duopoly</div>
                            </div>
                          </div>
                          {launchChoice === 'Launch' && <span className="text-blue-400 font-bold text-sm">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setLaunchChoice('Wait')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            launchChoice === 'Wait'
                              ? 'bg-amber-950/70 border-amber-500 text-white shadow-xl ring-2 ring-amber-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">⏳</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Wait & See</div>
                              <div className="text-xs sm:text-sm text-amber-300 font-semibold">+1 pt if rival enters · 0 pts if both wait</div>
                            </div>
                          </div>
                          {launchChoice === 'Wait' && <span className="text-amber-400 font-bold text-sm">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 3: Simultaneous Price Competition (Bertrand 2x2) */}
                  {selectedModuleId === 3 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">Select your price tier:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPrice2x2Choice('High Price')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            price2x2Choice === 'High Price'
                              ? 'bg-blue-950/70 border-blue-500 text-white shadow-xl ring-2 ring-blue-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🏷️</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">High Price</div>
                              <div className="text-xs sm:text-sm text-blue-300 font-semibold">+2 pts if both high · 0 pts if undercut</div>
                            </div>
                          </div>
                          {price2x2Choice === 'High Price' && <span className="text-blue-400 font-bold text-sm">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPrice2x2Choice('Low Price')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            price2x2Choice === 'Low Price'
                              ? 'bg-amber-950/70 border-amber-500 text-white shadow-xl ring-2 ring-amber-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">⚡</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Low Price</div>
                              <div className="text-xs sm:text-sm text-amber-300 font-semibold">+3 pts if you undercut · +1 pt if both low</div>
                            </div>
                          </div>
                          {price2x2Choice === 'Low Price' && <span className="text-amber-400 font-bold text-sm">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 4: Promotion Timing (3x3 Mixed Strategy) */}
                  {selectedModuleId === 4 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">Choose your promotional sale launch day:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['Monday', 'Wednesday', 'Friday'] as const).map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setTimingChoice(day)}
                            className={`min-h-[64px] p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                              timingChoice === day
                                ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-xl ring-2 ring-indigo-400/50'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <span className="text-2xl">📅</span>
                            <div className="font-black text-base sm:text-lg">{day}</div>
                            <div className="text-[11px] text-slate-400 font-semibold">+1 pt if unique · 0 if clash</div>
                            {timingChoice === day && <span className="text-indigo-400 font-bold text-xs">✓ Selected</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Module 5: Entry Deterrence & Strategic Commitment */}
                  {selectedModuleId === 5 && (
                    <div className="space-y-3">
                      <div className="text-base font-bold text-white">As Incumbent, select your capacity strategy:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setDeterrenceChoice('Commit')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            deterrenceChoice === 'Commit'
                              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-xl ring-2 ring-indigo-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🏰</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Commit Capacity</div>
                              <div className="text-xs sm:text-sm text-indigo-300 font-semibold">+4 pts if rival stays out · -2 pts price war</div>
                            </div>
                          </div>
                          {deterrenceChoice === 'Commit' && <span className="text-indigo-400 font-bold text-sm">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeterrenceChoice('Stay Flexible')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            deterrenceChoice === 'Stay Flexible'
                              ? 'bg-amber-950/70 border-amber-500 text-white shadow-xl ring-2 ring-amber-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🔄</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Stay Flexible</div>
                              <div className="text-xs sm:text-sm text-amber-300 font-semibold">+2 pts shared duopoly · +4 pts if rival stays out</div>
                            </div>
                          </div>
                          {deterrenceChoice === 'Stay Flexible' && <span className="text-amber-400 font-bold text-sm">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 8: First-Price Sealed-Bid Auction */}
                  {selectedModuleId === 8 && renderThumbSlider({
                    label: `Your Sealed Bid (Private Value: $${studentValuation}.00):`,
                    value: fpAuctionBid,
                    min: 0,
                    max: 12,
                    step: 0.5,
                    unitPrefix: "$",
                    unitSuffix: ".00",
                    benchmarks: [
                      { label: "$0 (Free)", val: 0 },
                      { label: `Nash ($${(studentValuation / 2).toFixed(1)})`, val: Math.round((studentValuation / 2) * 10) / 10 },
                      { label: `True Value ($${studentValuation})`, val: studentValuation },
                      { label: "$12 (Max)", val: 12 }
                    ],
                    subtext: `💡 First-Price Rule: Highest bidder wins and pays their OWN bid! Profit = Valuation - Bid. Shading toward v/2 ($${(studentValuation / 2).toFixed(1)}) balances win odds against profit margin.`,
                    onChange: setFpAuctionBid
                  })}

                  {/* Module 9: Split-the-Pie Bargaining (Demand Game with Outside Options) */}
                  {selectedModuleId === 9 && renderThumbSlider({
                    label: "Demand Your Share from 10 Points:",
                    value: pieDemand,
                    min: 0,
                    max: 10,
                    step: 0.5,
                    displayValue: `${pieDemand.toFixed(1)} pts Demanded (Bot gets ${(10 - pieDemand).toFixed(1)} if compatible)`,
                    benchmarks: [
                      { label: "3.5 pts (Accommodating)", val: 3.5 },
                      { label: "5.0 pts (50/50 Focal)", val: 5.0 },
                      { label: "6.5 pts (Firm)", val: 6.5 },
                      { label: "8.0 pts (Aggressive)", val: 8.0 }
                    ],
                    subtext: "💡 Demand Rule: If Demands sum ≤ 10 pts, both get what they demanded. If Demands sum > 10 pts, negotiations collapse to Outside Options (+1 pt each)!",
                    onChange: setPieDemand
                  })}

                  {/* Module 10: Costly Signaling & Asymmetric Information (Spence) */}
                  {selectedModuleId === 10 && (
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Your Assigned Seller Type</span>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                            signalingType === 'High Quality'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border-amber-700'
                          }`}>
                            {signalingType === 'High Quality' ? '💎 High Quality Product' : '🍋 Low Quality Lemon'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {signalingType === 'High Quality'
                            ? 'Verification cost: 2 pts (Cost is low because your product easily passes audit). Revenue from Trust: 10 pts.'
                            : 'Verification cost: 5 pts (Cost is high because falsifying tests is prohibitive). Revenue from Trust: 10 pts.'}
                        </p>
                      </div>

                      <div className="text-base font-bold text-white">Do you want to send a costly verified warranty signal?</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSignalingChoice('Yes (Costly)')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            signalingChoice === 'Yes (Costly)'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🔬</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">Send Costly Signal</div>
                              <div className="text-xs sm:text-sm text-emerald-300 font-semibold">
                                Cost: -{signalingType === 'High Quality' ? 2 : 5} pts · Signal authentic quality
                              </div>
                            </div>
                          </div>
                          {signalingChoice === 'Yes (Costly)' && <span className="text-emerald-400 font-bold text-sm">✓ Selected</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSignalingChoice('No')}
                          className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl border-2 text-left sm:text-center transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-3 ${
                            signalingChoice === 'No'
                              ? 'bg-amber-950/70 border-amber-500 text-white shadow-xl ring-2 ring-amber-400/50'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">🤐</span>
                            <div>
                              <div className="font-black text-lg sm:text-xl">No Signal (Free)</div>
                              <div className="text-xs sm:text-sm text-amber-300 font-semibold">
                                Cost: 0 pts · Risk being lumped with lemons
                              </div>
                            </div>
                          </div>
                          {signalingChoice === 'No' && <span className="text-amber-400 font-bold text-sm">✓ Selected</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 16: Ultimatum Bargaining */}
                  {selectedModuleId === 16 && renderThumbSlider({
                    label: "Propose Responder Split from $10.00 Pie:",
                    value: ultimatumOffer,
                    min: 0,
                    max: 10,
                    step: 0.5,
                    displayValue: `$${ultimatumOffer.toFixed(2)} to Bot (You Keep $${(10 - ultimatumOffer).toFixed(2)})`,
                    benchmarks: [
                      { label: "$1.00 (SPNE)", val: 1.0 },
                      { label: "$3.00 (Min Human)", val: 3.0 },
                      { label: "$5.00 (50/50)", val: 5.0 },
                      { label: "$10.00 (All)", val: 10.0 }
                    ],
                    subtext: "💡 Bargaining Rule: If bot accepts, both get the proposed split. If rejected, both get $0.00!",
                    onChange: setUltimatumOffer
                  })}

                  {/* Module 19: The Trust Game */}
                  {selectedModuleId === 19 && renderThumbSlider({
                    label: "Points Transferred to Trustee (0 to 10 pts):",
                    value: trustInvestment,
                    min: 0,
                    max: 10,
                    step: 1,
                    displayValue: `${trustInvestment} pts (Tripled to ${trustInvestment * 3} pts)`,
                    benchmarks: [
                      { label: "0 pts (SPNE Safe)", val: 0 },
                      { label: "3 pts (Test)", val: 3 },
                      { label: "5 pts (Half)", val: 5 },
                      { label: "10 pts (Social Max 30)", val: 10 }
                    ],
                    subtext: `💡 Transferred points triple (3x). You keep ${10 - trustInvestment} pts in your private vault plus whatever the trustee returns.`,
                    onChange: setTrustInvestment
                  })}

                  {/* Module 21: Cournot Duopoly Competition */}
                  {selectedModuleId === 21 && renderThumbSlider({
                    label: "Choose Production Output (q):",
                    value: cournotQuantity,
                    min: 10,
                    max: 45,
                    step: 0.5,
                    unitSuffix: " units",
                    displayValue: `${cournotQuantity.toFixed(1)} units`,
                    benchmarks: [
                      { label: "22.5 (Cartel)", val: 22.5 },
                      { label: "30.0 (Nash)", val: 30.0 },
                      { label: "33.8 (Defect)", val: 33.8 },
                      { label: "45.0 (Comp)", val: 45.0 }
                    ],
                    subtext: `💡 Cournot Duopoly Economics: Market demand price is P = max(0, 100 - (q_you + q_bot)) with $10 marginal cost. Symmetrical Nash equilibrium is 30 units each (Market P = $40, Profit = $9.00). Collusive Cartel output is 22.5 units each (Market P = $55, Profit = $10.13). Producing above 30 drives down market price for both sellers.`,
                    onChange: setCournotQuantity
                  })}

                  {/* Module 22: Hotelling's Spatial Competition */}
                  {selectedModuleId === 22 && (
                    <div className="space-y-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <span className="text-base sm:text-lg font-bold text-white block">
                            Boardwalk Stand Placement (0 to 100):
                          </span>
                          <span className="text-xs text-slate-400">
                            100 beachgoers distributed uniformly along the boardwalk
                          </span>
                        </div>
                        <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400">
                          Pos {hotellingLocation}
                        </span>
                      </div>

                      {/* Visual Boardwalk Beach Graphic */}
                      <div className="relative pt-6 pb-2">
                        {/* Track Bar */}
                        <div className="h-6 w-full bg-gradient-to-r from-amber-700 via-amber-200 to-amber-700 rounded-xl relative overflow-hidden border border-amber-600/60 shadow-inner flex items-center justify-between px-3 text-[10px] font-mono font-bold text-amber-950 select-none">
                          <span>0 Pier West</span>
                          <span>25</span>
                          <span>50 Center</span>
                          <span>75</span>
                          <span>100 Pier East</span>
                        </div>

                        {/* Stand Pin Indicator */}
                        <div
                          className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-100 pointer-events-none"
                          style={{ left: `${Math.max(4, Math.min(96, hotellingLocation))}%` }}
                        >
                          <span className="text-2xl drop-shadow-md animate-bounce">🏖️</span>
                          <span className="text-[10px] font-mono font-black bg-blue-600 text-white px-1.5 py-0.2 rounded-full shadow border border-blue-400">
                            You: {hotellingLocation}
                          </span>
                        </div>
                      </div>

                      {/* Stepper + Slider Row */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setHotellingLocation(prev => Math.max(0, prev - 1))}
                          disabled={hotellingLocation <= 0}
                          aria-label="Move stand west"
                          className="w-14 h-14 min-w-[56px] min-h-[56px] text-3xl font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl border border-slate-700 flex items-center justify-center cursor-pointer transition-all select-none shadow-md"
                        >
                          ←
                        </button>

                        <div className="flex-1 relative flex items-center py-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={hotellingLocation}
                            onChange={(e) => setHotellingLocation(parseInt(e.target.value, 10))}
                            aria-label="Boardwalk Stand Placement"
                            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setHotellingLocation(prev => Math.min(100, prev + 1))}
                          disabled={hotellingLocation >= 100}
                          aria-label="Move stand east"
                          className="w-14 h-14 min-w-[56px] min-h-[56px] text-3xl font-black bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl border border-slate-700 flex items-center justify-center cursor-pointer transition-all select-none shadow-md"
                        >
                          →
                        </button>
                      </div>

                      {/* Strategic Benchmarks */}
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono text-slate-400 self-center">Presets:</span>
                        {[
                          { label: "Pos 25 (Quartile)", val: 25 },
                          { label: "Pos 50 (Median Nash)", val: 50 },
                          { label: "Pos 75 (Quartile)", val: 75 }
                        ].map((b, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setHotellingLocation(b.val)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                              hotellingLocation === b.val
                                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        💡 <strong className="text-amber-300">Hotelling's Law:</strong> Bathers patronize the vendor closest to their beach towel. If your rival is at Pos 40, placing your stand at Pos 41 captures 59% of the beach. In equilibrium, both vendors cluster at the median center (Pos 50).
                      </p>
                    </div>
                  )}

                  {/* Module 23: Colonel Blotto Resource War */}
                  {selectedModuleId === 23 && (() => {
                    const blottoSum = blottoA + blottoB + blottoC;
                    const diff = 100 - blottoSum;

                    const handleBlottoPreset = (a: number, b: number, c: number) => {
                      setBlottoA(a);
                      setBlottoB(b);
                      setBlottoC(c);
                    };

                    const handleAutoBalance = () => {
                      if (blottoA + blottoB > 100) {
                        setBlottoA(50);
                        setBlottoB(50);
                        setBlottoC(0);
                      } else {
                        setBlottoC(Math.max(0, 100 - blottoA - blottoB));
                      }
                    };

                    return (
                      <div className="space-y-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <span className="text-base sm:text-lg font-bold text-white block">
                              Allocate 100 Battalions Across 3 Fronts:
                            </span>
                            <span className="text-xs text-slate-400">
                              Win at least 2 of 3 battlefront passes to conquer territory
                            </span>
                          </div>
                          <div className={`font-mono text-xl sm:text-2xl font-black px-3 py-1 rounded-xl border flex items-center gap-2 ${
                            blottoSum === 100
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                              : 'bg-rose-950/60 text-rose-300 border-rose-700'
                          }`}>
                            <span>{blottoSum}/100</span>
                            {blottoSum === 100 ? (
                              <span className="text-xs text-emerald-400 font-bold">✓ Ready</span>
                            ) : (
                              <span className="text-xs text-rose-400 font-bold">{diff > 0 ? `${diff} unassigned` : `${Math.abs(diff)} over`}</span>
                            )}
                          </div>
                        </div>

                        {/* Front 3 Sliders */}
                        <div className="space-y-3 pt-1">
                          {/* Front A */}
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>🏔️</span> Pass A (Northern Defile):
                              </span>
                              <span className="font-mono text-sm font-black text-blue-400">{blottoA} Battalions</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={blottoA}
                              onChange={(e) => setBlottoA(parseInt(e.target.value, 10))}
                              aria-label="Battalions for Pass A"
                              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                            />
                          </div>

                          {/* Front B */}
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>🌊</span> Pass B (Central River Valley):
                              </span>
                              <span className="font-mono text-sm font-black text-amber-400">{blottoB} Battalions</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={blottoB}
                              onChange={(e) => setBlottoB(parseInt(e.target.value, 10))}
                              aria-label="Battalions for Pass B"
                              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                            />
                          </div>

                          {/* Front C */}
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>🏰</span> Pass C (Southern Fortress):
                              </span>
                              <span className="font-mono text-sm font-black text-purple-400">{blottoC} Battalions</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={blottoC}
                              onChange={(e) => setBlottoC(parseInt(e.target.value, 10))}
                              aria-label="Battalions for Pass C"
                              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Presets & Auto-Balance Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleBlottoPreset(34, 33, 33)}
                              className="min-h-[44px] px-3 py-2 text-[13px] sm:text-xs font-bold font-mono bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center text-center cursor-pointer transition-colors shadow-xs"
                            >
                              Symmetric (34/33/33)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBlottoPreset(50, 50, 0)}
                              className="min-h-[44px] px-3 py-2 text-[13px] sm:text-xs font-bold font-mono bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center text-center cursor-pointer transition-colors shadow-xs"
                            >
                              Blitzkrieg (50/50/0)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBlottoPreset(60, 0, 40)}
                              className="min-h-[44px] px-3 py-2 text-[13px] sm:text-xs font-bold font-mono bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 col-span-2 sm:col-span-1 flex items-center justify-center text-center cursor-pointer transition-colors shadow-xs"
                            >
                              Flank Feint (60/0/40)
                            </button>
                          </div>

                          {blottoSum !== 100 && (
                            <button
                              type="button"
                              onClick={handleAutoBalance}
                              className="min-h-[44px] px-4 py-2 text-[13px] sm:text-xs font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl cursor-pointer shadow-md flex items-center justify-center w-full sm:w-auto shrink-0"
                            >
                              Auto-Balance to 100
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          💡 <strong className="text-amber-300">Blotto Zero-Sum Paradox:</strong> There is no pure-strategy equilibrium. Symmetrically defending (34/33/33) is crushed by an opponent sacrificing one pass (0 troops) to overwhelm the other two with 50 battalions each.
                        </p>
                      </div>
                    );
                  })()}

                  {/* Module 24: Common-Value Oil Lease Auction & Winner's Curse */}
                  {selectedModuleId === 24 && (
                    <div className="space-y-4">
                      {/* Private Acoustic Survey Report Box */}
                      <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-amber-600/50 shadow-lg space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span>📡</span> Seismic Exploration Sonar Report
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            True Value V ~ Uniform[$20, $80]
                          </span>
                        </div>
                        <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/40 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-amber-200/80 block">Your Private Acoustic Signal (Estimate):</span>
                            <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300">
                              ${cvPlayerSignal.toFixed(2)} / barrel
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-300 text-right max-w-[140px]">
                            Signal noise error: ±$10.00 from true unknown reserve value
                          </span>
                        </div>
                      </div>

                      {renderThumbSlider({
                        label: "Submit Your Sealed Bid for the Lease:",
                        value: cvBid,
                        min: 10,
                        max: 90,
                        step: 0.5,
                        unitPrefix: "$",
                        unitSuffix: ".00",
                        benchmarks: [
                          { label: `Deep Shade ($${Math.max(10, cvPlayerSignal - 10)})`, val: Math.max(10, cvPlayerSignal - 10) },
                          { label: `Bayesian ($${Math.max(10, cvPlayerSignal - 6)})`, val: Math.max(10, cvPlayerSignal - 6) },
                          { label: `Naive ($${cvPlayerSignal})`, val: cvPlayerSignal }
                        ],
                        subtext: `💡 The Winner's Curse: In common-value auctions, the highest bidder usually had the most optimistic error! If you bid your signal of $${cvPlayerSignal.toFixed(2)}, winning proves your survey was higher than your rival's, almost guaranteeing a financial loss. Shading downward by at least $6.00 ($${Math.max(10, cvPlayerSignal - 6)}.00) protects your expected margin.`,
                        onChange: setCvBid
                      })}
                    </div>
                  )}

                  {/* Module 25: The Escalating Dollar Auction */}
                  {selectedModuleId === 25 && (
                    <div className="space-y-4">
                      {renderThumbSlider({
                        label: "Submit Your Bid for the $1.00 Bill ($0.10 to $2.50):",
                        value: dollarBid,
                        min: 0.10,
                        max: 2.50,
                        step: 0.10,
                        unitPrefix: "$",
                        benchmarks: [
                          { label: "$0.20 (Penny)", val: 0.20 },
                          { label: "$0.60 (Disciplined)", val: 0.60 },
                          { label: "$1.00 (Break-Even)", val: 1.00 },
                          { label: "$1.50 (Escalated)", val: 1.50 },
                          { label: "$2.50 (Max Loss)", val: 2.50 }
                        ],
                        subtext: "💡 Sunk Cost Trap Rule: The highest bidder wins the $1 bill, but BOTH 1st and 2nd place bidders must pay their bids! If rival bids $0.90, folding loses your past bid while bidding $1.00 breaks even. Once bids cross $1.00, bidders escalate to minimize losses.",
                        onChange: setDollarBid
                      })}
                    </div>
                  )}

                  {/* Module 26: Traveler's Dilemma */}
                  {selectedModuleId === 26 && (
                    <div className="space-y-4">
                      {renderThumbSlider({
                        label: "Write Your Baggage Claim ($2 to $100):",
                        value: travelerClaim,
                        min: 2,
                        max: 100,
                        step: 1,
                        unitPrefix: "$",
                        benchmarks: [
                          { label: "$2 (Strict SPNE)", val: 2 },
                          { label: "$50 (Mid)", val: 50 },
                          { label: "$98 (Bonus Hunter)", val: 98 },
                          { label: "$100 (Cooperative Max)", val: 100 }
                        ],
                        subtext: "💡 Basu Reimbursement Rule: Airline reimburses min(claim1, claim2). Lower claim receives a +$2 reward bonus; higher claim receives a -$2 penalty. Iterated elimination of dominated strategies collapses to $2, yet humans coordinate on $98-$100!",
                        onChange: setTravelerClaim
                      })}
                    </div>
                  )}

                  {/* Module 27: Renewable Ocean Fishery (Ostrom Commons) */}
                  {selectedModuleId === 27 && (
                    <div className="space-y-4">
                      {renderThumbSlider({
                        label: "Deploy Trawlers to Ocean Fishery (0 to 10 boats):",
                        value: fisheryEffort,
                        min: 0,
                        max: 10,
                        step: 1,
                        displayValue: `${fisheryEffort} Trawlers`,
                        benchmarks: [
                          { label: "0 (Rest)", val: 0 },
                          { label: "3 (MSY Steward)", val: 3 },
                          { label: "4 (Fair Quota)", val: 4 },
                          { label: "7 (Intensive)", val: 7 },
                          { label: "10 (Deplete Stock)", val: 10 }
                        ],
                        subtext: "💡 Bioeconomic Commons Rule: Ocean fish reproduce naturally, but total effort above 12 boats crashes breeding biomass, collapsing catch profit from +3.5 to +1.0 pt/boat. Optimal sustainable quota is 3-4 boats each.",
                        onChange: setFisheryEffort
                      })}
                    </div>
                  )}

                  {/* Module 28: Market for Lemons (Akerlof Adverse Selection) */}
                  {selectedModuleId === 28 && (
                    <div className="space-y-4">
                      {renderThumbSlider({
                        label: "Submit Purchase Offer for Used Car ($1,000 to $9,000):",
                        value: lemonPrice,
                        min: 1000,
                        max: 9000,
                        step: 250,
                        unitPrefix: "$",
                        benchmarks: [
                          { label: "$2,500 (Lemon Floor)", val: 2500 },
                          { label: "$5,000 (Average Pool)", val: 5000 },
                          { label: "$7,500 (Peach Price)", val: 7500 },
                          { label: "$9,000 (Premium)", val: 9000 }
                        ],
                        subtext: "💡 Akerlof Adverse Selection Rule: Sellers know whether their car is a $2,200 lemon or a $7,500 peach. If you offer less than $7,500, peach owners withdraw from the market, leaving you with only defective lemons!",
                        onChange: setLemonPrice
                      })}
                    </div>
                  )}
                </div>

                {/* Live Interactive Payoff Matrix / Visualizer for Selected Move (Expert Mode) */}
                {showExpertMatrix && (
                  <div className="pt-1">
                    <div className="bg-slate-950/90 rounded-2xl border border-indigo-900/50 overflow-hidden shadow-xl shadow-indigo-950/20 animate-in fade-in duration-200">
                      {/* Full Matrix / Visualizer */}
                      <div className="p-3 sm:p-4 bg-slate-950/60">
                        {[1, 3, 4, 6, 13, 15, 17, 18].includes(selectedModuleId) ? (
                          <InteractiveMatrixVisualizer
                            gameId={selectedModuleId}
                            botName={activeBot.name}
                            botAvatar={activeBot.avatar}
                            selectedPlayerAction={getSelectedActionForGame()}
                            isDollarGame={isDollarGame}
                          />
                        ) : (
                          <SequentialVisualizer
                            gameId={selectedModuleId}
                            botName={activeBot.name}
                            botAvatar={activeBot.avatar}
                            studentValuation={studentValuation}
                            botValuation={botValuation}
                            ultimatumOffer={ultimatumOffer}
                            trustInvestment={trustInvestment}
                            auctionBid={selectedModuleId === 8 ? fpAuctionBid : auctionBid}
                            bertrandPrice={bertrandPrice}
                            beautyGuess={beautyGuess}
                            publicGoodsContr={publicGoodsContr}
                            centipedeNode={centipedeNode}
                            launchChoice={launchChoice}
                            deterrenceChoice={deterrenceChoice}
                            pieDemand={pieDemand}
                            signalingType={signalingType}
                            signalingChoice={signalingChoice}
                            cournotQuantity={cournotQuantity}
                            botCournotQuantity={activeBot.id === 'cournot_cartel' ? 22.5 : activeBot.id === 'cournot_aggressive' ? 35 : 30}
                            hotellingLocation={hotellingLocation}
                            botHotellingLocation={activeBot.id === 'hotelling_pier' ? 15 : activeBot.id === 'hotelling_flank' ? (hotellingLocation < 50 ? 80 : 20) : 50}
                            blottoAllocations={{ a: blottoA, b: blottoB, c: blottoC }}
                            botBlottoAllocations={activeBot.id === 'blotto_clausewitz' ? { a: 50, b: 50, c: 0 } : activeBot.id === 'blotto_feint' ? { a: 60, b: 0, c: 40 } : { a: 34, b: 33, c: 33 }}
                            cvBid={cvBid}
                            botCvBid={activeBot.id === 'cv_naive' ? cvBotSignal : activeBot.id === 'cv_hubris' ? cvBotSignal + 2 : Math.max(10, cvBotSignal - 6)}
                            cvTrueValue={cvTrueValue}
                            cvPlayerSignal={cvPlayerSignal}
                            cvBotSignal={cvBotSignal}
                            dollarBid={dollarBid}
                            botDollarBid={activeBot.id === 'dollar_escalator' ? Math.min(2.0, dollarBid + 0.1) : 0.5}
                            travelerClaim={travelerClaim}
                            botTravelerClaim={activeBot.id === 'traveler_undercutter' ? 98 : activeBot.id === 'traveler_rational' ? 2 : 100}
                            fisheryEffort={fisheryEffort}
                            botFisheryEffort={activeBot.id === 'fishery_industrialist' ? 8 : activeBot.id === 'fishery_steward' ? 3 : 4}
                            lemonPrice={lemonPrice}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Animated Thought Bubble (Shown while bot is deciding) */}
                {isBotThinking && (
                  <div className="pt-2">
                    <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/70 shadow-2xl flex items-start gap-3.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="relative shrink-0">
                        <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-700 block">
                          {activeBot.avatar}
                        </span>
                        <span className="absolute -bottom-1 -right-1 text-xs animate-ping">💭</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-black uppercase tracking-wider ${activeBot.color}`}>
                            {activeBot.name} is deciding...
                          </span>
                          <span className="flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                          </span>
                        </div>
                        <div className="relative bg-slate-900/90 border border-indigo-500/40 rounded-xl p-3 text-sm sm:text-base text-indigo-100 italic font-medium leading-relaxed shadow-inner">
                          💭 &ldquo;{currentBotThought}&rdquo;
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Big Main Confirm Button */}
                <div className="pt-3 space-y-3 hidden lg:block">
                  <button
                    type="button"
                    disabled={isBotThinking}
                    onClick={handleSubmitRound}
                    className={`w-full min-h-[56px] py-4 px-6 text-lg font-black rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all ${
                      isBotThinking
                        ? 'bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 cursor-wait'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 active:from-blue-700 active:to-indigo-700 text-white shadow-blue-950/60 cursor-pointer ring-1 ring-blue-400/40 hover:ring-blue-300 hover:shadow-blue-600/30'
                    }`}
                  >
                    {isBotThinking ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin text-lg">⏳</span>
                        <span>{activeBot.name} is analyzing your move...</span>
                      </span>
                    ) : (
                      <>
                        <span>
                          {selectedModuleId === 20
                            ? `Confirm Node ${centipedeNode} Choice (${centipedeChoice})`
                            : totalRounds > 1
                            ? `Confirm Round ${currentRound} of ${totalRounds} Decision`
                            : `Confirm Your Decision`}
                        </span>
                        {totalRounds <= 1 && selectedModuleId !== 20 && (
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-950/80 border border-blue-400/40 text-blue-200 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                            One-Off Game
                          </span>
                        )}
                        {totalRounds > 1 && (
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-950/80 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                            R{currentRound}/{totalRounds}
                          </span>
                        )}
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToStep(1)}
                    className="w-full min-h-[48px] py-3 px-6 text-sm sm:text-base font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>← Review Game Rules & Payoffs (Step 1)</span>
                  </button>
                </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 3: RESULT & KEY TAKEAWAY                                             */}
            {/* ========================================================================= */}
            <div className={`w-full min-w-full shrink-0 snap-center snap-always px-1 sm:px-2 ${activeStep === 2 && !isRoundResolved ? 'max-h-0 lg:max-h-none overflow-hidden' : ''}`}>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 text-slate-100 max-w-4xl mx-auto">
                {!isRoundResolved ? (
                  /* If round is not yet resolved, show clear prompt to complete choice */
                  <div className="bg-slate-950/90 rounded-2xl p-6 sm:p-8 border border-slate-800 text-center space-y-4">
                    <div className="text-4xl">⏳</div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {selectedModuleId === 20
                        ? `Decision Needed for Node ${centipedeNode}`
                        : totalRounds > 1
                        ? `Decision Needed for Round ${currentRound}`
                        : `Decision Needed for Your Choice`}
                    </h3>
                    <p className="text-base sm:text-lg text-slate-200 max-w-md mx-auto leading-relaxed">
                      {totalRounds > 1
                        ? "Submit your move in Step 2 to view your round result, payoffs, and strategic takeaway."
                        : "Submit your move in Step 2 to view your game result, payoffs, and strategic takeaway."}
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToStep(2)}
                      className="w-full min-h-[56px] py-4 px-6 text-lg font-black bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Go to Step 2: Make Your Choice →</span>
                    </button>
                  </div>
                ) : (
                  /* Round Resolved: Result Line + Key Takeaway at top */
                  lastRoundResult && (() => {
                    const matchRounds = history.length;
                    const playerTotal = Math.round(history.reduce((sum, h) => sum + h.playerPayoff, 0) * 10) / 10;
                    const botTotal = Math.round(history.reduce((sum, h) => sum + h.botPayoff, 0) * 10) / 10;
                    const isDollarGame = selectedModuleId === 6 || selectedModuleId === 14 || selectedModuleId === 7 || selectedModuleId === 8 || selectedModuleId === 16 || selectedModuleId === 9 || selectedModuleId === 21 || selectedModuleId === 24;

                    const getScoreCmp = (p: number, b: number, isDollar: boolean = false) => {
                      const pStr = isDollar ? (p >= 0 ? `$${Number(p.toFixed(2))}` : `-$${Number(Math.abs(p).toFixed(2))}`) : `${p}`;
                      const bStr = isDollar ? (b >= 0 ? `$${Number(b.toFixed(2))}` : `-$${Number(Math.abs(b).toFixed(2))}`) : `${b}`;
                      if (p > b) {
                        return `You outscored the bot ${pStr} to ${bStr}`;
                      } else if (b > p) {
                        return `The bot outscored you ${bStr} to ${pStr}`;
                      } else {
                        return `You tied with the bot ${pStr} to ${bStr}`;
                      }
                    };

                    const roundScoreCmp = getScoreCmp(lastRoundResult.playerPayoff, lastRoundResult.botPayoff, isDollarGame);
                    const matchScoreCmp = getScoreCmp(playerTotal, botTotal, isDollarGame);

                    // One plain-language takeaway sentence (strictly 25 words or fewer)
                    const keyTakeawaySentence = getGameTakeawaySentence(selectedModuleId);

                    // One result line: your points vs bot, over N rounds (signed payoffs, negative points show as '-10 pts')
                    const resultSentence = selectedModuleId === 1 || matchRounds <= 1 ? (
                      <>
                        You scored <strong className="text-white">{formatSignedPayoff(lastRoundResult.playerPayoff, isDollarGame)}</strong> and {activeBot.name} scored <strong className="text-white">{formatSignedPayoff(lastRoundResult.botPayoff, isDollarGame)}</strong> over 1 round — {roundScoreCmp}.
                      </>
                    ) : (
                      <>
                        You scored <strong className="text-white">{isDollarGame ? `$${playerTotal.toFixed(2)}` : `${playerTotal >= 0 ? playerTotal : `-${Math.abs(playerTotal)}`} ${pluralWord(playerTotal, 'pt', 'pts')}`}</strong> and {activeBot.name} scored <strong className="text-white">{isDollarGame ? `$${botTotal.toFixed(2)}` : `${botTotal >= 0 ? botTotal : `-${Math.abs(botTotal)}`} ${pluralWord(botTotal, 'pt', 'pts')}`}</strong> over {formatUnit(matchRounds, 'round')} — {matchScoreCmp}.
                      </>
                    );

                    const counterfactual = computeWhatYouCouldHaveGot(
                      selectedModuleId,
                      lastRoundResult.playerAction,
                      lastRoundResult.botAction,
                      lastRoundResult.playerPayoff,
                      {
                        studentValuation,
                        botValuation,
                        activeBotId: activeBot.id,
                        botName: activeBot.name,
                        signalingType,
                        centipedeNode,
                        cvTrueValue,
                        cvPlayerSignal,
                        cvBotSignal,
                        isDollarGame,
                        history
                      }
                    );

                    return (
                      <div className="space-y-4">
                        {/* Step 3 Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div>
                            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                              {totalRounds > 1
                                ? `Round ${currentRound} of ${totalRounds} Complete · Step 3 of 5`
                                : `Match Complete · Step 3 of 5`}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                              {totalRounds > 1
                                ? `Round ${currentRound} Result & Takeaway`
                                : `Match Result & Takeaway`}
                            </h2>
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            {formatUnit(matchRounds, 'Round')} Analyzed
                          </span>
                        </div>

                        {/* 1. Exactly one Result Line shown at the very top */}
                        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex items-start gap-3">
                          <span className="text-xl sm:text-2xl shrink-0 mt-0.5">📊</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                              {totalRounds > 1 ? `Match Standings (${formatUnit(matchRounds, 'Round')}):` : 'Match Result:'}
                            </span>
                            <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                              {resultSentence}
                            </p>
                          </div>
                        </div>

                        {/* Friendly Mastery Banner right below result (if any) */}
                        {gameCompletionToast.message && (
                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md transition-all ${
                              gameCompletionToast.isBestResponse
                                ? 'bg-gradient-to-r from-emerald-950/80 to-blue-950/80 border-emerald-500/60 text-white'
                                : 'bg-gradient-to-r from-amber-950/80 to-slate-900 border-amber-600/60 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="text-2xl sm:text-3xl shrink-0">
                                {gameCompletionToast.isBestResponse ? '🔥' : '💡'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm sm:text-base font-extrabold tracking-tight leading-snug break-words">
                                  {gameCompletionToast.message}
                                </p>
                                <span className="text-xs text-slate-300 block mt-0.5 leading-snug">
                                  {gameCompletionToast.isBestResponse
                                    ? `Theoretical best-response achieved! Current streak: ${masteryStreak}`
                                    : 'Keep exploring strategies in the What-If Sandbox or next game!'}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-black/40 border border-white/10 shrink-0 self-start sm:self-center">
                              Streak {masteryStreak}
                            </span>
                          </div>
                        )}

                        {/* 2. One Plain-Language Takeaway Sentence of 25 Words or Fewer */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-slate-100 flex items-start gap-3 shadow-md">
                          <span className="text-2xl sm:text-3xl shrink-0 mt-0.5">💡</span>
                          <div className="min-w-0 flex-1">
                            <span className="font-black text-amber-300 text-xs sm:text-sm uppercase tracking-wider block mb-1">
                              Key Takeaway:
                            </span>
                            <p className="text-base sm:text-lg text-slate-100 font-semibold leading-relaxed">
                              <AnnotateGlossaryText text={keyTakeawaySentence} />
                            </p>
                          </div>
                        </div>

                        {/* 3. The Counterfactual Comparison Card */}
                        <div
                          className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md space-y-3 ${
                            counterfactual.isBestResponse
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                              : 'bg-amber-950/30 border-amber-500/50 text-amber-100'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl shrink-0">
                                {counterfactual.isBestResponse ? '🎯' : '⚖️'}
                              </span>
                              <div>
                                <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-white block">
                                  What you got vs. what you could have got
                                </span>
                                <span className="text-[11px] text-slate-300 font-medium">
                                  Compared against {activeBot.name}'s actual action
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-xs font-black px-3 py-1 rounded-full border self-start sm:self-auto shrink-0 ${
                                counterfactual.isBestResponse
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                              }`}
                            >
                              {counterfactual.isBestResponse ? '✓ Best Response Played' : '⚡ Alternative Scored More'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                            {/* What You Got */}
                            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between min-h-[72px]">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                What You Got ({String(lastRoundResult.playerAction)})
                              </span>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span
                                  className={`text-2xl sm:text-3xl font-black ${
                                    counterfactual.isBestResponse ? 'text-emerald-300' : 'text-white'
                                  }`}
                                >
                                  {formatSignedPayoff(counterfactual.earnedPayoff, isDollarGame)}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">earned</span>
                              </div>
                            </div>

                            {/* What You Could Have Got */}
                            <div
                              className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between min-h-[72px] ${
                                counterfactual.isBestResponse
                                  ? 'bg-emerald-950/30 border-emerald-500/30'
                                  : 'bg-amber-950/40 border-amber-500/40'
                              }`}
                            >
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                Best Possible ({counterfactual.bestActionLabel})
                              </span>
                              <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                                <span
                                  className={`text-2xl sm:text-3xl font-black ${
                                    counterfactual.isBestResponse ? 'text-emerald-300' : 'text-amber-300'
                                  }`}
                                >
                                  {formatSignedPayoff(counterfactual.bestPayoff, isDollarGame)}
                                </span>
                                {counterfactual.difference > 0 ? (
                                  <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-700/60">
                                    +{isDollarGame ? `$${Number(counterfactual.difference.toFixed(2))}` : `${counterfactual.difference} ${pluralWord(counterfactual.difference, 'pt', 'pts')}`} more
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700/60">
                                    Maximum possible
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* One-Line Plain-Language Takeaway */}
                          <div
                            className={`p-3 rounded-xl border flex items-start gap-2.5 text-sm sm:text-base font-semibold leading-snug ${
                              counterfactual.isBestResponse
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
                                : 'bg-amber-950/60 border-amber-500/40 text-amber-100'
                            }`}
                          >
                            <span className="shrink-0 text-base sm:text-lg mt-0.5">💬</span>
                            <p>{counterfactual.takeaway}</p>
                          </div>
                        </div>

                        {/* Primary Large Action Buttons */}
                        <div className="pt-1 space-y-3">
                          {currentRound < totalRounds ? (
                            <button
                              type="button"
                              onClick={handleNextRound}
                              className="w-full min-h-[56px] py-4 px-6 text-lg font-black bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all ring-1 ring-blue-400/40"
                            >
                              <span>Proceed to Next Trial (Round {currentRound + 1} of {totalRounds}) →</span>
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <button
                                type="button"
                                onClick={() => {
                                  markGameCompleted(selectedModuleId);
                                  resetExperiment(undefined, nextModule.id);
                                }}
                                className="w-full min-h-[56px] py-4 px-6 text-lg font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                              >
                                <span>Proceed to Next Game (#{nextModuleIndex}: {nextModule.shortTitle}) →</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  resetExperiment();
                                  scrollToStep(2);
                                }}
                                className="w-full min-h-[56px] py-4 px-6 text-base sm:text-lg font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                              >
                                <span>🔄 Play Again (Same Game)</span>
                              </button>
                            </div>
                          )}

                          {/* Explore Deeper Analysis Button (Step 4) */}
                          <button
                            type="button"
                            onClick={() => scrollToStep(4)}
                            className="w-full min-h-[56px] py-4 px-6 text-base sm:text-lg font-bold bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                          >
                            <span>🔍 Explore Deeper Analysis (Step 4) →</span>
                          </button>
                        </div>

                        {/* Collapsed 'Go deeper' section in Step 3 keeping all content reachable */}
                        <div className="pt-2">
                          <details className="group bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden transition-all shadow-md">
                            <summary className="min-h-[52px] px-4 sm:px-5 py-3.5 font-bold text-sm sm:text-base text-slate-200 cursor-pointer flex items-center justify-between hover:bg-slate-900 select-none">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">🔍</span>
                                <span>Go deeper: Opponent analysis, visualizer & theoretical notes</span>
                              </div>
                              <span className="text-slate-400 group-open:rotate-90 transition-transform font-mono text-sm">▸</span>
                            </summary>
                            <div className="p-4 sm:p-5 border-t border-slate-800 space-y-4 bg-slate-900/40">
                              {/* Opponent Bot Strategy Thought Bubble */}
                              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-indigo-500/40 shadow-md flex items-start gap-3.5">
                                <div className="relative shrink-0">
                                  <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800 block">
                                    {activeBot.avatar}
                                  </span>
                                  <span className="absolute -bottom-1 -right-1 text-sm">💭</span>
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center justify-between gap-1">
                                    <span className={`text-xs font-black uppercase tracking-wider ${activeBot.color} break-words`}>
                                      {activeBot.name}&apos;s Strategy Thought
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 shrink-0">
                                      {totalRounds > 1 ? `Round ${currentRound} Decision` : 'Match Decision'}
                                    </span>
                                  </div>
                                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-sm sm:text-base text-slate-200 italic font-medium leading-relaxed">
                                    💭 &ldquo;{lastRoundResult.botThought || activeBot.getAnticipationThought(currentRound, history)}&rdquo;
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Payoff Matrix / Mechanism Visualizer with Highlighted Outcome Cell */}
                              <div className="w-full max-w-full overflow-hidden">
                                {[1, 3, 4, 6, 13, 15, 17, 18].includes(selectedModuleId) ? (
                                  <InteractiveMatrixVisualizer
                                    gameId={selectedModuleId}
                                    botName={activeBot.name}
                                    botAvatar={activeBot.avatar}
                                    playedOutcome={{
                                      playerAction: String(lastRoundResult.playerAction),
                                      botAction: String(lastRoundResult.botAction),
                                      playerPayoff: lastRoundResult.playerPayoff,
                                      botPayoff: lastRoundResult.botPayoff
                                    }}
                                    isDollarGame={isDollarGame}
                                  />
                                ) : (
                                  <SequentialVisualizer
                                    gameId={selectedModuleId}
                                    botName={activeBot.name}
                                    botAvatar={activeBot.avatar}
                                    studentValuation={studentValuation}
                                    botValuation={botValuation}
                                    ultimatumOffer={ultimatumOffer}
                                    trustInvestment={trustInvestment}
                                    auctionBid={selectedModuleId === 8 ? fpAuctionBid : auctionBid}
                                    bertrandPrice={bertrandPrice}
                                    beautyGuess={beautyGuess}
                                    publicGoodsContr={publicGoodsContr}
                                    centipedeNode={centipedeNode}
                                    launchChoice={launchChoice}
                                    deterrenceChoice={deterrenceChoice}
                                    pieDemand={pieDemand}
                                    signalingType={signalingType}
                                    signalingChoice={signalingChoice}
                                    buyerTrustChoice={lastRoundResult ? (lastRoundResult.botAction === 'Trust' ? 'Trust' : "Don't Trust") : undefined}
                                    cournotQuantity={cournotQuantity}
                                    botCournotQuantity={activeBot.id === 'cournot_cartel' ? 22.5 : activeBot.id === 'cournot_aggressive' ? 35 : 30}
                                    hotellingLocation={hotellingLocation}
                                    botHotellingLocation={activeBot.id === 'hotelling_pier' ? 15 : activeBot.id === 'hotelling_flank' ? (hotellingLocation < 50 ? 80 : 20) : 50}
                                    blottoAllocations={{ a: blottoA, b: blottoB, c: blottoC }}
                                    botBlottoAllocations={activeBot.id === 'blotto_blitz' || activeBot.id === 'blotto_clausewitz' ? { a: 50, b: 50, c: 0 } : activeBot.id === 'blotto_feint' ? { a: 60, b: 0, c: 40 } : { a: 34, b: 33, c: 33 }}
                                    cvBid={cvBid}
                                    botCvBid={activeBot.id === 'cv_naive' ? cvBotSignal : activeBot.id === 'cv_hubris' ? cvBotSignal + 2 : Math.max(10, cvBotSignal - 6)}
                                    cvTrueValue={cvTrueValue}
                                    cvPlayerSignal={cvPlayerSignal}
                                    cvBotSignal={cvBotSignal}
                                    playedOutcome={{
                                      playerAction: String(lastRoundResult.playerAction),
                                      botAction: String(lastRoundResult.botAction),
                                      playerPayoff: lastRoundResult.playerPayoff,
                                      botPayoff: lastRoundResult.botPayoff
                                    }}
                                  />
                                )}
                              </div>

                              {/* Counterfactual Opponent Matchup Intelligence (other bots) */}
                              {activeGameBots.length > 1 && (() => {
                                const otherBots = activeGameBots.filter(b => b.id !== activeBot.id);
                                if (otherBots.length === 0) return null;

                                return (
                                  <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-indigo-900/50 shadow-lg space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🧠</span>
                                        <span>Counterfactual Matchup Intelligence</span>
                                      </span>
                                      <span className="text-[11px] font-mono text-slate-400">
                                        Tested against your move: {String(lastRoundResult.playerAction)}
                                      </span>
                                    </div>

                                    <p className="text-xs text-slate-300 leading-relaxed">
                                      How would your decision of <strong className="text-white">{String(lastRoundResult.playerAction)}</strong> have performed if you had faced the other bot archetypes in this scenario?
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                      {otherBots.map(bot => {
                                        const altDecision = bot.decide({
                                          round: currentRound,
                                          totalRounds,
                                          history: history.map(h => ({
                                            round: h.round,
                                            playerAction: h.playerAction,
                                            botAction: h.botAction,
                                            playerPayoff: h.playerPayoff,
                                            botPayoff: h.botPayoff,
                                            playerValuation: h.playerValuation,
                                            botValuation: h.botValuation
                                          })),
                                          botValuation: selectedModuleId === 24 ? cvBotSignal : botValuation,
                                          studentValuation: selectedModuleId === 24 ? cvPlayerSignal : studentValuation
                                        });

                                        const altActionStr = typeof altDecision.action === 'object'
                                          ? JSON.stringify(altDecision.action)
                                          : String(altDecision.action);

                                        return (
                                          <div key={bot.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xl p-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">{bot.avatar}</span>
                                                <div className="min-w-0">
                                                  <div className="text-xs font-bold text-white truncate">{bot.name}</div>
                                                  <div className={`text-[10px] font-medium truncate ${bot.color}`}>{bot.title}</div>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                                              <div className="flex justify-between items-center text-[11px]">
                                                <span className="text-slate-400">Would have chosen:</span>
                                                <span className="font-mono font-bold text-amber-300 truncate max-w-[140px]">{altActionStr}</span>
                                              </div>
                                              <div className="text-[10px] text-slate-400 italic line-clamp-2">
                                                "{altDecision.rationale}"
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Standings Summary Card */}
                              {matchRounds > 1 && (
                                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                      Cumulative Match Standings
                                    </span>
                                    <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                                      <span className="text-emerald-400">You: {isDollarGame ? `$${playerTotal.toFixed(2)}` : `${playerTotal} pts`}</span>
                                      <span className="text-slate-500 mx-2">vs</span>
                                      <span className={activeBot.color}>{activeBot.name}: {isDollarGame ? `$${botTotal.toFixed(2)}` : `${botTotal} pts`}</span>
                                    </div>
                                  </div>
                                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border self-start sm:self-auto ${
                                    playerTotal >= botTotal
                                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                      : 'bg-slate-900 text-slate-300 border-slate-800'
                                  }`}>
                                    {playerTotal >= botTotal ? '✓ Leading Match' : 'Bot Ahead'}
                                  </span>
                                </div>
                              )}

                              {/* Open What-If Laboratory Button */}
                              <button
                                type="button"
                                onClick={() => onOpenWhatIfSandbox && onOpenWhatIfSandbox(selectedModuleId)}
                                className="w-full min-h-[48px] py-3 px-4 text-sm font-bold bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 border border-blue-700/60 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                              >
                                <span>∫ Launch What-If Sandbox (Game {currentModuleIndex}: {activeModule.shortTitle}) →</span>
                              </button>
                            </div>
                          </details>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 4: GO DEEPER (THEORY, BENCHMARKS & MATCH HISTORY)                    */}
            {/* ========================================================================= */}
            <div className={`w-full min-w-full shrink-0 snap-center snap-always px-1 sm:px-2 ${activeStep === 2 && !isRoundResolved ? 'max-h-0 lg:max-h-none overflow-hidden' : ''}`}>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 text-slate-100 max-w-4xl mx-auto">
                {!isRoundResolved ? (
                  <div className="bg-slate-950/90 rounded-2xl p-6 sm:p-8 border border-slate-800 text-center space-y-4">
                    <div className="text-4xl">🔍</div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Deep Dive Analysis</h3>
                    <p className="text-base sm:text-lg text-slate-200 max-w-md mx-auto leading-relaxed">
                      Complete your decision in Step 2 to unlock the deep game theory analysis, theoretical benchmarks, and behavioral comparison.
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToStep(2)}
                      className="w-full min-h-[56px] py-4 px-6 text-lg font-black bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Go to Step 2: Make Your Choice →</span>
                    </button>
                  </div>
                ) : (
                  lastRoundResult && (() => {
                    const matchRounds = history.length;
                    const playerTotal = Math.round(history.reduce((sum, h) => sum + h.playerPayoff, 0) * 10) / 10;
                    const botTotal = Math.round(history.reduce((sum, h) => sum + h.botPayoff, 0) * 10) / 10;
                    const totalMatchSurplus = Math.round((playerTotal + botTotal) * 10) / 10;

                    let conceptBadge = "Game Theory Debrief";
                    let predictionLabel = "Theoretical Prediction";
                    let predictionTitle = "Equilibrium Benchmark";
                    let predictionExplanation = "";
                    let predictionFrequency = "";
                    let predictionPayoff = "";
                    let actualFrequencyTitle = "";
                    let actualFrequencyBreakdown = "";
                    let gapInterpretationSentence = "";
                    let actualPayoff = "";
                    let realPeopleSentence = "";

                    const getScoreCmp = (p: number, b: number, isDollar: boolean = false) => {
                      const pStr = isDollar ? (p >= 0 ? `$${Number(p.toFixed(2))}` : `-$${Number(Math.abs(p).toFixed(2))}`) : `${p}`;
                      const bStr = isDollar ? (b >= 0 ? `$${Number(b.toFixed(2))}` : `-$${Number(Math.abs(b).toFixed(2))}`) : `${b}`;
                      if (p > b) return `You outscored the bot ${pStr} to ${bStr}`;
                      if (b > p) return `The bot outscored you ${bStr} to ${pStr}`;
                      return `You tied with the bot ${pStr} to ${bStr}`;
                    };

                    if (selectedModuleId === 1) {
                      conceptBadge = "Dominant Strategy Equilibrium";
                      predictionLabel = "Dominant Strategy Equilibrium";
                      predictionTitle = "Mutual Defection: 1 pt each (Trapped at 1 pt vs 2 pts Mutual Coop)";
                      predictionExplanation = "Because defecting yields a strictly higher score no matter what the opponent chooses ($3 vs $2 and $1 vs $0), rational players defect, trapping both at 1 pt each instead of 2 pts from mutual cooperation.";
                      predictionFrequency = "Equilibrium Benchmark: 100% Defection / 0% Cooperate";
                      predictionPayoff = "Dominant Strategy: 1 pt each (Mutual Defection) · Social Optimum: 2 pts each (Mutual Cooperation)";
                      actualFrequencyTitle = "Your Single-Round Decision";
                      actualFrequencyBreakdown = `1/1 ${String(lastRoundResult.playerAction)} (100%)`;
                      gapInterpretationSentence = "In a one-shot game, defection is a dominant strategy because it outperforms cooperation against every possible move by the opponent. Mutual defection locks both players into a low-payoff trap, unable to reach the cooperative outcome without repeated play or external enforcement.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff)}`;
                      realPeopleSentence = "In laboratory one-shot Prisoner's Dilemma experiments, 30% to 50% of real participants still choose to cooperate despite dominant-strategy incentives, driven by prosocial empathy and fairness norms.";
                    } else if (selectedModuleId === 2) {
                      conceptBadge = "First-Mover Advantage & Backward Induction";
                      predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                      predictionTitle = "First-Mover Commits to Launch (+2 or +4 pts for Player)";
                      predictionExplanation = "Because the first mover can irreversibly commit to Launching early, the follower is forced into the subgame where Entering yields +2 while Staying Out yields +1. Knowing the follower will Enter, the First Mover chooses Launch (+2) over Waiting (+1), securing subgame perfection.";
                      predictionFrequency = "SPNE Prediction: 100% Launch (First Mover) · Follower Best Response: Enter (2 > 1)";
                      predictionPayoff = "Launch + Enter = +2 pts each (Duopoly) · Launch + Stay Out = +4 for you, +1 for Bot";
                      actualFrequencyTitle = "Your First-Mover Move";
                      actualFrequencyBreakdown = `1/1 ${String(lastRoundResult.playerAction)} (100%)`;
                      gapInterpretationSentence = "In extensive form games with perfect information, moving first grants strategic commitment power. Committing early eliminates outcomes where the follower could have claimed the dominant market share.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff)}`;
                      realPeopleSentence = "In experimental sequential entry games, human first-movers commit to launching over 78% of the time, and followers reliably accommodate by sharing the duopoly rather than retaliating.";
                    } else if (selectedModuleId === 3) {
                      conceptBadge = "Simultaneous Price Competition & Dominance";
                      predictionLabel = "Strictly Dominant Strategy Equilibrium";
                      predictionTitle = "Mutual Low Price Trap: +1 pt each (Trapped vs +2 pts Mutual High)";
                      predictionExplanation = "Price cutting is strictly dominant: Low Price yields +3 pts vs +2 pts if rival prices High, and +1 pt vs 0 pts if rival prices Low. Both firms adopting their dominant strategy traps the market at +1 pt each.";
                      predictionFrequency = "Dominant Strategy Benchmark: 100% Low Price (Nash Trap)";
                      predictionPayoff = "Nash Trap: +1 pt each (Both Low) · Collusive Monopoly: +2 pts each (Both High)";
                      actualFrequencyTitle = "Your Single-Round Price Choice";
                      actualFrequencyBreakdown = `1/1 ${String(lastRoundResult.playerAction)} (100%)`;
                      gapInterpretationSentence = "Simultaneous price competition mirrors the Prisoner's Dilemma in industrial organization: individual incentives to undercut destroy industry profitability unless repeated interaction or antitrust-exempt collusion allows coordination.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff)}`;
                      realPeopleSentence = "Experimental duopolists frequently attempt to post high prices (~40% of first rounds), but unilateral undercutting quickly drives subsequent pricing down to the competitive baseline.";
                    } else if (selectedModuleId === 4) {
                      conceptBadge = "Anti-Coordination & Mixed Strategy";
                      predictionLabel = "Symmetric Mixed Strategy Nash Equilibrium";
                      predictionTitle = "Uniform 1/3 Randomization across Mon, Wed, Fri (EV = 0.67 pts)";
                      predictionExplanation = "Because clashing on the same promotion day destroys customer impact (0 pts) while uncoordinated days yield +1 pt, neither player can maintain a pure strategy. In the unique symmetric mixed equilibrium, each player randomizes each day with probability 1/3.";
                      predictionFrequency = "Symmetric Nash: 33.3% Mon / 33.3% Wed / 33.3% Fri (p* = 1/3)";
                      predictionPayoff = "Expected Payoff: 0.67 pts per round (2/3 probability of successful anti-coordination)";
                      actualFrequencyTitle = "Your Promotional Day Selection";
                      actualFrequencyBreakdown = `Selected ${String(lastRoundResult.playerAction)} · Clashed: ${lastRoundResult.playerAction === lastRoundResult.botAction ? 'Yes (0 pts)' : 'No (+1 pt)'}`;
                      gapInterpretationSentence = "In multi-action anti-coordination games, pure strategies invite counter-scheduling. True randomization prevents competitors from scheduling overlapping promotions that cancel out your marketing ROI.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff)}`;
                      realPeopleSentence = "Real players display strong behavioral day biases (such as disproportionately choosing Friday), enabling adaptive bots to anti-coordinate effectively against human predictability.";
                    } else if (selectedModuleId === 5) {
                      conceptBadge = "Strategic Commitment & Credibility";
                      predictionLabel = "Subgame Perfect Commitment Equilibrium";
                      predictionTitle = "Incumbent Sinks Capacity -> Rival Stays Out (+4 pts Incumbent)";
                      predictionExplanation = "An uncommitted incumbent who threatens a price war has an empty threat: if the rival enters, fighting costs -2 while accommodating yields +2. But by sinking capital upfront into irreversible capacity, the incumbent makes price warfare credible, deterring entry and preserving monopoly (+4, 0).";
                      predictionFrequency = "SPNE Prediction: 100% Commit by Incumbent; 100% Stay Out by Entrant";
                      predictionPayoff = "Committed Deterrence: +4 pts for Incumbent, 0 for Entrant · Flexible Duopoly: +2 pts each";
                      actualFrequencyTitle = "Your Incumbent Strategic Posture";
                      actualFrequencyBreakdown = `1/1 ${String(lastRoundResult.playerAction)} (100%)`;
                      gapInterpretationSentence = "Strategic commitment works by intentionally restricting your own future options. By eliminating the ability to retreat gracefully, you force the opponent to bear the brunt of avoiding a catastrophic conflict.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff)}`;
                      realPeopleSentence = "In laboratory experiments, entrants test uncommitted incumbents over 70% of the time, but reduce entry attempts to under 25% when incumbents sink visible capacity.";
                    } else if (selectedModuleId === 8) {
                      conceptBadge = "First-Price Auction & Bayes-Nash Bidding";
                      predictionLabel = "Bayes-Nash Equilibrium Bid Shading";
                      predictionTitle = `BNE Bid Shading: b*(v) = v / 2 = $${(studentValuation / 2).toFixed(2)}`;
                      predictionExplanation = `In a first-price sealed-bid auction with 2 risk-neutral bidders and valuations drawn uniformly from [0, 10], the unique symmetric Bayes-Nash equilibrium strategy is to bid exactly half of your private valuation: b*(v) = v / 2 ($${(studentValuation / 2).toFixed(2)}).`;
                      predictionFrequency = `BNE Benchmark: Bid = v/2 = $${(studentValuation / 2).toFixed(2)} (Valuation: $${studentValuation}.00)`;
                      predictionPayoff = `Expected Profit at BNE: $${((studentValuation / 2) * (studentValuation / 10) * 0.5).toFixed(2)}`;
                      actualFrequencyTitle = "Your Sealed Bid";
                      actualFrequencyBreakdown = `Bid: $${Number(lastRoundResult.playerAction).toFixed(2)} (Valuation: $${studentValuation}.00 · Shading: ${Math.round((1 - Number(lastRoundResult.playerAction) / studentValuation) * 100)}%)`;
                      gapInterpretationSentence = "In first-price auctions, the trade-off is fundamental: higher bids increase your probability of winning, but lower the profit margin you capture upon victory. The Nash equilibrium optimizes this exact margin-volume elasticity.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff, true)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff, true)}`;
                      realPeopleSentence = "Laboratory bidders systematically overbid relative to the risk-neutral Nash benchmark (typically bidding 65% to 75% of value instead of 50%) due to risk aversion and the fear of regret from losing.";
                    } else if (selectedModuleId === 9) {
                      conceptBadge = "Nash Demand Game & Focal Points";
                      predictionLabel = "Nash Bargaining Solution";
                      predictionTitle = "Equal 50/50 Split (5.0 pts each; Demand Sum = 10 pts)";
                      predictionExplanation = "The Nash Demand Game possesses a continuum of efficient pure Nash equilibria where demands sum to 10. The symmetric 50/50 division (5 pts each) is the unique Schelling focal point and the axiomatic Nash bargaining solution.";
                      predictionFrequency = "Focal Benchmark: 5.0 pts Demanded (50% Pie Share)";
                      predictionPayoff = "Agreement: Demands satisfied if Sum ≤ 10 · Impasse: +1 pt each (Outside Option) if Sum > 10";
                      actualFrequencyTitle = "Your Demand from 10 Points";
                      actualFrequencyBreakdown = `Demanded ${lastRoundResult.playerAction} pts · Bot Demanded ${lastRoundResult.botAction} pts · Sum: ${(Number(lastRoundResult.playerAction) + Number(lastRoundResult.botAction)).toFixed(1)}/10`;
                      gapInterpretationSentence = "In simultaneous demand bargaining, aggressive demands risk catastrophic impasse if both players test their luck. Outside options provide safety, but coordinating on equal splits prevents deadweight loss.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff)}`;
                      realPeopleSentence = "In laboratory experiments, over 65% of demands land precisely on the 50/50 focal split, and impasse rates rise dramatically whenever asymmetric outside options distort players' perceived entitlements.";
                    } else if (selectedModuleId === 10) {
                      conceptBadge = "Spence Costly Signaling & Single-Crossing";
                      predictionLabel = "Separating Bayes-Nash Equilibrium";
                      predictionTitle = "Separating Equilibrium: High Quality Signals (Cost 2), Lemon Does Not (Cost 5)";
                      predictionExplanation = "Because the cost of verification satisfies the single-crossing property (2 pts for High Quality vs 5 pts for Lemon), the High Quality type can profitably signal (Net = 10 - 2 = 8 > 3), while the Lemon cannot mimic (Net = 10 - 5 = 5 vs 3, but risk-adjusted lemon payoff fails).";
                      predictionFrequency = "Separating Equilibrium: 100% Signal for High Quality / 0% Signal for Low Quality";
                      predictionPayoff = "High Quality + Signal + Trust = +8 pts · Lemon + No Signal = +3 pts · Lemon Mimic + Untrusted = -2 pts";
                      actualFrequencyTitle = `Your Seller Move as [${signalingType}]`;
                      actualFrequencyBreakdown = `Assigned Type: ${signalingType} · Chose: ${String(lastRoundResult.playerAction)} · Buyer: ${String(lastRoundResult.botAction)}`;
                      gapInterpretationSentence = "Asymmetric information causes markets to unravel into lemons unless high-quality agents invest in differential signaling. The signal does not need to add intrinsic value—it only needs to be differentially affordable.";
                      actualPayoff = `Round Payoff: You: ${formatSignedPayoff(lastRoundResult.playerPayoff)} · ${activeBot.name}: ${formatSignedPayoff(lastRoundResult.botPayoff)}`;
                      realPeopleSentence = "Empirical research across labor economics and consumer finance confirms that educational credentials and product warranties serve primarily as costly screening devices rather than direct productivity boosters.";
                    } else if (selectedModuleId === 6) {
                      conceptBadge = "Subgame Perfect Nash Equilibrium (SPNE)";
                      predictionLabel = "SPNE & Dominant Strategy Defection";
                      predictionTitle = `SPNE Defection: $1.00/round each (over ${formatUnit(matchRounds, 'round')}: $${(matchRounds * 1).toFixed(2)} each)`;
                      predictionExplanation = `Because defection strictly dominates cooperation in every stage game ($3.00 vs $2.00 and $1.00 vs $0.00), backward induction predicts rational players defect in every round. This traps both players at $1.00 per round ($${(matchRounds * 1).toFixed(2)} over ${formatUnit(matchRounds, 'round')}) instead of the $2.00 per round cooperative optimum ($${(matchRounds * 2).toFixed(2)} over ${formatUnit(matchRounds, 'round')}).`;
                      predictionFrequency = "Equilibrium Benchmark: 100% Defection / 0% Cooperate in every round";
                      predictionPayoff = `SPNE Trap: $1.00/round each ($${(matchRounds * 1).toFixed(2)} over ${formatUnit(matchRounds, 'round')}) · Pareto Optimum: $2.00/round each ($${(matchRounds * 2).toFixed(2)} over ${formatUnit(matchRounds, 'round')})`;

                      const coopCount = history.filter(h => h.playerAction === 'Cooperate').length;
                      const defectCount = matchRounds - coopCount;
                      const coopPct = Math.round((coopCount / matchRounds) * 100);
                      const defectPct = 100 - coopPct;
                      const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                      actualFrequencyTitle = `Your Choices Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `${coopCount}/${matchRounds} Cooperate (${coopPct}%) · ${defectCount}/${matchRounds} Defect (${defectPct}%)`;
                      if (coopPct <= 15) {
                        gapInterpretationSentence = playerTotal <= botTotal
                          ? `Close to equilibrium: ${scoreCmp}. You defected in ${100 - coopPct}% of rounds (cooperated in only ${coopPct}%), adhering closely to the SPNE dominant strategy, though mutual defection locked both of you into the low-payoff trap ($1.00/rd).`
                          : `Close to equilibrium: ${scoreCmp}. You defected in ${100 - coopPct}% of rounds, following dominant strategy defection and capitalizing on ${activeBot.name}'s cooperative openings.`;
                      } else if (coopPct <= 49) {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? `Noticeable deviation: ${scoreCmp}. You cooperated in ${coopPct}% of rounds, but unilateral cooperative gestures were repeatedly exploited by defection.`
                          : `Noticeable deviation: ${scoreCmp}. You cooperated in ${coopPct}% of rounds, earning points through selective reciprocity while avoiding prolonged defection feuds.`;
                      } else {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You attempted high cooperation (${coopPct}% Cooperate), but ${activeBot.name} defected unsparingly against your goodwill.`
                          : `Productive deviation from theory: ${scoreCmp}. By choosing Cooperate in ${coopPct}% of rounds rather than the 100% Defect SPNE prediction, you cultivated reciprocal trust with ${activeBot.name}, generating mutual payoffs that substantially Pareto-dominated the SPNE defection trap.`;
                      }
                      actualPayoff = `Whole Match Score: You: $${playerTotal.toFixed(2)} · ${activeBot.name}: $${botTotal.toFixed(2)} (Surplus: $${totalMatchSurplus.toFixed(2)})`;
                      realPeopleSentence = "In laboratory trials, real players sustain high cooperation early on using conditional reciprocity (Tit-for-Tat) to earn higher payoffs, only beginning to defect in the final 1–2 rounds as the horizon closes.";
                    } else if (selectedModuleId === 13) {
                      conceptBadge = "Payoff Dominance vs. Risk Dominance";
                      predictionLabel = "Multiple Nash Equilibria";
                      predictionTitle = "Payoff-Dominant: +10 pts/round each · Risk-Dominant: +4 pts/round each";
                      predictionExplanation = `In Stag Hunt, (Stag, Stag) is Payoff-Dominant at +10 pts per round (${matchRounds * 10} pts over ${formatUnit(matchRounds, 'round')}), while (Hare, Hare) is Risk-Dominant at +4 pts per round (${matchRounds * 4} pts over ${formatUnit(matchRounds, 'round')}) because hunting Hare safely guarantees +4 pts without vulnerability to partner hesitation.`;
                      predictionFrequency = "Payoff-Dominant Nash: 100% Stag (+10 pts/rd) · Risk-Dominant Nash: 100% Hare (+4 pts/rd)";
                      predictionPayoff = `Payoff-Dominant (Stag, Stag): +10 pts/round each (${matchRounds * 10} pts over ${formatUnit(matchRounds, 'round')}) · Risk-Dominant (Hare, Hare): +4 pts/round each (${matchRounds * 4} pts over ${formatUnit(matchRounds, 'round')})`;

                      const stagCount = history.filter(h => h.playerAction === 'Stag').length;
                      const hareCount = matchRounds - stagCount;
                      const stagPct = Math.round((stagCount / matchRounds) * 100);
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Choices Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `${stagCount}/${matchRounds} Stag (${stagPct}%) · ${hareCount}/${matchRounds} Hare (${100 - stagPct}%)`;
                      if (stagPct >= 80) {
                        gapInterpretationSentence = playerTotal < botTotal || playerTotal < matchRounds * 5
                          ? `Close to equilibrium: ${scoreCmp}. You committed to the payoff-dominant Stag equilibrium in ${stagPct}% of rounds, but suffered miscoordination penalties when ${activeBot.name} retreated to safe Hare.`
                          : `Close to equilibrium: ${scoreCmp}. You committed firmly to the payoff-dominant Stag equilibrium in ${stagPct}% of rounds, helped by mutual assurance and coordinated trust with ${activeBot.name}.`;
                      } else if (stagPct <= 20) {
                        gapInterpretationSentence = playerTotal >= botTotal
                          ? `Close to equilibrium: ${scoreCmp}. You hunted safe Hare in ${100 - stagPct}% of rounds, adhering strictly to the risk-dominant safe Nash equilibrium (+4 pts/rd) to eliminate all vulnerability to betrayal.`
                          : `Close to equilibrium: ${scoreCmp}. You stuck to risk-dominant Hare, avoiding zero-payoff miscoordination traps while earning a safe return.`;
                      } else {
                        gapInterpretationSentence = `Noticeable deviation: ${scoreCmp}. You alternated between Stag (${stagPct}%) and Hare (${100 - stagPct}%), generating mixed outcomes as coordination wavered.`;
                      }
                      actualPayoff = `Whole Match Payoff: You: ${formatSignedPayoff(playerTotal)} · ${activeBot.name}: ${formatSignedPayoff(botTotal)} (Surplus: ${totalMatchSurplus} pts)`;
                      realPeopleSentence = "Laboratory experiments show that players typically converge on the safe Hare equilibrium when pairing is anonymous, but sustain the payoff-dominant Stag when repetition or communication builds mutual trust.";
                    } else if (selectedModuleId === 15) {
                      conceptBadge = "Anti-Coordination & Evolutionary ESS";
                      predictionLabel = "Anti-Coordination Nash & Mixed ESS";
                      predictionTitle = "Pure: (Hawk, Dove) [6, 0] & (Dove, Hawk) [0, 6] · Mixed ESS: 23% Hawk (2.3 pts/rd)";
                      predictionExplanation = `In Hawk-Dove, players seek to anti-coordinate: the best response to peaceful Dove (+3 pts/rd each) is aggressive Hawk (+6 pts/rd vs 0), but the best response to Hawk is Dove (0 vs -10 pts/rd collision). The symmetric mixed ESS is playing Hawk 23% of the time (3/13), yielding ~2.3 pts/round each (~${(matchRounds * 2.3).toFixed(1)} pts over ${formatUnit(matchRounds, 'round')}).`;
                      predictionFrequency = "Mixed ESS Benchmark: 23% Hawk / 77% Dove (p* = 3/13 ≈ 0.23, EV = ~2.3 pts/round)";
                      predictionPayoff = `Per round: Peaceful Sharing (Dove, Dove) = +3 pts/rd each · Exploit (Hawk, Dove) = +6 pts/rd vs 0 · Collision (Hawk, Hawk) = -10 pts/rd each [Over ${formatUnit(matchRounds, 'round')}: Peaceful Sharing = +${matchRounds * 3} pts each · Mutual Collision = -${matchRounds * 10} pts each]`;

                      const hawkCount = history.filter(h => h.playerAction === 'Hawk').length;
                      const doveCount = matchRounds - hawkCount;
                      const hawkPct = Math.round((hawkCount / matchRounds) * 100);
                      const crashes = history.filter(h => h.playerAction === 'Hawk' && h.botAction === 'Hawk').length;
                      const hawkEssGap = Math.abs(hawkPct - 23);
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Choices Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `${hawkCount}/${matchRounds} Hawk (${hawkPct}%) · ${doveCount}/${matchRounds} Dove (${100 - hawkPct}%) · ${crashes} Fight${crashes === 1 ? '' : 's'}`;
                      if (hawkEssGap <= 8) {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? `Close to equilibrium: ${scoreCmp}. Although your overall mix was near the 23% ESS benchmark (${hawkPct}% Hawk), the ORDER of your choices was predictable, resulting in ${crashes} mutual fight${crashes === 1 ? '' : 's'} (-10 pts each); a true mixed strategy must also be unpredictable round to round to prevent an opponent from anticipating your aggression.`
                          : `Close to equilibrium: ${scoreCmp}. You chose Hawk in ${hawkPct}% of rounds (within ${hawkEssGap}% of the 23% mixed ESS benchmark), using randomized deterrence effectively to secure resources with no costly Hawk-Hawk fights.`;
                      } else if (hawkEssGap <= 25) {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? hawkPct < 23
                            ? `Noticeable deviation: ${scoreCmp}. You played Hawk in only ${hawkPct}% of rounds (yielding too frequently compared to the 23% ESS mix); always yielding gets exploited by an aggressive bot, surrendering territory without contesting it despite having ${crashes > 0 ? `${crashes} costly fight${crashes === 1 ? '' : 's'}` : 'no costly Hawk-Hawk fights'}.`
                            : `Noticeable deviation: ${scoreCmp}. You played Hawk in ${hawkPct}% of rounds (exceeding the 23% ESS mix); aggressive over-escalation triggered ${crashes} costly Hawk-Hawk fight${crashes === 1 ? '' : 's'} (-10 pts each), dragging down your score.`
                          : `Noticeable deviation: ${scoreCmp}. You played Hawk in ${hawkPct}% of rounds (a ${hawkEssGap}% gap from 23% ESS), staying ahead by timing your aggressive claims when ${activeBot.name} yielded, with no costly Hawk-Hawk fights.`;
                      } else {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? hawkPct < 23
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You played Hawk in only ${hawkPct}% of rounds; always yielding gets exploited by an aggressive bot, handing 6 points per round to ${activeBot.name} while earning 0, even with no costly Hawk-Hawk fights.`
                            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You played Hawk in ${hawkPct}% of rounds; stubborn aggression against an unyielding opponent resulted in ${crashes} devastating Hawk-Hawk fight${crashes === 1 ? '' : 's'} (-10 pts each), turning competition into mutual destruction.`
                          : `Productive deviation from theory: ${scoreCmp}. You played Hawk in ${hawkPct}% of rounds, departing widely from the 23% ESS baseline, yet forced concessions from ${activeBot.name} while avoiding costly Hawk-Hawk fights.`;
                      }
                      actualPayoff = `Whole Match Payoff: You: ${formatSignedPayoff(playerTotal)} · ${activeBot.name}: ${formatSignedPayoff(botTotal)}`;
                      realPeopleSentence = "Real players often play Hawk too frequently hoping the other will blink, but repeated mutual Hawk collisions quickly teach players to alternate or establish convention-based ownership (bourgeois strategies).";
                    } else if (selectedModuleId === 18) {
                      conceptBadge = "Coordination Games & Focal Points";
                      predictionLabel = "Pure & Mixed Strategy Nash Equilibria";
                      predictionTitle = `Coordinated Optimum: +3 or +2 pts/round (${matchRounds * 3} or ${matchRounds * 2} pts over ${formatUnit(matchRounds, 'round')})`;
                      predictionExplanation = `Battle of the Sexes has two pure Nash equilibria: (Opera, Opera) (+3 for you, +2 for Bot) and (Football, Football) (+2 for you, +3 for Bot). Miscoordination yields 0 pts. The mixed strategy equilibrium has Player playing Opera with probability 3/5 (0.60), yielding an expected payoff of only 1.2 pts per round.`;
                      predictionFrequency = "Pure Nash: 100% Opera or 100% Football · Mixed Nash: 60% Opera / 40% Football (EV = 1.2 pts/rd)";
                      predictionPayoff = `Coordinated Payoffs: +3 or +2 pts/round (+${matchRounds * 3} or +${matchRounds * 2} pts over ${formatUnit(matchRounds, 'round')}) · Miscoordination: 0 pts/round (0 pts over ${formatUnit(matchRounds, 'round')})`;

                      const operaCount = history.filter(h => h.playerAction === 'Opera').length;
                      const footballCount = matchRounds - operaCount;
                      const operaPct = Math.round((operaCount / matchRounds) * 100);
                      const coordCount = history.filter(h => (h.playerAction === 'Opera' && h.botAction === 'Opera') || (h.playerAction === 'Football' && h.botAction === 'Football')).length;
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Event Choices Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `${operaCount}/${matchRounds} Opera (${operaPct}%) · ${footballCount}/${matchRounds} Football (${100 - operaPct}%) · Coordinated ${coordCount}/${matchRounds} Rounds`;
                      if (coordCount >= Math.round(matchRounds * 0.7) || operaPct === 100 || operaPct === 0) {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? `Close to equilibrium: ${scoreCmp}. Although you coordinated in ${coordCount}/${matchRounds} rounds, you repeatedly conceded to the bot's preferred venue rather than alternating turns fairly.`
                          : (40 <= operaPct && operaPct <= 60)
                          ? `Close to equilibrium: ${scoreCmp}. You coordinated across rounds with an even ${operaPct}% Opera / ${100 - operaPct}% Football split, establishing an egalitarian turn-taking convention that maximized joint welfare.`
                          : `Close to equilibrium: ${scoreCmp}. You coordinated successfully in ${coordCount}/${matchRounds} rounds, asserting preference priority to lead scoring.`;
                      } else {
                        gapInterpretationSentence = `Noticeable deviation: ${scoreCmp}. You coordinated in ${coordCount}/${matchRounds} rounds; miscoordination clashes destroyed surplus as neither side conceded.`;
                      }
                      actualPayoff = `Whole Match Payoff: You: ${formatSignedPayoff(playerTotal)} · ${activeBot.name}: ${formatSignedPayoff(botTotal)} (Surplus: ${totalMatchSurplus} pts)`;
                      realPeopleSentence = "In laboratory experiments with repeated Battle of the Sexes, human pairs quickly learn to alternate turns (Opera in odd rounds, Football in even rounds) to achieve perfect 50/50 fairness without communication.";
                    } else if (selectedModuleId === 17) {
                      conceptBadge = "Zero-Sum Games & Minimax";
                      predictionLabel = "Unique Mixed Strategy Nash Equilibrium";
                      predictionTitle = `Minimax 50/50 Mix: 1.0 pt/round each (${(matchRounds * 1.0).toFixed(1)} pts over ${formatUnit(matchRounds, 'round')})`;
                      predictionExplanation = `Matching Pennies is strictly zero-sum. The unique Nash equilibrium is the Minimax mixed strategy where each player randomizes Heads and Tails with exact probability p = 0.50. Any deviation from 50/50 can be exploited by an opponent playing the best response, reducing expected payoff below 1.0 pt/round.`;
                      predictionFrequency = "Unique Mixed Equilibrium (Minimax): 50% Heads / 50% Tails (p = 0.50)";
                      predictionPayoff = `Unique Mixed Equilibrium (Minimax): 1.0 pt/round each (${(matchRounds * 1.0).toFixed(1)} pts over ${formatUnit(matchRounds, 'round')}) · Stake per round: +2 pts for winner, 0 for loser (50/50 mix)`;

                      const headsCount = history.filter(h => h.playerAction === 'Heads').length;
                      const tailsCount = matchRounds - headsCount;
                      const headsPct = Math.round((headsCount / matchRounds) * 100);
                      const winsCount = history.filter(h => h.playerAction === h.botAction).length;
                      const penniesGap = Math.abs(headsPct - 50);
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Coin Mix Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `${headsCount}/${matchRounds} Heads (${headsPct}%) · ${tailsCount}/${matchRounds} Tails (${100 - headsPct}%) · Won ${winsCount}/${matchRounds} Flips (${Math.round((winsCount / matchRounds) * 100)}%)`;
                      if (penniesGap <= 6) {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? `Close to equilibrium: ${scoreCmp}. Although your overall choice mix was near theoretical 50/50 (${headsPct}% Heads / ${100 - headsPct}% Tails), the ORDER of your choices was predictable, allowing ${activeBot.name} to anticipate your sequence; a true mixed strategy must also be unpredictable round to round, not just 50/50 in aggregate.`
                          : `Close to equilibrium: ${scoreCmp}. Your choice frequency was ${headsPct}% Heads and ${100 - headsPct}% Tails (within ${penniesGap}% of theoretical 50/50), maintaining true round-to-round unpredictability that prevented pattern exploitation and protected your expected payoff.`;
                      } else {
                        gapInterpretationSentence = `Noticeable deviation: ${scoreCmp}. Your choice frequency tilted to ${headsPct}% Heads and ${100 - headsPct}% Tails (a ${penniesGap}% gap from 50/50), and the ORDER of your choices looked predictable to ${activeBot.name}; a true mixed strategy must also be unpredictable round to round, in addition to maintaining a 50/50 frequency balance.`;
                      }
                      actualPayoff = `Whole Match Payoff: You: ${formatSignedPayoff(playerTotal)} · ${activeBot.name}: ${formatSignedPayoff(botTotal)} (Match Stake: ${matchRounds * 2} pts)`;
                      realPeopleSentence = "People are notoriously bad at producing true randomness; laboratory subjects tend to switch back and forth too frequently (negative serial correlation), which adaptive learning algorithms exploit to consistently win.";
                    } else if (selectedModuleId === 16) {
                      conceptBadge = "Subgame Perfection vs. Inequity Aversion";
                      predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                      predictionTitle = "SPNE Minimal Offer: $1.00/round (Proposer keeps $9.00/round)";
                      predictionExplanation = `Assuming pure self-interest, a rational responder accepts any positive sum ($1.00 > $0), so backward induction predicts the proposer offers $1.00 and keeps $9.00 per round ($${(matchRounds * 9).toFixed(2)} vs $${(matchRounds * 1).toFixed(2)} over ${formatUnit(matchRounds, 'round')}).`;
                      predictionFrequency = "Equilibrium Benchmark: Offer $1.00 (10% Pie Share; Proposer keeps 90%)";
                      predictionPayoff = `SPNE: Proposer $9.00/round ($${(matchRounds * 9).toFixed(2)} over ${formatUnit(matchRounds, 'round')}) · Responder $1.00/round ($${(matchRounds * 1).toFixed(2)} over ${formatUnit(matchRounds, 'round')})`;

                      const offers = history.map(h => Number(h.playerAction));
                      const avgOffer = Math.round((offers.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                      const acceptedCount = history.filter(h => h.botAction === 'Accept').length;
                      const offerPct = Math.round((avgOffer / 10) * 100);
                      const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                      actualFrequencyTitle = `Your Offers Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `Avg Offer: $${avgOffer.toFixed(2)} of $10.00 (${offerPct}% Share) · ${acceptedCount}/${matchRounds} Offers Accepted`;
                      if (avgOffer <= 1.50) {
                        gapInterpretationSentence = playerTotal < botTotal || acceptedCount < matchRounds
                          ? `Close to equilibrium: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} adhered strictly to the 10% SPNE prediction ($1.00), but ${activeBot.name} vetoed low-ball offers to $0 to punish perceived greed.`
                          : `Close to equilibrium: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} adhered closely to the 10% SPNE prediction ($1.00), helped by finding a rational partner who accepted positive crumbs.`;
                      } else {
                        gapInterpretationSentence = playerTotal >= botTotal * 0.8
                          ? `Productive deviation from theory: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} (${offerPct}%) departed substantially from the selfish $1 SPNE prediction to satisfy social fairness norms, securing agreement in ${acceptedCount}/${formatUnit(matchRounds, 'match')} and avoiding costly vetoes.`
                          : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Offering $${avgOffer.toFixed(2)} (${offerPct}%) ensured guaranteed agreement, though high generosity conceded the majority of the surplus to your partner.`;
                      }
                      actualPayoff = `Whole Match Payoff: You: $${playerTotal.toFixed(2)} · ${activeBot.name}: $${botTotal.toFixed(2)} (Surplus: $${totalMatchSurplus.toFixed(2)})`;
                      realPeopleSentence = "Across hundreds of cultural experiments around the globe, real proposers modal offer is 40% to 50%, and responders routinely reject offers below 30%, preferring zero payoff over tolerating perceived unfairness.";
                    } else if (selectedModuleId === 19) {
                      conceptBadge = "Trust, Reciprocity & Moral Hazard";
                      predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                      predictionTitle = "SPNE Zero Trust: Investor keeps 10 pts/round (Trustee gets 0)";
                      predictionExplanation = `Under standard backward induction, a selfish trustee will return 0 points from the tripled investment. Anticipating zero return, a rational investor sends 0 points, keeping 10 pts per round (${matchRounds * 10} vs 0 over ${formatUnit(matchRounds, 'round')}) rather than reaching the 30 pts joint social optimum (${matchRounds * 30} pts over ${formatUnit(matchRounds, 'round')}).`;
                      predictionFrequency = "Equilibrium Benchmark: Investor sends 0 pts (0% Trust Rate; Selfish Trustee returns 0 under SPNE)";
                      predictionPayoff = `SPNE: Investor keeps 10 pts/round, Trustee gets 0 (${matchRounds * 10} vs 0 over ${formatUnit(matchRounds, 'round')}) · Social Maximum: 15 pts each/round for fair 50/50 return (${matchRounds * 15} pts each over ${formatUnit(matchRounds, 'round')}; 30 pts/round joint total)`;

                      const investments = history.map(h => Number(h.playerAction));
                      const avgInv = Math.round((investments.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                      const trustRate = Math.round((avgInv / 10) * 100);
                      const returns = history.map(h => typeof h.botAction === 'number' ? h.botAction : 0);
                      const avgRet = Math.round((returns.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Transfers Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `Avg Transfer: ${avgInv}/10 pts (${trustRate}% Trust Rate) · Avg Return: ${avgRet} pts (Tripled to ${(avgInv * 3).toFixed(1)} pts/rd)`;
                      if (trustRate <= 15) {
                        gapInterpretationSentence = playerTotal >= botTotal
                          ? `Close to equilibrium: ${scoreCmp}. You transferred only ${avgInv}/10 pts (${trustRate}% trust rate), strictly adhering to the 0-point SPNE baseline and protecting your endowment from trustee moral hazard.`
                          : `Close to equilibrium: ${scoreCmp}. You transferred only ${avgInv}/10 pts (${trustRate}% trust rate), adhering to SPNE backward induction; you kept your capital safe, but missed out on the 3x surplus growth available through mutual trust.`;
                      } else {
                        gapInterpretationSentence = playerTotal < botTotal && playerTotal <= matchRounds * 10
                          ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You placed high trust in ${activeBot.name} by transferring ${trustRate}% of your endowment, but suffered losses because your partner exploited your vulnerability and kept the tripled wealth.`
                          : `Productive deviation from theory: ${scoreCmp}. By entrusting ${trustRate}% of your capital (${avgInv}/10 pts) instead of the 0-point SPNE prediction, you unlocked reciprocal wealth multiplication to generate high mutual returns with ${activeBot.name}.`;
                      }
                      actualPayoff = `Whole Match Capital: You: ${playerTotal} pts · ${activeBot.name}: ${botTotal} pts (Wealth: ${totalMatchSurplus} pts)`;
                      realPeopleSentence = "Real investors routinely send about 50% (5 pts) of their endowment, and trustees reciprocate by returning slightly more than the initial transfer, demonstrating that social trust and warm-glow reciprocity drive real markets.";
                    } else if (selectedModuleId === 12) {
                      conceptBadge = "Social Dilemma & Dominant Strategy";
                      predictionLabel = "Dominant Strategy Free-Riding";
                      predictionTitle = `Contribute 0 Tokens: 20 pts/round each (over ${formatUnit(matchRounds, 'round')}: ${matchRounds * 20} pts each)`;
                      predictionExplanation = `Because each token invested in the group pool returns only 0.80 points to the contributor (1.6x multiplier ÷ 2 players), contributing zero is a strictly dominant strategy. This traps both players at 20 pts per round (${matchRounds * 20} pts over ${formatUnit(matchRounds, 'round')}) instead of the 32 pts per round social optimum (${matchRounds * 32} pts over ${formatUnit(matchRounds, 'round')}).`;
                      predictionFrequency = "Equilibrium Benchmark: 100% Free-Riding (0 Tokens Contributed)";
                      predictionPayoff = `Nash Trap: 20 pts/round each (${matchRounds * 20} pts over ${formatUnit(matchRounds, 'round')}) · Social Optimum: 32 pts/round each (${matchRounds * 32} pts over ${formatUnit(matchRounds, 'round')})`;

                      const contribs = history.map(h => Number(h.playerAction));
                      const avgContrib = Math.round((contribs.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                      const zeroContribs = history.filter(h => Number(h.playerAction) === 0).length;
                      const contribPct = Math.round((avgContrib / 20) * 100);
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Giving Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `Avg Contribution: ${avgContrib}/20 Tokens (${contribPct}% Giving Rate) · ${zeroContribs}/${matchRounds} Zero-Contribution Rounds`;
                      if (contribPct <= 15) {
                        gapInterpretationSentence = playerTotal >= botTotal
                          ? `Close to equilibrium: ${scoreCmp}. You contributed only ${avgContrib}/20 tokens (${contribPct}%), adhering closely to the free-riding dominant strategy and keeping your private endowment safe while collecting pool dividends.`
                          : `Close to equilibrium: ${scoreCmp}. You contributed only ${avgContrib}/20 tokens (${contribPct}%), adhering to the dominant free-riding strategy, but mutual low contributions trapped both players at low scores.`;
                      } else {
                        gapInterpretationSentence = playerTotal < botTotal
                          ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You contributed generously (${contribPct}% of endowment), but suffered free-rider exploitation as ${activeBot.name} contributed less. Many people are conditional cooperators who are willing to contribute if others do, but cooperation tends to collapse when free-riders go unpunished.`
                          : `Productive deviation from theory: ${scoreCmp}. By contributing ${contribPct}% of your endowment (${avgContrib}/20 tokens) rather than the 0-token dominant strategy, you unlocked mutual wealth multiplication through reciprocal collective investment.`;
                      }
                      actualPayoff = `Whole Match Payoff: You: ${playerTotal} pts · ${activeBot.name}: ${botTotal} pts`;
                      realPeopleSentence = "In human experiments, contributions start high (~50% of tokens) but steadily collapse toward zero as participants discover free-riders in their group, unless costly punishment or social reputation mechanisms are introduced.";
                    } else if (selectedModuleId === 7) {
                      conceptBadge = "Truthful Mechanism Design & Weak Dominance";
                      predictionLabel = "Weakly Dominant Bidding Strategy";
                      predictionTitle = `Truthful Bidding (b = v = $${studentValuation}.00)`;
                      predictionExplanation = `In a second-price sealed-bid auction, bidding your true private value ($${studentValuation}.00) is a weakly dominant strategy. Bidding higher risks winner's curse (paying more than true value), while bidding lower sacrifices profitable winning opportunities without reducing the price you pay if you win.`;
                      predictionFrequency = `Weakly Dominant Benchmark: Bid = True Valuation ($${studentValuation}.00)`;
                      predictionPayoff = `Theoretical Surplus: $${Math.max(0, studentValuation - botValuation).toFixed(2)} when student values item higher than bot`;

                      const bids = history.map(h => Number(h.playerAction));
                      const avgBid = Math.round((bids.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                      const bidGap = Math.abs(avgBid - studentValuation);
                      const winsCount = history.filter(h => h.playerPayoff > 0).length;
                      const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                      actualFrequencyTitle = `Your Bidding Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `Avg Bid: $${avgBid.toFixed(2)} vs True Value $${studentValuation}.00 (Gap: $${bidGap.toFixed(2)}) · Won ${winsCount}/${matchRounds} Auctions`;
                      if (bidGap <= 0.50) {
                        gapInterpretationSentence = `Close to equilibrium: ${scoreCmp}. Your average bid of $${avgBid.toFixed(2)} was within $${bidGap.toFixed(2)} of your true valuation ($${studentValuation}.00), demonstrating mastery of second-price truthful bidding dominance.`;
                      } else {
                        gapInterpretationSentence = avgBid > studentValuation
                          ? `Noticeable deviation: ${scoreCmp}. You overbid by an average of $${bidGap.toFixed(2)} above true valuation ($${studentValuation}.00); while this won auctions, it exposed you to negative profit margins.`
                          : `Noticeable deviation: ${scoreCmp}. You shaded your bid below true valuation by $${bidGap.toFixed(2)}; unlike first-price auctions, bid shading in second-price auctions never lowers the price you pay.`;
                      }
                      actualPayoff = `Whole Match Payoff: You: $${playerTotal.toFixed(2)} · ${activeBot.name}: $${botTotal.toFixed(2)}`;
                      realPeopleSentence = "Laboratory participants routinely overbid in second-price auctions due to an emotional joy of winning, only discovering the wisdom of truthful bidding after repeatedly suffering the winner's curse.";
                    } else if (selectedModuleId === 14) {
                      conceptBadge = "Bertrand Price War Paradox";
                      predictionLabel = "Nash Price Equilibrium at Marginal Cost";
                      predictionTitle = "P* = MC = $10.00 (Zero Economic Profit)";
                      predictionExplanation = `Because buyers purchase exclusively from whichever seller offers the lower price, each firm has a relentless incentive to undercut the rival by $1. This destructive price war iterates downward until price equals marginal cost ($P = $10.00), collapsing economic profit to zero.`;
                      predictionFrequency = "Nash Price Equilibrium: P = $10.00 (Zero Economic Profit)";
                      predictionPayoff = "Nash Equilibrium Profit: $0.00 each at P = $10 · Joint Monopoly Profit: $1,200 each at P = $40";

                      const prices = history.map(h => Number(h.playerAction));
                      const avgPrice = Math.round((prices.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                      const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                      actualFrequencyTitle = `Your Pricing Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `Avg Price: $${avgPrice.toFixed(2)} (Marginal Cost: $10.00) · Lowest Price: $${Math.min(...prices)} · Highest: $${Math.max(...prices)}`;
                      if (avgPrice <= 15) {
                        gapInterpretationSentence = `Close to equilibrium: ${scoreCmp}. Your average price of $${avgPrice.toFixed(2)} approached marginal cost ($10.00), demonstrating the Bertrand paradox price collapse.`;
                      } else {
                        gapInterpretationSentence = `Noticeable deviation: ${scoreCmp}. You priced at an average of $${avgPrice.toFixed(2)}, attempting to preserve margin surplus above the competitive Bertrand cost trap.`;
                      }
                      actualPayoff = `Whole Match Profit: You: $${playerTotal.toFixed(2)} · ${activeBot.name}: $${botTotal.toFixed(2)}`;
                      realPeopleSentence = "In laboratory duopoly markets with fixed identical costs, prices initially stay around $30 to $40 as sellers attempt tacit collusion, but a single undercutting defector rapidly sparks a race to the bottom.";
                    } else if (selectedModuleId === 11) {
                      conceptBadge = "Keynesian Beauty Contest & Level-k";
                      predictionLabel = "Iterated Dominance Nash Equilibrium";
                      predictionTitle = "Nash Equilibrium Guess = 0 (Iterated 2/3 Elimination)";
                      predictionExplanation = "Iterated elimination of dominated strategies cascades downward: any guess > 66.7 is dominated (2/3 of 100), which makes any guess > 44.4 dominated (2/3 of 66.7), iteratively converging to Guess = 0.";
                      predictionFrequency = "Equilibrium Benchmark: Guess = 0 (Level-0: ~50, Level-1: ~33, Level-2: ~22)";
                      predictionPayoff = `Unique Nash: Guess = 0 (5 pts/round each on tie, ${matchRounds * 5} pts over ${formatUnit(matchRounds, 'round')}) · Level-1: ~33 · Level-2: ~22`;

                      const guesses = history.map(h => Number(h.playerAction));
                      const avgGuess = Math.round(guesses.reduce((a, b) => a + b, 0) / matchRounds);
                      const winsCount = history.filter(h => h.playerPayoff > (h.botPayoff || 0)).length;
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Guessing Across ${formatUnit(matchRounds, 'Round')}`;
                      actualFrequencyBreakdown = `Avg Guess: ${avgGuess} · Won ${winsCount}/${matchRounds} Contests (Nash Benchmark: 0)`;
                      if (avgGuess <= 10) {
                        gapInterpretationSentence = `Close to equilibrium: ${scoreCmp}. Your average guess of ${avgGuess} approached the theoretical Nash equilibrium of 0.`;
                      } else if (avgGuess <= 35) {
                        gapInterpretationSentence = `Noticeable deviation: ${scoreCmp}. Your average guess of ${avgGuess} targeted Level-1 (~33) or Level-2 (~22), anticipating human bounded rationality.`;
                      } else {
                        gapInterpretationSentence = `Systematic deviation: ${scoreCmp}. Your average guess of ${avgGuess} anchored near the intuitive midpoint (~50).`;
                      }
                      actualPayoff = `Whole Match Points: You: ${playerTotal} pts · ${activeBot.name}: ${botTotal} pts`;
                      realPeopleSentence = "Real human cohorts average 1 to 2 steps of strategic reasoning (Level-1 to Level-2), making guesses between 20 and 35 routinely win over the theoretically rational guess of 0.";
                    } else if (selectedModuleId === 20) {
                      conceptBadge = "Backward Induction & Rosenthal's Paradox";
                      predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                      predictionTitle = "SPNE Immediate Take at Node 1: (+2, 0) pts per chain";
                      predictionExplanation = `Backward induction from Node 6 backward predicts that fear of partner defection compels Player 1 to defect immediately at Node 1, securing +2 pts while giving the bot 0 pts per chain (${matchRounds * 2} vs 0 over ${formatUnit(matchRounds, 'chain')}) instead of reaching the +8 pts each cooperative optimum (${matchRounds * 8} pts each over ${formatUnit(matchRounds, 'chain')}).`;
                      predictionFrequency = "Equilibrium Benchmark: 100% Immediate Take at Node 1 (SPNE Path)";
                      predictionPayoff = `SPNE Defection: +2 pts/chain for you, 0 for bot (${matchRounds * 2} vs 0 over ${formatUnit(matchRounds, 'chain')}) · Social Optimum: +8 pts each/chain (${matchRounds * 8} pts each over ${formatUnit(matchRounds, 'chain')})`;

                      const n1Takes = history.filter(h => String(h.playerAction).includes('Node 1')).length;
                      const passedN1Count = matchRounds - n1Takes;
                      const passedN1Pct = Math.round((passedN1Count / matchRounds) * 100);
                      const scoreCmp = getScoreCmp(playerTotal, botTotal);

                      actualFrequencyTitle = `Your Decisions Across ${formatUnit(matchRounds, 'Centipede Chain')}`;
                      actualFrequencyBreakdown = `${n1Takes}/${matchRounds} Node 1 Immediate Takes · ${passedN1Count}/${matchRounds} Chains Passed Beyond Node 1 (${passedN1Pct}% Trust Rate)`;
                      if (passedN1Pct <= 15) {
                        gapInterpretationSentence = `Close to equilibrium: ${scoreCmp}. You took at Node 1 in ${n1Takes}/${matchRounds} chains, adhering to SPNE backward induction.`;
                      } else {
                        gapInterpretationSentence = `Productive deviation from theory: ${scoreCmp}. You passed beyond Node 1 in ${passedN1Pct}% of chains, directly defying backward induction to build sequential wealth.`;
                      }
                      actualPayoff = `Cumulative Match Score: You: ${formatSignedPayoff(playerTotal)} · ${activeBot.name}: ${formatSignedPayoff(botTotal)} (Wealth: ${totalMatchSurplus} pts)`;
                      realPeopleSentence = "In laboratory experiments, real people routinely pass because reciprocal trust offers massive mutual gains, and players only risk losing a single point to double the pot.";
                    }

                    return (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                          <div>
                            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                              Advanced Game Theory · Step 4 of 5
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                              Deep Dive Analysis & Empirical Data
                            </h2>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            {/* Segmented Simple/Expert Mode Switcher */}
                            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                              <button
                                type="button"
                                onClick={() => toggleBriefingMode('simple')}
                                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  briefingMode === 'simple'
                                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <span>⚡ Simple</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleBriefingMode('expert')}
                                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  briefingMode === 'expert'
                                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <span>🔬 Expert</span>
                              </button>
                            </div>

                            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-3 py-1.5 rounded-xl border border-blue-800/80">
                              <AnnotateGlossaryText text={conceptBadge} />
                            </span>
                          </div>
                        </div>

                        {briefingMode === 'simple' ? (
                          /* ========================================================================= */
                          /* SIMPLE DEEP DIVE: Concise plain-language summary & empirical finding      */
                          /* ========================================================================= */
                          <div className="space-y-4">
                            {/* Simple Strategic Insight Card */}
                            <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                                <span>💡 Strategic Theory in Plain English</span>
                                <span className="font-mono text-xs text-emerald-400 font-bold">⚡ Simple Summary</span>
                              </div>
                              <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                                <AnnotateGlossaryText text={predictionExplanation} />
                              </p>
                              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs sm:text-sm font-mono text-blue-200">
                                <AnnotateGlossaryText text={predictionPayoff} />
                              </div>
                            </div>

                            {/* What Real People Do */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/60 border border-blue-700/60 text-slate-100 space-y-1.5">
                              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                                👥 What Real People Tend to Do & Why:
                              </div>
                              <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
                                <AnnotateGlossaryText text={realPeopleSentence} />
                              </p>
                            </div>

                            {/* Switch to Expert Mode Button */}
                            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                              <div>
                                <div className="text-sm font-bold text-white">Want the full formal breakdown?</div>
                                <div className="text-xs text-slate-400 mt-0.5">Explore detailed equilibrium benchmarks, gap interpretations, and round-by-round tables.</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleBriefingMode('expert')}
                                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shrink-0 cursor-pointer shadow"
                              >
                                🔬 Switch to Expert Mode →
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ========================================================================= */
                          /* EXPERT DEEP DIVE: All 4 Collapsible Accordions & Detailed History Table   */
                          /* ========================================================================= */
                          <div className="space-y-4">
                            {/* Collapsible Sections under "Go deeper" */}
                            <div className="space-y-3">
                          {/* Section 1: Theory vs Actual Play */}
                          <details className="group bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden transition-all shadow-md">
                            <summary className="min-h-[56px] px-4 sm:px-5 py-3.5 font-bold text-base sm:text-lg text-white cursor-pointer flex items-center justify-between hover:bg-slate-900 select-none">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">📊</span>
                                <span>Theory vs. Actual Play</span>
                              </div>
                              <span className="text-slate-400 group-open:rotate-90 transition-transform font-mono text-sm">▸</span>
                            </summary>
                            <div className="p-4 sm:p-5 border-t border-slate-800 space-y-4 bg-slate-900/40">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-900/90 p-4 rounded-xl border border-rose-900/50 space-y-2">
                                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex justify-between">
                                    <span><AnnotateGlossaryText text={predictionLabel} /></span>
                                    <span className="font-mono text-rose-300">Theory</span>
                                  </div>
                                  <div className="text-base font-black text-white font-mono break-words">
                                    <AnnotateGlossaryText text={predictionTitle} />
                                  </div>
                                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                                    <AnnotateGlossaryText text={predictionExplanation} />
                                  </p>
                                  <div className="text-xs sm:text-sm font-mono font-bold text-rose-300/90 pt-2 border-t border-slate-800 break-words">
                                    <AnnotateGlossaryText text={predictionPayoff} />
                                  </div>
                                </div>

                                <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-900/50 space-y-2">
                                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex justify-between">
                                    <span>Actual Performance</span>
                                    <span className="font-mono text-emerald-300">{matchRounds} {pluralWord(matchRounds, 'Rd', 'Rds')}</span>
                                  </div>
                                  <div className="text-base font-black text-white font-mono break-words">
                                    {actualFrequencyTitle}
                                  </div>
                                  <div className="text-xs sm:text-sm font-mono font-bold text-emerald-300/90 pt-2 border-t border-slate-800 break-words">
                                    {actualPayoff}
                                  </div>
                                  <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-1">
                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <span>{activeBot.avatar}</span>
                                      <span>{activeBot.name}'s Strategic Rationale:</span>
                                    </div>
                                    <p className="text-sm text-slate-300 italic leading-relaxed">
                                      "{lastRoundResult.botRationale}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </details>

                          {/* Section 2: Equilibrium Frequency Benchmark */}
                          <details className="group bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden transition-all shadow-md">
                            <summary className="min-h-[56px] px-4 sm:px-5 py-3.5 font-bold text-base sm:text-lg text-white cursor-pointer flex items-center justify-between hover:bg-slate-900 select-none">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">🎯</span>
                                <span>Equilibrium Frequency Benchmark</span>
                              </div>
                              <span className="text-slate-400 group-open:rotate-90 transition-transform font-mono text-sm">▸</span>
                            </summary>
                            <div className="p-4 sm:p-5 border-t border-slate-800 space-y-3 bg-slate-900/40">
                              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                                  Theoretical Benchmark Frequency
                                </div>
                                <div className="text-sm sm:text-base font-mono font-bold text-rose-200">
                                  <AnnotateGlossaryText text={predictionFrequency} />
                                </div>
                              </div>
                              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                  Your Choice Frequencies Across {formatUnit(matchRounds, 'Round')}
                                </div>
                                <div className="text-sm sm:text-base font-mono font-bold text-emerald-300">
                                  {actualFrequencyBreakdown}
                                </div>
                              </div>
                            </div>
                          </details>

                          {/* Section 3: Gap vs. Equilibrium */}
                          <details className="group bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden transition-all shadow-md">
                            <summary className="min-h-[56px] px-4 sm:px-5 py-3.5 font-bold text-base sm:text-lg text-white cursor-pointer flex items-center justify-between hover:bg-slate-900 select-none">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">⚖️</span>
                                <span>Gap vs. Equilibrium</span>
                              </div>
                              <span className="text-slate-400 group-open:rotate-90 transition-transform font-mono text-sm">▸</span>
                            </summary>
                            <div className="p-4 sm:p-5 border-t border-slate-800 space-y-3 bg-slate-900/40">
                              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
                                <AnnotateGlossaryText text={gapInterpretationSentence} />
                              </div>
                            </div>
                          </details>

                          {/* Section 4: What Real People Tend to Do & Why */}
                          <details className="group bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden transition-all shadow-md">
                            <summary className="min-h-[56px] px-4 sm:px-5 py-3.5 font-bold text-base sm:text-lg text-white cursor-pointer flex items-center justify-between hover:bg-slate-900 select-none">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">👥</span>
                                <span>What Real People Tend to Do & Why</span>
                              </div>
                              <span className="text-slate-400 group-open:rotate-90 transition-transform font-mono text-sm">▸</span>
                            </summary>
                            <div className="p-4 sm:p-5 border-t border-slate-800 space-y-3 bg-slate-900/40">
                              <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-700/60 text-slate-100 text-base sm:text-lg leading-relaxed font-medium">
                                <strong className="text-amber-300 font-bold block sm:inline mb-1 sm:mb-0">Empirical Finding: </strong>
                                <span><AnnotateGlossaryText text={realPeopleSentence} /></span>
                              </div>
                            </div>
                          </details>
                        </div>

                        {/* Experiment Match History Table */}
                        {history.length > 0 && (
                          <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 shadow-md">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-white text-base">Match History Log</span>
                              <div className="font-mono font-bold text-sm">
                                <span className="text-emerald-400">You: {formatSignedPayoffShort(playerTotalScore, isDollarGame)}</span>
                                <span className="text-slate-500 mx-2">vs</span>
                                <span className={activeBot.color}>{activeBot.name}: {formatSignedPayoffShort(botTotalScore, isDollarGame)}</span>
                              </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-800">
                              <table className="w-full text-left text-xs sm:text-sm font-mono">
                                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                                  <tr>
                                    <th className="p-3">#</th>
                                    <th className="p-3">Your Move</th>
                                    <th className="p-3">{activeBot.name}</th>
                                    <th className="p-3">Your Payoff</th>
                                    <th className="p-3">Bot Payoff</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                                  {history.map(item => (
                                    <tr key={item.round} className="hover:bg-slate-800/40">
                                      <td className="p-3 text-slate-400">#{item.round}</td>
                                      <td className="p-3 text-white font-bold">{String(item.playerAction)}</td>
                                      <td className={`p-3 font-bold ${activeBot.color}`}>{String(item.botAction)}</td>
                                      <td className={`p-3 font-bold ${item.playerPayoff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatSignedPayoff(item.playerPayoff, isDollarGame)}
                                      </td>
                                      <td className={`p-3 font-bold ${item.botPayoff >= 0 ? 'text-slate-300' : 'text-rose-400'}`}>
                                        {formatSignedPayoff(item.botPayoff, isDollarGame)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                            <div className="text-center pt-1">
                              <button
                                type="button"
                                onClick={() => toggleBriefingMode('simple')}
                                className="text-xs text-slate-400 hover:text-blue-300 font-medium cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                              >
                                <span>Prefer a clean, quick summary?</span>
                                <span className="text-blue-400 font-bold underline">Switch to Simple Mode</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Navigation Buttons in Step 4 */}
                        <div className="pt-3 space-y-3">
                          <button
                            type="button"
                            onClick={() => scrollToStep(3)}
                            className="w-full min-h-[56px] py-4 px-6 text-base sm:text-lg font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                          >
                            <span>← Back to Result Summary (Step 3)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => scrollToStep(5)}
                            className="w-full min-h-[56px] py-4 px-6 text-lg sm:text-xl font-black bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all ring-1 ring-blue-400/40"
                          >
                            <span>⚡ Proceed to Quick Check Quiz (Step 5) →</span>
                          </button>

                          {currentRound < totalRounds ? (
                            <button
                              type="button"
                              onClick={handleNextRound}
                              className="w-full min-h-[56px] py-4 px-6 text-base sm:text-lg font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                              <span>Play Another Trial (Round {currentRound + 1} of {totalRounds}) →</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                resetExperiment();
                                scrollToStep(2);
                              }}
                              className="w-full min-h-[56px] py-4 px-6 text-base sm:text-lg font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                              <span>🔄 Play Again (Test Another Choice)</span>
                            </button>
                          )}

                          {/* Launch What-If Sandbox Button */}
                          <button
                            type="button"
                            onClick={() => onOpenWhatIfSandbox && onOpenWhatIfSandbox(selectedModuleId)}
                            className="w-full min-h-[56px] py-4 px-6 text-base sm:text-lg font-bold bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 border border-blue-700/60 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                          >
                            <span>∫ Test Strategic Curves in What-If Sandbox (Game {currentModuleIndex}: {activeModule.shortTitle}) →</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 5: QUICK CHECK QUIZ (EQUILIBRIUM MASTERY)                            */}
            {/* ========================================================================= */}
            <div className={`w-full min-w-full shrink-0 snap-center snap-always px-1 sm:px-2 ${activeStep === 2 && !isRoundResolved ? 'max-h-0 lg:max-h-none overflow-hidden' : ''}`}>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 text-slate-100 max-w-4xl mx-auto">
                {!isRoundResolved ? (
                  /* If round is not yet resolved */
                  <div className="bg-slate-950/90 rounded-2xl p-6 sm:p-8 border border-slate-800 text-center space-y-4">
                    <div className="text-4xl">⏳</div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Match Decision Needed First</h3>
                    <p className="text-base sm:text-lg text-slate-200 max-w-md mx-auto leading-relaxed">
                      Complete your decision in Step 2 to view your match outcome and unlock the Quick Check Quiz.
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToStep(2)}
                      className="w-full min-h-[56px] py-4 px-6 text-lg font-black bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Go to Step 2: Make Your Choice →</span>
                    </button>
                  </div>
                ) : isQuizCompleted ? (
                  /* QUIZ SCORE COMPLETION SCREEN */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                          Game {currentModuleIndex} of {totalModulesCount} · Step 5 of 5
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                          ⚡ Quick Check: Final Results
                        </h2>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                        ✓ Quiz Completed
                      </span>
                    </div>

                    {/* Score Presentation Card */}
                    <div className="bg-slate-950/90 rounded-2xl p-6 sm:p-8 border border-slate-800 text-center space-y-4 shadow-xl">
                      <div className="text-4xl sm:text-5xl">
                        {quizScore === 3 ? '🏆' : quizScore === 2 ? '🎖️' : '💡'}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Your Quiz Score
                        </div>
                        <div className="text-5xl sm:text-6xl font-black text-amber-400 font-mono tracking-tight">
                          {quizScore} / 3
                        </div>
                      </div>

                      <p className="text-base sm:text-lg text-slate-100 max-w-lg mx-auto leading-relaxed font-medium">
                        {quizScore === 3
                          ? '🌟 Perfect 3 / 3! You have completely mastered the equilibrium concept and strategic mechanics of this game.'
                          : quizScore === 2
                          ? '👍 Great job! 2 / 3 correct. You have a solid grasp of the game\'s core theoretical equilibrium and behavioral patterns.'
                          : quizScore === 1
                          ? '💡 1 / 3 correct. Review the Deep Dive step to strengthen your understanding of the equilibrium.'
                          : '📚 0 / 3 correct. Don\'t worry! Check the rules and Deep Dive analysis, then take another shot.'}
                      </p>

                      <div className="pt-2 flex items-center justify-center gap-3 text-xs sm:text-sm font-mono text-slate-400">
                        <span className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                          <span>🎯 Personal Best:</span>
                          <strong className="text-white font-bold">{Math.max(quizScore, bestQuizScores[selectedModuleId] || 0)} / 3</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          markGameCompleted(selectedModuleId);
                          resetExperiment(undefined, nextModule.id);
                        }}
                        className="w-full min-h-[56px] py-4 px-6 text-lg sm:text-xl font-black bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all ring-1 ring-emerald-400/40"
                      >
                        <span>Proceed to Next Game (#{nextModuleIndex}: {nextModule.shortTitle}) →</span>
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={handleRetryQuiz}
                          className="w-full min-h-[56px] py-3.5 px-5 text-base sm:text-lg font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <span>Retake Quick Check ↺</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => scrollToStep(4)}
                          className="w-full min-h-[56px] py-3.5 px-5 text-base sm:text-lg font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <span>← Review Deep Dive (Step 4)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ACTIVE QUIZ QUESTION SCREEN (ONE QUESTION AT A TIME) */
                  <div className="space-y-5 w-full max-w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                          Game {currentModuleIndex} of {totalModulesCount} · Step 5 of 5
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                          ⚡ Quick Check: Equilibrium Mastery
                        </h2>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
                        <div className="inline-flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                          <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                            Question {quizQuestionIndex + 1} of {currentQuizQuestions.length}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs sm:text-sm font-mono text-slate-300">
                            Score: <strong className="text-emerald-400 font-bold">{quizCorrectCount}</strong> / {quizAnsweredCount}
                          </span>
                        </div>
                        {/* Question indicator pills */}
                        <div className="flex items-center gap-1.5">
                          {currentQuizQuestions.map((_, qIdx) => {
                            const isAns = quizAnswers[qIdx] !== null;
                            const isCor = isAns && quizAnswers[qIdx] === currentQuizQuestions[qIdx]?.correctIndex;
                            return (
                              <div
                                key={qIdx}
                                className={`h-2.5 rounded-full transition-all ${
                                  qIdx === quizQuestionIndex
                                    ? 'w-7 bg-amber-400 animate-pulse'
                                    : isAns
                                    ? isCor
                                      ? 'w-5 bg-emerald-500'
                                      : 'w-5 bg-rose-500'
                                    : 'w-3 bg-slate-800'
                                }`}
                                title={`Question ${qIdx + 1} of ${currentQuizQuestions.length}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-3 shadow-md">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-950/70 border border-amber-800/80 px-2.5 py-1 rounded-lg">
                          Question {quizQuestionIndex + 1} of {currentQuizQuestions.length}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {quizSelectedOption === null ? 'Tap an answer below' : 'Answer recorded'}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed break-words">
                        {currentQuizQ.question}
                      </h3>
                    </div>

                    {/* Big Tap Target Options (>=56px, 16-18px text, fully responsive with no horizontal overflow) */}
                    <div className="space-y-3 w-full">
                      {currentQuizQ.options.map((option, optIdx) => {
                        const isSelected = quizSelectedOption === optIdx;
                        const isAnswered = quizSelectedOption !== null;
                        const isCorrect = optIdx === currentQuizQ.correctIndex;

                        let buttonStyle = 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-100';
                        let badgeIcon = null;

                        if (isAnswered) {
                          if (isCorrect) {
                            buttonStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40 shadow-lg font-semibold';
                            badgeIcon = <span className="text-emerald-400 font-black text-sm shrink-0">✓ Correct</span>;
                          } else if (isSelected) {
                            buttonStyle = 'bg-rose-950/70 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 shadow-lg font-semibold';
                            badgeIcon = <span className="text-rose-400 font-black text-sm shrink-0">✗ Your Choice</span>;
                          } else {
                            buttonStyle = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleSelectQuizOption(optIdx)}
                            className={`w-full min-h-[56px] p-4 rounded-2xl text-left text-base sm:text-lg flex items-center justify-between gap-3 border transition-all cursor-pointer active:scale-[0.99] ${buttonStyle}`}
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-900 border border-slate-800 shrink-0 mt-0.5 text-slate-400">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-snug break-words flex-1 text-sm sm:text-base font-medium">{option}</span>
                            </div>
                            {badgeIcon}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Feedback Box with One-Sentence Plain Language Explanation */}
                    {quizSelectedOption !== null && (
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border space-y-2 animate-in fade-in duration-200 break-words ${
                          quizSelectedOption === currentQuizQ.correctIndex
                            ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                            : 'bg-amber-950/50 border-amber-700/80 text-amber-200'
                        }`}
                      >
                        <div className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span>{quizSelectedOption === currentQuizQ.correctIndex ? '✓ Correct Answer!' : '💡 Key Concept Explanation:'}</span>
                        </div>
                        <p className="text-base sm:text-lg leading-relaxed text-slate-100 font-medium">
                          {currentQuizQ.explanation}
                        </p>
                      </div>
                    )}

                    {/* Action Button: Next Question or See Results */}
                    {quizSelectedOption !== null && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleNextQuizQuestion}
                          className="w-full min-h-[56px] py-4 px-6 text-lg sm:text-xl font-black bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <span>
                            {quizQuestionIndex < currentQuizQuestions.length - 1
                              ? `Next Question (Question ${quizQuestionIndex + 2} of ${currentQuizQuestions.length}) →`
                              : 'See Final Score & Complete Quick Check →'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MOBILE STICKY BOTTOM ACTION DOCK (Step 2 Choice Step Ergonomics)           */}
          {/* Visible ONLY on narrow screens (lg:hidden) during Step 2 when unresolved   */}
          {/* Automatically hidden when game picker is open so it does not cover list     */}
          {/* ========================================================================= */}
          {activeStep === 2 && !isRoundResolved && !isGamePickerExpanded && (
            <div
              ref={mobileDockRef}
              className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-12px_40px_rgba(0,0,0,0.95)] px-3 sm:px-4 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-200"
              role="region"
              aria-label="Choice decision dock"
            >
              {/* Primary Interactive Choice Controls (scrollable up to 40% of viewport for multi-control games) */}
              <div className="w-full max-w-lg mx-auto max-h-[40vh] overflow-y-auto overscroll-contain pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
                {isBotThinking ? (
                  <div className="p-3 rounded-xl bg-indigo-950/90 border border-indigo-500/70 shadow-lg flex items-center gap-2.5 animate-in fade-in duration-150">
                    <span className="text-2xl p-1 rounded-lg bg-slate-900 border border-slate-700 shrink-0">{activeBot.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        <span>{activeBot.name} is deciding</span>
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"></span>
                        </span>
                      </div>
                      <p className="text-xs text-indigo-100 italic font-medium truncate">
                        💭 &ldquo;{currentBotThought}&rdquo;
                      </p>
                    </div>
                  </div>
                ) : (
                  renderMobileActionDockControls()
                )}
              </div>

              {/* Primary Confirm Button (at least 56px tall, stays anchored and visible below controls) */}
              <div className="w-full max-w-lg mx-auto shrink-0">
                <button
                  type="button"
                  disabled={isBotThinking}
                  onClick={handleSubmitRound}
                  className={`w-full min-h-[56px] py-3 px-4 text-base sm:text-lg font-black rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all ${
                    isBotThinking
                      ? 'bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 cursor-wait'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 active:from-blue-700 active:to-indigo-700 text-white shadow-blue-950/60 cursor-pointer active:scale-[0.98] ring-1 ring-blue-400/40'
                  }`}
                >
                  {isBotThinking ? (
                    <span className="flex items-center gap-2 text-sm sm:text-base">
                      <span className="animate-spin text-base">⏳</span>
                      <span>{activeBot.name} is thinking...</span>
                    </span>
                  ) : (
                    <>
                      <span>
                        {selectedModuleId === 20
                          ? `Confirm Node ${centipedeNode} Choice (${centipedeChoice})`
                          : totalRounds > 1
                          ? `Confirm Round ${currentRound} of ${totalRounds} Decision`
                          : `Confirm Your Decision`}
                      </span>
                      {totalRounds > 1 && (
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-950/80 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full">
                          R{currentRound}/{totalRounds}
                        </span>
                      )}
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
