import React, { useState } from 'react';
import { PEDAGOGY_DATA, GamePedagogy } from './pedagogyData';
import { getCurriculumNumber } from '../../data/curriculumOrder';

interface GamePedagogyCardProps {
  gameId: number;
  gameTitle: string;
  gameCategory?: string;
}

export const GameRoleContextCard: React.FC<GamePedagogyCardProps> = ({ gameId, gameTitle, gameCategory }) => {
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Panel A: Role &amp; Decision Problem
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            · {gameTitle}
          </span>
          {gameCategory && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              ({gameCategory})
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
          {gameId === 999 ? 'Custom Tool' : `Game ${getCurriculumNumber(gameId)}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Your Decision Role:
          </span>
          <p className="font-bold text-white text-sm">
            {data.role}
          </p>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mt-1">
            Strategic Objective:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {data.objective}
          </p>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
            The Strategic Friction:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {data.intuitionDilemma}
          </p>
        </div>
      </div>
    </div>
  );
};

export const GameTakeawaysAndProofCard: React.FC<GamePedagogyCardProps> = ({ gameId, gameTitle: _gameTitle }) => {
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Panel D: Executive Insights &amp; Policy Interventions
        </span>
        <button
          type="button"
          onClick={() => setIsProofOpen(!isProofOpen)}
          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{isProofOpen ? 'Hide' : 'View'} Formal Math Proof</span>
          <span className="font-mono">{isProofOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Dual Layer: Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            <span>🎯</span>
            <span>Theoretical Equilibrium Concept</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {data.equilibriumConcept}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
            <span>🏛️</span>
            <span>Mechanism &amp; Policy Counterfactual</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {data.policyIntervention}
          </p>
        </div>
      </div>

      {/* Expandable Formal Mathematical Proof */}
      {isProofOpen && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-blue-900/40 space-y-2.5 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
              <span>📐</span>
              <span>Formal Proof: {data.formalProof.title}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Analytical Derivation
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-1">
              Model Assumptions:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
              {data.formalProof.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-1">
              Step-by-Step Derivation:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
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
      )}
    </div>
  );
};
