import React, { useState } from 'react';
import { GameConfig } from '../types';
import { WhatIfMissionBanner, WhatIfMathProofExpander } from './sandbox/GamePedagogyCard';
import { evaluateGameVerdict, MissionVerdict } from './sandbox/missionEngine';
import { getCurriculumNumber } from '../data/curriculumOrder';
import { PhaseSpace2DVisualizer } from './sandbox/visualizers/PhaseSpace2DVisualizer';
import { AuctionSurplusVisualizer } from './sandbox/visualizers/AuctionSurplusVisualizer';
import { CommonsResourceVisualizer } from './sandbox/visualizers/CommonsResourceVisualizer';
import { ReactionFunctionVisualizer } from './sandbox/visualizers/ReactionFunctionVisualizer';
import { TerritoryStripVisualizer } from './sandbox/visualizers/TerritoryStripVisualizer';

interface WhatIfSandboxProps {
  game: GameConfig;
  initialValuation?: number;
  initialBid?: number;
  onApplyScenario?: (values: Record<string, number | string>) => void;
}

// 2x2 Matrix Payoff state interface
interface Matrix2x2State {
  r1Label: string;
  r2Label: string;
  c1Label: string;
  c2Label: string;
  // Player 1 (Row) payoffs: [R1C1, R1C2, R2C1, R2C2]
  a11: number;
  a12: number;
  a21: number;
  a22: number;
  // Player 2 (Col) payoffs: [R1C1, R1C2, R2C1, R2C2]
  b11: number;
  b12: number;
  b21: number;
  b22: number;
}

// Default presets for classic 2x2 games
const PRESETS: Record<string, Matrix2x2State> = {
  pd: {
    r1Label: 'Cooperate',
    r2Label: 'Defect',
    c1Label: 'Cooperate',
    c2Label: 'Defect',
    a11: 3, a12: 0, a21: 5, a22: 1,
    b11: 3, b12: 5, b21: 0, b22: 1
  },
  stag: {
    r1Label: 'Hunt Stag',
    r2Label: 'Hunt Hare',
    c1Label: 'Hunt Stag',
    c2Label: 'Hunt Hare',
    a11: 10, a12: 0, a21: 4, a22: 4,
    b11: 10, b12: 4, b21: 0, b22: 4
  },
  hawk: {
    r1Label: 'Hawk',
    r2Label: 'Dove',
    c1Label: 'Hawk',
    c2Label: 'Dove',
    a11: -10, a12: 6, a21: 0, a22: 3,
    b11: -10, b12: 0, b21: 6, b22: 3
  },
  battle: {
    r1Label: 'Opera',
    r2Label: 'Football',
    c1Label: 'Opera',
    c2Label: 'Football',
    a11: 3, a12: 0, a21: 0, a22: 2,
    b11: 2, b12: 0, b21: 0, b22: 3
  },
  pennies: {
    r1Label: 'Heads',
    r2Label: 'Tails',
    c1Label: 'Heads',
    c2Label: 'Tails',
    a11: 2, a12: 0, a21: 0, a22: 2,
    b11: 0, b12: 2, b21: 2, b22: 0
  },
  price2x2: {
    r1Label: 'High Price',
    r2Label: 'Low Price',
    c1Label: 'High Price',
    c2Label: 'Low Price',
    a11: 2, a12: 0, a21: 3, a22: 1,
    b11: 2, b12: 3, b21: 0, b22: 1
  }
};

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({
  game,
  initialValuation = 7,
  initialBid = 7,
  onApplyScenario: _onApplyScenario
}) => {
  // Check if this game is inherently a 2x2 normal-form matrix game or the dedicated general tool
  const isMatrixGame = [1, 3, 13, 15, 17, 18, 999].includes(game.id);

  // Active Sandbox Tab: 'game_simulator' (game-specific model) vs 'matrix_solver' (2x2 solver)
  // For game 999, open the matrix solver directly; for all individual games, open their dedicated simulation
  const [activeTab, setActiveTab] = useState<'matrix_solver' | 'game_simulator'>(
    game.id === 999 ? 'matrix_solver' : 'game_simulator'
  );

  // Initial matrix configuration based on game
  const getInitialMatrix = (): Matrix2x2State => {
    switch (game.id) {
      case 13: return PRESETS.stag;
      case 15: return PRESETS.hawk;
      case 18: return PRESETS.battle;
      case 17: return PRESETS.pennies;
      case 3: return PRESETS.price2x2;
      default: return PRESETS.pd;
    }
  };

  const [matrix, setMatrix] = useState<Matrix2x2State>(getInitialMatrix());

  // -------------------------------------------------------------
  // REAL-TIME NASH EQUILIBRIUM SOLVER (2x2 Matrix)
  // -------------------------------------------------------------
  // Best response for Player 1:
  // If Col plays C1: best is R1 if a11 > a21, R2 if a21 > a11, both if equal
  const p1_best_vs_c1 = matrix.a11 > matrix.a21 ? [true, false] : matrix.a21 > matrix.a11 ? [false, true] : [true, true];
  // If Col plays C2: best is R1 if a12 > a22, R2 if a22 > a12, both if equal
  const p1_best_vs_c2 = matrix.a12 > matrix.a22 ? [true, false] : matrix.a22 > matrix.a12 ? [false, true] : [true, true];

  // Best response for Player 2:
  // If Row plays R1: best is C1 if b11 > b12, C2 if b12 > b11, both if equal
  const p2_best_vs_r1 = matrix.b11 > matrix.b12 ? [true, false] : matrix.b12 > matrix.b11 ? [false, true] : [true, true];
  // If Row plays R2: best is C1 if b21 > b22, C2 if b22 > b21, both if equal
  const p2_best_vs_r2 = matrix.b21 > matrix.b22 ? [true, false] : matrix.b22 > matrix.b21 ? [false, true] : [true, true];

  // Pure Strategy Nash Equilibria: Cells where both players are simultaneously playing best responses
  const pureNE = {
    r1c1: p1_best_vs_c1[0] && p2_best_vs_r1[0],
    r1c2: p1_best_vs_c2[0] && p2_best_vs_r1[1],
    r2c1: p1_best_vs_c1[1] && p2_best_vs_r2[0],
    r2c2: p1_best_vs_c2[1] && p2_best_vs_r2[1]
  };

  const pureCount = [pureNE.r1c1, pureNE.r1c2, pureNE.r2c1, pureNE.r2c2].filter(Boolean).length;

  // Mixed Strategy Nash Equilibrium:
  // P1 chooses p = Prob(R1) to make P2 indifferent between C1 and C2:
  // E_P2(C1) = p * b11 + (1-p) * b21
  // E_P2(C2) = p * b12 + (1-p) * b22
  // => p * (b11 - b21 - b12 + b22) = b22 - b21
  // => p* = (b22 - b21) / ((b11 - b12) + (b22 - b21))
  const denomP = (matrix.b11 - matrix.b12) + (matrix.b22 - matrix.b21);
  const numerP = matrix.b22 - matrix.b21;
  const pStarRaw = denomP !== 0 ? numerP / denomP : -1;
  const hasValidMixedP = pStarRaw > 0 && pStarRaw < 1;

  // P2 chooses q = Prob(C1) to make P1 indifferent between R1 and R2:
  // E_P1(R1) = q * a11 + (1-q) * a12
  // E_P1(R2) = q * a21 + (1-q) * a22
  // => q * (a11 - a12 - a21 + a22) = a22 - a12
  // => q* = (a22 - a12) / ((a11 - a21) + (a22 - a12))
  const denomQ = (matrix.a11 - matrix.a21) + (matrix.a22 - matrix.a12);
  const numerQ = matrix.a22 - matrix.a12;
  const qStarRaw = denomQ !== 0 ? numerQ / denomQ : -1;
  const hasValidMixedQ = qStarRaw > 0 && qStarRaw < 1;

  const hasMixedNE = hasValidMixedP && hasValidMixedQ;
  const pStar = hasMixedNE ? Math.round(pStarRaw * 100) / 100 : 0;
  const qStar = hasMixedNE ? Math.round(qStarRaw * 100) / 100 : 0;

  // Expected payoffs in Mixed NE
  const expPayoffP1InMixed = hasMixedNE
    ? Math.round((qStar * matrix.a11 + (1 - qStar) * matrix.a12) * 100) / 100
    : 0;
  const expPayoffP2InMixed = hasMixedNE
    ? Math.round((pStar * matrix.b11 + (1 - pStar) * matrix.b21) * 100) / 100
    : 0;

  // -------------------------------------------------------------
  // CONTINUOUS & SPECIALIZED GAME SIMULATION STATES
  // -------------------------------------------------------------
  // Auctions (7, 8)
  const [val, setVal] = useState<number>(initialValuation);
  const [myBid, setMyBid] = useState<number>(initialBid);
  const [competitorBid, setCompetitorBid] = useState<number>(6);

  // Beauty Contest (11)
  const [beautyGuess, setBeautyGuess] = useState<number>(33);
  const [assumedClassAvg, setAssumedClassAvg] = useState<number>(45);

  // Public Goods / Commons (12 & 27)
  const [myContr, setMyContr] = useState<number>(5);
  const [peerAvgContr, setPeerAvgContr] = useState<number>(4);
  const [publicMultiplier, setPublicMultiplier] = useState<number>(1.6);

  // Repeated PD & Discount Factor delta (6)
  const [discountDelta, setDiscountDelta] = useState<number>(0.75);

  // Centipede (20)
  const [centipedePassProb, setCentipedePassProb] = useState<number>(65);

  // Cournot Duopoly (21)
  const [cournotQ1, setCournotQ1] = useState<number>(30);
  const [cournotQ2, setCournotQ2] = useState<number>(30);
  const [cournotCost, setCournotCost] = useState<number>(10);
  const [cournotDemandA, setCournotDemandA] = useState<number>(100);

  // Hotelling Beach (22)
  const [hotellingX1, setHotellingX1] = useState<number>(40);
  const [hotellingX2, setHotellingX2] = useState<number>(60);

  // Colonel Blotto (23)
  const [blottoA, setBlottoA] = useState<number>(34);
  const [blottoB, setBlottoB] = useState<number>(33);
  const [blottoC, setBlottoC] = useState<number>(33);
  const [botBlottoA] = useState<number>(50);
  const [botBlottoB] = useState<number>(50);
  const [botBlottoC] = useState<number>(0);

  // Common-Value Oil Lease (24)
  const [cvTrueV, setCvTrueV] = useState<number>(50);
  const [cvPlayerSignal, setCvPlayerSignal] = useState<number>(55);
  const [cvMyBid, setCvMyBid] = useState<number>(52);
  const [cvRivalBid, setCvRivalBid] = useState<number>(48);

  // Dollar Auction (25)
  const [dollarP1Bid, setDollarP1Bid] = useState<number>(0.80);
  const [dollarP2Bid, setDollarP2Bid] = useState<number>(0.90);

  // Traveler's Dilemma (26)
  const [travelerClaim1, setTravelerClaim1] = useState<number>(98);
  const [travelerClaim2, setTravelerClaim2] = useState<number>(100);
  const [travelerRewardR, setTravelerRewardR] = useState<number>(2);

  // Fishery Commons Renewable Stock (27)
  const [fisheryEffortP1, setFisheryEffortP1] = useState<number>(4);
  const [fisheryEffortP2, setFisheryEffortP2] = useState<number>(4);
  const [carryingCapacity] = useState<number>(100);

  // Lemons Market (28)
  const [lemonBuyerPrice, setLemonBuyerPrice] = useState<number>(5000);

  // Prisoner's Dilemma Temptation & Payoffs (1)
  const [pdTemptation, setPdTemptation] = useState<number>(3);
  const [pdReward, setPdReward] = useState<number>(2);
  const [pdPunishment, setPdPunishment] = useState<number>(1);
  const [pdSucker, setPdSucker] = useState<number>(0);

  // Sequential Entry & First Mover Advantage (2)
  const [seqMarketVal, setSeqMarketVal] = useState<number>(4);
  const [seqDuopolyVal, setSeqDuopolyVal] = useState<number>(2);
  const [seqCostToEnter, setSeqCostToEnter] = useState<number>(1);
  const [seqFirstMoveChoice, setSeqFirstMoveChoice] = useState<'Launch' | 'Wait'>('Launch');

  // Simultaneous Price Competition & Price Matching Guarantee (3)
  const [bertrand2x2LowMargin, setBertrand2x2LowMargin] = useState<number>(1);
  const [bertrand2x2HighMargin, setBertrand2x2HighMargin] = useState<number>(2);
  const [hasPriceMatchPolicy, setHasPriceMatchPolicy] = useState<boolean>(false);

  // Promotion Timing 3x3 (4)
  const [promoMyDay, setPromoMyDay] = useState<'Monday' | 'Wednesday' | 'Friday'>('Monday');
  const [promoFriShare, setPromoFriShare] = useState<number>(50);

  // Entry Deterrence Strategic Commitment (5)
  const [deterCapacityInvested, setDeterCapacityInvested] = useState<boolean>(true);
  const [deterCapacityCost, setDeterCapacityCost] = useState<number>(1.5);

  // Split-the-Pie Generalized Nash Bargaining (9)
  const [pieTotalAmount, setPieTotalAmount] = useState<number>(10);
  const [pieP1ThreatPoint, setPieP1ThreatPoint] = useState<number>(1);
  const [pieP2ThreatPoint, setPieP2ThreatPoint] = useState<number>(1);
  const [pieP1Power, setPieP1Power] = useState<number>(0.5);

  // Costly Signaling (10)
  const [signalCostHigh, setSignalCostHigh] = useState<number>(2);
  const [signalCostLow, setSignalCostLow] = useState<number>(6);
  const [signalWageHigh, setSignalWageHigh] = useState<number>(8);
  const [signalWageLow, setSignalWageLow] = useState<number>(3);

  // Stag Hunt Risk Dominance (13)
  const [stagRewardS, setStagRewardS] = useState<number>(10);
  const [hareRewardH, setHareRewardH] = useState<number>(4);
  const [partnerStagProb, setPartnerStagProb] = useState<number>(50);

  // Continuous Bertrand Duopoly (14)
  const [bertrandP1, setBertrandP1] = useState<number>(35);
  const [bertrandP2, setBertrandP2] = useState<number>(35);
  const [bertrandMC, setBertrandMC] = useState<number>(10);

  // Hawk-Dove Brinkmanship (15)
  const [hdResourceVal, setHdResourceVal] = useState<number>(6);
  const [hdInjuryCost, setHdInjuryCost] = useState<number>(20);

  // Ultimatum Inequity Aversion & MAO (16)
  const [ultimatumPropose, setUltimatumPropose] = useState<number>(4);
  const [ultimatumMAO, setUltimatumMAO] = useState<number>(3);

  // Matching Pennies Asymmetric Payoffs (17)
  const [penniesMatchH, setPenniesMatchH] = useState<number>(3);
  const [penniesMatchT, setPenniesMatchT] = useState<number>(1);

  // Battle of the Sexes Coordination (18)
  const [battleOperaA, setBattleOperaA] = useState<number>(3);
  const [battleFootballB, setBattleFootballB] = useState<number>(3);

  // The Trust Game (19)
  const [trustSentAmt, setTrustSentAmt] = useState<number>(5);
  const [trustMultFactor, setTrustMultFactor] = useState<number>(3);
  const [trusteeReturnRate, setTrusteeReturnRate] = useState<number>(40);

  // Reset all sandbox values to their initial defaults
  const handleResetToDefaults = () => {
    // Reset 2x2 matrix
    setMatrix(getInitialMatrix());
    // Reset individual game sliders
    setVal(initialValuation);
    setMyBid(initialBid);
    setCompetitorBid(6);
    setBeautyGuess(33);
    setAssumedClassAvg(45);
    setMyContr(5);
    setPeerAvgContr(4);
    setPublicMultiplier(1.6);
    setDiscountDelta(0.75);
    setCentipedePassProb(65);
    setCournotQ1(30);
    setCournotQ2(30);
    setCournotCost(10);
    setCournotDemandA(100);
    setHotellingX1(40);
    setHotellingX2(60);
    setBlottoA(34);
    setBlottoB(33);
    setBlottoC(33);
    setCvTrueV(50);
    setCvPlayerSignal(55);
    setCvMyBid(52);
    setCvRivalBid(48);
    setDollarP1Bid(0.80);
    setDollarP2Bid(0.90);
    setTravelerClaim1(98);
    setTravelerClaim2(100);
    setTravelerRewardR(2);
    setFisheryEffortP1(4);
    setFisheryEffortP2(4);
    setLemonBuyerPrice(5000);
    setPdTemptation(3);
    setPdReward(2);
    setPdPunishment(1);
    setPdSucker(0);
    setSeqMarketVal(4);
    setSeqDuopolyVal(2);
    setSeqCostToEnter(1);
    setSeqFirstMoveChoice('Launch');
    setBertrand2x2LowMargin(1);
    setBertrand2x2HighMargin(2);
    setHasPriceMatchPolicy(false);
    setPromoMyDay('Monday');
    setPromoFriShare(50);
    setDeterCapacityInvested(true);
    setDeterCapacityCost(1.5);
    setPieTotalAmount(10);
    setPieP1ThreatPoint(1);
    setPieP2ThreatPoint(1);
    setPieP1Power(0.5);
    setSignalCostHigh(2);
    setSignalCostLow(6);
    setSignalWageHigh(8);
    setSignalWageLow(3);
    setStagRewardS(10);
    setHareRewardH(4);
    setPartnerStagProb(50);
    setBertrandP1(35);
    setBertrandP2(35);
    setBertrandMC(10);
    setHdResourceVal(6);
    setHdInjuryCost(20);
    setUltimatumPropose(4);
    setUltimatumMAO(3);
    setPenniesMatchH(3);
    setPenniesMatchT(1);
    setBattleOperaA(3);
    setBattleFootballB(3);
    setTrustSentAmt(5);
    setTrustMultFactor(3);
    setTrusteeReturnRate(40);
  };

  // Load a preset into the matrix editor
  const loadPreset = (key: string) => {
    if (PRESETS[key]) {
      setMatrix({ ...PRESETS[key] });
    }
  };

  // Real-time Dilemma Verdict & Mission Evaluation
  const getCurrentVerdict = (): MissionVerdict => {
    if (activeTab === 'matrix_solver') {
      const isCoopNash = (pureNE.r1c1 && matrix.a11 > matrix.a22) || (pureNE.r2c2 && matrix.a22 > matrix.a11);
      if (isCoopNash) {
        return {
          isSolved: true,
          statusText: "DILEMMA SOLVED",
          verdictHeadline: "Cooperative Cell is a Stable Nash Equilibrium",
          explanation: "Neither player has an incentive to deviate unilaterally from the high-payoff mutual outcome.",
          welfareChangeText: "Stable Mutual Equilibrium",
          isParetoOptimal: true
        };
      } else if (pureCount > 0) {
        return {
          isSolved: false,
          statusText: "NASH FOUND (TRAP ACTIVE)",
          verdictHeadline: `${pureCount} Pure Strategy Nash Equilibrium Found`,
          explanation: "Best responses intersect at stable cell(s). Adjust payoffs to see if higher mutual welfare can become stable."
        };
      } else if (hasMixedNE) {
        return {
          isSolved: false,
          statusText: "MIXED STRATEGY EQUILIBRIUM",
          verdictHeadline: `Mixed Equilibrium: P1 plays R1 at ${(pStar * 100).toFixed(0)}%, P2 plays C1 at ${(qStar * 100).toFixed(0)}%`,
          explanation: "No single pure cell is stable; players must randomize to keep rivals indifferent."
        };
      } else {
        return {
          isSolved: false,
          statusText: "CYCLICAL UNSTABLE",
          verdictHeadline: "No Stable Equilibrium Found",
          explanation: "Best response cycle loops endlessly without a fixed point."
        };
      }
    }

    return evaluateGameVerdict(game.id, {
      temptation: pdTemptation,
      reward: pdReward,
      punishment: pdPunishment,
      sucker: pdSucker,
      duopolyVal: seqDuopolyVal,
      costToEnter: seqCostToEnter,
      hasPriceMatchPolicy,
      delta: discountDelta,
      myBid,
      trueVal: val,
      competitorBid,
      myContr,
      multiplier: publicMultiplier,
      resourceVal: hdResourceVal,
      injuryCost: hdInjuryCost,
      propose: ultimatumPropose,
      mao: ultimatumMAO,
      cvMyBid,
      cvTrueV,
      cvRivalBid,
      effortP1: fisheryEffortP1,
      effortP2: fisheryEffortP2,
      buyerPrice: lemonBuyerPrice
    });
  };

  const currentVerdict = getCurrentVerdict();

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4 font-sans text-xs">
      {/* Active Game Context & Tool Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 shrink-0">
            {game.icon || '🎯'}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
                {game.id === 999 ? 'Custom Tool' : `Game ${getCurriculumNumber(game.id)}`}
              </span>
              <h3 className="font-bold text-sm text-white tracking-tight">
                {game.title}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-xl">
              {game.purpose || game.keyTakeaway}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Tab Switcher - Only displayed for games where 2x2 matrix analysis is actually relevant */}
          {isMatrixGame && game.id !== 999 && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('game_simulator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'game_simulator'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>📈</span>
                <span>Simulation Model</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('matrix_solver')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'matrix_solver'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>⚖️</span>
                <span>Custom 2×2 Sandbox</span>
              </button>
            </div>
          )}

          {/* Reset to Default Button */}
          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Reset all slider values and parameters to their starting positions"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span className="text-sm">↺</span>
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      {/* Prominent Guiding Question, Challenge Mission & Live Dilemma Verdict */}
      <WhatIfMissionBanner
        gameId={game.id}
        gameTitle={game.title}
        gameCategory={game.category}
        verdict={currentVerdict}
      />

      {/* ========================================================================= */}
      {/* TAB 1: UNIVERSAL 2X2 PAYOFF MATRIX SLIDER & REAL-TIME NASH SOLVER */}
      {/* ========================================================================= */}
      {activeTab === 'matrix_solver' && (
        <div className="space-y-4">
          {/* Preset Buttons: only show cross-game archetypes if in the general Custom Tool (999). For specific games, show current game baseline reset. */}
          {game.id === 999 ? (
            <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Canonical 2×2 Archetypes:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'pd', label: "Prisoner's Dilemma" },
                  { key: 'stag', label: 'Stag Hunt' },
                  { key: 'hawk', label: 'Hawk-Dove' },
                  { key: 'battle', label: 'Battle of Sexes' },
                  { key: 'pennies', label: 'Matching Pennies' },
                  { key: 'price2x2', label: 'Price Duopoly' }
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => loadPreset(p.key)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 cursor-pointer transition-all active:scale-95"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-300">
                Matrix parameters for <strong className="text-white">{game.title}</strong>
              </span>
              <button
                type="button"
                onClick={() => setMatrix(getInitialMatrix())}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              >
                <span>↺</span>
                <span>Reset to {game.shortTitle || game.title} Baseline</span>
              </button>
            </div>
          )}

          {/* Interactive Payoff Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Live 2D Strategy Phase Map & Payoff Matrix */}
            <div className="space-y-3">
              <PhaseSpace2DVisualizer
                r1Label={matrix.r1Label}
                r2Label={matrix.r2Label}
                c1Label={matrix.c1Label}
                c2Label={matrix.c2Label}
                a11={matrix.a11} a12={matrix.a12} a21={matrix.a21} a22={matrix.a22}
                b11={matrix.b11} b12={matrix.b12} b21={matrix.b21} b22={matrix.b22}
              />

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Strategic Normal Form
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {pureCount > 0 ? `★ ${pureCount} Pure Nash Found` : 'No Pure Nash (Mixed Only)'}
                  </span>
                </div>

              {/* 2x2 Matrix Grid */}
              <div className="space-y-2">
                {/* Header Row: Player 2 Actions */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <div className="text-slate-500 font-mono text-[10px] self-end">P1 \ P2</div>
                  <div className="text-amber-400 bg-amber-950/30 py-1 rounded border border-amber-800/40 truncate">
                    {matrix.c1Label} (q)
                  </div>
                  <div className="text-amber-400 bg-amber-950/30 py-1 rounded border border-amber-800/40 truncate">
                    {matrix.c2Label} (1-q)
                  </div>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-blue-400 font-bold text-[11px] bg-blue-950/30 py-2 px-1 rounded border border-blue-800/40 flex items-center justify-center text-center">
                    {matrix.r1Label} (p)
                  </div>
                  {/* Cell R1, C1 */}
                  <div className={`p-2.5 rounded-xl border text-center transition-all ${
                    pureNE.r1c1
                      ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-950'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    {pureNE.r1c1 && (
                      <div className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                        <span>★</span><span>Nash Equilibrium</span>
                      </div>
                    )}
                    <div className="font-mono text-base font-black">
                      <span className="text-blue-400">{matrix.a11}</span>
                      <span className="text-slate-500 mx-1">,</span>
                      <span className="text-amber-400">{matrix.b11}</span>
                    </div>
                  </div>
                  {/* Cell R1, C2 */}
                  <div className={`p-2.5 rounded-xl border text-center transition-all ${
                    pureNE.r1c2
                      ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-950'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    {pureNE.r1c2 && (
                      <div className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                        <span>★</span><span>Nash Equilibrium</span>
                      </div>
                    )}
                    <div className="font-mono text-base font-black">
                      <span className="text-blue-400">{matrix.a12}</span>
                      <span className="text-slate-500 mx-1">,</span>
                      <span className="text-amber-400">{matrix.b12}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-blue-400 font-bold text-[11px] bg-blue-950/30 py-2 px-1 rounded border border-blue-800/40 flex items-center justify-center text-center">
                    {matrix.r2Label} (1-p)
                  </div>
                  {/* Cell R2, C1 */}
                  <div className={`p-2.5 rounded-xl border text-center transition-all ${
                    pureNE.r2c1
                      ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-950'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    {pureNE.r2c1 && (
                      <div className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                        <span>★</span><span>Nash Equilibrium</span>
                      </div>
                    )}
                    <div className="font-mono text-base font-black">
                      <span className="text-blue-400">{matrix.a21}</span>
                      <span className="text-slate-500 mx-1">,</span>
                      <span className="text-amber-400">{matrix.b21}</span>
                    </div>
                  </div>
                  {/* Cell R2, C2 */}
                  <div className={`p-2.5 rounded-xl border text-center transition-all ${
                    pureNE.r2c2
                      ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-950'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    {pureNE.r2c2 && (
                      <div className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                        <span>★</span><span>Nash Equilibrium</span>
                      </div>
                    )}
                    <div className="font-mono text-base font-black">
                      <span className="text-blue-400">{matrix.a22}</span>
                      <span className="text-slate-500 mx-1">,</span>
                      <span className="text-amber-400">{matrix.b22}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equilibrium Summary Callout */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Equilibrium Structure:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {pureCount === 1 ? 'Unique Pure Nash' : pureCount > 1 ? 'Multiple Pure Nash' : 'Mixed Strategy Only'}
                  </span>
                </div>
                <div className="text-slate-300 text-[10px] leading-relaxed">
                  {pureCount === 1 && 'Strict dominance or coordination resolves unambiguously to a single stable outcome where neither player can profitably deviate.'}
                  {pureCount > 1 && 'Coordination dilemma exists. Multiple stable pure equilibria require focal points, conventions, or pre-play communication to align.'}
                  {pureCount === 0 && 'Pure conflict / anti-coordination: no pure strategy pair is immune to mutual out-guessing. Players must randomize according to the mixed Nash probabilities below.'}
                </div>
              </div>
            </div>
            </div>

            {/* Payoff Sliders for Real-Time Sensitivity Analysis */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Payoff Sensitivity Sliders
                </span>
                <span className="text-[10px] text-slate-400">Drag to observe instant equilibrium shifts</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {/* Player 1 Payoffs */}
                <div className="space-y-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-blue-900/30">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider border-b border-blue-900/40 pb-1">
                    Player 1 Payoffs (Row)
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>R1 vs C1 (a11):</span>
                      <span className="font-mono font-bold text-blue-300">{matrix.a11}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.a11}
                      onChange={e => setMatrix(prev => ({ ...prev, a11: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>R1 vs C2 (a12):</span>
                      <span className="font-mono font-bold text-blue-300">{matrix.a12}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.a12}
                      onChange={e => setMatrix(prev => ({ ...prev, a12: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>R2 vs C1 (a21):</span>
                      <span className="font-mono font-bold text-blue-300">{matrix.a21}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.a21}
                      onChange={e => setMatrix(prev => ({ ...prev, a21: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>R2 vs C2 (a22):</span>
                      <span className="font-mono font-bold text-blue-300">{matrix.a22}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.a22}
                      onChange={e => setMatrix(prev => ({ ...prev, a22: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Player 2 Payoffs */}
                <div className="space-y-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-amber-900/30">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-amber-900/40 pb-1">
                    Player 2 Payoffs (Col)
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>C1 vs R1 (b11):</span>
                      <span className="font-mono font-bold text-amber-300">{matrix.b11}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.b11}
                      onChange={e => setMatrix(prev => ({ ...prev, b11: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>C2 vs R1 (b12):</span>
                      <span className="font-mono font-bold text-amber-300">{matrix.b12}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.b12}
                      onChange={e => setMatrix(prev => ({ ...prev, b12: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>C1 vs R2 (b21):</span>
                      <span className="font-mono font-bold text-amber-300">{matrix.b21}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.b21}
                      onChange={e => setMatrix(prev => ({ ...prev, b21: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span>C2 vs R2 (b22):</span>
                      <span className="font-mono font-bold text-amber-300">{matrix.b22}</span>
                    </div>
                    <input
                      type="range" min="-10" max="15" step="1"
                      value={matrix.b22}
                      onChange={e => setMatrix(prev => ({ ...prev, b22: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mixed Strategy Nash Derivation Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🎲</span>
                <span>Mixed Strategy Nash Equilibrium (MSNE) Analytical Solution</span>
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                hasMixedNE
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {hasMixedNE ? '✓ Valid Interior MSNE Exists' : 'No Interior MSNE in (0, 1)'}
              </span>
            </div>

            {hasMixedNE ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    Player 1 Mixing Probability: p* = Prob({matrix.r1Label})
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-white">{(pStar * 100).toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-400 font-mono">(p = {pStar.toFixed(2)})</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Set to make Player 2 indifferent between {matrix.c1Label} and {matrix.c2Label}.
                    <br />
                    Expected Payoff for Player 2: <strong className="text-amber-400 font-mono">{expPayoffP2InMixed} pts</strong>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Player 2 Mixing Probability: q* = Prob({matrix.c1Label})
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-white">{(qStar * 100).toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-400 font-mono">(q = {qStar.toFixed(2)})</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Set to make Player 1 indifferent between {matrix.r1Label} and {matrix.r2Label}.
                    <br />
                    Expected Payoff for Player 1: <strong className="text-blue-400 font-mono">{expPayoffP1InMixed} pts</strong>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                A valid mixed strategy requires interior probabilities $0 &lt; p^*, q^* &lt; 1$. With the current payoff values, strict dominance eliminates mixed randomization: one action strictly dominates, or pure coordination prevails without needing randomization.
              </p>
            )}
          </div>

          {/* Go deeper: Formal Analytical Proof */}
          <WhatIfMathProofExpander
            gameId={game.id}
            gameTitle={game.title}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SPECIALIZED GAME SIMULATORS (For continuous & dynamic models) */}
      {/* ========================================================================= */}
      {activeTab === 'game_simulator' && (
        <div className="space-y-4">

          {/* PRISONER'S DILEMMA (1) */}
          {game.id === 1 && (() => {
            const isStrictPD = pdTemptation > pdReward && pdReward > pdPunishment && pdPunishment > pdSucker && (2 * pdReward > pdTemptation + pdSucker);
            const cheatGainVsCoop = pdTemptation - pdReward;
            const cheatGainVsDefect = pdPunishment - pdSucker;
            const socialLoss = 2 * (pdReward - pdPunishment);
            const defectionDominates = pdTemptation >= pdReward && pdPunishment >= pdSucker;

            return (
              <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg">
                {/* Header & Purpose */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">
                        Prisoner's Dilemma: Payoff Anatomy & Dominance Engine
                      </h4>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isStrictPD
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                      }`}>
                        {isStrictPD ? '✓ Canonical Dilemma (T > R > P > S)' : '⚠️ Altered Game Structure'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Test why individual rationality leads to collective loss, and see what happens when payoffs change.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                      defectionDominates
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    }`}>
                      {defectionDominates ? 'Defect Strictly Dominates' : 'Cooperation Viable'}
                    </span>
                  </div>
                </div>

                {/* Scenario Presets Bar */}
                <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    Hypothetical Scenarios:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setPdTemptation(3);
                        setPdReward(2);
                        setPdPunishment(1);
                        setPdSucker(0);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Classic Dilemma (T=3, R=2, P=1, S=0)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPdTemptation(2);
                        setPdReward(3);
                        setPdPunishment(1);
                        setPdSucker(0);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Enforced Contracts (R &gt; T)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPdTemptation(4);
                        setPdReward(3);
                        setPdPunishment(0);
                        setPdSucker(1);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Stag Hunt Shift (S &gt; P)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPdTemptation(5);
                        setPdReward(2);
                        setPdPunishment(-2);
                        setPdSucker(-4);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Severe Retaliation
                    </button>
                  </div>
                </div>

                {/* Main Interactive Stage: 2D Strategy Phase Map + Payoff Sliders */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: 2D Strategy Phase Space + Matrix Grid */}
                  <div className="lg:col-span-6 space-y-3">
                    <PhaseSpace2DVisualizer
                      r1Label="Coop"
                      r2Label="Defect"
                      c1Label="Coop"
                      c2Label="Defect"
                      a11={pdReward} a12={pdSucker} a21={pdTemptation} a22={pdPunishment}
                      b11={pdReward} b12={pdTemptation} b21={pdSucker} b22={pdPunishment}
                    />

                    {/* Compact 2x2 Matrix Grid with Live Glow */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
                        <div className="p-1"></div>
                        <div className="p-1 text-[10px] text-amber-400 font-bold uppercase truncate">Partner: Coop</div>
                        <div className="p-1 text-[10px] text-amber-400 font-bold uppercase truncate">Partner: Defect</div>

                        {/* Row 1: Coop */}
                        <div className="p-1.5 text-[10px] text-blue-400 font-bold uppercase flex items-center justify-center">You: Coop</div>
                        <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                          !defectionDominates && pdReward >= pdTemptation ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg' : 'bg-slate-800/60 border-slate-700/80'
                        }`}>
                          <span className="font-bold text-white text-sm">
                            <strong className="text-blue-300">{pdReward}</strong>, <strong className="text-amber-300">{pdReward}</strong>
                          </span>
                          <span className="text-[9px] text-emerald-400 font-sans">Social Optimum</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/80 flex flex-col items-center justify-center">
                          <span className="font-bold text-white text-sm">
                            <strong className="text-blue-300">{pdSucker}</strong>, <strong className="text-amber-300">{pdTemptation}</strong>
                          </span>
                          <span className="text-[9px] text-slate-400 font-sans">Sucker</span>
                        </div>

                        {/* Row 2: Defect */}
                        <div className="p-1.5 text-[10px] text-blue-400 font-bold uppercase flex items-center justify-center">You: Defect</div>
                        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/80 flex flex-col items-center justify-center">
                          <span className="font-bold text-white text-sm">
                            <strong className="text-blue-300">{pdTemptation}</strong>, <strong className="text-amber-300">{pdSucker}</strong>
                          </span>
                          <span className="text-[9px] text-amber-400 font-sans">Temptation</span>
                        </div>
                        <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                          defectionDominates ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/60 shadow-lg' : 'bg-slate-800/60 border-slate-700/80'
                        }`}>
                          <span className="font-bold text-white text-sm">
                            <strong className="text-rose-300">{pdPunishment}</strong>, <strong className="text-rose-300">{pdPunishment}</strong>
                          </span>
                          <span className="text-[9px] text-rose-300 font-sans font-bold flex items-center gap-1">★ Nash</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Direct Scrubbing Sliders & Metric Chips */}
                  <div className="lg:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Direct Payoff Scrubbers
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Drag to mutate equilibrium</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Temptation (T) */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-amber-300">Temptation to Cheat (T):</span>
                          <span className="font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">{pdTemptation} pts</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1" value={pdTemptation}
                          onChange={e => setPdTemptation(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Reward (R) */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-emerald-300">Cooperation Reward (R):</span>
                          <span className="font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">{pdReward} pts</span>
                        </div>
                        <input
                          type="range" min="0" max="8" step="1" value={pdReward}
                          onChange={e => setPdReward(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Punishment (P) */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-rose-300">Mutual Betrayal Penalty (P):</span>
                          <span className="font-mono font-black text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">{pdPunishment} pts</span>
                        </div>
                        <input
                          type="range" min="-3" max="5" step="1" value={pdPunishment}
                          onChange={e => setPdPunishment(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                        />
                      </div>

                      {/* Sucker (S) */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-300">Sucker Loss (S):</span>
                          <span className="font-mono font-black text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{pdSucker} pts</span>
                        </div>
                        <input
                          type="range" min="-4" max="4" step="1" value={pdSucker}
                          onChange={e => setPdSucker(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-slate-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Glanceable Unboxed Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Temptation Gap</span>
                        <span className={`text-xs font-black ${cheatGainVsCoop > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {cheatGainVsCoop > 0 ? `+${cheatGainVsCoop}` : `${cheatGainVsCoop}`}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Defense Cushion</span>
                        <span className={`text-xs font-black ${cheatGainVsDefect > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                          {cheatGainVsDefect > 0 ? `+${cheatGainVsDefect}` : `${cheatGainVsDefect}`}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Welfare Cost</span>
                        <span className="text-xs font-black text-rose-400">
                          {socialLoss} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SEQUENTIAL ENTRY / FIRST-MOVER ADVANTAGE (2) */}
          {game.id === 2 && (() => {
            const smEnterPayoffLaunch = seqDuopolyVal - seqCostToEnter;
            const smEnterPayoffWait = seqMarketVal - seqCostToEnter;
            const smRespToLaunch = smEnterPayoffLaunch > 0 ? 'Enter' : 'Stay Out';
            const smRespToWait = smEnterPayoffWait > 0 ? 'Enter' : 'Stay Out';

            const fmPayoffIfLaunch = smRespToLaunch === 'Enter' ? seqDuopolyVal : seqMarketVal;
            const fmPayoffIfWait = smRespToWait === 'Enter' ? 1 : 0;
            const fmBestChoice = fmPayoffIfLaunch >= fmPayoffIfWait ? 'Launch' : 'Wait';

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Sequential First-Mover Advantage & Rollback Tree</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Backward Induction SPNE
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    SPNE: FM {fmBestChoice} → SM {fmBestChoice === 'Launch' ? smRespToLaunch : smRespToWait}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Monopoly Market Value:</span>
                      <span className="font-mono font-bold text-blue-400">{seqMarketVal} pts</span>
                    </div>
                    <input
                      type="range" min="2" max="8" step="1" value={seqMarketVal}
                      onChange={e => setSeqMarketVal(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Duopoly Payoff (Both In):</span>
                      <span className="font-mono font-bold text-amber-400">{seqDuopolyVal} pts</span>
                    </div>
                    <input
                      type="range" min="1" max="5" step="1" value={seqDuopolyVal}
                      onChange={e => setSeqDuopolyVal(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Fixed Entry Setup Cost:</span>
                      <span className="font-mono font-bold text-rose-400">{seqCostToEnter} pts</span>
                    </div>
                    <input
                      type="range" min="0" max="4" step="0.5" value={seqCostToEnter}
                      onChange={e => setSeqCostToEnter(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-300">Simulate First Mover Action:</span>
                  <div className="flex items-center gap-1.5">
                    {(['Launch', 'Wait'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSeqFirstMoveChoice(m)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          seqFirstMoveChoice === m ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {m === 'Launch' ? '🚀 Launch' : '⏳ Wait'}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300">
                    If FM plays {seqFirstMoveChoice}: SM plays {seqFirstMoveChoice === 'Launch' ? smRespToLaunch : smRespToWait} (Payoffs: FM {seqFirstMoveChoice === 'Launch' ? fmPayoffIfLaunch : fmPayoffIfWait}, SM {seqFirstMoveChoice === 'Launch' ? smEnterPayoffLaunch : smEnterPayoffWait})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className={`p-3 rounded-xl border ${seqFirstMoveChoice === 'Launch' ? 'bg-blue-950/40 border-blue-500 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold text-white mb-1 flex items-center justify-between">
                      <span>Branch A: First Mover Launches</span>
                      {fmBestChoice === 'Launch' && <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">SPNE</span>}
                    </div>
                    <div>SM Response: <strong className="text-amber-400">{smRespToLaunch}</strong> (Net: {smEnterPayoffLaunch.toFixed(1)} pts)</div>
                    <div>FM Payoff: <strong className="text-emerald-400 font-bold">{fmPayoffIfLaunch} pts</strong></div>
                  </div>
                  <div className={`p-3 rounded-xl border ${seqFirstMoveChoice === 'Wait' ? 'bg-blue-950/40 border-blue-500 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold text-white mb-1 flex items-center justify-between">
                      <span>Branch B: First Mover Waits</span>
                      {fmBestChoice === 'Wait' && <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">SPNE</span>}
                    </div>
                    <div>SM Response: <strong className="text-amber-400">{smRespToWait}</strong> (Net: {smEnterPayoffWait.toFixed(1)} pts)</div>
                    <div>FM Payoff: <strong className="text-rose-400 font-bold">{fmPayoffIfWait} pts</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  By launching first, the first mover seizes prime market positioning, forcing the second mover to choose between crowded duopoly competition ({seqDuopolyVal} pts) or staying out. Committing first locks in the leader advantage!
                </div>
              </div>
            );
          })()}

          {/* SIMULTANEOUS PRICE COMPETITION & PRICE MATCHING (3) */}
          {game.id === 3 && (() => {
            const highProfit = bertrand2x2HighMargin;
            const lowProfit = bertrand2x2LowMargin;
            const undercutProfit = Math.round(bertrand2x2LowMargin * 2.5 * 10) / 10;
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Bertrand Price Competition & Price-Matching Policy</span>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={hasPriceMatchPolicy}
                      onChange={e => setHasPriceMatchPolicy(e.target.checked)}
                      className="rounded accent-blue-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-cyan-300">Enable Price-Matching Policy</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>High Price Margin:</span>
                      <span className="font-mono font-bold text-blue-400">{bertrand2x2HighMargin} pts</span>
                    </div>
                    <input
                      type="range" min="2" max="6" step="1" value={bertrand2x2HighMargin}
                      onChange={e => setBertrand2x2HighMargin(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Low Price Margin:</span>
                      <span className="font-mono font-bold text-rose-400">{bertrand2x2LowMargin} pts</span>
                    </div>
                    <input
                      type="range" min="0.5" max="3" step="0.5" value={bertrand2x2LowMargin}
                      onChange={e => setBertrand2x2LowMargin(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className={`p-2.5 rounded-xl border ${hasPriceMatchPolicy ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                    <div className="font-bold text-white mb-0.5">Both Price High (Collusion)</div>
                    <div>Payoff: {highProfit} pts each {hasPriceMatchPolicy && '✓ Stable Equilibrium'}</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${!hasPriceMatchPolicy ? 'bg-rose-950/40 border-rose-600 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                    <div className="font-bold text-white mb-0.5">Both Price Low (Price War)</div>
                    <div>Payoff: {lowProfit} pts each {!hasPriceMatchPolicy && '⚠️ Dominant Trap'}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  {hasPriceMatchPolicy ? (
                    <span className="text-emerald-300">
                      💡 <strong>Tacit Collusion via Price Matching:</strong> By promising to match any rival price cut, you remove the rival's incentive to undercut you (they cannot steal 100% of the market). Both sellers pricing High becomes the robust equilibrium!
                    </span>
                  ) : (
                    <span>
                      Without price matching, undercutting to Low Price yields +{undercutProfit} pts when the rival prices High. Both firms defect to low prices, cutting collective industry margins in half.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PROMOTION TIMING (4) */}
          {game.id === 4 && (() => {
            const friShare = promoFriShare;
            const otherShare = Math.round((100 - friShare) / 2);
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Promotion Timing 3x3 Coordination & Clash Risk</span>
                  <span className="font-mono text-cyan-400 font-bold">Friday Magnet: {friShare}% of Traffic</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px]">
                    <span>Friday Traffic Concentration:</span>
                    <span className="font-mono font-bold text-cyan-400">{friShare}% (Mon: {otherShare}%, Wed: {otherShare}%)</span>
                  </div>
                  <input
                    type="range" min="34" max="70" step="2" value={promoFriShare}
                    onChange={e => setPromoFriShare(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Monday Traffic</span>
                    <span className="text-white font-bold">{otherShare} shoppers</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Wednesday Traffic</span>
                    <span className="text-white font-bold">{otherShare} shoppers</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Friday Traffic (Peak)</span>
                    <span className="text-cyan-400 font-bold">{friShare} shoppers</span>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-300">Test Your Day:</span>
                  <div className="flex items-center gap-1.5">
                    {(['Monday', 'Wednesday', 'Friday'] as const).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPromoMyDay(d)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          promoMyDay === d ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/50' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300">
                    Selected: {promoMyDay} ({promoMyDay === 'Friday' ? friShare : otherShare} shoppers)
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  Because Friday has higher consumer volume ({friShare}%), both retailers are magnetically pulled to schedule promotions on Friday. However, when both promote on Friday, attention clashes and advertising ROI collapses! Unpredictable scheduling is essential to avoid destructive simultaneous ad wars.
                </div>
              </div>
            );
          })()}

          {/* ENTRY DETERRENCE & STRATEGIC COMMITMENT (5) */}
          {game.id === 5 && (() => {
            const monopolyPayoff = 5;
            const duopolyPayoff = 2;
            const entrantPayoffWarWithCap = -1.5;

            const isCredibleDeterrence = deterCapacityInvested && entrantPayoffWarWithCap < 0;
            const incumbentFinalPayoff = isCredibleDeterrence ? monopolyPayoff - deterCapacityCost : duopolyPayoff;

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Dixit-Spence Entry Deterrence & Credible Threats</span>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                    isCredibleDeterrence ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {isCredibleDeterrence ? '✓ Credible Threat (Rival Deters)' : '⚠️ Cheap Talk (Rival Enters)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={deterCapacityInvested}
                        onChange={e => setDeterCapacityInvested(e.target.checked)}
                        className="rounded accent-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">Build Excess Production Capacity</div>
                        <div className="text-[10px] text-slate-400">Irreversible capital commitment</div>
                      </div>
                    </label>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Capital Sunk Cost (K):</span>
                      <span className="font-mono font-bold text-rose-400">{deterCapacityCost.toFixed(1)} pts</span>
                    </div>
                    <input
                      type="range" min="0.5" max="3.0" step="0.5" value={deterCapacityCost}
                      onChange={e => setDeterCapacityCost(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Incumbent Net Payoff:</span>
                    <span className="text-emerald-400 font-bold text-sm">{incumbentFinalPayoff.toFixed(1)} pts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Entrant Decision:</span>
                    <span className={`font-bold text-sm ${isCredibleDeterrence ? 'text-blue-400' : 'text-amber-400'}`}>
                      {isCredibleDeterrence ? 'Stay Out (Deterred)' : 'Enter (Duopoly)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  {isCredibleDeterrence ? (
                    <span>
                      Because the incumbent has already paid the fixed capacity cost, its marginal cost in a price war is near zero. The entrant knows that entering guarantees a price war loss ({entrantPayoffWarWithCap} pts), making the incumbent's threat credible!
                    </span>
                  ) : (
                    <span>
                      Without capacity commitment, an incumbent's promise to fight a price war is an empty threat: if the rival enters, fighting costs more than accommodating. Rational rivals see through cheap talk and enter.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* AUCTIONS (7 & 8) */}
          {(game.id === 7 || game.id === 8) && (() => {
            const isSecondPrice = game.id === 7;
            const isWinner = myBid >= competitorBid;
            const clearingPrice = isSecondPrice ? competitorBid : myBid;
            const profit = isWinner ? Math.round((val - clearingPrice) * 100) / 100 : 0;
            const optimalBid = isSecondPrice ? val : Math.round(val * 0.75 * 10) / 10;
            const bidSurplus = val - clearingPrice;

            return (
              <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
                {/* Header Strip with Live Metric Chips */}
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {isSecondPrice ? 'Second-Price Vickrey Auction' : 'First-Price Sealed-Bid Auction'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {isSecondPrice ? 'Truth-Telling DSE (b* = v)' : 'Optimal Shading (b* = 3/4 v)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      Clearing: <strong className="text-amber-300 font-bold">${clearingPrice.toFixed(2)}</strong>
                    </span>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                      profit > 0
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : isWinner && profit < 0
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {profit > 0 ? `Won: +$${profit.toFixed(2)}` : isWinner && profit < 0 ? `Winner's Curse: -$${Math.abs(profit).toFixed(2)}` : 'Lost: $0.00'}
                    </span>
                  </div>
                </div>

                {/* 2-Column Visual Stage + Direct Scrubbers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: Live Interactive SVG Surplus Curve */}
                  <div className="lg:col-span-6 space-y-2">
                    <AuctionSurplusVisualizer
                      isSecondPrice={isSecondPrice}
                      myBid={myBid}
                      trueValuation={val}
                      competitorBid={competitorBid}
                      maxBidRange={12}
                      title={isSecondPrice ? "Vickrey Payoff & Dominance" : "1st-Price Surplus Tradeoff"}
                    />
                  </div>

                  {/* Right: Direct Scrubbing Sliders & Metric Chips */}
                  <div className="lg:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Live Auction Parameters
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Drag to observe bid curve</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Valuation */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-blue-300">Your Private Valuation (v):</span>
                          <span className="font-mono font-black text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">${val.toFixed(1)}</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="0.5" value={val}
                          onChange={e => setVal(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Your Bid */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-indigo-300">Your Bid (b):</span>
                          <span className="font-mono font-black text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">${myBid.toFixed(1)}</span>
                        </div>
                        <input
                          type="range" min="0" max="12" step="0.5" value={myBid}
                          onChange={e => setMyBid(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      {/* Rival Bid */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-amber-300">Rival's Bid:</span>
                          <span className="font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">${competitorBid.toFixed(1)}</span>
                        </div>
                        <input
                          type="range" min="0" max="12" step="0.5" value={competitorBid}
                          onChange={e => setCompetitorBid(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Glanceable Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Nash Optimum</span>
                        <span className="text-xs font-black text-emerald-400">${optimalBid.toFixed(1)}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Surplus Margin</span>
                        <span className={`text-xs font-black ${bidSurplus >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                          {bidSurplus >= 0 ? `+$${bidSurplus.toFixed(1)}` : `-$${Math.abs(bidSurplus).toFixed(1)}`}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Auction Result</span>
                        <span className={`text-xs font-black ${isWinner ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {isWinner ? 'Winner' : 'Outbid'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SPLIT-THE-PIE BARGAINING (9) */}
          {game.id === 9 && (() => {
            const netSurplus = Math.max(0, pieTotalAmount - pieP1ThreatPoint - pieP2ThreatPoint);
            const p1Share = Math.round((pieP1ThreatPoint + pieP1Power * netSurplus) * 10) / 10;
            const p2Share = Math.round((pieP2ThreatPoint + (1 - pieP1Power) * netSurplus) * 10) / 10;
            const nashProduct = Math.round(Math.pow(p1Share - pieP1ThreatPoint, pieP1Power) * Math.pow(p2Share - pieP2ThreatPoint, 1 - pieP1Power) * 100) / 100;

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Generalized Nash Bargaining & Threat Point Leverage</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Agreement: (${p1Share.toFixed(1)}, ${p2Share.toFixed(1)})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Total Pie ($):</span>
                      <span className="font-mono font-bold text-cyan-400">${pieTotalAmount}</span>
                    </div>
                    <input
                      type="range" min="6" max="20" step="1" value={pieTotalAmount}
                      onChange={e => setPieTotalAmount(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Your Outside Option (d1):</span>
                      <span className="font-mono font-bold text-blue-400">${pieP1ThreatPoint.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0" max="4" step="0.5" value={pieP1ThreatPoint}
                      onChange={e => setPieP1ThreatPoint(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Rival's Threat Option (d2):</span>
                      <span className="font-mono font-bold text-amber-400">${pieP2ThreatPoint.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0" max="4" step="0.5" value={pieP2ThreatPoint}
                      onChange={e => setPieP2ThreatPoint(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Your Bargaining Power (α):</span>
                      <span className="font-mono font-bold text-emerald-400">{(pieP1Power * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range" min="0.1" max="0.9" step="0.05" value={pieP1Power}
                      onChange={e => setPieP1Power(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Gains From Trade (Surplus):</span>
                    <span className="text-white font-bold">${netSurplus.toFixed(1)} net</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Your Agreed Share:</span>
                    <span className="text-blue-400 font-bold">${p1Share.toFixed(1)} (+${(p1Share - pieP1ThreatPoint).toFixed(1)} over threat)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Nash Product Value:</span>
                    <span className="text-emerald-400 font-bold">{nashProduct}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  John Nash proved that rational cooperative bargaining maximizes the product of surplus gains (x1 - d1)^α · (x2 - d2)^(1-α). A stronger outside option (d1) or greater impatience penalty directly boosts negotiation leverage, securing a larger slice of the pie before splitting the remaining surplus.
                </div>
              </div>
            );
          })()}

          {/* COSTLY SIGNALING (10) */}
          {game.id === 10 && (() => {
            const wageDelta = signalWageHigh - signalWageLow;
            const highTypeNetGain = wageDelta - signalCostHigh;
            const lowTypeNetGain = wageDelta - signalCostLow;
            const isSeparating = signalCostHigh < wageDelta && wageDelta < signalCostLow;

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Spence Costly Signaling & Market Sorting</span>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                    isSeparating ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {isSeparating ? '✓ Separating Equilibrium (Credible Signal)' : '⚠️ Pooling / Overcostly (Fails to Sort)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Signal Cost (High Type):</span>
                      <span className="font-mono font-bold text-cyan-400">${signalCostHigh}k</span>
                    </div>
                    <input
                      type="range" min="1" max="5" step="0.5" value={signalCostHigh}
                      onChange={e => setSignalCostHigh(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Signal Cost (Low Type):</span>
                      <span className="font-mono font-bold text-rose-400">${signalCostLow}k</span>
                    </div>
                    <input
                      type="range" min="3" max="9" step="0.5" value={signalCostLow}
                      onChange={e => setSignalCostLow(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>High-Quality Wage:</span>
                      <span className="font-mono font-bold text-emerald-400">${signalWageHigh}k</span>
                    </div>
                    <input
                      type="range" min="5" max="12" step="1" value={signalWageHigh}
                      onChange={e => setSignalWageHigh(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Low-Quality Wage:</span>
                      <span className="font-mono font-bold text-slate-400">${signalWageLow}k</span>
                    </div>
                    <input
                      type="range" min="1" max="5" step="1" value={signalWageLow}
                      onChange={e => setSignalWageLow(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-slate-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className={`p-2.5 rounded-xl border ${highTypeNetGain > 0 ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className="text-[10px] text-slate-400 block font-sans">High Type Incentive to Signal:</span>
                    <span className="font-bold">{highTypeNetGain > 0 ? `+${highTypeNetGain.toFixed(1)}k Profit (Signals)` : `${highTypeNetGain.toFixed(1)}k (Refuses to Signal)`}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${lowTypeNetGain < 0 ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300' : 'bg-rose-950/40 border-rose-700 text-rose-300'}`}>
                    <span className="text-[10px] text-slate-400 block font-sans">Low Type Mimicking Incentive:</span>
                    <span className="font-bold">{lowTypeNetGain < 0 ? `${lowTypeNetGain.toFixed(1)}k Loss (Cannot Mimic)` : `+${lowTypeNetGain.toFixed(1)}k Profit (Mimics High Type!)`}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  {isSeparating ? (
                    <span>
                      ✓ <strong>Spence Single-Crossing Property Satisfied:</strong> Because the diploma is cheaper for high-productivity workers (${signalCostHigh}k) than low-productivity workers (${signalCostLow}k), high types willingly signal while low types cannot afford to mimic. The signal successfully solves asymmetric information!
                    </span>
                  ) : (
                    <span>
                      ⚠️ <strong>Signaling Breakdown:</strong> Either the wage gap is too small to cover the signal cost for high types, or the cost is too cheap so low types mimic, turning the diploma into an uninformative credential pool.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* BEAUTY CONTEST (11) */}
          {game.id === 11 && (() => {
            const target23 = Math.round((2 / 3) * assumedClassAvg * 10) / 10;
            const dist = Math.abs(beautyGuess - target23);
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Keynesian Beauty Contest Reasoning Depth</span>
                  <span className="font-mono text-amber-400 font-bold">Target (2/3 Avg): {target23.toFixed(1)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Your Guess:</span>
                      <span className="font-mono font-bold text-blue-400">{beautyGuess}</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1" value={beautyGuess}
                      onChange={e => setBeautyGuess(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Assumed Group Average:</span>
                      <span className="font-mono font-bold text-amber-400">{assumedClassAvg}</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1" value={assumedClassAvg}
                      onChange={e => setAssumedClassAvg(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  Your error distance is <strong className="text-white font-mono">{dist.toFixed(1)}</strong> units.
                  Level-k reasoning staircase: Level 0 = 50 → Level 1 = 33.3 → Level 2 = 22.2 → Level 3 = 14.8 → ∞ = 0 (Unique Nash Equilibrium).
                </div>
              </div>
            );
          })()}

          {/* PUBLIC GOODS & COMMONS (12) */}
          {game.id === 12 && (() => {
            const total = myContr + peerAvgContr;
            const sharedReturn = (total * publicMultiplier) / 2;
            const myPayoff = (20 - myContr) + sharedReturn;
            const peerPayoff = (20 - peerAvgContr) + sharedReturn;
            const privateReturn = publicMultiplier / 2;
            const freeRideDominant = privateReturn < 1.0;
            const maxSurplus = 20 * publicMultiplier;

            return (
              <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
                {/* Header Strip with Live Metric Chips */}
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Public Goods & Commons Free-Riding Dilemma</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      freeRideDominant ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {freeRideDominant ? 'Free-Riding Strictly Dominates (MPCR < 1)' : 'Cooperation Dominant (MPCR ≥ 1)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold">You: {myPayoff.toFixed(1)} pts</span>
                    <span className="text-xs font-mono text-slate-400">Peer: {peerPayoff.toFixed(1)} pts</span>
                  </div>
                </div>

                {/* 2-Column Visual Stage + Direct Scrubbers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: Commons Growth vs Harvest Visualizer */}
                  <div className="lg:col-span-6 space-y-2">
                    <CommonsResourceVisualizer
                      effortP1={myContr / 2}
                      effortP2={peerAvgContr / 2}
                      carryingCapacity={100}
                      title="Public Pool Multiplier & Social Surplus"
                    />
                  </div>

                  {/* Right: Direct Scrubbing Sliders & Metric Chips */}
                  <div className="lg:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Contribution Scrubbers
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Scrub to alter return</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Your Contribution */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-blue-300">Your Contribution:</span>
                          <span className="font-mono font-black text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">{myContr} / 20 tokens</span>
                        </div>
                        <input
                          type="range" min="0" max="20" step="1" value={myContr}
                          onChange={e => setMyContr(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Peer Contribution */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-amber-300">Peer's Contribution:</span>
                          <span className="font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">{peerAvgContr} / 20 tokens</span>
                        </div>
                        <input
                          type="range" min="0" max="20" step="1" value={peerAvgContr}
                          onChange={e => setPeerAvgContr(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Public Multiplier */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-emerald-300">Synergy Multiplier (r):</span>
                          <span className="font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">{publicMultiplier.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range" min="1.0" max="3.0" step="0.1" value={publicMultiplier}
                          onChange={e => setPublicMultiplier(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Glanceable Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Marginal Return</span>
                        <span className={`text-xs font-black ${privateReturn >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {privateReturn.toFixed(2)}x
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Total Pool Pot</span>
                        <span className="text-xs font-black text-cyan-400">{total} tokens</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Social Optimum</span>
                        <span className="text-xs font-black text-emerald-400">{maxSurplus.toFixed(0)} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* REPEATED PD & DISCOUNT FACTOR (6) */}
          {game.id === 6 && (() => {
            // Payoffs: R=3, T=5, P=1, S=0
            // Grim Trigger sustains cooperation if: 3 / (1 - delta) >= 5 + (delta / (1 - delta)) * 1
            // 3/(1-d) >= 5 + d/(1-d) => 3 >= 5(1-d) + d => 3 >= 5 - 4d => 4d >= 2 => d >= 0.50
            const criticalDelta = 0.50;
            const sustainsCoop = discountDelta >= criticalDelta;
            const coopPresentVal = Math.round((3 / (1 - discountDelta)) * 10) / 10;
            const defectPresentVal = Math.round((5 + (discountDelta / (1 - discountDelta)) * 1) * 10) / 10;
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Repeated Game Folk Theorem & Discount Factor ($\delta$)</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[10px] ${
                    sustainsCoop ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {sustainsCoop ? '✓ Cooperation Sustainable' : '⚠️ Defection Inevitable'}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span>Discount Factor / Continuation Probability ($\delta$):</span>
                    <span className="font-mono font-bold text-cyan-400">{(discountDelta * 100).toFixed(0)}% ($\delta = {discountDelta.toFixed(2)}$)</span>
                  </div>
                  <input
                    type="range" min="0.10" max="0.95" step="0.05" value={discountDelta}
                    onChange={e => setDiscountDelta(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Grim Trigger Lifetime Value:</span>
                    <span className="text-emerald-400 font-bold text-sm">{coopPresentVal} pts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">One-Time Defection + Punishment:</span>
                    <span className="text-amber-400 font-bold text-sm">{defectPresentVal} pts</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  💡 <strong>Folk Theorem Threshold (δ* = 0.50):</strong> When the shadow of the future δ ≥ 0.50, the long-term cost of punishment (P = 1) outweighs the immediate temptation to cheat (T = 5), making perpetual cooperation an equilibrium.
                </p>
              </div>
            );
          })()}

          {/* STAG HUNT COORDINATION (13) */}
          {game.id === 13 && (() => {
            const S = stagRewardS;
            const H = hareRewardH;
            const p = partnerStagProb / 100;
            const expStag = p * S;
            const expHare = H;
            const riskDomThreshold = Math.round((H / S) * 100);
            const trustsStag = partnerStagProb >= riskDomThreshold;

            return (
              <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
                {/* Header Strip with Live Metric Chips */}
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Stag Hunt Coordination: Payoff vs Risk Dominance</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      trustsStag ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {trustsStag ? '★ Payoff Dominant (Hunt Stag)' : '⚠️ Risk Dominant Safety (Hunt Hare)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold">E[Stag]: {expStag.toFixed(1)} pts</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">E[Hare]: {expHare.toFixed(1)} pts</span>
                  </div>
                </div>

                {/* 2-Column Visual Stage + Direct Scrubbers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: 2D Strategy Phase Space */}
                  <div className="lg:col-span-6 space-y-2">
                    <PhaseSpace2DVisualizer
                      r1Label="Stag"
                      r2Label="Hare"
                      c1Label="Stag"
                      c2Label="Hare"
                      a11={S} a12={0} a21={H} a22={H}
                      b11={S} b12={H} b21={0} b22={H}
                    />
                  </div>

                  {/* Right: Direct Scrubbing Sliders & Metric Chips */}
                  <div className="lg:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Payoff & Trust Scrubbers
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Scrub partner belief</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Stag Reward */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-emerald-300">Mutual Stag Reward (S):</span>
                          <span className="font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">+{stagRewardS} pts</span>
                        </div>
                        <input
                          type="range" min="6" max="16" step="1" value={stagRewardS}
                          onChange={e => setStagRewardS(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Safe Hare Reward */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-amber-300">Safe Hare Reward (H):</span>
                          <span className="font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">+{hareRewardH} pts</span>
                        </div>
                        <input
                          type="range" min="2" max="6" step="1" value={hareRewardH}
                          onChange={e => setHareRewardH(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Partner Trust Probability */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-cyan-300">Belief Partner Plays Stag (p):</span>
                          <span className="font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">{partnerStagProb}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="5" value={partnerStagProb}
                          onChange={e => setPartnerStagProb(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Glanceable Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Trust Hurdle (p*)</span>
                        <span className="text-xs font-black text-white">{riskDomThreshold}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Expected Advantage</span>
                        <span className={`text-xs font-black ${expStag >= expHare ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {expStag >= expHare ? `+${(expStag - expHare).toFixed(1)} pts` : `-${(expHare - expStag).toFixed(1)} pts`}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Equilibrium Type</span>
                        <span className={`text-xs font-black ${trustsStag ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {trustsStag ? 'Stag/Stag' : 'Hare/Hare'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CONTINUOUS BERTRAND DUOPOLY PRICE WAR (14) */}
          {game.id === 14 && (() => {
            const mc = bertrandMC;
            let p1Profit = 0;
            let p2Profit = 0;
            let marketOutcome = '';

            if (bertrandP1 < bertrandP2) {
              const q = Math.max(0, 100 - bertrandP1);
              p1Profit = Math.round((bertrandP1 - mc) * q);
              p2Profit = 0;
              marketOutcome = `Firm 1 undercuts and captures 100% of demand ($${p1Profit} profit)`;
            } else if (bertrandP2 < bertrandP1) {
              const q = Math.max(0, 100 - bertrandP2);
              p2Profit = Math.round((bertrandP2 - mc) * q);
              p1Profit = 0;
              marketOutcome = `Firm 2 undercuts and captures 100% of demand ($${p2Profit} profit)`;
            } else {
              const q = Math.max(0, 100 - bertrandP1);
              p1Profit = Math.round(((bertrandP1 - mc) * q) / 2);
              p2Profit = p1Profit;
              marketOutcome = `Tied prices: 50/50 demand split ($${p1Profit} profit each)`;
            }

            const cartelProfitEach = 1012.5;

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Continuous Bertrand Price Competition & Undercutting Dynamics</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-blue-400 font-bold">P1: ${p1Profit}</span>
                    <span className="text-amber-400 font-bold">P2: ${p2Profit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Firm 1 Price (P1):</span>
                      <span className="font-mono font-bold text-blue-400">${bertrandP1}</span>
                    </div>
                    <input
                      type="range" min="10" max="50" step="1" value={bertrandP1}
                      onChange={e => setBertrandP1(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Firm 2 Price (P2):</span>
                      <span className="font-mono font-bold text-amber-400">${bertrandP2}</span>
                    </div>
                    <input
                      type="range" min="10" max="50" step="1" value={bertrandP2}
                      onChange={e => setBertrandP2(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Marginal Cost (MC):</span>
                      <span className="font-mono font-bold text-rose-400">${bertrandMC}</span>
                    </div>
                    <input
                      type="range" min="5" max="25" step="1" value={bertrandMC}
                      onChange={e => setBertrandMC(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Current Status:</span>
                    <span className="text-white font-bold truncate block">{marketOutcome}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Bertrand-Nash Outcome:</span>
                    <span className="text-rose-400 font-bold">P* = ${mc} ($0 profit)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Cartel Monopoly Price:</span>
                    <span className="text-emerald-400 font-bold">P = $55 (+${cartelProfitEach}/firm)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  The Bertrand Paradox demonstrates that with homogeneous goods and price competition, even just two competing firms drive prices all the way down to marginal cost (P = MC = ${mc}), destroying all economic profit. Any price above MC creates an irresistible unilateral incentive to undercut by $1 and steal 100% of the market.
                </div>
              </div>
            );
          })()}

          {/* HAWK-DOVE BRINKMANSHIP (15) */}
          {game.id === 15 && (() => {
            const V = hdResourceVal;
            const C = hdInjuryCost;
            const pHawkStar = Math.min(1.0, Math.round((V / C) * 100) / 100);
            const pDoveStar = Math.round((1 - pHawkStar) * 100) / 100;
            const expPayoffMSNE = Math.round(((V * (C - V)) / (2 * C)) * 10) / 10;
            const collisionProb = Math.round(Math.pow(pHawkStar, 2) * 100);

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Hawk-Dove Brinkmanship & Catastrophic Collision Risk</span>
                  <span className="font-mono text-amber-400 font-bold">
                    Equilibrium Hawk Rate: {(pHawkStar * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Resource Value (V):</span>
                      <span className="font-mono font-bold text-emerald-400">+{hdResourceVal} pts</span>
                    </div>
                    <input
                      type="range" min="4" max="14" step="1" value={hdResourceVal}
                      onChange={e => setHdResourceVal(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Collision / Injury Penalty (C):</span>
                      <span className="font-mono font-bold text-rose-400">-{hdInjuryCost} pts</span>
                    </div>
                    <input
                      type="range" min="10" max="40" step="2" value={hdInjuryCost}
                      onChange={e => setHdInjuryCost(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">MSNE Mixing Ratio:</span>
                    <span className="text-white font-bold">{(pHawkStar * 100).toFixed(0)}% Hawk / {(pDoveStar * 100).toFixed(0)}% Dove</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Mutual Collision Risk:</span>
                    <span className="text-rose-400 font-bold">{collisionProb}% of encounters</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Expected Value in MSNE:</span>
                    <span className="text-emerald-400 font-bold">+{expPayoffMSNE} pts</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  In the Game of Chicken, when collision cost (C) is massive relative to the prize (V), the unique symmetric mixed strategy Nash equilibrium requires players to play Hawk with probability p* = V/C. As collision consequences worsen, rational players must become more peaceful and yield more frequently!
                </div>
              </div>
            );
          })()}

          {/* ULTIMATUM BARGAINING (16) */}
          {game.id === 16 && (() => {
            const offer = ultimatumPropose;
            const mao = ultimatumMAO;
            const willAccept = offer >= mao;
            const rejectProb = willAccept ? 0 : Math.min(100, Math.round(((mao - offer) / mao) * 100));
            const expProposerPayoff = Math.round((10 - offer) * (1 - rejectProb / 100) * 10) / 10;

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Ultimatum Bargaining: Backward Induction vs Behavioral Inequity Aversion</span>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                    willAccept ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {willAccept ? '✓ Offer Accepted' : `⚠️ ${rejectProb}% Risk of Veto`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Proposer Offer to Responder:</span>
                      <span className="font-mono font-bold text-blue-400">${offer.toFixed(1)} / $10.0</span>
                    </div>
                    <input
                      type="range" min="0.5" max="9.5" step="0.5" value={ultimatumPropose}
                      onChange={e => setUltimatumPropose(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Responder Minimum Acceptable Offer (MAO):</span>
                      <span className="font-mono font-bold text-amber-400">${mao.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="1.0" max="5.0" step="0.5" value={ultimatumMAO}
                      onChange={e => setUltimatumMAO(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Proposer Kept:</span>
                    <span className="text-white font-bold">${(10 - offer).toFixed(1)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Expected Proposer Payoff:</span>
                    <span className="text-emerald-400 font-bold">${expProposerPayoff.toFixed(1)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Theoretical SPNE:</span>
                    <span className="text-slate-400 font-bold">Offer $0.01 (All Kept)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  Standard backward induction predicts that a rational responder accepts any strictly positive amount ($0.01 &gt; 0), so the proposer should offer the absolute minimum. In reality, human beings possess strong negative reciprocity (inequity aversion): offers below $3.00 are routinely rejected at personal cost to punish unfair proposers!
                </div>
              </div>
            );
          })()}

          {/* MATCHING PENNIES (17) */}
          {game.id === 17 && (() => {
            const hBonus = penniesMatchH;
            const tBonus = penniesMatchT;
            const p2ProbH = Math.round((tBonus / (hBonus + tBonus)) * 100);
            const p1ProbH = 50;

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Matching Pennies & The Mixed Strategy Invariance Paradox</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    P2 Plays Heads: {p2ProbH}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Heads Match Payoff (Player 1):</span>
                      <span className="font-mono font-bold text-blue-400">+{penniesMatchH} pts</span>
                    </div>
                    <input
                      type="range" min="1" max="6" step="1" value={penniesMatchH}
                      onChange={e => setPenniesMatchH(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Tails Match Payoff (Player 1):</span>
                      <span className="font-mono font-bold text-amber-400">+{penniesMatchT} pts</span>
                    </div>
                    <input
                      type="range" min="1" max="6" step="1" value={penniesMatchT}
                      onChange={e => setPenniesMatchT(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Player 1 (Matcher) Mixing:</span>
                    <span className="text-white font-bold">{p1ProbH}% Heads / {100 - p1ProbH}% Tails</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Player 2 (Mismatcher) Mixing:</span>
                    <span className="text-cyan-400 font-bold">{p2ProbH}% Heads / {100 - p2ProbH}% Tails</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  💡 <strong>The Mixed Strategy Invariance Paradox:</strong> Notice what happens when you raise Player 1's payoff for matching on Heads! Player 1 does <em>not</em> play Heads more frequently (they still play 50/50). Instead, <strong>Player 2</strong> plays Tails more often ({100 - p2ProbH}%) to keep Player 1 indifferent! In mixed strategy equilibria, your payoffs dictate your opponent's mixing probabilities, not your own.
                </div>
              </div>
            );
          })()}

          {/* BATTLE OF THE SEXES (18) */}
          {game.id === 18 && (() => {
            const a = battleOperaA;
            const b = battleFootballB;
            const p1OperaProb = Math.round((b / (a + b)) * 100);
            const p2OperaProb = Math.round((a / (a + b)) * 100);
            const p1 = p1OperaProb / 100;
            const p2 = p2OperaProb / 100;
            const coordProb = Math.round((p1 * p2 + (1 - p1) * (1 - p2)) * 100);
            const clashProb = 100 - coordProb;
            const expPayoffEach = Math.round(((a * b) / (a + b)) * 10) / 10;

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Battle of the Sexes Coordination & Clash Breakdown</span>
                  <span className="font-mono text-purple-400 font-bold">
                    Clash Probability: {clashProb}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Opera Favored Payoff (a):</span>
                      <span className="font-mono font-bold text-purple-400">+{battleOperaA} pts</span>
                    </div>
                    <input
                      type="range" min="2" max="6" step="1" value={battleOperaA}
                      onChange={e => setBattleOperaA(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-purple-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Football Favored Payoff (b):</span>
                      <span className="font-mono font-bold text-amber-400">+{battleFootballB} pts</span>
                    </div>
                    <input
                      type="range" min="2" max="6" step="1" value={battleFootballB}
                      onChange={e => setBattleFootballB(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Coordination Rate:</span>
                    <span className="text-emerald-400 font-bold">{coordProb}% of rounds</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Clash Rate (0 pts):</span>
                    <span className="text-rose-400 font-bold">{clashProb}% of rounds</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Expected MSNE Payoff:</span>
                    <span className="text-white font-bold">{expPayoffEach} pts</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  Because both players desire coordination but clash over whose preferred event to attend, independent mixed strategies produce catastrophic miscoordination ({clashProb}% clash rate). In real life, humans resolve this deadlock using focal points, cultural conventions, or alternating turns.
                </div>
              </div>
            );
          })()}

          {/* THE TRUST GAME (19) */}
          {game.id === 19 && (() => {
            const sent = trustSentAmt;
            const mult = trustMultFactor;
            const tripledPot = sent * mult;
            const returnPct = trusteeReturnRate;
            const returned = Math.round((tripledPot * (returnPct / 100)) * 10) / 10;
            const investorFinal = Math.round((10 - sent + returned) * 10) / 10;
            const trusteeFinal = Math.round((tripledPot - returned) * 10) / 10;
            const surplusCreated = (mult - 1) * sent;
            const breakEvenRate = Math.round((1 / mult) * 100);

            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Berg-Dickhaut-McCabe Trust & Investment Surface</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-blue-400 font-bold">Investor: {investorFinal} pts</span>
                    <span className="text-emerald-400 font-bold">Trustee: {trusteeFinal} pts</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Amount Invested (S):</span>
                      <span className="font-mono font-bold text-blue-400">{sent} / 10 pts</span>
                    </div>
                    <input
                      type="range" min="0" max="10" step="1" value={trustSentAmt}
                      onChange={e => setTrustSentAmt(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Investment Multiplier:</span>
                      <span className="font-mono font-bold text-cyan-400">{trustMultFactor}x</span>
                    </div>
                    <input
                      type="range" min="2" max="4" step="0.5" value={trustMultFactor}
                      onChange={e => setTrustMultFactor(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Trustee Return Rate:</span>
                      <span className="font-mono font-bold text-emerald-400">{trusteeReturnRate}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="5" value={trusteeReturnRate}
                      onChange={e => setTrusteeReturnRate(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Tripled Pot:</span>
                    <span className="text-cyan-400 font-bold">{tripledPot} pts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Surplus Created:</span>
                    <span className="text-emerald-400 font-bold">+{surplusCreated} pts wealth</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Investor Break-Even:</span>
                    <span className="text-amber-400 font-bold">Return ≥ {breakEvenRate}%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  Backward induction predicts zero investment: at the final node, a selfish trustee returns $0, so the investor sends $0. However, in lab experiments, humans send over 50% of their endowment because reciprocity and social multipliers generate net wealth (+{surplusCreated} pts) that both players share!
                </div>
              </div>
            );
          })()}

          {/* CENTIPEDE GAME (20) */}
          {game.id === 20 && (() => {
            const q = centipedePassProb / 100;
            const expN1 = 2.0;
            const expN3 = (1 - q) * 1 + q * 4;
            const expN5 = (1 - q) * 1 + q * (1 - q) * 3 + Math.pow(q, 2) * 6;
            const expTerm = (1 - q) * 1 + q * (1 - q) * 3 + Math.pow(q, 2) * (1 - q) * 5 + Math.pow(q, 3) * 6;
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Centipede Trust Probability & Backward Induction</span>
                  <span className="font-mono text-amber-400 font-bold">Opponent Pass Prob: {centipedePassProb}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="5" value={centipedePassProb}
                  onChange={e => setCentipedePassProb(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Node 1 Take (SPNE):</span>
                    <span className="text-rose-400 font-bold">{expN1.toFixed(2)} pts</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Pass to Node 3:</span>
                    <span className="text-amber-400 font-bold">{expN3.toFixed(2)} pts</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Pass to Node 5:</span>
                    <span className="text-blue-400 font-bold">{expN5.toFixed(2)} pts</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Pass to Terminal:</span>
                    <span className="text-emerald-400 font-bold">{expTerm.toFixed(2)} pts</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* COURNOT DUOPOLY (21) */}
          {game.id === 21 && (() => {
            // Cournot Best Responses: q1*(q2) = (A - c - q2) / 2
            const bestResponseQ1 = Math.max(0, (cournotDemandA - cournotCost - cournotQ2) / 2);
            const cournotNashQ = Math.max(0, (cournotDemandA - cournotCost) / 3);
            const marketP = Math.max(0, cournotDemandA - (cournotQ1 + cournotQ2));
            const myProfit = Math.round(cournotQ1 * (marketP - cournotCost));
            const rivalProfit = Math.round(cournotQ2 * (marketP - cournotCost));
            const atNash = Math.abs(cournotQ1 - cournotNashQ) <= 1.5 && Math.abs(cournotQ2 - cournotNashQ) <= 1.5;

            return (
              <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
                {/* Header Strip with Live Metric Chips */}
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Cournot Quantity Duopoly & Reaction Cross</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      atNash ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-blue-950 text-blue-300 border-blue-800'
                    }`}>
                      {atNash ? '★ Cournot-Nash Fixed Point' : 'Disequilibrium Dynamics'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-blue-400 font-bold">P1 Profit: ${myProfit}</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">P2 Profit: ${rivalProfit}</span>
                    <span className="text-xs font-mono text-cyan-300 font-bold">P: ${marketP.toFixed(1)}</span>
                  </div>
                </div>

                {/* 2-Column Visual Stage + Direct Scrubbers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: Reaction Curves Visualizer */}
                  <div className="lg:col-span-6 space-y-2">
                    <ReactionFunctionVisualizer
                      q1={cournotQ1}
                      q2={cournotQ2}
                      cost={cournotCost}
                      demandA={cournotDemandA}
                      title="Best-Response Reaction Curves"
                    />
                  </div>

                  {/* Right: Direct Scrubbing Sliders & Metric Chips */}
                  <div className="lg:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Market & Output Scrubbers
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Drag to shift equilibrium</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Your Output */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-blue-300">Your Output (q1):</span>
                          <span className="font-mono font-black text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">{cournotQ1} units</span>
                        </div>
                        <input
                          type="range" min="5" max="45" step="1" value={cournotQ1}
                          onChange={e => setCournotQ1(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Rival Output */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-amber-300">Rival's Output (q2):</span>
                          <span className="font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">{cournotQ2} units</span>
                        </div>
                        <input
                          type="range" min="5" max="45" step="1" value={cournotQ2}
                          onChange={e => setCournotQ2(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Demand Intercept & Cost row */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-cyan-300">Demand A:</span>
                            <span className="font-mono text-cyan-400 font-bold">{cournotDemandA}</span>
                          </div>
                          <input
                            type="range" min="60" max="140" step="5" value={cournotDemandA}
                            onChange={e => setCournotDemandA(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                          />
                        </div>
                        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-rose-300">Marginal Cost:</span>
                            <span className="font-mono text-rose-400 font-bold">${cournotCost}</span>
                          </div>
                          <input
                            type="range" min="0" max="30" step="2" value={cournotCost}
                            onChange={e => setCournotCost(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Glanceable Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Nash Quantity</span>
                        <span className="text-xs font-black text-emerald-400">{cournotNashQ.toFixed(1)} u</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Best Response</span>
                        <span className="text-xs font-black text-cyan-400">{bestResponseQ1.toFixed(1)} u</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Market Price</span>
                        <span className="text-xs font-black text-amber-400">${marketP.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* HOTELLING BEACH (22) */}
          {game.id === 22 && (() => {
            const midpoint = (hotellingX1 + hotellingX2) / 2;
            const p1Share = hotellingX1 <= hotellingX2 ? midpoint : 100 - midpoint;
            const p2Share = 100 - p1Share;
            const atMinimumDiff = Math.abs(hotellingX1 - 50) <= 3 && Math.abs(hotellingX2 - 50) <= 3;

            return (
              <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
                {/* Header Strip with Live Metric Chips */}
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Hotelling Linear City & Spatial Competition</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      atMinimumDiff ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-blue-950 text-blue-300 border-blue-800'
                    }`}>
                      {atMinimumDiff ? '★ Principle of Minimum Differentiation (Center 50)' : 'Spatial Divergence'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-blue-400 font-bold">You: {p1Share.toFixed(1)}%</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">Rival: {p2Share.toFixed(1)}%</span>
                  </div>
                </div>

                {/* 2-Column Visual Stage + Direct Scrubbers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: Territory Strip Visualizer */}
                  <div className="lg:col-span-6 space-y-2">
                    <TerritoryStripVisualizer
                      pos1={hotellingX1}
                      pos2={hotellingX2}
                      label1="Your Cart"
                      label2="Rival Cart"
                      title="Beachfront Catchment & Customer Split"
                    />
                  </div>

                  {/* Right: Direct Scrubbing Sliders & Metric Chips */}
                  <div className="lg:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Cart Location Scrubbers
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Position 0 to 100 km</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Your Location */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-blue-300">Your Location (x1):</span>
                          <span className="font-mono font-black text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">{hotellingX1} km</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="1" value={hotellingX1}
                          onChange={e => setHotellingX1(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Rival Location */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-amber-300">Rival's Location (x2):</span>
                          <span className="font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">{hotellingX2} km</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="1" value={hotellingX2}
                          onChange={e => setHotellingX2(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Glanceable Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Territory Midpoint</span>
                        <span className="text-xs font-black text-cyan-400">{midpoint.toFixed(1)} km</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Nash Center</span>
                        <span className="text-xs font-black text-emerald-400">50.0 km</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Catchment Lead</span>
                        <span className={`text-xs font-black ${p1Share >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p1Share >= 50 ? `+${(p1Share - 50).toFixed(1)}%` : `-${(50 - p1Share).toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* COLONEL BLOTTO (23) */}
          {game.id === 23 && (() => {
            const myAllocC = Math.max(0, 100 - blottoA - blottoB);
            const winA = blottoA > botBlottoA ? 1 : blottoA < botBlottoA ? 0 : 0.5;
            const winB = blottoB > botBlottoB ? 1 : blottoB < botBlottoB ? 0 : 0.5;
            const winC = myAllocC > botBlottoC ? 1 : myAllocC < botBlottoC ? 0 : 0.5;
            const totalWins = (winA === 1 ? 1 : 0) + (winB === 1 ? 1 : 0) + (winC === 1 ? 1 : 0);
            const wonBattle = totalWins >= 2;
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Colonel Blotto Front Allocation Simulation</span>
                  <span className={`font-mono font-bold text-sm ${wonBattle ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {wonBattle ? 'Victory (Won ≥ 2 Fronts)' : 'Defeat (Lost ≥ 2 Fronts)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Front A (vs {botBlottoA}):</span>
                      <span className="font-mono font-bold text-blue-400">{blottoA}</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1" value={blottoA}
                      onChange={e => {
                        const newA = parseInt(e.target.value, 10);
                        setBlottoA(newA);
                        if (newA + blottoB > 100) setBlottoB(100 - newA);
                      }}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Front B (vs {botBlottoB}):</span>
                      <span className="font-mono font-bold text-blue-400">{blottoB}</span>
                    </div>
                    <input
                      type="range" min="0" max={100 - blottoA} step="1" value={blottoB}
                      onChange={e => {
                        const newB = parseInt(e.target.value, 10);
                        setBlottoB(newB);
                        setBlottoC(Math.max(0, 100 - blottoA - newB));
                      }}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Front C (vs {botBlottoC}):</span>
                      <span className="font-mono font-bold text-blue-400">{myAllocC}</span>
                    </div>
                    <div className="p-2 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                      Balance: {myAllocC} / 100 ({blottoC})
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className={`p-2 rounded-xl border ${winA === 1 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    Front A: {blottoA} vs {botBlottoA} ({winA === 1 ? 'Won' : winA === 0.5 ? 'Tie' : 'Lost'})
                  </div>
                  <div className={`p-2 rounded-xl border ${winB === 1 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    Front B: {blottoB} vs {botBlottoB} ({winB === 1 ? 'Won' : winB === 0.5 ? 'Tie' : 'Lost'})
                  </div>
                  <div className={`p-2 rounded-xl border ${winC === 1 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    Front C: {myAllocC} vs {botBlottoC} ({winC === 1 ? 'Won' : winC === 0.5 ? 'Tie' : 'Lost'})
                  </div>
                </div>
              </div>
            );
          })()}

          {/* COMMON-VALUE OIL LEASE (24) */}
          {game.id === 24 && (() => {
            const playerWins = cvMyBid > cvRivalBid;
            const profit = playerWins ? cvTrueV - cvMyBid : 0;
            const winnersCurse = playerWins && cvMyBid > cvTrueV;
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Common-Value Oil Tract Auction (Winner's Curse)</span>
                  <span className={`font-mono font-bold text-sm ${profit > 0 ? 'text-emerald-400' : winnersCurse ? 'text-rose-400' : 'text-slate-400'}`}>
                    {playerWins ? (winnersCurse ? `Overpaid by -$${Math.abs(profit)}!` : `Net Profit: +$${profit}`) : 'Auction Lost (Profit: $0)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>True Value V:</span>
                      <span className="font-mono font-bold text-amber-400">${cvTrueV}</span>
                    </div>
                    <input
                      type="range" min="20" max="80" step="1" value={cvTrueV}
                      onChange={e => setCvTrueV(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Your Signal:</span>
                      <span className="font-mono font-bold text-cyan-400">${cvPlayerSignal}</span>
                    </div>
                    <input
                      type="range" min="10" max="90" step="1" value={cvPlayerSignal}
                      onChange={e => setCvPlayerSignal(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Your Sealed Bid:</span>
                      <span className="font-mono font-bold text-blue-400">${cvMyBid}</span>
                    </div>
                    <input
                      type="range" min="10" max="90" step="1" value={cvMyBid}
                      onChange={e => setCvMyBid(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Rival's Bid:</span>
                      <span className="font-mono font-bold text-rose-400">${cvRivalBid}</span>
                    </div>
                    <input
                      type="range" min="10" max="90" step="1" value={cvRivalBid}
                      onChange={e => setCvRivalBid(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  {winnersCurse ? (
                    <span className="text-rose-400 font-semibold">
                      ⚠️ Winner's Curse Triggered: Winning informs you that you had the most aggressively optimistic estimate among all bidders! Because your bid (${cvMyBid}) exceeded the true tract value (${cvTrueV}), victory generates an immediate net loss.
                    </span>
                  ) : (
                    <span>
                      Bid shading rule: Always discount your bid relative to your private estimate to account for the adverse selection effect of winning.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* DOLLAR AUCTION (25) */}
          {game.id === 25 && (() => {
            const p1Wins = dollarP1Bid > dollarP2Bid;
            const p1Profit = p1Wins ? 1.00 - dollarP1Bid : -dollarP1Bid;
            const p2Profit = dollarP2Bid > dollarP1Bid ? 1.00 - dollarP2Bid : -dollarP2Bid;
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">The Dollar Auction Escalation Ladder</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className={`font-bold ${p1Profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      You: {p1Profit >= 0 ? `+$${p1Profit.toFixed(2)}` : `-$${Math.abs(p1Profit).toFixed(2)}`}
                    </span>
                    <span className={`font-bold ${p2Profit >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      Rival: {p2Profit >= 0 ? `+$${p2Profit.toFixed(2)}` : `-$${Math.abs(p2Profit).toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Your Bid:</span>
                      <span className="font-mono font-bold text-blue-400">${dollarP1Bid.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0.10" max="2.50" step="0.10" value={dollarP1Bid}
                      onChange={e => setDollarP1Bid(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Rival's Escalated Bid:</span>
                      <span className="font-mono font-bold text-rose-400">${dollarP2Bid.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0.10" max="2.50" step="0.10" value={dollarP2Bid}
                      onChange={e => setDollarP2Bid(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                  <div className="font-bold text-white flex justify-between">
                    <span>Sunk Cost Trap Diagnostic:</span>
                    <span className="text-amber-400 font-mono">
                      {dollarP1Bid >= 1.0 ? 'Overpayment Phase (Bid > $1)' : 'Bargain Phase (Bid < $1)'}
                    </span>
                  </div>
                  <p>
                    Because the second-place bidder forfeits their full bid, when you have bid $0.80 and rival bids $0.90, folding loses $0.80 while bidding $1.00 breaks even (loss of 0). Once bids cross $1.00, bidding $1.10 loses only $0.10 instead of $0.90—entangling players in an escalating trap!
                  </p>
                </div>
              </div>
            );
          })()}

          {/* TRAVELER'S DILEMMA (26) */}
          {game.id === 26 && (() => {
            let p1Payoff = travelerClaim1;
            let p2Payoff = travelerClaim2;
            if (travelerClaim1 < travelerClaim2) {
              p1Payoff = travelerClaim1 + travelerRewardR;
              p2Payoff = travelerClaim1 - travelerRewardR;
            } else if (travelerClaim2 < travelerClaim1) {
              p1Payoff = travelerClaim2 - travelerRewardR;
              p2Payoff = travelerClaim2 + travelerRewardR;
            }
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Traveler's Dilemma & Basu Paradox</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-emerald-400 font-bold">You: ${p1Payoff.toFixed(0)}</span>
                    <span className="text-slate-400">Rival: ${p2Payoff.toFixed(0)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Your Claim:</span>
                      <span className="font-mono font-bold text-blue-400">${travelerClaim1}</span>
                    </div>
                    <input
                      type="range" min="2" max="100" step="1" value={travelerClaim1}
                      onChange={e => setTravelerClaim1(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Rival Claim:</span>
                      <span className="font-mono font-bold text-amber-400">${travelerClaim2}</span>
                    </div>
                    <input
                      type="range" min="2" max="100" step="1" value={travelerClaim2}
                      onChange={e => setTravelerClaim2(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span>Bonus / Penalty (R):</span>
                      <span className="font-mono font-bold text-emerald-400">±${travelerRewardR}</span>
                    </div>
                    <input
                      type="range" min="1" max="10" step="1" value={travelerRewardR}
                      onChange={e => setTravelerRewardR(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  Unique Nash equilibrium by iterated strict dominance is <strong className="text-rose-400 font-mono">($2, $2)</strong>. Yet real human subjects playing ($98, $100) receive $100 and $96—proving that strict backward induction can be disastrously ill-conditioned!
                </div>
              </div>
            );
          })()}

          {/* RENEWABLE OCEAN FISHERY (27) */}
          {game.id === 27 && (() => {
            const totalEffort = fisheryEffortP1 + fisheryEffortP2;
            const stockRemaining = Math.max(0, carryingCapacity - totalEffort * 6);
            const catchPerBoat = stockRemaining * 0.4;
            const boatOperatingCost = 8;
            const p1NetProfit = Math.round(fisheryEffortP1 * (catchPerBoat - boatOperatingCost));
            const p2NetProfit = Math.round(fisheryEffortP2 * (catchPerBoat - boatOperatingCost));
            const stockHealthPct = Math.round((stockRemaining / carryingCapacity) * 100);
            const isSustainable = totalEffort <= 6;

            return (
              <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
                {/* Header Strip with Live Metric Chips */}
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Bioeconomic Fishery Stock Dynamics & Biomass Growth</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isSustainable ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}>
                      {isSustainable ? '✓ Sustainable Harvest (Effort ≤ 6)' : '⚠️ Overfishing Trap (Stock Depletion)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold ${p1NetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      You: ${p1NetProfit}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Rival: ${p2NetProfit}</span>
                    <span className={`text-xs font-mono font-bold ${stockHealthPct > 35 ? 'text-cyan-400' : 'text-rose-400'}`}>
                      Stock: {stockHealthPct}%
                    </span>
                  </div>
                </div>

                {/* 2-Column Visual Stage + Direct Scrubbers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: Commons Logistic Growth & Harvest Visualizer */}
                  <div className="lg:col-span-6 space-y-2">
                    <CommonsResourceVisualizer
                      effortP1={fisheryEffortP1}
                      effortP2={fisheryEffortP2}
                      carryingCapacity={carryingCapacity}
                      title="Logistic Biomass Regeneration vs Catch Rate"
                    />
                  </div>

                  {/* Right: Direct Scrubbing Sliders & Metric Chips */}
                  <div className="lg:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Fleet Effort Scrubbers
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Trawler boats launched</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Your Fleet */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-blue-300">Your Fleet:</span>
                          <span className="font-mono font-black text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">{fisheryEffortP1} trawlers</span>
                        </div>
                        <input
                          type="range" min="0" max="10" step="1" value={fisheryEffortP1}
                          onChange={e => setFisheryEffortP1(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Rival Fleet */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-amber-300">Rival Fleet:</span>
                          <span className="font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">{fisheryEffortP2} trawlers</span>
                        </div>
                        <input
                          type="range" min="0" max="10" step="1" value={fisheryEffortP2}
                          onChange={e => setFisheryEffortP2(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Glanceable Metric Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Total Effort</span>
                        <span className="text-xs font-black text-white">{totalEffort} boats</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Remaining Biomass</span>
                        <span className={`text-xs font-black ${stockRemaining < 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {stockRemaining} tons
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-sans">Catch Per Boat</span>
                        <span className="text-xs font-black text-cyan-400">${catchPerBoat.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* MARKET FOR LEMONS (28) */}
          {game.id === 28 && (() => {
            // Quality theta in [2000, 8000]. Seller cost = theta, Buyer value = 1.2 * theta.
            // Sellers sell if buyerPrice >= theta.
            const maxQualitySupplied = Math.min(8000, Math.max(2000, lemonBuyerPrice));
            const avgQuality = (2000 + maxQualitySupplied) / 2;
            const buyerValue = 1.2 * avgQuality;
            const buyerProfit = lemonBuyerPrice >= 2000 ? Math.round(buyerValue - lemonBuyerPrice) : 0;
            const pctPeaches = Math.max(0, Math.min(100, Math.round(((maxQualitySupplied - 2000) / 6000) * 100)));
            return (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-sm">Akerlof's Market for Lemons Adverse Selection</span>
                  <span className={`font-mono font-bold ${buyerProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Buyer Profit: ${buyerProfit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span>Buyer Offer Price:</span>
                    <span className="font-mono font-bold text-cyan-400">${lemonBuyerPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="1000" max="9000" step="250" value={lemonBuyerPrice}
                    onChange={e => setLemonBuyerPrice(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Avg Quality Sold:</span>
                    <span className="text-white font-bold">${avgQuality.toFixed(0)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Expected Value:</span>
                    <span className="text-emerald-400 font-bold">${buyerValue.toFixed(0)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Market Quality Mix:</span>
                    <span className="text-amber-400 font-bold">{pctPeaches}% High Quality</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  Because buyers cannot observe quality prior to purchase, high-quality car owners refuse to sell below their valuation. The pool of cars degrades into low-value lemons, causing the entire market to unravel unless warranties or certifications bridge the information gap.
                </p>
              </div>
            );
          })()}

          {/* Go deeper: Formal Equilibrium Proof & Analytical Assumptions */}
          <WhatIfMathProofExpander
            gameId={game.id}
            gameTitle={game.title}
          />
        </div>
      )}
    </div>
  );
};
