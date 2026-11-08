type Move = 'Take' | 'Pass';

const TAKE_PAYOFFS = ['2 / 0', '1 / 4', '4 / 2', '3 / 6', '6 / 4', '5 / 8'] as const;

export function CentipedeTree({ currentNode, moves = {}, exitNode }: {
  currentNode?: number;
  moves?: Record<string, Move>;
  exitNode?: number;
}) {
  return <div data-game-diagram="centipede-tree" className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
    <h3 className="font-bold text-slate-100">Centipede game tree</h3>
    <p className="text-sm text-slate-300">At each node, Take ends the game with the points shown. Pass leads to the next node. Points are Player 1 / Player 2.</p>
    <ol className="space-y-1" aria-label="Six-node Centipede game tree">
      {TAKE_PAYOFFS.map((payoff, index) => {
        const node = index + 1;
        const move = moves[String(node)];
        const active = currentNode === node && !exitNode;
        const ended = exitNode === node;
        const status = move === 'Take' ? 'Taken' : move === 'Pass' ? 'Passed' : active ? 'Current turn' : exitNode && exitNode < node ? 'Not reached' : 'Upcoming';
        return <li key={node} className="space-y-1">
          <div className={`rounded-lg border p-3 text-sm ${ended ? 'border-emerald-500 bg-emerald-950/60' : active ? 'border-blue-400 bg-blue-950/60' : move === 'Pass' ? 'border-slate-500 bg-slate-800/80' : 'border-slate-700 bg-slate-900/70'}`} aria-current={active ? 'step' : undefined}>
            <div className="flex flex-wrap justify-between gap-2"><strong>Node {node} · Player {node % 2 ? 1 : 2}</strong><span className={ended ? 'text-emerald-300' : active ? 'text-blue-200' : 'text-slate-300'}>{status}</span></div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <p className={move === 'Take' ? 'font-bold text-emerald-200' : ''}>Take → {payoff} points</p>
              <p className={move === 'Pass' ? 'font-bold text-blue-200' : ''}>Pass → {node < 6 ? `Node ${node + 1}` : '8 / 8 points'}</p>
            </div>
          </div>
          {node < 6 && <div className="pl-4 text-slate-500" aria-hidden="true">↓ Pass</div>}
        </li>;
      })}
    </ol>
    <p className={`rounded-lg border p-3 text-sm ${exitNode === 7 ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200' : 'border-slate-700 text-slate-300'}`}>
      After Pass at Node 6 → both players get 8 / 8 points{exitNode === 7 ? ' · Reached' : ''}
    </p>
  </div>;
}

