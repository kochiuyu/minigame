import { useState } from 'react';
import { LIVE_GAMES } from '../liveMatch';
import type { GameId } from '../liveMatch';

type LiveGamePickerProps = {
  id: string;
  label: string;
  value: GameId;
  onChange: (id: GameId) => void;
  disabled?: boolean;
  showFormat?: boolean;
  searchable?: boolean;
};

const sections: ReadonlyArray<{ label: string; ids: readonly GameId[] }> = [
  { label: 'Cooperation & resources', ids: [1, 6, 12, 13, 15, 27] },
  { label: 'Bargaining & trust', ids: [9, 16, 19, 26, 30] },
  { label: 'Markets & auctions', ids: [3, 7, 8, 14, 21, 22, 24, 25, 28] },
  { label: 'Coordination & conflict', ids: [4, 17, 18, 23, 29] },
  { label: 'Sequential & information games', ids: [2, 5, 10, 11, 20] },
];
const groupedIds = new Set(sections.flatMap(section => section.ids));
const otherGames = LIVE_GAMES.filter(game => !groupedIds.has(game.id));

function formatFor(id: GameId): string {
  if (id === 11) return 'Whole class · one private guess each';
  if (id === 12) return 'Groups of four · bots fill empty seats';
  if (id === 6) return 'Pairs · five turns with the same partner';
  if (id === 20) return 'Pairs · alternating turns on a game tree';
  if ([2, 5, 10, 16, 19, 28, 30].includes(id)) return 'Pairs · one player moves, then the other responds';
  return 'Pairs · both players choose privately';
}

export function LiveGamePicker({ id, label, value, onChange, disabled = false, showFormat = false, searchable = false }: LiveGamePickerProps) {
  const [query, setQuery] = useState('');
  const matches = query.trim() ? LIVE_GAMES.filter(game => game.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title)).slice(0, 8) : [];
  return <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-bold">{label}</label>
    {searchable && <div className="space-y-2">
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} disabled={disabled}
        aria-label="Find a practice game" placeholder="Find a game by name"
        className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white placeholder:text-slate-400 disabled:opacity-50" />
      {query.trim() && <div className="rounded-lg border border-slate-700 bg-slate-950 p-2">
        {matches.length ? <div className="grid gap-1 sm:grid-cols-2">{matches.map(game =>
          <button key={game.id} type="button" onClick={() => { onChange(game.id); setQuery(''); }}
            className="rounded-md px-3 py-2 text-left text-sm hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
            {game.title}
          </button>)}</div> : <p className="px-2 py-1 text-sm text-slate-300">No matching games.</p>}
      </div>}
    </div>}
    <select id={id} value={value} onChange={event => { onChange(Number(event.target.value) as GameId); setQuery(''); }} disabled={disabled}
      className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white disabled:opacity-50">
      {sections.map(section => <optgroup key={section.label} label={section.label}>
        {section.ids.map(gameId => LIVE_GAMES.find(game => game.id === gameId)).filter((game): game is (typeof LIVE_GAMES)[number] => Boolean(game))
          .sort((a, b) => a.title.localeCompare(b.title))
          .map(game => <option key={game.id} value={game.id}>{game.title}</option>)}
      </optgroup>)}
      {otherGames.length > 0 && <optgroup label="More games">
        {otherGames.sort((a, b) => a.title.localeCompare(b.title)).map(game => <option key={game.id} value={game.id}>{game.title}</option>)}
      </optgroup>}
    </select>
    {showFormat && <p className="text-sm text-slate-300">{formatFor(value)}</p>}
  </div>;
}
