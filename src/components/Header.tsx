import React, { useState } from 'react';
import { AuthSession, GameConfig } from '../types';

interface HeaderProps {
  authSession: AuthSession;
  onSignOut: () => void;
  completedRoundsCount: number;
  totalRounds?: number;
  currentWeek?: GameConfig;
  allWeeks?: GameConfig[];
  onSelectWeek?: (gameId: number) => void;
  currentMode: 'solo' | 'live' | 'sandbox';
  onSelectMode: (mode: 'solo' | 'live' | 'sandbox') => void;
  soloModuleId?: number;
  soloNodeLabel?: string;
  soloGameIndex?: number;
  totalSoloGames?: number;
  completedSoloGamesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  authSession,
  onSignOut,
  completedRoundsCount,
  totalRounds = 6,
  currentWeek,
  allWeeks = [],
  onSelectWeek,
  currentMode,
  onSelectMode,
  soloModuleId,
  soloNodeLabel,
  soloGameIndex,
  totalSoloGames,
  completedSoloGamesCount
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

  const isStudent = authSession.role === 'student';

  // Group games by category
  const categories = Array.from(new Set(allWeeks.map(g => g.category || 'Other Classroom Games')));

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white font-mono text-xs shadow-xs shrink-0">
            Γ
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap leading-tight">
              DOTE 3090 <span className="text-slate-400 font-normal hidden sm:inline">Game Theory</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>Room: <strong className="font-mono text-blue-300 font-bold">{authSession.roomCode || 'DOTE-3090'}</strong></span>
              {currentMode === 'solo' ? (
                <>
                  <span>·</span>
                  <span className="text-sky-300 font-semibold truncate max-w-[120px] sm:max-w-none">
                    Game {soloGameIndex || 1} of {totalSoloGames || 13}
                  </span>
                </>
              ) : currentWeek && currentMode === 'live' ? (
                <>
                  <span>·</span>
                  <span className="text-amber-300 font-semibold truncate max-w-[120px] sm:max-w-none">
                    {currentWeek.id === 20
                      ? 'Game 13 of 13'
                      : `${currentWeek.icon} ${currentWeek.shortTitle || currentWeek.title}`}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Zone 2: Primary Platform Mode Switcher */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => onSelectMode('solo')}
            className={`min-h-[38px] px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentMode === 'solo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🧪</span>
            <span>Solo Lab</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('live')}
            className={`min-h-[38px] px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentMode === 'live'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>👥</span>
            <span>Live Class</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('sandbox')}
            className={`min-h-[38px] px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentMode === 'sandbox'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>∫</span>
            <span className="hidden sm:inline">What-If</span>
            <span className="sm:hidden">Curves</span>
          </button>
        </div>

        {/* Zone 3: Quick Game Picker (in Live mode) or Status & Sign-Out */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentMode === 'live' && onSelectWeek && allWeeks.length > 0 && (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsGameMenuOpen(prev => !prev)}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-700 ${
                  isGameMenuOpen ? 'bg-slate-700 text-amber-300' : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Browse full classroom games catalog"
              >
                <span>🎮 Games ({allWeeks.length})</span>
                <span className="text-[10px]">▾</span>
              </button>
            </div>
          )}

          {/* Full Games Dropdown Menu */}
          {isGameMenuOpen && onSelectWeek && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 text-left max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🎮</span>
                  <span>Classroom Experiments Suite</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsGameMenuOpen(false)}
                  className="text-[10px] text-slate-400 hover:text-white font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {categories.map(cat => {
                  const catGames = allWeeks.filter(g => (g.category || 'Other Classroom Games') === cat);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                        {cat}
                      </div>
                      <div className="space-y-0.5">
                        {catGames.map(game => {
                          const isCurrent = currentWeek?.id === game.id;
                          return (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => {
                                onSelectWeek(game.id);
                                setIsGameMenuOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                                isCurrent
                                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5">{game.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold leading-tight flex items-center justify-between">
                                  <span>{game.shortTitle || game.title}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[10px] line-clamp-1 mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                                  {game.keyTakeaway || game.purpose}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Pill */}
          <span className={`hidden xl:flex px-2.5 py-1 rounded-md font-bold tracking-wide items-center gap-1.5 ${
            isStudent
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60'
              : 'bg-purple-900/60 text-purple-200 border border-purple-700/60'
          }`}>
            <span>{isStudent ? '🎓 Student' : '👨‍🏫 Instructor'}</span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold">{authSession.name}</span>
            {isStudent && authSession.alias && (
              <span className="text-amber-300 font-mono">({authSession.alias})</span>
            )}
          </span>

          {isStudent && (
            <span className="text-slate-400 font-mono text-[11px] bg-slate-800 px-2.5 py-1 rounded border border-slate-700 hidden sm:inline-block">
              {currentMode === 'solo' ? (
                <span className="text-sky-300 font-semibold flex items-center gap-1.5">
                  <span>Game {soloGameIndex || 1} of {totalSoloGames || 12}</span>
                  {soloModuleId === 20 ? (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-amber-300 font-normal">
                        {soloNodeLabel || '6-Node Chain (Player: 1, 3, 5 · Bot: 2, 4, 6)'}
                      </span>
                    </>
                  ) : completedSoloGamesCount !== undefined && completedSoloGamesCount > 0 ? (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-emerald-400 font-normal">{completedSoloGamesCount} of {totalSoloGames || 13} Done</span>
                    </>
                  ) : null}
                </span>
              ) : currentMode === 'sandbox' ? (
                <span className="text-amber-300 font-semibold">What-If Curves Sandbox</span>
              ) : currentWeek?.id === 20 ? (
                <span className="text-sky-300 font-semibold flex items-center gap-1.5">
                  <span>Game 13 of 13</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-amber-300 font-normal">6-Node Chain (Player: 1, 3, 5 · Bot: 2, 4, 6)</span>
                </span>
              ) : (
                <span className="text-sky-300 font-semibold flex items-center gap-1.5">
                  <span>Game {allWeeks.findIndex(w => w.id === currentWeek?.id) + 1 || 1} of {allWeeks.length || 13}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 font-normal">{completedRoundsCount}/{totalRounds} Rds</span>
                </span>
              )}
            </span>
          )}
        </div>

        {/* Zone 3: Profile & Sign-Out Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isStudent && (
            <button
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="min-h-[38px] text-xs text-slate-300 hover:text-white px-2 sm:px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center font-mono"
            >
              ID: {authSession.id || 'N/A'}
            </button>
          )}

          <button
            onClick={onSignOut}
            className="min-h-[38px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            title="Leave session and return to sign-in portal"
          >
            <span className="hidden sm:inline">Exit /</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Slide-down Student Profile View when opened */}
      {isProfileOpen && isStudent && (
        <div className="bg-slate-800 border-t border-slate-700 px-4 sm:px-6 py-2.5 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <span><strong>Name:</strong> {authSession.name}</span>
              <span><strong>Student ID:</strong> {authSession.id}</span>
              <span><strong>Codename:</strong> {authSession.alias}</span>
              <span><strong>Room PIN:</strong> {authSession.roomCode}</span>
            </div>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="text-slate-400 hover:text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
