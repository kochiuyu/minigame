import React, { useState } from 'react';
import { PEDAGOGY_DATA, GamePedagogy } from './pedagogyData';
import { GAME_MISSIONS, MissionVerdict } from './missionEngine';
import { getCurriculumNumber } from '../../data/curriculumOrder';

interface WhatIfMissionBannerProps {
  gameId: number;
  gameTitle: string;
  gameCategory?: string;
  verdict?: MissionVerdict;
}

export const WhatIfMissionBanner: React.FC<WhatIfMissionBannerProps> = ({
  gameId,
  gameTitle,
  gameCategory,
  verdict
}) => {
  const mission = GAME_MISSIONS[gameId] || {
    gameId,
    guidingQuestion: `How do player incentives shift the equilibrium in ${gameTitle}?`,
    challengeGoal: "Adjust the levers to test how strategy parameters shift the stable outcome.",
    targetMetricName: "Strategic Equilibrium"
  };

  const isSolved = verdict?.isSolved ?? false;

  return (
    <div className="space-y-2.5">
      {/* 1. Concise Graphical Mission Header & Live Verdict */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
        {/* Top Header Row with Kicker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
            <span>🎯 Mission:</span>
            <span className="text-white tracking-tight">
              {gameId === 999 ? 'Custom 2×2 Sandbox' : `Game ${getCurriculumNumber(gameId)} · ${gameTitle}`}
            </span>
            {gameCategory && (
              <span className="text-slate-500 hidden sm:inline font-normal">({gameCategory})</span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400 self-start sm:self-auto">
            Target: <strong className="text-emerald-400">{mission.targetMetricName}</strong>
          </span>
        </div>

        {/* Guiding Question Headline */}
        <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
          &ldquo;{mission.guidingQuestion}&rdquo;
        </h2>

        {/* Live Visual Verdict Bar with Efficiency Meter */}
        {verdict && (
          <div
            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
              isSolved
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/30'
                : 'bg-amber-950/30 border-amber-600/50 text-amber-100 ring-1 ring-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-xl shrink-0">{isSolved ? '✅' : '⚠️'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isSolved
                        ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700/60'
                        : 'bg-amber-900/80 text-amber-300 border-amber-700/60'
                    }`}
                  >
                    {verdict.statusText}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {verdict.verdictHeadline}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-1 font-medium">
                  {verdict.explanation}
                </p>
              </div>
            </div>

            {/* Visual Equilibrium Gauge */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
              <span className="text-[10px] text-slate-400">Efficiency:</span>
              <div className="w-24 bg-slate-900 rounded-full h-2.5 border border-slate-700 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSolved ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: isSolved ? '100%' : '35%' }}
                />
              </div>
              <span className={`text-[11px] font-bold ${isSolved ? 'text-emerald-300' : 'text-amber-300'}`}>
                {isSolved ? '100%' : '35%'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WhatIfMathProofExpander: React.FC<WhatIfMissionBannerProps> = ({
  gameId,
  gameTitle: _gameTitle
}) => {
  const [isProofOpen, setIsProofOpen] = useState(false);
  const data: GamePedagogy = PEDAGOGY_DATA[gameId] || {
    role: "Strategic Decision Maker",
    objective: "Maximize expected utility while accounting for rival incentives",
    intuitionDilemma: "Individual optimization clashes with collective welfare or strategic reactions.",
    equilibriumConcept: "Nash Equilibrium where no player has a unilateral incentive to deviate.",
    policyIntervention: "Institutional rules, commitments, or information structures.",
    formalProof: {
      title: "Equilibrium Proof",
      assumptions: ["Rational agents with common knowledge of payoffs."],
      steps: ["Compute best-response correspondence for all players.", "Locate fixed point intersection."],
      conclusion: "Stable equilibrium identified."
    }
  };

  return (
    <details className="group bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md">
      <summary
        onClick={() => setIsProofOpen(!isProofOpen)}
        className="min-h-[48px] px-4 py-3 font-bold text-xs text-slate-400 cursor-pointer flex items-center justify-between hover:text-white hover:bg-slate-900 select-none"
      >
        <div className="flex items-center gap-2">
          <span>📐</span>
          <span>Formal math proof, analytical assumptions &amp; mechanism design foundations</span>
        </div>
        <span className="text-slate-500 group-open:rotate-90 transition-transform font-mono text-sm">▸</span>
      </summary>

      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/40 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              🎯 Equilibrium Concept:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {data.equilibriumConcept}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              🏛️ Policy Counterfactual:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {data.policyIntervention}
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-blue-300 text-xs">
              Formal Proof: {data.formalProof.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Analytical Model</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-0.5">
              Assumptions:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
              {data.formalProof.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-0.5">
              Step-by-Step Derivation:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] font-mono bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              {data.formalProof.steps.map((s, i) => (
                <li key={i} className="leading-relaxed">{s}</li>
              ))}
            </ol>
          </div>

          <div className="p-2 bg-blue-950/40 rounded-lg border border-blue-800/40 text-[11px] text-blue-200">
            <strong>Conclusion: </strong>
            {data.formalProof.conclusion}
          </div>
        </div>
      </div>
    </details>
  );
};

// Backward-compatibility aliases so no existing imports break
export const GameRoleContextCard = WhatIfMissionBanner;
export const GameTakeawaysAndProofCard = WhatIfMathProofExpander;
