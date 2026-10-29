import React from 'react';
import { BotArchetype } from '../services/botEngine';

interface InteractiveMatrixVisualizerProps {
  moduleId: number;
  selectedAction: any;
  botArchetype?: string | BotArchetype;
  anticipatedBotAction?: any;
  // Module-specific props
  auctionValuation?: number;
  auctionBid?: number;
  beautyGuess?: number;
  publicGoodsContr?: number;
  ultimatumOffer?: number;
  trustInvestment?: number;
  // Centipede Game props
  centipedeNode?: number;
  centipedePath?: Array<{ node: number; player: 'You' | 'Bot'; action: 'Take' | 'Pass'; payoffs?: { player: number; bot: number } }>;
  centipedeEnded?: boolean;
  centipedeExitNode?: number;
  centipedeExitAction?: 'Take' | 'Pass';
  onSelectAction?: (action: any) => void;
}

export const InteractiveMatrixVisualizer: React.FC<InteractiveMatrixVisualizerProps> = ({
  moduleId,
  selectedAction,
  botArchetype: _botArchetype,
  anticipatedBotAction,
  auctionValuation = 7,
  auctionBid = 7,
  beautyGuess = 33,
  publicGoodsContr = 10,
  ultimatumOffer = 4,
  trustInvestment = 5,
  centipedeNode = 1,
  centipedePath = [],
  centipedeEnded = false,
  centipedeExitNode,
  centipedeExitAction,
  onSelectAction
}) => {
  // 1. REPEATED PRISONER'S DILEMMA 2x2 MATRIX
  if (moduleId === 6 || moduleId === 1) {
    const isCoop = selectedAction === 'Cooperate';
    const isDefect = selectedAction === 'Defect';
    const botWillCoop = anticipatedBotAction === 'Cooperate';
    const botWillDefect = anticipatedBotAction === 'Defect';

    return (
      <div className="bg-slate-950/90 rounded-2xl p-2 sm:p-4 border border-slate-800 space-y-2.5 font-sans text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>⚡ Interactive Payoff Matrix</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-blue-400 font-semibold sm:font-bold">Live State Illumination</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Highlighted row = your candidate choice
          </span>
        </div>

        {/* 2x2 Matrix Grid - Fits 375px Without Scrollbar */}
        <div className="w-full">
          <div className="w-full grid grid-cols-12 gap-1 sm:gap-1.5 text-center font-mono">
            {/* Top-left empty spacer */}
            <div className="col-span-2"></div>

            {/* Bot Choice Column Headers */}
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Cooperates
              {botWillCoop && (
                <span className="block text-[11px] text-emerald-400 font-normal">
                  ● Anticipated
                </span>
              )}
            </div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Defects
              {botWillDefect && (
                <span className="block text-[11px] text-rose-400 font-normal">
                  ● Anticipated
                </span>
              )}
            </div>

            {/* Row 1: You Cooperate */}
            <div
              onClick={() => onSelectAction && onSelectAction('Cooperate')}
              className={`col-span-2 min-h-[44px] flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border font-bold text-[11px] cursor-pointer transition-all leading-tight text-center ${
                isCoop
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-1 ring-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>You</span>
              <span>Coop</span>
            </div>

            {/* Cell (Coop, Coop) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isCoop && botWillCoop
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-lg ring-2 ring-emerald-500/50'
                  : isCoop
                  ? 'bg-emerald-950/20 border-emerald-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-tight leading-tight break-words">
                Pareto Optimum
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-0.5">
                +$2 <span className="text-slate-400 font-normal">/</span> +$2
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: +$2 · Bot: +$2</div>
            </div>

            {/* Cell (Coop, Defect) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isCoop && botWillDefect
                  ? 'bg-rose-950/60 border-rose-500 shadow-lg ring-2 ring-rose-500/50'
                  : isCoop
                  ? 'bg-rose-950/20 border-rose-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-bold uppercase tracking-tight leading-tight break-words">
                Sucker's Payoff
              </div>
              <div className="text-sm sm:text-base font-black text-rose-300 mt-0.5">
                $0 <span className="text-slate-400 font-normal">/</span> +$3
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: $0 · Bot: +$3</div>
            </div>

            {/* Row 2: You Defect */}
            <div
              onClick={() => onSelectAction && onSelectAction('Defect')}
              className={`col-span-2 min-h-[44px] flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border font-bold text-[11px] cursor-pointer transition-all leading-tight text-center ${
                isDefect
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-1 ring-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>You</span>
              <span>Defect</span>
            </div>

            {/* Cell (Defect, Coop) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isDefect && botWillCoop
                  ? 'bg-amber-950/60 border-amber-500 shadow-lg ring-2 ring-amber-500/50'
                  : isDefect
                  ? 'bg-amber-950/20 border-amber-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-amber-400 font-bold uppercase tracking-tight leading-tight break-words">
                Temptation Payoff
              </div>
              <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
                +$3 <span className="text-slate-400 font-normal">/</span> $0
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: +$3 · Bot: $0</div>
            </div>

            {/* Cell (Defect, Defect) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isDefect && botWillDefect
                  ? 'bg-red-950/70 border-red-500 shadow-lg ring-2 ring-red-500/50'
                  : isDefect
                  ? 'bg-red-950/30 border-red-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-red-400 font-bold uppercase tracking-tight leading-tight break-words">
                Nash Trap
              </div>
              <div className="text-sm sm:text-base font-black text-slate-200 mt-0.5">
                +$1 <span className="text-slate-400 font-normal">/</span> +$1
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: +$1 · Bot: +$1</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. VICKREY SECOND-PRICE AUCTION SPECTRUM GAUGE
  if (moduleId === 7) {
    const isOverbidding = auctionBid > auctionValuation;
    const isUnderbidding = auctionBid < auctionValuation;
    const isTruthful = auctionBid === auctionValuation;

    return (
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 font-sans text-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🏷️ Vickrey Strategy Spectrum</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-blue-400 font-semibold sm:font-bold">Bid vs. Valuation</span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-md self-start sm:self-auto ${
              isTruthful
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : isOverbidding
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {isTruthful
              ? '✓ Weakly Dominant (b = v)'
              : isOverbidding
              ? '⚠️ Winner\'s Curse Risk (b > v)'
              : '⚡ Shaded Bidding (b < v)'}
          </span>
        </div>

        {/* Visual Spectrum Bar */}
        <div className="space-y-1.5">
          <div className="relative h-7 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center px-2">
            {/* Safe Surplus Zone */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 border-r border-emerald-500/40"
              style={{ width: `${(auctionValuation / 12) * 100}%` }}
              title="Positive surplus zone if 2nd price is in this range"
            />
            {/* Danger Zone (b > v) */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-rose-500/15"
              style={{ width: `${((12 - auctionValuation) / 12) * 100}%` }}
              title="Winner's curse zone if 2nd price > valuation"
            />

            {/* True Valuation Pin */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
              style={{ left: `${(auctionValuation / 12) * 100}%` }}
            />

            {/* Your Bid Pin */}
            <div
              className="absolute top-1 bottom-1 w-2.5 rounded-full bg-blue-500 border border-white shadow-md z-20 transition-all -ml-1.5"
              style={{ left: `${(auctionBid / 12) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>$0</span>
            <span className="text-amber-400 font-bold">
              True Value: ${auctionValuation}.00
            </span>
            <span className="text-blue-400 font-bold">
              Your Bid: ${auctionBid}.00
            </span>
            <span>$12.00</span>
          </div>
        </div>

        {/* Educational Micro-Explanation */}
        <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          {isTruthful && (
            <span>
              🌟 <strong>Optimal Alignment:</strong> Bidding your exact valuation ($
              {auctionValuation}) maximizes the chance of winning whenever price &lt; value, without ever risking paying more than value.
            </span>
          )}
          {isOverbidding && (
            <span className="text-rose-300">
              ⚠️ <strong>Winner's Curse Danger:</strong> If the bot bids ${auctionValuation + 1}, you will win but be forced to pay ${auctionValuation + 1}, taking a net loss!
            </span>
          )}
          {isUnderbidding && (
            <span className="text-amber-300">
              ⚡ <strong>Foregone Profit Risk:</strong> If the bot bids ${auctionBid + 0.5}, you will lose the item even though you could have bought it profitably below ${auctionValuation}!
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. KEYNESIAN BEAUTY CONTEST COGNITIVE DEPTH SPECTRUM
  if (moduleId === 11) {
    const guess = beautyGuess;
    const depthCategory =
      guess === 0
        ? 'Nash Equilibrium'
        : guess <= 25
        ? 'Level 2 Strategic'
        : guess <= 38
        ? 'Level 1 Naive'
        : 'Level 0 Random';

    return (
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 font-sans text-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>💭 Cognitive Depth Spectrum</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-indigo-400 font-semibold sm:font-bold">Level-k Reasoning</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 self-start sm:self-auto">
            {depthCategory} (Guess: {guess})
          </span>
        </div>

        {/* Visual Level-k Spectrum Track */}
        <div className="space-y-1.5">
          <div className="relative h-6 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {/* Level 0 indicator (50) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-500"
              style={{ left: '50%' }}
              title="Level 0: 50"
            />
            {/* Level 1 indicator (33.3) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
              style={{ left: '33.3%' }}
              title="Level 1: 33.3"
            />
            {/* Level 2 indicator (22.2) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-500"
              style={{ left: '22.2%' }}
              title="Level 2: 22.2"
            />
            {/* Nash indicator (0) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-blue-500"
              style={{ left: '0%' }}
              title="Nash: 0"
            />

            {/* Current guess pointer */}
            <div
              className="absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white shadow-md z-10 -ml-1.5 border border-indigo-500 transition-all"
              style={{ left: `${guess}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span className="text-blue-400 font-bold">0 (Nash)</span>
            <span className="text-emerald-400">22.2 (L2)</span>
            <span className="text-amber-400">33.3 (L1)</span>
            <span className="text-slate-400">50 (L0)</span>
            <span>100</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          Target is <strong className="text-amber-300">2/3 of the average</strong>. If others guess randomly (~50), best response is 33.3. If others calculate 33.3, best response is 22.2.
        </p>
      </div>
    );
  }

  // 4. PUBLIC GOODS DILEMMA TOKEN ALLOCATION METER
  if (moduleId === 12) {
    const kept = 20 - publicGoodsContr;
    const poolMultiplied = publicGoodsContr * 1.6;
    const privateDividend = Math.round((poolMultiplied / 2) * 10) / 10;
    const totalReturnPreview = Math.round((kept + privateDividend) * 10) / 10;

    return (
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 font-sans text-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🌍 Token Allocation & Payoff Breakdown</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-bold self-start sm:self-auto">
            Projected: ${totalReturnPreview}
          </span>
        </div>

        {/* Visual Split Bar */}
        <div className="h-6 rounded-xl overflow-hidden flex border border-slate-800 font-mono text-[10px] font-bold">
          <div
            className="bg-slate-800 text-slate-300 flex items-center justify-center transition-all"
            style={{ width: `${(kept / 20) * 100}%` }}
            title={`Private Vault: ${kept} tokens`}
          >
            {kept > 2 && `${kept} Private`}
          </div>
          <div
            className="bg-emerald-600 text-white flex items-center justify-center transition-all"
            style={{ width: `${(publicGoodsContr / 20) * 100}%` }}
            title={`Public Pool: ${publicGoodsContr} tokens`}
          >
            {publicGoodsContr > 2 && `${publicGoodsContr} Public (x1.6)`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[9px] uppercase">Private Safe:</span>
            <span className="text-white font-bold">${kept}.00</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-emerald-400 block text-[9px] uppercase">Your Public Share:</span>
            <span className="text-emerald-300 font-bold">+${privateDividend} (from pool)</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. STAG HUNT 2x2 COORDINATION MATRIX
  if (moduleId === 13) {
    const isStag = selectedAction === 'Stag';
    const isHare = selectedAction === 'Hare';
    const botWillStag = anticipatedBotAction === 'Stag';
    const botWillHare = anticipatedBotAction === 'Hare';

    return (
      <div className="bg-slate-950/90 rounded-2xl p-2 sm:p-4 border border-slate-800 space-y-2.5 font-sans text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🦌 Stag Hunt Payoff Matrix</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-emerald-400 font-semibold sm:font-bold">Trust & Coordination</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Highlighted row = your candidate choice
          </span>
        </div>

        {/* 2x2 Matrix Grid - Fits 375px Without Scrollbar */}
        <div className="w-full">
          <div className="w-full grid grid-cols-12 gap-1 sm:gap-1.5 text-center font-mono">
            <div className="col-span-2"></div>

            {/* Bot Choice Headers */}
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Hunts Stag
              {botWillStag && (
                <span className="block text-[11px] text-emerald-400 font-normal">
                  ● Anticipated
                </span>
              )}
            </div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Hunts Hare
              {botWillHare && (
                <span className="block text-[11px] text-amber-400 font-normal">
                  ● Anticipated
                </span>
              )}
            </div>

            {/* Row 1: You Hunt Stag */}
            <div
              onClick={() => onSelectAction && onSelectAction('Stag')}
              className={`col-span-2 min-h-[44px] flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border font-bold text-[11px] cursor-pointer transition-all leading-tight text-center ${
                isStag
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-1 ring-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>You</span>
              <span>Stag</span>
            </div>

            {/* Cell (Stag, Stag) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isStag && botWillStag
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-lg ring-2 ring-emerald-500/50'
                  : isStag
                  ? 'bg-emerald-950/30 border-emerald-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-tight leading-tight break-words">
                Payoff Dominant (Max)
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-0.5">
                +$10 <span className="text-slate-400 font-normal">/</span> +$10
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: +$10 · Bot: +$10</div>
            </div>

            {/* Cell (Stag, Hare) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isStag && botWillHare
                  ? 'bg-rose-950/70 border-rose-500 shadow-lg ring-2 ring-rose-500/50'
                  : isStag
                  ? 'bg-rose-950/30 border-rose-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-bold uppercase tracking-tight leading-tight break-words">
                Starvation Risk
              </div>
              <div className="text-sm sm:text-base font-black text-rose-300 mt-0.5">
                $0 <span className="text-slate-400 font-normal">/</span> +$4
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: $0 · Bot: +$4</div>
            </div>

            {/* Row 2: You Hunt Hare */}
            <div
              onClick={() => onSelectAction && onSelectAction('Hare')}
              className={`col-span-2 min-h-[44px] flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border font-bold text-[11px] cursor-pointer transition-all leading-tight text-center ${
                isHare
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-1 ring-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>You</span>
              <span>Hare</span>
            </div>

            {/* Cell (Hare, Stag) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isHare && botWillStag
                  ? 'bg-amber-950/70 border-amber-500 shadow-lg ring-2 ring-amber-500/50'
                  : isHare
                  ? 'bg-amber-950/30 border-amber-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-amber-400 font-bold uppercase tracking-tight leading-tight break-words">
                Safe Free-Ride
              </div>
              <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
                +$4 <span className="text-slate-400 font-normal">/</span> $0
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: +$4 · Bot: $0</div>
            </div>

            {/* Cell (Hare, Hare) */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border transition-all text-center ${
                isHare && botWillHare
                  ? 'bg-blue-950/70 border-blue-500 shadow-lg ring-2 ring-blue-500/50'
                  : isHare
                  ? 'bg-blue-950/30 border-blue-900/60'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-blue-400 font-bold uppercase tracking-tight leading-tight break-words">
                Risk-Dominant Nash
              </div>
              <div className="text-sm sm:text-base font-black text-slate-200 mt-0.5">
                +$4 <span className="text-slate-400 font-normal">/</span> +$4
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">You: +$4 · Bot: +$4</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. BERTRAND DUOPOLY PRICE COMPETITION VISUALIZER
  if (moduleId === 14) {
    const studentPrice = Number(selectedAction) || 35;
    const botPrice = Number(anticipatedBotAction) || 35;
    const mc = 10;
    const qTotal = Math.max(0, 100 - studentPrice);

    let marketShare = 0;
    let projectedProfit = 0;

    if (studentPrice < botPrice) {
      marketShare = 100;
      projectedProfit = (studentPrice - mc) * qTotal;
    } else if (studentPrice === botPrice) {
      marketShare = 50;
      projectedProfit = ((studentPrice - mc) * qTotal) / 2;
    } else {
      marketShare = 0;
      projectedProfit = 0;
    }

    return (
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 font-sans text-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🏷️ Bertrand Market Share & Margin Visualizer</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-blue-400 font-semibold sm:font-bold">MC = $10</span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-md self-start sm:self-auto ${
              marketShare === 100
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : marketShare === 50
                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            {marketShare === 100
              ? '✓ 100% Market Captured (Lower Price)'
              : marketShare === 50
              ? '🤝 50% Market Split (Tied Price)'
              : '✗ 0% Market (Undercut by Rival)'}
          </span>
        </div>

        {/* Visual Market Split Bar */}
        <div className="h-6 rounded-xl overflow-hidden flex border border-slate-800 font-mono text-[10px] font-bold">
          <div
            className="bg-blue-600 text-white flex items-center justify-center transition-all duration-300"
            style={{ width: `${marketShare}%` }}
          >
            {marketShare > 0 && `Your Share: ${marketShare}%`}
          </div>
          <div
            className="bg-slate-800 text-slate-400 flex items-center justify-center transition-all duration-300"
            style={{ width: `${100 - marketShare}%` }}
          >
            {(100 - marketShare) > 0 && `Bot Share: ${100 - marketShare}%`}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase block">Your Price</span>
            <span className="text-white font-bold">${studentPrice}.00</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase block">Margin (P - MC)</span>
            <span className="text-emerald-400 font-bold">${studentPrice - mc}.00</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase block">Projected Profit</span>
            <span className="text-blue-300 font-black">${Math.round(projectedProfit)} pts</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. HAWK-DOVE / CHICKEN 2x2 MATRIX (Module 15)
  if (moduleId === 15) {
    const isDove = selectedAction === 'Dove';
    const isHawk = selectedAction === 'Hawk';
    const botWillDove = anticipatedBotAction === 'Dove';
    const botWillHawk = anticipatedBotAction === 'Hawk';
    const isCrash = isHawk && botWillHawk;

    return (
      <div className="bg-slate-950/90 rounded-2xl p-2 sm:p-4 border border-slate-800 space-y-2.5 font-sans text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🦅 Hawk-Dove Payoff Matrix</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-rose-400 font-semibold sm:font-bold">Collision Radar</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {isCrash ? '⚠️ Catastrophic Clash Risk' : 'Live State Illumination'}
          </span>
        </div>

        {/* Collision Danger Warning Banner */}
        {isCrash && (
          <div className="p-2 sm:p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 font-mono text-xs flex items-center gap-2 animate-pulse">
            <span className="text-base sm:text-lg">💥</span>
            <div className="leading-tight text-[11px] sm:text-xs">
              <strong>MUTUAL HAWK COLLISION DETECTED!</strong> Both players crash into the -10 catastrophe zone.
            </div>
          </div>
        )}

        {/* 2x2 Matrix Grid - Fits 375px Without Scrollbar */}
        <div className="w-full">
          <div className="w-full grid grid-cols-12 gap-1 sm:gap-1.5 text-center font-mono">
            <div className="col-span-2"></div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Plays Dove
              {botWillDove && <span className="block text-[11px] text-emerald-400 font-normal">● Anticipated</span>}
            </div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Plays Hawk
              {botWillHawk && <span className="block text-[11px] text-rose-400 font-normal">● Anticipated</span>}
            </div>

            {/* Row 1: You Dove */}
            <div
              onClick={() => onSelectAction && onSelectAction('Dove')}
              className={`col-span-2 min-h-[44px] py-1.5 px-0.5 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all leading-tight text-center ${
                isDove ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base">🕊️</span>
              <span className="text-[11px] font-bold mt-0.5">Dove</span>
            </div>

            {/* Cell: You Dove, Bot Dove */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isDove && botWillDove ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-slate-300 font-sans font-bold leading-tight break-words">Equal Split</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-emerald-400">+3</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-300">+3</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5 leading-tight">Mutual Peace</div>
            </div>

            {/* Cell: You Dove, Bot Hawk */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isDove && botWillHawk ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/40' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-slate-300 font-sans font-bold leading-tight break-words">You Concede</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-amber-400">0</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-300">+6</span>
              </div>
              <div className="text-[11px] text-amber-400 font-mono mt-0.5 leading-tight">Nash Equilibrium</div>
            </div>

            {/* Row 2: You Hawk */}
            <div
              onClick={() => onSelectAction && onSelectAction('Hawk')}
              className={`col-span-2 min-h-[44px] py-1.5 px-0.5 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all leading-tight text-center ${
                isHawk ? 'bg-rose-950/60 border-rose-500 text-white font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base">🦅</span>
              <span className="text-[11px] font-bold mt-0.5">Hawk</span>
            </div>

            {/* Cell: You Hawk, Bot Dove */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isHawk && botWillDove ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-slate-300 font-sans font-bold leading-tight break-words">You Exploit</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-emerald-400">+6</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-300">0</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5 leading-tight">Nash Equilibrium</div>
            </div>

            {/* Cell: You Hawk, Bot Hawk */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isHawk && botWillHawk ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-500 animate-pulse' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-sans font-bold leading-tight break-words">Crash!</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-rose-400">-10</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-rose-400">-10</span>
              </div>
              <div className="text-[11px] text-rose-400 font-mono mt-0.5 leading-tight">Mutual Ruin</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. ULTIMATUM BARGAINING VISUAL SPLIT & ACCEPTANCE GAUGE (Module 16 & 9)
  if (moduleId === 16 || moduleId === 9) {
    const offer = Number(ultimatumOffer) || 4;
    const proposerKeep = Math.max(0, 10 - offer);
    const offerPct = (offer / 10) * 100;
    const isEgalitarian = offer >= 4.5;
    const isFair = offer >= 3 && offer < 4.5;

    return (
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 font-sans text-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🍰 Ultimatum $10 Surplus Split & Acceptance Radar</span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-md self-start sm:self-auto ${
              isEgalitarian
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : isFair
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            {isEgalitarian
              ? '✓ Egalitarian Offer (~98% Acceptance)'
              : isFair
              ? '⚖️ Moderate Split (~65% Acceptance Risk)'
              : '⚠️ High Rejection Risk (<30% Fair Value)'}
          </span>
        </div>

        {/* Visual Pie/Bar Split */}
        <div className="h-7 rounded-xl overflow-hidden flex border border-slate-800 font-mono text-[11px] font-bold">
          <div
            className="bg-blue-600 text-white flex items-center justify-center transition-all duration-300"
            style={{ width: `${100 - offerPct}%` }}
          >
            You Keep: ${proposerKeep.toFixed(1)}
          </div>
          <div
            className={`flex items-center justify-center transition-all duration-300 ${
              isEgalitarian ? 'bg-emerald-600 text-white' : isFair ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
            }`}
            style={{ width: `${offerPct}%` }}
          >
            Offer: ${offer.toFixed(1)}
          </div>
        </div>

        {/* 3 Outcome Forecast Cards */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase block">Your Proposed Share</span>
            <span className="text-blue-400 font-bold text-sm">${proposerKeep.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase block">Responder Payout</span>
            <span className="text-emerald-400 font-bold text-sm">${offer.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase block">Payoff if Rejected</span>
            <span className="text-rose-400 font-bold text-sm">$0.00 each</span>
          </div>
        </div>
      </div>
    );
  }

  // 8. MATCHING PENNIES 2x2 ZERO-SUM MATRIX (Module 17)
  if (moduleId === 17) {
    const isHeads = selectedAction === 'Heads';
    const isTails = selectedAction === 'Tails';
    const botWillHeads = anticipatedBotAction === 'Heads';
    const botWillTails = anticipatedBotAction === 'Tails';

    return (
      <div className="bg-slate-950/90 rounded-2xl p-2 sm:p-4 border border-slate-800 space-y-2.5 font-sans text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🪙 Matching Pennies Payoff Matrix</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-blue-400 font-semibold sm:font-bold">Pure Conflict Zero-Sum</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono leading-tight">
            You: Matcher (wants Match) · Bot: Mismatcher (wants Differ)
          </span>
        </div>

        {/* 2x2 Matrix Grid - Fits 375px Without Scrollbar */}
        <div className="w-full">
          <div className="w-full grid grid-cols-12 gap-1 sm:gap-1.5 text-center font-mono">
            <div className="col-span-2"></div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Plays Heads
              {botWillHeads && <span className="block text-[11px] text-amber-400 font-normal">● Anticipated</span>}
            </div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Plays Tails
              {botWillTails && <span className="block text-[11px] text-amber-400 font-normal">● Anticipated</span>}
            </div>

            {/* Row 1: You Heads */}
            <div
              onClick={() => onSelectAction && onSelectAction('Heads')}
              className={`col-span-2 min-h-[44px] py-1.5 px-0.5 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all leading-tight text-center ${
                isHeads ? 'bg-indigo-950/70 border-indigo-500 text-white font-bold ring-1 ring-indigo-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base">👑</span>
              <span className="text-[11px] font-bold mt-0.5">Heads</span>
            </div>

            {/* Cell (Heads, Heads) - Match! You Win */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isHeads && botWillHeads ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-emerald-400 font-sans font-bold leading-tight break-words">MATCH! (Win)</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-emerald-400">+2</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-400">0</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: +2 · Bot: 0</div>
            </div>

            {/* Cell (Heads, Tails) - Mismatch! Bot Wins */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isHeads && botWillTails ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-sans font-bold leading-tight break-words">MISMATCH (Loss)</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-rose-400">0</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-300">+2</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: 0 · Bot: +2</div>
            </div>

            {/* Row 2: You Tails */}
            <div
              onClick={() => onSelectAction && onSelectAction('Tails')}
              className={`col-span-2 min-h-[44px] py-1.5 px-0.5 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all leading-tight text-center ${
                isTails ? 'bg-indigo-950/70 border-indigo-500 text-white font-bold ring-1 ring-indigo-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base">🪙</span>
              <span className="text-[11px] font-bold mt-0.5">Tails</span>
            </div>

            {/* Cell (Tails, Heads) - Mismatch! Bot Wins */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isTails && botWillHeads ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-sans font-bold leading-tight break-words">MISMATCH (Loss)</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-rose-400">0</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-300">+2</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: 0 · Bot: +2</div>
            </div>

            {/* Cell (Tails, Tails) - Match! You Win */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isTails && botWillTails ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-emerald-400 font-sans font-bold leading-tight break-words">MATCH! (Win)</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-emerald-400">+2</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-400">0</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: +2 · Bot: 0</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9. BATTLE OF THE SEXES 2x2 COORDINATION MATRIX (Module 18)
  if (moduleId === 18) {
    const isOpera = selectedAction === 'Opera';
    const isFootball = selectedAction === 'Football';
    const botWillOpera = anticipatedBotAction === 'Opera';
    const botWillFootball = anticipatedBotAction === 'Football';
    const isCoordinated = (isOpera && botWillOpera) || (isFootball && botWillFootball);

    return (
      <div className="bg-slate-950/90 rounded-2xl p-2 sm:p-4 border border-slate-800 space-y-2.5 font-sans text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🎭 Battle of the Sexes Payoff Matrix</span>
          </div>
          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md self-start sm:self-auto ${
            isCoordinated
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}>
            {isCoordinated ? '✓ Coordination Achieved' : '⚠️ Miscoordination Risk'}
          </span>
        </div>

        {/* 2x2 Matrix Grid - Fits 375px Without Scrollbar */}
        <div className="w-full">
          <div className="w-full grid grid-cols-12 gap-1 sm:gap-1.5 text-center font-mono">
            <div className="col-span-2"></div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Plays Opera
              {botWillOpera && <span className="block text-[11px] text-blue-400 font-normal">● Anticipated</span>}
            </div>
            <div className="col-span-5 bg-slate-900/90 py-1.5 px-1 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 leading-tight">
              Bot Plays Football
              {botWillFootball && <span className="block text-[11px] text-amber-400 font-normal">● Anticipated</span>}
            </div>

            {/* Row 1: You Opera */}
            <div
              onClick={() => onSelectAction && onSelectAction('Opera')}
              className={`col-span-2 min-h-[44px] py-1.5 px-0.5 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all leading-tight text-center ${
                isOpera ? 'bg-purple-950/70 border-purple-500 text-white font-bold ring-1 ring-purple-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base">🎭</span>
              <span className="text-[11px] font-bold mt-0.5">Opera</span>
            </div>

            {/* Cell (Opera, Opera) - Your Top Nash */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isOpera && botWillOpera ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-emerald-400 font-sans font-bold leading-tight break-words">Your Top Nash</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-emerald-400">+3</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-300">+2</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: +3 · Bot: +2</div>
            </div>

            {/* Cell (Opera, Football) - Miscoordination */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isOpera && botWillFootball ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-sans font-bold leading-tight break-words">Miscoordination</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-rose-400">0</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-rose-400">0</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: 0 · Bot: 0</div>
            </div>

            {/* Row 2: You Football */}
            <div
              onClick={() => onSelectAction && onSelectAction('Football')}
              className={`col-span-2 min-h-[44px] py-1.5 px-0.5 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all leading-tight text-center ${
                isFootball ? 'bg-amber-950/70 border-amber-500 text-white font-bold ring-1 ring-amber-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base">⚽</span>
              <span className="text-[11px] font-bold mt-0.5">Football</span>
            </div>

            {/* Cell (Football, Opera) - Miscoordination */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isFootball && botWillOpera ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-rose-400 font-sans font-bold leading-tight break-words">Miscoordination</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-rose-400">0</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-rose-400">0</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: 0 · Bot: 0</div>
            </div>

            {/* Cell (Football, Football) - Bot's Top Nash */}
            <div
              className={`col-span-5 p-1 sm:p-2.5 rounded-xl border flex flex-col justify-center items-center transition-all text-center ${
                isFootball && botWillFootball ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[11px] text-blue-400 font-sans font-bold leading-tight break-words">Bot's Top Nash</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">
                <span className="text-slate-300">+2</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-blue-400">+3</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-tight">You: +2 · Bot: +3</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 10. THE TRUST GAME MULTIPLIER & SPLIT RADAR (Module 19)
  if (moduleId === 19) {
    const sent = Number(trustInvestment) || 0;
    const kept = Math.max(0, 10 - sent);
    const tripled = sent * 3;
    const fairReturn = Math.round(sent * 1.5 * 10) / 10;
    const fairInvestorTotal = kept + fairReturn;

    return (
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 font-sans text-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
            <span>🏦 Trust & Investment Tripling Visualizer</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-bold self-start sm:self-auto">
            Tripled Value: ${tripled}.00
          </span>
        </div>

        {/* Visual Split Bar */}
        <div className="h-7 rounded-xl overflow-hidden flex border border-slate-800 font-mono text-[11px] font-bold">
          <div
            className="bg-slate-800 text-slate-300 flex items-center justify-center transition-all duration-300"
            style={{ width: `${(kept / 10) * 100}%` }}
          >
            {kept > 1 && `Safe Vault: $${kept}`}
          </div>
          <div
            className="bg-emerald-600 text-white flex items-center justify-center transition-all duration-300"
            style={{ width: `${(sent / 10) * 100}%` }}
          >
            {sent > 1 && `Invested: $${sent} (x3 = $${tripled})`}
          </div>
        </div>

        {/* 3 Outcome Forecast Cards */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[9px] uppercase block">Safe Vault Kept</span>
            <span className="text-white font-bold text-sm">${kept}.00</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-emerald-400 text-[9px] uppercase block">Tripled Trustee Fund</span>
            <span className="text-emerald-300 font-bold text-sm">${tripled}.00</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-blue-400 text-[9px] uppercase block">If 50/50 Fair Split</span>
            <span className="text-blue-300 font-bold text-sm">${fairInvestorTotal.toFixed(1)} pts</span>
          </div>
        </div>
      </div>
    );
  }

  // 11. THE CENTIPEDE GAME EXTENSIVE FORM TREE (Module 20)
  if (moduleId === 20) {
    const nodes = [
      { id: 1, player: 'You' as const, pot: 2, takeYou: 2, takeBot: 0, spneAction: 'Take' },
      { id: 2, player: 'Bot' as const, pot: 5, takeYou: 1, takeBot: 4, spneAction: 'Take' },
      { id: 3, player: 'You' as const, pot: 6, takeYou: 4, takeBot: 2, spneAction: 'Take' },
      { id: 4, player: 'Bot' as const, pot: 9, takeYou: 3, takeBot: 6, spneAction: 'Take' },
      { id: 5, player: 'You' as const, pot: 10, takeYou: 6, takeBot: 4, spneAction: 'Take' },
      { id: 6, player: 'Bot' as const, pot: 13, takeYou: 5, takeBot: 8, spneAction: 'Take' }
    ];

    // Find what happened in the current or most recent path
    const passedNodes = new Set(
      centipedePath.filter(p => p.action === 'Pass').map(p => p.node)
    );
    const takenEntry = centipedePath.find(p => p.action === 'Take');
    const exitNodeId = centipedeExitNode || takenEntry?.node;
    const isTerminalReached = centipedeEnded && (!exitNodeId || exitNodeId > 6 || (passedNodes.has(6) && !takenEntry));

    return (
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 sm:space-y-4 font-sans text-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🐛 Extensive-Form Payoff Tree · 6-Node Chain (You: 1, 3, 5 · Bot: 2, 4, 6)</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-800/80 text-[10px] font-mono font-bold text-rose-300">
              SPNE: Take at Node 1 (2, 0)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-mono font-bold text-emerald-300">
              Pareto Optimum: Terminal Pass (8, 8)
            </span>
          </div>
        </div>

        {/* Mobile Swipe Guidance Banner */}
        <div className="sm:hidden text-[10px] text-slate-400 font-mono text-center py-1.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-1.5">
          <span>↔️</span>
          <span>Swipe horizontally to view all 6 decision nodes & payoffs</span>
        </div>

        {/* Tree Path Diagram (Horizontal Scrolling with Touch Pan) */}
        <div className="overflow-x-auto max-w-full touch-pan-x pb-2 pt-1 overscroll-x-contain scrollbar-thin">
          <div className="min-w-[620px] sm:min-w-[700px] flex items-stretch gap-1.5">
            {nodes.map((n, idx) => {
              const isCurrent = centipedeNode === n.id && !centipedeEnded;
              const isPastPassed = passedNodes.has(n.id);
              const isExitTaken = exitNodeId === n.id && (centipedeExitAction === 'Take' || takenEntry?.action === 'Take');
              const isCandidateChoice = isCurrent && n.player === 'You';
              const candidateIsTake = isCandidateChoice && selectedAction === 'Take';
              const candidateIsPass = isCandidateChoice && selectedAction === 'Pass';

              return (
                <div key={n.id} className="flex-1 flex flex-col justify-between">
                  {/* Node Header & Player Indicator */}
                  <div
                    className={`p-2.5 rounded-xl border transition-all relative ${
                      isCurrent
                        ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/40 shadow-lg'
                        : isExitTaken
                        ? 'bg-rose-950/40 border-rose-600/80'
                        : isPastPassed
                        ? 'bg-emerald-950/30 border-emerald-700/60'
                        : 'bg-slate-900/80 border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Node Number & Actor */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Node {n.id}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                          n.player === 'You'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {n.player}
                      </span>
                    </div>

                    {/* Active turn or Status Pulse */}
                    {isCurrent && (
                      <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1 mb-1 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        <span>{n.player === 'You' ? 'Your Choice' : "Bot Deciding..."}</span>
                      </div>
                    )}

                    {isPastPassed && (
                      <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                        <span>✓ Passed (Pot Grew)</span>
                      </div>
                    )}

                    {isExitTaken && (
                      <div className="text-[10px] font-bold text-rose-400 flex items-center gap-1 mb-1">
                        <span>🛑 Took (Game Ended)</span>
                      </div>
                    )}

                    {/* Pass Action Indicator (Moves Right) */}
                    <div
                      className={`mt-1 p-1.5 rounded-lg border text-center transition-all ${
                        candidateIsPass
                          ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold ring-1 ring-emerald-400'
                          : isPastPassed
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono font-semibold flex items-center justify-center gap-1">
                        <span>Pass ➔</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Pass to {idx < 5 ? nodes[idx + 1].player : 'Terminal'}</div>
                    </div>

                    {/* Take Branch (Ends Game Downward) */}
                    <div
                      className={`mt-2 p-1.5 rounded-lg border text-center transition-all ${
                        candidateIsTake
                          ? 'bg-amber-600/30 border-amber-400 text-white font-bold ring-1 ring-amber-400'
                          : isExitTaken
                          ? 'bg-rose-900/60 border-rose-500 text-white ring-1 ring-rose-400 shadow-md'
                          : 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold text-rose-400 flex items-center justify-center gap-1">
                        <span>↓ Take Pot</span>
                      </div>
                      <div className="text-xs font-mono font-black mt-0.5">
                        <span className="text-sky-300">+{n.takeYou}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-amber-300">+{n.takeBot}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        You: {n.takeYou} · Bot: {n.takeBot}
                      </div>
                    </div>

                    {/* Backward Induction SPNE Marker */}
                    <div className="mt-2 text-[10px] font-mono text-center text-rose-400/80 border-t border-slate-800/80 pt-1">
                      SPNE: Take ({n.player === 'You' ? n.takeYou : n.takeBot} &gt; {n.player === 'You' ? (idx < 5 ? nodes[idx + 1].takeYou : 7) : (idx < 5 ? nodes[idx + 1].takeBot : 7)})
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Terminal Cooperative Outcome Node */}
            <div className="w-28 flex flex-col justify-between shrink-0">
              <div
                className={`p-2.5 rounded-xl border h-full flex flex-col justify-between transition-all ${
                  isTerminalReached
                    ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      Terminal
                    </span>
                    <span className="text-sm">🏆</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-300 uppercase">
                    Mutual Pass
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Both passed all 6 decision nodes!
                  </div>
                </div>

                <div className="mt-2 p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-center font-mono">
                  <div className="text-sm font-black text-emerald-300">
                    +8 <span className="text-slate-500">/</span> +8
                  </div>
                  <div className="text-[10px] text-emerald-400">You: 8 · Bot: 8</div>
                </div>

                <div className="mt-1 text-[10px] font-mono text-center text-emerald-400/80 border-t border-emerald-900/60 pt-1">
                  Pareto Optimum
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Match Status Card - Responsive Stacking */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <div>
              <span className="font-bold text-white">Backward Induction Paradox:</span>{' '}
              <span className="text-slate-400">
                Backward induction forces rational play to unravel from Node 6 back to Node 1. Real humans who trust each other earn up to 4x more!
              </span>
            </div>
          </div>
          <div className="font-mono text-xs font-bold shrink-0 sm:text-right">
            <span className="text-slate-400 block text-[10px] uppercase">Active Stage</span>
            <span className={centipedeEnded ? 'text-amber-400' : 'text-blue-400'}>
              {centipedeEnded
                ? isTerminalReached
                  ? 'Cooperative Finish!'
                  : `Ended at Node ${exitNodeId || '1'}`
                : `Node ${centipedeNode} / 6 (${centipedeNode % 2 === 1 ? 'Your Turn' : "Bot's Turn"})`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
