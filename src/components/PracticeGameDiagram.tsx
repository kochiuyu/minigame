import { auctionBid, auctionPayoff, firstPriceAuctionPayoff, bertrandPrice, blottoAllocation, contributionAmount, fisheryPoints, gameFor, investAmount, offerAmount, pointsFor, publicGoodsPoints, returnAmount, signalingPoints, trawlerAmount } from '../liveMatch';
import type { Choice, GameId, PracticeCentipedePath, Role } from '../liveMatch';
import { CentipedeTree } from './CentipedeTree';

type PracticeResult = { ownChoice: Choice; botChoice: Choice | null; groupTotal?: number; signaling?: { quality: 'High' | 'Low'; signal: boolean; trusted: boolean } } | null;

type Props = {
  gameId: GameId;
  choice: Choice;
  role: Role;
  botOffer: Choice;
  result: PracticeResult;
  centipedePath?: PracticeCentipedePath;
  valuation?: number;
};

export function PracticeGameDiagram({ gameId, choice, role, botOffer, result, centipedePath, valuation }: Props) {
  if (gameId === 14) {
    const own = bertrandPrice(result?.ownChoice || choice);
    const bot = result?.botChoice ? bertrandPrice(result.botChoice) : null;
    return <div data-game-diagram="bertrand" className="space-y-2 border-t border-slate-700 pt-3 text-sm">
      <h3 className="font-bold text-slate-100">How the price war scores</h3>
      <p>The lower price wins all sales. At the same price, each firm receives half the market. Demand is 100 minus price; marginal cost is $10 per unit.</p>
      {own !== null && bot !== null && <p>Your price ${own}; bot price ${bot}. Your profit: {pointsFor(14, `Price ${own}`, `Price ${bot}`)[0]}.</p>}
    </div>;
  }
  if (gameId === 11) return <div data-game-diagram="beauty" className="space-y-2 border-t border-slate-700 pt-3 text-sm">
    <h3 className="font-bold text-slate-100">How the target is found</h3>
    <p>Average your guess with three random bot guesses, then multiply by 2/3. The closest guess earns 5 points; exact ties each earn 5. Other guesses earn 1.</p>
    <p>Example: guesses 10, 20, 30, 40 average to 25, so the target is 16.67. The guess 20 is closest.</p>
  </div>;
  if (gameId === 7 || gameId === 8) {
    const ownBid = auctionBid(result?.ownChoice || choice) ?? 0;
    const botBid = result?.botChoice ? auctionBid(result.botChoice) : null;
    const outcome = botBid === null ? null : (gameId === 8 ? firstPriceAuctionPayoff : auctionPayoff)(ownBid, botBid, valuation ?? 1, true);
    return <div data-game-diagram="auction" className="space-y-2 border-t border-slate-700 pt-3 text-sm">
      <h3 className="font-bold text-slate-100">How the auction scores</h3>
      <p>The highest sealed bid wins the artwork. The winner pays {gameId === 8 ? 'their own bid' : 'the other bid'}; the loser pays nothing. Ties go to you in bot practice.</p>
      <p>Your profit if you win = your private value ({valuation}) − {gameId === 8 ? 'your bid' : 'bot bid'}. Bidding above your value can produce a loss.</p>
      {outcome && <p className="font-semibold text-blue-200">Your bid {ownBid} · Bot bid {botBid} · {outcome.won ? `You paid ${outcome.price} and scored ${outcome.points}.` : 'The bot won; you scored 0.'}</p>}
    </div>;
  }
  if (gameId === 27) {
    const own = trawlerAmount(choice) ?? 0;
    const bot = result?.botChoice ? trawlerAmount(result.botChoice) : null;
    const total = bot === null ? null : own + bot;
    return <div data-game-diagram="fishery" className="space-y-2 border-t border-slate-700 pt-3">
      <h3 className="font-bold text-slate-100">Shared fishery health</h3>
      <p>Profit per trawler falls when both fleets overfish. Each classroom round starts with a fresh fishery.</p>
      <table className="w-full text-sm text-left"><thead><tr><th>Combined boats</th><th>Stock</th><th>Profit per boat</th></tr></thead><tbody>
        <tr><td>0–8</td><td>Healthy</td><td>2</td></tr><tr><td>9–12</td><td>Depleted</td><td>0.9</td></tr><tr><td>13–20</td><td>Overfished</td><td>−0.5</td></tr>
      </tbody></table>
      {total !== null && <p>Your {own} boats plus the bot's {bot} made {total}. Your profit: {fisheryPoints(own, bot!)[0]} points.</p>}
    </div>;
  }
  if (gameId === 20) {
    return <CentipedeTree currentNode={centipedePath?.exitNode ? undefined : centipedePath?.node || 1} moves={centipedePath?.moves} exitNode={centipedePath?.exitNode} />;
  }
  if (gameId === 10) return <div data-game-diagram="signaling" className="space-y-2 border-t border-slate-700 pt-3 text-sm">
    <h3 className="font-bold text-slate-100">How signaling scores</h3>
    <p>Quality is private to the seller. A signal costs 1 point for High quality and 3 for Low quality. The buyer sees the signal, then decides whether to trust.</p>
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Quality</th><th>Signal</th><th>Buyer</th><th>Seller / Buyer</th></tr></thead><tbody>
      {(['High', 'Low'] as const).flatMap(quality => (['Signal', 'No Signal'] as const).flatMap(signal => (['Trust', 'Do Not Trust'] as const).map(response => {
        const [seller, buyer] = signalingPoints(quality, signal, response);
        const played = result?.signaling?.quality === quality && result.signaling.signal === (signal === 'Signal') && result.signaling.trusted === (response === 'Trust');
        return <tr key={`${quality}-${signal}-${response}`} className={played ? 'font-bold text-emerald-300' : ''}><td>{quality}</td><td>{signal}</td><td>{response}</td><td>{seller} / {buyer}</td></tr>;
      }))) }
    </tbody></table></div>
  </div>;
  if (gameId === 2 || gameId === 5) {
    const first = role === 'first' ? choice : botOffer;
    const second = role === 'second' ? choice : result?.botChoice;
    const firstMoves = gameId === 2 ? ['Launch', 'Wait'] as const : ['Commit', 'Stay Flexible'] as const;
    return <div data-game-diagram="tree" className="space-y-2 border-t border-slate-700 pt-3">
      <h3 className="font-bold text-slate-100">Decision tree</h3>
      <p>The {gameId === 5 ? 'Incumbent' : 'First Mover'} chooses; the {gameId === 5 ? 'Rival' : 'Second Mover'} sees that choice before deciding. Points are {gameId === 5 ? 'Incumbent / Rival' : 'First / Second Mover'}.</p>
      <div className="grid gap-3 sm:grid-cols-2">{firstMoves.map(firstMove => <div key={firstMove} className="rounded-lg border border-slate-700 p-3">
        <p className="font-semibold">{gameId === 5 ? 'Incumbent' : 'First'}: {firstMove}</p>
        {(['Enter', 'Stay Out'] as const).map(secondMove => {
          const [a, b] = pointsFor(gameId, firstMove, secondMove);
          return <p key={secondMove} className={first === firstMove && second === secondMove ? 'font-bold text-emerald-300' : ''}>{gameId === 5 ? 'Rival' : 'Second'}: {secondMove} → {a} / {b}</p>;
        })}
      </div>)}</div>
    </div>;
  }
  if (gameId === 23) {
    const yourTroops = blottoAllocation(choice) || [34, 33, 33];
    const botTroops = result?.botChoice ? blottoAllocation(result.botChoice) : null;
    return <div data-game-diagram="battlefront" className="space-y-2 border-t border-slate-700 pt-3">
      <h3 className="font-bold text-slate-100">Three-front battle</h3>
      <p>Deploy 100 troops. The higher number wins each front. Compare front wins to score the round.</p>
      <div className="overflow-x-auto"><table className="w-full text-center text-sm">
        <thead><tr className="border-b border-slate-700"><th scope="col" className="p-2 text-left">Front</th><th scope="col" className="p-2">A</th><th scope="col" className="p-2">B</th><th scope="col" className="p-2">C</th></tr></thead>
        <tbody>
          <tr className="border-b border-slate-800"><th scope="row" className="p-2 text-left font-normal">Your troops</th>{yourTroops.map((count, index) => <td key={index}>{count}</td>)}</tr>
          {botTroops && <tr><th scope="row" className="p-2 text-left font-normal">Bot troops</th>{botTroops.map((count, index) => <td key={index}>{count}</td>)}</tr>}
        </tbody>
      </table></div>
      {botTroops && <p>{pointsFor(23, result!.ownChoice, result!.botChoice!)[0] > 0 ? 'You won more fronts.' : pointsFor(23, result!.ownChoice, result!.botChoice!)[0] < 0 ? 'The bot won more fronts.' : 'You won the same number of fronts.'}</p>}
    </div>;
  }
  if (gameId === 12) {
    const contribution = contributionAmount(choice) ?? 0;
    return <div data-game-diagram="group" className="space-y-2 border-t border-slate-700 pt-3">
      <h3 className="font-bold text-slate-100">How the group scores</h3>
      <p>Four players each start with 10 points. All contributions go into one pool; every player gets 40% of that pool back.</p>
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-center font-semibold">
        You keep {10 - contribution} + 0.4 × group pool = your score
      </div>
      {result?.groupTotal !== undefined && <p>Your practice pool was {result.groupTotal} points, so your score was {publicGoodsPoints(contribution, result.groupTotal)}.</p>}
    </div>;
  }
  if (gameId === 19) {
    const investment = investAmount(role === 'first' ? choice : botOffer) ?? 0;
    const returned = returnAmount(role === 'second' ? choice : result?.botChoice || 'Return 0') ?? 0;
    return <div data-game-diagram="tree" className="space-y-2 border-t border-slate-700 pt-3 text-center">
      <h3 className="font-bold text-slate-100">Decision tree</h3>
      <p className="rounded-lg border border-blue-700 bg-blue-950/50 p-2">Investor sends {investment} of 10</p>
      <p aria-hidden="true">↓</p>
      <p className="rounded-lg border border-slate-600 bg-slate-800 p-2">Trustee receives {investment * 3} and chooses a return</p>
      <p aria-hidden="true">↓</p>
      <p>At return {returned}: Investor {10 - investment + returned} / Trustee {investment * 3 - returned}</p>
    </div>;
  }
  if (gameId !== 30) {
    const game = gameFor(gameId);
    return <div data-game-diagram="matrix" className="space-y-2 border-t border-slate-700 pt-3">
      <h3 className="font-bold text-slate-100">Payoff matrix</h3>
      <p>Rows are your choices{game.roles ? ` (${game.roles[0]})` : ''}; columns are the bot's choices{game.roles ? ` (${game.roles[1]})` : ''}. Each cell shows your points first.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] border-collapse text-center text-xs sm:text-sm">
          <caption className="sr-only">Possible points for you and the bot in {game.title}</caption>
          <thead><tr>
            <th scope="col" className="border border-slate-700 bg-slate-800 p-2 text-left">You / Bot</th>
            {game.options.map(botChoice => <th scope="col" key={botChoice} className="border border-slate-700 bg-slate-800 p-2">{botChoice}</th>)}
          </tr></thead>
          <tbody>{game.options.map(ownChoice => <tr key={ownChoice}>
            <th scope="row" className="border border-slate-700 bg-slate-800 p-2 text-left">{ownChoice}</th>
            {game.options.map(botChoice => {
              const [yourPoints, botPoints] = pointsFor(gameId, ownChoice, botChoice);
              const played = result?.ownChoice === ownChoice && result.botChoice === botChoice;
              return <td key={botChoice} className={`border border-slate-700 p-2 ${played ? 'bg-emerald-950 text-emerald-200 font-bold' : 'bg-slate-900 text-slate-200'}`}>
                {yourPoints} / {botPoints}{played && <span className="block text-xs">Played</span>}
              </td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>
    </div>;
  }

  const offer = role === 'first' ? choice : botOffer;
  const amount = offerAmount(offer) ?? 0;
  const actualResponse = role === 'first' ? result?.botChoice : result?.ownChoice;
  return <div data-game-diagram="tree" className="space-y-2 border-t border-slate-700 pt-3">
    <h3 className="font-bold text-slate-100">Decision tree</h3>
    <p>Possible results for the current offer. Points are shown as you / bot.</p>
    <div className="mx-auto max-w-md text-center">
      <div className="rounded-lg border border-blue-700 bg-blue-950/50 p-2 font-semibold">
        {role === 'first' ? 'You' : 'Bot'} offer{role === 'first' ? '' : 's'} {amount} of 10 points
      </div>
      <div aria-hidden="true" className="text-slate-400">↓</div>
      <div className="rounded-lg border border-slate-600 bg-slate-800 p-2 font-semibold">
        {role === 'first' ? 'Bot' : 'You'} decide{role === 'first' ? 's' : ''}
      </div>
      <div aria-hidden="true" className="text-slate-400">↙ &nbsp;&nbsp; ↘</div>
      <div className="grid grid-cols-2 gap-2">
        {(['Accept', 'Reject'] as const).map(response => {
          const [yourPoints, botPoints] = role === 'first'
            ? pointsFor(30, offer, response, role)
            : pointsFor(30, response, offer, role);
          const played = actualResponse === response;
          return <div key={response} className={`rounded-lg border p-2 ${played ? 'border-emerald-500 bg-emerald-950 text-emerald-200' : 'border-slate-600 bg-slate-800'}`}>
            <p className="font-semibold">{response}</p>
            <p>You {yourPoints} / Bot {botPoints}</p>
            {played && <p className="text-xs font-bold">Played</p>}
          </div>;
        })}
      </div>
    </div>
  </div>;
}

