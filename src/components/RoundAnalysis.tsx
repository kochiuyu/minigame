import { gameFor, summarizeClass, summarizePeople, summarizePerson } from '../liveMatch';
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

function PersonAnalysis({ analysis, title }: { analysis: ReturnType<typeof summarizePerson>; title: string }) {
  const points = analysis.rounds.flatMap(item => item.result ? [item.result.ownPoints] : []);
  const minimum = Math.min(0, ...points);
  const maximum = Math.max(0, ...points);
  const span = Math.max(1, maximum - minimum);
  const zero = -minimum / span * 100;
  return <div className="space-y-4">
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-slate-300">{analysis.played} of {analysis.rounds.length} rounds played · {analysis.studentMatches} student matches · {analysis.botMatches} bot matches{analysis.fallbacks ? ` (${analysis.fallbacks} missing-partner fallbacks)` : ''}</p>
      <p className="text-xs text-slate-400 mt-1">Scores are compared within each game because games use different payoff scales.</p>
    </div>
    {analysis.played > 0 && <div>
      <h4 className="font-semibold mb-2">Points by round</h4>
      <div className="space-y-2" role="img" aria-label={analysis.rounds.map(item => `Round ${item.round}: ${item.result ? `${item.result.ownPoints} points` : 'no result'}`).join(', ')}>
        {analysis.rounds.map(item => {
          const value = item.result?.ownPoints;
          const position = value == null ? zero : (value - minimum) / span * 100;
          return <div key={item.round} className="grid grid-cols-[4rem_1fr_3rem] items-center gap-2 text-sm">
            <span>Round {item.round}</span>
            <div className="relative h-5 rounded bg-slate-800">
              {value != null && value !== 0 && <div className={`absolute top-0 h-5 rounded ${value < 0 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ left: `${Math.min(zero, position)}%`, width: `${Math.abs(position - zero)}%` }} />}
              <div className="absolute top-0 h-5 w-px bg-slate-400" style={{ left: `${zero}%` }} />
            </div>
            <span className="text-right">{value ?? '—'}</span>
          </div>;
        })}
      </div>
    </div>}
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">Your choices and scores by game</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-3">Game</th><th scope="col" className="py-2 pr-3">Played</th><th scope="col" className="py-2 pr-3">Choices (average points)</th><th scope="col" className="py-2">Average points</th></tr></thead>
        <tbody>{analysis.byGame.map(item => <tr key={item.gameId} className="border-b border-slate-800">
          <th scope="row" className="py-2 pr-3 font-normal">{gameFor(item.gameId).title}</th>
          <td className="pr-3">{item.played} / {item.rounds}</td>
          <td className="pr-3">{item.choices.map(choice => `${choice.label}: ${choice.count}${choice.count ? ` (avg ${score(choice.averagePoints)})` : ''}`).join(' · ')}</td>
          <td>{score(item.averagePoints)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">Your results in every round</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Round</th><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Choice</th><th scope="col" className="py-2 pr-2">Opponent</th><th scope="col" className="py-2">Points</th></tr></thead>
        <tbody>{analysis.rounds.map(item => <tr key={item.round} className="border-b border-slate-800">
          <th scope="row" className="py-2 pr-2 font-normal">{item.round}</th>
          <td className="pr-2">{gameFor(item.gameId).title}</td>
          <td className="pr-2">{item.result?.ownChoice || 'No choice'}</td>
          <td className="pr-2">{item.result ? `${item.result.opponentAlias} (${item.result.opponentChoice})` : '—'}</td>
          <td>{item.result?.ownPoints ?? '—'}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

export function FinalAnalysis({ summaries, archives, personalResults, studentView = false }: {
  summaries: RoundSummary[];
  archives?: Record<string, RoundArchive>;
  personalResults?: Record<string, MatchResult>;
  studentView?: boolean;
}) {
  const classSummary = summarizeClass(summaries);
  const people = archives ? summarizePeople(summaries, archives) : [];
  const maximumSubmitted = Math.max(1, ...summaries.map(item => item.submitted));
  return <div className="space-y-4">
    <div className="rounded-xl border border-blue-700 bg-blue-950/30 p-4 space-y-2">
      <h2 className="text-xl font-bold">{studentView ? 'Class results and your analysis' : 'Class results and analysis'}</h2>
      <p>{classSummary.rounds} rounds · {classSummary.submitted} choices submitted · {classSummary.studentPairs} completed student pairs · {classSummary.botMatches} bot matches</p>
      <p className="text-sm text-slate-300">The full class report is available now that all rounds are over. Scores are averaged within each game because games use different payoff scales.</p>
    </div>
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">All-round participation</h3>
        <div className="space-y-2" role="img" aria-label={summaries.map(item => `Round ${item.round}: ${item.submitted} choices submitted`).join(', ')}>
          {summaries.map(item => <div key={item.round} className="grid grid-cols-[4rem_1fr_3rem] items-center gap-2 text-sm">
            <span>Round {item.round}</span>
            <div className="h-5 rounded bg-slate-800"><div className="h-5 rounded bg-emerald-500" style={{ width: `${item.submitted / maximumSubmitted * 100}%` }} /></div>
            <span className="text-right">{item.submitted}</span>
          </div>)}
        </div>
        <p className="mt-2 text-xs text-slate-400">Bars show submitted choices; class size may change between rounds.</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Choices across all rounds, by game</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {classSummary.byGame.map(item => {
            const maximumChoice = Math.max(1, ...item.choiceCounts.map(choice => choice.count));
            return <div key={item.gameId} className="rounded-lg border border-slate-700 p-3">
              <h4 className="text-sm font-semibold mb-2">{gameFor(item.gameId).title} · {item.rounds} {item.rounds === 1 ? 'round' : 'rounds'}</h4>
              <div className="space-y-2" role="img" aria-label={item.choiceCounts.map(choice => `${choice.label}: ${choice.count}`).join(', ')}>
                {item.choiceCounts.map(choice => <div key={choice.label} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-xs">
                  <span>{choice.label}</span>
                  <div className="h-4 rounded bg-slate-800"><div className="h-4 rounded bg-blue-500" style={{ width: `${choice.count / maximumChoice * 100}%` }} /></div>
                  <span className="text-right">{choice.count}</span>
                </div>)}
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">Results by game</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Rounds</th><th scope="col" className="py-2 pr-2">Choices</th><th scope="col" className="py-2 pr-2">Student pairs</th><th scope="col" className="py-2 pr-2">Bot matches</th><th scope="col" className="py-2">Average score</th></tr></thead>
        <tbody>{classSummary.byGame.map(item => <tr key={item.gameId} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{gameFor(item.gameId).title}</th><td className="pr-2">{item.rounds}</td><td className="pr-2">{item.choiceCounts.map(choice => `${choice.label} ${choice.count}`).join(' · ')}</td><td className="pr-2">{item.studentPairs}</td><td className="pr-2">{item.botMatches}</td><td>{score(item.averagePoints)}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">All rounds at a glance</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Round</th><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Choices</th><th scope="col" className="py-2 pr-2">Student pairs</th><th scope="col" className="py-2 pr-2">Bot matches</th><th scope="col" className="py-2">Average score</th></tr></thead>
        <tbody>{summaries.map(item => <tr key={item.round} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{item.round}</th><td className="pr-2">{gameFor(item.gameId).title}</td><td className="pr-2">{item.choiceCounts.map(choice => `${choice.label} ${choice.count}`).join(' · ')}</td><td className="pr-2">{item.studentPairs}</td><td className="pr-2">{item.botMatches}</td><td>{score(item.averagePoints)}</td></tr>)}</tbody>
      </table>
    </div>
    {studentView && <div className="rounded-xl border border-blue-700 bg-blue-950/20 p-4">
      <PersonAnalysis analysis={summarizePerson(summaries, personalResults)} title="Your analysis across all rounds" />
    </div>}
    {archives && <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 space-y-3">
      <h3 className="text-lg font-bold">Individual student analysis</h3>
      {people.length === 0 ? <p className="text-sm text-slate-300">No student records are available.</p> : people.map(person => <details key={person.uid} className="rounded-lg border border-slate-700 bg-slate-900">
        <summary className="cursor-pointer px-4 py-3 font-semibold">{person.alias} · {person.analysis.played} of {summaries.length} rounds played</summary>
        <div className="border-t border-slate-700 p-4"><PersonAnalysis analysis={person.analysis} title={`${person.alias}'s analysis`} /></div>
      </details>)}
    </div>}
    {summaries.map(item => <details key={item.round} className="group" open={item.round === 1}>
      <summary className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold">Round {item.round}: {gameFor(item.gameId).title} · View chart and results</summary>
      <div className="mt-2"><RoundAnalysis summary={item} personal={personalResults?.[item.round]} archive={archives?.[item.round]} studentView={studentView} /></div>
    </details>)}
  </div>;
}
