import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';
import {
  RoundHistoryEntry,
  GameSpecificBot,
  getBotsForGame,
  getBotStrategySummary
} from '../services/botEngine';
import { TheoryDebrief, DebriefData } from './TheoryDebrief';
import { InteractiveMatrixVisualizer } from './InteractiveMatrixVisualizer';
import { GlossaryTerm, AnnotateGlossaryText } from './GlossaryTerm';
import { drawValuation } from '../utils/auctionEngine';
import { safeStorage } from '../utils/safeStorage';

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
}

export const SoloLabView: React.FC<SoloLabViewProps> = ({
  allGames: _allGames,
  onOpenWhatIfSandbox,
  onSwitchToLiveClass,
  onModuleChange
}) => {
  // Solo Lab Supported Educational Modules
  const availableModules = [
    {
      id: 6,
      title: "Repeated Prisoner's Dilemma",
      shortTitle: "Repeated Dilemma",
      icon: "🔁",
      category: "Cooperation & Trust",
      description: "Explore how repeat interactions, reciprocity (Tit-for-Tat), and retaliatory threats can overcome the one-shot tragedy of defection."
    },
    {
      id: 13,
      title: "Stag Hunt Coordination",
      shortTitle: "Stag Hunt",
      icon: "🦌",
      category: "Strategic Coordination & Trust",
      description: "Navigate multiple Nash equilibria: will you risk hunting the +10 Stag, or retreat to the safe +4 Hare?"
    },
    {
      id: 14,
      title: "Bertrand Duopoly Price War",
      shortTitle: "Bertrand Duopoly",
      icon: "🏷️",
      category: "Pricing & Market Competition",
      description: "Experience the Bertrand Paradox: can tacit collusion survive against myopic undercutting to marginal cost?"
    },
    {
      id: 7,
      title: "Vickrey Second-Price Auction",
      shortTitle: "Vickrey Auction",
      icon: "⚖️",
      category: "Auctions & Market Design",
      description: "Discover why truthful bidding is a dominant strategy when the clearing price is decoupled from your own bid."
    },
    {
      id: 11,
      title: "Keynesian Beauty Contest",
      shortTitle: "Beauty Contest",
      icon: "💭",
      category: "Information & Strategic Thinking",
      description: "Test your depth of strategic thinking (Level-k reasoning) against bots with varying degrees of rationality."
    },
    {
      id: 12,
      title: "Public Goods Dilemma",
      shortTitle: "Public Goods",
      icon: "🌍",
      category: "Social Dilemmas & Cooperation",
      description: "Investigate free-riding and group efficiency in a tragedy-of-the-commons public funding pool."
    },
    {
      id: 15,
      title: "Hawk-Dove Brinkmanship",
      shortTitle: "Hawk-Dove",
      icon: "🦅",
      category: "Brinkmanship & Anti-Coordination",
      description: "Navigate dangerous anti-coordination: will you play aggressive Hawk or peaceful Dove when mutual aggression causes catastrophic collision?"
    },
    {
      id: 16,
      title: "Ultimatum Bargaining & Fairness",
      shortTitle: "Ultimatum Bargaining",
      icon: "🍰",
      category: "Bargaining & Behavioral Fairness",
      description: "Propose a split of $10 to a responder bot who can accept or reject. If rejected, both get $0!"
    },
    {
      id: 17,
      title: "Matching Pennies (Zero-Sum)",
      shortTitle: "Matching Pennies",
      icon: "🪙",
      category: "Zero-Sum & Mixed Strategies",
      description: "Experience pure zero-sum conflict with zero pure-strategy Nash equilibria. Outguess the bot or randomize with p = 0.5!"
    },
    {
      id: 18,
      title: "Battle of the Sexes",
      shortTitle: "Battle of the Sexes",
      icon: "🎭",
      category: "Coordination & Conflict",
      description: "Coordinate on Opera vs Football when preferences clash. Will you concede, insist on your favorite, or alternate turns?"
    },
    {
      id: 19,
      title: "The Trust Game (Investment)",
      shortTitle: "The Trust Game",
      icon: "🏦",
      category: "Trust & Reciprocity",
      description: "Invest up to 10 points to triple your capital (3x). Will the trustee reciprocate with a fair return, or defect and keep everything?"
    },
    {
      id: 20,
      title: "The Centipede Game (Sequential Backward Induction)",
      shortTitle: "Centipede Game",
      icon: "🐛",
      category: "Extensive Form & Backward Induction",
      description: "Sequential trust game along a 6-node tree. Will you Pass to grow the pot, or does backward induction force immediate defection?"
    }
  ];

  const [selectedModuleId, setSelectedModuleId] = useState<number>(6);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 5;

  // Track completed Solo Lab games across the 12-game suite
  const [completedGameIds, setCompletedGameIds] = useState<number[]>(() => {
    try {
      const saved = safeStorage.getItem('gameTheoryCompletedSoloGames');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markGameCompleted = (gameId: number) => {
    setCompletedGameIds(prev => {
      if (!prev.includes(gameId)) {
        const updated = [...prev, gameId];
        try {
          safeStorage.setItem('gameTheoryCompletedSoloGames', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  };

  const currentModuleIndex = availableModules.findIndex(m => m.id === selectedModuleId) + 1;
  const totalModulesCount = availableModules.length;
  const nextModuleIndex = (currentModuleIndex % totalModulesCount) + 1;
  const nextModule = availableModules[nextModuleIndex - 1];

  // Round Action State
  const [pdChoice, setPdChoice] = useState<'Cooperate' | 'Defect'>('Cooperate');
  const [stagChoice, setStagChoice] = useState<'Stag' | 'Hare'>('Stag');
  const [hawkChoice, setHawkChoice] = useState<'Hawk' | 'Dove'>('Dove');
  const [ultimatumOffer, setUltimatumOffer] = useState<number>(4);
  const [penniesChoice, setPenniesChoice] = useState<'Heads' | 'Tails'>('Heads');
  const [battleChoice, setBattleChoice] = useState<'Opera' | 'Football'>('Opera');
  const [trustInvestment, setTrustInvestment] = useState<number>(5);
  const [bertrandPrice, setBertrandPrice] = useState<number>(35);
  const [auctionBid, setAuctionBid] = useState<number>(7);
  const [beautyGuess, setBeautyGuess] = useState<number>(33);
  const [publicGoodsContr, setPublicGoodsContr] = useState<number>(10);
  const [centipedeChoice, setCentipedeChoice] = useState<'Pass' | 'Take'>('Pass');
  const [centipedeNode, setCentipedeNode] = useState<number>(1);
  const [centipedePath, setCentipedePath] = useState<
    Array<{ node: number; player: 'You' | 'Bot'; action: 'Take' | 'Pass'; payoffs?: { player: number; bot: number } }>
  >([]);
  const [centipedeExitNode, setCentipedeExitNode] = useState<number | undefined>(undefined);
  const [centipedeExitAction, setCentipedeExitAction] = useState<'Take' | 'Pass' | undefined>(undefined);

  // Round History & Reveal State
  const [history, setHistory] = useState<
    Array<{
      round: number;
      playerAction: any;
      botAction: any;
      playerPayoff: number;
      botPayoff: number;
      botRationale: string;
      playerValuation?: number;
      botValuation?: number;
    }>
  >([]);
  const [isRoundResolved, setIsRoundResolved] = useState<boolean>(false);
  const [lastRoundResult, setLastRoundResult] = useState<{
    playerAction: any;
    botAction: any;
    playerPayoff: number;
    botPayoff: number;
    botRationale: string;
    playerValuation?: number;
    botValuation?: number;
  } | null>(null);

  const activeModule = availableModules.find(m => m.id === selectedModuleId) || availableModules[0];
  const activeGameBots = getBotsForGame(selectedModuleId);
  const activeBot: GameSpecificBot = activeGameBots.find(b => b.id === selectedBotId) || activeGameBots[0];

  // System-drawn valuation for auction
  const studentValuation = drawValuation('solo_student', currentRound, 2, 10);
  const botValuation = drawValuation('solo_bot', currentRound, 2, 10);

  // Compute anticipated bot action for real-time payoff matrix guidance
  const anticipatedBotAction = !isRoundResolved
    ? activeBot.decide({
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
        botValuation,
        studentValuation
      }).action
    : undefined;

  // Sync active module and round/chain label with parent
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
    setLastRoundResult(null);
    setPdChoice('Cooperate');
    setStagChoice('Stag');
    setHawkChoice('Dove');
    setUltimatumOffer(4);
    setPenniesChoice('Heads');
    setBattleChoice('Opera');
    setTrustInvestment(5);
    setBertrandPrice(35);
    setAuctionBid(studentValuation);
    setBeautyGuess(33);
    setPublicGoodsContr(10);
    setCentipedeChoice('Pass');
    setCentipedeNode(1);
    setCentipedePath([]);
    setCentipedeExitNode(undefined);
    setCentipedeExitAction(undefined);
  };

  // Submit player's decision for the active round
  const handleSubmitRound = () => {
    let playerAction: any;
    let playerPayoff = 0;
    let botPayoff = 0;

    const roundHistoryForBot: RoundHistoryEntry[] = history.map(h => ({
      round: h.round,
      playerAction: h.playerAction,
      botAction: h.botAction,
      playerPayoff: h.playerPayoff,
      botPayoff: h.botPayoff,
      playerValuation: h.playerValuation,
      botValuation: h.botValuation
    }));

    let botDecision = activeBot.decide({
      round: currentRound,
      totalRounds,
      history: roundHistoryForBot,
      botValuation,
      studentValuation
    });

    if (selectedModuleId === 6) {
      // Prisoner's Dilemma
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
      // Bertrand Duopoly Price Competition (MC = 10)
      playerAction = bertrandPrice;
      const botAction = Number(botDecision.action);
      const mc = 10;

      if (playerAction < botAction) {
        playerPayoff = (playerAction - mc) * Math.max(0, 100 - playerAction);
        botPayoff = 0;
      } else if (playerAction > botAction) {
        playerPayoff = 0;
        botPayoff = (botAction - mc) * Math.max(0, 100 - botAction);
      } else {
        const sharedProfit = Math.round(((playerAction - mc) * Math.max(0, 100 - playerAction)) / 2);
        playerPayoff = sharedProfit;
        botPayoff = sharedProfit;
      }
    } else if (selectedModuleId === 7) {
      // Vickrey 2nd-Price Auction
      playerAction = auctionBid;
      const botAction = Number(botDecision.action);

      // Higher bid wins, pays 2nd highest bid
      if (playerAction > botAction) {
        playerPayoff = Math.round((studentValuation - botAction) * 10) / 10;
        botPayoff = 0;
      } else if (botAction > playerAction) {
        playerPayoff = 0;
        botPayoff = Math.round((botValuation - playerAction) * 10) / 10;
      } else {
        // Tie split
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
    } else if (selectedModuleId === 16 || selectedModuleId === 9) {
      // Ultimatum Bargaining ($10 Pie)
      playerAction = ultimatumOffer;
      let accepted = true;
      if (activeBot.id === 'equity_enforcer') {
        accepted = ultimatumOffer >= 4.5;
      } else if (activeBot.id === 'spiteful_punisher') {
        accepted = ultimatumOffer >= 3.0;
      } else if (activeBot.id === 'adaptive_negotiator') {
        const avg = history.length > 0
          ? history.reduce((s, h) => s + (Number(h.playerAction) || 0), 0) / history.length
          : 3.5;
        accepted = ultimatumOffer >= Math.max(3.0, Math.min(5.0, avg));
      } else {
        accepted = ultimatumOffer >= 1.0;
      }

      const botAction = accepted ? 'Accept' : 'Reject';
      botDecision = {
        action: botAction,
        rationale: accepted
          ? `Accepted: Your $${ultimatumOffer.toFixed(2)} offer met ${activeBot.name}'s acceptance threshold.`
          : `Vetoed: Your $${ultimatumOffer.toFixed(2)} offer was rejected as unfair/insulting. Both receive $0.`
      };

      if (accepted) {
        playerPayoff = Math.round((10 - ultimatumOffer) * 10) / 10;
        botPayoff = Math.round(ultimatumOffer * 10) / 10;
      } else {
        playerPayoff = 0;
        botPayoff = 0;
      }
    } else if (selectedModuleId === 17) {
      // Matching Pennies (Zero-Sum: Player is Matcher, Bot is Mismatcher)
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
      // Battle of the Sexes (Player favorite = Opera (+3), Bot favorite = Football (+3))
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
      // The Trust Game (Investor sends X, tripled to 3X; Trustee returns Y)
      playerAction = trustInvestment;
      let returned = 0;

      if (activeBot.id === 'silas_selfish_trustee') {
        returned = 0;
      } else if (activeBot.id === 'gage_fair_reciprocator') {
        returned = Math.round(trustInvestment * 1.5 * 10) / 10;
      } else if (activeBot.id === 'maya_generous_multiplier') {
        returned = trustInvestment >= 5 ? trustInvestment * 2 : trustInvestment * 1;
      } else if (activeBot.id === 'kip_conditional_trustee') {
        const mult = trustInvestment >= 7 ? 1.7 : trustInvestment <= 3 ? 0.5 : 1.4;
        returned = Math.round(trustInvestment * mult * 10) / 10;
      } else {
        returned = Math.round(trustInvestment * 1.5 * 10) / 10;
      }

      botDecision = {
        action: returned,
        rationale: returned === 0
          ? `Selfish Retention: Kept all ${trustInvestment * 3} tripled points. Returned $0.00.`
          : `Reciprocal Return: Received ${trustInvestment} pts (tripled to ${trustInvestment * 3}). Returned +${returned} pts.`
      };

      playerPayoff = Math.round((Math.max(0, 10 - trustInvestment) + returned) * 10) / 10;
      botPayoff = Math.round((trustInvestment * 3 - returned) * 10) / 10;
    } else if (selectedModuleId === 20) {
      // The Centipede Game (Sequential 6-Node Extensive Form)
      if (centipedeChoice === 'Take') {
        // Player takes at current node (1, 3, or 5)
        const myNode = centipedeNode;
        playerPayoff = myNode === 1 ? 2 : myNode === 3 ? 4 : 6;
        botPayoff = myNode === 1 ? 0 : myNode === 3 ? 2 : 4;
        playerAction = `Take at Node ${myNode}`;
        const botAction = `Preempted (Didn't Reach N${myNode + 1})`;

        const finalPath = [
          ...centipedePath,
          { node: myNode, player: 'You' as const, action: 'Take' as const, payoffs: { player: playerPayoff, bot: botPayoff } }
        ];
        setCentipedePath(finalPath);
        setCentipedeExitNode(myNode);
        setCentipedeExitAction('Take');

        botDecision = {
          action: botAction,
          rationale: `You Took at Node ${myNode}, ending the match to claim +${playerPayoff} pts (leaving ${activeBot.name} with +${botPayoff} pts). ${myNode === 1 ? 'Matches Subgame Perfect Nash Equilibrium (SPNE).' : 'Secured your gains before bot could take.'}`
        };

        const roundResult = {
          round: currentRound,
          playerAction,
          botAction,
          playerPayoff,
          botPayoff,
          botRationale: botDecision.rationale
        };
        setLastRoundResult(roundResult);
        setHistory(prev => [...prev, roundResult]);
        setIsRoundResolved(true);
        return;
      } else {
        // Player passes at current node (1, 3, or 5)
        const myNode = centipedeNode;
        const botNode = myNode + 1; // Node 2, 4, or 6
        const pathWithPlayerPass = [
          ...centipedePath,
          { node: myNode, player: 'You' as const, action: 'Pass' as const }
        ];

        // Evaluate Bot at botNode
        const botTurnDecision = activeBot.decide({
          round: currentRound,
          totalRounds,
          history: roundHistoryForBot,
          currentNode: botNode
        });

        if (botTurnDecision.action === 'Take') {
          // Bot Takes at botNode (2, 4, or 6)
          playerPayoff = botNode === 2 ? 1 : botNode === 4 ? 3 : 5;
          botPayoff = botNode === 2 ? 4 : botNode === 4 ? 6 : 8;
          playerAction = `Pass at Node ${myNode}`;
          const botAction = `Take at Node ${botNode}`;

          const finalPath = [
            ...pathWithPlayerPass,
            { node: botNode, player: 'Bot' as const, action: 'Take' as const, payoffs: { player: playerPayoff, bot: botPayoff } }
          ];
          setCentipedePath(finalPath);
          setCentipedeExitNode(botNode);
          setCentipedeExitAction('Take');

          const roundResult = {
            round: currentRound,
            playerAction,
            botAction,
            playerPayoff,
            botPayoff,
            botRationale: botTurnDecision.rationale
          };
          setLastRoundResult(roundResult);
          setHistory(prev => [...prev, roundResult]);
          setIsRoundResolved(true);
          return;
        } else {
          // Bot Passes at botNode!
          if (botNode === 6) {
            // Reached terminal cooperative outcome!
            playerPayoff = 8;
            botPayoff = 8;
            playerAction = 'Terminal Mutual Pass';
            const botAction = 'Terminal Mutual Pass';

            const finalPath = [
              ...pathWithPlayerPass,
              { node: 6, player: 'Bot' as const, action: 'Pass' as const, payoffs: { player: 8, bot: 8 } }
            ];
            setCentipedePath(finalPath);
            setCentipedeExitNode(7);
            setCentipedeExitAction('Pass');

            const roundResult = {
              round: currentRound,
              playerAction,
              botAction,
              playerPayoff: 8,
              botPayoff: 8,
              botRationale: `Cooperative Peak Reached! Both players passed through all 6 decision nodes, unlocking the full Pareto social surplus (+8 pts each).`
            };
            setLastRoundResult(roundResult);
            setHistory(prev => [...prev, roundResult]);
            setIsRoundResolved(true);
            return;
          } else {
            // Advance to next Player node (Node 3 or 5)!
            const updatedPath = [
              ...pathWithPlayerPass,
              { node: botNode, player: 'Bot' as const, action: 'Pass' as const }
            ];
            setCentipedePath(updatedPath);
            setCentipedeNode(botNode + 1);
            setCentipedeChoice('Pass');
            // Do NOT resolve round yet - still active match!
            return;
          }
        }
      }
    } else {
      // Public Goods Game (Endowment 20, Pool x 1.6 / 2 players)
      playerAction = publicGoodsContr;
      const botAction = Number(botDecision.action);

      const poolTotal = playerAction + botAction;
      const publicDividend = Math.round((poolTotal * 1.6 / 2) * 10) / 10;

      playerPayoff = Math.round((20 - playerAction + publicDividend) * 10) / 10;
      botPayoff = Math.round((20 - botAction + publicDividend) * 10) / 10;
    }

    const roundResult = {
      round: currentRound,
      playerAction,
      botAction: botDecision.action,
      playerPayoff,
      botPayoff,
      botRationale: botDecision.rationale,
      playerValuation: selectedModuleId === 7 ? studentValuation : undefined,
      botValuation: selectedModuleId === 7 ? botValuation : undefined
    };

    setLastRoundResult(roundResult);
    setHistory(prev => [...prev, roundResult]);
    setIsRoundResolved(true);
  };

  const handleNextRound = () => {
    setIsRoundResolved(false);
    setLastRoundResult(null);
    setCentipedeChoice('Pass');
    setCentipedeNode(1);
    setCentipedePath([]);
    setCentipedeExitNode(undefined);
    setCentipedeExitAction(undefined);
    setCurrentRound(prev => prev + 1);
  };

  const isExperimentFinished = currentRound > totalRounds;

  useEffect(() => {
    if (isExperimentFinished) {
      markGameCompleted(selectedModuleId);
    }
  }, [isExperimentFinished, selectedModuleId]);

  // Calculate cumulative summary scores
  const playerTotalScore = history.reduce((sum, h) => sum + h.playerPayoff, 0);
  const botTotalScore = history.reduce((sum, h) => sum + h.botPayoff, 0);

  // Calculate theoretical benchmarks for the debrief
  let nashBenchmarkScore = 0;
  let paretoOptimumScore = 0;

  if (selectedModuleId === 6) {
    nashBenchmarkScore = totalRounds * 1; // All Defect
    paretoOptimumScore = totalRounds * 2; // Mutual Cooperation
  } else if (selectedModuleId === 13) {
    nashBenchmarkScore = totalRounds * 4; // Risk dominant Hare
    paretoOptimumScore = totalRounds * 10; // Payoff dominant Stag
  } else if (selectedModuleId === 14) {
    nashBenchmarkScore = totalRounds * 10; // Bertrand Paradox (P = MC = $10-11)
    paretoOptimumScore = totalRounds * 450; // Monopoly Collusion ($40 price split)
  } else if (selectedModuleId === 7) {
    // Dominant strategy truthful bidding
    nashBenchmarkScore = totalRounds * 2.5;
    paretoOptimumScore = totalRounds * 3.5;
  } else if (selectedModuleId === 11) {
    nashBenchmarkScore = totalRounds * 5; // Nash tie
    paretoOptimumScore = totalRounds * 10;
  } else if (selectedModuleId === 15) {
    nashBenchmarkScore = totalRounds * 3; // (Dove, Dove) mutual sharing
    paretoOptimumScore = totalRounds * 3;
  } else if (selectedModuleId === 16 || selectedModuleId === 9) {
    nashBenchmarkScore = totalRounds * 9; // SPNE proposer keeps $9
    paretoOptimumScore = totalRounds * 10; // Full surplus distributed
  } else if (selectedModuleId === 17) {
    nashBenchmarkScore = totalRounds * 1; // Minimax mixed expected payoff
    paretoOptimumScore = totalRounds * 2; // Perfect matching wins
  } else if (selectedModuleId === 18) {
    nashBenchmarkScore = totalRounds * 2; // Conceding to partner's favorite
    paretoOptimumScore = totalRounds * 3; // Coordinating on your favorite
  } else if (selectedModuleId === 19) {
    nashBenchmarkScore = totalRounds * 10; // Zero trust (endowment kept)
    paretoOptimumScore = totalRounds * 20; // High trust and generous return
  } else if (selectedModuleId === 20) {
    nashBenchmarkScore = totalRounds * 2; // SPNE immediate Take at Node 1 (2, 0)
    paretoOptimumScore = totalRounds * 8; // Terminal mutual Pass (8, 8)
  } else {
    nashBenchmarkScore = totalRounds * 20; // 0 contribution
    paretoOptimumScore = totalRounds * 32; // Full 20 contribution
  }

  const debriefData: DebriefData = {
    gameTitle: activeModule.title,
    gameId: activeModule.id,
    botInfo: {
      id: activeBot.id,
      name: activeBot.name,
      title: activeBot.title,
      avatar: activeBot.avatar,
      color: activeBot.color,
      tagline: activeBot.tagline
    },
    playerTotalScore: Math.round(playerTotalScore * 10) / 10,
    botTotalScore: Math.round(botTotalScore * 10) / 10,
    nashBenchmarkScore,
    paretoOptimumScore,
    roundCount: totalRounds,
    roundsSummary: history
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Mode Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
              🧪
            </span>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Solo Lab Simulation Suite
            </h1>
            <span className="text-xs font-mono font-bold bg-blue-900/60 text-blue-200 border border-blue-700/60 px-2.5 py-0.5 rounded-full">
              Game {currentModuleIndex} of {totalModulesCount}
            </span>
            <span className="text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
              {completedGameIds.length} of {totalModulesCount} Games Completed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test game-theoretic strategies against standard bot archetypes with instant mathematical debriefs
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onOpenWhatIfSandbox(selectedModuleId)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold text-blue-300 bg-blue-950/60 border border-blue-800/80 hover:bg-blue-900/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
          >
            <span>∫ What-If Sandbox</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToLiveClass}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
          >
            <span>👥 Switch to Live Classroom</span>
          </button>
        </div>
      </div>

      {/* Module Selector Bar - Single Column on Mobile for clear readability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {availableModules.map((mod, idx) => {
          const isSelected = mod.id === selectedModuleId;
          const isCompleted = completedGameIds.includes(mod.id);
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => resetExperiment(undefined, mod.id)}
              className={`min-h-[44px] p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/80 text-white shadow-lg ring-1 ring-blue-500/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{mod.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{mod.shortTitle}</div>
                    <div className="text-[10px] text-slate-400 truncate">{mod.category}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    Game {idx + 1} of {totalModulesCount}
                  </span>
                  {isCompleted && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-1.5 py-0.5 rounded mt-0.5">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                {mod.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* If Experiment Finished: Show Theory Debrief */}
      {isExperimentFinished ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-emerald-400 font-bold text-xs bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg font-mono">
                ✓ Game {currentModuleIndex} of {totalModulesCount} Complete
              </span>
              <span className="text-xs text-slate-300">
                You've completed {completedGameIds.length} of {totalModulesCount} games in the Solo Lab suite.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                markGameCompleted(selectedModuleId);
                resetExperiment(undefined, nextModule.id);
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto shrink-0"
            >
              <span>Proceed to Next Game (Game {nextModuleIndex} of {totalModulesCount}: {nextModule.shortTitle})</span>
              <span>→</span>
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
        /* Active Experiment Arena */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (5 cols): Bot Archetype Card & Game Rules */}
          <div className="lg:col-span-5 space-y-4">
            {/* Opponent Bot Card */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Opponent Persona · {activeBot.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {activeGameBots.length} Bots Available
                </div>
              </div>

              {/* Active Bot Bio */}
              <div className={`p-3.5 rounded-xl border ${activeBot.badgeBg} ${activeBot.badgeBorder}`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{activeBot.avatar}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="truncate">{activeBot.name}</span>
                    </div>
                    <div className={`text-xs font-semibold ${activeBot.color}`}>
                      {activeBot.title}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-amber-300 font-medium mt-2 italic">
                  "{activeBot.tagline}"
                </div>

                {/* Plain-Language Strategy Profile Shown Before Match */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
                  <span className="font-bold text-blue-300 text-[10px] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <span>♟️ Strategy Profile (Pre-Match Intelligence):</span>
                  </span>
                  <p className="text-xs text-blue-100 font-medium leading-relaxed">
                    {getBotStrategySummary(activeBot)}
                  </p>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  {activeBot.backstory}
                </p>
              </div>

              {/* Bot Real-Time Thought Bubble */}
              <div className="relative bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-900">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping"></span>
                    <span>💭 Bot Thought Stream</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {isRoundResolved ? 'Post-Round Reflection' : 'Active Anticipation'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{isRoundResolved && lastRoundResult
                    ? lastRoundResult.botRationale
                    : activeBot.getAnticipationThought(
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

              {/* Bot Quantitative Strategic Gauges */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Custom Strategic Gauges</span>
                  <span className="font-mono text-slate-500 text-[9px]">{activeModule.shortTitle} Metrics</span>
                </div>

                {activeBot.gauges.map((gauge, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">{gauge.label}</span>
                      <span className="font-mono text-slate-200 font-bold">{gauge.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full ${gauge.color} rounded-full transition-all duration-500`}
                        style={{ width: `${gauge.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bot Archetype Selector Grid */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Game Opponent:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {activeGameBots.map(b => {
                    const active = b.id === activeBot.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => resetExperiment(b.id)}
                        className={`min-h-[44px] p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer flex items-center gap-2.5 ${
                          active
                            ? `${b.badgeBg} ${b.badgeBorder} border-2 text-white font-bold ring-1 ring-blue-500/30`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl shrink-0">{b.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-xs break-words">{b.name}</div>
                          <div className={`text-[10px] break-words ${b.color}`}>{b.title}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{getBotStrategySummary(b)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Game Rules & Payoff Guide */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-2.5 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Game Rules & Payoff Structure</span>
                <span className="font-mono text-blue-400">
                  {selectedModuleId === 20
                    ? `Game 12 of ${totalModulesCount} · Node ${centipedeNode} of 6 Chain`
                    : `Game ${currentModuleIndex} of ${totalModulesCount} · Trial ${currentRound} of ${totalRounds}`}
                </span>
              </div>

              {selectedModuleId === 6 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🔁 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Simultaneously choose <strong className="text-emerald-400">Cooperate (🤝)</strong> or <strong className="text-rose-400">Defect (⚔️)</strong> each round across a 5-round repeated match.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Mutual Coop = <strong className="text-emerald-400">+$2.00 each</strong> · Mutual Defect = <strong className="text-rose-400">+$1.00 each</strong> · Unilateral Defection = <strong className="text-amber-400">+$3.00</strong> for defector, <strong className="text-slate-400">$0.00</strong> for cooperator.
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Cooperative play yields double the Nash trap (+2 vs +1), but defection tempts each player with +3 unless credibly deterred by retaliatory threats." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Finite Repeated Game: Backward induction predicts mutual defection on every trial ($1, $1)." />
                  </div>
                </div>
              )}

              {selectedModuleId === 13 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🦌 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Simultaneously choose to <strong className="text-emerald-400">Hunt Stag (🦌)</strong> for high reward or <strong className="text-amber-400">Hunt Hare (🐇)</strong> for safety without prior communication.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Both Hunt Stag = <strong className="text-emerald-400">+10 pts each</strong> · Both Hunt Hare = <strong className="text-amber-300">+4 pts each</strong> · Solo Stag attempt = <strong className="text-rose-400">0 pts</strong> (partner hunting Hare gets <strong className="text-white">+4 pts</strong>).
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Hunting Stag is payoff-dominant (+10) but risky; hunting Hare is risk-dominant, guaranteeing +4 pts regardless of what your partner does." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Two Nash Equilibria: (Stag, Stag) is Payoff Dominant (+10); (Hare, Hare) is Risk Dominant (+4)." />
                  </div>
                </div>
              )}

              {selectedModuleId === 14 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🏷️ How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Select a product price between <strong className="text-white">$10 and $50</strong> per unit (marginal production cost is <strong className="text-amber-300">MC = $10</strong>; market demand is <strong className="text-sky-300">Q = 100 - P</strong>).
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Strictly lower price captures <strong className="text-emerald-400">100% of market profit</strong> (P - 10) × (100 - P); tied prices split profit <strong className="text-blue-300">50/50</strong>; higher price sells zero and earns <strong className="text-rose-400">$0</strong>.
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Tacit collusion near $40 yields +$450 profit each, but the temptation to undercut by $1 sparks a price war down to marginal cost ($10)." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Bertrand Paradox: Price competition with identical goods drives equilibrium price to cost ($P = $10, profit = $0)." />
                  </div>
                </div>
              )}

              {selectedModuleId === 7 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>⚖️ How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Submit a sealed bid ($1 to $10) for an item you privately value at <strong className="text-emerald-400 font-mono">${studentValuation}.00</strong> (drawn uniformly at random).
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Highest bidder wins the item and pays the <strong className="text-amber-400">second-highest bid</strong> (Profit = Valuation - Price Paid); outbid players pay <strong className="text-slate-400">$0</strong> and earn <strong className="text-slate-400">0 pts</strong>.
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Truthful bidding (b = v) is weakly dominant—shading below value risks missing profitable wins, while overbidding risks negative profit." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text={`Weakly Dominant Strategy: Bidding your exact true valuation (b = v = $${studentValuation}.00) dominates all other bids.`} />
                  </div>
                </div>
              )}

              {selectedModuleId === 11 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>💭 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Pick an integer guess between <strong className="text-white">0 and 100</strong>; the target number is exactly <strong className="text-amber-300">2/3 of the average</strong> of your guess and the bot's guess.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> The player closest to the 2/3 target wins <strong className="text-emerald-400">+10 pts</strong>; exact ties split the prize <strong className="text-blue-300">+5 pts each</strong>; the further player gets <strong className="text-rose-400">0 pts</strong>.
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Outsmart your opponent by guessing their level of strategic depth (Level-0 guesses ~50, Level-1 guesses ~33, Level-2 guesses ~22, while Nash is 0)." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Common Knowledge Equilibrium: Iterated elimination of dominated strategies cascades infinitely to Guess = 0." />
                  </div>
                </div>
              )}

              {selectedModuleId === 12 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🌍 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Receive <strong className="text-white">20 private tokens</strong> each round; choose how many tokens (0 to 20) to contribute to the shared community pool.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Kept tokens stay yours (<strong className="text-white">+1 pt each</strong>); contributed pool tokens are multiplied by <strong className="text-emerald-400">1.6x</strong> and split equally (<strong className="text-emerald-400">+0.80 pts</strong> return per token).
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="If both contribute 20 tokens, both earn the maximum +32 pts; free-riding tempts contributing 0, causing the Nash trap of 20 pts." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Dominant Strategy Equilibrium: Contribute 0 tokens (Nash trap of 20 pts vs social optimum 32 pts)." />
                  </div>
                </div>
              )}

              {selectedModuleId === 15 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🦅 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Simultaneously choose <strong className="text-emerald-400">Dove (🕊️)</strong> to peacefully share territory, or <strong className="text-rose-400">Hawk (🦅)</strong> to fight aggressively for total control.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Both Dove = <strong className="text-emerald-400">+3 pts each</strong> · Hawk vs Dove = Hawk grabs <strong className="text-amber-400">+6 pts</strong>, Dove gets <strong className="text-slate-400">0 pts</strong> · Both Hawk = mutual crash (<strong className="text-rose-500 font-bold">-10 pts each</strong>)!
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Anti-coordinate with your rival: exploit peaceful Doves with Hawk (+6), but yield to Dove (0) when facing an aggressive Hawk to avoid the -10 collision." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Anti-Coordination Nash: (Hawk, Dove) and (Dove, Hawk). Mixed ESS: Randomize Hawk ~23% of the time." />
                  </div>
                </div>
              )}

              {selectedModuleId === 16 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🍰 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> As Proposer, offer an amount from <strong className="text-white">$0.00 to $10.00</strong> to the Responder Bot from a total $10.00 prize pie.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> If Responder <strong className="text-emerald-400">Accepts</strong>, you keep <strong className="text-white">$10 - Offer</strong> and Responder gets <strong className="text-emerald-400">Offer</strong>; if <strong className="text-rose-400">Rejected</strong>, both players receive <strong className="text-rose-400">$0.00</strong>!
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Theory predicts offering the minimum ($1) because rational agents prefer $1 over $0, but human responders reject unfair offers (<$3)." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Subgame Perfect Equilibrium: Proposer offers $1.00; rational Responder accepts ($1 vs $0)." />
                  </div>
                </div>
              )}

              {selectedModuleId === 17 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🪙 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Simultaneously choose <strong className="text-white">Heads (🪙)</strong> or <strong className="text-white">Tails (🪙)</strong>; you are the <strong className="text-emerald-400">Matcher</strong> and the Bot is the <strong className="text-amber-400">Mismatcher</strong>.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> If coins match (HH or TT), you win <strong className="text-emerald-400">+2 pts</strong> and Bot gets <strong className="text-slate-400">0 pts</strong>; if coins differ (HT or TH), Bot wins <strong className="text-amber-400">+2 pts</strong> and you get <strong className="text-slate-400">0 pts</strong>.
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Zero-sum game with no pure equilibrium; randomize 50/50 so your opponent cannot predict or exploit your choices." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Unique Minimax Equilibrium: Randomize Heads and Tails with exact 50/50 probability (p = 0.50)." />
                  </div>
                </div>
              )}

              {selectedModuleId === 18 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🎭 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Simultaneously choose between <strong className="text-purple-400">Opera (🎭)</strong> and <strong className="text-amber-400">Football (⚽)</strong> without prior communication.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Both Opera = <strong className="text-purple-300">+3 pts for you, +2 pts for Bot</strong> · Both Football = <strong className="text-amber-300">+2 pts for you, +3 pts for Bot</strong> · Miscoordination (clash) = <strong className="text-rose-400">0 pts each</strong>.
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Both prefer coordinating over clashing (0 pts), but you disagree on which event is best—coordination requires concession or turn-taking." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Two pure Nash equilibria: (Opera, Opera) and (Football, Football). Mixed strategy EV = 1.2 pts." />
                  </div>
                </div>
              )}

              {selectedModuleId === 19 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🏦 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Actions:</strong> Start with <strong className="text-white">10 points</strong> as Investor; choose how many points (0 to 10) to send to the Trustee Bot.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> Any sent points are <strong className="text-emerald-400">tripled (3x)</strong>; the Trustee decides how much (Y) to return: Investor gets <strong className="text-white">(10 - X) + Y</strong>, Trustee keeps <strong className="text-white">3X - Y</strong>.
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Self-interest predicts the Trustee returns 0 pts so Investor sends 0 pts (investor keeps 10 pts, trustee gets 0); sending all 10 triples to 30 pts (joint social optimum yields 15 pts each)." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="Selfish SPNE: Backward induction predicts Trustee returns 0 pts; rational Investor sends 0 pts (10 pts kept vs 30 pts joint social max)." />
                  </div>
                </div>
              )}

              {selectedModuleId === 20 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🐛 How to Play:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Turn Order:</strong> Alternating sequential turns along a 6-node tree; you choose at <strong className="text-sky-400">Nodes 1, 3, 5</strong>, and the Bot chooses at <strong className="text-amber-400">Nodes 2, 4, 6</strong>.
                    </li>
                    <li>
                      <strong className="text-amber-300">Payoff Stakes:</strong> <strong className="text-emerald-400">Pass</strong> doubles the pot and hands turn to opponent; <strong className="text-rose-400">Take</strong> ends the match to claim the larger share (N1: 2,0 · N2: 1,4 · N3: 4,2 · N4: 3,6 · N5: 6,4 · N6: 5,8).
                    </li>
                    <li>
                      <strong className="text-sky-300">Strategic Goal: </strong>
                      <AnnotateGlossaryText text="Passing all 6 nodes awards the social optimum of +8 pts each; backward induction predicts taking immediately at Node 1 (2, 0)." />
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    <AnnotateGlossaryText text="6-Node Chain: Player moves at nodes 1, 3, 5 · Bot moves at nodes 2, 4, 6. Theory predicts Take at Node 1 (2, 0) via backward induction." />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Decision Console & Round Execution */}
          <div className="lg:col-span-7 space-y-4">
            {/* Interactive Decision Console */}
            <div className="bg-slate-900 rounded-2xl p-3 sm:p-5 border border-slate-800 shadow-xl space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {selectedModuleId === 20
                      ? `Action Console · Node ${centipedeNode} of 6 Chain (Player: 1, 3, 5 · Bot: 2, 4, 6)`
                      : `Action Console · Round ${currentRound} of ${totalRounds}`}
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {selectedModuleId === 20
                      ? `Execute Decision at Node ${centipedeNode}`
                      : `Submit Your Round Decision`}
                  </h3>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1">
                  {selectedModuleId === 20 ? (
                    [
                      { n: 1, p: 'You' },
                      { n: 2, p: 'Bot' },
                      { n: 3, p: 'You' },
                      { n: 4, p: 'Bot' },
                      { n: 5, p: 'You' },
                      { n: 6, p: 'Bot' }
                    ].map(item => {
                      const isPast = item.n < centipedeNode;
                      const isCurrent = item.n === centipedeNode && !isRoundResolved;
                      const isExit = isRoundResolved && centipedeExitNode === item.n;
                      return (
                        <div
                          key={item.n}
                          title={`Node ${item.n} (${item.p})`}
                          className={`flex items-center justify-center text-[9px] font-mono font-bold rounded px-1.5 py-0.5 transition-all ${
                            isExit
                              ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                              : isPast
                              ? 'bg-emerald-600/80 text-white'
                              : isCurrent
                              ? 'bg-amber-400 text-slate-950 font-black animate-pulse ring-1 ring-amber-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          N{item.n} ({item.p})
                        </div>
                      );
                    })
                  ) : (
                    Array.from({ length: totalRounds }).map((_, idx) => {
                      const r = idx + 1;
                      const isDone = r < currentRound || (r === currentRound && isRoundResolved);
                      const isCurrent = r === currentRound && !isRoundResolved;
                      return (
                        <div
                          key={r}
                          className={`h-2 rounded-full transition-all ${
                            isDone
                              ? 'w-6 bg-blue-500'
                              : isCurrent
                              ? 'w-8 bg-amber-400 animate-pulse'
                              : 'w-4 bg-slate-800'
                          }`}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Module-Specific Controls & Interactive Matrix */}
              {!isRoundResolved ? (
                <div className="space-y-4">
                  {/* Real-time Interactive Matrix & Visualizer */}
                  <InteractiveMatrixVisualizer
                    moduleId={selectedModuleId}
                    selectedAction={
                      selectedModuleId === 6
                        ? pdChoice
                        : selectedModuleId === 13
                        ? stagChoice
                        : selectedModuleId === 15
                        ? hawkChoice
                        : selectedModuleId === 16 || selectedModuleId === 9
                        ? ultimatumOffer
                        : selectedModuleId === 17
                        ? penniesChoice
                        : selectedModuleId === 18
                        ? battleChoice
                        : selectedModuleId === 19
                        ? trustInvestment
                        : selectedModuleId === 20
                        ? centipedeChoice
                        : selectedModuleId === 14
                        ? bertrandPrice
                        : selectedModuleId === 7
                        ? auctionBid
                        : selectedModuleId === 11
                        ? beautyGuess
                        : publicGoodsContr
                    }
                    botArchetype={activeBot.id}
                    anticipatedBotAction={anticipatedBotAction}
                    auctionValuation={studentValuation}
                    auctionBid={auctionBid}
                    beautyGuess={beautyGuess}
                    publicGoodsContr={publicGoodsContr}
                    ultimatumOffer={ultimatumOffer}
                    trustInvestment={trustInvestment}
                    centipedeNode={centipedeNode}
                    centipedePath={centipedePath}
                    centipedeEnded={isRoundResolved}
                    centipedeExitNode={centipedeExitNode}
                    centipedeExitAction={centipedeExitAction}
                    onSelectAction={(action) => {
                      if (selectedModuleId === 6) setPdChoice(action);
                      if (selectedModuleId === 13) setStagChoice(action);
                      if (selectedModuleId === 15) setHawkChoice(action);
                      if (selectedModuleId === 17) setPenniesChoice(action);
                      if (selectedModuleId === 18) setBattleChoice(action);
                      if (selectedModuleId === 20) setCentipedeChoice(action);
                    }}
                  />

                  {/* Opponent Strategy Intelligence Strip (Shown directly before match move) */}
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{activeBot.avatar}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <span>Opponent: {activeBot.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono uppercase font-semibold">Strategy Profile</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                          {getBotStrategySummary(activeBot)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module 6: Prisoner's Dilemma */}
                  {selectedModuleId === 6 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-300">Choose your move:</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPdChoice('Cooperate')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            pdChoice === 'Cooperate'
                              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🤝</div>
                          <div className="font-bold text-sm">Cooperate</div>
                          <div className="text-[10px] text-slate-400 mt-1">Initiate/Honor mutual gains</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPdChoice('Defect')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            pdChoice === 'Defect'
                              ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg ring-1 ring-rose-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🗡️</div>
                          <div className="font-bold text-sm">Defect</div>
                          <div className="text-[10px] text-slate-400 mt-1">Pursue dominant one-shot payoff</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 13: Stag Hunt */}
                  {selectedModuleId === 13 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-300">Choose your hunting target:</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setStagChoice('Stag')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            stagChoice === 'Stag'
                              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🦌</div>
                          <div className="font-bold text-sm">Hunt Stag</div>
                          <div className="text-[10px] text-slate-400 mt-1">Payoff Dominant: +10 pts if mutual</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStagChoice('Hare')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            stagChoice === 'Hare'
                              ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🐇</div>
                          <div className="font-bold text-sm">Hunt Hare</div>
                          <div className="text-[10px] text-slate-400 mt-1">Risk Dominant: +4 pts safe guarantee</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 14: Bertrand Price Competition */}
                  {selectedModuleId === 14 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Set Firm Price ($10 - $50):</span>
                        <span className="font-mono text-base font-black text-blue-400">${bertrandPrice}.00</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        step="1"
                        value={bertrandPrice}
                        onChange={(e) => setBertrandPrice(parseInt(e.target.value, 10))}
                        className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>$10 (MC / Bertrand)</span>
                        <span>$25 (Competitive)</span>
                        <span>$40 (Monopoly Optimum)</span>
                        <span>$50</span>
                      </div>
                      <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        💡 Pricing Strategy: If your rival prices at $40, pricing at $39 wins 100% of demand ($2,379 profit vs $1,200 shared). But if both undercut, price falls to $10 ($0 profit)!
                      </p>
                    </div>
                  )}

                  {selectedModuleId === 7 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Your Sealed Bid:</span>
                        <span className="font-mono text-base font-black text-amber-400">${auctionBid}.00</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        step="0.5"
                        value={auctionBid}
                        onChange={(e) => setAuctionBid(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>$0 (Free)</span>
                        <span>True Val: ${studentValuation}.00</span>
                        <span>$12 (Max)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        💡 Game Theory Hint: In Vickrey auctions, does bidding higher than your true valuation (${studentValuation}) ever increase your profit if you win?
                      </p>
                    </div>
                  )}

                  {selectedModuleId === 11 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Your Guess (0 to 100):</span>
                        <span className="font-mono text-xl font-black text-indigo-400">{beautyGuess}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={beautyGuess}
                        onChange={(e) => setBeautyGuess(parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0 (Nash)</span>
                        <span>22 (Level 2)</span>
                        <span>33 (Level 1)</span>
                        <span>50 (Level 0)</span>
                        <span>100</span>
                      </div>
                    </div>
                  )}

                  {selectedModuleId === 12 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Tokens to Public Pool:</span>
                        <span className="font-mono text-lg font-black text-emerald-400">{publicGoodsContr} / 20</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={publicGoodsContr}
                        onChange={(e) => setPublicGoodsContr(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Kept Private</span>
                          <span className="text-white font-bold">{20 - publicGoodsContr} tokens ($1 each)</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Public Investment</span>
                          <span className="text-emerald-400 font-bold">{publicGoodsContr} tokens (x1.6)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Module 15: Hawk-Dove Brinkmanship */}
                  {selectedModuleId === 15 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-300">Choose your move:</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setHawkChoice('Dove')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            hawkChoice === 'Dove'
                              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🕊️</div>
                          <div className="font-bold text-sm">Dove (Swerve)</div>
                          <div className="text-[10px] text-slate-400 mt-1">Concede / Share peacefully (+3 or 0)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setHawkChoice('Hawk')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            hawkChoice === 'Hawk'
                              ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg ring-1 ring-rose-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🦅</div>
                          <div className="font-bold text-sm">Hawk (Straight)</div>
                          <div className="text-[10px] text-slate-400 mt-1">Demand all (+6), risk collision (-10)</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 16: Ultimatum Bargaining */}
                  {(selectedModuleId === 16 || selectedModuleId === 9) && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Propose Responder Split:</span>
                        <span className="font-mono text-lg font-black text-emerald-400">${ultimatumOffer.toFixed(2)} / $10.00</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={ultimatumOffer}
                        onChange={(e) => setUltimatumOffer(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block uppercase">Your Proposed Keep</span>
                          <span className="text-blue-400 font-bold text-sm">${(10 - ultimatumOffer).toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block uppercase">Bot Proposed Payout</span>
                          <span className="text-emerald-400 font-bold text-sm">${ultimatumOffer.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Module 17: Matching Pennies */}
                  {selectedModuleId === 17 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-300">Choose your coin face:</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPenniesChoice('Heads')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            penniesChoice === 'Heads'
                              ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">👑</div>
                          <div className="font-bold text-sm">Heads</div>
                          <div className="text-[10px] text-slate-400 mt-1">Win +2 if Bot also plays Heads</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPenniesChoice('Tails')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            penniesChoice === 'Tails'
                              ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🪙</div>
                          <div className="font-bold text-sm">Tails</div>
                          <div className="text-[10px] text-slate-400 mt-1">Win +2 if Bot also plays Tails</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 18: Battle of the Sexes */}
                  {selectedModuleId === 18 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-300">Choose which event to attend:</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setBattleChoice('Opera')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            battleChoice === 'Opera'
                              ? 'bg-purple-600/25 border-purple-500 text-white shadow-lg ring-1 ring-purple-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🎭</div>
                          <div className="font-bold text-sm">Opera</div>
                          <div className="text-[10px] text-purple-300 mt-1">Your Favorite: +3 pts (if bot coordinates)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBattleChoice('Football')}
                          className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            battleChoice === 'Football'
                              ? 'bg-amber-600/25 border-amber-500 text-white shadow-lg ring-1 ring-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">⚽</div>
                          <div className="font-bold text-sm">Football</div>
                          <div className="text-[10px] text-amber-300 mt-1">Bot Favorite: +2 pts (if bot coordinates)</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Module 19: The Trust Game */}
                  {selectedModuleId === 19 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Invest with Trustee (0 - 10 pts):</span>
                        <span className="font-mono text-lg font-black text-emerald-400">{trustInvestment} pts (Tripled to {trustInvestment * 3} pts)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={trustInvestment}
                        onChange={(e) => setTrustInvestment(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block uppercase">Private Vault Kept</span>
                          <span className="text-white font-bold text-sm">{10 - trustInvestment} pts</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-emerald-400 text-[10px] block uppercase">Tripled Trustee Fund</span>
                          <span className="text-emerald-300 font-bold text-sm">{trustInvestment * 3} pts</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Module 20: Centipede Game */}
                  {selectedModuleId === 20 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <span>Decision at Node {centipedeNode} of 6:</span>
                          <span className="text-[10px] font-mono text-sky-400 font-bold">
                            (Your Turn)
                          </span>
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-300">
                          Current Pot: {centipedeNode === 1 ? '2 pts' : centipedeNode === 3 ? '6 pts' : '10 pts'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCentipedeChoice('Pass')}
                          className={`min-h-[52px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            centipedeChoice === 'Pass'
                              ? 'bg-emerald-600/25 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">➔ 🤝</div>
                          <div className="font-bold text-sm">Pass (Grow Pot)</div>
                          <div className="text-[10px] text-emerald-300 mt-1">
                            Pass to {activeBot.name} at Node {centipedeNode + 1}; pot doubles!
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCentipedeChoice('Take')}
                          className={`min-h-[52px] p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            centipedeChoice === 'Take'
                              ? 'bg-rose-600/25 border-rose-500 text-white shadow-lg ring-1 ring-rose-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">🛑 💰</div>
                          <div className="font-bold text-sm">Take (End Match)</div>
                          <div className="text-[10px] text-rose-300 mt-1">
                            Lock in +{centipedeNode === 1 ? 2 : centipedeNode === 3 ? 4 : 6} pts for you (+{centipedeNode === 1 ? 0 : centipedeNode === 3 ? 2 : 4} for {activeBot.name})
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitRound}
                    className="w-full min-h-[48px] py-3 px-4 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>
                      {selectedModuleId === 20
                        ? `Execute Node ${centipedeNode} Choice (${centipedeChoice})`
                        : `Confirm Round ${currentRound} Decision`}
                    </span>
                    <span>→</span>
                  </button>
                </div>
              ) : (
                /* Round Resolved View with Real-time Bot Reasoning */
                lastRoundResult && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Decision</div>
                        <div className="text-base font-bold text-white mt-1">
                          {String(lastRoundResult.playerAction)}
                        </div>
                        <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                          +{lastRoundResult.playerPayoff} <span className="text-xs font-normal text-slate-400">pts</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeBot.name} Decision</div>
                        <div className={`text-base font-bold mt-1 ${activeBot.color}`}>
                          {String(lastRoundResult.botAction)}
                        </div>
                        <div className="text-xl font-mono font-black text-slate-300 mt-1">
                          +{lastRoundResult.botPayoff} <span className="text-xs font-normal text-slate-400">pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Bot Reasoning Callout */}
                    <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span>{activeBot.avatar}</span>
                        <span>{activeBot.name}'s Strategic Rationale:</span>
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{lastRoundResult.botRationale}"
                      </p>
                    </div>

                    {/* Dedicated Post-Match Debrief: Whole Match vs Theory & Behavioral Insights */}
                    {lastRoundResult && (() => {
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
                      let keyTakeawaySentence = "";

                      const getScoreCmp = (p: number, b: number, isDollar: boolean = false) => {
                        const pStr = isDollar ? `$${Number(p.toFixed(2))}` : `${p}`;
                        const bStr = isDollar ? `$${Number(b.toFixed(2))}` : `${b}`;
                        if (p > b) {
                          return `You outscored the bot ${pStr} to ${bStr}`;
                        } else if (b > p) {
                          return `The bot outscored you ${bStr} to ${pStr}`;
                        } else {
                          return `You tied with the bot ${pStr} to ${bStr}`;
                        }
                      };

                      if (selectedModuleId === 6) {
                        conceptBadge = "Subgame Perfect Nash Equilibrium (SPNE)";
                        predictionLabel = "SPNE & Dominant Strategy Defection";
                        predictionTitle = `SPNE Defection: $1.00/round each (over ${matchRounds} rounds: $${(matchRounds * 1).toFixed(2)} each)`;
                        predictionExplanation = `Because defection strictly dominates cooperation in every stage game ($3.00 vs $2.00 and $1.00 vs $0.00), backward induction predicts rational players defect in every round. This traps both players at $1.00 per round ($${(matchRounds * 1).toFixed(2)} over ${matchRounds} rounds) instead of the $2.00 per round cooperative optimum ($${(matchRounds * 2).toFixed(2)} over ${matchRounds} rounds).`;
                        predictionFrequency = "Equilibrium Benchmark: 100% Defection / 0% Cooperate in every round";
                        predictionPayoff = `SPNE Trap: $1.00/round each ($${(matchRounds * 1).toFixed(2)} over ${matchRounds} rounds) · Pareto Optimum: $2.00/round each ($${(matchRounds * 2).toFixed(2)} over ${matchRounds} rounds)`;

                        const coopCount = history.filter(h => h.playerAction === 'Cooperate').length;
                        const defectCount = matchRounds - coopCount;
                        const coopPct = Math.round((coopCount / matchRounds) * 100);
                        const defectPct = 100 - coopPct;
                        const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                        actualFrequencyTitle = `Your Choices Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
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
                        keyTakeawaySentence = "Repeated interaction and credible retaliatory threats allow players to sustain mutual cooperation that strictly Pareto-dominates the one-shot defection trap.";

                      } else if (selectedModuleId === 13) {
                        conceptBadge = "Payoff Dominance vs. Risk Dominance";
                        predictionLabel = "Multiple Nash Equilibria";
                        predictionTitle = "Payoff-Dominant: +10 pts/round each · Risk-Dominant: +4 pts/round each";
                        predictionExplanation = `In Stag Hunt, (Stag, Stag) is Payoff-Dominant at +10 pts per round (${matchRounds * 10} pts over ${matchRounds} rounds), while (Hare, Hare) is Risk-Dominant at +4 pts per round (${matchRounds * 4} pts over ${matchRounds} rounds) because hunting Hare safely guarantees +4 pts without vulnerability to partner hesitation.`;
                        predictionFrequency = "Payoff-Dominant Nash: 100% Stag (+10 pts/rd) · Risk-Dominant Nash: 100% Hare (+4 pts/rd)";
                        predictionPayoff = `Payoff-Dominant (Stag, Stag): +10 pts/round each (${matchRounds * 10} pts over ${matchRounds} rounds) · Risk-Dominant (Hare, Hare): +4 pts/round each (${matchRounds * 4} pts over ${matchRounds} rounds)`;

                        const stagCount = history.filter(h => h.playerAction === 'Stag').length;
                        const hareCount = matchRounds - stagCount;
                        const stagPct = Math.round((stagCount / matchRounds) * 100);
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Choices Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `${stagCount}/${matchRounds} Stag (${stagPct}%) · ${hareCount}/${matchRounds} Hare (${100 - stagPct}%)`;
                        if (stagPct >= 80) {
                          gapInterpretationSentence = playerTotal < botTotal || playerTotal < matchRounds * 5
                            ? `Close to equilibrium: ${scoreCmp}. You committed to the payoff-dominant Stag equilibrium in ${stagPct}% of rounds, but suffered miscoordination penalties when ${activeBot.name} retreated to safe Hare.`
                            : `Close to equilibrium: ${scoreCmp}. You committed firmly to the payoff-dominant Stag equilibrium in ${stagPct}% of rounds, helped by mutual assurance and coordinated trust with ${activeBot.name}.`;
                        } else if (stagPct <= 20) {
                          gapInterpretationSentence = playerTotal >= botTotal
                            ? `Close to equilibrium: ${scoreCmp}. You hunted safe Hare in ${100 - stagPct}% of rounds, adhering strictly to the risk-dominant safe Nash equilibrium (+4 pts/rd) to eliminate all vulnerability to betrayal.`
                            : `Close to equilibrium: ${scoreCmp}. You locked into the risk-dominant Hare strategy (${100 - stagPct}%), securing safety but falling behind as ${activeBot.name} captured higher Stag returns.`;
                        } else if (stagPct >= 35 && stagPct <= 65) {
                          gapInterpretationSentence = `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You split choices across Stag (${stagPct}%) and Hare (${100 - stagPct}%), as strategic hesitation and mutual miscoordination caused both players to oscillate between ambition and fear.`;
                        } else {
                          gapInterpretationSentence = playerTotal >= botTotal
                            ? `Noticeable deviation: ${scoreCmp}. You chose Stag in ${stagPct}% of rounds, adapting effectively by hunting Stag when assurance was present and retreating to Hare when trust faltered.`
                            : `Noticeable deviation: ${scoreCmp}. You chose Stag in ${stagPct}% of rounds, but uncoordinated switches caused you to waste turns hunting Stag alone.`;
                        }
                        actualPayoff = `Whole Match Score: You: ${playerTotal} pts · ${activeBot.name}: ${botTotal} pts (Surplus: ${totalMatchSurplus} pts)`;
                        realPeopleSentence = "Real players often start by testing Stag, but easily retreat to the risk-dominant safety of Hare after a single miscoordination because the fear of earning 0 outweighs the promise of +10.";
                        keyTakeawaySentence = "High-value social coordination requires mutual strategic assurance; without trust, rational fear drives players to settle for the safe but inferior equilibrium.";

                      } else if (selectedModuleId === 14) {
                        conceptBadge = "Bertrand Price Competition";
                        predictionLabel = "Bertrand Paradox Nash Equilibrium";
                        predictionTitle = "Price at Marginal Cost: P = $10.00 ($0 profit/round)";
                        predictionExplanation = `Price undercutting drives equilibrium price down to marginal cost ($10.00), yielding $0 profit per round ($0 over ${matchRounds} rounds). In contrast, joint monopoly collusion at $40.00 yields $450 profit per round each ($${matchRounds * 450} each over ${matchRounds} rounds).`;
                        predictionFrequency = "Equilibrium Benchmark: 100% of prices at P = MC = $10.00 (Zero Profit)";
                        predictionPayoff = `Bertrand Nash: $0 profit/round ($0 over ${matchRounds} rounds) · Monopoly Collusion ($40): $450 profit/round each ($${matchRounds * 450} each over ${matchRounds} rounds)`;

                        const prices = history.map(h => Number(h.playerAction));
                        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / matchRounds);
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);
                        const undercutWins = history.filter(h => Number(h.playerAction) < Number(h.botAction)).length;
                        const tieRounds = history.filter(h => Number(h.playerAction) === Number(h.botAction)).length;
                        const outbidRounds = history.filter(h => Number(h.playerAction) > Number(h.botAction)).length;
                        const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                        actualFrequencyTitle = `Your Pricing Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `Avg Price: $${avgPrice}.00 (Range: $${minPrice}–$${maxPrice}) · ${undercutWins} Undercut Wins, ${tieRounds} Ties, ${outbidRounds} Outpriced`;
                        if (avgPrice <= 13) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Close to equilibrium: ${scoreCmp}. Your average price of $${avgPrice}.00 was near marginal cost ($10), but ${activeBot.name} underpriced you on key rounds to capture all market demand.`
                            : `Close to equilibrium: ${scoreCmp}. Your average price of $${avgPrice}.00 was within $${avgPrice - 10} of marginal cost ($10), reproducing the zero-profit Bertrand paradox where competitive undercutting wipes out economic margins.`;
                        } else if (avgPrice <= 26) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Noticeable deviation: ${scoreCmp}. Your average price of $${avgPrice}.00 was midway between cost and monopoly, but ${activeBot.name} timed aggressive undercuts whenever you posted higher margins.`
                            : `Noticeable deviation: ${scoreCmp}. Your average price of $${avgPrice}.00 hovered midway between marginal cost ($10) and monopoly ($40), balancing price margins against market share capture.`;
                        } else {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You attempted high collusive pricing ($${avgPrice}.00 avg), but ${activeBot.name} undercut the cartel consistently to capture all demand.`
                            : `Productive deviation from theory: ${scoreCmp}. Your average price of $${avgPrice}.00 stood $${avgPrice - 10} above marginal cost, demonstrating tacit collusion that generated joint profit while avoiding the cutthroat Bertrand trap.`;
                        }
                        actualPayoff = `Whole Match Profit: You: $${playerTotal} · ${activeBot.name}: $${botTotal} (Surplus: $${totalMatchSurplus})`;
                        realPeopleSentence = "Real managers and lab subjects initially try to sustain tacit collusion near $35–$40, but price cutting inevitably erupts as players cannot resist the temptation to capture 100% of the market with a $1 undercut.";
                        keyTakeawaySentence = "Without regulatory barriers or product differentiation, unilateral incentives to undercut destroy industry profits and deliver all surplus to consumers.";

                      } else if (selectedModuleId === 7) {
                        conceptBadge = "Incentive Compatibility & Dominance";
                        predictionLabel = "Weakly Dominant Strategy";
                        predictionTitle = "Truthful Bidding: Bid = Valuation (b = v each round)";
                        predictionExplanation = `In a second-price sealed-bid auction, bidding your exact private valuation (b = v) in every round is a weakly dominant strategy: the winner pays the second-highest bid, so shading never lowers what you pay and overbidding risks negative profit.`;
                        predictionFrequency = "Equilibrium Benchmark: 100% Truthful Bids (b = v) in every auction";
                        predictionPayoff = `Dominant Strategy: Bid b = v in each auction (Maximizes expected surplus with zero winner's curse risk across all ${matchRounds} auctions)`;

                        const truthfulCount = history.filter(h => Math.abs(Number(h.playerAction) - (h.playerValuation || 0)) < 0.01).length;
                        const overbidCount = history.filter(h => Number(h.playerAction) > (h.playerValuation || 0) + 0.01).length;
                        const underbidCount = history.filter(h => Number(h.playerAction) < (h.playerValuation || 0) - 0.01).length;
                        const wins = history.filter(h => h.playerPayoff > 0).length;
                        const truthfulPct = Math.round((truthfulCount / matchRounds) * 100);
                        const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                        actualFrequencyTitle = `Your Bidding Across ${matchRounds} Auction${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `${truthfulCount}/${matchRounds} Truthful bids (${truthfulPct}%) · ${overbidCount} Overbids · ${underbidCount} Underbids · Won ${wins}/${matchRounds}`;
                        if (truthfulPct >= 85) {
                          gapInterpretationSentence = playerTotal >= botTotal
                            ? `Close to equilibrium: ${scoreCmp}. You played the weakly dominant strategy of truthful bidding (b = v) in ${truthfulPct}% of auctions, letting the second-price clearing mechanism protect your profit margins.`
                            : `Close to equilibrium: ${scoreCmp}. You bid truthfully in ${truthfulPct}% of rounds, following dominant strategy theory; although ${activeBot.name} realized higher valuation draws, your truthful discipline guaranteed you never suffered the Winner's Curse.`;
                        } else if (truthfulPct >= 50) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Noticeable deviation: ${scoreCmp}. You bid truthfully in ${truthfulPct}% of rounds but deviated in others (${overbidCount} overbids, ${underbidCount} underbids), eroding your margins.`
                            : `Noticeable deviation: ${scoreCmp}. You bid truthfully in ${truthfulPct}% of rounds with occasional deviations, winning key auctions without severe winner's curse penalties.`;
                        } else {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You deviated from your valuation in ${matchRounds - truthfulCount}/${matchRounds} auctions (${overbidCount > underbidCount ? 'frequently overbidding due to competitive fever' : 'underbidding and forfeiting profitable lots'}), falling behind due to distorted first-price bidding habits.`
                            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You deviated in ${matchRounds - truthfulCount}/${matchRounds} auctions, yet finished ahead due to favorable valuation spreads, though dominant strategy theory confirms truthful bidding maximizes expected profits.`;
                        }
                        actualPayoff = `Whole Match Profit: You: $${playerTotal}.00 · ${activeBot.name}: $${botTotal}.00`;
                        realPeopleSentence = "In laboratory auctions, real bidders systematically overbid (b > v) due to competitive excitement and a mistaken fear of losing, which exposes them to winner's curse losses when competitors bid aggressively.";
                        keyTakeawaySentence = "Decoupling what you pay from what you bid makes truthful revelation optimal, removing the strategic complexity of predicting rival bids.";

                      } else if (selectedModuleId === 11) {
                        conceptBadge = "Level-k Reasoning & Iterated Dominance";
                        predictionLabel = "Nash Equilibrium via Iterated Dominance";
                        predictionTitle = "Nash Equilibrium: Guess = 0 (5 pts/round each on tie)";
                        predictionExplanation = `Iterated elimination of strictly dominated guesses cascades infinitely to 0. If both players play Nash (0), average is 0, target is 0, and players tie for 5 pts per round (${matchRounds * 5} pts each over ${matchRounds} rounds).`;
                        predictionFrequency = "Equilibrium Benchmark: Guess = 0 (Level-0: ~50, Level-1: ~33, Level-2: ~22)";
                        predictionPayoff = `Unique Nash: Guess = 0 (5 pts/round each on tie, ${matchRounds * 5} pts over ${matchRounds} rounds) · Level-1: ~33 · Level-2: ~22`;

                        const guesses = history.map(h => Number(h.playerAction));
                        const avgGuess = Math.round(guesses.reduce((a, b) => a + b, 0) / matchRounds);
                        const minGuess = Math.min(...guesses);
                        const maxGuess = Math.max(...guesses);
                        const winsCount = history.filter(h => h.playerPayoff > (h.botPayoff || 0)).length;
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Guessing Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `Avg Guess: ${avgGuess} (Range: ${minGuess}–${maxGuess}) · Won ${winsCount}/${matchRounds} Contests (Nash Benchmark: 0)`;
                        if (avgGuess <= 10) {
                          gapInterpretationSentence = playerTotal < botTotal || winsCount === 0
                            ? `Close to equilibrium: ${scoreCmp}. Although your average guess of ${avgGuess} approached the mathematical Nash equilibrium (0), competitors only reason 1–2 steps ahead (~22 to ~33), meaning pure game theory overshot human opponents.`
                            : `Close to equilibrium: ${scoreCmp}. Your average guess of ${avgGuess} approached the theoretical Nash equilibrium of 0, successfully winning contests as the field iterated downward.`;
                        } else if (avgGuess <= 35) {
                          gapInterpretationSentence = playerTotal >= botTotal
                            ? `Noticeable deviation: ${scoreCmp}. Your average guess of ${avgGuess} departed from mathematical equilibrium (0) but won ${winsCount}/${matchRounds} contests because targeting Level-1 (~33) or Level-2 (~22) accurately anticipates human bounded rationality.`
                            : `Noticeable deviation: ${scoreCmp}. Your average guess of ${avgGuess} targeted intermediate cognitive depth, but ${activeBot.name} anticipated the group average more accurately.`;
                        } else {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Your average guess of ${avgGuess} anchored near the intuitive midpoint (~50), falling behind because you did not apply iterative 2/3 elimination.`
                            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Your average guess of ${avgGuess} anchored near the intuitive center (~50), winning ${winsCount} rounds only because your opponents also exhibited Level-0 heuristics.`;
                        }
                        actualPayoff = `Whole Match Points: You: ${playerTotal} pts · ${activeBot.name}: ${botTotal} pts`;
                        realPeopleSentence = "Real human cohorts average 1 to 2 steps of strategic reasoning (Level-1 to Level-2), making guesses between 20 and 35 routinely win over the 'theoretically rational' guess of 0.";
                        keyTakeawaySentence = "In strategic markets, success comes not from calculating the mathematical extreme, but from correctly estimating the cognitive depth of your competitors.";

                      } else if (selectedModuleId === 12) {
                        conceptBadge = "Social Dilemma & Dominant Strategy";
                        predictionLabel = "Dominant Strategy Free-Riding";
                        predictionTitle = `Contribute 0 Tokens: 20 pts/round each (over ${matchRounds} rounds: ${matchRounds * 20} pts each)`;
                        predictionExplanation = `Because each token invested in the group pool returns only 0.80 points to the contributor (1.6x multiplier ÷ 2 players), contributing zero is a strictly dominant strategy. This traps both players at 20 pts per round (${matchRounds * 20} pts over ${matchRounds} rounds) instead of the 32 pts per round social optimum (${matchRounds * 32} pts over ${matchRounds} rounds).`;
                        predictionFrequency = "Equilibrium Benchmark: 100% Free-Riding (0 Tokens Contributed)";
                        predictionPayoff = `Nash Trap: 20 pts/round each (${matchRounds * 20} pts over ${matchRounds} rounds) · Social Optimum: 32 pts/round each (${matchRounds * 32} pts over ${matchRounds} rounds)`;

                        const contribs = history.map(h => Number(h.playerAction));
                        const avgContrib = Math.round((contribs.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                        const zeroContribs = history.filter(h => Number(h.playerAction) === 0).length;
                        const contribPct = Math.round((avgContrib / 20) * 100);
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Giving Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `Avg Contribution: ${avgContrib}/20 Tokens (${contribPct}% Giving Rate) · ${zeroContribs}/${matchRounds} Zero-Contribution Rounds`;
                        if (contribPct <= 15) {
                          gapInterpretationSentence = playerTotal >= botTotal
                            ? `Close to equilibrium: ${scoreCmp}. You contributed only ${avgContrib}/20 tokens (${contribPct}%), adhering closely to the free-riding dominant strategy and keeping your private endowment safe while collecting pool dividends.`
                            : `Close to equilibrium: ${scoreCmp}. You contributed only ${avgContrib}/20 tokens (${contribPct}%), adhering to the dominant free-riding strategy, but mutual low contributions trapped both players at low scores.`;
                        } else if (contribPct <= 45) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Noticeable deviation: ${scoreCmp}. You contributed an average of ${avgContrib}/20 tokens (${contribPct}%), but ${activeBot.name} free-rode on your public funding. Many people are conditional cooperators who are willing to contribute if others do, but cooperation tends to collapse when free-riders go unpunished.`
                            : `Noticeable deviation: ${scoreCmp}. You contributed an average of ${avgContrib}/20 tokens (${contribPct}%), balancing prosocial public investment with defensive self-preservation.`;
                        } else {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You contributed generously (${contribPct}% of endowment), but suffered free-rider exploitation as ${activeBot.name} contributed less. Many people are conditional cooperators who are willing to contribute if others do, but cooperation tends to collapse when free-riders go unpunished.`
                            : `Productive deviation from theory: ${scoreCmp}. By contributing ${contribPct}% of your endowment (${avgContrib}/20 tokens) rather than the 0-token dominant strategy, you unlocked mutual wealth multiplication through reciprocal collective investment.`;
                        }
                        actualPayoff = `Whole Match Score: You: ${playerTotal} pts · ${activeBot.name}: ${botTotal} pts (Surplus: ${totalMatchSurplus} pts)`;
                        realPeopleSentence = "Real participants start by contributing 40–60% of their endowment out of social goodwill, but contributions steadily decay toward zero as conditional cooperators notice free-riders and reduce their own giving.";
                        keyTakeawaySentence = "When private returns to public investment are below cost, voluntary cooperation inevitably collapses without social norms, reputation, or institutional sanctions.";

                      } else if (selectedModuleId === 15) {
                        conceptBadge = "Anti-Coordination & Evolutionary ESS";
                        predictionLabel = "Anti-Coordination Nash & Mixed ESS";
                        predictionTitle = "Pure: (Hawk, Dove) [6, 0] & (Dove, Hawk) [0, 6] · Mixed ESS: 23% Hawk (2.3 pts/rd)";
                        predictionExplanation = `In Hawk-Dove, players seek to anti-coordinate: the best response to peaceful Dove (+3 pts/rd each) is aggressive Hawk (+6 pts/rd vs 0), but the best response to Hawk is Dove (0 vs -10 pts/rd collision). The symmetric mixed ESS is playing Hawk 23% of the time (3/13), yielding ~2.3 pts/round each (~${(matchRounds * 2.3).toFixed(1)} pts over ${matchRounds} rounds).`;
                        predictionFrequency = "Mixed ESS Benchmark: 23% Hawk / 77% Dove (p* = 3/13 ≈ 0.23, EV = ~2.3 pts/round)";
                        predictionPayoff = `Per round: Peaceful Sharing (Dove, Dove) = +3 pts/rd each · Exploit (Hawk, Dove) = +6 pts/rd vs 0 · Collision (Hawk, Hawk) = -10 pts/rd each [Over ${matchRounds} rounds: Peaceful Sharing = +${matchRounds * 3} pts each · Mutual Collision = -${matchRounds * 10} pts each]`;

                        const hawkCount = history.filter(h => h.playerAction === 'Hawk').length;
                        const doveCount = matchRounds - hawkCount;
                        const hawkPct = Math.round((hawkCount / matchRounds) * 100);
                        const crashes = history.filter(h => h.playerAction === 'Hawk' && h.botAction === 'Hawk').length;
                        const hawkEssGap = Math.abs(hawkPct - 23);
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Choices Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
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
                        actualPayoff = `Whole Match Payoff: You: ${playerTotal >= 0 ? `+${playerTotal}` : playerTotal} pts · ${activeBot.name}: ${botTotal >= 0 ? `+${botTotal}` : botTotal} pts`;
                        realPeopleSentence = "Real players often play Hawk too frequently hoping the other will blink, but repeated mutual Hawk collisions quickly teach players to alternate or establish convention-based ownership (bourgeois strategies).";
                        keyTakeawaySentence = "In brinkmanship conflicts, unyielding aggression risks catastrophic ruin; winning requires convincing the rival you will never blink so that they are forced to yield.";

                      } else if (selectedModuleId === 16 || selectedModuleId === 9) {
                        conceptBadge = "Subgame Perfection vs. Inequity Aversion";
                        predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                        predictionTitle = "SPNE Minimal Offer: $1.00/round (Proposer keeps $9.00/round)";
                        predictionExplanation = `Assuming pure self-interest, a rational responder accepts any positive sum ($1.00 > $0), so backward induction predicts the proposer offers $1.00 and keeps $9.00 per round ($${(matchRounds * 9).toFixed(2)} vs $${(matchRounds * 1).toFixed(2)} over ${matchRounds} rounds).`;
                        predictionFrequency = "Equilibrium Benchmark: Offer $1.00 (10% Pie Share; Proposer keeps 90%)";
                        predictionPayoff = `SPNE: Proposer $9.00/round ($${(matchRounds * 9).toFixed(2)} over ${matchRounds} rounds) · Responder $1.00/round ($${(matchRounds * 1).toFixed(2)} over ${matchRounds} rounds)`;

                        const offers = history.map(h => Number(h.playerAction));
                        const avgOffer = Math.round((offers.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                        const acceptedCount = history.filter(h => h.botAction === 'Accept').length;
                        const offerPct = Math.round((avgOffer / 10) * 100);
                        const scoreCmp = getScoreCmp(playerTotal, botTotal, true);

                        actualFrequencyTitle = `Your Offers Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `Avg Offer: $${avgOffer.toFixed(2)} of $10.00 (${offerPct}% Share) · ${acceptedCount}/${matchRounds} Offers Accepted`;
                        if (avgOffer <= 1.50) {
                          gapInterpretationSentence = playerTotal < botTotal || acceptedCount < matchRounds
                            ? `Close to equilibrium: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} adhered strictly to the 10% SPNE prediction ($1.00), but ${activeBot.name} vetoed low-ball offers to $0 to punish perceived greed.`
                            : `Close to equilibrium: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} adhered closely to the 10% SPNE prediction ($1.00), helped by finding a rational partner who accepted positive crumbs.`;
                        } else if (avgOffer <= 3.20) {
                          gapInterpretationSentence = playerTotal < botTotal || acceptedCount < matchRounds
                            ? `Noticeable deviation: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} (${offerPct}%) fell into the 20–30% danger zone, where rejections destroyed surplus.`
                            : `Noticeable deviation: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} (${offerPct}%) earned points by probing the boundary of acceptable bargaining concessions.`;
                        } else {
                          gapInterpretationSentence = playerTotal >= botTotal * 0.8
                            ? `Productive deviation from theory: ${scoreCmp}. Your average offer of $${avgOffer.toFixed(2)} (${offerPct}%) departed substantially from the selfish $1 SPNE prediction to satisfy social fairness norms, securing agreement in ${acceptedCount}/${matchRounds} matches and avoiding costly vetoes.`
                            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Offering $${avgOffer.toFixed(2)} (${offerPct}%) ensured guaranteed agreement, though high generosity conceded the majority of the surplus to your partner.`;
                        }
                        actualPayoff = `Whole Match Payoff: You: $${playerTotal.toFixed(2)} · ${activeBot.name}: $${botTotal.toFixed(2)} (Surplus: $${totalMatchSurplus.toFixed(2)})`;
                        realPeopleSentence = "In global experiments, real proposers typically offer 40–50% ($4–$5), and real responders reject offers below 20–30% ($2–$3) because strong negative reciprocity leads people to pay to punish perceived unfairness.";
                        keyTakeawaySentence = "Economic bargaining is constrained by social fairness norms: attempting to extract maximum theoretical surplus frequently triggers spiteful vetoes that leave both parties with nothing.";

                      } else if (selectedModuleId === 17) {
                        conceptBadge = "Zero-Sum Games & Minimax Randomization";
                        predictionLabel = "Mixed-Strategy Nash Equilibrium";
                        predictionTitle = "Minimax Randomization: 50% Heads / 50% Tails (1.0 pt/round EV)";
                        predictionExplanation = `In this zero-sum game with no pure equilibrium, the unique minimax mixed strategy is randomizing 50/50, yielding an expected value of 1.0 pt per round (${(matchRounds * 1.0).toFixed(1)} pts expected over ${matchRounds} rounds, a 50% win rate).`;
                        predictionFrequency = "Equilibrium Benchmark: Exactly 50% Heads / 50% Tails (p = 0.50 Minimax Mix)";
                        predictionPayoff = `Minimax EV: 1.0 pt/round each (${(matchRounds * 1.0).toFixed(1)} pts over ${matchRounds} rounds) · Stake per round: +2 pts for winner, 0 for loser`;

                        const headsCount = history.filter(h => h.playerAction === 'Heads').length;
                        const tailsCount = matchRounds - headsCount;
                        const headsPct = Math.round((headsCount / matchRounds) * 100);
                        const matchWins = history.filter(h => h.playerAction === h.botAction).length;
                        const penniesGap = Math.abs(headsPct - 50);
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Choices Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `${headsCount}/${matchRounds} Heads (${headsPct}%) · ${tailsCount}/${matchRounds} Tails (${100 - headsPct}%) · Matched ${matchWins}/${matchRounds} (${Math.round((matchWins / matchRounds) * 100)}% Win Rate)`;
                        if (penniesGap <= 6) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Close to equilibrium: ${scoreCmp}. Although your overall choice mix was near theoretical 50/50 (${headsPct}% Heads / ${100 - headsPct}% Tails), the ORDER of your choices was predictable, allowing ${activeBot.name} to anticipate your sequence; a true mixed strategy must also be unpredictable round to round, not just 50/50 in aggregate.`
                            : `Close to equilibrium: ${scoreCmp}. Your choice frequency was ${headsPct}% Heads and ${100 - headsPct}% Tails (within ${penniesGap}% of theoretical 50/50), maintaining true round-to-round unpredictability that prevented pattern exploitation and protected your expected payoff.`;
                        } else if (penniesGap <= 18) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Noticeable deviation: ${scoreCmp}. Your choice frequency was ${headsPct}% Heads and ${100 - headsPct}% Tails (a ${penniesGap}% gap from 50/50), and the ORDER of your choices looked predictable to ${activeBot.name}; a true mixed strategy must also be unpredictable round to round, in addition to maintaining a 50/50 frequency balance.`
                            : `Noticeable deviation: ${scoreCmp}. Your choice frequency tilted slightly to ${headsPct}% Heads (a ${penniesGap}% gap from 50/50), yet you outscored ${activeBot.name} by timing your coin shifts effectively.`;
                        } else {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Your choices tilted heavily to ${headsPct >= 50 ? `${headsPct}% Heads` : `${100 - headsPct}% Tails`} (a large ${penniesGap}% gap from 50/50), and the ORDER of your choices looked predictable, allowing ${activeBot.name} to anticipate your habits; a true mixed strategy must be unpredictable round to round, not anchored to recognizable patterns.`
                            : `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You heavily favored ${headsPct >= 50 ? 'Heads' : 'Tails'} (${headsPct >= 50 ? headsPct : 100 - headsPct}%), yet stayed ahead because your opponent failed to counter your directional anchor quickly enough.`;
                        }
                        actualPayoff = `Whole Match Payoff: You: +${playerTotal} pts · ${activeBot.name}: +${botTotal} pts (Match Stake: ${matchRounds * 2} pts)`;
                        realPeopleSentence = "Real people struggle with true randomness, often falling into negative recency (the gambler's fallacy—switching after a streak) or predictable alternating patterns that adaptive opponents quickly exploit.";
                        keyTakeawaySentence = "In pure conflict with no win-win outcomes, true mathematical randomness is the only unexploitable shield against strategic opponents.";

                      } else if (selectedModuleId === 18) {
                        conceptBadge = "Coordination with Conflicting Preferences";
                        predictionLabel = "Pure & Mixed Nash Equilibria";
                        predictionTitle = "Pure Nash: Opera [3, 2] or Football [2, 3] pts/round";
                        predictionExplanation = `There are two pure coordination equilibria per round: coordinating on Opera yields (+3 pts for you, +2 pts for bot per round) while coordinating on Football yields (+2 pts for you, +3 pts for bot per round). Miscoordination yields 0 pts per round. Mixed play yields an expected value of only 1.2 pts per round (${(matchRounds * 1.2).toFixed(1)} pts over ${matchRounds} rounds).`;
                        predictionFrequency = "Equilibrium Benchmark: 100% Coordinated on either Opera [3, 2] or Football [2, 3]";
                        predictionPayoff = `Coordinated Payoffs: +3 or +2 pts/round (+${matchRounds * 3} or +${matchRounds * 2} pts over ${matchRounds} rounds) · Miscoordination: 0 pts/round (0 pts over ${matchRounds} rounds)`;

                        const operaCount = history.filter(h => h.playerAction === 'Opera').length;
                        const footballCount = matchRounds - operaCount;
                        const operaPct = Math.round((operaCount / matchRounds) * 100);
                        const coordRounds = history.filter(h => (h.playerAction === 'Opera' && h.botAction === 'Opera') || (h.playerAction === 'Football' && h.botAction === 'Football')).length;
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Choices Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `${operaCount}/${matchRounds} Opera (${operaPct}%) · ${footballCount}/${matchRounds} Football (${100 - operaPct}%) · Coordinated: ${coordRounds}/${matchRounds}`;
                        if (coordRounds >= Math.round(matchRounds * 0.7) || operaPct === 100 || operaPct === 0) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Close to equilibrium: ${scoreCmp}. Although you coordinated in ${coordRounds}/${matchRounds} rounds, you repeatedly conceded to the bot's preferred venue rather than alternating turns fairly.`
                            : (40 <= operaPct && operaPct <= 60)
                            ? `Close to equilibrium: ${scoreCmp}. You coordinated across rounds with an even ${operaPct}% Opera / ${100 - operaPct}% Football split, establishing an egalitarian turn-taking convention that maximized joint welfare.`
                            : `Close to equilibrium: ${scoreCmp}. You coordinated successfully in ${coordRounds}/${matchRounds} rounds, asserting preference priority to lead scoring.`;
                        } else if (coordRounds >= Math.round(matchRounds * 0.4)) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Noticeable deviation: ${scoreCmp}. You coordinated in ${coordRounds}/${matchRounds} rounds, but miscoordination clashes reduced your score as neither player established a clear convention.`
                            : `Noticeable deviation: ${scoreCmp}. You coordinated in ${coordRounds}/${matchRounds} rounds, capturing surplus by asserting your preferred venue whenever coordination succeeded.`;
                        } else {
                          gapInterpretationSentence = `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. Miscoordination destroyed surplus in ${matchRounds - coordRounds}/${matchRounds} rounds because both players stubbornly insisted on their own favorite event, collapsing payoffs to zero.`;
                        }
                        actualPayoff = `Whole Match Payoff: You: +${playerTotal} pts · ${activeBot.name}: +${botTotal} pts (Surplus: ${totalMatchSurplus} pts)`;
                        realPeopleSentence = "In repeated play, real human pairs quickly converge on alternating between Opera and Football across rounds, achieving perfect 50/50 fairness and avoiding costly miscoordination.";
                        keyTakeawaySentence = "When parties share a common goal but disagree on details, establishing clear communication or alternating conventions is essential to avoid mutual deadlock.";

                      } else if (selectedModuleId === 19) {
                        conceptBadge = "Sequential Trust & Backward Induction";
                        predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                        predictionTitle = "Zero Trust: Send 0 pts (Investor keeps 10 pts/round, Trustee gets 0 pts/round)";
                        predictionExplanation = `By backward induction, a selfish trustee returns 0 pts in the final stage, so an anticipating investor sends 0 pts, keeping 10 pts per round (${matchRounds * 10} pts over ${matchRounds} rounds) while trustee gets 0 pts.`;
                        predictionFrequency = "Equilibrium Benchmark: Investor sends 0 pts (0% Trust Rate; Selfish Trustee returns 0 under SPNE)";
                        predictionPayoff = `SPNE: Investor keeps 10 pts/round, Trustee gets 0 (${matchRounds * 10} vs 0 over ${matchRounds} rounds) · Social Maximum: 15 pts each/round for fair 50/50 return (${matchRounds * 15} pts each over ${matchRounds} rounds; 30 pts/round joint total)`;

                        const investments = history.map(h => Number(h.playerAction));
                        const avgInv = Math.round((investments.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                        const trustRate = Math.round((avgInv / 10) * 100);
                        const returns = history.map(h => typeof h.botAction === 'number' ? h.botAction : 0);
                        const avgRet = Math.round((returns.reduce((a, b) => a + b, 0) / matchRounds) * 10) / 10;
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Transfers Across ${matchRounds} Round${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `Avg Transfer: ${avgInv}/10 pts (${trustRate}% Trust Rate) · Avg Return: ${avgRet} pts (Tripled to ${(avgInv * 3).toFixed(1)} pts/rd)`;
                        if (trustRate <= 15) {
                          gapInterpretationSentence = playerTotal >= botTotal
                            ? `Close to equilibrium: ${scoreCmp}. You transferred only ${avgInv}/10 pts (${trustRate}% trust rate), strictly adhering to the 0-point SPNE baseline and protecting your endowment from trustee moral hazard.`
                            : `Close to equilibrium: ${scoreCmp}. You transferred only ${avgInv}/10 pts (${trustRate}% trust rate), adhering to SPNE backward induction; you kept your capital safe, but missed out on the 3x surplus growth available through mutual trust.`;
                        } else if (trustRate <= 45) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Noticeable deviation: ${scoreCmp}. You entrusted an average of ${avgInv}/10 pts (${trustRate}%), but earned less because the trustee returned too little surplus.`
                            : `Noticeable deviation: ${scoreCmp}. You entrusted an average of ${avgInv}/10 pts (${trustRate}%), earning points by prudently probing ${activeBot.name}'s trustworthiness.`;
                        } else {
                          gapInterpretationSentence = playerTotal < botTotal && playerTotal <= matchRounds * 10
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You placed high trust in ${activeBot.name} by transferring ${trustRate}% of your endowment, but suffered losses because your partner exploited your vulnerability and kept the tripled wealth.`
                            : `Productive deviation from theory: ${scoreCmp}. By entrusting ${trustRate}% of your capital (${avgInv}/10 pts) instead of the 0-point SPNE prediction, you unlocked reciprocal wealth multiplication to generate high mutual returns with ${activeBot.name}.`;
                        }
                        actualPayoff = `Whole Match Capital: You: ${playerTotal} pts · ${activeBot.name}: ${botTotal} pts (Wealth: ${totalMatchSurplus} pts)`;
                        realPeopleSentence = "Real investors routinely send about 50% (5 pts) of their endowment, and trustees reciprocate by returning slightly more than the initial transfer, demonstrating that social trust and warm-glow reciprocity drive real markets.";
                        keyTakeawaySentence = "Economic growth relies on vulnerability and trust: by trusting others with capital, parties expand the economic pie and generate mutual prosperity through reciprocal goodwill.";

                      } else if (selectedModuleId === 20) {
                        conceptBadge = "Backward Induction & Rosenthal's Paradox";
                        predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                        predictionTitle = "SPNE Immediate Take at Node 1: (+2, 0) pts per chain";
                        predictionExplanation = `Backward induction from Node 6 backward predicts that fear of partner defection compels Player 1 to defect immediately at Node 1, securing +2 pts while giving the bot 0 pts per chain (${matchRounds * 2} vs 0 over ${matchRounds} chains) instead of reaching the +8 pts each cooperative optimum (${matchRounds * 8} pts each over ${matchRounds} chains).`;
                        predictionFrequency = "Equilibrium Benchmark: 100% Immediate Take at Node 1 (SPNE Path)";
                        predictionPayoff = `SPNE Defection: +2 pts/chain for you, 0 for bot (${matchRounds * 2} vs 0 over ${matchRounds} chains) · Social Optimum: +8 pts each/chain (${matchRounds * 8} pts each over ${matchRounds} chains)`;

                        const n1Takes = history.filter(h => String(h.playerAction).includes('Node 1')).length;
                        const passedN1Count = matchRounds - n1Takes;
                        const passedN1Pct = Math.round((passedN1Count / matchRounds) * 100);
                        const scoreCmp = getScoreCmp(playerTotal, botTotal);

                        actualFrequencyTitle = `Your Decisions Across ${matchRounds} Centipede Chain${matchRounds > 1 ? 's' : ''}`;
                        actualFrequencyBreakdown = `${n1Takes}/${matchRounds} Node 1 Immediate Takes · ${passedN1Count}/${matchRounds} Chains Passed Beyond Node 1 (${passedN1Pct}% Trust Rate)`;
                        if (passedN1Pct <= 15) {
                          gapInterpretationSentence = playerTotal >= botTotal
                            ? `Close to equilibrium: ${scoreCmp}. You took at Node 1 in ${n1Takes}/${matchRounds} chains (${100 - passedN1Pct}% immediate defection), adhering to SPNE backward induction and securing +2 pts while giving the bot 0.`
                            : `Close to equilibrium: ${scoreCmp}. You followed backward induction by taking at Node 1, guaranteeing +2 pts per chain but leaving the 16-point cooperative jackpot unclaimed.`;
                        } else if (passedN1Pct <= 50) {
                          gapInterpretationSentence = playerTotal < botTotal
                            ? `Noticeable deviation: ${scoreCmp}. You passed beyond Node 1 in ${passedN1Pct}% of chains, but ${activeBot.name} took early at intermediate nodes, leaving you with lower payoffs.`
                            : `Noticeable deviation: ${scoreCmp}. You passed beyond Node 1 in ${passedN1Pct}% of chains, timing your exits to claim larger shares before the bot could defect.`;
                        } else {
                          gapInterpretationSentence = playerTotal < botTotal && playerTotal <= matchRounds * 2
                            ? `Systematic deviation, here is what that suggests about behavior: ${scoreCmp}. You consistently passed to grow the collective pot (${passedN1Pct}% passing rate), but earned less because the bot defected ahead of you at advanced nodes.`
                            : `Productive deviation from theory: ${scoreCmp}. You passed beyond Node 1 in ${passedN1Pct}% of chains, directly defying the cold backward induction prediction to build sequential reciprocal wealth with ${activeBot.name}.`;
                        }
                        actualPayoff = `Cumulative Match Score: You: +${playerTotal} pts · ${activeBot.name}: +${botTotal} pts (Wealth: ${totalMatchSurplus} pts)`;
                        realPeopleSentence = "In laboratory experiments, real people routinely pass because reciprocal trust and altruism offer massive mutual gains, and players only risk losing a single point to give their partner the chance to double the pot.";
                        keyTakeawaySentence = "Sequential trust can unlock enormous mutual wealth, but it requires both players to resist the constant temptation of backward induction defection.";
                      }

                      return (
                        <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-blue-800/60 shadow-xl space-y-3 sm:space-y-3.5 text-xs max-w-full overflow-hidden">
                          {/* Card Header with Concept Badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-b border-slate-800/80 pb-2">
                            <span className="font-extrabold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                              <span>⚖️ Whole Match Debrief: Theory vs. Actual Play</span>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">
                                ({matchRounds} Round{matchRounds > 1 ? 's' : ''} Summarized)
                              </span>
                            </span>
                            <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wide self-start sm:self-auto">
                              <AnnotateGlossaryText text={conceptBadge} />
                            </span>
                          </div>

                          {/* Match Totals Banner: Student vs Bot over ALL rounds */}
                          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xl shrink-0">🏆</span>
                              <div className="min-w-0">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
                                  Cumulative Match Standings ({matchRounds} Round{matchRounds > 1 ? 's' : ''})
                                </div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                                  <span className="text-emerald-400 shrink-0">You: {playerTotal} pts</span>
                                  <span className="text-slate-500 font-normal shrink-0">vs</span>
                                  <span className={`${activeBot.color} break-words`}>{activeBot.name}: {botTotal} pts</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start sm:self-auto shrink-0">
                              <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                Total Surplus: <strong className="text-sky-400 font-bold">{totalMatchSurplus} pts</strong>
                              </span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${playerTotal >= botTotal ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                                {playerTotal >= botTotal ? '✓ Outperformed Bot' : 'Bot Captured Surplus'}
                              </span>
                            </div>
                          </div>

                          {/* Side-by-Side Comparison Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                            {/* Theoretical Prediction */}
                            <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-rose-900/50 space-y-2">
                              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                                <span><AnnotateGlossaryText text={predictionLabel} /></span>
                                <span className="font-mono text-rose-300">Theory</span>
                              </div>
                              <div className="text-xs sm:text-sm font-black text-white font-mono break-words">
                                <AnnotateGlossaryText text={predictionTitle} />
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                <AnnotateGlossaryText text={predictionExplanation} />
                              </p>
                              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-1">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  <GlossaryTerm term="nash-equilibrium">Equilibrium Frequency Benchmark</GlossaryTerm>
                                </div>
                                <div className="text-xs font-mono font-bold text-rose-300">
                                  <AnnotateGlossaryText text={predictionFrequency} />
                                </div>
                              </div>
                              <div className="text-[11px] font-mono font-bold text-rose-300/90 pt-1.5 border-t border-slate-800 break-words">
                                <AnnotateGlossaryText text={predictionPayoff} />
                              </div>
                            </div>

                            {/* What Actually Happened across the Whole Match */}
                            <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-emerald-900/50 space-y-2">
                              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Actual Whole Match Performance</span>
                                <span className="font-mono text-emerald-300">{matchRounds} Rds Played</span>
                              </div>
                              <div className="text-xs sm:text-sm font-black text-white font-mono break-words">
                                {actualFrequencyTitle}
                              </div>
                              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-1">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Student Choice Frequencies
                                </div>
                                <div className="text-xs font-mono font-bold text-emerald-300">
                                  {actualFrequencyBreakdown}
                                </div>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                <strong className="text-sky-300 font-semibold">Gap vs. Equilibrium: </strong>
                                <span><AnnotateGlossaryText text={gapInterpretationSentence} /></span>
                              </p>
                              <div className="text-[11px] font-mono font-bold text-emerald-300/90 pt-1.5 border-t border-slate-800 break-words">
                                {actualPayoff}
                              </div>
                            </div>
                          </div>

                          {/* What Real People Tend to Do & Why */}
                          <div className="p-3 sm:p-3.5 rounded-xl bg-blue-950/60 border border-blue-700/60 text-slate-200 text-xs sm:text-sm leading-relaxed">
                            <strong className="text-amber-300 font-bold block sm:inline mb-1 sm:mb-0">What Real People Tend to Do & Why: </strong>
                            <span><AnnotateGlossaryText text={realPeopleSentence} /></span>
                          </div>

                          {/* One-Line Key Takeaway */}
                          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm text-slate-200 flex items-start gap-2.5">
                            <span className="text-amber-400 font-black text-sm shrink-0">💡</span>
                            <div>
                              <span className="font-bold text-amber-300">Key Takeaway: </span>
                              <span className="text-slate-100 font-medium"><AnnotateGlossaryText text={keyTakeawaySentence} /></span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Next Action Area */}
                    {selectedModuleId === 20 ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              markGameCompleted(20);
                              resetExperiment(undefined, nextModule.id);
                            }}
                            className="flex-1 min-h-[48px] py-3 px-4 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Proceed to Next Game (Game {nextModuleIndex} of {totalModulesCount}: {nextModule.shortTitle})</span>
                            <span>→</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              markGameCompleted(20);
                              setCurrentRound(totalRounds + 1);
                            }}
                            className="min-h-[44px] py-3 px-4 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>📊 Open Theory Debrief</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            markGameCompleted(20);
                            handleNextRound();
                          }}
                          className="w-full min-h-[44px] py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>🔁 Play 6-Node Chain Again with {activeBot.name}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {currentRound >= totalRounds ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                markGameCompleted(selectedModuleId);
                                resetExperiment(undefined, nextModule.id);
                              }}
                              className="flex-1 min-h-[48px] py-3 px-4 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span>Proceed to Next Game (Game {nextModuleIndex} of {totalModulesCount}: {nextModule.shortTitle})</span>
                              <span>→</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                markGameCompleted(selectedModuleId);
                                setCurrentRound(totalRounds + 1);
                              }}
                              className="min-h-[48px] py-3 px-4 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>📊 Open Theory Debrief</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={handleNextRound}
                              className="flex-1 min-h-[48px] py-3 px-4 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span>Proceed to Next Trial (Trial {currentRound + 1} of {totalRounds})</span>
                              <span>→</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                markGameCompleted(selectedModuleId);
                                resetExperiment(undefined, nextModule.id);
                              }}
                              className="min-h-[48px] py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Skip to Game {nextModuleIndex} of {totalModulesCount}</span>
                              <span>→</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Live Scoreboard History */}
            {history.length > 0 && (
              <div className="bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-bold text-white">Experiment Match History</span>
                  <div className="font-mono font-bold text-xs">
                    <span className="text-emerald-400">You: {playerTotalScore}</span>
                    <span className="text-slate-500 mx-2">vs</span>
                    <span className={activeBot.color}>{activeBot.name}: {botTotalScore}</span>
                  </div>
                </div>

                {/* Mobile Match History Compact Cards (sm:hidden) */}
                <div className="sm:hidden space-y-2">
                  {history.map(item => (
                    <div key={item.round} className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-xs font-mono space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-1">
                        <span className="font-bold text-slate-300">Match #{item.round}</span>
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-emerald-400">You: +${item.playerPayoff}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{activeBot.name}: +${item.botPayoff}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-sans">Your Move</span>
                          <span className="text-white font-bold break-words">{String(item.playerAction)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-sans">{activeBot.name}</span>
                          <span className={`font-bold break-words ${activeBot.color}`}>{String(item.botAction)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Match History Table (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto max-w-full touch-pan-x">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2 rounded-l-lg">#</th>
                        <th className="p-2">Your Move</th>
                        <th className="p-2">Bot Move</th>
                        <th className="p-2">Your Payoff</th>
                        <th className="p-2 rounded-r-lg">Bot Payoff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {history.map(item => (
                        <tr key={item.round} className="hover:bg-slate-800/40">
                          <td className="p-2 text-slate-400">#{item.round}</td>
                          <td className="p-2 text-white font-bold">{String(item.playerAction)}</td>
                          <td className={`p-2 font-bold ${activeBot.color}`}>{String(item.botAction)}</td>
                          <td className="p-2 text-emerald-400 font-bold">+{item.playerPayoff}</td>
                          <td className="p-2 text-slate-400">+{item.botPayoff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
