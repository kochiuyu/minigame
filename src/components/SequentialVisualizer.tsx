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

  return null;
};
