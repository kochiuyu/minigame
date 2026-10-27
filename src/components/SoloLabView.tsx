import React, { useState } from 'react';
import { GameConfig } from '../types';
import {
  RoundHistoryEntry,
  GameSpecificBot,
  getBotsForGame
} from '../services/botEngine';
import { TheoryDebrief, DebriefData } from './TheoryDebrief';
import { InteractiveMatrixVisualizer } from './InteractiveMatrixVisualizer';
import { drawValuation } from '../utils/auctionEngine';

interface SoloLabViewProps {
  allGames: GameConfig[];
  onOpenWhatIfSandbox: (gameId: number) => void;
  onSwitchToLiveClass: () => void;
}

export const SoloLabView: React.FC<SoloLabViewProps> = ({
  allGames: _allGames,
  onOpenWhatIfSandbox,
  onSwitchToLiveClass
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
    }
  ];

  const [selectedModuleId, setSelectedModuleId] = useState<number>(6);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 5;

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
    setCurrentRound(prev => prev + 1);
  };

  const isExperimentFinished = currentRound > totalRounds;

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
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
              🧪
            </span>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Solo Lab Simulation Suite
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test game-theoretic strategies against standard bot archetypes with instant mathematical debriefs
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenWhatIfSandbox(selectedModuleId)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-300 bg-blue-950/60 border border-blue-800/80 hover:bg-blue-900/60 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>∫ What-If Sandbox</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToLiveClass}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>👥 Switch to Live Classroom</span>
          </button>
        </div>
      </div>

      {/* Module Selector Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {availableModules.map(mod => {
          const isSelected = mod.id === selectedModuleId;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => resetExperiment(undefined, mod.id)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/80 text-white shadow-lg ring-1 ring-blue-500/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{mod.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{mod.shortTitle}</div>
                  <div className="text-[10px] text-slate-400 truncate">{mod.category}</div>
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
        <TheoryDebrief
          data={debriefData}
          availableBots={activeGameBots}
          onOpenWhatIfSandbox={onOpenWhatIfSandbox}
          onRestartExperiment={() => resetExperiment()}
          onChangeBot={(newBotId) => resetExperiment(newBotId)}
        />
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
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer flex items-center gap-2.5 ${
                          active
                            ? `${b.badgeBg} ${b.badgeBorder} border-2 text-white font-bold ring-1 ring-blue-500/30`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl shrink-0">{b.avatar}</span>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-white text-xs">{b.name}</div>
                          <div className={`text-[10px] truncate ${b.color}`}>{b.title}</div>
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
                <span className="font-mono text-blue-400">Round {currentRound} of {totalRounds}</span>
              </div>

              {selectedModuleId === 6 && (
                <div className="space-y-2 text-slate-300">
                  <p>In the Prisoner's Dilemma, both choose simultaneously without communication:</p>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-emerald-400 font-bold">Mutual Coop</div>
                      <div className="text-slate-300 mt-0.5">$2 for you, $2 for Bot</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-rose-400 font-bold">Mutual Defect</div>
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
                </div>
              )}

              {selectedModuleId === 13 && (
                <div className="space-y-2 text-slate-300">
                  <p>In the Stag Hunt (Coordination Game):</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li><strong className="text-emerald-400">Hunt Stag</strong>: Requires mutual coordination. If both hunt, both get <strong className="text-white">+10 pts</strong>! If you hunt alone, you get <strong className="text-rose-400">0 pts</strong>.</li>
                    <li><strong className="text-amber-400">Hunt Hare</strong>: Risk-free solo action. You get <strong className="text-white">+4 pts</strong> guaranteed regardless of partner.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Two Nash Equilibria: (Stag, Stag) is Payoff Dominant; (Hare, Hare) is Risk Dominant.
                  </div>
                </div>
              )}

              {selectedModuleId === 14 && (
                <div className="space-y-2 text-slate-300">
                  <p>In Bertrand Duopoly Price Competition:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Set price between $10 and $50 (Marginal Cost $MC = \$10$). Market Demand $Q = 100 - P$.</li>
                    <li>Firm with <strong className="text-emerald-400">strictly lower price</strong> captures 100% of market demand!</li>
                    <li>Tied prices split demand 50/50. Higher price sells 0 units.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Monopoly price is $40 (max profit). Can you sustain high prices without undercutting?
                  </div>
                </div>
              )}

              {selectedModuleId === 7 && (
                <div className="space-y-2 text-slate-300">
                  <p>In a Second-Price Vickrey Auction:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Highest bidder wins the item.</li>
                    <li>Winner pays the <strong className="text-white">second-highest bid</strong>, NOT their own bid!</li>
                    <li>Profit = True Valuation - Second Highest Bid.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Your Assigned Private Valuation: <strong className="text-emerald-400 text-sm">${studentValuation}.00</strong>
                  </div>
                </div>
              )}

              {selectedModuleId === 11 && (
                <div className="space-y-2 text-slate-300">
                  <p>Keynesian Beauty Contest Rules:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Submit a number between 0 and 100.</li>
                    <li>Target is exactly <strong className="text-amber-300">2/3 of the average</strong> of both choices.</li>
                    <li>Whoever is closest to the target wins 10 points. Ties split 5-5.</li>
                  </ul>
                </div>
              )}

              {selectedModuleId === 12 && (
                <div className="space-y-2 text-slate-300">
                  <p>Public Goods Dilemma Rules:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Each player starts with 20 tokens.</li>
                    <li>Tokens kept return $1.00 each privately.</li>
                    <li>Tokens placed in public pool are multiplied by 1.6 and divided equally ($0.80 per player).</li>
                  </ul>
                </div>
              )}

              {selectedModuleId === 15 && (
                <div className="space-y-2 text-slate-300">
                  <p>Hawk-Dove Brinkmanship Rules (Chicken):</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li><strong className="text-emerald-400">Dove (Swerve)</strong>: Peaceful sharing. If both play Dove, split resource (<strong className="text-white">+3 pts each</strong>).</li>
                    <li><strong className="text-rose-400">Hawk (Straight)</strong>: Aggressive fight. If you Hawk and rival Doves, you seize all (<strong className="text-emerald-400">+6 pts</strong>, rival gets 0).</li>
                    <li><strong className="text-red-500 font-bold">Catastrophe</strong>: If both play Hawk, mutual crash causes devastating loss (<strong className="text-rose-400">-10 pts each</strong>)!</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Pure Nash: (Hawk, Dove) & (Dove, Hawk). Mixed ESS: Play Hawk ~23% of the time.
                  </div>
                </div>
              )}

              {selectedModuleId === 16 && (
                <div className="space-y-2 text-slate-300">
                  <p>Ultimatum Bargaining Rules ($10 Stake):</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>You have a <strong className="text-white">$10.00 prize</strong> to split with the Bot.</li>
                    <li>Choose an offer between $0.00 and $10.00 to propose to the Bot.</li>
                    <li>If the Bot <strong className="text-emerald-400">Accepts</strong>: You keep ($10 - Offer), Bot receives Offer.</li>
                    <li>If the Bot <strong className="text-rose-400">Rejects</strong>: Both receive <strong className="text-white">$0.00</strong> (deal collapsed).</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Homo Economicus accepts $1.00; real humans reject offers under $3.00 out of spiteful fairness.
                  </div>
                </div>
              )}

              {selectedModuleId === 17 && (
                <div className="space-y-2 text-slate-300">
                  <p>Matching Pennies Rules (Zero-Sum):</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>You are the <strong className="text-emerald-400">Matcher</strong>: You win <strong className="text-white">+2 pts</strong> if both coins match (Heads-Heads or Tails-Tails).</li>
                    <li>The Bot is the <strong className="text-amber-400">Mismatcher</strong>: The Bot wins <strong className="text-white">+2 pts</strong> if coins differ.</li>
                    <li>Zero pure-strategy Nash equilibria exist! If you are predictable, the bot will exploit you.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Unique Minimax Equilibrium: Randomize Heads and Tails with exact 50/50 probability (p = 0.5).
                  </div>
                </div>
              )}

              {selectedModuleId === 18 && (
                <div className="space-y-2 text-slate-300">
                  <p>Battle of the Sexes Rules (Coordination):</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Both players want to coordinate, but have conflicting top preferences:</li>
                    <li><strong className="text-purple-400">Opera</strong>: Your favorite (+3 pts for you, +2 pts for Bot if coordinated).</li>
                    <li><strong className="text-amber-400">Football</strong>: Bot's favorite (+2 pts for you, +3 pts for Bot if coordinated).</li>
                    <li><strong className="text-rose-400">Miscoordination</strong>: If you choose different events, both get <strong className="text-white">0 pts</strong>!</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Two pure Nash equilibria: (Opera, Opera) and (Football, Football). Alternating turns achieves fair balance.
                  </div>
                </div>
              )}

              {selectedModuleId === 19 && (
                <div className="space-y-2 text-slate-300">
                  <p>The Trust Game Rules (Investment):</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>You receive an endowment of <strong className="text-white">10 points</strong>.</li>
                    <li>Choose how many points ($X \in [0, 10]$) to send to the Trustee Bot.</li>
                    <li>The sent investment is <strong className="text-emerald-400">tripled (3x)</strong> upon receipt ($3X$).</li>
                    <li>The Trustee decides how much ($Y$) to return to you. Your payoff = $(10 - X) + Y$.</li>
                  </ul>
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 font-mono text-center text-xs">
                    Selfish backward induction predicts $X = 0$. Can mutual trust and reciprocity create 30 pts of wealth?
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Decision Console & Round Execution */}
          <div className="lg:col-span-7 space-y-4">
            {/* Interactive Decision Console */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    Action Console · Round {currentRound} of {totalRounds}
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    Submit Your Round Decision
                  </h3>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalRounds }).map((_, idx) => {
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
                  })}
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
                    onSelectAction={(action) => {
                      if (selectedModuleId === 6) setPdChoice(action);
                      if (selectedModuleId === 13) setStagChoice(action);
                      if (selectedModuleId === 15) setHawkChoice(action);
                      if (selectedModuleId === 17) setPenniesChoice(action);
                      if (selectedModuleId === 18) setBattleChoice(action);
                    }}
                  />

                  {/* Module 6: Prisoner's Dilemma */}
                  {selectedModuleId === 6 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-300">Choose your move:</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPdChoice('Cooperate')}
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
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

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitRound}
                    className="w-full py-3 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>Confirm Round {currentRound} Decision</span>
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

                    {/* Next Action */}
                    <button
                      type="button"
                      onClick={handleNextRound}
                      className="w-full py-3 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{currentRound >= totalRounds ? 'Finish & Open Theory Debrief' : `Proceed to Round ${currentRound + 1}`}</span>
                      <span>→</span>
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Live Scoreboard History Table */}
            {history.length > 0 && (
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Experiment Match History</span>
                  <div className="font-mono font-bold text-xs">
                    <span className="text-emerald-400">You: {playerTotalScore}</span>
                    <span className="text-slate-500 mx-2">vs</span>
                    <span className={activeBot.color}>{activeBot.name}: {botTotalScore}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2 rounded-l-lg">Rnd</th>
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
