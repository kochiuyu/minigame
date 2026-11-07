import React from 'react';

interface AuctionSurplusVisualizerProps {
  isSecondPrice?: boolean;
  myBid: number;
  trueValuation: number;
  competitorBid?: number;
  maxBidRange?: number;
  title?: string;
}

export const AuctionSurplusVisualizer: React.FC<AuctionSurplusVisualizerProps> = ({
  isSecondPrice = true,
  myBid,
  trueValuation,
  competitorBid = 6,
  maxBidRange = 12,
  title = "Auction Expected Profit Curve"
}) => {
  const width = 280;
  const height = 200;
  const padding = 34;
  const graphW = width - padding * 2;
  const graphH = height - padding * 2;

  // Generate curve points for bid from 0 to maxBidRange
  const steps = 30;
  const curvePoints: Array<{ bid: number; profit: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const b = (i / steps) * maxBidRange;
    let profit = 0;
    if (isSecondPrice) {
      // In 2nd price: if b > competitorBid, you win and pay competitorBid
      // E[profit] = (win probability) * (v - competitorBid)
      const winProb = Math.min(1, Math.max(0, b / maxBidRange));
      profit = winProb * (trueValuation - competitorBid);
    } else {
      // In 1st price: if b wins, profit is (v - b)
      const winProb = Math.min(1, Math.max(0, b / maxBidRange));
      profit = winProb * (trueValuation - b);
    }
    curvePoints.push({ bid: b, profit });
  }

  const maxProfit = Math.max(...curvePoints.map(p => p.profit), 4);
  const minProfit = Math.min(...curvePoints.map(p => p.profit), -2);
  const profitRange = (maxProfit - minProfit) || 1;

  const toSvgX = (b: number) => padding + (b / maxBidRange) * graphW;
  const toSvgY = (p: number) => height - padding - ((p - minProfit) / profitRange) * graphH;

  const currentProfit = isSecondPrice
    ? myBid > competitorBid ? trueValuation - competitorBid : 0
    : myBid > competitorBid ? trueValuation - myBid : 0;

  const optimalBid = isSecondPrice ? trueValuation : trueValuation * 0.75;

  const pathD = curvePoints
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(pt.bid).toFixed(1)} ${toSvgY(pt.profit).toFixed(1)}`)
    .join(' ');

  return (
    <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col items-center select-none shadow-lg w-full">
      <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>📈</span>
          <span>{title}</span>
        </span>
        <span className={`text-[10px] font-mono font-bold ${currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          Profit: {currentProfit >= 0 ? `+$${currentProfit.toFixed(2)}` : `-$${Math.abs(currentProfit).toFixed(2)}`}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[340px] aspect-[280/200] overflow-visible">
        {/* Zero profit line */}
        <line
          x1={padding}
          y1={toSvgY(0)}
          x2={width - padding}
          y2={toSvgY(0)}
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="transition-all duration-300 ease-out"
        />

        {/* Profit Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          className="transition-all duration-300 ease-out"
        />

        {/* Competitor bid threshold line */}
        <line
          x1={toSvgX(competitorBid)}
          y1={padding}
          x2={toSvgX(competitorBid)}
          y2={height - padding}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="2 2"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(competitorBid)}
          y={padding - 4}
          fontSize="8"
          fill="#94a3b8"
          textAnchor="middle"
          fontFamily="monospace"
          className="transition-all duration-300 ease-out"
        >
          Rival: ${competitorBid}
        </text>

        {/* True valuation line */}
        <line
          x1={toSvgX(trueValuation)}
          y1={padding}
          x2={toSvgX(trueValuation)}
          y2={height - padding}
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(trueValuation)}
          y={height - 12}
          fontSize="8.5"
          fill="#10b981"
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="bold"
          className="transition-all duration-300 ease-out"
        >
          Val: ${trueValuation}
        </text>

        {/* Active Player Bid Point */}
        <circle
          cx={toSvgX(myBid)}
          cy={toSvgY(currentProfit)}
          r="7"
          fill={currentProfit >= 0 ? '#38bdf8' : '#ef4444'}
          stroke="#ffffff"
          strokeWidth="2"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(myBid)}
          y={toSvgY(currentProfit) - 10}
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
          fill="#ffffff"
          className="transition-all duration-300 ease-out"
        >
          Your Bid: ${myBid.toFixed(1)}
        </text>

        {/* Optimal Bid Peak */}
        <text
          x={toSvgX(optimalBid)}
          y={toSvgY(maxProfit) - 6}
          fontSize="8"
          fill="#fbbf24"
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="bold"
          className="transition-all duration-300 ease-out"
        >
          ★ Optimal: ${optimalBid.toFixed(1)}
        </text>
      </svg>

      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900 mt-1">
        <span>$0 Min Bid</span>
        <span className="text-emerald-400 font-bold">Optimal Bid: ${optimalBid.toFixed(2)}</span>
        <span>${maxBidRange} Cap</span>
      </div>
    </div>
  );
};
