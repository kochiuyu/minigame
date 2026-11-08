import type { GameId, MatchResult, RoundArchive, RoundSummary } from './liveMatch';

type ReportRow = Array<string | number | boolean | null | undefined>;

const HEADER = [
  'Type', 'Round', 'Game', 'Alias', 'Choice or outcome', 'Count', 'Opponent or group',
  'Opponent choice', 'Points', 'Opponent points', 'Match type', 'Bot fallback',
  'Submitted', 'Student pairs', 'Student groups', 'Bot matches', 'Bot seats', 'Average score',
];

function csvCell(value: ReportRow[number]): string {
  let text = value == null ? '' : String(value);
  // Keep aliases entered by students from becoming spreadsheet formulas.
  if (typeof value === 'string' && /^[\s\uFEFF]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function resultRow(round: number, game: string, alias: string, result?: MatchResult): ReportRow {
  return [
    'Student result', round, game, alias, result?.ownChoice || 'No choice', '',
    result?.group ? `Group pool ${result.group.totalContribution}` : result?.opponentAlias,
    result?.opponentChoice, result?.ownPoints, result?.opponentPoints,
    result?.opponentKind, result?.fallback ? 'Yes' : 'No',
  ];
}

export function buildReportCsv(gameTitle: (id: GameId) => string, summaries: RoundSummary[], archives?: Record<string, RoundArchive>,
  personalResults?: Record<string, MatchResult>, alias = 'You'): string {
  const rows: ReportRow[] = [HEADER];
  for (const summary of summaries) {
    const game = gameTitle(summary.gameId);
    rows.push(['Round summary', summary.round, game, '', '', '', '', '', '', '', '', '',
      summary.submitted, summary.studentPairs, summary.studentGroups, summary.botMatches,
      summary.botSeats, summary.averagePoints]);
    for (const item of summary.choiceCounts) rows.push(['Choice count', summary.round, game, '', item.label, item.count]);
    for (const item of summary.outcomes) rows.push(['Outcome count', summary.round, game, '', item.label, item.count]);
    if (archives) {
      const archive = archives[summary.round];
      const uids = new Set([...Object.keys(archive?.aliases || {}), ...Object.keys(archive?.results || {})]);
      for (const uid of uids) rows.push(resultRow(summary.round, game, archive?.aliases?.[uid] || 'Student who left', archive?.results?.[uid]));
    } else if (personalResults) {
      rows.push(resultRow(summary.round, game, alias, personalResults[summary.round]));
    }
  }
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
