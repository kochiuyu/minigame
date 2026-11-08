import { useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { onValue, ref, remove, runTransaction, set, update } from 'firebase/database';
import { auth, db } from '../firebase';
import {
  BOT_ALIAS, LIVE_GAMES, gameFor, pairParticipants, pointsFor, randomChoice, resolveResults, submissionProgress, summarizeRound,
} from '../liveMatch';
import type { Assignment, Choice, GameId, MatchResult, Participant, RoomConfig, Submission } from '../liveMatch';

const ROOM = 'DOTE-3090';
const ROOT = `rooms/${ROOM}-pairs`;
const INSTRUCTOR_EMAIL = 'kochiuyu@gmail.com';
type RoomData = {
  config?: RoomConfig;
  participants?: Record<string, Participant>;
  assignments?: Record<string, Assignment>;
  choices?: Record<string, Submission>;
  results?: Record<string, MatchResult>;
};

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not connect. Please try again.';
}

export function FirebaseLiveClass() {
  const leavingRef = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [alias, setAlias] = useState(() => sessionStorage.getItem('liveAlias') || '');
  const [config, setConfig] = useState<RoomConfig | null>(null);
  const [participant, setParticipant] = useState<Participant | null | undefined>(undefined);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [assignment, setAssignment] = useState<Assignment | null | undefined>(undefined);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [result, setResult] = useState<MatchResult | null>(null);
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [selectedGameId, setSelectedGameId] = useState<GameId>(1);
  const [practiceGameId, setPracticeGameId] = useState<GameId>(1);
  const [choice, setChoice] = useState<Choice>('Cooperate');
  const [practiceChoice, setPracticeChoice] = useState<Choice>('Cooperate');
  const [practiceResult, setPracticeResult] = useState<{ ownChoice: Choice; botChoice: Choice; points: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const instructor = Boolean(user?.email === INSTRUCTOR_EMAIL && user.emailVerified);
  const game = gameFor(config?.gameId);
  const practiceGame = gameFor(practiceGameId);

  useEffect(() => setChoice(game.options[0]), [game.id]);
  useEffect(() => {
    if (!config?.gameId) return;
    setPracticeGameId(config.gameId);
    setPracticeChoice(gameFor(config.gameId).options[0]);
    setPracticeResult(null);
  }, [config?.gameId]);

  useEffect(() => onAuthStateChanged(auth, next => {
    if (!next) leavingRef.current = false;
    setUser(next);
  }), []);

  useEffect(() => {
    setConfig(null);
    setParticipant(undefined);
    setParticipants({});
    setAssignment(undefined);
    setAssignments({});
    setSubmission(null);
    setSubmissions({});
    setResult(null);
    setResults({});
    if (!user) return;

    const fail = (err: Error) => setError(errorText(err));
    const unsubs: Array<() => void> = [];
    if (instructor) {
      unsubs.push(onValue(ref(db, ROOT), snapshot => {
        const room = snapshot.val() as RoomData | null;
        setConfig(room?.config || null);
        setParticipants(room?.participants || {});
        setAssignments(room?.assignments || {});
        setSubmissions(room?.choices || {});
        setResults(room?.results || {});
      }, fail));
    } else {
      unsubs.push(onValue(ref(db, `${ROOT}/config`), snapshot => setConfig(snapshot.val()), fail));
    }
    if (user.isAnonymous) {
      unsubs.push(onValue(ref(db, `${ROOT}/participants/${user.uid}`), snapshot => setParticipant(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/assignments/${user.uid}`), snapshot => setAssignment(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/choices/${user.uid}`), snapshot => setSubmission(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/results/${user.uid}`), snapshot => setResult(snapshot.val()), fail));
    }
    return () => unsubs.forEach(unsub => unsub());
  }, [user, instructor]);

  useEffect(() => {
    if (leavingRef.current || !user?.isAnonymous || !config || participant !== null || !alias.trim()) return;
    set(ref(db, `${ROOT}/participants/${user.uid}`), { alias: alias.trim() })
      .catch(err => setError(errorText(err)));
  }, [user, config, participant, alias]);

  useEffect(() => {
    if (!user?.isAnonymous || config?.phase !== 'playing' || !participant || assignment !== null) return;
    const botAssignment: Assignment = { round: config.round, kind: 'bot', opponentAlias: BOT_ALIAS, role: 'first' };
    set(ref(db, `${ROOT}/assignments/${user.uid}`), botAssignment).catch(() => {
      // A human assignment may have reached the server before this listener updated.
    });
  }, [user, config, participant, assignment]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try { await action(); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  }

  async function leave() {
    leavingRef.current = true;
    await run(async () => {
      try {
        if (user?.isAnonymous && participant) await remove(ref(db, `${ROOT}/participants/${user.uid}`));
      } finally {
        await signOut(auth);
      }
    });
  }

  async function startPairing() {
    if (!config || config.phase !== 'lobby') return;
    const pairs = pairParticipants(participants, config.round);
    await run(() => update(ref(db, ROOT), {
      assignments: pairs,
      choices: null,
      results: null,
      'config/phase': 'playing',
    }));
  }

  async function reveal() {
    await run(async () => {
      const roomRef = ref(db, ROOT);
      await runTransaction(roomRef, current => {
        const room = current as RoomData | null;
        if (!room?.config || room.config.phase !== 'playing') return;
        return {
          ...room,
          config: { ...room.config, phase: 'revealed' },
          results: resolveResults(room.assignments || {}, room.choices || {}, room.config.round, room.config.gameId || 1),
        };
      }, { applyLocally: false });
    });
  }

  function playBot() {
    const botChoice = randomChoice(practiceGameId);
    const [points] = pointsFor(practiceGameId, practiceChoice, botChoice);
    setPracticeResult({ ownChoice: practiceChoice, botChoice, points });
  }

  const round = config?.round || 0;
  const currentAssignment = assignment?.round === round ? assignment : null;
  const currentSubmission = submission?.round === round ? submission : null;
  const currentResult = result?.round === round ? result : null;
  const roundAssignments = Object.values(assignments).filter(item => item.round === round);
  const joinedStudents = Object.entries(participants).sort((a, b) => a[1].alias.localeCompare(b[1].alias));
  const progress = submissionProgress(participants, assignments, submissions, round);
  const summary = summarizeRound(assignments, submissions, results, round, game.id);
  const roleLabel = currentAssignment && game.roles ? game.roles[currentAssignment.role === 'second' ? 1 : 0] : null;

  return (
    <section className="max-w-3xl mx-auto mt-6 space-y-5 text-slate-100">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
        <p className="text-sm font-bold text-blue-300">Live Class · Room {ROOM}</p>
        <h1 className="text-2xl font-black mt-1">{config ? game.title : 'Live Class Games'}</h1>
        <p className="text-sm text-slate-300 mt-2">Practice against a random bot, then join a class round. The instructor randomly pairs students; an odd or late student gets a bot. If a partner does not choose, a bot takes their place when results are revealed.</p>
        {config && <p className="text-sm text-blue-200 mt-2">{game.payoffs}</p>}
      </div>

      {!instructor && <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h2 className="text-lg font-bold">Bot practice</h2>
        <p className="text-sm text-slate-300">Private practice. It does not count toward the class round.</p>
        <label htmlFor="practice-game" className="block text-sm font-bold">Practice game</label>
        <select id="practice-game" value={practiceGameId} onChange={event => {
          const id = Number(event.target.value) as GameId;
          setPracticeGameId(id);
          setPracticeChoice(gameFor(id).options[0]);
          setPracticeResult(null);
        }} className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
          {LIVE_GAMES.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <p className="text-sm text-slate-300">{practiceGame.payoffs}</p>
        {practiceGame.roles && <p className="text-sm text-slate-300">Your role: {practiceGame.roles[0]}</p>}
        <fieldset className="flex gap-5">
          <legend className="sr-only">Practice choice</legend>
          {practiceGame.options.map(option => (
            <label key={option} className="flex gap-2 items-center">
              <input type="radio" name="practice-choice" checked={practiceChoice === option} onChange={() => setPracticeChoice(option)} />{option}
            </label>
          ))}
        </fieldset>
        <button onClick={playBot} className="rounded-lg bg-slate-700 px-4 py-2 font-bold">Play random bot</button>
        {practiceResult && <p role="status">You chose {practiceResult.ownChoice}; the bot chose {practiceResult.botChoice}. You earned {practiceResult.points} points.</p>}
      </div>}

      {!user && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
          <h2 className="text-lg font-bold">Join a class round</h2>
          <label htmlFor="live-alias" className="block text-sm font-bold">Classroom alias</label>
          <input id="live-alias" value={alias} maxLength={30} onChange={event => { setAlias(event.target.value); sessionStorage.setItem('liveAlias', event.target.value); }} placeholder="Choose an alias (no student ID)" className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white" />
          <button disabled={busy || !alias.trim()} onClick={() => run(() => signInAnonymously(auth))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Join as student</button>
          <div className="border-t border-slate-700 pt-3">
            <button disabled={busy} onClick={() => run(() => signInWithPopup(auth, new GoogleAuthProvider()))} className="rounded-lg bg-purple-600 px-4 py-3 font-bold disabled:opacity-50">Instructor: sign in with Google</button>
          </div>
        </div>
      )}

      {user && !instructor && !user.isAnonymous && (
        <div className="rounded-2xl border border-amber-700 bg-amber-950/30 p-5 space-y-3">
          <p>This Google account is not the instructor account.</p>
          <button onClick={leave} className="rounded-lg bg-slate-700 px-4 py-2">Sign out</button>
        </div>
      )}

      {user && (user.isAnonymous || instructor) && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-3 items-center">
            <p className="text-sm text-slate-300">{instructor ? 'Instructor' : `Student: ${participant?.alias || alias.trim() || 'Guest'}`}</p>
            <button onClick={leave} disabled={busy} className="text-sm underline text-slate-300 disabled:opacity-50">Leave</button>
          </div>

          {instructor ? (
            <>
              <p className="font-semibold">{config ? `Round ${round} · ${config.phase === 'lobby' ? 'Waiting for students' : config.phase === 'playing' ? 'Collecting choices' : 'Results revealed'}` : 'No active class'}</p>
              {!config && <>
                <label htmlFor="new-class-game" className="block text-sm font-bold">Class game</label>
                <select id="new-class-game" value={selectedGameId} onChange={event => setSelectedGameId(Number(event.target.value) as GameId)} className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
                  {LIVE_GAMES.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                <button disabled={busy} onClick={() => run(() => set(ref(db, ROOT), { config: { round: 1, phase: 'lobby', gameId: selectedGameId } }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Start class</button>
              </>}
              {config?.phase === 'lobby' && <>
                <label htmlFor="class-game" className="block text-sm font-bold">Class game</label>
                <select id="class-game" value={game.id} onChange={event => run(() => update(ref(db, `${ROOT}/config`), { gameId: Number(event.target.value) as GameId }))} disabled={busy} className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
                  {LIVE_GAMES.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                <p>{joinedStudents.length} students joined</p>
                <p className="text-sm text-slate-300">Pairing is random each round. An odd student gets a bot; students who join later get a bot too.</p>
                <button disabled={busy || joinedStudents.length === 0} onClick={startPairing} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Pair students and start round</button>
              </>}
              {config?.phase === 'playing' && <>
                <p>{roundAssignments.filter(item => item.kind === 'student').length / 2} student pairs · {roundAssignments.filter(item => item.kind === 'bot').length} bot matches</p>
                <p role="status" className="font-semibold">{progress.submitted} of {progress.joined} joined students submitted</p>
                {progress.allSubmitted ? <p className="rounded-lg border border-emerald-600 bg-emerald-950/50 p-3 text-emerald-200">Everyone has submitted. Reveal results, then start the next round.</p>
                  : <p className="text-sm text-slate-300">Choices stay hidden until reveal. You can reveal early if someone cannot submit; a bot will replace a missing partner.</p>}
                <button disabled={busy || summary.submitted === 0} onClick={reveal} className="rounded-lg bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50">Reveal results</button>
              </>}
              {config?.phase === 'revealed' && <>
                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 space-y-2">
                  <h3 className="font-bold">Round {round} summary</h3>
                  <p>{summary.submitted} students submitted · {summary.studentPairs} completed student pairs · {summary.botMatches} bot matches{summary.fallbacks > 0 ? ` (${summary.fallbacks} missing-partner fallbacks)` : ''}</p>
                  <p>Choices: {summary.choiceCounts.map(item => `${item.label} ${item.count}`).join(' · ')}</p>
                  <p>Student pair outcomes: {summary.outcomes.map(item => `${item.label} ${item.count}`).join(' · ')}</p>
                  {summary.averagePoints !== null && <p>Average student score: {summary.averagePoints.toFixed(1)} points</p>}
                  <p className="text-sm text-blue-200">{game.id === 1 ? 'Discuss how often pairs reached mutual cooperation.'
                    : game.id === 13 ? 'Discuss whether pairs coordinated on Stag or chose the safer Hare.'
                    : game.id === 15 ? 'Discuss how often two Hawks met and what that cost them.'
                    : game.id === 17 ? 'Matching choices favor the Matcher; different choices favor the Mismatcher.'
                    : 'Discuss how often pairs coordinated on Opera or Football.'}</p>
                </div>
                <p className="font-semibold">Results are revealed. Start the next round when students have read them.</p>
                <button disabled={busy} onClick={() => run(() => update(ref(db, ROOT), { assignments: null, choices: null, results: null, 'config/round': round + 1, 'config/phase': 'lobby' }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Start next round</button>
              </>}
              {config && <div className="border-t border-slate-700 pt-4 space-y-2">
                <h3 className="font-bold">Joined students ({joinedStudents.length})</h3>
                {joinedStudents.length === 0 ? <p className="text-sm text-slate-300">No students have joined yet.</p> :
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {joinedStudents.map(([uid, student]) => {
                      const status = config.phase === 'lobby' ? 'Waiting for round'
                        : submissions[uid]?.round === round ? 'Submitted'
                        : config.phase === 'revealed' ? 'No choice'
                        : assignments[uid]?.round === round ? 'Waiting for choice' : 'Joining round';
                      return <li key={uid} className="flex justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm">
                        <span className="truncate" title={student.alias}>{student.alias}</span>
                        <span className={status === 'Submitted' ? 'shrink-0 text-emerald-300' : 'shrink-0 text-amber-200'}>{status}</span>
                      </li>;
                    })}
                  </ul>}
              </div>}
              {config && <button disabled={busy} onClick={() => run(() => remove(ref(db, ROOT)))} className="block text-sm text-red-300 underline disabled:opacity-50">End class and clear room</button>}
            </>
          ) : !config ? (
            <p>Waiting for the instructor to start the class. You can practice with the bot above.</p>
          ) : !participant ? (
            <p>{alias.trim() ? 'Joining classroom…' : 'Your alias is missing. Leave and rejoin with an alias.'}</p>
          ) : config.phase === 'lobby' ? (
            <p>Waiting for the instructor to pair students in {game.title}. You can practice with the bot above.</p>
          ) : config.phase === 'revealed' ? (
            currentResult ? <div className="space-y-2" role="status">
              <p className="font-bold">Round {round} result</p>
              <p>You chose {currentResult.ownChoice}; {currentResult.opponentAlias} chose {currentResult.opponentChoice}.</p>
              <p>You earned {currentResult.ownPoints} points; your opponent earned {currentResult.opponentPoints}.</p>
              {currentResult.fallback && <p className="text-amber-300">Your partner did not submit, so a random bot took their place.</p>}
            </div> : <p>{currentSubmission ? 'Calculating your result…' : 'No choice submitted this round.'}</p>
          ) : !currentAssignment ? (
            <div className="space-y-2">
              <p>Finding your match. If you joined after pairing, a bot will take the other seat.</p>
              <button disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/assignments/${user.uid}`), { round, kind: 'bot', opponentAlias: BOT_ALIAS, role: 'first' }))} className="text-sm underline">Try bot fallback</button>
            </div>
          ) : currentSubmission ? (
            <p>Your {currentSubmission.choice} choice is locked for round {round} against {currentAssignment.opponentAlias}. Waiting for the instructor to reveal results.</p>
          ) : (
            <div className="space-y-3">
              <p className="font-bold">Round {round}: you play {currentAssignment.opponentAlias}</p>
              {roleLabel && <p className="text-sm text-blue-200">Your role: {roleLabel}</p>}
              <p className="text-sm text-slate-300">{game.payoffs}</p>
              <fieldset className="flex gap-5">
                <legend className="sr-only">Your class choice</legend>
                {game.options.map(option => <label key={option} className="flex gap-2 items-center"><input type="radio" name="live-choice" checked={choice === option} onChange={() => setChoice(option)} />{option}</label>)}
              </fieldset>
              <button disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/choices/${user.uid}`), { choice, round }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Lock choice</button>
            </div>
          )}
        </div>
      )}
      {error && <p role="alert" className="rounded-lg border border-red-600 bg-red-950 p-3 text-red-200">{error}</p>}
    </section>
  );
}
