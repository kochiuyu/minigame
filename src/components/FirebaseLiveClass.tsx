import { useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { onValue, ref, remove, runTransaction, set, update } from 'firebase/database';
import { auth, db } from '../firebase';
import {
  BOT_ALIAS, LIVE_GAMES, finishRound, gameFor, pairParticipants, pointsFor, prepareUltimatumResponses, randomChoice, randomStudentAlias, resolveResults, shuffleAliasIcon, submissionProgress, summarizeRound,
} from '../liveMatch';
import type { Assignment, Choice, GameId, LiveRoom, MatchResult, Participant, RoomConfig, RoundArchive, Submission, VisibleOffer } from '../liveMatch';
import { FinalAnalysis, RoundAnalysis } from './RoundAnalysis';

const ROOM = 'DOTE-3090';
const ROOT = `rooms/${ROOM}-pairs`;
const INSTRUCTOR_EMAIL = 'kochiuyu@gmail.com';
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
  const [visibleOffer, setVisibleOffer] = useState<VisibleOffer | null>(null);
  const [result, setResult] = useState<MatchResult | Record<string, MatchResult> | null>(null);
  const [results, setResults] = useState<Record<string, MatchResult | Record<string, MatchResult>>>({});
  const [archive, setArchive] = useState<Record<string, RoundArchive>>({});
  const [selectedGameId, setSelectedGameId] = useState<GameId>(1);
  const [selectedTotalRounds, setSelectedTotalRounds] = useState(5);
  const [practiceGameId, setPracticeGameId] = useState<GameId>(1);
  const [choice, setChoice] = useState<Choice>('Cooperate');
  const [practiceChoice, setPracticeChoice] = useState<Choice>('Cooperate');
  const [practiceRole, setPracticeRole] = useState<'first' | 'second'>('first');
  const [practiceBotOffer, setPracticeBotOffer] = useState<Choice>(() => randomChoice(30));
  const [practiceResult, setPracticeResult] = useState<{ ownChoice: Choice; botChoice: Choice; points: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const instructor = Boolean(user?.email === INSTRUCTOR_EMAIL && user.emailVerified);
  const game = gameFor(config?.gameId);
  const practiceGame = gameFor(practiceGameId);

  useEffect(() => setChoice(game.options[0]), [game.id]);
  useEffect(() => {
    if (game.id === 30 && assignment?.role) setChoice(assignment.role === 'second' ? 'Accept' : 'Offer 5');
  }, [game.id, assignment?.role]);
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
    setVisibleOffer(null);
    setResult(null);
    setResults({});
    setArchive({});
    if (!user) return;

    const fail = (err: Error) => setError(errorText(err));
    const unsubs: Array<() => void> = [];
    if (instructor) {
      unsubs.push(onValue(ref(db, ROOT), snapshot => {
        const room = snapshot.val() as LiveRoom | null;
        setConfig(room?.config || null);
        setParticipants(room?.participants || {});
        setAssignments(room?.assignments || {});
        setSubmissions(room?.choices || {});
        setResults(room?.results || {});
        setArchive(room?.archive || {});
      }, fail));
    } else {
      unsubs.push(onValue(ref(db, `${ROOT}/config`), snapshot => setConfig(snapshot.val()), fail));
    }
    if (user.isAnonymous) {
      unsubs.push(onValue(ref(db, `${ROOT}/participants/${user.uid}`), snapshot => setParticipant(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/assignments/${user.uid}`), snapshot => setAssignment(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/choices/${user.uid}`), snapshot => setSubmission(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/offers/${user.uid}`), snapshot => setVisibleOffer(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/results/${user.uid}`), snapshot => setResult(snapshot.val()), fail));
    }
    return () => unsubs.forEach(unsub => unsub());
  }, [user, instructor]);

  useEffect(() => {
    if (leavingRef.current || !user?.isAnonymous || !config || config.phase === 'finished' || participant !== null || !alias.trim()) return;
    set(ref(db, `${ROOT}/participants/${user.uid}`), { alias: alias.trim() })
      .catch(err => setError(errorText(err)));
  }, [user, config, participant, alias]);

  useEffect(() => {
    if (!user?.isAnonymous || config?.phase !== 'playing' || !participant || assignment !== null || (config.gameId === 30 && config.step === 'respond')) return;
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
      offers: null,
      ...(!config.totalRounds ? { results: null } : {}),
      'config/phase': 'playing',
      'config/step': config.gameId === 30 ? 'offer' : null,
    }));
  }

  async function startResponses() {
    await run(async () => {
      await runTransaction(ref(db, ROOT), current => {
        const room = current as LiveRoom | null;
        if (!room?.config || room.config.phase !== 'playing' || room.config.gameId !== 30 || room.config.step !== 'offer') return;
        return { ...room, offers: prepareUltimatumResponses(room.assignments || {}, room.choices || {}, room.config.round),
          config: { ...room.config, step: 'respond' } };
      }, { applyLocally: false });
    });
  }

  async function revealLegacy() {
    await run(async () => {
      const roomRef = ref(db, ROOT);
      await runTransaction(roomRef, current => {
        const room = current as LiveRoom | null;
        if (!room?.config || room.config.phase !== 'playing') return;
        return {
          ...room,
          config: { ...room.config, phase: 'revealed' },
          results: resolveResults(room.assignments || {}, room.choices || {}, room.config.round, room.config.gameId || 1),
        };
      }, { applyLocally: false });
    });
  }

  async function endRound(revealNow: boolean) {
    await run(async () => {
      await runTransaction(ref(db, ROOT), current => {
        if (!current) return;
        return finishRound(current as LiveRoom, revealNow) || undefined;
      }, { applyLocally: false });
    });
  }

  async function startNextRound() {
    if (!config || config.phase !== 'revealed') return;
    await run(() => update(ref(db, ROOT), {
      assignments: null,
      choices: null,
      offers: null,
      ...(!config.totalRounds ? { results: null } : {}),
      'config/round': config.round + 1,
      'config/phase': 'lobby',
    }));
  }

  function playBot() {
    const actualBotChoice = practiceGameId === 30
      ? practiceRole === 'first' ? Math.random() < 0.5 ? 'Accept' : 'Reject' : practiceBotOffer
      : randomChoice(practiceGameId);
    const [points] = pointsFor(practiceGameId, practiceChoice, actualBotChoice, practiceRole);
    setPracticeResult({ ownChoice: practiceChoice, botChoice: actualBotChoice, points });
  }

  function saveAlias(next: string) {
    setAlias(next);
    sessionStorage.setItem('liveAlias', next);
  }

  const round = config?.round || 0;
  const legacyClass = Boolean(config && !config.totalRounds);
  const currentAssignment = assignment?.round === round ? assignment : null;
  const currentSubmission = submission?.round === round ? submission : null;
  const personalResults = result && !('round' in result) ? result as Record<string, MatchResult> : {};
  const legacyResult = result && 'round' in result ? result as MatchResult : null;
  const currentResult = legacyClass ? legacyResult?.round === round ? legacyResult : null : personalResults[round] || null;
  const roundAssignments = Object.values(assignments).filter(item => item.round === round);
  const joinedStudents = Object.entries(participants).sort((a, b) => a[1].alias.localeCompare(b[1].alias));
  const progress = submissionProgress(participants, assignments, submissions, round);
  const legacyResults = Object.fromEntries(Object.entries(results).filter(([, value]) => value && 'round' in value)) as Record<string, MatchResult>;
  const legacySummary = summarizeRound(assignments, submissions, legacyResults, round, game.id);
  const currentSummary = legacyClass ? config?.phase === 'revealed' ? legacySummary : null : config?.summaries?.[round] || null;
  const publishedSummaries = Object.values(config?.summaries || {}).sort((a, b) => a.round - b.round);
  const lastRound = Boolean(config?.totalRounds && round >= config.totalRounds);
  const roleLabel = currentAssignment && game.roles ? game.roles[currentAssignment.role === 'second' ? 1 : 0] : null;
  const ultimatum = game.id === 30;
  const isResponder = currentAssignment?.role === 'second';
  const isMyStep = !ultimatum || (config?.step === 'offer' ? !isResponder : isResponder);
  const stepStudents = Object.keys(participants).filter(uid => assignments[uid]?.round === round && (config?.step === 'offer' ? assignments[uid].role !== 'second' : assignments[uid].role === 'second'));
  const stepSubmitted = stepStudents.filter(uid => submissions[uid]?.round === round).length;

  return (
    <section className="max-w-3xl mx-auto mt-6 space-y-5 text-slate-100">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
        <p className="text-sm font-bold text-blue-300">Live Class · Room {ROOM}</p>
        <h1 className="text-2xl font-black mt-1">{config?.phase === 'finished' ? 'Class complete' : config ? game.title : 'Live Class Games'}</h1>
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
          setPracticeRole('first');
          setPracticeBotOffer(randomChoice(30));
          setPracticeResult(null);
        }} className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
          {LIVE_GAMES.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <p className="text-sm text-slate-300">{practiceGame.payoffs}</p>
        {practiceGameId === 30 ? <label className="block text-sm font-bold">Practice role
          <select value={practiceRole} onChange={event => { const role = event.target.value as 'first' | 'second'; setPracticeRole(role); setPracticeChoice(role === 'first' ? 'Offer 5' : 'Accept'); setPracticeBotOffer(randomChoice(30)); setPracticeResult(null); }} className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
            <option value="first">Proposer</option><option value="second">Responder</option>
          </select>
        </label> : practiceGame.roles && <p className="text-sm text-slate-300">Your role: {practiceGame.roles[0]}</p>}
        {practiceGameId === 30 && practiceRole === 'second' && <p className="rounded-lg bg-blue-950 p-3">The random bot offered you {practiceBotOffer.slice(6)} of 10 points. <button type="button" onClick={() => { setPracticeBotOffer(randomChoice(30)); setPracticeResult(null); }} className="ml-2 underline">New offer</button></p>}
        <fieldset className="flex flex-wrap gap-5">
          <legend className="sr-only">Practice choice</legend>
          {(practiceGameId === 30 ? practiceRole === 'first' ? practiceGame.options.slice(0, 11) : practiceGame.options.slice(11) : practiceGame.options).map(option => (
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
          <input id="live-alias" value={alias} maxLength={30} onChange={event => saveAlias(event.target.value)} aria-describedby="alias-help" placeholder="Choose an alias (no student ID)" className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => saveAlias(randomStudentAlias())} className="rounded-lg bg-slate-700 px-4 py-2 font-semibold">🎲 Random alias</button>
            <button type="button" disabled={!alias.trim()} onClick={() => saveAlias(shuffleAliasIcon(alias))} className="rounded-lg bg-slate-700 px-4 py-2 font-semibold disabled:opacity-50">✨ New icon</button>
          </div>
          <p id="alias-help" className="text-sm text-slate-300">Try a fun name and icon, shuffle again, or type your own before joining.</p>
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
              <p className="font-semibold">{config ? config.phase === 'finished' ? `All ${config.totalRounds} rounds complete` : `Round ${round}${config.totalRounds ? ` of ${config.totalRounds}` : ''} · ${config.phase === 'lobby' ? 'Waiting for students' : config.phase === 'playing' ? 'Collecting choices' : 'Results revealed'}` : 'No active class'}</p>
              {legacyClass && <p className="text-sm text-amber-200">This class began before round limits were added. It can continue as before; start a new class to set a round limit and save a final report.</p>}
              {!config && <>
                <label htmlFor="new-class-game" className="block text-sm font-bold">Class game</label>
                <select id="new-class-game" value={selectedGameId} onChange={event => setSelectedGameId(Number(event.target.value) as GameId)} className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
                  {LIVE_GAMES.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                <label htmlFor="total-rounds" className="block text-sm font-bold">Total rounds (1–20)</label>
                <input id="total-rounds" type="number" min="1" max="20" step="1" value={selectedTotalRounds} onChange={event => setSelectedTotalRounds(Number(event.target.value))} className="w-32 rounded-lg bg-slate-950 border border-slate-600 p-3 text-white" />
                <button disabled={busy || !Number.isInteger(selectedTotalRounds) || selectedTotalRounds < 1 || selectedTotalRounds > 20} onClick={() => run(() => set(ref(db, ROOT), { config: { round: 1, totalRounds: selectedTotalRounds, phase: 'lobby', gameId: selectedGameId } }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Start class</button>
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
              <p role="status" className="font-semibold">{ultimatum ? `${stepSubmitted} of ${stepStudents.length} ${config.step === 'offer' ? 'proposers offered' : 'responders decided'}` : `${progress.submitted} of ${progress.joined} joined students submitted`}</p>
                {(ultimatum ? stepStudents.length > 0 && stepSubmitted === stepStudents.length : progress.allSubmitted) ? <p className="rounded-lg border border-emerald-600 bg-emerald-950/50 p-3 text-emerald-200">Everyone in this step has submitted. {ultimatum && config.step === 'offer' ? 'Let responders see their offers.' : lastRound ? 'Finish the class to show the full report.' : 'Choose whether to reveal this round before continuing.'}</p>
                  : <p className="text-sm text-slate-300">Choices stay hidden until you reveal them. You can end the round early; a bot will replace a missing partner in the results.</p>}
                {ultimatum && config.step === 'offer' ? <button disabled={busy} onClick={startResponses} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Show offers to responders</button>
                : legacyClass ? <button disabled={busy || legacySummary.submitted === 0} onClick={revealLegacy} className="rounded-lg bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50">Reveal results</button>
                  : lastRound ? <button disabled={busy} onClick={() => endRound(true)} className="rounded-lg bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50">Finish class and show all results</button>
                  : <div className="flex flex-wrap gap-3">
                    <button disabled={busy || !Object.values(submissions).some(item => item.round === round)} onClick={() => endRound(true)} className="rounded-lg bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50">Reveal this round</button>
                    <button disabled={busy} onClick={() => endRound(false)} className="rounded-lg bg-slate-700 px-4 py-3 font-bold disabled:opacity-50">Continue without revealing</button>
                  </div>}
              </>}
              {config?.phase === 'revealed' && <>
                {currentSummary && <RoundAnalysis summary={currentSummary} archive={archive[round]} />}
                <p className="font-semibold">Results are revealed. Start the next round when students have read them.</p>
                <button disabled={busy} onClick={startNextRound} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Start next round</button>
              </>}
              {config?.phase === 'finished' && <>
                <FinalAnalysis summaries={publishedSummaries} archives={archive} />
                <p className="text-sm text-slate-300">Students can view this report until you end the class and clear the room.</p>
              </>}
              {config && config.phase !== 'finished' && <div className="border-t border-slate-700 pt-4 space-y-2">
                <h3 className="font-bold">Joined students ({joinedStudents.length})</h3>
                {joinedStudents.length === 0 ? <p className="text-sm text-slate-300">No students have joined yet.</p> :
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {joinedStudents.map(([uid, student]) => {
                      const status = config.phase === 'lobby' ? 'Waiting for round'
                        : submissions[uid]?.round === round ? 'Submitted'
                        : config.phase === 'revealed' ? 'No choice'
                        : assignments[uid]?.round === round ? ultimatum && config.step === 'offer' && assignments[uid].role === 'second' ? 'Waiting for offer'
                          : ultimatum && config.step === 'respond' && assignments[uid].role !== 'second' ? 'Waiting for response' : 'Waiting for choice' : 'Joining round';
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
          ) : config.phase === 'finished' ? (
            <FinalAnalysis summaries={publishedSummaries} personalResults={personalResults} studentView />
          ) : !participant ? (
            <p>{alias.trim() ? 'Joining classroom…' : 'Your alias is missing. Leave and rejoin with an alias.'}</p>
          ) : config.phase === 'lobby' ? (
            <div className="space-y-2">
              <p>Waiting for the instructor to pair students in round {round}{config.totalRounds ? ` of ${config.totalRounds}` : ''} ({game.title}). You can practice with the bot above.</p>
              {config.totalRounds && round > 1 && !config.summaries?.[round - 1] && <p className="text-sm text-blue-200">The previous round's results will appear when the class ends.</p>}
            </div>
          ) : config.phase === 'revealed' ? (
            !legacyClass ? currentSummary ? currentSubmission && !currentResult ? <p>Loading your result…</p>
              : <RoundAnalysis summary={currentSummary} personal={currentResult || undefined} studentView /> : <p>Loading round results…</p>
            : currentResult ? <div className="space-y-2" role="status">
              <p className="font-bold">Round {round} result</p>
              <p>You chose {currentResult.ownChoice}; {currentResult.opponentAlias} chose {currentResult.opponentChoice}.</p>
              <p>You earned {currentResult.ownPoints} points; your opponent earned {currentResult.opponentPoints}.</p>
              {currentResult.fallback && <p className="text-amber-300">Your partner did not submit, so a random bot took their place.</p>}
            </div> : <p>{currentSubmission ? 'Calculating your result…' : 'No choice submitted this round.'}</p>
          ) : !currentAssignment ? (
            <div className="space-y-2">
              <p>{ultimatum && config.step === 'respond' ? 'Offers are already with responders. You can join the next round.' : 'Finding your match. If you joined after pairing, a bot will take the other seat.'}</p>
              {!(ultimatum && config.step === 'respond') && <button disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/assignments/${user.uid}`), { round, kind: 'bot', opponentAlias: BOT_ALIAS, role: 'first' }))} className="text-sm underline">Try bot fallback</button>}
            </div>
          ) : ultimatum && !isMyStep ? (
            <p>{currentSubmission ? `Your ${currentSubmission.choice} is locked. Waiting for the response step to finish.` : isResponder ? 'Waiting for the proposer to make an offer.' : 'Your turn has passed. Waiting for the responder.'}</p>
          ) : ultimatum && isResponder && (!visibleOffer || visibleOffer.round !== round) ? (
            <p>Loading your offer…</p>
          ) : currentSubmission ? (
            <p>Your {currentSubmission.choice} choice is locked for round {round} against {currentAssignment.opponentAlias}. Waiting for the instructor to reveal results.</p>
          ) : (
            <div className="space-y-3">
              <p className="font-bold">Round {round}{config.totalRounds ? ` of ${config.totalRounds}` : ''}: you play {currentAssignment.opponentAlias}</p>
              {roleLabel && <p className="text-sm text-blue-200">Your role: {roleLabel}</p>}
              {ultimatum && isResponder && visibleOffer && <p className="rounded-lg bg-blue-950 p-3">{visibleOffer.fromBot ? 'Random bot' : currentAssignment.opponentAlias} offered you {visibleOffer.choice.slice(6)} of 10 points. Accept to take those points, or reject so both get 0.</p>}
              <p className="text-sm text-slate-300">{game.payoffs}</p>
              <fieldset className="flex flex-wrap gap-5">
                <legend className="sr-only">Your class choice</legend>
                {(ultimatum ? isResponder ? game.options.slice(11) : game.options.slice(0, 11) : game.options).map(option => <label key={option} className="flex gap-2 items-center"><input type="radio" name="live-choice" checked={choice === option} onChange={() => setChoice(option)} />{option}</label>)}
              </fieldset>
              <button disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/choices/${user.uid}`), { choice: ultimatum ? isResponder ? choice === 'Reject' ? 'Reject' : 'Accept' : choice.startsWith('Offer ') ? choice : 'Offer 5' : choice, round }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Lock {ultimatum ? isResponder ? 'response' : 'offer' : 'choice'}</button>
            </div>
          )}
        </div>
      )}
      {user && config?.totalRounds && config.phase !== 'finished' && publishedSummaries.some(item => item.round < round) &&
        <details className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <summary className="cursor-pointer font-bold">Earlier revealed rounds</summary>
          <div className="mt-4 space-y-3">{publishedSummaries.filter(item => item.round < round).map(item =>
            <RoundAnalysis key={item.round} summary={item} personal={personalResults[item.round]} archive={instructor ? archive[item.round] : undefined} studentView={!instructor} />
          )}</div>
        </details>}
      {error && <p role="alert" className="rounded-lg border border-red-600 bg-red-950 p-3 text-red-200">{error}</p>}
    </section>
  );
}
