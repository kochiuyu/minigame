import type { GameId, MatchResult, RoundArchive, RoundSummary } from './liveMatch';

type ReportRow = Array<string | number | boolean | null | undefined>;

const HEADER = [
  'Type', 'Round', 'Game', 'Alias', 'Choice or outcome', 'Count', 'Opponent or group',
  'Opponent choice', 'Points', 'Opponent points', 'Match type', 'Bot fallback',
  'Submitted', 'Student pairs', 'Student groups', 'Bot matches', 'Bot seats', 'Average score',
  'Private value', 'Won auction', 'Winning bid', 'Price paid',
  'Class average', 'Beauty target', 'Distance to target', 'Closest guess',
  'Product quality', 'Seller signaled', 'Buyer trusted',
  'Market price', 'Combined output', 'Own beach location', 'Rival beach location', 'Beach market share',
  'Private survey signal', 'Rival survey signal', 'Common true value', 'Won common-value auction',
  'Own dollar bid', 'Rival dollar bid', 'Won dollar auction',
  'Own traveler claim', 'Rival traveler claim', 'Lower claim', 'Claim adjustment',
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
    '', '', '', '', '', '',
    result?.auction?.valuation, result?.auction ? (result.auction.won ? 'Yes' : 'No') : '',
    result?.auction?.winningBid, result?.auction?.won ? result.auction.price : '',
    result?.beauty?.average, result?.beauty?.target, result?.beauty?.distance,
    result?.beauty ? (result.beauty.winner ? 'Yes' : 'No') : '',
    result?.signaling?.quality, result?.signaling ? (result.signaling.signal ? 'Yes' : 'No') : '',
    result?.signaling ? (result.signaling.trusted ? 'Yes' : 'No') : '',
    result?.ownChoice.startsWith('Quantity ') && result.opponentChoice?.startsWith('Quantity ')
      ? Math.max(0, 100 - Number(result.ownChoice.slice(9)) - Number(result.opponentChoice.slice(9))) : '',
    result?.ownChoice.startsWith('Quantity ') && result.opponentChoice?.startsWith('Quantity ')
      ? Number(result.ownChoice.slice(9)) + Number(result.opponentChoice.slice(9)) : '',
    result?.ownChoice.startsWith('Location ') ? Number(result.ownChoice.slice(9)) : '',
    result?.opponentChoice?.startsWith('Location ') ? Number(result.opponentChoice.slice(9)) : '',
    result?.ownChoice.startsWith('Location ') ? result.ownPoints : '',
    result?.commonValue?.signal, result?.commonValue?.otherSignal, result?.commonValue?.trueValue,
    result?.commonValue ? (result.commonValue.won ? 'Yes' : 'No') : '',
    game === 'Escalating Dollar Auction' && result?.ownChoice ? Number(result.ownChoice.slice(4)) : '',
    game === 'Escalating Dollar Auction' && result?.opponentChoice ? Number(result.opponentChoice.slice(4)) : '',
    game === 'Escalating Dollar Auction' && result?.opponentChoice
      ? result.ownPoints + Number(result.ownChoice.slice(4)) > 0 ? 'Yes' : 'No' : '',
    game === "Traveler's Dilemma" && result?.ownChoice ? Number(result.ownChoice.slice(6)) : '',
    game === "Traveler's Dilemma" && result?.opponentChoice ? Number(result.opponentChoice.slice(6)) : '',
    game === "Traveler's Dilemma" && result?.opponentChoice ? Math.min(Number(result.ownChoice.slice(6)), Number(result.opponentChoice.slice(6))) : '',
    game === "Traveler's Dilemma" && result?.opponentChoice ? result.ownPoints - Math.min(Number(result.ownChoice.slice(6)), Number(result.opponentChoice.slice(6))) : '',
  ];
}

function turnRows(round: number, game: string, alias: string, result?: MatchResult): ReportRow[] {
  return Object.entries(result?.repeatedTurns || {}).map(([turn, item]) => [
    'Match turn', round, game, alias, item.own, Number(turn), result?.opponentAlias,
    item.other, item.ownPoints, item.otherPoints, item.bot ? 'Bot filled a choice' : result?.opponentKind,
    item.bot ? 'Yes' : 'No',
  ]);
}

export function buildReportCsv(gameTitle: (id: GameId) => string, summaries: RoundSummary[], archives?: Record<string, RoundArchive>,
  personalResults?: Record<string, MatchResult>, alias = 'You'): string {
  const rows: ReportRow[] = [HEADER];
  for (const summary of summaries) {
    const game = gameTitle(summary.gameId);
    rows.push(['Round summary', summary.round, game, '', '', '', '', '', '', '', '', '',
      summary.submitted, summary.studentPairs, summary.studentGroups, summary.botMatches,
      summary.botSeats, summary.averagePoints, '', '', '', '',
      summary.beauty?.average, summary.beauty?.target, summary.beauty?.winningDistance, summary.beauty?.winners]);
    for (const item of summary.choiceCounts) rows.push(['Choice count', summary.round, game, '', item.label, item.count]);
    for (const item of summary.outcomes) rows.push(['Outcome count', summary.round, game, '', item.label, item.count]);
    if (archives) {
      const archive = archives[summary.round];
      const uids = new Set([...Object.keys(archive?.aliases || {}), ...Object.keys(archive?.results || {})]);
      for (const uid of uids) {
        const name = archive?.aliases?.[uid] || 'Student who left';
        const result = archive?.results?.[uid];
        rows.push(resultRow(summary.round, game, name, result), ...turnRows(summary.round, game, name, result));
      }
    } else if (personalResults) {
      const result = personalResults[summary.round];
      rows.push(resultRow(summary.round, game, alias, result), ...turnRows(summary.round, game, alias, result));
    }
  }
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
