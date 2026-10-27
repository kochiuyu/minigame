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

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  currentWeek,
  onSelectWeek,
  allWeeks,
  currentRound,
  onSelectRound,
  totalRounds,
  onSetTotalRounds
}) => {
  const [roomCode] = useState('DOTE-3090');
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [instructorTrueValue, setInstructorTrueValue] = useState('14');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeMessage, setActiveMessage] = useState('Welcome! Please lock your Step 1 choices on count of three.');
  const [showProjectorMode, setShowProjectorMode] = useState(false);
  const [showDebriefSandbox, setShowDebriefSandbox] = useState(false);
  const [trialSeed, setTrialSeed] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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
    }
  };

  // Dynamic Auction Students for Live Roster & CSV
  const auctionStudents = useMemo(() => {
    const rawRoster = [
      { id: '3090101', name: 'Alex Rivera', alias: 'AlphaStrategist' },
      { id: '3090102', name: 'Morgan Chen', alias: 'ShadowFox' },
      { id: '3090103', name: 'Jordan Taylor', alias: 'GameFox' },
      { id: '3090104', name: 'Sam Patel', alias: 'VickreyAce' },
      { id: '3090105', name: 'Taylor Brooks', alias: 'CleverFalcon' },
      { id: '3090106', name: 'Casey Patel', alias: 'QuantumWolf' },
      { id: '3090107', name: 'Riley Zhang', alias: 'SolarOtter' },
      { id: '3090108', name: 'Avery Morales', alias: 'BrightLynx' }
    ];

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
  }, [trialSeed, currentRound, currentWeek.id]);

  // Dynamic Dyads for Repeated Games
  const dyadPairs = useMemo(() => {
    return [
      {
        table: 'Pair #1',
        p1: 'Alex R. (TheStrategist)',
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
        p2: 'Jamie D. (SilentWolf)',
        trajectory: '[D,D] · [D,D] · [D,D]',
        trustStatus: 'Defection Trap',
        score1: currentRound,
        score2: currentRound,
        c1: 'Defect',
        c2: 'Defect'
      }
    ];
  }, [trialSeed, currentRound]);

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
      rows = dyadPairs.map((d, idx) => {
        return `309010${idx + 1},"${d.p1.split(' ')[0]}","${d.p1}","${currentWeek.title}",${currentRound},Completed,${d.c1},${d.c2},${d.score1}`;
      });
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "StudentID,Name,Alias,Topic,Round,Status,Choice,PartnerChoice,Score\n" +
        rows.join("\n") + "\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `DOTE3090_Trial${trialSeed}_Game_Round${currentRound}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ==========================================
  // PROJECTOR FULL-SCREEN PRESENTATION MODE
  // ==========================================
  if (showProjectorMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0F17] text-slate-100 overflow-y-auto font-sans p-6 lg:p-10 flex flex-col justify-between">
        {/* Projector Header Bar */}
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

            {/* Room Code Callout & Action Controls */}
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
                  >
                    ◀
                  </button>
                  <span className="px-2 font-bold text-white tabular-nums">
                    Round {currentRound} / {totalRounds}
                  </span>
                  <button
                    onClick={handleNextRound}
                    className="px-2.5 py-1 text-slate-400 hover:text-white cursor-pointer"
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

          {/* Active Class Notice Banner */}
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

        {/* Projector Body Grid: 2 Columns */}
        <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Live Class Aggregate Distribution */}
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

            {/* Distribution Charts */}
            {currentWeek.id === 6 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl">
                    <span className="text-purple-300 text-xs font-medium block mb-1">Mutual Trust (C, C)</span>
                    <span className="text-2xl font-black font-mono tabular-nums text-purple-200">68%</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <span className="text-amber-400 text-xs font-medium block mb-1">Defected / Retaliated</span>
                    <span className="text-2xl font-black font-mono tabular-nums text-amber-300">18%</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <span className="text-slate-400 text-xs font-medium block mb-1">Punishment Trap (D, D)</span>
                    <span className="text-2xl font-black font-mono tabular-nums text-slate-300">14%</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-purple-300 font-bold">Mutual Cooperation (C, C)</span>
                      <span className="font-mono tabular-nums text-white">19 Dyads (68%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-amber-300 font-bold">Unilateral Defection (D, C) / (C, D)</span>
                      <span className="font-mono tabular-nums text-white">5 Dyads (18%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '18%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Mutual Defection Trap (D, D)</span>
                      <span className="font-mono tabular-nums text-white">4 Dyads (14%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full transition-all" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-purple-400 font-bold">Classroom Debrief:</span> Under indefinite repeated interactions, Tit-for-Tat and Grim Trigger enforce cooperative equilibrium through credible deterrence ("shadow of the future").
                </div>
              </div>
            ) : currentWeek.id === 7 || currentWeek.id === 8 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl">
                    <span className="text-blue-300 text-xs font-medium block mb-1">Truthful Bidding (b = v)</span>
                    <span className="text-2xl font-black font-mono tabular-nums text-blue-200">61%</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <span className="text-slate-400 text-xs font-medium block mb-1">Underbidding (b &lt; v)</span>
                    <span className="text-2xl font-black font-mono tabular-nums text-slate-300">25%</span>
                  </div>
                  <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl">
                    <span className="text-amber-400 text-xs font-medium block mb-1">Overbidding (b &gt; v)</span>
                    <span className="text-2xl font-black font-mono tabular-nums text-amber-300">14%</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-blue-400 font-bold">Truthful Bids (Weakly Dominant Strategy)</span>
                      <span className="font-mono tabular-nums text-white">17 Students (61%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: '61%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Shaded Bids (Foregone Profitable Wins)</span>
                      <span className="font-mono tabular-nums text-white">7 Students (25%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full transition-all" style={{ width: '25%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-amber-400 font-bold">Overbids (Negative Profit Risk)</span>
                      <span className="font-mono tabular-nums text-white">4 Students (14%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-blue-400 font-bold">Classroom Debrief:</span> In Vickrey auctions, bidding b = v is weakly dominant. Bidding higher never lowers the price you pay when winning, but causes severe losses if clearing price exceeds v.
                </div>
              </div>
            ) : currentWeek.id === 11 ? (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Level-0 (~50 · Random / Centered)</span>
                      <span className="font-mono tabular-nums text-white">6 Students (21%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: '21%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-indigo-400 font-bold">Level-1 (~33.3 · 2/3 of 50)</span>
                      <span className="font-mono tabular-nums text-white">14 Students (50%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-purple-400 font-bold">Level-2 (~22.2 · 2/3 of 33)</span>
                      <span className="font-mono tabular-nums text-white">6 Students (21%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '21%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-emerald-400 font-bold">Nash Equilibrium (0 · Iterative Elimination)</span>
                      <span className="font-mono tabular-nums text-white">2 Students (8%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-bold">Keynes' Lesson:</span> "It is not a question of choosing which faces are prettiest, but what average opinion expects average opinion to be."
                </div>
              </div>
            ) : currentWeek.id === 12 ? (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-emerald-400 font-bold">Altruistic Contributors (8–10 pts)</span>
                      <span className="font-mono tabular-nums text-white">11 Students (39%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '39%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-blue-400 font-bold">Conditional Cooperators (4–7 pts)</span>
                      <span className="font-mono tabular-nums text-white">12 Students (43%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '43%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span className="text-amber-400 font-bold">Free-Riders (0–3 pts)</span>
                      <span className="font-mono tabular-nums text-white">5 Students (18%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '18%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">Classroom Debrief:</span> Public Goods decay over rounds without punishment or communication, demonstrating social dilemmas in climate agreements and public funding.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Cooperate (Work Together)</span>
                    <span className="font-mono tabular-nums text-white">18 Students (64%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Defect (Nash Equilibrium)</span>
                    <span className="font-mono tabular-nums text-white">10 Students (36%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '36%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: What-If Sandbox or Live Cohort Table */}
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
                    Round {currentRound} Leaderboard
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

        {/* Projector Footer Info */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>MobLab-Style Classroom Experiment Simulator · Real-time Dynamic Trial Seed #{trialSeed}</span>
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
      {/* MobLab Instructor Header Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                Instructor Console
              </span>
              <span className="text-xs text-slate-400">
                Session Code: <span className="font-mono text-white font-bold text-sm tracking-widest">{roomCode}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{currentWeek.title}</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateFreshCohortTrial}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="Generate a fresh randomized trial for this round"
            >
              <span>🎲</span>
              <span>Fresh Random Trial</span>
            </button>
            <button
              onClick={() => setShowDebriefSandbox(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                showDebriefSandbox
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-900/60'
              }`}
              title="Toggle interactive What-If simulation sandbox"
            >
              <span className="font-mono">∫</span>
              <span>{showDebriefSandbox ? 'Hide Debrief' : 'Debrief Sandbox'}</span>
            </button>
            <button
              onClick={() => setIsSessionActive(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isSessionActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isSessionActive ? '● Session Live' : '❚❚ Paused'}
            </button>
            <button
              onClick={() => setShowProjectorMode(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              📺 Projector View
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Live Cohort Status Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Connected Students</span>
            <span className="text-base font-bold text-white font-mono tabular-nums">{activeOnline} / {totalEnrolled} Online</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Active Dyads / Groups</span>
            <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">{pairsMatched} Matched</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Classroom Pace & Rounds</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                onClick={handlePrevRound}
                disabled={currentRound <= 1}
                className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-40"
              >
                ◀
              </button>
              <span className="font-bold text-white font-mono tabular-nums">
                Round {currentRound} of {totalRounds}
              </span>
              <button
                onClick={handleNextRound}
                className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700"
                title="Advance round or add next round"
              >
                ▶
              </button>
              <button
                onClick={() => onSetTotalRounds(totalRounds + 1)}
                className="px-1.5 py-0.5 bg-blue-700 hover:bg-blue-600 rounded text-[10px] font-bold text-white ml-1"
                title="Add an extra round"
              >
                +1 Rd
              </button>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Classroom Game / Experiment</span>
            <select
              value={currentWeek.id}
              onChange={(e) => onSelectWeek(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 w-full font-medium"
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

      {/* Trial Notification Banner */}
      {toastMsg && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white hover:text-purple-200 text-sm font-bold ml-2">×</button>
        </div>
      )}

      {/* Broadcast Message Banner */}
      {activeMessage && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-400 text-[10px] px-1.5 py-0.5 bg-amber-500/20 rounded">
              NOTICE
            </span>
            <span className="font-medium">{activeMessage}</span>
          </div>
          <button
            onClick={() => setActiveMessage('')}
            className="text-amber-400 hover:text-amber-200 font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Embedded What-If Lecture Debrief Sandbox (When toggled on) */}
      {showDebriefSandbox && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              ∫ Dynamic Payoff Curve Debrief Simulator
            </span>
            <button
              onClick={() => setShowDebriefSandbox(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close Sandbox ✕
            </button>
          </div>
          <WhatIfSandbox game={currentWeek} />
        </div>
      )}

      {/* Main Grid: Live Analytics & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Live Distribution & Real-time Class Aggregate */}
        <div className="lg:col-span-2 space-y-5">
          {/* Class Aggregate Chart */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Live Classroom Choices Distribution</h3>
                <p className="text-xs text-slate-400">Real-time aggregate data for Round {currentRound}</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                {activeOnline} Submissions Tracked
              </span>
            </div>

            {/* Simulated Distribution Bars */}
            {currentWeek.id === 6 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                  <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-lg">
                    <span className="text-purple-300 block mb-0.5 text-[11px] font-bold uppercase">Mutual Trust</span>
                    <span className="text-base font-bold font-mono tabular-nums text-purple-200">19 Pairs (68%)</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Trigger Fired</span>
                    <span className="text-base font-bold font-mono tabular-nums text-amber-400">9 Pairs (32%)</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Avg Cooperation</span>
                    <span className="text-base font-bold font-mono tabular-nums text-emerald-400">74%</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Strategy Model</span>
                    <span className="text-xs font-bold text-slate-200">Tit-for-Tat</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <span className="font-bold text-slate-300 block text-xs">
                    Dyad Dynamic in Round {currentRound} (Same Partner Relationship):
                  </span>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-purple-300 font-bold">Mutual Cooperation (C, C)</span>
                      <span className="font-mono tabular-nums">19 Pairs (68%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-300">Unilateral Defection (D, C) / (C, D)</span>
                      <span className="font-mono tabular-nums">5 Pairs (18%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-slate-400">Mutual Punishment Trap (D, D)</span>
                      <span className="font-mono tabular-nums">4 Pairs (14%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 mt-2">
                  <span className="font-bold text-purple-400">Pedagogical Insight:</span> In Repeated Games with fixed partners, cooperation rates (~70%) are dramatically higher than in One-Shot stranger matching (~35%). Axelrod's tournaments showed that responsive strategies sustain the cooperative equilibrium through the &quot;shadow of the future&quot; (Folk Theorem).
                </div>
              </div>
            ) : currentWeek.id === 1 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Cooperate (Work Together)</span>
                    <span className="font-mono tabular-nums">18 Students (64%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: '64%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Defect (Betray / Nash Trap)</span>
                    <span className="font-mono tabular-nums">10 Students (36%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '36%' }}></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 mt-2">
                  <span className="font-bold text-blue-400">Pedagogical Insight:</span> In Round 1, class cooperation typically exceeds 60%. As rounds progress toward Round 6 with rotating partners (stranger matching), defection rates escalate towards the Nash Equilibrium.
                </div>
              </div>
            ) : currentWeek.id === 7 || currentWeek.id === 8 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                  <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Avg Drawn Value</span>
                    <span className="text-base font-bold font-mono tabular-nums text-slate-200">5.5 pts</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Avg Class Bid</span>
                    <span className="text-base font-bold font-mono tabular-nums text-blue-400">5.2 pts</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Avg Profit Won</span>
                    <span className="text-base font-bold font-mono tabular-nums text-emerald-400">+1.8 pts</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Pricing Rule</span>
                    <span className="text-xs font-bold text-slate-200">
                      {currentWeek.id === 7 ? '2nd Highest' : '1st Highest'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <span className="font-bold text-slate-300 block text-xs">
                    Class Bidding vs. Drawn Valuation (b vs. v):
                  </span>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-blue-400 font-bold">Truthful Bidding (b = v)</span>
                      <span className="font-mono tabular-nums">17 Students (61%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '61%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-slate-400">Shading / Underbidding (b &lt; v)</span>
                      <span className="font-mono tabular-nums">7 Students (25%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-400">Overbidding (b &gt; v · Risk of Loss)</span>
                      <span className="font-mono tabular-nums">4 Students (14%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 mt-2">
                    <span className="font-bold text-blue-400">Pedagogical Insight:</span> In a Second-Price Auction with private values drawn uniformly from [1, 10], bidding your exact valuation is weakly dominant. Bids can be any number.
                  </div>
                </div>
              </div>
            ) : currentWeek.id === 11 ? (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-slate-400 font-bold">Level-0 Reasoning (~50, Random / Unanchored)</span>
                      <span className="font-mono tabular-nums">6 Students (21%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: '21%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-indigo-400 font-bold">Level-1 Reasoning (~33, 2/3 of 50)</span>
                      <span className="font-mono tabular-nums">14 Students (50%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-purple-400 font-bold">Level-2 Reasoning (~22, 2/3 of 33)</span>
                      <span className="font-mono tabular-nums">6 Students (21%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '21%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-emerald-400 font-bold">Nash / Deep Reasoning (&lt; 15)</span>
                      <span className="font-mono tabular-nums">2 Students (8%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 mt-2">
                  <span className="font-bold text-indigo-400">Pedagogical Insight:</span> Most human players stop at Level-1 (guessing ~33) or Level-2 (guessing ~22). The Nash Equilibrium is 0, but guessing 0 loses when peers are Level-1 or Level-2!
                </div>
              </div>
            ) : currentWeek.id === 12 ? (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-emerald-400 font-bold">High Contribution (8–10 pts · Altruistic)</span>
                      <span className="font-mono tabular-nums">11 Students (39%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '39%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-blue-400 font-bold">Conditional Cooperators (4–7 pts · Moderate)</span>
                      <span className="font-mono tabular-nums">12 Students (43%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '43%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="text-amber-400 font-bold">Free-Riders (0–3 pts · Selfish Profit Max)</span>
                      <span className="font-mono tabular-nums">5 Students (18%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 mt-2">
                  <span className="font-bold text-emerald-400">Pedagogical Insight:</span> Without punishment mechanisms, contributions in the Public Goods Game typically start around 50–60% of endowment and decay towards zero in later rounds as conditional cooperators notice free-riding.
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950/60 rounded-lg border border-slate-800 text-center text-xs text-slate-400">
                <p className="font-bold text-slate-200 mb-1">Live Experiment Telemetry</p>
                <p>Tracking submissions and strategy distribution for {currentWeek.title}.</p>
              </div>
            )}
          </div>

          {/* Connected Roster Preview */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-3">
              {currentWeek.id === 7 || currentWeek.id === 8 ? 'Live Auction Bidder Standings' : 'Live Roster & Dyad Status'}
            </h3>
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
              ) : currentWeek.id === 6 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-2">Table / Pair</th>
                      <th className="pb-2">Fixed Dyad</th>
                      <th className="pb-2">Trajectory (Rounds 1–{currentRound})</th>
                      <th className="pb-2">Trust Status</th>
                      <th className="pb-2 text-right">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
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
                          {p.score1} pts : {p.score2} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-2">Table / Pair</th>
                      <th className="pb-2">Player 1</th>
                      <th className="pb-2">Player 2</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Round {currentRound} Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="py-2.5 font-bold text-white">Pair #1</td>
                      <td className="py-2.5">Alex R. (TheStrategist)</td>
                      <td className="py-2.5">Morgan C. (ShadowFox)</td>
                      <td className="py-2.5"><span className="text-emerald-400 font-bold">● Completed</span></td>
                      <td className="py-2.5 text-right font-mono tabular-nums font-bold text-white">2 pts : 2 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-white">Pair #2</td>
                      <td className="py-2.5">Jordan T. (GameFox)</td>
                      <td className="py-2.5">Sam P. (VickreyAce)</td>
                      <td className="py-2.5"><span className="text-emerald-400 font-bold">● Completed</span></td>
                      <td className="py-2.5 text-right font-mono tabular-nums font-bold text-white">3 pts : 0 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-white">Pair #3</td>
                      <td className="py-2.5">Casey L. (QuietOwl)</td>
                      <td className="py-2.5">Taylor B. (MatrixWolf)</td>
                      <td className="py-2.5"><span className="text-amber-400 font-bold">◐ Step 1 Locked</span></td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-500">Pending...</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-white">Pair #4</td>
                      <td className="py-2.5">Chris M. (AlphaMove)</td>
                      <td className="py-2.5">Jamie D. (PayoffHunter)</td>
                      <td className="py-2.5"><span className="text-slate-500 font-bold">○ Deciding</span></td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-500">Pending...</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right col: Instructor Controls Deck */}
        <div className="space-y-5">
          {/* Week 8 Special Reveal Controls */}
          {currentWeek.id === 8 && (
            <div className="bg-purple-950/40 rounded-xl border border-purple-800/60 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-purple-200 mb-1">True Value Reveal</h3>
              <p className="text-xs text-purple-300/80 mb-3">
                Students in Week 8 must enter this True Value post-round to compute Winner's Curse.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-1">Set Item True Value ($)</label>
                  <input
                    type="number"
                    value={instructorTrueValue}
                    onChange={(e) => setInstructorTrueValue(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-700/80 rounded-lg p-2 font-mono tabular-nums font-bold text-purple-200"
                  />
                </div>
                <button
                  onClick={() => setActiveMessage(`The True Item Value is officially revealed: $${instructorTrueValue}! Enter it into your Post-Round reveal field.`)}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  📢 Broadcast True Value (${instructorTrueValue})
                </button>
              </div>
            </div>
          )}

          {/* Quick Announcement Broadcast */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2">Class Announcement</h3>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Send a prompt or instructions to all students..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none font-medium"
              ></textarea>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Send Notice
              </button>
            </form>
          </div>

          {/* Session Configuration & Teaching Tips */}
          <div className="bg-slate-900/70 rounded-xl border border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-blue-300 mb-2">Teaching Discussion Prompt</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
              Ask students: "Why was cooperating so difficult even though (2,2) is strictly superior to (1,1)? What contract or repeated interaction could alter the outcome?"
            </p>
            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              <span className="font-bold text-slate-300">Recommended Experiment:</span> Repeated Trust (Week 6) or Keynesian Beauty Contest (Week 11) to illustrate higher-order expectations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
