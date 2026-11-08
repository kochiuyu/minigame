import { gameFor, summarizeClass } from '../liveMatch';
import type { MatchResult, RoundArchive, RoundSummary } from '../liveMatch';

function score(value: number | null | undefined): string {
  return value == null ? '—' : value.toFixed(1);
}

export function RoundAnalysis({ summary, personal, archive, studentView = false }: {
  summary: RoundSummary;
  personal?: MatchResult;
  archive?: RoundArchive;
  studentView?: boolean;
}) {
  const game = gameFor(summary.gameId);
  const maximum = Math.max(1, ...summary.choiceCounts.map(item => item.count));
  return <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 space-y-4">
    <div>
      <h3 className="text-lg font-bold">Round {summary.round} · {game.title}</h3>
      <p className="text-sm text-slate-300">{summary.submitted} submitted · {summary.studentPairs} completed student pairs · {summary.botMatches} bot matches{summary.fallbacks ? ` · ${summary.fallbacks} missing-partner fallbacks` : ''} · Average student score {score(summary.averagePoints)}</p>
    </div>
    <div>
      <h4 className="font-semibold mb-2">Student choices</h4>
      <div className="space-y-2" role="img" aria-label={summary.choiceCounts.map(item => `${item.label}: ${item.count}`).join(', ')}>
        {summary.choiceCounts.map(item => <div key={item.label} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-sm">
          <span>{item.label}</span>
          <div className="h-4 rounded bg-slate-800"><div className="h-4 rounded bg-blue-500" style={{ width: `${item.count / maximum * 100}%` }} /></div>
          <span className="text-right">{item.count}</span>
        </div>)}
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">Completed student pair outcomes</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-3">Outcome</th><th scope="col" className="py-2">Pairs</th></tr></thead>
        <tbody>{summary.outcomes.map(item => <tr key={item.label} className="border-b border-slate-800"><th scope="row" className="py-2 pr-3 font-normal">{item.label}</th><td className="py-2">{item.count}</td></tr>)}</tbody>
      </table>
      <p className="mt-2 text-xs text-slate-400">Bot matches are counted separately from student pairs.</p>
    </div>
    {studentView && <div className="border-t border-slate-700 pt-3">
      <h4 className="font-semibold">Your result</h4>
      {personal ? <table className="mt-2 w-full text-left text-sm">
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2">Player</th><th scope="col" className="py-2">Choice</th><th scope="col" className="py-2">Points</th></tr></thead>
        <tbody>
          <tr className="border-b border-slate-800"><th scope="row" className="py-2 font-normal">You</th><td>{personal.ownChoice}</td><td>{personal.ownPoints}</td></tr>
          <tr><th scope="row" className="py-2 font-normal">{personal.opponentAlias}</th><td>{personal.opponentChoice}</td><td>{personal.opponentPoints}</td></tr>
        </tbody>
      </table> : <p className="text-sm text-slate-300">No personal result is available for this round.</p>}
      {personal?.fallback && <p className="text-sm text-amber-300 mt-2">Your partner did not submit, so a random bot took their place.</p>}
    </div>}
    {archive && <div className="border-t border-slate-700 pt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">Student results</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Alias</th><th scope="col" className="py-2 pr-2">Choice</th><th scope="col" className="py-2 pr-2">Opponent</th><th scope="col" className="py-2">Points</th></tr></thead>
        <tbody>{Array.from(new Set([...Object.keys(archive.aliases || {}), ...Object.keys(archive.results || {})]))
          .map(uid => [uid, archive.aliases?.[uid] || 'Student who left'] as const)
          .sort((a, b) => a[1].localeCompare(b[1])).map(([uid, alias]) => {
          const result = archive.results?.[uid];
          return <tr key={uid} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{alias}</th><td className="pr-2">{result?.ownChoice || 'No choice'}</td><td className="pr-2">{result?.opponentAlias || '—'}</td><td>{result?.ownPoints ?? '—'}</td></tr>;
        })}</tbody>
      </table>
    </div>}
  </div>;
}

export function FinalAnalysis({ summaries, archives, personalResults, studentView = false }: {
  summaries: RoundSummary[];
  archives?: Record<string, RoundArchive>;
  personalResults?: Record<string, MatchResult>;
  studentView?: boolean;
}) {
  const classSummary = summarizeClass(summaries);
  return <div className="space-y-4">
    <div className="rounded-xl border border-blue-700 bg-blue-950/30 p-4 space-y-2">
      <h2 className="text-xl font-bold">Class results and analysis</h2>
      <p>{classSummary.rounds} rounds · {classSummary.submitted} choices submitted · {classSummary.studentPairs} completed student pairs · {classSummary.botMatches} bot matches</p>
      <p className="text-sm text-slate-300">Compare choices and pair outcomes across rounds. Scores are averaged within each game because games use different payoff scales.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">Results by game</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Rounds</th><th scope="col" className="py-2 pr-2">Choices</th><th scope="col" className="py-2 pr-2">Student pairs</th><th scope="col" className="py-2">Average score</th></tr></thead>
        <tbody>{classSummary.byGame.map(item => <tr key={item.gameId} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{gameFor(item.gameId).title}</th><td className="pr-2">{item.rounds}</td><td className="pr-2">{item.choiceCounts.map(choice => `${choice.label} ${choice.count}`).join(' · ')}</td><td className="pr-2">{item.studentPairs}</td><td>{score(item.averagePoints)}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">All rounds at a glance</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Round</th><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Choices</th><th scope="col" className="py-2 pr-2">Student pairs</th><th scope="col" className="py-2">Average score</th></tr></thead>
        <tbody>{summaries.map(item => <tr key={item.round} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{item.round}</th><td className="pr-2">{gameFor(item.gameId).title}</td><td className="pr-2">{item.submitted}</td><td className="pr-2">{item.studentPairs}</td><td>{score(item.averagePoints)}</td></tr>)}</tbody>
      </table>
    </div>
    {summaries.map(item => <details key={item.round} className="group" open={item.round === 1}>
      <summary className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold">Round {item.round}: {gameFor(item.gameId).title} · View chart and results</summary>
      <div className="mt-2"><RoundAnalysis summary={item} personal={personalResults?.[item.round]} archive={archives?.[item.round]} studentView={studentView} /></div>
    </details>)}
  </div>;
}
