import { centipedePayoff } from '../liveMatch';

type Move = 'Take' | 'Pass';

export function CentipedeTree({ currentNode, moves = {}, exitNode }: {
  currentNode?: number;
  moves?: Record<string, Move>;
  exitNode?: number;
}) {
  return <div data-game-diagram="centipede-tree" className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
    <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2">
      <h3 className="font-bold text-slate-100">Centipede tree</h3>
      <p className="text-xs text-slate-300">Scores: Player 1 / Player 2</p>
    </div>
    <p className="mb-2 text-xs text-slate-300">A sponsor funds your shared project. Each Pass earns 1 point for both players and gives the other player a turn. Take closes the project and gives the player who takes a 2-point bonus.</p>
    <ol className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6" aria-label="Six-node Centipede game tree">
      {Array.from({ length: 6 }, (_, index) => index + 1).map(node => {
        const payoff = centipedePayoff(node).join(' / ');
        const move = moves[String(node)];
        const active = currentNode === node && !exitNode;
        const ended = exitNode === node;
        const status = move === 'Take' ? 'Taken' : move === 'Pass' ? 'Passed' : active ? 'Current' : exitNode && exitNode < node ? 'Not reached' : 'Upcoming';
        return <li key={node} className={`min-w-0 rounded-md border p-2 text-xs ${ended ? 'border-emerald-500 bg-emerald-950/60' : active ? 'border-blue-400 bg-blue-950/60' : move === 'Pass' ? 'border-slate-500 bg-slate-800/80' : 'border-slate-700 bg-slate-900/70'}`} aria-current={active ? 'step' : undefined}>
          <strong className="block text-sm">{node}. Player {node % 2 ? 1 : 2}</strong>
          <span className={ended ? 'text-emerald-300' : active ? 'text-blue-200' : 'text-slate-300'}>{status}</span>
          <p className={`mt-1 ${move === 'Take' ? 'font-bold text-emerald-200' : ''}`}>Take → {payoff}</p>
          <p className={move === 'Pass' ? 'font-bold text-blue-200' : ''}>Pass → {node < 6 ? `node ${node + 1}` : '6 / 6'}</p>
        </li>;
      })}
    </ol>
    <p className={`mt-2 text-xs ${exitNode === 7 ? 'font-bold text-emerald-300' : 'text-slate-300'}`}>Pass at node 6 → both get 6 / 6{exitNode === 7 ? ' · Reached' : ''}</p>
  </div>;
}
