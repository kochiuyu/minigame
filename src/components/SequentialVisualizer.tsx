import React from 'react';

export interface SequentialVisualizerProps {
  gameId: number;
  botName: string;
  botAvatar: string;
  // Current or played states
  ultimatumOffer?: number;
  trustInvestment?: number;
  auctionBid?: number;
  studentValuation?: number;
  botValuation?: number;
  bertrandPrice?: number;
  beautyGuess?: number;
  publicGoodsContr?: number;
  centipedeNode?: number;
  centipedePath?: Array<{ node: number; mover: 'player' | 'bot'; action: 'Pass' | 'Take' }>;
  // New props for Games 2, 5, 8, 9, 10
  launchChoice?: 'Launch' | 'Wait';
  entryChoice?: 'Enter' | 'Stay Out';
  deterrenceChoice?: 'Commit' | 'Stay Flexible';
  pieDemand?: number;
  botPieDemand?: number;
  signalingType?: 'High Quality' | 'Low Quality';
  signalingChoice?: 'Yes (Costly)' | 'No';
  buyerTrustChoice?: 'Trust' | "Don't Trust";
  // Games 21, 22, 23, 24
  cournotQuantity?: number;
  botCournotQuantity?: number;
  hotellingLocation?: number;
  botHotellingLocation?: number;
  blottoAllocations?: { a: number; b: number; c: number };
  botBlottoAllocations?: { a: number; b: number; c: number };
  cvBid?: number;
  botCvBid?: number;
  cvTrueValue?: number;
  cvPlayerSignal?: number;
  cvBotSignal?: number;
  playedOutcome?: {
    playerAction: any;
    botAction: any;
    playerPayoff: number;
    botPayoff: number;
  };
}

export const SequentialVisualizer: React.FC<SequentialVisualizerProps> = ({
  gameId,
  botName,
  botAvatar,
  ultimatumOffer = 4,
  trustInvestment = 5,
  auctionBid = 50,
  studentValuation = 65,
  botValuation = 60,
  bertrandPrice = 35,
  beautyGuess = 33,
  publicGoodsContr = 10,
  centipedeNode = 1,
  launchChoice = 'Launch',
  entryChoice = 'Enter',
  deterrenceChoice = 'Commit',
  pieDemand = 5,
  botPieDemand = 5,
  signalingType = 'High Quality',
  signalingChoice = 'Yes (Costly)',
  cournotQuantity = 30,
  botCournotQuantity = 30,
  hotellingLocation = 50,
  botHotellingLocation = 50,
  blottoAllocations = { a: 34, b: 33, c: 33 },
  botBlottoAllocations = { a: 50, b: 50, c: 0 },
  cvBid = 44,
  botCvBid = 42,
  cvTrueValue = 50,
  cvPlayerSignal = 52,
  cvBotSignal = 48,
  playedOutcome
}) => {
  // Game 16: Ultimatum Bargaining Split Bar
  if (gameId === 16) {
    const offer = playedOutcome ? Number(playedOutcome.playerAction) : ultimatumOffer;
    const proposerShare = Math.max(0, 10 - offer);
    const responderShare = offer;
    const wasRejected = playedOutcome ? playedOutcome.playerPayoff === 0 && playedOutcome.botPayoff === 0 : false;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🍰</span>
            <span>$10 Ultimatum Split Allocation Visualizer</span>
          </span>
          {playedOutcome && (
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                wasRejected
                  ? 'bg-rose-950 text-rose-300 border-rose-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}
            >
              {wasRejected ? '✗ Offer Rejected ($0 / $0)' : '✓ Offer Accepted'}
            </span>
          )}
        </div>

        {/* 2-Part Color Split Bar */}
        <div className="space-y-1.5">
          <div className="h-8 w-full rounded-xl overflow-hidden flex bg-slate-900 border border-slate-800 p-0.5">
            <div
              style={{ width: `${(proposerShare / 10) * 100}%` }}
              className="bg-blue-600 h-full rounded-l-lg transition-all flex items-center justify-center text-xs font-black text-white shadow-inner"
            >
              {proposerShare > 1.5 && `You: $${proposerShare}`}
            </div>
            <div
              style={{ width: `${(responderShare / 10) * 100}%` }}
              className="bg-emerald-600 h-full rounded-r-lg transition-all flex items-center justify-center text-xs font-black text-white shadow-inner gap-1"
            >
              {responderShare > 1.5 && (
                <>
                  <span>{botAvatar}</span>
                  <span>{botName}: ${responderShare}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Your Proposer Share: <strong className="text-blue-300">${proposerShare}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{botAvatar} {botName}'s Offer: <strong className="text-emerald-300">${responderShare}</strong></span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Game 19: The Trust Game Investment Pipeline
  if (gameId === 19) {
    const sent = playedOutcome ? Number(playedOutcome.playerAction) : trustInvestment;
    const kept = 10 - sent;
    const tripled = sent * 3;
    const returned = playedOutcome ? (playedOutcome.botPayoff !== undefined ? tripled - (playedOutcome.botPayoff) : 0) : Math.round(tripled * 0.5);

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏦</span>
            <span>Trust Game Capital Multiplier Pipeline</span>
          </span>
          <span className="text-amber-400 font-bold">3× Investment Multiplier</span>
        </div>

        {/* 3-Stage Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase">1. Investor Sends</div>
            <div className="text-xl font-black text-sky-400">${sent}</div>
            <div className="text-[10px] text-slate-400">Kept: ${kept} of $10</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-1">
            <div className="text-[11px] font-mono text-amber-300 uppercase">2. Tripled Pool (3×)</div>
            <div className="text-xl font-black text-amber-300">${tripled}</div>
            <div className="text-[10px] text-amber-200/80">Generated by Trust</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono text-emerald-400 uppercase">3. Trustee Return</div>
            <div className="text-xl font-black text-emerald-400">
              {playedOutcome ? `$${playedOutcome.playerPayoff - kept}` : `~$${returned}`}
            </div>
            <div className="text-[10px] text-slate-400">Trustee keeps remainder</div>
          </div>
        </div>
      </div>
    );
  }

  // Game 7: Second-Price Vickrey Auction Scale
  if (gameId === 7) {
    const studentBidVal = playedOutcome ? Number(playedOutcome.playerAction) : auctionBid;
    const botBidVal = playedOutcome ? Number(playedOutcome.botAction) : 48;
    const isWinner = studentBidVal > botBidVal;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚖️</span>
            <span>Vickrey Sealed-Bid Pricing Comparison</span>
          </span>
          <span className="text-emerald-400 font-bold">Winner Pays 2nd Bid</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Your Valuation</div>
            <div className="text-lg font-black text-slate-100">${studentValuation}</div>
            <div className="text-[10px] text-slate-400">True Worth</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/60">
            <div className="text-[11px] font-mono text-sky-300">Your Bid</div>
            <div className="text-lg font-black text-sky-300">${studentBidVal}</div>
            <div className="text-[10px] text-sky-200">Optimal: Bid True Value</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-mono text-amber-300">{botName}'s Bid</div>
            <div className="text-lg font-black text-amber-300">${botBidVal}</div>
            <div className="text-[10px] text-amber-200">{isWinner ? `Clearing Price: $${botBidVal}` : 'Highest Bidder'}</div>
          </div>
        </div>
      </div>
    );
  }

  // Game 14: Bertrand Duopoly Price Competition
  if (gameId === 14) {
    const studentPriceVal = playedOutcome ? Number(playedOutcome.playerAction) : bertrandPrice;
    const botPriceVal = playedOutcome ? Number(playedOutcome.botAction) : 34;
    const cost = 20;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏷️</span>
            <span>Bertrand Price Competition vs Marginal Cost</span>
          </span>
          <span className="text-rose-400 font-bold">Cost Floor: ${cost}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Unit Cost (MC)</div>
            <div className="text-lg font-black text-slate-100">${cost}</div>
            <div className="text-[10px] text-slate-400">Zero-Profit Floor</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/60">
            <div className="text-[11px] font-mono text-sky-300">Your Price</div>
            <div className="text-lg font-black text-sky-300">${studentPriceVal}</div>
            <div className="text-[10px] text-sky-200">Margin: +${Math.max(0, studentPriceVal - cost)}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/60">
            <div className="text-[11px] font-mono text-amber-300">{botName}'s Price</div>
            <div className="text-lg font-black text-amber-300">${botPriceVal}</div>
            <div className="text-[10px] text-amber-200">{studentPriceVal < botPriceVal ? 'You Underbid' : studentPriceVal === botPriceVal ? 'Split Market' : 'Bot Underbid'}</div>
          </div>
        </div>
      </div>
    );
  }

  // Game 11: Keynesian Beauty Contest (2/3 of Average)
  if (gameId === 11) {
    const guess = playedOutcome ? Number(playedOutcome.playerAction) : beautyGuess;
    const botGuess = playedOutcome ? Number(playedOutcome.botAction) : 30;
    const avg = Math.round(((guess + botGuess) / 2) * 10) / 10;
    const target = Math.round(avg * (2 / 3) * 10) / 10;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>💭</span>
            <span>Beauty Contest: Target vs Guesses (0 - 100)</span>
          </span>
          <span className="text-amber-400 font-bold">Target = 2/3 × Mean</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800/60">
            <div className="text-[11px] font-mono text-sky-300">Your Guess</div>
            <div className="text-lg font-black text-sky-300">{guess}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60">
            <div className="text-[11px] font-mono text-amber-300">{botName}'s Guess</div>
            <div className="text-lg font-black text-amber-300">{botGuess}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Average</div>
            <div className="text-lg font-black text-slate-200">{avg}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-600/70">
            <div className="text-[11px] font-mono text-emerald-300">2/3 Target</div>
            <div className="text-lg font-black text-emerald-300">{target}</div>
          </div>
        </div>
      </div>
    );
  }

  // Game 12: Public Goods Funding Pool
  if (gameId === 12) {
    const contr = playedOutcome ? Number(playedOutcome.playerAction) : publicGoodsContr;
    const botContr = playedOutcome ? Number(playedOutcome.botAction) : 8;
    const pool = (contr + botContr) * 1.6;
    const share = Math.round((pool / 2) * 10) / 10;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🌍</span>
            <span>Public Goods Pool & Return Breakdown</span>
          </span>
          <span className="text-emerald-400 font-bold">1.6× Multiplier (0.8× / player)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Your Tokens Kept</div>
            <div className="text-lg font-black text-slate-100">{20 - contr} pts</div>
            <div className="text-[10px] text-slate-400">Guaranteed Return</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60">
            <div className="text-[11px] font-mono text-amber-300">Total Group Pool</div>
            <div className="text-lg font-black text-amber-300">{Math.round(pool * 10) / 10} pts</div>
            <div className="text-[10px] text-amber-200">1.6× ({contr} + {botContr})</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-mono text-emerald-300">Your Pool Dividend</div>
            <div className="text-lg font-black text-emerald-300">+{share} pts</div>
            <div className="text-[10px] text-emerald-200">Equal Split of Pool</div>
          </div>
        </div>
      </div>
    );
  }

  // Game 20: Centipede Sequential Node Tree
  if (gameId === 20) {
    const nodes = [
      { n: 1, mover: 'You', take: '(+2, 0)', pass: 'Pass to 2' },
      { n: 2, mover: botName, take: '(+1, +4)', pass: 'Pass to 3' },
      { n: 3, mover: 'You', take: '(+4, +2)', pass: 'Pass to 4' },
      { n: 4, mover: botName, take: '(+3, +6)', pass: 'Pass to 5' },
      { n: 5, mover: 'You', take: '(+6, +4)', pass: 'Pass to 6' },
      { n: 6, mover: botName, take: '(+5, +8)', pass: 'Optimum (+8, +8)' }
    ];

    const activeNode = playedOutcome ? (playedOutcome.playerAction.includes('Node') ? parseInt(playedOutcome.playerAction.replace(/\D/g, '')) || centipedeNode : centipedeNode) : centipedeNode;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🐛</span>
            <span>Centipede Extensive-Form Chain Path</span>
          </span>
          <span className="text-amber-400 font-bold">SPNE: Node 1 Take</span>
        </div>

        {/* 6-Node Horizontal Chain Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {nodes.map((node) => {
            const isReached = node.n <= activeNode;
            const isExitNode = node.n === activeNode;
            return (
              <div
                key={node.n}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isExitNode
                    ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-400/50 shadow-lg text-white'
                    : isReached
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-50'
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  Node {node.n}
                </div>
                <div className="text-xs font-black text-sky-300 my-0.5 truncate">
                  {node.mover}
                </div>
                <div className="text-[11px] font-mono text-rose-300 font-bold">
                  {node.take}
                </div>
                {isExitNode && (
                  <div className="text-[9px] font-mono bg-amber-400 text-slate-950 font-black rounded px-1 mt-1">
                    {playedOutcome ? '🎯 Exit Node' : 'Active'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Game 2: Launch-or-Wait (Sequential Decision Tree)
  if (gameId === 2) {
    const activeFM = playedOutcome ? String(playedOutcome.playerAction) : launchChoice;
    const activeSM = playedOutcome ? String(playedOutcome.botAction) : entryChoice;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🚀</span>
            <span>Extensive-Form Game Tree (Sequential Entry)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 font-bold">You: First Mover</span>
            <span className="text-slate-600">➔</span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">{botName}: Second Mover</span>
          </div>
        </div>

        {/* Tree Visualizer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Branch A: Launch */}
          <div
            className={`rounded-xl p-3 border transition-all ${
              activeFM === 'Launch'
                ? 'bg-sky-950/30 border-sky-500/80 ring-1 ring-sky-500/30'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2.5">
              <span className="font-black text-sky-300 flex items-center gap-1.5">
                <span>🚀</span>
                <span>Branch: You choose 'Launch'</span>
              </span>
              {activeFM === 'Launch' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-900/80 text-sky-200 border border-sky-700">
                  Chosen Root
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeFM === 'Launch' && activeSM === 'Enter'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{botAvatar}</span>
                    <span>Follower Enters (Shared Duopoly)</span>
                    <span className="text-[9px] font-mono bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-700">
                      ⭐ SPNE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Backward induction follower best response (2 {'>'} 1)</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-sky-300">You: +2 pts</div>
                  <div className="text-amber-300">Bot: +2 pts</div>
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeFM === 'Launch' && activeSM === 'Stay Out'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{botAvatar}</span>
                    <span>Follower Stays Out</span>
                  </div>
                  <div className="text-[11px] text-slate-400">First-mover captures full monopoly</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-sky-300">You: +4 pts</div>
                  <div className="text-amber-300">Bot: +1 pt</div>
                </div>
              </div>
            </div>
          </div>

          {/* Branch B: Wait */}
          <div
            className={`rounded-xl p-3 border transition-all ${
              activeFM === 'Wait'
                ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2.5">
              <span className="font-black text-amber-300 flex items-center gap-1.5">
                <span>⏳</span>
                <span>Branch: You choose 'Wait'</span>
              </span>
              {activeFM === 'Wait' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-200 border border-amber-700">
                  Chosen Root
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeFM === 'Wait' && activeSM === 'Enter'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{botAvatar}</span>
                    <span>Follower Enters (Seizes Market)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Follower captures first-mover opening (4 {'>'} 0)</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-sky-300">You: +1 pt</div>
                  <div className="text-amber-300">Bot: +4 pts</div>
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeFM === 'Wait' && activeSM === 'Stay Out'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{botAvatar}</span>
                    <span>Follower Stays Out (Both Miss Out)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Nobody enters the market</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-sky-300">You: 0 pts</div>
                  <div className="text-amber-300">Bot: 0 pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game 5: Entry Deterrence & Strategic Commitment Tree
  if (gameId === 5) {
    const activeIncumbent = playedOutcome ? String(playedOutcome.playerAction) : deterrenceChoice;
    const activeEntrant = playedOutcome ? String(playedOutcome.botAction) : entryChoice;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏰</span>
            <span>Strategic Commitment & Entry Deterrence Tree</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 font-bold">You: Incumbent</span>
            <span className="text-slate-600">➔</span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">{botName}: Challenger</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Branch A: Commit */}
          <div
            className={`rounded-xl p-3 border transition-all ${
              activeIncumbent === 'Commit'
                ? 'bg-indigo-950/30 border-indigo-500/80 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2.5">
              <span className="font-black text-indigo-300 flex items-center gap-1.5">
                <span>🏰</span>
                <span>Irreversible Commitment (Sunk Capital)</span>
              </span>
              <span className="text-[9px] font-mono bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-700">
                ⭐ SPNE Path
              </span>
            </div>

            <div className="space-y-2">
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeIncumbent === 'Commit' && activeEntrant === 'Stay Out'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-emerald-300 flex items-center gap-1">
                    <span>✓ Challenger Stays Out (Deterred!)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Challenger avoids price war (0 {'>'} -2)</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-sky-300">You: +4 pts</div>
                  <div className="text-amber-300">Bot: 0 pts</div>
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeIncumbent === 'Commit' && activeEntrant === 'Enter'
                    ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-rose-300 flex items-center gap-1">
                    <span>⚔️ Challenger Enters (Price War)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Mutually destructive price collapse</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-rose-300">You: -2 pts</div>
                  <div className="text-rose-300">Bot: -2 pts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Branch B: Stay Flexible */}
          <div
            className={`rounded-xl p-3 border transition-all ${
              activeIncumbent === 'Stay Flexible'
                ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2.5">
              <span className="font-black text-amber-300 flex items-center gap-1.5">
                <span>🔄</span>
                <span>Stay Flexible (No Sunk Commitment)</span>
              </span>
            </div>

            <div className="space-y-2">
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeIncumbent === 'Stay Flexible' && activeEntrant === 'Enter'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1">
                    <span>Challenger Enters (Duopoly Sharing)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Threat not credible; entry accommodated (+2 vs -2)</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-sky-300">You: +2 pts</div>
                  <div className="text-amber-300">Bot: +2 pts</div>
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  activeIncumbent === 'Stay Flexible' && activeEntrant === 'Stay Out'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200">Challenger Stays Out</div>
                  <div className="text-[11px] text-slate-400">Challenger backed down unnecessarily</div>
                </div>
                <div className="text-right font-mono font-black text-xs">
                  <div className="text-sky-300">You: +4 pts</div>
                  <div className="text-amber-300">Bot: 0 pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game 8: First-Price Sealed-Bid Auction Scale
  if (gameId === 8) {
    const val = studentValuation;
    const bid = playedOutcome ? Number(playedOutcome.playerAction) : auctionBid;
    const botBid = playedOutcome ? Number(playedOutcome.botAction) : Math.round((botValuation / 2) * 10) / 10;
    const nashShade = Math.round((val / 2) * 10) / 10;
    const isWinner = playedOutcome ? playedOutcome.playerPayoff > 0 || (bid >= botBid && bid <= val) : false;
    const profitMargin = Math.round((val - bid) * 10) / 10;
    const isWinnersCurse = bid > val;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏷️</span>
            <span>First-Price Sealed-Bid Comparison (Pay-Your-Bid)</span>
          </span>
          {playedOutcome && (
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isWinnersCurse
                  ? 'bg-rose-950 text-rose-300 border-rose-700'
                  : isWinner
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {isWinnersCurse
                ? "⚠️ Winner's Curse (Overpaid!)"
                : isWinner
                ? '✓ Auction Won!'
                : 'Item Sold to Competitor'}
            </span>
          )}
        </div>

        {/* Bid Comparison Number Scale */}
        <div className="relative pt-6 pb-2">
          <div className="h-3 w-full bg-slate-900 rounded-full relative overflow-hidden border border-slate-800">
            {/* Shaded margin fill */}
            <div
              style={{
                left: `${Math.min(100, Math.max(0, (bid / 10) * 100))}%`,
                width: `${Math.max(0, ((val - bid) / 10) * 100)}%`
              }}
              className="absolute top-0 bottom-0 bg-emerald-500/20 border-l border-r border-emerald-500/40"
            />
          </div>

          {/* Value Marker */}
          <div
            style={{ left: `${Math.min(95, Math.max(5, (val / 10) * 100))}%` }}
            className="absolute top-1 -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-[10px] font-mono text-amber-400 font-bold">Valuation</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950"></div>
            <span className="text-[10px] font-mono text-slate-300 mt-1">${val.toFixed(1)}</span>
          </div>

          {/* Player Bid Marker */}
          <div
            style={{ left: `${Math.min(95, Math.max(5, (bid / 10) * 100))}%` }}
            className="absolute top-1 -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-[10px] font-mono text-sky-400 font-bold">Your Bid</span>
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-slate-950"></div>
            <span className="text-[10px] font-mono text-sky-200 mt-1">${bid.toFixed(1)}</span>
          </div>

          {/* Nash Equilibrium Marker */}
          <div
            style={{ left: `${Math.min(95, Math.max(5, (nashShade / 10) * 100))}%` }}
            className="absolute top-8 -translate-x-1/2 flex flex-col items-center opacity-70"
          >
            <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-[9px] font-mono text-purple-300 whitespace-nowrap">Nash: ${nashShade}</span>
          </div>
        </div>

        {/* Payoff breakdown badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400">Private Value</div>
            <div className="text-sm font-black text-amber-300">${val.toFixed(1)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400">Your Bid (Paid if Win)</div>
            <div className="text-sm font-black text-sky-300">${bid.toFixed(1)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400">{botName} Bid</div>
            <div className="text-sm font-black text-slate-300">${botBid.toFixed(1)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400">Winning Margin (v - b)</div>
            <div
              className={`text-sm font-black ${
                profitMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {profitMargin >= 0 ? `+$${profitMargin.toFixed(1)}` : `-$${Math.abs(profitMargin).toFixed(1)}`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game 9: Split-the-Pie Bargaining (Demand Overlap Bar)
  if (gameId === 9) {
    const pDemand = playedOutcome ? Number(playedOutcome.playerAction) : pieDemand;
    const bDemand = playedOutcome ? Number(playedOutcome.botAction) : botPieDemand;
    const totalDemands = Math.round((pDemand + bDemand) * 10) / 10;
    const isCompatible = totalDemands <= 10;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🥧</span>
            <span>Split-the-Pie Demand Compatibility Bar</span>
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              isCompatible
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-rose-950 text-rose-300 border-rose-700'
            }`}
          >
            {isCompatible
              ? `✓ Deal Succeeded (Sum: ${totalDemands} ≤ 10)`
              : `✗ Clash! Demands Exceed 10 (Sum: ${totalDemands})`}
          </span>
        </div>

        {/* 10-Point Demand Allocation Bar */}
        <div className="space-y-1.5">
          <div className="h-8 w-full rounded-xl overflow-hidden flex bg-slate-900 border border-slate-800 p-0.5">
            <div
              style={{ width: `${Math.min(100, (pDemand / 10) * 100)}%` }}
              className="bg-blue-600 h-full rounded-l-lg transition-all flex items-center justify-center text-xs font-black text-white shadow-inner truncate px-1"
            >
              You: {pDemand} pts
            </div>
            <div
              style={{ width: `${Math.min(100 - (pDemand / 10) * 100, (bDemand / 10) * 100)}%` }}
              className={`h-full transition-all flex items-center justify-center text-xs font-black text-white shadow-inner truncate px-1 ${
                isCompatible ? 'bg-amber-600' : 'bg-rose-600'
              }`}
            >
              {botName}: {bDemand} pts
            </div>
            {isCompatible && 10 - totalDemands > 0 && (
              <div
                style={{ width: `${((10 - totalDemands) / 10) * 100}%` }}
                className="bg-slate-800/60 h-full rounded-r-lg flex items-center justify-center text-[10px] font-mono text-slate-400"
              >
                +{(10 - totalDemands).toFixed(1)} Left
              </div>
            )}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>0 pts</span>
            <span className="text-emerald-400 font-bold">Total Pie = 10 pts</span>
            <span>10 pts</span>
          </div>
        </div>

        {/* Outcome result summary */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
          <div className="text-slate-300">
            {isCompatible ? (
              <span>Mutual Agreement: Both players receive their requested demands.</span>
            ) : (
              <span className="text-rose-300">
                Deal Collapsed: Greedy demands triggered Outside Options (+1 pt each).
              </span>
            )}
          </div>
          <div className="font-mono font-bold text-xs">
            {isCompatible ? (
              <span className="text-emerald-300">You: +{pDemand} pts · {botName}: +{bDemand} pts</span>
            ) : (
              <span className="text-slate-400">You: 1 pt · {botName}: 1 pt</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game 10: Costly Signaling & Asymmetric Information (Information Tree)
  if (gameId === 10) {
    const isSignaled = playedOutcome ? playedOutcome.playerAction === 'Yes (Costly)' : signalingChoice === 'Yes (Costly)';
    const buyerTrusts = playedOutcome ? playedOutcome.botAction === 'Trust' : true;
    const quality = signalingType;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>📜</span>
            <span>Spence Costly Signaling & Information Structure</span>
          </span>
          <span className="text-[11px] font-mono text-indigo-400 font-bold">
            Nature Type: {quality}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Path A: Costly Signal */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              isSignaled
                ? 'bg-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-400/30'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <span>🔬</span>
                <span>Send Costly Signal (Warranty)</span>
              </span>
              <span className="text-[9px] font-mono bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-700">
                ⭐ Separating Eq
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mb-2">
              High-Quality cost = 2 pts · Low-Quality cost = 5 pts (Single-Crossing condition)
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Buyer Decision:</span>
              <span className="font-bold text-emerald-400">
                {buyerTrusts ? '✓ Trusts (Premium Paid)' : "✗ Doesn't Trust"}
              </span>
            </div>
          </div>

          {/* Path B: No Signal */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              !isSignaled
                ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-400/30'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🤐</span>
                <span>No Signal (Cheap Talk)</span>
              </span>
              <span className="text-[9px] font-mono bg-amber-900/80 text-amber-200 px-1.5 py-0.5 rounded border border-amber-700">
                ⚠️ Lemon Risk
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mb-2">
              Cost = 0 pts · Cannot distinguish High from Low Quality
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Buyer Decision:</span>
              <span className="font-bold text-rose-400">
                {buyerTrusts ? 'Blind Trust (High Risk)' : "✗ Doesn't Trust (Stagnant Market)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game 21: Cournot Duopoly Best Response & Market Clearing
  if (gameId === 21) {
    const pQ = playedOutcome ? (typeof playedOutcome.playerAction === 'number' ? playedOutcome.playerAction : parseFloat(String(playedOutcome.playerAction)) || cournotQuantity) : cournotQuantity;
    const bQ = playedOutcome ? (typeof playedOutcome.botAction === 'number' ? playedOutcome.botAction : parseFloat(String(playedOutcome.botAction)) || botCournotQuantity) : botCournotQuantity;
    const totalQ = pQ + bQ;
    const marketP = Math.max(0, 100 - totalQ);
    const pProfit = (pQ * (marketP - 10)) / 100;
    const bProfit = (bQ * (marketP - 10)) / 100;
    const bestReply = Math.max(0, Math.round(((90 - bQ) / 2) * 10) / 10);

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏭</span>
            <span>Cournot Market Equilibrium & Best-Response Analysis</span>
          </span>
          <span className="text-xs font-bold text-indigo-400">
            Market P = ${marketP.toFixed(1)} / unit
          </span>
        </div>

        {/* Aggregate Output & Price Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-blue-400">Your Output: {pQ.toFixed(1)}u</span>
            <span className="text-amber-400">{botName}: {bQ.toFixed(1)}u</span>
            <span className="text-emerald-400">Total Market Q: {totalQ.toFixed(1)} / 100u</span>
          </div>

          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
            <div style={{ width: `${Math.min(100, (pQ / 90) * 100)}%` }} className="bg-blue-600 transition-all" />
            <div style={{ width: `${Math.min(100, (bQ / 90) * 100)}%` }} className="bg-amber-500 transition-all" />
          </div>
        </div>

        {/* Reaction Curve & Strategic Benchmarks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Your Best Response to Bot:</span>
            <span className="font-mono text-sm font-black text-blue-300 mt-0.5 block">
              q1* = (90 - {bQ.toFixed(1)}) / 2 = {bestReply}u
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cournot-Nash Equilibrium:</span>
            <span className="font-mono text-sm font-black text-indigo-300 mt-0.5 block">
              q1 = q2 = 30u · P = $40 (+$9.00 each)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cartel Joint Monopoly:</span>
            <span className="font-mono text-sm font-black text-amber-300 mt-0.5 block">
              q1 = q2 = 22.5u · P = $55 (+$10.13 each)
            </span>
          </div>
        </div>

        {playedOutcome && (
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-300">Profit Payoffs (scaled /100):</span>
            <span className="font-mono font-bold text-white">
              You: <strong className="text-emerald-400">+${pProfit.toFixed(2)}</strong> · {botName}: <strong className="text-amber-400">+${bProfit.toFixed(2)}</strong>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Game 22: Hotelling's Spatial Competition Boardwalk Beach Territory Map
  if (gameId === 22) {
    const pLoc = playedOutcome ? (parseFloat(String(playedOutcome.playerAction).replace(/\D+/g, '')) || hotellingLocation) : hotellingLocation;
    const bLoc = playedOutcome ? (parseFloat(String(playedOutcome.botAction).replace(/\D+/g, '')) || botHotellingLocation) : botHotellingLocation;
    const midpoint = (pLoc + bLoc) / 2;
    let pShare = 50;
    let bShare = 50;
    if (pLoc < bLoc) {
      pShare = Math.round(midpoint * 10) / 10;
      bShare = Math.round((100 - midpoint) * 10) / 10;
    } else if (pLoc > bLoc) {
      bShare = Math.round(midpoint * 10) / 10;
      pShare = Math.round((100 - midpoint) * 10) / 10;
    }

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏖️</span>
            <span>Hotelling Boardwalk Beach Catchment Map</span>
          </span>
          <span className="text-xs font-bold text-amber-400">
            Midpoint Boundary: Yard {midpoint.toFixed(1)}
          </span>
        </div>

        {/* Territory Catchment Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-blue-400">You (Pos {pLoc}): {pShare}% Beachgoers</span>
            <span className="text-amber-400">{botName} (Pos {bLoc}): {bShare}% Beachgoers</span>
          </div>

          <div className="h-6 w-full rounded-xl overflow-hidden flex border border-slate-800 relative shadow-inner">
            <div
              style={{ width: `${pLoc <= bLoc ? pShare : bShare}%` }}
              className={`${pLoc <= bLoc ? 'bg-blue-600/90' : 'bg-amber-600/90'} flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all`}
            >
              {pLoc <= bLoc ? `You (${pShare}%)` : `${botName} (${bShare}%)`}
            </div>
            <div
              style={{ width: `${pLoc <= bLoc ? bShare : pShare}%` }}
              className={`${pLoc <= bLoc ? 'bg-amber-600/90' : 'bg-blue-600/90'} flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all`}
            >
              {pLoc <= bLoc ? `${botName} (${bShare}%)` : `You (${pShare}%)`}
            </div>
          </div>
        </div>

        {/* Principle of Minimum Differentiation Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Principle of Minimum Differentiation:</span>
            <span className="text-slate-200 mt-0.5 block leading-relaxed">
              If your competitor sets up at Pos 40, placing your cart at Pos 41 gives you 59% of the beach. Both sellers gravitate to Pos 50.
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Socially Optimal Quartiles:</span>
            <span className="text-slate-200 mt-0.5 block leading-relaxed">
              To minimize total customer walking distance, stands should locate at Pos 25 and Pos 75. But competitive pressure pulls both to the center.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Game 23: Colonel Blotto 3-Front Battlefield Clash
  if (gameId === 23) {
    const pAlloc = blottoAllocations;
    const bAlloc = botBlottoAllocations;
    const frontResults = [
      { name: "Pass A (North)", p: pAlloc.a, b: bAlloc.a, winner: pAlloc.a > bAlloc.a ? 'Player' : bAlloc.a > pAlloc.a ? 'Bot' : 'Tie' },
      { name: "Pass B (Center)", p: pAlloc.b, b: bAlloc.b, winner: pAlloc.b > bAlloc.b ? 'Player' : bAlloc.b > pAlloc.b ? 'Bot' : 'Tie' },
      { name: "Pass C (South)", p: pAlloc.c, b: bAlloc.c, winner: pAlloc.c > bAlloc.c ? 'Player' : bAlloc.c > pAlloc.c ? 'Bot' : 'Tie' },
    ];
    const pWins = frontResults.filter(f => f.winner === 'Player').length;
    const bWins = frontResults.filter(f => f.winner === 'Bot').length;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚔️</span>
            <span>Colonel Blotto 3-Front Battlefield Matchup</span>
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            pWins > bWins
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : bWins > pWins
              ? 'bg-rose-950 text-rose-300 border-rose-700'
              : 'bg-slate-900 text-slate-300 border-slate-700'
          }`}>
            Campaign Tally: {pWins} - {bWins} {pWins > bWins ? '(Victory)' : bWins > pWins ? '(Defeat)' : '(Tie)'}
          </span>
        </div>

        {/* 3 Front Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {frontResults.map((f, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{f.name}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  f.winner === 'Player'
                    ? 'bg-blue-950 text-blue-300 border border-blue-700'
                    : f.winner === 'Bot'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {f.winner === 'Player' ? '✓ Won' : f.winner === 'Bot' ? '✗ Lost' : '= Tie'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-400 font-medium">You: {f.p} battalions</span>
                  <span className="text-amber-400 font-medium">{botName}: {f.b} battalions</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div style={{ width: `${Math.min(100, (f.p / (f.p + f.b || 1)) * 100)}%` }} className="bg-blue-500" />
                  <div style={{ width: `${Math.min(100, (f.b / (f.p + f.b || 1)) * 100)}%` }} className="bg-amber-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
          💡 <strong className="text-amber-300">Blotto Insight:</strong> Symmetrically guarding all passes (34/33/33) leaves every front vulnerable to a rival who concentrates 50 battalions on two passes and sacrifices the third with 0.
        </div>
      </div>
    );
  }

  // Game 24: Common-Value Oil Lease Auction & Winner's Curse Spectrum
  if (gameId === 24) {
    const trueVal = cvTrueValue;
    const pSig = cvPlayerSignal;
    const bSig = cvBotSignal;
    const pBid = cvBid;
    const bBid = botCvBid;
    const isWinnerCurse = pBid > trueVal && pBid > bBid;

    return (
      <div className="w-full bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🛢️</span>
            <span>Common-Value Spectrum & Winner's Curse Danger Zone</span>
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isWinnerCurse
              ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
              : 'bg-emerald-950 text-emerald-300 border-emerald-700'
          }`}>
            {isWinnerCurse ? '⚠️ Winner\'s Curse Triggered!' : '✓ Safe Margin'}
          </span>
        </div>

        {/* Valuation Spectrum Line */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>$20 Min Value</span>
            <span className="font-bold text-emerald-400">True Reserve Value V: ${trueVal.toFixed(1)}</span>
            <span>$80 Max Value</span>
          </div>

          <div className="h-6 w-full bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800 shadow-inner flex items-center">
            {/* Danger Zone: Any bid higher than True Value */}
            <div
              style={{ left: `${Math.max(0, ((trueVal - 20) / 60) * 100)}%`, width: `${Math.max(0, 100 - ((trueVal - 20) / 60) * 100)}%` }}
              className="absolute h-full bg-rose-950/40 border-l-2 border-rose-500 flex items-center justify-end pr-2 text-[10px] font-mono text-rose-400 font-bold pointer-events-none"
            >
              Overpayment Loss Zone (Bid &gt; V)
            </div>

            {/* True Value Pin */}
            <div
              style={{ left: `${Math.max(0, Math.min(100, ((trueVal - 20) / 60) * 100))}%` }}
              className="absolute top-0 bottom-0 w-1 bg-emerald-400 z-10"
              title={`True Value: $${trueVal}`}
            />

            {/* Player Bid Pin */}
            <div
              style={{ left: `${Math.max(0, Math.min(100, ((pBid - 20) / 60) * 100))}%` }}
              className="absolute top-0 bottom-0 w-1.5 bg-blue-500 z-20"
              title={`Your Bid: $${pBid}`}
            />
          </div>
        </div>

        {/* Signals and Bids Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Your Signal:</span>
            <span className="font-bold text-blue-300">${pSig.toFixed(2)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Your Bid:</span>
            <span className={`font-bold ${pBid > trueVal ? 'text-rose-400' : 'text-emerald-400'}`}>${pBid.toFixed(2)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">{botName} Signal:</span>
            <span className="font-bold text-amber-300">${bSig.toFixed(2)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">{botName} Bid:</span>
            <span className="font-bold text-amber-400">${bBid.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
          💡 <strong className="text-amber-300">Bayesian Updating:</strong> In common-value auctions, winning is informative bad news: it proves your private estimate was the highest among all bidders. Shading bids by at least $6 protects positive profit upon winning.
        </div>
      </div>
    );
  }

  return null;
};
