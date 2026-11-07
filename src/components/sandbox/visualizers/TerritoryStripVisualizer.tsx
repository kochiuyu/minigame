import React from 'react';

interface TerritoryStripVisualizerProps {
  pos1: number; // e.g. 40
  pos2: number; // e.g. 60
  label1?: string;
  label2?: string;
  title?: string;
}

export const TerritoryStripVisualizer: React.FC<TerritoryStripVisualizerProps> = ({
  pos1,
  pos2,
  label1 = "Vendor 1",
  label2 = "Vendor 2",
  title = "Linear Market Territory & Spatial Competition"
}) => {
  // Boundary dividing customers: midpoint between pos1 and pos2
  const midPoint = (pos1 + pos2) / 2;
  const p1Share = Math.round(midPoint);
  const p2Share = Math.round(100 - midPoint);

  return (
    <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col items-center select-none shadow-lg w-full">
      <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>🏖️</span>
          <span>{title}</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-amber-400">
          Midpoint Boundary: {midPoint.toFixed(1)}%
        </span>
      </div>

      <div className="w-full py-4 space-y-4">
        {/* Territory Split Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-blue-400">{label1}: {p1Share}% Market Share</span>
            <span className="text-amber-400">{label2}: {p2Share}% Market Share</span>
          </div>
          <div className="w-full h-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-lg transition-all duration-300 flex items-center justify-start pl-2 text-[10px] font-mono font-bold text-white shadow-xs"
              style={{ width: `${p1Share}%` }}
            >
              {p1Share > 15 && `${p1Share}%`}
            </div>
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-slate-950 shadow-xs"
              style={{ width: `${p2Share}%` }}
            >
              {p2Share > 15 && `${p2Share}%`}
            </div>
          </div>
        </div>

        {/* Spatial Beach Track with Moving Carts */}
        <div className="relative w-full h-12 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center px-4">
          {/* Center 50% Median Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-500/40 border-r border-dashed border-amber-400" />
          <span className="absolute left-1/2 -top-3.5 -translate-x-1/2 text-[9px] font-mono text-amber-400 font-bold">
            50% Median Nash
          </span>

          {/* Cart 1 Marker */}
          <div
            className="absolute -translate-x-1/2 transition-all duration-200 flex flex-col items-center"
            style={{ left: `${pos1}%` }}
          >
            <span className="text-base">🍦</span>
            <span className="text-[9px] font-mono font-bold text-blue-400 bg-slate-950 px-1 rounded border border-blue-800">
              {pos1}%
            </span>
          </div>

          {/* Cart 2 Marker */}
          <div
            className="absolute -translate-x-1/2 transition-all duration-200 flex flex-col items-center"
            style={{ left: `${pos2}%` }}
          >
            <span className="text-base">🍧</span>
            <span className="text-[9px] font-mono font-bold text-amber-400 bg-slate-950 px-1 rounded border border-amber-800">
              {pos2}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900 mt-1">
        <span>0% West Coast</span>
        <span className="text-emerald-400 font-bold">Minimum Differentiation: Both at 50%</span>
        <span>100% East Coast</span>
      </div>
    </div>
  );
};
