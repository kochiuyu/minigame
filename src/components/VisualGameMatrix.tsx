import React from 'react';
import { GameConfig, RoundData } from '../types';

interface VisualGameMatrixProps {
  week: GameConfig;
  currentRoundData?: RoundData;
  history?: {
    round: number;
    partner: string;
    myChoice: string;
    partnerChoice: string;
    score: string;
    isCompleted: boolean;
  }[];
}

export const VisualGameMatrix: React.FC<VisualGameMatrixProps> = ({ week, currentRoundData = {} }) => {
  // 1. One-Shot Prisoner's Dilemma
  if (week.id === 1) {
    const myChoice = currentRoundData.myChoice;
    const partnerChoice = currentRoundData.partnerChoice;
    const isLocked = currentRoundData.isStep2Locked;

    const cells = [
      { row: 'Cooperate', col: 'Cooperate', myPts: 2, partnerPts: 2 },
      { row: 'Cooperate', col: 'Defect', myPts: 0, partnerPts: 3 },
      { row: 'Defect', col: 'Cooperate', myPts: 3, partnerPts: 0 },
      { row: 'Defect', col: 'Defect', myPts: 1, partnerPts: 1 }
    ];

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-white tracking-tight block">One-Shot Normal-Form Matrix</span>
            <span className="text-[10px] text-slate-400">Rotating counterpart · Payoff format (You, Partner)</span>
          </div>
          <span className="text-[11px] font-mono text-sky-400">
            Nash: (1, 1)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="p-1 font-mono font-bold text-slate-500 text-[10px] flex items-center justify-center">
            You \ Partner
          </div>
          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px]">
            Cooperate
          </div>
          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px]">
            Defect
          </div>

          {/* Row 1: Cooperate */}
          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px] flex items-center justify-center">
            Cooperate
          </div>
          {cells.slice(0, 2).map((cell) => {
            const isActive = isLocked && myChoice === cell.row && partnerChoice === cell.col;
            return (
              <div
                key={`${cell.row}-${cell.col}`}
                className={`py-2 px-1 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-blue-600/90 text-white border-blue-400 ring-2 ring-blue-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-mono text-sm font-bold tabular-nums">
                  ({cell.myPts}, {cell.partnerPts})
                </div>
              </div>
            );
          })}

          {/* Row 2: Defect */}
          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px] flex items-center justify-center">
            Defect
          </div>
          {cells.slice(2, 4).map((cell) => {
            const isActive = isLocked && myChoice === cell.row && partnerChoice === cell.col;
            return (
              <div
                key={`${cell.row}-${cell.col}`}
                className={`py-2 px-1 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-blue-600/90 text-white border-blue-400 ring-2 ring-blue-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-mono text-sm font-bold tabular-nums">
                  ({cell.myPts}, {cell.partnerPts})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Repeated Trust Game & Reactive Trigger Strategies
  if (week.id === 6) {
    const myChoice = currentRoundData.myChoice;
    const partnerChoice = currentRoundData.partnerChoice;
    const isLocked = currentRoundData.isStep2Locked;
    const partnerName = String(currentRoundData.partnerAlias1 || 'Fixed Partner');

    const cells = [
      { row: 'Cooperate', col: 'Cooperate', myPts: 2, partnerPts: 2, label: 'Mutual Cooperation' },
      { row: 'Cooperate', col: 'Defect', myPts: 0, partnerPts: 3, label: "Sucker's Payoff" },
      { row: 'Defect', col: 'Cooperate', myPts: 3, partnerPts: 0, label: 'Temptation' },
      { row: 'Defect', col: 'Defect', myPts: 1, partnerPts: 1, label: 'Punishment' }
    ];

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 sm:p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-white tracking-tight">Repeated Stage Game: {partnerName}</span>
            <div className="text-[10px] text-slate-400">
              Fixed dyad · Actions build reputation and trigger strategic retaliation
            </div>
          </div>
          <span className="text-[11px] font-mono text-purple-400 font-bold">
            Shadow of Future
          </span>
        </div>

        {/* Stage Payoff Matrix */}
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="p-1 font-mono font-bold text-slate-500 text-[10px] flex items-center justify-center">
            You \ Partner
          </div>
          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px]">
            Cooperate (C)
          </div>
          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px]">
            Defect (D)
          </div>

          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px] flex items-center justify-center">
            Cooperate (C)
          </div>
          {cells.slice(0, 2).map((cell) => {
            const isActive = isLocked && myChoice === cell.row && partnerChoice === cell.col;
            return (
              <div
                key={`${cell.row}-${cell.col}`}
                className={`py-2 px-1 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-purple-600/90 text-white border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-mono text-sm font-bold tabular-nums">
                  ({cell.myPts}, {cell.partnerPts})
                </div>
              </div>
            );
          })}

          <div className="p-1.5 font-bold text-slate-300 bg-slate-800/80 rounded-lg text-[11px] flex items-center justify-center">
            Defect (D)
          </div>
          {cells.slice(2, 4).map((cell) => {
            const isActive = isLocked && myChoice === cell.row && partnerChoice === cell.col;
            return (
              <div
                key={`${cell.row}-${cell.col}`}
                className={`py-2 px-1 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-purple-600/90 text-white border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-mono text-sm font-bold tabular-nums">
                  ({cell.myPts}, {cell.partnerPts})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Second-Price & First-Price Sealed-Bid Auctions
  if (week.id === 7 || week.id === 8) {
    const isSecondPrice = week.id === 7;
    const drawnVal = currentRoundData.drawnValuation;

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              {isSecondPrice ? 'Second-Price Sealed-Bid (Vickrey) Auction' : 'First-Price Sealed-Bid Auction'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isSecondPrice
                ? 'Dominant strategy truthful bidding · Winner pays 2nd highest bid'
                : 'Bid shading trade-off · Winner pays own bid'}
            </p>
          </div>
          <span className="text-[11px] font-mono text-sky-400 font-bold">
            {isSecondPrice ? 'P = b₂' : 'P = b₁'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-sky-400 block mb-0.5">Your Private Value (v)</span>
            <span className="font-mono text-xl font-extrabold text-white tabular-nums">
              {drawnVal ? `${drawnVal} pts` : 'Draws 1–10 pts'}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Uniform [1 to 10]</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Price Paid if Won</span>
            <span className="font-mono text-xl font-extrabold text-white tabular-nums">
              {isSecondPrice ? '2nd Highest Bid' : 'Your Winning Bid'}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Bids can be any number</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Keynesian Beauty Contest (2/3 of Average)
  if (week.id === 11) {
    const myGuess = currentRoundData.myGuess;
    const classAvg = currentRoundData.classAverage;
    const target = currentRoundData.targetValue;
    const isLocked = currentRoundData.isStep2Locked;

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div>
            <h3 className="font-extrabold text-white tracking-tight">Keynesian Beauty Contest</h3>
            <p className="text-[10px] text-slate-400">Target = 2/3 × (Cohort Average) · Closest guess wins 5 pts</p>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 font-bold">
            Target = ⅔ μ
          </span>
        </div>

        {/* Cognitive Depth Spectrum */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5 text-[11px]">
          <div className="flex justify-between font-bold text-slate-300">
            <span>Cognitive Reasoning Hierarchy:</span>
            <span className="text-indigo-400 font-mono">Nash Eq = 0</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Level-0</span>
              <strong className="text-slate-300">50</strong>
              <span className="text-[9px] text-slate-500 block">Random</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-indigo-400 block">Level-1</span>
              <strong className="text-indigo-200">33.3</strong>
              <span className="text-[9px] text-slate-500 block">2/3 of 50</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-purple-400 block">Level-2</span>
              <strong className="text-purple-200">22.2</strong>
              <span className="text-[9px] text-slate-500 block">2/3 of 33</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/20">
              <span className="text-emerald-400 block">Nash Eq</span>
              <strong className="text-emerald-300">0</strong>
              <span className="text-[9px] text-slate-500 block">Infinite</span>
            </div>
          </div>
        </div>

        {isLocked && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-sky-400 font-bold uppercase block">Your Guess</span>
              <span className="font-mono text-base font-bold text-white tabular-nums">{myGuess ?? '-'}</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Class Avg</span>
              <span className="font-mono text-base font-bold text-slate-300 tabular-nums">{classAvg ?? '-'}</span>
            </div>
            <div className="p-2 bg-slate-950 border border-indigo-900/60 rounded-lg">
              <span className="text-[10px] text-indigo-400 font-bold uppercase block">Target (2/3)</span>
              <span className="font-mono text-base font-bold text-indigo-300 tabular-nums">{target ?? '-'}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. Public Goods Game (Free-Rider Dilemma)
  if (week.id === 12) {
    const myContr = currentRoundData.myContribution !== undefined ? Number(currentRoundData.myContribution) : 5;
    const groupContr = currentRoundData.groupContributions;
    const groupReturn = currentRoundData.groupReturn;
    const isLocked = currentRoundData.isStep2Locked;

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div>
            <h3 className="font-extrabold text-white tracking-tight">Public Goods Game (4 Players)</h3>
            <p className="text-[10px] text-slate-400">Endowment = 10 pts · Multiplier = 1.6× · Split Equally</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            Multiplier: 1.6×
          </span>
        </div>

        {/* Visual Allocation Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-300">
            <span>Endowment: 10 pts</span>
            <span>
              Keep: <strong className="text-white font-mono">{10 - myContr} pts</strong> | Pool: <strong className="text-emerald-400 font-mono">{myContr} pts</strong>
            </span>
          </div>
          <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(myContr / 10) * 100}%` }}
              title={`Contributed: ${myContr} pts`}
            />
            <div
              className="bg-slate-700 h-full transition-all duration-300"
              style={{ width: `${((10 - myContr) / 10) * 100}%` }}
              title={`Kept: ${10 - myContr} pts`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 contributed</span>
            <span className="text-emerald-400 font-bold">Group Pool (1.6×)</span>
            <span>10 contributed</span>
          </div>
        </div>

        {isLocked && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Kept Private</span>
              <span className="font-mono text-base font-bold text-white tabular-nums">{10 - myContr} pts</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Group Pool</span>
              <span className="font-mono text-base font-bold text-emerald-300 tabular-nums">{groupContr ?? (myContr * 4)} pts</span>
            </div>
            <div className="p-2 bg-slate-950 border border-sky-900/60 rounded-lg">
              <span className="text-[10px] text-sky-400 font-bold uppercase block">Your Payout</span>
              <span className="font-mono text-base font-bold text-sky-300 tabular-nums">+{groupReturn ?? ((myContr * 4 * 1.6 / 4).toFixed(1))} pts</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. Split-the-Pie Bargaining
  if (week.id === 9) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">Bargaining Pie Allocation</h3>
            <p className="text-[10px] text-slate-400">Total Pie = 10 pts. Demands sum &gt; 10 triggers breakdown (1 pt outside option).</p>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold">Pie: 10 pts</span>
        </div>

        <div className="h-5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div className="bg-blue-600 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: '50%' }}>
            Your Demand
          </div>
          <div className="bg-amber-600 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: '50%' }}>
            Partner Demand
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0 pts</span>
          <span>50/50 Fair Split (5, 5)</span>
          <span>10 pts Total Limit</span>
        </div>
      </div>
    );
  }

  // Default clean card for other classroom games
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">{week.title}</h3>
          <p className="text-xs text-slate-400">{week.strategies}</p>
        </div>
        <span className="text-xs font-mono text-sky-400">
          {week.shortTitle || week.title}
        </span>
      </div>
      <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <span className="font-bold text-slate-200 block mb-0.5">Payoff Matrix / Rule:</span>
        <span className="font-mono text-[11px] text-slate-400">{week.payoffs}</span>
      </div>
    </div>
  );
};
