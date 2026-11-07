import React from 'react';

interface ReactionFunctionVisualizerProps {
  q1: number;
  q2: number;
  cost?: number;
  demandA?: number;
  title?: string;
}

export const ReactionFunctionVisualizer: React.FC<ReactionFunctionVisualizerProps> = ({
  q1,
  q2,
  cost = 10,
  demandA = 100,
  title = "Duopoly Reaction Curves & Nash Fixed Point"
}) => {
  const width = 280;
  const height = 200;
  const padding = 34;
  const graphW = width - padding * 2;
  const graphH = height - padding * 2;

  const maxQ = Math.max(60, demandA - cost);
  const toSvgX = (val: number) => padding + (val / maxQ) * graphW;
  const toSvgY = (val: number) => height - padding - (val / maxQ) * graphH;

  // Cournot Reaction functions:
  // q1*(q2) = (A - c - q2) / 2
  // Intercepts: when q2 = 0, q1 = (A - c)/2. When q1 = 0, q2 = A - c.
  const interceptSingle = (demandA - cost) / 2;
  const interceptDouble = demandA - cost;

  // Cournot Equilibrium: q1* = q2* = (A - c) / 3
  const cournotNashQ = (demandA - cost) / 3;

  return (
    <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col items-center select-none shadow-lg w-full">
      <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>📊</span>
          <span>{title}</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-amber-400">
          ★ Nash Point ({cournotNashQ.toFixed(0)}, {cournotNashQ.toFixed(0)})
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[340px] aspect-[280/200] overflow-visible">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="1" />

        {/* Firm 1 Reaction Line R1(q2): blue */}
        <line
          x1={toSvgX(interceptSingle)}
          y1={toSvgY(0)}
          x2={toSvgX(0)}
          y2={toSvgY(interceptDouble)}
          stroke="#38bdf8"
          strokeWidth="2"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(interceptSingle)}
          y={height - 12}
          fontSize="8"
          fill="#38bdf8"
          textAnchor="middle"
          fontFamily="monospace"
          className="transition-all duration-300 ease-out"
        >
          R1: ({interceptSingle.toFixed(0)})
        </text>

        {/* Firm 2 Reaction Line R2(q1): amber */}
        <line
          x1={toSvgX(0)}
          y1={toSvgY(interceptSingle)}
          x2={toSvgX(interceptDouble)}
          y2={toSvgY(0)}
          stroke="#fbbf24"
          strokeWidth="2"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={padding - 4}
          y={toSvgY(interceptSingle) + 3}
          fontSize="8"
          fill="#fbbf24"
          textAnchor="end"
          fontFamily="monospace"
          className="transition-all duration-300 ease-out"
        >
          R2: ({interceptSingle.toFixed(0)})
        </text>

        {/* Cournot Nash Intersection */}
        <circle
          cx={toSvgX(cournotNashQ)}
          cy={toSvgY(cournotNashQ)}
          r="7"
          fill="#f59e0b"
          stroke="#ffffff"
          strokeWidth="2"
          className="animate-pulse transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(cournotNashQ) + 8}
          y={toSvgY(cournotNashQ) - 8}
          fontSize="8.5"
          fill="#fef08a"
          fontFamily="monospace"
          fontWeight="bold"
          className="transition-all duration-300 ease-out"
        >
          Nash Fixed Point
        </text>

        {/* Current Active Output Marker */}
        <circle
          cx={toSvgX(q1)}
          cy={toSvgY(q2)}
          r="5"
          fill="#a855f7"
          stroke="#ffffff"
          strokeWidth="1.5"
          className="transition-all duration-300 ease-out"
        />
        <text
          x={toSvgX(q1) + 6}
          y={toSvgY(q2) + 12}
          fontSize="8"
          fill="#c084fc"
          fontFamily="monospace"
          className="transition-all duration-300 ease-out"
        >
          You ({q1}, {q2})
        </text>
      </svg>

      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900 mt-1">
        <span>q1 = P1 Quantity</span>
        <span className="text-amber-400 font-bold">Eq Output: {cournotNashQ.toFixed(0)} units each</span>
        <span>q2 = P2 Quantity</span>
      </div>
    </div>
  );
};
