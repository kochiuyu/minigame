import React from 'react';

interface CommonsResourceVisualizerProps {
  effortP1: number;
  effortP2: number;
  carryingCapacity?: number;
  title?: string;
}

export const CommonsResourceVisualizer: React.FC<CommonsResourceVisualizerProps> = ({
  effortP1,
  effortP2,
  carryingCapacity = 100,
  title = "Renewable Stock & Harvest Dynamics"
}) => {
  const width = 280;
  const height = 200;
  const padding = 34;
  const graphW = width - padding * 2;
  const graphH = height - padding * 2;

  const totalEffort = effortP1 + effortP2;
  // Sustainable harvest limit: max effort 6
  const isSustainable = totalEffort <= 6;
  const stockLevel = Math.max(0, Math.min(100, 100 - totalEffort * 12));

  // Parabola for natural growth g(S)
  const steps = 25;
  const growthPoints: Array<{ s: number; g: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const s = (i / steps) * carryingCapacity;
    // Logistic curve: 4 * (S/K) * (1 - S/K) * 25
    const g = 4 * (s / carryingCapacity) * (1 - s / carryingCapacity) * 25;
    growthPoints.push({ s, g });
  }

  const toSvgX = (s: number) => padding + (s / carryingCapacity) * graphW;
  const toSvgY = (val: number) => height - padding - (val / 30) * graphH;

  const growthPathD = growthPoints
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(pt.s).toFixed(1)} ${toSvgY(pt.g).toFixed(1)}`)
    .join(' ');

  // Linear harvest line for current effort
  const harvestRate = totalEffort * 2.8;

  return (
    <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col items-center select-none shadow-lg w-full">
      <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>🐟</span>
          <span>{title}</span>
        </span>
        <span className={`text-[10px] font-mono font-bold ${isSustainable ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isSustainable ? '● Sustainable Equilibrium' : '▲ Extinction Risk'}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[340px] aspect-[280/200] overflow-visible">
        {/* Natural Stock Growth Curve (Green Parabola) */}
        <path
          d={growthPathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(50)}
          y={toSvgY(25) - 6}
          fontSize="8"
          fill="#10b981"
          textAnchor="middle"
          fontFamily="monospace"
          className="transition-all duration-300 ease-out"
        >
          Natural Regeneration Curve
        </text>

        {/* Harvest Rate Line (Red horizontal extraction line) */}
        <line
          x1={padding}
          y1={toSvgY(harvestRate)}
          x2={width - padding}
          y2={toSvgY(harvestRate)}
          stroke={isSustainable ? '#38bdf8' : '#f43f5e'}
          strokeWidth="2"
          strokeDasharray="4 2"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={width - padding}
          y={toSvgY(harvestRate) - 5}
          fontSize="8"
          fill={isSustainable ? '#38bdf8' : '#f43f5e'}
          textAnchor="end"
          fontFamily="monospace"
          fontWeight="bold"
          className="transition-all duration-300 ease-out"
        >
          Extraction Rate ({totalEffort} boats)
        </text>

        {/* Current Stock Marker */}
        <line
          x1={toSvgX(stockLevel)}
          y1={padding}
          x2={toSvgX(stockLevel)}
          y2={height - padding}
          stroke="#e2e8f0"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          className="transition-all duration-300 ease-out"
        />
        <circle
          cx={toSvgX(stockLevel)}
          cy={toSvgY(isSustainable ? harvestRate : 0)}
          r="6"
          fill={isSustainable ? '#10b981' : '#f43f5e'}
          stroke="#ffffff"
          strokeWidth="2"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(stockLevel)}
          y={height - 12}
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
          fill={isSustainable ? '#10b981' : '#f43f5e'}
          className="transition-all duration-300 ease-out"
        >
          Stock: {stockLevel}%
        </text>

        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
      </svg>

      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900 mt-1">
        <span>0 Depleted</span>
        <span className="text-emerald-400 font-bold">Max Sustainable: 6 Boats</span>
        <span>100 Carrying Cap</span>
      </div>
    </div>
  );
};
