import { contributionAmount, gameFor, investAmount, offerAmount, pointsFor, publicGoodsPoints, returnAmount } from '../liveMatch';
import type { Choice, GameId, Role } from '../liveMatch';

type PracticeResult = { ownChoice: Choice; botChoice: Choice | null; groupTotal?: number } | null;

type Props = {
  gameId: GameId;
  choice: Choice;
  role: Role;
  botOffer: Choice;
  result: PracticeResult;
};

export function PracticeGameDiagram({ gameId, choice, role, botOffer, result }: Props) {
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
