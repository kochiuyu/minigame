import React from 'react';

export interface MatrixCellData {
  playerAction: string;
  botAction: string;
  playerPayoff: number;
  botPayoff: number;
  isNash?: boolean;
  label?: string;
}

export interface InteractiveMatrixVisualizerProps {
  gameId: number;
  botName: string;
  botAvatar: string;
  selectedPlayerAction?: string;
  playedOutcome?: {
    playerAction: string;
    botAction: string;
    playerPayoff: number;
    botPayoff: number;
  };
  isDollarGame?: boolean;
}

export const InteractiveMatrixVisualizer: React.FC<InteractiveMatrixVisualizerProps> = ({
  gameId,
  botName,
  botAvatar,
  selectedPlayerAction,
  playedOutcome,
  isDollarGame = false
}) => {
  // Define 2x2 matrix data for supported normal-form games
  const getMatrixConfig = () => {
    switch (gameId) {
      case 1: // One-Shot Prisoner's Dilemma
        return {
          rowActions: ['Cooperate', 'Defect'],
          colActions: ['Cooperate', 'Defect'],
          rowIcons: ['🤝', '⚔️'],
          colIcons: ['🤝', '⚔️'],
          cells: [
            { playerAction: 'Cooperate', botAction: 'Cooperate', playerPayoff: 2, botPayoff: 2, label: 'Mutual Coop' },
            { playerAction: 'Cooperate', botAction: 'Defect', playerPayoff: 0, botPayoff: 3, label: 'Exploited' },
            { playerAction: 'Defect', botAction: 'Cooperate', playerPayoff: 3, botPayoff: 0, label: 'Temptation' },
            { playerAction: 'Defect', botAction: 'Defect', playerPayoff: 1, botPayoff: 1, isNash: true, label: 'Mutual Defect' }
          ]
        };

      case 6: // Repeated Prisoner's Dilemma
        return {
          rowActions: ['Cooperate', 'Defect'],
          colActions: ['Cooperate', 'Defect'],
          rowIcons: ['🤝', '⚔️'],
          colIcons: ['🤝', '⚔️'],
          cells: [
            { playerAction: 'Cooperate', botAction: 'Cooperate', playerPayoff: 2, botPayoff: 2, label: 'Mutual Coop' },
            { playerAction: 'Cooperate', botAction: 'Defect', playerPayoff: 0, botPayoff: 3, label: 'Exploited' },
            { playerAction: 'Defect', botAction: 'Cooperate', playerPayoff: 3, botPayoff: 0, label: 'Temptation' },
            { playerAction: 'Defect', botAction: 'Defect', playerPayoff: 1, botPayoff: 1, isNash: true, label: 'Mutual Defect' }
          ]
        };

      case 13: // Stag Hunt
        return {
          rowActions: ['Stag', 'Hare'],
          colActions: ['Stag', 'Hare'],
          rowIcons: ['🦌', '🐇'],
          colIcons: ['🦌', '🐇'],
          cells: [
            { playerAction: 'Stag', botAction: 'Stag', playerPayoff: 10, botPayoff: 10, isNash: true, label: 'Payoff-Dominant' },
            { playerAction: 'Stag', botAction: 'Hare', playerPayoff: 0, botPayoff: 4, label: 'Abandoned' },
            { playerAction: 'Hare', botAction: 'Stag', playerPayoff: 4, botPayoff: 0, label: 'Safe Solo' },
            { playerAction: 'Hare', botAction: 'Hare', playerPayoff: 4, botPayoff: 4, isNash: true, label: 'Risk-Dominant' }
          ]
        };

      case 15: // Hawk-Dove Brinkmanship
        return {
          rowActions: ['Dove', 'Hawk'],
          colActions: ['Dove', 'Hawk'],
          rowIcons: ['🕊️', '🦅'],
          colIcons: ['🕊️', '🦅'],
          cells: [
            { playerAction: 'Dove', botAction: 'Dove', playerPayoff: 3, botPayoff: 3, label: 'Peaceful Share' },
            { playerAction: 'Dove', botAction: 'Hawk', playerPayoff: 0, botPayoff: 6, isNash: true, label: 'Concede' },
            { playerAction: 'Hawk', botAction: 'Dove', playerPayoff: 6, botPayoff: 0, isNash: true, label: 'Dominate' },
            { playerAction: 'Hawk', botAction: 'Hawk', playerPayoff: -10, botPayoff: -10, label: 'Catastrophic Collision' }
          ]
        };

      case 18: // Battle of the Sexes
        return {
          rowActions: ['Opera', 'Football'],
          colActions: ['Opera', 'Football'],
          rowIcons: ['🎭', '⚽'],
          colIcons: ['🎭', '⚽'],
          cells: [
            { playerAction: 'Opera', botAction: 'Opera', playerPayoff: 3, botPayoff: 2, isNash: true, label: 'Your Favorite' },
            { playerAction: 'Opera', botAction: 'Football', playerPayoff: 0, botPayoff: 0, label: 'Miscoordination' },
            { playerAction: 'Football', botAction: 'Opera', playerPayoff: 0, botPayoff: 0, label: 'Miscoordination' },
            { playerAction: 'Football', botAction: 'Football', playerPayoff: 2, botPayoff: 3, isNash: true, label: "Bot's Favorite" }
          ]
        };

      case 17: // Matching Pennies
        return {
          rowActions: ['Heads', 'Tails'],
          colActions: ['Heads', 'Tails'],
          rowIcons: ['🪙', '🪙'],
          colIcons: ['🪙', '🪙'],
          cells: [
            { playerAction: 'Heads', botAction: 'Heads', playerPayoff: 2, botPayoff: 0, label: 'Match (You Win)' },
            { playerAction: 'Heads', botAction: 'Tails', playerPayoff: 0, botPayoff: 2, label: 'Mismatch (Bot Wins)' },
            { playerAction: 'Tails', botAction: 'Heads', playerPayoff: 0, botPayoff: 2, label: 'Mismatch (Bot Wins)' },
            { playerAction: 'Tails', botAction: 'Tails', playerPayoff: 2, botPayoff: 0, label: 'Match (You Win)' }
          ]
        };

      case 3: // Simultaneous Price Competition (Bertrand 2x2)
        return {
          rowActions: ['High Price', 'Low Price'],
          colActions: ['High Price', 'Low Price'],
          rowIcons: ['🏷️', '⚡'],
          colIcons: ['🏷️', '⚡'],
          cells: [
            { playerAction: 'High Price', botAction: 'High Price', playerPayoff: 2, botPayoff: 2, label: 'Cartel High' },
            { playerAction: 'High Price', botAction: 'Low Price', playerPayoff: 0, botPayoff: 3, label: 'Undercut' },
            { playerAction: 'Low Price', botAction: 'High Price', playerPayoff: 3, botPayoff: 0, label: 'Temptation' },
            { playerAction: 'Low Price', botAction: 'Low Price', playerPayoff: 1, botPayoff: 1, isNash: true, label: 'Nash Price War' }
          ]
        };

      case 4: // Promotion Timing (3x3 Mixed Strategy Coordination)
        return {
          rowActions: ['Monday', 'Wednesday', 'Friday'],
          colActions: ['Monday', 'Wednesday', 'Friday'],
          rowIcons: ['📅', '📅', '📅'],
          colIcons: ['📅', '📅', '📅'],
          cells: [
            { playerAction: 'Monday', botAction: 'Monday', playerPayoff: 0, botPayoff: 0, label: 'Clash' },
            { playerAction: 'Monday', botAction: 'Wednesday', playerPayoff: 1, botPayoff: 1, label: 'Clear' },
            { playerAction: 'Monday', botAction: 'Friday', playerPayoff: 1, botPayoff: 1, label: 'Clear' },
            { playerAction: 'Wednesday', botAction: 'Monday', playerPayoff: 1, botPayoff: 1, label: 'Clear' },
            { playerAction: 'Wednesday', botAction: 'Wednesday', playerPayoff: 0, botPayoff: 0, label: 'Clash' },
            { playerAction: 'Wednesday', botAction: 'Friday', playerPayoff: 1, botPayoff: 1, label: 'Clear' },
            { playerAction: 'Friday', botAction: 'Monday', playerPayoff: 1, botPayoff: 1, label: 'Clear' },
            { playerAction: 'Friday', botAction: 'Wednesday', playerPayoff: 1, botPayoff: 1, label: 'Clear' },
            { playerAction: 'Friday', botAction: 'Friday', playerPayoff: 0, botPayoff: 0, label: 'Clash' }
          ]
        };

      default:
        return null;
    }
  };

  const config = getMatrixConfig();
  if (!config) return null;

  const formatPayoff = (val: number) => {
    if (isDollarGame) {
      return val >= 0 ? `$${val}` : `-$${Math.abs(val)}`;
    }
    return val >= 0 ? `+${val}` : `${val}`;
  };

  return (
    <div className="w-full bg-slate-950/90 rounded-2xl p-3.5 sm:p-5 border border-slate-800 space-y-3 shadow-lg select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
        <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>📊</span>
          <span>Normal-Form Payoff Matrix</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
            <span className="text-sky-300 font-bold">You (Row)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span className="text-amber-300 font-bold">{botName} (Col)</span>
          </span>
        </div>
      </div>

      {/* Matrix Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-center">
          <thead>
            {/* Top Opponent Label Row */}
            <tr>
              <th className="w-24 sm:w-28"></th>
              <th colSpan={config.colActions.length} className="py-1 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300">
                  <span>{botAvatar}</span>
                  <span>{botName}'s Action (Columns)</span>
                </div>
              </th>
            </tr>
            {/* Bot Action Columns */}
            <tr>
              <th className="py-2 text-left">
                <span className="text-[11px] font-mono text-sky-400 font-bold">Your Action (Rows)</span>
              </th>
              {config.colActions.map((action, i) => (
                <th key={action} className="py-2 px-2 text-center">
                  <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span>{config.colIcons[i]}</span>
                    <span>{action}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-2">
            {config.rowActions.map((rowAction, rowIdx) => {
              const isRowSelected = selectedPlayerAction === rowAction;
              return (
                <tr
                  key={rowAction}
                  className={`transition-colors rounded-xl ${
                    isRowSelected ? 'bg-sky-950/20' : ''
                  }`}
                >
                  {/* Row Header (Player Action) */}
                  <th className="py-2 px-2 text-left align-middle">
                    <div
                      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-black px-2.5 py-2 rounded-xl border transition-all ${
                        isRowSelected
                          ? 'bg-sky-950 border-sky-500 text-sky-200 ring-2 ring-sky-400/40 shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <span>{config.rowIcons[rowIdx]}</span>
                      <span>{rowAction}</span>
                    </div>
                  </th>

                  {/* 2 Outcome Cells in this Row */}
                  {config.colActions.map((colAction) => {
                    const cell = config.cells.find(
                      (c) => c.playerAction === rowAction && c.botAction === colAction
                    );
                    if (!cell) return <td key={colAction}></td>;

                    const isPlayedOutcome =
                      playedOutcome &&
                      playedOutcome.playerAction === rowAction &&
                      playedOutcome.botAction === colAction;

                    return (
                      <td key={colAction} className="p-1 sm:p-1.5 align-middle">
                        <div
                          className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                            isPlayedOutcome
                              ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/80 shadow-xl shadow-emerald-950/80 scale-[1.02] z-10'
                              : isRowSelected
                              ? 'bg-slate-900 border-sky-600/50 hover:border-slate-600'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Played Outcome Badge */}
                          {isPlayedOutcome && (
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                              🎯 Played Outcome
                            </div>
                          )}

                          {/* Nash Equilibrium Indicator */}
                          {cell.isNash && !isPlayedOutcome && (
                            <div className="absolute top-1 right-1.5 text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-1 rounded">
                              ⭐ Nash Eq
                            </div>
                          )}

                          {/* Cell Payoffs: (Player, Bot) */}
                          <div className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-black font-mono">
                            <span className="text-sky-300" title={`Your payoff: ${formatPayoff(cell.playerPayoff)}`}>
                              {formatPayoff(cell.playerPayoff)}
                            </span>
                            <span className="text-slate-500 font-normal">,</span>
                            <span className="text-amber-300" title={`${botName}'s payoff: ${formatPayoff(cell.botPayoff)}`}>
                              {formatPayoff(cell.botPayoff)}
                            </span>
                          </div>

                          {/* Descriptive Subtitle Label */}
                          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate max-w-[130px]">
                            {cell.label}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend & Guide footer */}
      <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <span>Formula:</span>
          <strong className="text-sky-300 font-bold">Your Payoff</strong>
          <span>,</span>
          <strong className="text-amber-300 font-bold">{botName}'s Payoff</strong>
        </span>
        {playedOutcome ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span>🎯 Highlighted:</span>
            <span>Outcome from this round</span>
          </span>
        ) : selectedPlayerAction ? (
          <span className="text-sky-400 font-bold flex items-center gap-1">
            <span>Highlighted row:</span>
            <span>Your selected action ({selectedPlayerAction})</span>
          </span>
        ) : (
          <span className="text-slate-500">Tap actions in Step 2 to preview payoffs</span>
        )}
      </div>
    </div>
  );
};
