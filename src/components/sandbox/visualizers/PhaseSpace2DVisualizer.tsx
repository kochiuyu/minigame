import React from 'react';

interface PhaseSpace2DVisualizerProps {
  r1Label?: string;
  r2Label?: string;
  c1Label?: string;
  c2Label?: string;
  a11: number; // P1 payoff at R1, C1
  a12: number; // P1 payoff at R1, C2
  a21: number; // P1 payoff at R2, C1
  a22: number; // P1 payoff at R2, C2
  b11: number; // P2 payoff at R1, C1
  b12: number; // P2 payoff at R1, C2
  b21: number; // P2 payoff at R2, C1
  b22: number; // P2 payoff at R2, C2
  onSelectPoint?: (p: number, q: number) => void;
}

export const PhaseSpace2DVisualizer: React.FC<PhaseSpace2DVisualizerProps> = ({
  r1Label = 'Cooperate',
  r2Label = 'Defect',
  c1Label = 'Cooperate',
  c2Label = 'Defect',
  a11, a12, a21, a22,
  b11, b12, b21, b22,
  onSelectPoint
}) => {

  // Pure Nash equilibria
  const pureNE = [
    { p: 1, q: 1, isNash: a11 >= a21 && b11 >= b12, label: `(${r1Label}, ${c1Label})`, payoff: `${a11}, ${b11}` },
    { p: 0, q: 1, isNash: a21 >= a11 && b21 >= b22, label: `(${r2Label}, ${c1Label})`, payoff: `${a21}, ${b21}` },
    { p: 1, q: 0, isNash: a12 >= a22 && b12 >= b11, label: `(${r1Label}, ${c2Label})`, payoff: `${a12}, ${b12}` },
    { p: 0, q: 0, isNash: a22 >= a12 && b22 >= b21, label: `(${r2Label}, ${c2Label})`, payoff: `${a22}, ${b22}` }
  ];

  // Mixed strategy calculation
  const denomP = (b11 - b12) + (b22 - b21);
  const numerP = b22 - b21;
  const pStarRaw = denomP !== 0 ? numerP / denomP : -1;
  const hasMixedP = pStarRaw > 0.02 && pStarRaw < 0.98;

  const denomQ = (a11 - a21) + (a22 - a12);
  const numerQ = a22 - a12;
  const qStarRaw = denomQ !== 0 ? numerQ / denomQ : -1;
  const hasMixedQ = qStarRaw > 0.02 && qStarRaw < 0.98;

  const hasMixedNE = hasMixedP && hasMixedQ;
  const pStar = Math.min(1, Math.max(0, pStarRaw));
  const qStar = Math.min(1, Math.max(0, qStarRaw));

  // Graph dimension math
  const width = 280;
  const height = 260;
  const padding = 36;
  const graphW = width - padding * 2;
  const graphH = height - padding * 2;

  const toSvgX = (p: number) => padding + p * graphW;
  const toSvgY = (q: number) => height - padding - q * graphH;

  // Grid arrows showing dynamic gradient vectors
  const gridSteps = [0.25, 0.5, 0.75];
  const vectorArrows: Array<{ x: number; y: number; dx: number; dy: number; mag: number }> = [];

  gridSteps.forEach(p => {
    gridSteps.forEach(q => {
      // P1 expected gain from increasing p: E(R1) - E(R2)
      const gradP = (q * a11 + (1 - q) * a12) - (q * a21 + (1 - q) * a22);
      // P2 expected gain from increasing q: E(C1) - E(C2)
      const gradQ = (p * b11 + (1 - p) * b21) - (p * b12 + (1 - p) * b22);

      const mag = Math.sqrt(gradP * gradP + gradQ * gradQ) || 1;
      const arrowLen = 14;
      const dx = (gradP / mag) * arrowLen;
      const dy = (gradQ / mag) * arrowLen;

      vectorArrows.push({ x: toSvgX(p), y: toSvgY(q), dx, dy: -dy, mag });
    });
  });

  return (
    <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col items-center select-none shadow-lg w-full">
      <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>🗺️</span>
          <span>Strategy Phase Map $(p, q)$</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-amber-400">
          {pureNE.filter(n => n.isNash).length > 0
            ? `★ ${pureNE.filter(n => n.isNash).length} Pure Nash`
            : hasMixedNE
            ? `★ Mixed Nash (${(pStar * 100).toFixed(0)}%, ${(qStar * 100).toFixed(0)}%)`
            : 'No Stable Fixed Point'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[340px] aspect-[280/260] overflow-visible"
        aria-label="Interactive 2D Best Response Phase Map"
      >
        <defs>
          <linearGradient id="phaseMapBg" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0.4" />
          </linearGradient>
          <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5 Z" fill="#64748b" />
          </marker>
        </defs>

        {/* Phase Space Square */}
        <rect
          x={padding}
          y={padding}
          width={graphW}
          height={graphH}
          fill="url(#phaseMapBg)"
          stroke="#334155"
          strokeWidth="1.5"
          rx="6"
        />

        {/* Grid lines */}
        <line x1={toSvgX(0.5)} y1={padding} x2={toSvgX(0.5)} y2={height - padding} stroke="#334155" strokeDasharray="3 3" opacity="0.6" />
        <line x1={padding} y1={toSvgY(0.5)} x2={width - padding} y2={toSvgY(0.5)} stroke="#334155" strokeDasharray="3 3" opacity="0.6" />

        {/* Dynamic Vector Flow Arrows */}
        {vectorArrows.map((v, i) => (
          <line
            key={i}
            x1={v.x - v.dx * 0.4}
            y1={v.y - v.dy * 0.4}
            x2={v.x + v.dx * 0.4}
            y2={v.y + v.dy * 0.4}
            stroke="#94a3b8"
            strokeWidth="1.5"
            opacity="0.6"
            markerEnd="url(#arrowHead)"
            className="transition-all duration-300 ease-out"
          />
        ))}

        {/* Axis Labels */}
        {/* P1 (Horizontal Axis: p = Prob(R1)) */}
        <text x={padding} y={height - 12} fontSize="9" fill="#94a3b8" fontFamily="monospace" fontWeight="bold">
          0 ({r2Label.slice(0, 6)})
        </text>
        <text x={width / 2} y={height - 6} fontSize="10" fill="#38bdf8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          You: p → 1 ({r1Label.slice(0, 6)})
        </text>
        <text x={width - padding} y={height - 12} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="monospace" fontWeight="bold">
          1.0
        </text>

        {/* P2 (Vertical Axis: q = Prob(C1)) */}
        <text x={padding - 6} y={height - padding + 3} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="monospace" fontWeight="bold">
          0
        </text>
        <text
          x={12}
          y={height / 2}
          fontSize="10"
          fill="#fbbf24"
          textAnchor="middle"
          transform={`rotate(-90 12 ${height / 2})`}
          fontFamily="monospace"
          fontWeight="bold"
        >
          Rival: q → 1 ({c1Label.slice(0, 6)})
        </text>
        <text x={padding - 6} y={padding + 6} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="monospace" fontWeight="bold">
          1.0
        </text>

        {/* Pure Strategy Corner Nodes */}
        {pureNE.map((node, i) => {
          const cx = toSvgX(node.p);
          const cy = toSvgY(node.q);
          return (
            <g key={i} className="cursor-pointer" onClick={() => onSelectPoint && onSelectPoint(node.p, node.q)}>
              {node.isNash && (
                <circle cx={cx} cy={cy} r="14" fill="#f59e0b" fillOpacity="0.3" className="animate-ping" />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={node.isNash ? 8 : 5}
                fill={node.isNash ? '#f59e0b' : '#475569'}
                stroke={node.isNash ? '#fff' : '#1e293b'}
                strokeWidth="2"
                className="transition-all duration-300 ease-out"
              />
              <text
                x={cx + (node.p === 1 ? -10 : 10)}
                y={cy + (node.q === 1 ? 14 : -10)}
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor={node.p === 1 ? 'end' : 'start'}
                fill={node.isNash ? '#fbbf24' : '#94a3b8'}
                className="transition-all duration-300 ease-out"
              >
                {node.isNash ? `★ ${node.payoff}` : node.payoff}
              </text>
            </g>
          );
        })}

        {/* Mixed Nash Equilibrium Point (Interior fixed point) */}
        {hasMixedNE && (
          <g className="transition-all duration-300 ease-out">
            {/* Guide lines to axes */}
            <line
              x1={toSvgX(pStar)}
              y1={height - padding}
              x2={toSvgX(pStar)}
              y2={toSvgY(qStar)}
              stroke="#f59e0b"
              strokeDasharray="2 2"
              strokeWidth="1"
              className="transition-all duration-300 ease-out"
            />
            <line
              x1={padding}
              y1={toSvgY(qStar)}
              x2={toSvgX(pStar)}
              y2={toSvgY(qStar)}
              stroke="#f59e0b"
              strokeDasharray="2 2"
              strokeWidth="1"
              className="transition-all duration-300 ease-out"
            />
            <circle
              cx={toSvgX(pStar)}
              cy={toSvgY(qStar)}
              r="12"
              fill="#f59e0b"
              fillOpacity="0.25"
              className="animate-pulse transition-all duration-300 ease-out"
            />
            <circle
              cx={toSvgX(pStar)}
              cy={toSvgY(qStar)}
              r="6"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-300 ease-out"
            />
            <text
              x={toSvgX(pStar) + 8}
              y={toSvgY(qStar) - 6}
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#fef08a"
              className="transition-all duration-300 ease-out"
            >
              Mixed NE ({pStar.toFixed(2)}, {qStar.toFixed(2)})
            </text>
          </g>
        )}
      </svg>

      {/* Glanceable Micro-Status Line */}
      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900 mt-1">
        <span>↙ (0, 0): {r2Label} Trap</span>
        <span className="text-emerald-400 font-bold">↗ (1, 1): {r1Label} Optimum</span>
      </div>
    </div>
  );
};
