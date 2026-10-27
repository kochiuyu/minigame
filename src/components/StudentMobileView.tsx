import React, { useState, useEffect, useRef } from 'react';
import { WeekConfig, RoundData, StudentInfo, AuthSession, RoundsState, ReflectionsState } from '../types';
import { VisualGameMatrix } from './VisualGameMatrix';
import { WhatIfSandbox } from './WhatIfSandbox';
import { useDebouncedAutoSave } from '../hooks/useDebouncedAutoSave';
import { getServerMatch } from '../utils/serverMatchmaking';
import { drawValuation, resolveAuction, CompetitorBid } from '../utils/auctionEngine';
import { generateRandomRoundData, generateFullFreshTrial } from '../utils/trialGenerator';

interface StudentMobileViewProps {
  currentWeek: WeekConfig;
  allWeeks: WeekConfig[];
  currentWeekRounds: { [roundNum: number]: RoundData };
  activeRoundNum: number;
  setActiveRoundNum: (num: number) => void;
  onFieldChange: (roundNum: number, fieldId: string, value: string) => void;
  onLockStep1: (roundNum: number) => void;
  onLockStep2: (roundNum: number) => void;
  reflection: string;
  onReflectionChange: (val: string) => void;
  onCopySubmission: () => void;
  copyStatus: string;
  studentInfo: StudentInfo;
  authSession: AuthSession;
  onSelectWeek: (id: number) => void;
  totalRounds: number;
  onFillFreshTrial?: (rounds: { [roundNum: number]: RoundData }) => void;
  onResetTrial?: () => void;
}

export const StudentMobileView: React.FC<StudentMobileViewProps> = ({
  currentWeek,
  allWeeks = [],
  currentWeekRounds,
  activeRoundNum,
  setActiveRoundNum,
  onFieldChange,
  onLockStep1,
  onLockStep2,
  reflection,
  onReflectionChange,
  onCopySubmission,
  copyStatus,
  studentInfo,
  authSession,
  onSelectWeek,
  totalRounds,
  onFillFreshTrial,
  onResetTrial
}) => {
  const studentAlias = authSession.alias || authSession.name || studentInfo.alias || 'Student';
  const isPrisonersDilemma = currentWeek.id === 1 || currentWeek.id === 6;
  const isAuction = currentWeek.id === 7 || currentWeek.id === 8;
  const isSecondPrice = currentWeek.id === 7;
  const isBeautyContest = currentWeek.id === 11;
  const isPublicGoods = currentWeek.id === 12;
  const isSubmissionStep = activeRoundNum > totalRounds;

  const [trialToast, setTrialToast] = useState<string | null>(null);
  const [isGamePickerOpen, setIsGamePickerOpen] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [beautyGuess, setBeautyGuess] = useState<number>(33);
  const [publicGoodsContribution, setPublicGoodsContribution] = useState<number>(5);

  const showTrialToast = (msg: string) => {
    setTrialToast(msg);
    setTimeout(() => {
      setTrialToast(null);
    }, 2800);
  };

  // Collect completed past rounds history for repeated game reactive dynamics
  const previousRoundsList = Array.from({ length: Math.max(0, activeRoundNum - 1) }, (_, i) => {
    const rNum = i + 1;
    const d = currentWeekRounds[rNum] || {};
    return {
      round: rNum,
      myChoice: d.myChoice as string | undefined,
      partnerChoice: d.partnerChoice as string | undefined
    };
  });

  // Server-assigned partner for non-auction dyad games
  const serverMatch = getServerMatch(
    currentWeek.id,
    activeRoundNum,
    studentAlias,
    previousRoundsList
  );

  // System-drawn private valuation for auction games (Uniform integer from 1 to 10)
  const currentDrawnVal = drawValuation(studentAlias, activeRoundNum, 1, 10);

  // Local state for active round
  const activeRoundData = currentWeekRounds[activeRoundNum] || {};
  const [localRoundData, setLocalRoundData] = useState<RoundData>(activeRoundData);
  const [localReflection, setLocalReflection] = useState<string>(reflection);
  const [bidInput, setBidInput] = useState<number>(currentDrawnVal);

  useEffect(() => {
    const rData = currentWeekRounds[activeRoundNum] || {};

    if (isAuction) {
      const drawn = typeof rData.drawnValuation === 'number'
        ? rData.drawnValuation
        : (rData.drawnValuation ? parseInt(String(rData.drawnValuation), 10) : currentDrawnVal);

      if (!rData.drawnValuation) {
        const updated = {
          ...rData,
          drawnValuation: drawn
        };
        setLocalRoundData(updated);
        onFieldChange(activeRoundNum, 'drawnValuation', String(drawn));
      } else {
        setLocalRoundData(rData);
      }

      if (rData.myBid !== undefined && rData.myBid !== '') {
        setBidInput(Number(rData.myBid));
      } else {
        setBidInput(drawn);
      }
    } else {
      if (!rData.partnerAlias1) {
        setLocalRoundData({
          ...rData,
          partnerAlias1: serverMatch.partnerAlias
        });
        onFieldChange(activeRoundNum, 'partnerAlias1', serverMatch.partnerAlias);
      } else {
        setLocalRoundData(rData);
      }
    }
  }, [activeRoundNum, currentWeek.id, currentWeekRounds, serverMatch.partnerAlias, onFieldChange, isAuction, currentDrawnVal]);

  useEffect(() => {
    setLocalReflection(reflection);
  }, [reflection, currentWeek.id]);

  // Direct persistence backup to localStorage
  const persistDirectlyToLocalStorage = (roundNum: number, data: RoundData) => {
    try {
      const raw = localStorage.getItem('gameTheoryRounds');
      const allRounds: RoundsState = raw ? JSON.parse(raw) : {};
      const weekData = allRounds[currentWeek.id] || {};
      allRounds[currentWeek.id] = {
        ...weekData,
        [roundNum]: {
          ...weekData[roundNum],
          ...data
        }
      };
      localStorage.setItem('gameTheoryRounds', JSON.stringify(allRounds));
    } catch (e) {
      console.error('Failed to persist draft to localStorage', e);
    }
  };

  const persistReflectionDirectly = (text: string) => {
    try {
      const raw = localStorage.getItem('gameTheoryReflections');
      const allReflections: ReflectionsState = raw ? JSON.parse(raw) : {};
      allReflections[currentWeek.id] = text;
      localStorage.setItem('gameTheoryReflections', JSON.stringify(allReflections));
    } catch (e) {
      console.error('Failed to persist reflection to localStorage', e);
    }
  };

  const activeRoundNumRef = useRef(activeRoundNum);
  activeRoundNumRef.current = activeRoundNum;

  const {
    flush: flushRoundSave
  } = useDebouncedAutoSave<RoundData>(
    localRoundData,
    (latestData) => {
      const targetRound = activeRoundNumRef.current;
      persistDirectlyToLocalStorage(targetRound, latestData);
      Object.entries(latestData).forEach(([fieldId, val]) => {
        if (typeof val === 'string' || typeof val === 'number') {
          onFieldChange(targetRound, fieldId, String(val));
        }
      });
    },
    300
  );

  const {
    scheduleSave: scheduleReflectionSave,
    flush: flushReflectionSave
  } = useDebouncedAutoSave<string>(
    localReflection,
    (latestText) => {
      persistReflectionDirectly(latestText);
      onReflectionChange(latestText);
    },
    300
  );

  // Single-touch submit for Prisoner's Dilemma
  const handlePrisonersDilemmaSubmit = (choice: 'Cooperate' | 'Defect') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const pChoice = serverMatch.partnerChoice || (Math.random() < 0.6 ? 'Cooperate' : 'Defect');

    const updatedData: RoundData = {
      ...localRoundData,
      myChoice: choice,
      partnerAlias1: serverMatch.partnerAlias,
      partnerChoice: pChoice,
      isStep1Locked: true,
      step1Time: timeStr,
      isStep2Locked: true,
      step2Time: timeStr
    };

    setLocalRoundData(updatedData);
    flushRoundSave();
    persistDirectlyToLocalStorage(activeRoundNum, updatedData);
    onFieldChange(activeRoundNum, 'myChoice', choice);
    onFieldChange(activeRoundNum, 'partnerAlias1', serverMatch.partnerAlias);
    onFieldChange(activeRoundNum, 'partnerChoice', pChoice);
    onLockStep1(activeRoundNum);
    onLockStep2(activeRoundNum);
  };

  // Submit sealed bid for Auction Game (Private values drawn from system)
  const handleAuctionBidSubmit = (bidAmount: number) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const val = typeof localRoundData.drawnValuation === 'number'
      ? localRoundData.drawnValuation
      : (localRoundData.drawnValuation ? parseInt(String(localRoundData.drawnValuation), 10) : currentDrawnVal);

    // Bids can be any number (decimals or integers, no arbitrary clamp)
    const safeBid = Math.max(0, Math.round(Number(bidAmount) * 100) / 100);
    const auctionRes = resolveAuction(
      val,
      safeBid,
      activeRoundNum,
      studentAlias,
      isSecondPrice ? 'second_price' : 'first_price',
      3, // 3 competitors => 4 bidders total in auction market
      1,
      10
    );

    const updatedData: RoundData = {
      ...localRoundData,
      drawnValuation: val,
      myBid: safeBid,
      clearingPrice: auctionRes.clearingPrice,
      winningBid: auctionRes.highestBid,
      winnerAlias: auctionRes.winnerAlias,
      isWinner: auctionRes.isStudentWinner ? 'true' : 'false',
      profit: auctionRes.profit,
      competitorsBids: JSON.stringify(auctionRes.allBids),
      isStep1Locked: true,
      step1Time: timeStr,
      isStep2Locked: true,
      step2Time: timeStr
    };

    setLocalRoundData(updatedData);
    flushRoundSave();
    persistDirectlyToLocalStorage(activeRoundNum, updatedData);
    onFieldChange(activeRoundNum, 'drawnValuation', String(val));
    onFieldChange(activeRoundNum, 'myBid', String(safeBid));
    onFieldChange(activeRoundNum, 'clearingPrice', String(auctionRes.clearingPrice));
    onFieldChange(activeRoundNum, 'winningBid', String(auctionRes.highestBid));
    onFieldChange(activeRoundNum, 'profit', String(auctionRes.profit));
    onFieldChange(activeRoundNum, 'isWinner', auctionRes.isStudentWinner ? 'true' : 'false');
    onLockStep1(activeRoundNum);
    onLockStep2(activeRoundNum);
  };

  // Submit for Keynesian Beauty Contest (2/3 of Average)
  const handleBeautyContestSubmit = (guess: number) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const safeGuess = Math.max(0, Math.min(100, Math.round(Number(guess) * 10) / 10));
    const cohortAverage = Math.round((28 + Math.random() * 14) * 10) / 10;
    const target = Math.round((cohortAverage * 2 / 3) * 10) / 10;
    const diff = Math.round(Math.abs(safeGuess - target) * 10) / 10;
    const isWinner = diff < 4;

    const updatedData: RoundData = {
      ...localRoundData,
      myGuess: safeGuess,
      classAverage: cohortAverage,
      targetValue: target,
      isWinner: isWinner ? 'true' : 'false',
      isStep1Locked: true,
      step1Time: timeStr,
      isStep2Locked: true,
      step2Time: timeStr
    };

    setLocalRoundData(updatedData);
    flushRoundSave();
    persistDirectlyToLocalStorage(activeRoundNum, updatedData);
    onFieldChange(activeRoundNum, 'myGuess', String(safeGuess));
    onFieldChange(activeRoundNum, 'classAverage', String(cohortAverage));
    onFieldChange(activeRoundNum, 'targetValue', String(target));
    onFieldChange(activeRoundNum, 'isWinner', isWinner ? 'true' : 'false');
    onLockStep1(activeRoundNum);
    onLockStep2(activeRoundNum);
  };

  // Submit for Public Goods Game (Free-Rider Dilemma)
  const handlePublicGoodsSubmit = (contribution: number) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const myContr = Math.max(0, Math.min(10, Math.round(Number(contribution))));
    const decay = Math.max(0.25, 1 - (activeRoundNum - 1) * 0.12);
    const peer1 = Math.max(0, Math.min(10, Math.round((Math.random() * 6 + 2) * decay)));
    const peer2 = Math.max(0, Math.min(10, Math.round((Math.random() * 5 + 1) * decay)));
    const peer3 = Math.max(0, Math.min(10, Math.round((Math.random() * 7 + 2) * decay)));
    const groupContributions = myContr + peer1 + peer2 + peer3;
    const groupReturn = Math.round((groupContributions * 1.6 / 4) * 10) / 10;

    const updatedData: RoundData = {
      ...localRoundData,
      myContribution: myContr,
      groupContributions,
      groupReturn,
      isStep1Locked: true,
      step1Time: timeStr,
      isStep2Locked: true,
      step2Time: timeStr
    };

    setLocalRoundData(updatedData);
    flushRoundSave();
    persistDirectlyToLocalStorage(activeRoundNum, updatedData);
    onFieldChange(activeRoundNum, 'myContribution', String(myContr));
    onFieldChange(activeRoundNum, 'groupContributions', String(groupContributions));
    onFieldChange(activeRoundNum, 'groupReturn', String(groupReturn));
    onLockStep1(activeRoundNum);
    onLockStep2(activeRoundNum);
  };

  // Generic Step 1 Lock for other classroom games
  const handleGenericStep1Submit = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const updated = {
      ...localRoundData,
      isStep1Locked: true,
      step1Time: timeStr
    };
    setLocalRoundData(updated);
    flushRoundSave();
    persistDirectlyToLocalStorage(activeRoundNum, updated);
    onLockStep1(activeRoundNum);
  };

  // Generic Step 2 Lock for other classroom games
  const handleGenericStep2Submit = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const updated = {
      ...localRoundData,
      isStep2Locked: true,
      step2Time: timeStr
    };
    setLocalRoundData(updated);
    flushRoundSave();
    persistDirectlyToLocalStorage(activeRoundNum, updated);
    onLockStep2(activeRoundNum);
  };

  // Fresh Random Trial: Fill active round with randomized play
  const handleFillCurrentRoundRandom = () => {
    const randomized = generateRandomRoundData(
      currentWeek,
      activeRoundNum,
      totalRounds,
      studentAlias,
      previousRoundsList
    );

    setLocalRoundData(randomized);
    persistDirectlyToLocalStorage(activeRoundNum, randomized);

    Object.entries(randomized).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number') {
        onFieldChange(activeRoundNum, k, String(v));
      }
    });
    onLockStep1(activeRoundNum);
    onLockStep2(activeRoundNum);

    if (isAuction && randomized.myBid !== undefined) {
      setBidInput(Number(randomized.myBid));
    }

    showTrialToast(`🎲 Fresh random trial filled for Round ${activeRoundNum}!`);
  };

  // Fresh Random Trial: Auto-simulate all 6 rounds with dynamic randomized play
  const handleAutoPlayAllRounds = () => {
    const freshTrials = generateFullFreshTrial(currentWeek, totalRounds, studentAlias);
    if (onFillFreshTrial) {
      onFillFreshTrial(freshTrials);
    } else {
      Object.entries(freshTrials).forEach(([rStr, data]) => {
        const rNum = parseInt(rStr, 10);
        persistDirectlyToLocalStorage(rNum, data);
        Object.entries(data).forEach(([k, v]) => {
          if (typeof v === 'string' || typeof v === 'number') {
            onFieldChange(rNum, k, String(v));
          }
        });
        onLockStep1(rNum);
        onLockStep2(rNum);
      });
      setActiveRoundNum(totalRounds + 1);
    }
    showTrialToast(`⚡ Generated fresh random trial across all ${totalRounds} rounds!`);
  };

  // Fresh Random Trial: Clear and start a clean slate from Round 1
  const handleResetCurrentTrial = () => {
    if (onResetTrial) {
      onResetTrial();
    } else {
      try {
        const raw = localStorage.getItem('gameTheoryRounds');
        const allRounds: RoundsState = raw ? JSON.parse(raw) : {};
        delete allRounds[currentWeek.id];
        localStorage.setItem('gameTheoryRounds', JSON.stringify(allRounds));
      } catch (e) {
        console.error(e);
      }
      setActiveRoundNum(1);
    }
    setLocalRoundData({});
    showTrialToast('🔄 Trial reset. Ready for a clean new run!');
  };

  const rData = localRoundData;
  const isResolved = rData.isStep2Locked === true;
  const results = isResolved ? currentWeek.calculate(rData) : null;

  // Compute Overall Statistics across all played rounds
  const playedRounds = Array.from({ length: totalRounds }, (_, i) => i + 1);
  const completedRounds = playedRounds.filter(r => currentWeekRounds[r]?.isStep2Locked);

  let cumulativePoints = 0;
  let myCooperateCount = 0;
  let partnerCooperateCount = 0;
  let mutualCoopCount = 0;
  let mutualDefectCount = 0;

  // Auction specific metrics
  let auctionsWonCount = 0;
  let sumValuations = 0;
  let sumBids = 0;

  const roundSummaries = playedRounds.map(r => {
    const data = currentWeekRounds[r] || {};
    const res = data.isStep2Locked ? currentWeek.calculate(data) : null;
    let scoreNum = 0;
    if (res && res["Your Score"]) {
      const match = String(res["Your Score"]).match(/(-?\d+)/);
      if (match) scoreNum = parseInt(match[1], 10);
    }
    if (data.isStep2Locked) {
      cumulativePoints += scoreNum;
    }

    if (data.myChoice === 'Cooperate') myCooperateCount++;
    if (data.partnerChoice === 'Cooperate') partnerCooperateCount++;
    if (data.myChoice === 'Cooperate' && data.partnerChoice === 'Cooperate') mutualCoopCount++;
    if (data.myChoice === 'Defect' && data.partnerChoice === 'Defect') mutualDefectCount++;

    const isWinnerBool = data.isWinner === 'true' || data.isWinner === true;
    if (data.isStep2Locked && isWinnerBool) {
      auctionsWonCount++;
    }
    if (data.drawnValuation !== undefined) {
      sumValuations += Number(data.drawnValuation);
    }
    if (data.myBid !== undefined) {
      sumBids += Number(data.myBid);
    }

    let competitorList: CompetitorBid[] = [];
    if (data.competitorsBids) {
      try {
        competitorList = JSON.parse(String(data.competitorsBids));
      } catch {
        competitorList = [];
      }
    }

    return {
      round: r,
      partner: (data.partnerAlias1 as string) || `Partner ${r}`,
      myChoice: (data.myChoice as string) || '-',
      partnerChoice: (data.partnerChoice as string) || '-',
      score: res ? String(res["Your Score"] || `${scoreNum} pts`) : '-',
      scoreNum,
      isCompleted: data.isStep2Locked === true,
      // Auction specific fields
      drawnValuation: data.drawnValuation !== undefined ? Number(data.drawnValuation) : undefined,
      myBid: data.myBid !== undefined ? Number(data.myBid) : undefined,
      clearingPrice: data.clearingPrice !== undefined ? Number(data.clearingPrice) : undefined,
      winningBid: data.winningBid !== undefined ? Number(data.winningBid) : undefined,
      winnerAlias: (data.winnerAlias as string) || undefined,
      isWinner: isWinnerBool,
      profit: data.profit !== undefined ? Number(data.profit) : scoreNum,
      competitors: competitorList
    };
  });

  const avgScore = completedRounds.length > 0 ? (cumulativePoints / completedRounds.length).toFixed(1) : '0';
  const myCoopPct = completedRounds.length > 0 ? Math.round((myCooperateCount / completedRounds.length) * 100) : 0;
  const partnerCoopPct = completedRounds.length > 0 ? Math.round((partnerCooperateCount / completedRounds.length) * 100) : 0;
  const winRate = completedRounds.length > 0 ? Math.round((auctionsWonCount / completedRounds.length) * 100) : 0;

  // Parse competitors for the current active round
  let activeCompetitors: CompetitorBid[] = [];
  if (rData.competitorsBids) {
    try {
      activeCompetitors = JSON.parse(String(rData.competitorsBids));
    } catch {
      activeCompetitors = [];
    }
  }

  const isCurrentWinner = rData.isWinner === 'true' || rData.isWinner === true;

  return (
    <div className="max-w-md mx-auto px-3 py-2 space-y-3 font-sans">
      {!isSubmissionStep ? (
        <>
          {/* Barebone Minimal Header: Just Round & Game Type */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-slate-900">
                Round {activeRoundNum} of {totalRounds}
              </span>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setIsGamePickerOpen(true)}
                className="text-blue-700 hover:text-blue-900 font-semibold truncate max-w-[170px] inline-flex items-center gap-1 cursor-pointer bg-blue-50/80 hover:bg-blue-100/80 px-1.5 py-0.5 rounded transition-colors"
                title="Click to switch to a different classroom game"
              >
                <span>{currentWeek.icon}</span>
                <span className="truncate">{currentWeek.shortTitle || currentWeek.title}</span>
                <span className="text-[9px] text-blue-500 font-normal">▾</span>
              </button>
            </div>
            <div className="flex gap-1 items-center">
              {playedRounds.map((r) => (
                <span
                  key={r}
                  className={`w-2 h-2 rounded-full transition-all ${
                    r === activeRoundNum
                      ? 'bg-blue-600 ring-2 ring-blue-300'
                      : currentWeekRounds[r]?.isStep2Locked
                      ? 'bg-emerald-500'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Trial Feedback Notification */}
          {trialToast && (
            <div className="p-2 bg-blue-600 text-white text-xs font-bold rounded-xl text-center shadow-md animate-fade-in flex items-center justify-center gap-1.5">
              <span>✨</span>
              <span>{trialToast}</span>
            </div>
          )}

          {/* Quick Trial Helper Strip */}
          <div className="flex items-center justify-between bg-slate-900 rounded-xl px-2.5 py-1.5 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <span className="text-amber-400">⚡</span>
              <span>Tools:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowWhatIf(prev => !prev)}
                className={`px-2 py-1 font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 border ${
                  showWhatIf
                    ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-500/40 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-900/60'
                }`}
                title="Toggle interactive What-If simulation sandbox"
              >
                <span className="font-mono">∫</span>
                <span>{showWhatIf ? 'Hide Sandbox' : 'What-If Sandbox'}</span>
              </button>
              {!isResolved && (
                <button
                  type="button"
                  onClick={handleFillCurrentRoundRandom}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 text-[11px] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"
                  title="Fill and resolve this round with fresh random sample data"
                >
                  <span>🎲</span>
                  <span className="hidden sm:inline">Fill Round</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleAutoPlayAllRounds}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] shadow-2xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"
                title="Generate fresh randomized sample data across all rounds"
              >
                <span>⚡</span>
                <span>Simulate 6 Rds</span>
              </button>
              {completedRounds.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetCurrentTrial}
                  className="px-1.5 py-1 text-slate-500 hover:text-slate-300 text-[10px] font-medium rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear rounds and start a fresh trial from Round 1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Model Matrix / Rules Card ALWAYS visible right here on mobile */}
          <VisualGameMatrix week={currentWeek} currentRoundData={rData} history={roundSummaries} />

          {/* Interactive What-If Simulation Sandbox Drawer */}
          {showWhatIf && (
            <WhatIfSandbox
              game={currentWeek}
              initialValuation={currentDrawnVal}
              initialBid={bidInput}
              onApplyScenario={(scenario) => {
                if (scenario.myBid !== undefined) setBidInput(Number(scenario.myBid));
                if (scenario.myGuess !== undefined) setBeautyGuess(Number(scenario.myGuess));
                if (scenario.myContribution !== undefined) setPublicGoodsContribution(Number(scenario.myContribution));
                showTrialToast('✓ Applied sandbox scenario to your round decision!');
              }}
            />
          )}

          {/* Action Area: Either Auction Bidding or Game Move */}
          {isAuction ? (
            !isResolved ? (
              /* ACTIVE AUCTION BIDDING CARD */
              <div className="space-y-3">
                {/* Drawn Private Valuation Hero Card */}
                <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 text-center">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-blue-300">
                      <span>🏷️</span> Your Private Valuation
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-mono font-bold">
                      Uniform [1 to 10]
                    </span>
                  </div>

                  <div className="text-4xl sm:text-5xl font-black font-mono text-amber-300 py-1">
                    {currentDrawnVal} <span className="text-sm font-semibold text-slate-300">points</span>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-left space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-start gap-1.5 leading-snug">
                      <span className="text-blue-400 font-bold shrink-0">🎲</span>
                      <span>
                        <strong>Value Distribution:</strong> Uniform from 1 to 10. Each integer {`{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}`} has an equal <strong>10% chance</strong> of being drawn.
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-400 font-bold shrink-0">💰</span>
                      <span>
                        <strong>Payoff if won:</strong> Profit = <span className="font-mono text-amber-300 font-bold">{currentDrawnVal}</span> − (clearing price). If outbid, profit is <strong>0</strong>.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bidding Controls */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Enter Your Sealed Bid:
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Bids can be <strong className="text-slate-200">any number</strong>
                    </span>
                  </div>

                  {/* Stepper + Numeric Input */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setBidInput(prev => Math.max(0, Math.round((prev - 1) * 10) / 10))}
                      className="h-11 w-11 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 font-bold text-slate-200 text-sm flex items-center justify-center shrink-0 border border-slate-700 cursor-pointer"
                      title="Minus 1"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidInput(prev => Math.max(0, Math.round((prev - 0.5) * 10) / 10))}
                      className="h-11 w-11 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 font-bold text-slate-200 text-xs flex items-center justify-center shrink-0 border border-slate-700 cursor-pointer"
                      title="Minus 0.5"
                    >
                      -0.5
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={bidInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setBidInput(0);
                          } else {
                            const parsed = parseFloat(val);
                            setBidInput(isNaN(parsed) ? 0 : parsed);
                          }
                        }}
                        className="w-full h-11 text-center font-mono tabular-nums font-black text-xl text-blue-400 bg-slate-950 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">pts</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBidInput(prev => Math.round((prev + 0.5) * 10) / 10)}
                      className="h-11 w-11 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 font-bold text-slate-200 text-xs flex items-center justify-center shrink-0 border border-slate-700 cursor-pointer"
                      title="Plus 0.5"
                    >
                      +0.5
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidInput(prev => Math.round((prev + 1) * 10) / 10)}
                      className="h-11 w-11 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 font-bold text-slate-200 text-sm flex items-center justify-center shrink-0 border border-slate-700 cursor-pointer"
                      title="Plus 1"
                    >
                      +1
                    </button>
                  </div>

                  {/* Quick Preset Buttons tailored for 1-10 range */}
                  <div className="grid grid-cols-5 gap-1 text-center">
                    <button
                      type="button"
                      onClick={() => setBidInput(0)}
                      className="py-1.5 px-0.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-md text-[10px] font-bold border border-slate-700 cursor-pointer"
                    >
                      Bid 0
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidInput(Math.round((currentDrawnVal / 2) * 10) / 10)}
                      className="py-1.5 px-0.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-md text-[10px] font-bold border border-slate-700 cursor-pointer"
                    >
                      v / 2
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidInput(currentDrawnVal)}
                      className="py-1.5 px-0.5 bg-blue-900/60 hover:bg-blue-800/70 active:scale-95 text-blue-200 rounded-md text-[10px] font-extrabold border border-blue-500 cursor-pointer"
                    >
                      v Exact ({currentDrawnVal})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const jitter = (Math.floor(Math.random() * 5) - 2) * 0.5;
                        const rand = Math.max(0.5, Math.round((currentDrawnVal + jitter) * 10) / 10);
                        setBidInput(rand);
                      }}
                      className="py-1.5 px-0.5 bg-purple-900/50 hover:bg-purple-800/60 active:scale-95 text-purple-200 rounded-md text-[10px] font-bold border border-purple-600/50 cursor-pointer"
                      title="Generate fresh random bid around your valuation"
                    >
                      🎲 Random
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidInput(10)}
                      className="py-1.5 px-0.5 bg-amber-900/50 hover:bg-amber-800/60 active:scale-95 text-amber-200 rounded-md text-[10px] font-bold border border-amber-600/50 cursor-pointer"
                    >
                      Max (10)
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                    You can bid <strong>any number</strong>: below your valuation, equal to your valuation, or above your valuation (e.g. 0, 3, 5.5, 12).
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleAuctionBidSubmit(bidInput)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                  >
                    <span>Submit Sealed Bid ({bidInput} pts)</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            ) : (
              /* RESOLVED AUCTION RESULT & BID LADDER CARD */
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-4">
                {isCurrentWinner ? (
                  <div className="bg-emerald-950/40 border border-emerald-600/50 rounded-xl p-3.5 text-center space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Auction Cleared
                    </span>
                    <div className="text-xl font-black text-emerald-300">
                      🎉 You Won the Item!
                    </div>
                    <div className="text-xs text-emerald-200/90 font-medium">
                      Your bid of <strong className="font-mono tabular-nums text-white">{rData.myBid} pts</strong> was highest in your market.
                    </div>

                    <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-around text-xs mt-1">
                      <div>
                        <span className="text-[10px] text-emerald-400 block font-semibold">Your Value</span>
                        <span className="font-mono tabular-nums font-bold text-sm text-white">{rData.drawnValuation} pts</span>
                      </div>
                      <span className="text-emerald-500 font-bold">−</span>
                      <div>
                        <span className="text-[10px] text-emerald-400 block font-semibold">Price Paid</span>
                        <span className="font-mono tabular-nums font-bold text-sm text-white">{rData.clearingPrice} pts</span>
                      </div>
                      <span className="text-emerald-500 font-bold">=</span>
                      <div>
                        <span className="text-[10px] text-emerald-400 block font-semibold">Net Profit</span>
                        <span className={`font-mono tabular-nums font-extrabold text-base ${Number(rData.profit) >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                          {Number(rData.profit) >= 0 ? `+${rData.profit}` : rData.profit} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Auction Cleared
                    </span>
                    <div className="text-base font-bold text-white">
                      Item Sold to {rData.winnerAlias || 'Competitor'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Winning Bid: <span className="font-mono tabular-nums font-bold text-white">{rData.winningBid} pts</span> · Your Bid: <span className="font-mono tabular-nums font-bold text-slate-300">{rData.myBid} pts</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 pt-1">
                      Your Profit: <span className="font-mono tabular-nums text-slate-200">0 points</span> (Outbid)
                    </div>
                  </div>
                )}

                {/* 4-Bidder Market Clearing Ladder */}
                {activeCompetitors.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-300">Market Bids (4 Bidders):</span>
                      <span className="text-[10px] text-slate-400">
                        {isSecondPrice ? 'Winner pays 2nd Highest Bid' : 'Winner pays Highest Bid'}
                      </span>
                    </div>

                    <div className="space-y-1 rounded-lg border border-slate-800 overflow-hidden divide-y divide-slate-800">
                      {activeCompetitors.map((entry, idx) => {
                        const isStudent = entry.isStudent;
                        const isWinner = idx === 0;
                        const isPricePayer = isSecondPrice ? idx === 1 : idx === 0;

                        return (
                          <div
                            key={idx}
                            className={`p-2 text-xs flex items-center justify-between ${
                              isStudent ? 'bg-blue-950/40 font-bold border-l-2 border-blue-500' : 'bg-slate-950/40'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-slate-500 w-4">
                                #{idx + 1}
                              </span>
                              <span className="truncate max-w-[130px] font-medium text-slate-200">
                                {isStudent ? `${entry.alias} (You)` : entry.alias}
                              </span>
                              {isWinner && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Winner
                                </span>
                              )}
                              {isSecondPrice && isPricePayer && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Price Paid
                                </span>
                              )}
                            </div>

                            <div className="font-mono tabular-nums font-bold text-white text-right">
                              {entry.bid} pts
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    flushRoundSave();
                    setActiveRoundNum(activeRoundNum + 1);
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>
                    {activeRoundNum < totalRounds
                      ? `Next Auction (Round ${activeRoundNum + 1})`
                      : 'View Overall Results & Submit'}
                  </span>
                  <span>➔</span>
                </button>
              </div>
            )
          ) : isPrisonersDilemma ? (
            !isResolved ? (
              <div className="pt-1 space-y-2.5">
                {currentWeek.id === 6 && (
                  <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/60 text-xs text-purple-200 flex items-start gap-2.5">
                    <span className="text-base shrink-0">🔁</span>
                    <div className="leading-snug">
                      <div className="font-bold text-white">
                        Repeated Interaction with {serverMatch.partnerAlias}
                      </div>
                      <div className="text-[11px] text-purple-300/80 mt-0.5">
                        {activeRoundNum === 1
                          ? "Round 1: Initial move. Starting with Cooperate initiates long-run mutual gains."
                          : `Round ${activeRoundNum} of ${totalRounds}: Your counterparty remembers your play. Cooperative moves foster reciprocity; defection triggers retaliation.`}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePrisonersDilemmaSubmit('Cooperate')}
                    className="py-4 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-md transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 border border-blue-500/40"
                  >
                    <span>Cooperate (C)</span>
                    <span className="text-[10px] font-normal text-blue-200">Mutual Gain (+2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrisonersDilemmaSubmit('Defect')}
                    className="py-4 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-md transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 border border-amber-500/40"
                  >
                    <span>Defect (D)</span>
                    <span className="text-[10px] font-normal text-amber-200">Temptation (+3)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Resolved Prisoner's Dilemma Round Outcome */
              <div className="bg-slate-900 rounded-xl border border-emerald-500/40 p-4 shadow-sm text-center space-y-3">
                <div className="flex items-center justify-around py-1 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">You</span>
                    <span className="font-extrabold text-sm text-blue-400 font-mono">
                      {String(rData.myChoice)}
                    </span>
                  </div>
                  <div className="text-slate-500 font-bold">vs</div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold truncate max-w-[120px]">
                      {serverMatch.partnerAlias}
                    </span>
                    <span className="font-extrabold text-sm text-amber-400 font-mono">
                      {String(rData.partnerChoice)}
                    </span>
                  </div>
                </div>

                {results && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400 block">Round Score:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
                      {results["Your Score"]}
                    </span>
                    {results["Status"] && (
                      <span className={`block text-xs font-bold mt-1 px-2.5 py-1 rounded ${
                        String(rData.myChoice) === 'Cooperate' && String(rData.partnerChoice) === 'Cooperate'
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/60'
                          : String(rData.myChoice) === 'Defect' && String(rData.partnerChoice) === 'Cooperate'
                          ? 'bg-amber-950/50 text-amber-300 border border-amber-700/60'
                          : 'bg-slate-950/50 text-slate-300 border border-slate-800'
                      }`}>
                        {results["Status"]}
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    flushRoundSave();
                    setActiveRoundNum(activeRoundNum + 1);
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>
                    {activeRoundNum < totalRounds
                      ? currentWeek.id === 6
                        ? `Next Round (${activeRoundNum + 1} with ${serverMatch.partnerAlias.split(' ')[0]})`
                        : `Next Round (Round ${activeRoundNum + 1})`
                      : 'View Overall Results & Submit'}
                  </span>
                  <span>➔</span>
                </button>
              </div>
            )
          ) : isBeautyContest ? (
            !isResolved ? (
              /* KEYNESIAN BEAUTY CONTEST DECISION CARD */
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">
                      Guess 2/3 of Cohort Average:
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Pick any number from 0 to 100
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    Target = 2/3 × Avg
                  </span>
                </div>

                {/* Big Number Input & Slider */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={beautyGuess}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setBeautyGuess(isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
                      }}
                      className="w-full h-12 text-center font-mono tabular-nums font-black text-2xl text-indigo-300 bg-slate-950 border-2 border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={beautyGuess}
                    onChange={(e) => setBeautyGuess(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Strategic Depth Presets */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Cognitive Depth Presets:
                  </span>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    <button
                      type="button"
                      onClick={() => setBeautyGuess(50)}
                      className="py-1.5 px-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-slate-300 border border-slate-700 cursor-pointer"
                      title="Level-0: Random guessing centered at 50"
                    >
                      L0 (50)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeautyGuess(33.3)}
                      className="py-1.5 px-0.5 bg-indigo-900/50 hover:bg-indigo-800/60 rounded text-[10px] font-bold text-indigo-200 border border-indigo-700/60 cursor-pointer"
                      title="Level-1: 2/3 of 50 = 33.3"
                    >
                      L1 (33)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeautyGuess(22.2)}
                      className="py-1.5 px-0.5 bg-purple-900/50 hover:bg-purple-800/60 rounded text-[10px] font-bold text-purple-200 border border-purple-700/60 cursor-pointer"
                      title="Level-2: 2/3 of 33.3 = 22.2"
                    >
                      L2 (22)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeautyGuess(0)}
                      className="py-1.5 px-0.5 bg-emerald-900/50 hover:bg-emerald-800/60 rounded text-[10px] font-bold text-emerald-200 border border-emerald-700/60 cursor-pointer"
                      title="Nash Equilibrium: 0 (Iterative elimination)"
                    >
                      Nash (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeautyGuess(Math.round((Math.random() * 45 + 10) * 10) / 10)}
                      className="py-1.5 px-0.5 bg-amber-900/50 hover:bg-amber-800/60 rounded text-[10px] font-bold text-amber-200 border border-amber-700/60 cursor-pointer"
                      title="Random guess"
                    >
                      🎲 Rand
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBeautyContestSubmit(beautyGuess)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Submit Guess ({beautyGuess})</span>
                  <span>➔</span>
                </button>
              </div>
            ) : (
              /* RESOLVED BEAUTY CONTEST ROUND CARD */
              <div className="bg-slate-900 rounded-xl border border-indigo-800/60 p-4 shadow-sm space-y-3">
                <div className="bg-indigo-950/40 border border-indigo-700/50 rounded-xl p-3 text-center space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    Round {activeRoundNum} Cleared
                  </span>
                  <div className="text-lg font-black text-indigo-200">
                    {rData.isWinner === 'true' || rData.isWinner === true
                      ? '🎉 You Won the Round (+5 pts)!'
                      : 'Round Complete (+1 pt)'}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs pt-1.5 border-t border-indigo-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Class Avg</span>
                      <strong className="font-mono tabular-nums text-slate-200 text-sm">{rData.classAverage}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-400 block font-bold">Target (2/3)</span>
                      <strong className="font-mono tabular-nums text-indigo-200 text-sm">{rData.targetValue}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 block font-bold">Your Guess</span>
                      <strong className="font-mono tabular-nums text-blue-200 text-sm">{rData.myGuess}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    flushRoundSave();
                    setActiveRoundNum(activeRoundNum + 1);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{activeRoundNum < totalRounds ? `Next Round (${activeRoundNum + 1})` : 'View Overall Results & Submit'}</span>
                  <span>➔</span>
                </button>
              </div>
            )
          ) : isPublicGoods ? (
            !isResolved ? (
              /* PUBLIC GOODS GAME DECISION CARD */
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">
                      Choose Your Contribution (0 to 10 pts):
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Tokens kept are yours · Pooled tokens multiply by 1.6×
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    4-Player Pool
                  </span>
                </div>

                {/* Allocation Visual & Stepper */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">
                      Keep Private: <span className="text-white font-mono tabular-nums text-sm">{10 - publicGoodsContribution} pts</span>
                    </span>
                    <span className="text-emerald-400">
                      Public Pot: <span className="font-mono tabular-nums text-sm">{publicGoodsContribution} pts</span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={publicGoodsContribution}
                    onChange={(e) => setPublicGoodsContribution(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-5 gap-1 text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setPublicGoodsContribution(0)}
                      className="py-1.5 px-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-amber-300 border border-slate-700 cursor-pointer"
                    >
                      0 (Free-Ride)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublicGoodsContribution(3)}
                      className="py-1.5 px-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      3 pts
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublicGoodsContribution(5)}
                      className="py-1.5 px-0.5 bg-blue-900/50 hover:bg-blue-800/60 rounded text-[10px] font-bold text-blue-200 border border-blue-700/60 cursor-pointer"
                    >
                      5 (Half)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublicGoodsContribution(8)}
                      className="py-1.5 px-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      8 pts
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublicGoodsContribution(10)}
                      className="py-1.5 px-0.5 bg-emerald-900/50 hover:bg-emerald-800/60 rounded text-[10px] font-bold text-emerald-200 border border-emerald-700/60 cursor-pointer"
                    >
                      10 (All-in)
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublicGoodsSubmit(publicGoodsContribution)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Contribute {publicGoodsContribution} pts to Pool</span>
                  <span>➔</span>
                </button>
              </div>
            ) : (
              /* RESOLVED PUBLIC GOODS ROUND CARD */
              <div className="bg-slate-900 rounded-xl border border-emerald-800/60 p-4 shadow-sm space-y-3">
                <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-3 text-center space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Pool Multiplied (1.6×) & Cleared
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs pt-1 border-t border-emerald-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tokens Kept</span>
                      <strong className="font-mono tabular-nums text-slate-200 text-sm">{10 - Number(rData.myContribution)} pts</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block font-bold">Group Pot</span>
                      <strong className="font-mono tabular-nums text-emerald-200 text-sm">{rData.groupContributions} pts</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 block font-bold">Your Share</span>
                      <strong className="font-mono tabular-nums text-blue-200 text-sm">+{rData.groupReturn} pts</strong>
                    </div>
                  </div>
                  {results && (
                    <div className="pt-2 border-t border-emerald-800/60 text-center">
                      <span className="text-xs text-slate-400">Your Round Total: </span>
                      <strong className="font-mono tabular-nums text-emerald-300 text-base">{results["Your Score"]}</strong>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    flushRoundSave();
                    setActiveRoundNum(activeRoundNum + 1);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{activeRoundNum < totalRounds ? `Next Round (${activeRoundNum + 1})` : 'View Overall Results & Submit'}</span>
                  <span>➔</span>
                </button>
              </div>
            )
          ) : (
            /* DYNAMIC FORM FOR ANY OTHER CLASSROOM GAME */
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>{currentWeek.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">Round {activeRoundNum}</span>
              </div>

              {/* Step 1 Fields */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Step 1: Your Move {!rData.isStep1Locked ? '(Active)' : '✓ Locked'}
                </span>
                {currentWeek.fields.filter(f => f.step === 1).map(field => {
                  const currentVal = rData[field.id];
                  return (
                    <div key={field.id} className="space-y-1 text-xs">
                      <label className="font-semibold text-slate-700 block">{field.label}:</label>
                      {field.type === 'select' && field.options ? (
                        <div className="grid grid-cols-2 gap-1.5">
                          {field.options.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              disabled={rData.isStep1Locked}
                              onClick={() => {
                                onFieldChange(activeRoundNum, field.id, opt);
                                setLocalRoundData(prev => ({ ...prev, [field.id]: opt }));
                              }}
                              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                                currentVal === opt
                                  ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              } ${rData.isStep1Locked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="number"
                          disabled={rData.isStep1Locked}
                          value={currentVal !== undefined ? String(currentVal) : ''}
                          onChange={(e) => {
                            onFieldChange(activeRoundNum, field.id, e.target.value);
                            setLocalRoundData(prev => ({ ...prev, [field.id]: e.target.value }));
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
                        />
                      )}
                    </div>
                  );
                })}

                {!rData.isStep1Locked && (
                  <button
                    type="button"
                    onClick={handleGenericStep1Submit}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer mt-1"
                  >
                    Lock Step 1 Move ➔
                  </button>
                )}
              </div>

              {/* Step 2 Fields */}
              {rData.isStep1Locked && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                    Step 2: Partner / Counterpart Reveal {!rData.isStep2Locked ? '(Active)' : '✓ Resolved'}
                  </span>
                  {currentWeek.fields.filter(f => f.step === 2).map(field => {
                    const currentVal = rData[field.id];
                    return (
                      <div key={field.id} className="space-y-1 text-xs">
                        <label className="font-semibold text-slate-700 block">{field.label}:</label>
                        {field.type === 'select' && field.options ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {field.options.map(opt => (
                              <button
                                key={opt}
                                type="button"
                                disabled={rData.isStep2Locked}
                                onClick={() => {
                                  onFieldChange(activeRoundNum, field.id, opt);
                                  setLocalRoundData(prev => ({ ...prev, [field.id]: opt }));
                                }}
                                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                                  currentVal === opt
                                    ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                } ${rData.isStep2Locked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="number"
                            disabled={rData.isStep2Locked}
                            value={currentVal !== undefined ? String(currentVal) : ''}
                            onChange={(e) => {
                              onFieldChange(activeRoundNum, field.id, e.target.value);
                              setLocalRoundData(prev => ({ ...prev, [field.id]: e.target.value }));
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
                          />
                        )}
                      </div>
                    );
                  })}

                  {!rData.isStep2Locked ? (
                    <button
                      type="button"
                      onClick={handleGenericStep2Submit}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer mt-1"
                    >
                      Resolve & Lock Outcome ➔
                    </button>
                  ) : (
                    results && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1 mt-2">
                        <span className="font-bold text-emerald-800 block">Round Results:</span>
                        {Object.entries(results).map(([k, v]) => (
                          <div key={k} className="flex justify-between font-mono text-slate-700">
                            <span>{k}:</span>
                            <span className="font-bold text-emerald-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}

              {rData.isStep2Locked && (
                <button
                  type="button"
                  onClick={() => {
                    flushRoundSave();
                    setActiveRoundNum(activeRoundNum + 1);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  <span>{activeRoundNum < totalRounds ? `Next Round (${activeRoundNum + 1})` : 'View Overall Results & Submit'}</span>
                  <span> ➔</span>
                </button>
              )}
            </div>
          )}

          {/* History of Play at bottom of student screen */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>📜 History of Play</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({completedRounds.length} of {totalRounds} played)
                </span>
              </div>
              <div className="font-mono tabular-nums text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                Total: {cumulativePoints} pts
              </div>
            </div>

            {completedRounds.length === 0 ? (
              <div className="py-2.5 px-3 bg-slate-950/60 rounded-lg text-center text-[11px] text-slate-500 font-medium border border-slate-800/60">
                {isAuction
                  ? 'No auctions completed yet. Submit your sealed bid above to see your results.'
                  : 'No completed rounds yet. Make your choice above to record your first round.'}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {roundSummaries
                  .filter((item) => item.isCompleted)
                  .map((item) => {
                    const isCurrent = item.round === activeRoundNum;

                    if (isAuction) {
                      return (
                        <div
                          key={item.round}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-blue-950/40 border-blue-600/60'
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono tabular-nums font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                              R{item.round}
                            </span>
                            <div className="text-[11px] text-slate-400 truncate font-mono tabular-nums">
                              Val: <span className="font-bold text-white">{item.drawnValuation}</span> · Bid: <span className="font-bold text-blue-400">{item.myBid}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                item.isWinner
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.isWinner ? 'Won' : 'Outbid'}
                            </span>
                            <span
                              className={`font-mono tabular-nums font-bold text-[11px] min-w-[38px] text-right ${
                                item.profit > 0 ? 'text-emerald-400' : item.profit < 0 ? 'text-rose-400' : 'text-slate-400'
                              }`}
                            >
                              {item.profit > 0 ? `+${item.profit}` : item.profit} pts
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Prisoner's Dilemma row
                    return (
                      <div
                        key={item.round}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-blue-950/40 border-blue-600/60'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono tabular-nums font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                            R{item.round}
                          </span>
                          <span className="text-[11px] text-slate-300 truncate max-w-[105px] font-medium" title={item.partner}>
                            vs. {item.partner}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-[11px] font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                item.myChoice === 'Cooperate'
                                  ? 'bg-blue-900/60 text-blue-200 border border-blue-600/40'
                                  : 'bg-amber-900/60 text-amber-200 border border-amber-600/40'
                              }`}
                            >
                              {item.myChoice === 'Cooperate' ? 'Coop' : 'Defect'}
                            </span>
                            <span className="text-slate-500">:</span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                item.partnerChoice === 'Cooperate'
                                  ? 'bg-blue-900/60 text-blue-200 border border-blue-600/40'
                                  : 'bg-amber-900/60 text-amber-200 border border-amber-600/40'
                              }`}
                            >
                              {item.partnerChoice === 'Cooperate' ? 'Coop' : 'Defect'}
                            </span>
                          </div>

                          <span className="font-mono tabular-nums font-bold text-white text-[11px] min-w-[38px] text-right">
                            +{item.score.replace(/[^0-9]/g, '') || '0'} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* OVERALL RESULTS & REFLECTION SCREEN */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
          {/* Overall Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Session Complete
              </span>
              <h3 className="text-base font-extrabold text-white">
                Overall Results ({totalRounds} Rounds)
              </h3>
            </div>
            <button
              onClick={() => setActiveRoundNum(1)}
              className="text-xs text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Review R1
            </button>
          </div>

          {/* Cumulative Score Hero Badge */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-center space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {isAuction ? 'Total Auction Profit' : 'Total Points Earned'}
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono tabular-nums">
              {cumulativePoints} <span className="text-sm font-normal text-slate-400">points</span>
            </div>
            <div className="text-xs text-slate-400 font-medium pt-1">
              Average: <span className="font-mono tabular-nums font-bold text-white">{avgScore}</span> pts/round across {completedRounds.length} rounds
            </div>
          </div>

          {/* Strategy Breakdown Metrics */}
          {isAuction ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-blue-950/40 border border-blue-800/50 rounded-lg text-center">
                <span className="text-[10px] text-blue-300 font-bold uppercase block">Auctions Won</span>
                <span className="text-lg font-black text-blue-200 font-mono tabular-nums">
                  {auctionsWonCount} / {completedRounds.length}
                </span>
                <span className="text-[10px] text-blue-300/80 block mt-0.5">{winRate}% Win Rate</span>
              </div>

              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-center">
                <span className="text-[10px] text-emerald-300 font-bold uppercase block">Total Net Profit</span>
                <span className="text-lg font-black text-emerald-200 font-mono tabular-nums">{cumulativePoints} pts</span>
                <span className="text-[10px] text-emerald-300/80 block mt-0.5">Avg: {avgScore} pts/rd</span>
              </div>

              <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Avg Valuation Drawn</span>
                <span className="font-mono tabular-nums font-bold text-slate-200">
                  {completedRounds.length > 0 ? (sumValuations / completedRounds.length).toFixed(1) : '0'} pts
                </span>
              </div>

              <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Avg Bid Submitted</span>
                <span className="font-mono tabular-nums font-bold text-slate-200">
                  {completedRounds.length > 0 ? (sumBids / completedRounds.length).toFixed(1) : '0'} pts
                </span>
              </div>
            </div>
          ) : isPrisonersDilemma ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-blue-950/40 border border-blue-800/50 rounded-lg text-center">
                <span className="text-[10px] text-blue-300 font-bold uppercase block">Your Cooperation</span>
                <span className="text-lg font-black text-blue-200 font-mono tabular-nums">{myCoopPct}%</span>
                <span className="text-[10px] text-blue-300/80 block mt-0.5">{myCooperateCount} of {completedRounds.length} rounds</span>
              </div>

              <div className="p-2.5 bg-purple-950/40 border border-purple-800/50 rounded-lg text-center">
                <span className="text-[10px] text-purple-300 font-bold uppercase block">Partners Cooperation</span>
                <span className="text-lg font-black text-purple-200 font-mono tabular-nums">{partnerCoopPct}%</span>
                <span className="text-[10px] text-purple-300/80 block mt-0.5">{partnerCooperateCount} of {completedRounds.length} rounds</span>
              </div>

              <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Mutual Cooperation</span>
                <span className="font-mono tabular-nums font-bold text-slate-200">{mutualCoopCount} rounds</span>
              </div>

              <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Both Defected</span>
                <span className="font-mono tabular-nums font-bold text-slate-200">{mutualDefectCount} rounds</span>
              </div>
            </div>
          ) : null}

          {/* Full Round-by-Round History Table */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-1.5">
              Round-by-Round Breakdown:
            </span>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              {isAuction ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 font-medium border-b border-slate-800">
                      <th className="p-2">Rd</th>
                      <th className="p-2">Valuation</th>
                      <th className="p-2">Your Bid</th>
                      <th className="p-2">Price Paid</th>
                      <th className="p-2 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {roundSummaries.map((item) => (
                      <tr key={item.round} className={item.isCompleted ? '' : 'opacity-30'}>
                        <td className="p-2 font-mono tabular-nums font-bold text-white">R{item.round}</td>
                        <td className="p-2 font-mono tabular-nums font-bold text-white">{item.drawnValuation ?? '-'} pts</td>
                        <td className="p-2 font-mono tabular-nums font-bold text-blue-400">{item.myBid ?? '-'} pts</td>
                        <td className="p-2 font-mono tabular-nums text-slate-400">{item.clearingPrice ?? '-'} pts</td>
                        <td className={`p-2 text-right font-mono tabular-nums font-bold ${
                          item.profit > 0 ? 'text-emerald-400' : item.profit < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {item.isCompleted ? `${item.profit > 0 ? `+${item.profit}` : item.profit} pts` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 font-medium border-b border-slate-800">
                      <th className="p-2">Rd</th>
                      <th className="p-2">Opponent</th>
                      <th className="p-2">You</th>
                      <th className="p-2">Partner</th>
                      <th className="p-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {roundSummaries.map((item) => (
                      <tr key={item.round} className={item.isCompleted ? '' : 'opacity-30'}>
                        <td className="p-2 font-mono tabular-nums font-bold text-white">R{item.round}</td>
                        <td className="p-2 truncate max-w-[90px]">{item.partner}</td>
                        <td className={`p-2 font-mono font-bold ${
                          item.myChoice === 'Cooperate' ? 'text-blue-400' : 'text-amber-400'
                        }`}>
                          {item.myChoice.slice(0, 4)}
                        </td>
                        <td className={`p-2 font-mono font-bold ${
                          item.partnerChoice === 'Cooperate' ? 'text-blue-400' : 'text-amber-400'
                        }`}>
                          {item.partnerChoice.slice(0, 4)}
                        </td>
                        <td className="p-2 text-right font-mono tabular-nums font-bold text-white">
                          {item.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Reflection */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Strategic Experiment Reflection
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 h-20 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              placeholder={isAuction
                ? "What did you observe about bidding above, below, or equal to your valuation? Did you experience winner's curse or surplus?..."
                : isBeautyContest
                ? "What level of strategic reasoning did you apply? Did the class converge toward the Nash Equilibrium or stop at Level-1?..."
                : isPublicGoods
                ? "Did the group manage to sustain high contributions, or did free-riding undermine cooperation over the rounds?..."
                : "What did you observe about cooperation, defection, and strategy in today's game?..."
              }
              value={localReflection}
              onChange={(e) => {
                setLocalReflection(e.target.value);
                scheduleReflectionSave(e.target.value);
              }}
            />
          </div>

          {/* Copy Submission Button */}
          <button
            onClick={() => {
              flushRoundSave();
              flushReflectionSave();
              onCopySubmission();
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            📋 Copy Complete Submission ({totalRounds} Rds + Total)
          </button>

          {copyStatus && (
            <div className={`p-2 rounded-lg text-xs font-bold text-center ${
              copyStatus.includes('Failed') ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {copyStatus}
            </div>
          )}

          {/* Fresh Trial Actions on Summary Screen */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
              Experiment Trials & Sandbox
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAutoPlayAllRounds}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Generate another full 6-round random trial"
              >
                <span>🎲</span>
                <span>Simulate Fresh Trial</span>
              </button>
              <button
                type="button"
                onClick={handleResetCurrentTrial}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Clear rounds and play again from Round 1"
              >
                <span>🔄</span>
                <span>Start Blank Trial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom Game Switcher Modal Drawer */}
      {isGamePickerOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-700 shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  Game Theory Lab
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Choose a Classroom Game
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGamePickerOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {Array.from(new Set(allWeeks.map(g => g.category || 'Classroom Games'))).map(cat => {
                const catGames = allWeeks.filter(g => (g.category || 'Classroom Games') === cat);
                return (
                  <div key={cat} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                      {cat}
                    </span>
                    <div className="space-y-1">
                      {catGames.map(game => {
                        const isCurrent = currentWeek.id === game.id;
                        return (
                          <button
                            key={game.id}
                            type="button"
                            onClick={() => {
                              if (onSelectWeek) onSelectWeek(game.id);
                              setIsGamePickerOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 border ${
                              isCurrent
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                            }`}
                          >
                            <span className="text-2xl shrink-0 mt-0.5">{game.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs sm:text-sm">
                                  {game.shortTitle || game.title}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className={`text-[11px] mt-0.5 leading-snug ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                                {game.keyTakeaway || game.purpose}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
