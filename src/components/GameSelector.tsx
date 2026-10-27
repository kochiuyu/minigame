import React from 'react';
import { WeekConfig, RoundsState } from '../types';

interface GameSelectorProps {
  weeks: WeekConfig[];
  activeWeekId: number;
  onSelectWeek: (id: number) => void;
  roundsData: RoundsState;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  weeks,
  activeWeekId,
  onSelectWeek,
  roundsData
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Game Theory Modules (10 Experiments)
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Select topic to load scenario
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {weeks.map((week) => {
          const isSelected = week.id === activeWeekId;
          const weekRounds = roundsData[week.id] || {};
          const completedCount = Object.values(weekRounds).filter(r => r.isStep2Locked).length;

          return (
            <button
              key={week.id}
              onClick={() => onSelectWeek(week.id)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/30'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                  Week {week.id}
                </span>
                {completedCount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                    {completedCount}/6
                  </span>
                )}
              </div>
              <div className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-950 font-bold' : 'text-slate-800'}`}>
                {week.title.split(':')[1]?.trim() || week.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
