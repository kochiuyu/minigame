import React, { useState } from 'react';
import { GameConfig } from '../types';

interface WhatIfSandboxProps {
  game: GameConfig;
  initialValuation?: number;
  initialBid?: number;
  onApplyScenario?: (values: Record<string, number | string>) => void;
}

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({
  game,
  initialValuation = 7,
  initialBid = 7,
  onApplyScenario
}) => {
  // Auction Sandbox State
  const isAuction = game.id === 7 || game.id === 8;
  const isSecondPrice = game.id === 7;
  const [val, setVal] = useState<number>(initialValuation);
  const [myBid, setMyBid] = useState<number>(initialBid);
  const [competitorBid, setCompetitorBid] = useState<number>(6);

  // Beauty Contest Sandbox State
  const isBeautyContest = game.id === 11;
  const [beautyGuess, setBeautyGuess] = useState<number>(33);
  const [assumedClassAvg, setAssumedClassAvg] = useState<number>(45);

  // Public Goods Sandbox State
  const isPublicGoods = game.id === 12;
  const [myContr, setMyContr] = useState<number>(5);
  const [peerAvgContr, setPeerAvgContr] = useState<number>(4);

  // Repeated Game Sandbox State
  const isRepeatedOrPD = game.id === 1 || game.id === 6;
  const [myStrategy, setMyStrategy] = useState<'TFT' | 'ALL_C' | 'ALL_D' | 'GRIM'>('TFT');
  const [opponentStrategy, setOpponentStrategy] = useState<'TFT' | 'ALL_C' | 'ALL_D' | 'RANDOM' | 'GRIM'>('TFT');

  // Centipede Game Sandbox State
  const isCentipede = game.id === 20;
  const [centipedePassProb, setCentipedePassProb] = useState<number>(65);

  // SVG dimensions for graphs
  const width = 360;
  const height = 140;
  const padding = 28;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4 font-sans text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
            ∫
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>What-If Sandbox</span>
              <span className="text-[10px] text-slate-400 font-normal">· Real-time Payoff Curves</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Drag parameters to explore counterfactual outcomes and best responses
            </p>
          </div>
        </div>
      </div>

      {/* 1. AUCTIONS (Second-Price Vickrey & First-Price) */}
      {isAuction && (() => {
        const isWinner = myBid >= competitorBid;
        const clearingPrice = isSecondPrice ? competitorBid : myBid;
        const profit = isWinner ? Math.round((val - clearingPrice) * 100) / 100 : 0;

        // Generate points for SVG Payoff Curve: Bid (0..12) vs Profit
        const maxGraphBid = 12;
        const points: { b: number; x: number; y: number; profit: number }[] = [];
        for (let b = 0; b <= maxGraphBid; b += 0.5) {
          const win = b >= competitorBid;
          const price = isSecondPrice ? competitorBid : b;
          const p = win ? val - price : 0;
          const x = padding + (b / maxGraphBid) * (width - 2 * padding);
          // Scale profit between -4 and 8
          const minP = -4;
          const maxP = 8;
          const y = height - padding - ((p - minP) / (maxP - minP)) * (height - 2 * padding);
          points.push({ b, x, y, profit: p });
        }

        const pathD = points.reduce((acc, pt, idx) => {
          return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        }, '');

        // Zero profit line Y
        const zeroY = height - padding - ((0 - (-4)) / (8 - (-4))) * (height - 2 * padding);

        // Current Bid Point
        const curX = padding + (myBid / maxGraphBid) * (width - 2 * padding);
        const curY = height - padding - ((profit - (-4)) / (8 - (-4))) * (height - 2 * padding);

        return (
          <div className="space-y-3">
            {/* SVG Coordinate Graph */}
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 px-1">
                <span className="font-bold text-slate-300">
                  {isSecondPrice ? 'Second-Price Profit vs. Your Bid' : 'First-Price Profit vs. Your Bid'}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  Profit: {profit >= 0 ? `+${profit}` : profit} pts
                </span>
              </div>

              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible select-none">
                {/* Zero line */}
                <line
                  x1={padding}
                  y1={zeroY}
                  x2={width - padding}
                  y2={zeroY}
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text x={padding - 4} y={zeroY + 3} textAnchor="end" fill="#64748B" fontSize="9" fontFamily="monospace">
                  0
                </text>

                {/* Opponent Bid Threshold line */}
                {(() => {
                  const compX = padding + (competitorBid / maxGraphBid) * (width - 2 * padding);
                  return (
                    <g>
                      <line
                        x1={compX}
                        y1={padding}
                        x2={compX}
                        y2={height - padding}
                        stroke="#F59E0B"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                      <text x={compX} y={padding - 4} textAnchor="middle" fill="#F59E0B" fontSize="9" fontWeight="bold">
                        Rival Bid ({competitorBid})
                      </text>
                    </g>
                  );
                })()}

                {/* Valuation line */}
                {(() => {
                  const valX = padding + (val / maxGraphBid) * (width - 2 * padding);
                  return (
                    <g>
                      <line
                        x1={valX}
                        y1={padding}
                        x2={valX}
                        y2={height - padding}
                        stroke="#0284C7"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                      <text x={valX} y={height - padding + 12} textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="bold">
                        Value ({val})
                      </text>
                    </g>
                  );
                })()}

                {/* Payoff Curve */}
                <path d={pathD} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Current Player Bid Node */}
                <circle cx={curX} cy={curY} r="5" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
                <text x={curX} y={Math.max(16, curY - 8)} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Bid {myBid}
                </text>
              </svg>

              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
                <span>Bid: 0 pts</span>
                <span>Rival: {competitorBid} pts</span>
                <span>Max: {maxGraphBid} pts</span>
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              {/* Slider 1: Your Valuation */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Your Value (v):</span>
                  <span className="font-mono font-bold text-sky-400">{val} pts</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={val}
                  onChange={(e) => setVal(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              {/* Slider 2: Your Simulated Bid */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Simulate Bid (b):</span>
                  <span className="font-mono font-bold text-emerald-400">{myBid} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={myBid}
                  onChange={(e) => setMyBid(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              {/* Slider 3: Competitor Highest Bid */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Rival Highest (b₂):</span>
                  <span className="font-mono font-bold text-amber-400">{competitorBid} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={competitorBid}
                  onChange={(e) => setCompetitorBid(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Dynamic Insight Banner */}
            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] leading-relaxed">
              {isSecondPrice ? (
                myBid === val ? (
                  <span className="text-emerald-300 font-semibold">
                    ✓ <strong>Dominant Strategy Active:</strong> Bidding your exact value (<code className="font-mono text-white">{val} pts</code>) is optimal! If rival bids higher, you avoid paying more than value. If rival bids lower, you win and pay their lower bid.
                  </span>
                ) : myBid > val ? (
                  <span className="text-amber-300">
                    ⚠️ <strong>Overbidding Hazard:</strong> You bid above value (<code className="font-mono text-white">{myBid} &gt; {val}</code>). If rival bids between {val} and {myBid}, you win but suffer a <strong>negative surplus (Winner's Curse)</strong>!
                  </span>
                ) : (
                  <span className="text-slate-300">
                    ℹ️ <strong>Underbidding Shading:</strong> You shaded bid (<code className="font-mono text-white">{myBid} &lt; {val}</code>). In a second-price auction, shading does not lower your price paid—it only risks losing a profitable item if rival bids between {myBid} and {val}!
                  </span>
                )
              ) : (
                <span className="text-slate-300">
                  ℹ️ <strong>First-Price Trade-off:</strong> You pay your own bid (<code className="font-mono text-white">{myBid} pts</code>). Bidding value yields 0 profit. Bidders shade to balance winning probability against margin (<code className="font-mono text-emerald-300">Profit = {val} - {myBid} = {profit}</code>).
                </span>
              )}
            </div>

            {/* Apply Button */}
            {onApplyScenario && (
              <button
                type="button"
                onClick={() => onApplyScenario({ myBid, drawnValuation: val })}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Apply this Bid ({myBid} pts) to Active Round
              </button>
            )}
          </div>
        );
      })()}

      {/* 2. KEYNESIAN BEAUTY CONTEST (2/3 of Average) */}
      {isBeautyContest && (() => {
        const target = Math.round((assumedClassAvg * 2 / 3) * 10) / 10;
        const distance = Math.round(Math.abs(beautyGuess - target) * 10) / 10;
        const isClose = distance < 3.5;

        // Visual coordinate axis 0..100
        const scaleX = (val: number) => padding + (val / 100) * (width - 2 * padding);

        return (
          <div className="space-y-3">
            {/* Cognitive Depth Spectrum Chart */}
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 px-1">
                <span className="font-bold text-slate-300">Cognitive Depth Spectrum (0 to 100)</span>
                <span className="font-mono text-indigo-400 font-bold">
                  Target (2/3 Avg) = {target}
                </span>
              </div>

              <svg viewBox={`0 0 ${width} 90`} className="w-full h-24 overflow-visible select-none">
                {/* Horizontal baseline */}
                <line x1={padding} y1={50} x2={width - padding} y2={50} stroke="#475569" strokeWidth="2" />

                {/* Depth Milestones */}
                {[
                  { label: 'Nash (0)', val: 0, color: '#10B981' },
                  { label: 'L2 (22.2)', val: 22.2, color: '#A855F7' },
                  { label: 'L1 (33.3)', val: 33.3, color: '#6366F1' },
                  { label: 'L0 (50)', val: 50, color: '#64748B' },
                  { label: 'Max (100)', val: 100, color: '#475569' }
                ].map(m => {
                  const x = scaleX(m.val);
                  return (
                    <g key={m.label}>
                      <line x1={x} y1={44} x2={x} y2={56} stroke={m.color} strokeWidth="1.5" />
                      <text x={x} y={70} textAnchor="middle" fill={m.color} fontSize="9" fontWeight="bold">
                        {m.label}
                      </text>
                    </g>
                  );
                })}

                {/* Target Node */}
                {(() => {
                  const tx = scaleX(target);
                  return (
                    <g>
                      <circle cx={tx} cy={50} r="6" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
                      <text x={tx} y={35} textAnchor="middle" fill="#A5B4FC" fontSize="9" fontWeight="bold">
                        Target {target}
                      </text>
                    </g>
                  );
                })()}

                {/* Your Guess Node */}
                {(() => {
                  const gx = scaleX(beautyGuess);
                  return (
                    <g>
                      <circle cx={gx} cy={50} r="7" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
                      <text x={gx} y={20} textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="bold">
                        You ({beautyGuess})
                      </text>
                    </g>
                  );
                })()}
              </svg>

              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono px-1">
                <span>Distance to Target: <strong className={isClose ? 'text-emerald-400' : 'text-amber-400'}>{distance} pts</strong></span>
                <span>{isClose ? '🎯 Within Winning Range!' : '○ Try adjusting your depth'}</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Your Guess:</span>
                  <span className="font-mono font-bold text-sky-400">{beautyGuess}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={beautyGuess}
                  onChange={(e) => setBeautyGuess(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Hypothetical Class Avg:</span>
                  <span className="font-mono font-bold text-indigo-400">{assumedClassAvg}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={assumedClassAvg}
                  onChange={(e) => setAssumedClassAvg(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] text-slate-300 leading-relaxed">
              💡 <strong>Strategic Depth Lesson:</strong> If everyone guessed randomly (average = 50), 2/3 is 33.3 (Level-1). If everyone thinks one step deeper, they guess 22.2 (Level-2). Iterating indefinitely reaches the Nash Equilibrium of 0. But in human classrooms, guessing 0 usually loses because peers reason to Level 1 or 2!
            </div>

            {onApplyScenario && (
              <button
                type="button"
                onClick={() => onApplyScenario({ myGuess: beautyGuess })}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Apply Guess ({beautyGuess}) to Round
              </button>
            )}
          </div>
        );
      })()}

      {/* 3. PUBLIC GOODS GAME (Free-Rider Dilemma) */}
      {isPublicGoods && (() => {
        const totalPot = myContr + peerAvgContr * 3;
        const returnShare = Math.round((totalPot * 1.6 / 4) * 10) / 10;
        const kept = 10 - myContr;
        const finalScore = Math.round((kept + returnShare) * 10) / 10;

        return (
          <div className="space-y-3">
            {/* Interactive Return Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Tokens Kept</span>
                <span className="font-mono text-base font-bold text-slate-200">{kept} pts</span>
                <span className="text-[9px] text-slate-500 block">10 − {myContr}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-emerald-400 block mb-0.5">Pool Return</span>
                <span className="font-mono text-base font-bold text-emerald-400">+{returnShare} pts</span>
                <span className="text-[9px] text-slate-500 block">Pot × 1.6 / 4</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-sky-400 block mb-0.5">Total Payoff</span>
                <span className="font-mono text-base font-black text-sky-300">{finalScore} pts</span>
                <span className="text-[9px] text-slate-500 block">Kept + Share</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Your Contribution:</span>
                  <span className="font-mono font-bold text-emerald-400">{myContr} / 10 pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={myContr}
                  onChange={(e) => setMyContr(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">3 Peers Avg Contribution:</span>
                  <span className="font-mono font-bold text-sky-400">{peerAvgContr} / 10 pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={peerAvgContr}
                  onChange={(e) => setPeerAvgContr(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] text-slate-300 leading-relaxed">
              🌍 <strong>Free-Rider Math:</strong> Each token you contribute yields <code className="font-mono text-emerald-300">0.40 pts</code> back to you (a private loss of $0.60$), but yields <code className="font-mono text-sky-300">1.60 pts</code> to the group. The private Nash equilibrium is to contribute 0 (free-ride), whereas the social optimum is for everyone to contribute 10 (earning 16 pts each)!
            </div>

            {onApplyScenario && (
              <button
                type="button"
                onClick={() => onApplyScenario({ myContribution: myContr })}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Apply Contribution ({myContr} pts) to Round
              </button>
            )}
          </div>
        );
      })()}

      {/* 4. REPEATED TRUST & RETALIATION (Tit-for-Tat vs Grim Trigger) */}
      {isRepeatedOrPD && (() => {
        // Multi-round policy simulation across 6 rounds
        const simulateMultiRound = () => {
          let scoreMy = 0;
          let scoreOpp = 0;
          let oppDefectedEver = false;
          let myDefectedEver = false;
          let lastMy = 'C';
          let lastOpp = 'C';

          const rounds: { r: number; my: string; opp: string; ptsMy: number; ptsOpp: number }[] = [];

          for (let r = 1; r <= 6; r++) {
            let curMy = 'C';
            if (myStrategy === 'ALL_C') curMy = 'C';
            else if (myStrategy === 'ALL_D') curMy = 'D';
            else if (myStrategy === 'GRIM') curMy = oppDefectedEver ? 'D' : 'C';
            else if (myStrategy === 'TFT') curMy = r === 1 ? 'C' : lastOpp;

            let curOpp = 'C';
            if (opponentStrategy === 'ALL_C') curOpp = 'C';
            else if (opponentStrategy === 'ALL_D') curOpp = 'D';
            else if (opponentStrategy === 'GRIM') curOpp = myDefectedEver ? 'D' : 'C';
            else if (opponentStrategy === 'RANDOM') curOpp = Math.random() < 0.5 ? 'C' : 'D';
            else if (opponentStrategy === 'TFT') curOpp = r === 1 ? 'C' : lastMy;

            if (curMy === 'D') myDefectedEver = true;
            if (curOpp === 'D') oppDefectedEver = true;

            let ptsM = 1;
            let ptsO = 1;
            if (curMy === 'C' && curOpp === 'C') { ptsM = 2; ptsO = 2; }
            else if (curMy === 'C' && curOpp === 'D') { ptsM = 0; ptsO = 3; }
            else if (curMy === 'D' && curOpp === 'C') { ptsM = 3; ptsO = 0; }
            else { ptsM = 1; ptsO = 1; }

            scoreMy += ptsM;
            scoreOpp += ptsO;
            lastMy = curMy;
            lastOpp = curOpp;

            rounds.push({ r, my: curMy, opp: curOpp, ptsMy: ptsM, ptsOpp: ptsO });
          }

          return { scoreMy, scoreOpp, rounds };
        };

        const sim = simulateMultiRound();

        return (
          <div className="space-y-3">
            {/* Strategy Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Your Repeated Policy:</label>
                <select
                  value={myStrategy}
                  onChange={(e) => setMyStrategy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-bold text-sky-400"
                >
                  <option value="TFT">Tit-for-Tat (Reciprocal)</option>
                  <option value="GRIM">Grim Trigger (Unforgiving)</option>
                  <option value="ALL_C">Always Cooperate (Dovish)</option>
                  <option value="ALL_D">Always Defect (Hawkish)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Opponent Policy:</label>
                <select
                  value={opponentStrategy}
                  onChange={(e) => setOpponentStrategy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-bold text-purple-400"
                >
                  <option value="TFT">Tit-for-Tat</option>
                  <option value="GRIM">Grim Trigger</option>
                  <option value="ALL_C">Always Cooperate</option>
                  <option value="ALL_D">Always Defect</option>
                  <option value="RANDOM">Random 50/50</option>
                </select>
              </div>
            </div>

            {/* Simulated 6-Round Trajectory */}
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 px-1">
                <span>6-Round Simulation Outcome:</span>
                <span className="font-mono font-bold text-white">
                  You: <strong className="text-emerald-400">{sim.scoreMy} pts</strong> vs Rival: <strong className="text-purple-400">{sim.scoreOpp} pts</strong>
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
                {sim.rounds.map(item => (
                  <div key={item.r} className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">R{item.r}</span>
                    <span className={`font-bold block ${item.my === 'C' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.my}/{item.opp}
                    </span>
                    <span className="text-[9px] text-slate-400 block">+{item.ptsMy}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] text-slate-300 leading-relaxed">
              🔁 <strong>The Folk Theorem:</strong> When both players use Tit-for-Tat, mutual cooperation generates 12 points each across 6 rounds. Attempting to defect triggers retaliation, lowering cumulative payoffs down to the mutual punishment trap of 6 points.
            </div>
          </div>
        );
      })()}

      {/* 5. CENTIPEDE GAME (Extensive Form & Backward Induction) */}
      {isCentipede && (() => {
        const q = centipedePassProb / 100;

        // Strategy 1: Take immediately at Node 1
        const expN1 = 2.0;

        // Strategy 2: Pass N1, Take at N3
        // If rival takes N2 (prob 1-q): get 1. If rival passes N2 (prob q): take N3 for 4.
        const expN3 = (1 - q) * 1 + q * 4;

        // Strategy 3: Pass N1 & N3, Take at N5
        // N2 take (1-q): 1. N2 pass + N4 take (q * (1-q)): 3. N2 pass + N4 pass (q^2): take N5 for 6.
        const expN5 = (1 - q) * 1 + q * (1 - q) * 3 + Math.pow(q, 2) * 6;

        // Strategy 4: Pass all nodes (Terminal Cooperation)
        // N2 take: 1. N4 take: 3. N6 take: 5. Terminal: 8.
        const expTerm = (1 - q) * 1 + q * (1 - q) * 3 + Math.pow(q, 2) * (1 - q) * 5 + Math.pow(q, 3) * 8;

        const strats = [
          { name: 'Take at Node 1 (SPNE)', val: expN1, color: 'text-rose-400', barColor: 'bg-rose-500' },
          { name: 'Pass to Node 3 Take', val: expN3, color: 'text-amber-400', barColor: 'bg-amber-500' },
          { name: 'Pass to Node 5 Take', val: expN5, color: 'text-blue-400', barColor: 'bg-blue-500' },
          { name: 'Pass to Terminal (+8)', val: expTerm, color: 'text-emerald-400', barColor: 'bg-emerald-500' }
        ];

        const bestStrat = [...strats].sort((a, b) => b.val - a.val)[0];

        return (
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-300">
                Opponent Passing Probability ($q$):
              </span>
              <span className="font-mono text-base font-black text-amber-400">
                {centipedePassProb}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={centipedePassProb}
              onChange={(e) => setCentipedePassProb(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Expected Payoff Comparison Bars */}
            <div className="space-y-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Expected Payoff by Strategy</span>
                <span className="text-emerald-400 font-bold">Optimal: {bestStrat.name}</span>
              </div>

              {strats.map((s, idx) => {
                const maxVal = 8.0;
                const pct = Math.min(100, (s.val / maxVal) * 100);
                const isBest = s.name === bestStrat.name;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={`${s.color} font-medium flex items-center gap-1`}>
                        {isBest && <span>★</span>}
                        <span>{s.name}</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {s.val.toFixed(2)} pts
                      </span>
                    </div>
                    <div className="h-4 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className={`h-full ${s.barColor} rounded transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] text-slate-300 leading-relaxed">
              🐛 <strong>Behavioral Threshold ($q^* = 33\%$):</strong> If you believe opponent pass probability is under 33%, backward induction dominates and taking at Node 1 yields higher expected value ($2.0$ pts). As soon as opponent trust exceeds $33\%$, passing to Node 3, 5, or Terminal strictly dominates, explaining why human players in lab experiments build massive cooperative gains!
            </div>
          </div>
        );
      })()}
    </div>
  );
};
