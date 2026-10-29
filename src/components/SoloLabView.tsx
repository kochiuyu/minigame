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
import { drawValuation } from '../utils/auctionEngine';

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
      const saved = localStorage.getItem('gameTheoryCompletedSoloGames');
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
          localStorage.setItem('gameTheoryCompletedSoloGames', JSON.stringify(updated));
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
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Choose simultaneously: <strong className="text-emerald-400">Cooperate (🤝)</strong> to pursue mutual gain ($2 each), or <strong className="text-rose-400">Defect (⚔️)</strong> to seek selfish temptation ($3 for you, leaving opponent with $0). If both defect, both fall into the trap earning only $1.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px] pt-1">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-emerald-400 font-bold">Mutual Coop (🤝, 🤝)</div>
                      <div className="text-slate-300 mt-0.5">$2 for you, $2 for Bot</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-rose-400 font-bold">Mutual Defect (⚔️, ⚔️)</div>
                      <div className="text-slate-300 mt-0.5">$1 for you, $1 for Bot</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-amber-400 font-bold">You Defect / Bot Coops</div>
                      <div className="text-slate-300 mt-0.5">$3 for you, $0 for Bot</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-red-400 font-bold">You Coop / Bot Defects</div>
                      <div className="text-slate-300 mt-0.5">$0 for you, $3 for Bot</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Finite Repeated Game: Backward induction predicts mutual defection on every trial ($1, $1).
                  </div>
                </div>
              )}

              {selectedModuleId === 13 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🦌 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Choose whether to <strong className="text-emerald-400">Hunt Stag (🦌)</strong> or <strong className="text-amber-400">Hunt Hare (🐇)</strong> without prior communication. Hunting Stag yields a massive +10 pts but requires mutual coordination; hunting Hare safely guarantees +4 pts solo.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-emerald-400">Hunt Stag</strong>: If both hunt Stag, both get <strong className="text-white">+10 pts</strong>! If you hunt alone, you get <strong className="text-rose-400">0 pts</strong>.</li>
                    <li><strong className="text-amber-400">Hunt Hare</strong>: Risk-free solo action. You get <strong className="text-white">+4 pts</strong> guaranteed regardless of partner.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Two Nash Equilibria: (Stag, Stag) is Payoff Dominant (+10); (Hare, Hare) is Risk Dominant (+4).
                  </div>
                </div>
              )}

              {selectedModuleId === 14 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🏷️ How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Select a product price between $10 and $50 (production cost $MC = $10; demand $Q = 100 - P$). The firm with the strictly lower price captures 100% of market demand, while tied prices split demand 50/50.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-emerald-400">Strictly Lower Price</strong>: Sells 100% of demand ($Q = 100 - P$); higher price sells 0 units.</li>
                    <li><strong className="text-amber-400">Tied Prices</strong>: Sells 50% of demand each. Production cost is $10 per unit.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Bertrand Paradox: Price competition with identical goods drives equilibrium price to cost ($P = $10, profit = $0).
                  </div>
                </div>
              )}

              {selectedModuleId === 7 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>⚖️ How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Submit a sealed bid ($b \in [1, 10]$) for an item you privately value at <strong className="text-emerald-400 font-mono">${studentValuation}.00</strong>. The highest bidder wins, but pays the runner-up's bid (the second-highest price), NOT their own bid!
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-white">Winner</strong>: Highest bidder wins item and pays second-highest bid.</li>
                    <li><strong className="text-emerald-400">Profit</strong>: True Valuation ($${studentValuation}.00) - Clearing Price Paid. Loser gets $0.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Weakly Dominant Strategy: Bidding your exact true valuation (b = v = ${studentValuation}.00) dominates all other bids.
                  </div>
                </div>
              )}

              {selectedModuleId === 11 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>💭 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Submit an integer guess between 0 and 100. The winning target is exactly <strong className="text-amber-300">2/3 of the average</strong> of your guess and the bot's guess. Whoever is closest to the 2/3 target wins 10 points (ties split 5-5).
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-white">Target Formula</strong>: Target = (2/3) × (Your Guess + Bot Guess) / 2.</li>
                    <li><strong className="text-emerald-400">Winner</strong>: Smallest absolute distance |Guess - Target| wins 10 points.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Common Knowledge Equilibrium: Iterated elimination of dominated strategies cascades infinitely to Guess = 0.
                  </div>
                </div>
              )}

              {selectedModuleId === 12 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🌍 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    You receive 20 tokens each trial. Choose how many tokens (0 to 20) to contribute to the public pool. Contributed tokens are multiplied by 1.6x and divided equally, while kept tokens remain yours privately.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-white">Payoff</strong>: (20 - c) + 0.8 × (c + c_bot). Kept tokens earn $1.00 each.</li>
                    <li><strong className="text-amber-400">Dilemma</strong>: Free-riding tempts contributing 0, but mutual cooperation yields 32 pts each.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Dominant Strategy Equilibrium: Contribute 0 tokens (Nash trap of 20 pts vs social optimum 32 pts).
                  </div>
                </div>
              )}

              {selectedModuleId === 15 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🦅 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Choose <strong className="text-emerald-400">Dove (🕊️)</strong> for peaceful sharing (+3 pts each) or <strong className="text-rose-400">Hawk (🦅)</strong> to aggressively fight for the entire territory (+6 pts). If BOTH play Hawk, a devastating head-on collision inflicts -10 pts on each!
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-emerald-400">Mutual Dove</strong>: Split resource peacefully (<strong className="text-white">+3 pts each</strong>).</li>
                    <li><strong className="text-rose-400">Hawk vs Dove</strong>: Hawk grabs all (<strong className="text-emerald-400">+6 pts</strong>), Dove retreats (0 pts).</li>
                    <li><strong className="text-red-500 font-bold">Mutual Hawk Clash</strong>: Severe collision damage (<strong className="text-rose-400">-10 pts each</strong>)!</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Anti-Coordination Nash: (Hawk, Dove) and (Dove, Hawk). Mixed ESS: Randomize Hawk ~23% of the time.
                  </div>
                </div>
              )}

              {selectedModuleId === 16 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🍰 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    As Proposer, you divide a <strong className="text-white">$10.00 prize</strong>. Offer an amount ($0 to $10) to the Responder Bot. If the Bot accepts, you keep (10 - Offer) and the bot receives Offer. If the bot rejects, BOTH players receive $0.00!
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-emerald-400">Accept</strong>: Proposer receives $10 - Offer, Responder receives Offer.</li>
                    <li><strong className="text-rose-400">Reject</strong>: Deal collapses; entire $10 pie destroyed ($0 for both).</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Subgame Perfect Equilibrium: Proposer offers $1.00; rational Responder accepts ($1 vs $0).
                  </div>
                </div>
              )}

              {selectedModuleId === 17 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🪙 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    You and the Bot choose <strong className="text-white">Heads (🪙)</strong> or <strong className="text-white">Tails (🪙)</strong> simultaneously in zero-sum conflict. As the <strong className="text-emerald-400">Matcher</strong>, you win +2 pts if coins match (HH or TT); the Bot (<strong className="text-amber-400">Mismatcher</strong>) wins +2 pts if coins differ.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-emerald-400">Match (HH or TT)</strong>: You win <strong className="text-white">+2 pts</strong> (Bot gets 0 pts).</li>
                    <li><strong className="text-amber-400">Mismatch (HT or TH)</strong>: Bot wins <strong className="text-white">+2 pts</strong> (You get 0 pts).</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Unique Minimax Equilibrium: Randomize Heads and Tails with exact 50/50 probability (p = 0.50).
                  </div>
                </div>
              )}

              {selectedModuleId === 18 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🎭 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    You and your partner choose between <strong className="text-purple-400">Opera (🎭)</strong> and <strong className="text-amber-400">Football (⚽)</strong> without communication. You prefer Opera (+3 pts for you, +2 for Bot if coordinated); Bot prefers Football (+2 for you, +3 for Bot if coordinated).
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-purple-400">Both Opera</strong>: +3 pts for you, +2 pts for Bot.</li>
                    <li><strong className="text-amber-400">Both Football</strong>: +2 pts for you, +3 pts for Bot.</li>
                    <li><strong className="text-rose-400">Miscoordination</strong>: Choose different events → <strong className="text-white">0 pts</strong> for both!</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Two pure Nash equilibria: (Opera, Opera) and (Football, Football). Mixed strategy EV = 1.2 pts.
                  </div>
                </div>
              )}

              {selectedModuleId === 19 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🏦 How to Play:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    As Investor, you start with 10 points and decide how much ($0 \le X \le 10$) to send to the Trustee Bot. Any points sent are <strong className="text-emerald-400">tripled (3x)</strong> upon receipt; the Trustee then chooses how much ($Y$) to return to you.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-white">Transfer</strong>: Sent investment $X$ becomes $3X$ in Trustee's hands.</li>
                    <li><strong className="text-emerald-400">Your Payoff</strong>: $(10 - X) + Y$. Trustee Payoff: $3X - Y$.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    Selfish SPNE: Backward induction predicts Trustee returns $0; rational Investor sends $0 (10 pts kept).
                  </div>
                </div>
              )}

              {selectedModuleId === 20 && (
                <div className="space-y-2.5 text-slate-300">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🐛 Quick Rules:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                    <li>
                      <strong className="text-white">Goal:</strong> Grow the pot by passing, or take the larger share before your opponent does.
                    </li>
                    <li>
                      <strong className="text-white">Turn Order:</strong> You choose at <strong className="text-sky-400">Nodes 1, 3, 5</strong>. The Bot chooses at <strong className="text-amber-400">Nodes 2, 4, 6</strong>.
                    </li>
                    <li>
                      <strong className="text-emerald-400">Pass:</strong> Hand the turn to the other player and double the pot for both of you.
                    </li>
                    <li>
                      <strong className="text-rose-400">Take:</strong> End the match immediately to claim the larger share (giving the other player the smaller share).
                    </li>
                    <li>
                      <strong className="text-amber-300">Terminal Reward:</strong> If both players pass all 6 nodes, you both earn the maximum prize of <strong className="text-white">+8 pts each</strong>!
                    </li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs text-blue-200">
                    6-Node Chain: Player moves at nodes 1, 3, 5 · Bot moves at nodes 2, 4, 6. Theory predicts Take at Node 1 (2, 0).
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
                        <span className="font-mono text-lg font-black text-emerald-400">${trustInvestment}.00 (Tripled to ${trustInvestment * 3}.00)</span>
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
                          <span className="text-white font-bold text-sm">${10 - trustInvestment}.00</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-emerald-400 text-[10px] block uppercase">Tripled Trustee Fund</span>
                          <span className="text-emerald-300 font-bold text-sm">${trustInvestment * 3}.00</span>
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

                    {/* Dedicated Post-Match Debrief: Theory vs Actual Play & Behavioral Insights */}
                    {lastRoundResult && (() => {
                      let conceptBadge = "Game Theory Debrief";
                      let predictionLabel = "Theoretical Prediction";
                      let predictionTitle = "Equilibrium Benchmark";
                      let predictionExplanation = "";
                      let predictionPayoff = "";
                      let actualTitle = `You: ${String(lastRoundResult.playerAction)} · ${activeBot.name}: ${String(lastRoundResult.botAction)}`;
                      let actualExplanation = "";
                      let actualPayoff = "";
                      let realPeopleSentence = "";

                      const totalSurplus = Math.round((lastRoundResult.playerPayoff + lastRoundResult.botPayoff) * 10) / 10;

                      if (selectedModuleId === 6) {
                        conceptBadge = "Backward Induction & Finite Folk Theorem";
                        predictionLabel = "Backward Induction (SPNE)";
                        predictionTitle = "Mutual Defection: (Defect, Defect) [$1, $1]";
                        predictionExplanation = "In any known finite repeated game, backward induction predicts defection on the final round, unspooling cooperation backward so rational players defect on every trial.";
                        predictionPayoff = "Nash Trap Benchmark: $1.00 each ($2.00 total surplus)";

                        const bothCoop = lastRoundResult.playerAction === 'Cooperate' && lastRoundResult.botAction === 'Cooperate';
                        const bothDefect = lastRoundResult.playerAction === 'Defect' && lastRoundResult.botAction === 'Defect';
                        const diffFromNash = lastRoundResult.playerPayoff - 1;

                        actualTitle = `You: ${lastRoundResult.playerAction} · ${activeBot.name}: ${lastRoundResult.botAction}`;
                        actualExplanation = `You earned +${lastRoundResult.playerPayoff} pts (${diffFromNash >= 0 ? `+${diffFromNash}` : `${diffFromNash}`} vs Nash trap) and ${activeBot.name} earned +${lastRoundResult.botPayoff} pts. ${bothCoop ? "Mutual cooperation unlocked the Pareto-optimal $2 reward each!" : bothDefect ? "Mutual defection trapped both players in the suboptimal $1 outcome." : lastRoundResult.playerAction === 'Defect' ? "You exploited the bot's cooperation for the maximum temptation payoff ($3 vs $0)!" : "The bot defected and captured $3 while you received the sucker's payoff ($0)."}`;
                        actualPayoff = `Total Surplus: $${totalSurplus}.00 (${(totalSurplus / 2).toFixed(1)}x Nash surplus)`;
                        realPeopleSentence = "In laboratory trials, real players sustain high cooperation early on using conditional reciprocity (Tit-for-Tat) to earn higher payoffs, only beginning to defect in the final 1–2 rounds as the horizon closes.";

                      } else if (selectedModuleId === 13) {
                        conceptBadge = "Payoff Dominance vs. Risk Dominance";
                        predictionLabel = "Coordination Equilibria";
                        predictionTitle = "(Stag, Stag) [+10, +10] vs (Hare, Hare) [+4, +4]";
                        predictionExplanation = "Two pure Nash equilibria exist: (Stag, Stag) is Payoff Dominant maximizing social welfare, but (Hare, Hare) is Risk Dominant guaranteeing +4 pts safe against betrayal.";
                        predictionPayoff = "Payoff Dominant: 10 pts · Risk Dominant: 4 pts";

                        const bothStag = lastRoundResult.playerAction === 'Stag' && lastRoundResult.botAction === 'Stag';
                        const bothHare = lastRoundResult.playerAction === 'Hare' && lastRoundResult.botAction === 'Hare';

                        actualTitle = `You: ${lastRoundResult.playerAction} · ${activeBot.name}: ${lastRoundResult.botAction}`;
                        actualExplanation = `You earned +${lastRoundResult.playerPayoff} pts and ${activeBot.name} earned +${lastRoundResult.botPayoff} pts. ${bothStag ? "Superb coordination! Mutual trust successfully captured the payoff-dominant Stag (+10 pts each)." : bothHare ? "Both players retreated to the risk-dominant safety of Hare (+4 pts each)." : lastRoundResult.playerAction === 'Stag' ? "Miscoordination penalty: You took the risk to hunt Stag alone (0 pts) while the bot took safe Hare." : "The bot risked Stag alone (0 pts) while you safely banked +4 pts on Hare."}`;
                        actualPayoff = `Total Surplus: ${totalSurplus} pts (${bothStag ? 'Payoff Dominant Max' : bothHare ? 'Risk Dominant' : 'Miscoordination'})`;
                        realPeopleSentence = "Real players often start by testing Stag, but easily retreat to the risk-dominant safety of Hare after a single miscoordination because the fear of earning 0 outweighs the promise of +10.";

                      } else if (selectedModuleId === 14) {
                        conceptBadge = "Price Competition & Bertrand Paradox";
                        predictionLabel = "Bertrand Paradox (Nash)";
                        predictionTitle = "Price at Marginal Cost: P = MC = $10.00";
                        predictionExplanation = "With identical goods and unconstrained supply, aggressive price competition forces prices down to marginal cost ($10), completely destroying economic profit ($0).";
                        predictionPayoff = "Nash Equilibrium Profit: $0.00 · Monopoly Collusion ($40): $450.00 each";

                        const myPrice = Number(lastRoundResult.playerAction);
                        const botPrice = Number(lastRoundResult.botAction);
                        const wonMarket = myPrice < botPrice;
                        const tieMarket = myPrice === botPrice;

                        actualTitle = `Your Price: $${myPrice} · ${activeBot.name}: $${botPrice}`;
                        actualExplanation = wonMarket
                          ? `You undercut ${activeBot.name} ($${myPrice} vs $${botPrice}) to capture 100% of market demand, earning $${lastRoundResult.playerPayoff} profit!`
                          : tieMarket
                          ? `Tied prices at $${myPrice}! Demand split 50/50, yielding $${lastRoundResult.playerPayoff} profit each.`
                          : `${activeBot.name} undercut your price ($${botPrice} vs $${myPrice}), capturing 100% of market demand ($0 profit for you).`;
                        actualPayoff = `Your Profit: $${lastRoundResult.playerPayoff} (${lastRoundResult.playerPayoff > 0 ? `+$${lastRoundResult.playerPayoff} above Bertrand trap` : 'Trapped at Bertrand $0'})`;
                        realPeopleSentence = "Real managers and lab subjects initially try to sustain tacit collusion near $35–$40, but price cutting inevitably erupts as players cannot resist the temptation to capture 100% of the market with a $1 undercut.";

                      } else if (selectedModuleId === 7) {
                        conceptBadge = "Incentive Compatibility & Dominant Strategies";
                        predictionLabel = "Weakly Dominant Strategy";
                        predictionTitle = `Truthful Bidding: Bid = True Valuation ($${studentValuation}.00)`;
                        predictionExplanation = "Bidding exactly your true valuation (b = v) weakly dominates all other bids: the second-price clearing rule decouples what you pay from what you bid, eliminating any incentive to shave or bluff.";
                        predictionPayoff = `Dominant Bid: $${studentValuation}.00 · True Item Value: $${studentValuation}.00`;

                        const myBid = Number(lastRoundResult.playerAction);
                        const rivalBid = Number(lastRoundResult.botAction);
                        const wonAuction = myBid > rivalBid || (myBid === rivalBid && lastRoundResult.playerPayoff > 0);
                        const clearingPrice = rivalBid;

                        actualTitle = `Your Bid: $${myBid}.00 · ${activeBot.name}: $${rivalBid}.00`;
                        actualExplanation = `${wonAuction ? `You won the item! You paid the second-highest bid ($${clearingPrice}.00), securing $${lastRoundResult.playerPayoff} profit.` : `Outbid by ${activeBot.name} ($${rivalBid}.00 vs $${myBid}.00); profit is $0.00.`} ${myBid === studentValuation ? "You played the dominant strategy of truthful bidding ($b = v)." : myBid > studentValuation ? `You overbid by $${myBid - studentValuation}.00, risking winner's curse losses if opponents bid aggressively.` : `You underbid by $${studentValuation - myBid}.00, risking missing a profitable win.`}`;
                        actualPayoff = `Profit: $${lastRoundResult.playerPayoff}.00 (Item Value: $${studentValuation}.00 · Price Paid: $${wonAuction ? clearingPrice : 0}.00)`;
                        realPeopleSentence = "In laboratory auctions, real bidders systematically overbid (b > v) due to competitive excitement and a mistaken fear of losing, which exposes them to winner's curse losses when competitors bid aggressively.";

                      } else if (selectedModuleId === 11) {
                        conceptBadge = "Level-k Strategic Depth & Iterated Dominance";
                        predictionLabel = "Common Knowledge Nash Equilibrium";
                        predictionTitle = "Unique Equilibrium Guess: 0";
                        predictionExplanation = "Iterated elimination of strictly dominated strategies eliminates any guess > 66.7, then > 44.4, cascading infinitely (50 → 33 → 22 → ... → 0) under common knowledge of rationality.";
                        predictionPayoff = "Level-0: 50 · Level-1: 33 · Level-2: 22 · Nash: 0";

                        const myGuess = Number(lastRoundResult.playerAction);
                        const botGuess = Number(lastRoundResult.botAction);
                        const avg = (myGuess + botGuess) / 2;
                        const target = Math.round((avg * 2 / 3) * 10) / 10;
                        const myDist = Math.abs(myGuess - target);
                        const botDist = Math.abs(botGuess - target);
                        const iWon = myDist < botDist;
                        const tied = myDist === botDist;

                        actualTitle = `Your Guess: ${myGuess} · ${activeBot.name}: ${botGuess}`;
                        actualExplanation = `Average guess was ${avg.toFixed(1)} and the 2/3 target was ${target.toFixed(1)}. ${iWon ? `You were closer to the target (distance ${myDist.toFixed(1)} vs ${botDist.toFixed(1)}) and won +10 points!` : tied ? `Exact tie in distance to the target! Split +5 points each.` : `${activeBot.name} was closer to the target (distance ${botDist.toFixed(1)} vs ${myDist.toFixed(1)}) and claimed 10 points.`}`;
                        actualPayoff = `Target: ${target.toFixed(1)} · Winner: ${iWon ? 'You (+10 pts)' : tied ? 'Tied (+5 pts each)' : activeBot.name + ' (+10 pts)'}`;
                        realPeopleSentence = "Real human cohorts average 1 to 2 steps of strategic reasoning (Level-1 to Level-2), making guesses between 20 and 35 routinely win over the 'theoretically rational' guess of 0.";

                      } else if (selectedModuleId === 12) {
                        conceptBadge = "Free-Rider Problem & Social Efficiency";
                        predictionLabel = "Dominant Strategy Nash Trap";
                        predictionTitle = "Contribute 0 Tokens (Full Free-Riding)";
                        predictionExplanation = "Because each token contributed returns only 0.80 pts to the contributor, contributing 0 is a strictly dominant strategy, locking both players into the suboptimal Nash trap (20 pts each vs 32 pts if cooperative).";
                        predictionPayoff = "Nash Trap: 20 pts each · Social Optimum: 32 pts each";

                        const myContrib = Number(lastRoundResult.playerAction);
                        const botContrib = Number(lastRoundResult.botAction);
                        const totalPool = myContrib + botContrib;
                        const dividend = Math.round((totalPool * 1.6 / 2) * 10) / 10;
                        const diffFromNash = Math.round((lastRoundResult.playerPayoff - 20) * 10) / 10;

                        actualTitle = `Contributed: ${myContrib}/20 · ${activeBot.name}: ${botContrib}/20`;
                        actualExplanation = `Total pool reached ${totalPool} tokens (grew to ${(totalPool * 1.6).toFixed(1)} pts), delivering a public dividend of ${dividend.toFixed(1)} pts to each player. You earned ${lastRoundResult.playerPayoff} pts and ${activeBot.name} earned ${lastRoundResult.botPayoff} pts. ${myContrib === 0 && botContrib > 0 ? "You successfully free-rode on the bot's public contribution!" : myContrib > botContrib ? "The bot free-rode on your public contribution." : myContrib === 20 && botContrib === 20 ? "Both fully contributed, maximizing group welfare (+32 pts each)!" : "Partial contributions yielded modest social dividends."}`;
                        actualPayoff = `Dividend: +${dividend.toFixed(1)} pts · Net Payoff: ${lastRoundResult.playerPayoff} pts (${diffFromNash >= 0 ? `+${diffFromNash}` : `${diffFromNash}`} vs Nash)`;
                        realPeopleSentence = "Real participants start by contributing 40–60% of their endowment out of social goodwill, but contributions steadily decay toward zero as conditional cooperators notice free-riders and reduce their own giving.";

                      } else if (selectedModuleId === 15) {
                        conceptBadge = "Anti-Coordination & Evolutionary Stability (ESS)";
                        predictionLabel = "Anti-Coordination Nash Equilibria";
                        predictionTitle = "Pure: (Hawk, Dove) & (Dove, Hawk) · Mixed: Randomize";
                        predictionExplanation = "Anti-coordination equilibria demand taking opposite actions: best response to Dove is Hawk (+6), but best response to Hawk is Dove (0 vs -10 crash). In symmetric play, players randomize Hawk with probability p = 23%.";
                        predictionPayoff = "Mutual Dove: +3 each · Hawk/Dove: (+6, 0) · Crash: -10 each";

                        const bothHawk = lastRoundResult.playerAction === 'Hawk' && lastRoundResult.botAction === 'Hawk';
                        const bothDove = lastRoundResult.playerAction === 'Dove' && lastRoundResult.botAction === 'Dove';

                        actualTitle = `You: ${lastRoundResult.playerAction} · ${activeBot.name}: ${lastRoundResult.botAction}`;
                        actualExplanation = bothHawk
                          ? "Catastrophic Collision! Both played aggressive Hawk and suffered -10 pts in mutual crash damage."
                          : bothDove
                          ? "Peaceful Sharing: Both played Dove, peacefully sharing the resource (+3 pts each)."
                          : lastRoundResult.playerAction === 'Hawk'
                          ? `You seized the territory (+6 pts) while ${activeBot.name} yielded as Dove (0 pts).`
                          : `${activeBot.name} aggressively claimed the territory (+6 pts) while you safely yielded as Dove (0 pts).`;
                        actualPayoff = `Your Payoff: ${lastRoundResult.playerPayoff >= 0 ? `+${lastRoundResult.playerPayoff}` : `${lastRoundResult.playerPayoff}`} pts · ${activeBot.name}: ${lastRoundResult.botPayoff >= 0 ? `+${lastRoundResult.botPayoff}` : `${lastRoundResult.botPayoff}`} pts`;
                        realPeopleSentence = "Real players often play Hawk too frequently hoping the other will blink, but repeated mutual Hawk collisions quickly teach players to alternate or establish convention-based ownership (bourgeois strategies).";

                      } else if (selectedModuleId === 16) {
                        conceptBadge = "Subgame Perfection vs. Negative Reciprocity";
                        predictionLabel = "Subgame Perfect Nash Equilibrium";
                        predictionTitle = "Minimum Positive Offer: Propose $1.00 (or $0.01)";
                        predictionExplanation = "Subgame perfection with self-interested agents predicts the Proposer offers the minimum positive amount ($1.00), and a rational Responder accepts since $1.00 is strictly better than $0.00.";
                        predictionPayoff = "SPNE Split: Proposer keeps $9.00 · Responder gets $1.00";

                        const offer = Number(lastRoundResult.playerAction);
                        const accepted = lastRoundResult.botAction === 'Accept';

                        actualTitle = `Offer: $${offer.toFixed(2)} of $10.00 · Result: ${accepted ? 'ACCEPTED' : 'REJECTED'}`;
                        actualExplanation = accepted
                          ? `${activeBot.name} accepted your $${offer.toFixed(2)} offer! You pocketed $${lastRoundResult.playerPayoff.toFixed(2)} and the bot received $${lastRoundResult.botPayoff.toFixed(2)}.`
                          : `${activeBot.name} rejected your $${offer.toFixed(2)} offer as unfair! The entire $10 pie was destroyed and both received $0.00.`;
                        actualPayoff = `Your Payoff: $${lastRoundResult.playerPayoff.toFixed(2)} · ${activeBot.name}: $${lastRoundResult.botPayoff.toFixed(2)} (${accepted ? 'Deal Finalized' : 'Both Walk Away Empty-Handed'})`;
                        realPeopleSentence = "In global experiments, real proposers typically offer 40–50% ($4–$5), and real responders reject offers below 20–30% ($2–$3) because strong negative reciprocity leads people to pay to punish perceived unfairness.";

                      } else if (selectedModuleId === 17) {
                        conceptBadge = "Zero-Sum Games & Minimax Mixed Strategy";
                        predictionLabel = "Minimax Mixed Strategy Nash Equilibrium";
                        predictionTitle = "50% Heads / 50% Tails (p = 0.50)";
                        predictionExplanation = "Because this is pure zero-sum conflict, no pure strategy Nash equilibrium exists. The unique minimax strategy requires randomizing 50/50 with zero predictability to avoid being exploited by an adaptive opponent.";
                        predictionPayoff = "Expected Payoff: +$1.00 (50% win probability) · Total Stake: $2.00";

                        const matched = lastRoundResult.playerAction === lastRoundResult.botAction;

                        actualTitle = `Your Coin: ${lastRoundResult.playerAction} · ${activeBot.name}: ${lastRoundResult.botAction}`;
                        actualExplanation = matched
                          ? `Match! Both played ${lastRoundResult.playerAction}. As the Matcher, you won the +$2.00 stake ($2 for you, $0 for bot).`
                          : `Mismatch! You played ${lastRoundResult.playerAction} while ${activeBot.name} played ${lastRoundResult.botAction}. The bot won the +$2.00 stake ($0 for you, $2 for bot).`;
                        actualPayoff = `Your Round Payoff: +${lastRoundResult.playerPayoff} pts · ${activeBot.name}: +${lastRoundResult.botPayoff} pts`;
                        realPeopleSentence = "Real people struggle with true randomness, often falling into negative recency (the gambler's fallacy—switching after a streak) or predictable alternating patterns that adaptive opponents quickly exploit.";

                      } else if (selectedModuleId === 18) {
                        conceptBadge = "Coordination with Conflicting Preferences";
                        predictionLabel = "Pure & Mixed Nash Equilibria";
                        predictionTitle = "Pure: (Opera, Opera) & (Football, Football) · Mixed: 1.2 pts";
                        predictionExplanation = "Two asymmetric pure equilibria exist where both coordinate on one event. Under symmetric mixed strategies without communication, players randomize, causing 48% miscoordination and an expected payoff of only 1.2 pts.";
                        predictionPayoff = "Coordinated: (+3, +2) or (+2, +3) · Mixed Strategy EV: 1.2 pts";

                        const bothOpera = lastRoundResult.playerAction === 'Opera' && lastRoundResult.botAction === 'Opera';
                        const bothFootball = lastRoundResult.playerAction === 'Football' && lastRoundResult.botAction === 'Football';

                        actualTitle = `You: ${lastRoundResult.playerAction} · ${activeBot.name}: ${lastRoundResult.botAction}`;
                        actualExplanation = bothOpera
                          ? "Coordinated on Opera! You enjoyed your favorite (+3 pts) and the bot got +2 pts."
                          : bothFootball
                          ? "Coordinated on Football! You earned +2 pts and the bot enjoyed its favorite (+3 pts)."
                          : `Miscoordination! You chose ${lastRoundResult.playerAction} while ${activeBot.name} chose ${lastRoundResult.botAction}. Both get 0 pts!`;
                        actualPayoff = `Your Payoff: +${lastRoundResult.playerPayoff} pts · ${activeBot.name}: +${lastRoundResult.botPayoff} pts`;
                        realPeopleSentence = "In repeated play, real human pairs quickly converge on alternating between Opera and Football across rounds, achieving perfect 50/50 fairness and avoiding costly miscoordination.";

                      } else if (selectedModuleId === 19) {
                        conceptBadge = "Sequential Trust & Backward Induction";
                        predictionLabel = "Subgame Perfect Nash Equilibrium (SPNE)";
                        predictionTitle = "Zero Trust: Send $0.00 (Keep All 10 Pts)";
                        predictionExplanation = "By backward induction, a purely self-interested trustee will return $0. Anticipating this, a rational investor sends $0, leaving both players with only their starting endowments (10 pts total wealth).";
                        predictionPayoff = "SPNE: Investor keeps 10 pts · Trustee gets 0 pts";

                        const investment = Number(lastRoundResult.playerAction);
                        const returned = typeof lastRoundResult.botAction === 'number' ? lastRoundResult.botAction : 0;
                        const diffFromNash = Math.round((lastRoundResult.playerPayoff - 10) * 10) / 10;
                        const totalWealth = Math.round((lastRoundResult.playerPayoff + lastRoundResult.botPayoff) * 10) / 10;

                        actualTitle = `Sent: ${investment} pts (Tripled to ${investment * 3}) · Returned: ${returned} pts`;
                        actualExplanation = `You invested ${investment} pts, which multiplied to ${investment * 3} pts. ${activeBot.name} returned ${returned} pts. You finished with ${lastRoundResult.playerPayoff} pts (${diffFromNash >= 0 ? `+${diffFromNash} profit` : `${diffFromNash} loss`} vs keeping all 10) and ${activeBot.name} retained ${lastRoundResult.botPayoff} pts.`;
                        actualPayoff = `Your Capital: ${lastRoundResult.playerPayoff} pts · Trustee Capital: ${lastRoundResult.botPayoff} pts (Created ${totalWealth} pts of wealth)`;
                        realPeopleSentence = "Real investors routinely send about 50% ($5) of their endowment, and trustees reciprocate by returning slightly more than the initial transfer, demonstrating that social trust and warm-glow reciprocity drive real markets.";

                      } else if (selectedModuleId === 20) {
                        conceptBadge = "Node 1–6 Extensive Chain";
                        predictionLabel = "Backward Induction (SPNE)";
                        predictionTitle = "Take at Node 1 (2, 0)";
                        predictionExplanation = "Game theory predicts taking immediately at the very first node because rational fear of defection unspools backward from Node 6.";
                        predictionPayoff = "Total Surplus: 2 pts (You: 2 · Bot: 0)";

                        const spneSurplus = 2;
                        const surplusMultiplier = (totalSurplus / spneSurplus).toFixed(1);
                        const diffFromSpne = lastRoundResult.playerPayoff - 2;

                        actualTitle = centipedeExitNode && centipedeExitNode <= 6
                          ? `Ended at Node ${centipedeExitNode} (${centipedeExitAction || 'Take'})`
                          : 'Terminal Mutual Pass (+8, +8)';
                        actualExplanation = `You earned +${lastRoundResult.playerPayoff} pts (${diffFromSpne >= 0 ? `+${diffFromSpne} pts vs SPNE` : `${diffFromSpne} pts vs SPNE`}) and ${activeBot.name} earned +${lastRoundResult.botPayoff} pts.`;
                        actualPayoff = `Total Surplus: ${totalSurplus} pts (${Number(surplusMultiplier) > 1 ? `${surplusMultiplier}x SPNE surplus` : 'Matched SPNE'})`;
                        realPeopleSentence = "In laboratory experiments, real people routinely pass because reciprocal trust and altruism offer massive mutual gains, and players only risk losing a single point to give their partner the chance to double the pot.";
                      }

                      return (
                        <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-blue-800/60 shadow-xl space-y-3 sm:space-y-3.5 text-xs max-w-full overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-b border-slate-800/80 pb-2">
                            <span className="font-extrabold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                              <span>⚖️ Match Debrief: Theory vs. Actual Play</span>
                            </span>
                            <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wide self-start sm:self-auto">
                              {conceptBadge}
                            </span>
                          </div>

                          {/* Side-by-Side Comparison Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                            {/* Theoretical Prediction */}
                            <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-rose-900/50 space-y-2">
                              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                                <span>{predictionLabel}</span>
                                <span className="font-mono text-rose-300">Theory</span>
                              </div>
                              <div className="text-xs sm:text-sm font-black text-white font-mono break-words">
                                {predictionTitle}
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {predictionExplanation}
                              </p>
                              <div className="text-[11px] font-mono font-bold text-rose-300/90 pt-1.5 border-t border-slate-800 break-words">
                                {predictionPayoff}
                              </div>
                            </div>

                            {/* What Actually Happened */}
                            <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-emerald-900/50 space-y-2">
                              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Actual Match Result</span>
                                <span className="font-mono text-emerald-300">Played</span>
                              </div>
                              <div className="text-xs sm:text-sm font-black text-white font-mono break-words">
                                {actualTitle}
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {actualExplanation}
                              </p>
                              <div className="text-[11px] font-mono font-bold text-emerald-300/90 pt-1.5 border-t border-slate-800 break-words">
                                {actualPayoff}
                              </div>
                            </div>
                          </div>

                          {/* What Real People Tend to Do & Why */}
                          <div className="p-3 sm:p-3.5 rounded-xl bg-blue-950/60 border border-blue-700/60 text-slate-200 text-xs sm:text-sm leading-relaxed">
                            <strong className="text-amber-300 font-bold block sm:inline mb-1 sm:mb-0">What Real People Tend to Do & Why: </strong>
                            <span>{realPeopleSentence}</span>
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
