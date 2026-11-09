import { useState } from 'react';
import { pointsFor } from '../liveMatch';
import type { Choice } from '../liveMatch';

const MOVES = ['Rock', 'Paper', 'Scissors'] as const;
type Move = (typeof MOVES)[number];

export function SoloRpsChallenge() {
  const [choice, setChoice] = useState<Move>('Rock');
  const [rounds, setRounds] = useState<Array<{ own: Move; bot: Move; ownPoints: number; botPoints: number }>>([]);
  const latest = rounds[rounds.length - 1];
  const ownTotal = rounds.reduce((sum, round) => sum + round.ownPoints, 0);
  const botTotal = rounds.reduce((sum, round) => sum + round.botPoints, 0);

  const play = () => {
    const bot = MOVES[Math.floor(Math.random() * MOVES.length)];
    const [ownPoints, botPoints] = pointsFor(29, choice as Choice, bot as Choice);
    setRounds(previous => [...previous, { own: choice, bot, ownPoints, botPoints }]);
  };

  return <details className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5 text-slate-100">
    <summary className="cursor-pointer font-bold">✊ Rock–Paper–Scissors <span className="ml-2 text-sm font-normal text-slate-300">Bonus Solo Lab game</span></summary>
    <div className="mt-4 space-y-4">
      <p className="text-sm text-slate-300">Choose a move without seeing the random bot’s move. Rock beats Scissors, Paper beats Rock, and Scissors beats Paper. Win: 2 points · Tie: 1 each · Loss: 0.</p>
      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="mb-2 font-semibold">Your move</legend>
        {MOVES.map(move => <label key={move} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-semibold ${choice === move ? 'border-blue-400 bg-blue-950/70' : 'border-slate-600 bg-slate-950 hover:border-slate-400'}`}>
          <input type="radio" name="solo-rps-choice" value={move} checked={choice === move} onChange={() => setChoice(move)} className="accent-blue-500" />{move}
        </label>)}
      </fieldset>
      <button type="button" onClick={play} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 sm:w-auto">Play bot round</button>
      {latest && <div role="status" className="space-y-1 rounded-xl border border-emerald-700 bg-emerald-950/40 p-4">
        <p className="font-bold">{latest.ownPoints === latest.botPoints ? 'Tie' : latest.ownPoints > latest.botPoints ? 'You win' : 'Bot wins'}</p>
        <p>You chose {latest.own}; the bot chose {latest.bot}. You earned {latest.ownPoints} points; the bot earned {latest.botPoints}.</p>
        <p className="text-sm text-slate-300">After {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'}: you {ownTotal} · bot {botTotal} points.</p>
      </div>}
      <p className="text-sm text-slate-300">Strategy: mix your three moves so another player cannot predict you. Against this random bot, each move has the same expected score.</p>
      {rounds.length > 0 && <button type="button" onClick={() => setRounds([])} className="text-sm font-semibold text-blue-300 underline underline-offset-2">Reset practice scores</button>}
    </div>
  </details>;
}
