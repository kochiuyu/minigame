import { useRef } from 'react';
import { gameFor, summarizeClass, summarizePeople, summarizePerson } from '../liveMatch';
import type { MatchResult, RoundArchive, RoundSummary } from '../liveMatch';
import { buildReportCsv } from '../reportExport';
import { CentipedeTree } from './CentipedeTree';

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
      <p className="text-sm text-slate-300">{summary.gameId === 11
        ? `${summary.submitted} guesses · Class average ${score(summary.beauty?.average)} · Target ${score(summary.beauty?.target)} · ${summary.beauty?.winners || 0} closest guess${summary.beauty?.winners === 1 ? '' : 'es'}`
        : summary.gameId === 12
        ? `${summary.submitted} contributed · ${summary.studentGroups || 0} groups · ${summary.botSeats || 0} bot seats${summary.fallbacks ? ` (${summary.fallbacks} filled for missing students)` : ''} · Average contribution ${score(summary.averageContribution)} · Average pool ${score(summary.averagePool)}`
        : `${summary.submitted} ${summary.gameId === 20 || summary.gameId === 6 ? 'played' : 'submitted'} · ${summary.studentPairs} completed student pairs · ${summary.botMatches} bot matches${summary.fallbacks ? ` · ${summary.fallbacks} bot fallbacks` : ''}${summary.gameId === 19 ? ` · Average return ${score(summary.averageReturn)}` : ''}`} · Average student score {score(summary.averagePoints)}</p>
    </div>
    <div>
      <h4 className="font-semibold mb-2">{summary.gameId === 11 ? 'Guess distribution' : summary.gameId === 26 ? 'Claim distribution ($)' : summary.gameId === 28 ? 'Offers and seller responses' : summary.gameId === 12 ? 'Student contributions' : summary.gameId === 19 ? 'Student investments' : 'Student choices'}</h4>
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
        <caption className="text-left font-semibold mb-2">{summary.gameId === 11 ? 'Classwide outcomes' : summary.gameId === 12 ? 'Group pool totals' : 'Completed student pair outcomes'}</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-3">{summary.gameId === 12 ? 'Total contribution' : 'Outcome'}</th><th scope="col" className="py-2">{summary.gameId === 11 ? 'Students' : summary.gameId === 12 ? 'Groups' : 'Pairs'}</th></tr></thead>
        <tbody>{summary.outcomes.map(item => <tr key={item.label} className="border-b border-slate-800"><th scope="row" className="py-2 pr-3 font-normal">{item.label}</th><td className="py-2">{item.count}</td></tr>)}</tbody>
      </table>
      <p className="mt-2 text-xs text-slate-400">{summary.gameId === 11 ? 'Only submitted guesses determine the average and target.' : summary.gameId === 12 ? 'Each group has four seats; bots fill unoccupied or missing seats.' : summary.gameId === 6 ? 'Outcomes count each of the five turns in completed student pairs; bot matches are separate.' : 'Bot matches are counted separately from student pairs.'}</p>
    </div>
    {studentView && <div className="border-t border-slate-700 pt-3">
      <h4 className="font-semibold">Your result</h4>
      {personal?.beauty ? <div className="mt-2 space-y-1 text-sm text-slate-300">
        <p>Your guess: {personal.ownChoice}. Class average: {score(personal.beauty.average)}. Target: {score(personal.beauty.target)}. Your distance: {score(personal.beauty.distance)}.</p>
        <p>{personal.beauty.winner ? 'Your guess was closest.' : 'Another guess was closer.'} You earned <strong className="text-slate-100">{personal.ownPoints} {personal.ownPoints === 1 ? 'point' : 'points'}</strong>.</p>
      </div> : personal?.group ? <div className="mt-2 space-y-1 text-sm text-slate-300">
        <p>You {personal.ownChoice.toLowerCase().replace('contribute', 'contributed')} points. The group pool was {personal.group.totalContribution}; your share was {score(personal.group.totalContribution * 0.4)} points.</p>
        <p>You earned <strong className="text-slate-100">{score(personal.ownPoints)} points</strong>. Your group included {personal.group.classmates} other students and {personal.group.bots} random bots.</p>
      </div> : personal ? <table className="mt-2 w-full text-left text-sm">
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2">Player</th><th scope="col" className="py-2">Choice</th><th scope="col" className="py-2">Points</th></tr></thead>
        <tbody>
          <tr className="border-b border-slate-800"><th scope="row" className="py-2 font-normal">You</th><td>{personal.repeatedTurns ? 'Five turns' : personal.ownChoice}</td><td>{personal.ownPoints}</td></tr>
          <tr><th scope="row" className="py-2 font-normal">{personal.opponentAlias}</th><td>{personal.repeatedTurns ? 'Five turns' : personal.opponentChoice}</td><td>{personal.opponentPoints}</td></tr>
        </tbody>
      </table> : <p className="text-sm text-slate-300">No personal result is available for this round.</p>}
      {summary.gameId === 26 && personal?.opponentChoice && <p className="mt-2 text-sm text-blue-200">The lower claim was ${Math.min(Number(personal.ownChoice.slice(6)), Number(personal.opponentChoice.slice(6)))}. {personal.ownChoice === personal.opponentChoice ? 'Matching claims received that amount.' : Number(personal.ownChoice.slice(6)) < Number(personal.opponentChoice.slice(6)) ? 'Your lower claim earned a $2 bonus.' : 'Your higher claim incurred a $2 penalty.'}</p>}
      {personal?.lemons && <p className="mt-2 text-sm text-blue-200">The car was {personal.lemons.quality.toLowerCase()} quality. The buyer offered ${personal.lemons.offer}; the seller {personal.lemons.accepted ? 'accepted' : 'rejected'}. Your profit: ${personal.ownPoints}.</p>}
      {personal?.exitNode && <p className="mt-2 text-sm text-blue-200">{personal.exitNode === 7 ? 'Both players passed all six nodes.' : `The chain ended with Take at Node ${personal.exitNode}.`}</p>}
        {personal?.auction && <p className="mt-2 text-sm text-blue-200">Your private value: {personal.auction.valuation}. {personal.auction.won ? `You won and paid ${personal.auction.price}.` : `${personal.opponentAlias} won and paid ${personal.auction.price}.`} Your profit: {personal.ownPoints}.</p>}
      {personal?.commonValue && <p className="mt-2 text-sm text-blue-200">Your survey: ${personal.commonValue.signal}; rival survey: ${personal.commonValue.otherSignal}; true lease value: ${personal.commonValue.trueValue}. {personal.commonValue.won ? 'You won.' : 'You lost.'} Your profit: ${personal.ownPoints}.</p>}
      {personal?.signaling && <p className="mt-2 text-sm text-blue-200">Product quality: {personal.signaling.quality}. Seller {personal.signaling.signal ? 'bought a signal' : 'sent no signal'}; buyer {personal.signaling.trusted ? 'trusted' : 'did not trust'}.</p>}
      {personal?.centipedeMoves && <div className="mt-3"><CentipedeTree moves={personal.centipedeMoves} exitNode={personal.exitNode} /></div>}
      {personal?.centipedeMoves && <p className="mt-2 text-sm text-slate-300">“Pass All” in the table means this player did not Take before the chain ended.</p>}
      {personal?.repeatedTurns && <div className="mt-3 overflow-x-auto"><table className="w-full text-sm text-left"><caption className="text-left font-semibold mb-1">Your five turns</caption><thead><tr><th>Turn</th><th>You</th><th>Opponent</th><th>Points</th></tr></thead><tbody>{Object.entries(personal.repeatedTurns).map(([turn, item]) => <tr key={turn}><td>{turn}</td><td>{item.own}</td><td>{item.other}{item.bot ? ' (bot filled a choice)' : ''}</td><td>{item.ownPoints} / {item.otherPoints}</td></tr>)}</tbody></table></div>}
      {personal?.fallback && <p className="text-sm text-amber-300 mt-2">{personal.group
        ? `${personal.group.missing} group member${personal.group.missing === 1 ? '' : 's'} did not contribute, so random bots filled those seats.`
        : summary.gameId === 20 || summary.gameId === 6 ? 'A random bot filled a missed turn.' : 'Your partner did not submit, so a random bot took their place.'}</p>}
    </div>}
    {archive && <div className="border-t border-slate-700 pt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">Student results</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Alias</th><th scope="col" className="py-2 pr-2">Choice</th><th scope="col" className="py-2 pr-2">{summary.gameId === 11 ? 'Distance to target' : summary.gameId === 12 ? 'Group pool' : 'Opponent'}</th><th scope="col" className="py-2">Points</th></tr></thead>
        <tbody>{Array.from(new Set([...Object.keys(archive.aliases || {}), ...Object.keys(archive.results || {})]))
          .map(uid => [uid, archive.aliases?.[uid] || 'Student who left'] as const)
          .sort((a, b) => a[1].localeCompare(b[1])).map(([uid, alias]) => {
          const result = archive.results?.[uid];
          return <tr key={uid} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{alias}</th><td className="pr-2">{result?.repeatedTurns ? Object.entries(result.repeatedTurns).map(([turn, item]) => `${turn}: ${item.own}`).join(' · ') : result?.ownChoice || 'No choice'}{result?.auction ? ` (value ${result.auction.valuation}; ${result.auction.won ? `won, paid ${result.auction.price}` : 'lost'})` : ''}{result?.commonValue ? ` (survey ${result.commonValue.signal}; true value ${result.commonValue.trueValue}; ${result.commonValue.won ? 'won' : 'lost'})` : ''}{result?.signaling ? ` (quality ${result.signaling.quality})` : ''}{result?.lemons ? ` (${result.lemons.quality} quality; ${result.lemons.accepted ? 'sold' : 'no sale'})` : ''}</td><td className="pr-2">{summary.gameId === 11 ? score(result?.beauty?.distance) : summary.gameId === 12 ? result?.group?.totalContribution ?? '—' : result?.opponentAlias || '—'}</td><td>{result?.ownPoints ?? '—'}</td></tr>;
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
      <p className="text-sm text-slate-300">{analysis.played} of {analysis.rounds.length} rounds played · {analysis.studentMatches} student matches{analysis.groupRounds ? ` · ${analysis.groupRounds} group or class rounds` : ''} · {analysis.botMatches} bot matches{analysis.fallbacks ? ` (${analysis.fallbacks} rounds with bot fallbacks)` : ''}</p>
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
        <caption className="text-left font-semibold mb-2">Choices and scores by game</caption>
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
        <caption className="text-left font-semibold mb-2">Results in every round</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Round</th><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Choice</th><th scope="col" className="py-2 pr-2">Opponent / group</th><th scope="col" className="py-2">Points</th></tr></thead>
        <tbody>{analysis.rounds.map(item => <tr key={item.round} className="border-b border-slate-800">
          <th scope="row" className="py-2 pr-2 font-normal">{item.round}</th>
          <td className="pr-2">{gameFor(item.gameId).title}</td>
          <td className="pr-2">{item.result?.repeatedTurns ? Object.entries(item.result.repeatedTurns).map(([turn, move]) => `${turn}: ${move.own}`).join(' · ') : item.result?.ownChoice || 'No choice'}{item.result?.auction ? ` (value ${item.result.auction.valuation}; ${item.result.auction.won ? `won, paid ${item.result.auction.price}` : 'lost'})` : ''}</td>
          <td className="pr-2">{item.result?.beauty ? `Target ${score(item.result.beauty.target)} · Distance ${score(item.result.beauty.distance)}` : item.result?.group ? `Group pool ${item.result.group.totalContribution} (${item.result.group.bots} bots)`
            : item.result ? `${item.result.opponentAlias} (${item.result.opponentChoice})${item.result.exitNode ? ` · ${item.result.exitNode === 7 ? 'Both passed' : `Ended at Node ${item.result.exitNode}`}` : ''}` : '—'}</td>
          <td>{item.result?.ownPoints ?? '—'}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

export function FinalAnalysis({ summaries, archives, personalResults, alias, studentView = false }: {
  summaries: RoundSummary[];
  archives?: Record<string, RoundArchive>;
  personalResults?: Record<string, MatchResult>;
  alias?: string;
  studentView?: boolean;
}) {
  const reportRef = useRef<HTMLDivElement>(null);
  const classSummary = summarizeClass(summaries);
  const people = archives ? summarizePeople(summaries, archives) : [];
  const maximumSubmitted = Math.max(1, ...summaries.map(item => item.submitted));
  function downloadCsv() {
    const content = buildReportCsv(id => gameFor(id).title, summaries, studentView ? undefined : archives,
      studentView ? personalResults : undefined, alias);
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `GameTheory-${studentView ? 'my' : 'class'}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function printReport() {
    const details = Array.from(reportRef.current?.querySelectorAll('details') || []);
    const prior = details.map(item => item.open);
    details.forEach(item => { item.open = true; });
    window.addEventListener('afterprint', () => details.forEach((item, index) => { item.open = prior[index]; }), { once: true });
    window.print();
  }
  return <div id="live-final-report" ref={reportRef} className="space-y-4">
    <div className="report-export-controls flex flex-wrap gap-3 rounded-xl border border-blue-700 bg-blue-950/30 p-4">
      <button type="button" onClick={printReport} className="rounded-lg bg-blue-600 px-4 py-2 font-bold">Print / Save PDF</button>
      <button type="button" onClick={downloadCsv} className="rounded-lg border border-blue-400 px-4 py-2 font-bold">Download results CSV</button>
      <p className="w-full text-sm text-slate-300">Save a PDF with charts or a spreadsheet with round results before the class data is cleared.</p>
    </div>
    <div className="rounded-xl border border-blue-700 bg-blue-950/30 p-4 space-y-2">
      <h2 className="text-xl font-bold">{studentView ? 'Class results and your analysis' : 'Class results and analysis'}</h2>
      <p>{classSummary.rounds} rounds · {classSummary.submitted} submissions · {classSummary.studentPairs} completed student pairs{classSummary.studentGroups ? ` · ${classSummary.studentGroups} groups` : ''}{summaries.some(item => item.gameId === 11) ? ` · ${summaries.filter(item => item.gameId === 11).length} classwide rounds` : ''} · {classSummary.botMatches} bot matches{classSummary.botSeats ? ` · ${classSummary.botSeats} bot seats` : ''}</p>
      <p className="text-sm text-slate-300">The full class report is available now that all rounds are over. Scores are averaged within each game because games use different payoff scales.</p>
    </div>
    {studentView && <div className="rounded-xl border border-blue-700 bg-blue-950/20 p-4">
      <PersonAnalysis analysis={summarizePerson(summaries, personalResults)} title="Your analysis across all rounds" />
    </div>}
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
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Rounds</th><th scope="col" className="py-2 pr-2">Choices</th><th scope="col" className="py-2 pr-2">Pairs / groups</th><th scope="col" className="py-2 pr-2">Bots</th><th scope="col" className="py-2">Average score</th></tr></thead>
        <tbody>{classSummary.byGame.map(item => <tr key={item.gameId} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{gameFor(item.gameId).title}</th><td className="pr-2">{item.rounds}</td><td className="pr-2">{item.choiceCounts.map(choice => `${choice.label} ${choice.count}`).join(' · ')}</td><td className="pr-2">{item.gameId === 11 ? 'Classwide' : item.gameId === 12 ? `${item.studentGroups} groups` : `${item.studentPairs} pairs`}</td><td className="pr-2">{item.gameId === 11 ? '—' : item.gameId === 12 ? `${item.botSeats} seats` : `${item.botMatches} matches`}</td><td>{score(item.averagePoints)}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold mb-2">All rounds at a glance</caption>
        <thead><tr className="border-b border-slate-700"><th scope="col" className="py-2 pr-2">Round</th><th scope="col" className="py-2 pr-2">Game</th><th scope="col" className="py-2 pr-2">Choices</th><th scope="col" className="py-2 pr-2">Pairs / groups</th><th scope="col" className="py-2 pr-2">Bots</th><th scope="col" className="py-2">Average score</th></tr></thead>
        <tbody>{summaries.map(item => <tr key={item.round} className="border-b border-slate-800"><th scope="row" className="py-2 pr-2 font-normal">{item.round}</th><td className="pr-2">{gameFor(item.gameId).title}</td><td className="pr-2">{item.choiceCounts.map(choice => `${choice.label} ${choice.count}`).join(' · ')}</td><td className="pr-2">{item.gameId === 11 ? 'Classwide' : item.gameId === 12 ? `${item.studentGroups || 0} groups` : `${item.studentPairs} pairs`}</td><td className="pr-2">{item.gameId === 11 ? '—' : item.gameId === 12 ? `${item.botSeats || 0} seats` : `${item.botMatches} matches`}</td><td>{score(item.averagePoints)}</td></tr>)}</tbody>
      </table>
    </div>
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
