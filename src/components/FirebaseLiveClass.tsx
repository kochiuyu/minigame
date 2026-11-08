import { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut, User } from 'firebase/auth';
import { onValue, ref, remove, set, update } from 'firebase/database';
import { auth, db } from '../firebase';

const ROOM = 'DOTE-3090';
const ROOT = `rooms/${ROOM}`;
const INSTRUCTOR_EMAIL = 'kochiuyu@gmail.com';
type Choice = 'Cooperate' | 'Defect';
type RoomConfig = { round: number; open: boolean; revealed: boolean };
type Submission = { alias: string; choice: Choice; round: number };
type Results = { cooperate: number; defect: number };

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not connect. Please try again.';
}

export function FirebaseLiveClass() {
  const [user, setUser] = useState<User | null>(null);
  const [alias, setAlias] = useState(() => sessionStorage.getItem('liveAlias') || '');
  const [config, setConfig] = useState<RoomConfig | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [results, setResults] = useState<Results | null>(null);
  const [choice, setChoice] = useState<Choice>('Cooperate');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const instructor = user?.email === INSTRUCTOR_EMAIL && user.emailVerified;

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) {
      setConfig(null);
      setSubmission(null);
      setSubmissions({});
      setResults(null);
      return;
    }
    const fail = (err: Error) => setError(err.message);
    const unsubConfig = onValue(ref(db, `${ROOT}/config`), snapshot => setConfig(snapshot.val()), fail);
    const unsubResults = onValue(ref(db, `${ROOT}/results`), snapshot => setResults(snapshot.val()), fail);
    const unsubOwn = onValue(ref(db, `${ROOT}/choices/${user.uid}`), snapshot => setSubmission(snapshot.val()), fail);
    const unsubAll = instructor
      ? onValue(ref(db, `${ROOT}/choices`), snapshot => setSubmissions(snapshot.val() || {}), fail)
      : () => {};
    return () => { unsubConfig(); unsubResults(); unsubOwn(); unsubAll(); };
  }, [user, instructor]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try { await action(); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  }

  const currentSubmissions = Object.values(submissions).filter(item => item.round === config?.round);
  const counts = {
    cooperate: currentSubmissions.filter(item => item.choice === 'Cooperate').length,
    defect: currentSubmissions.filter(item => item.choice === 'Defect').length,
  };
  const ownChoice = submission?.round === config?.round ? submission : null;

  return (
    <section className="max-w-3xl mx-auto mt-6 space-y-5 text-slate-100">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
        <p className="text-sm font-bold text-blue-300">Live Class · Room {ROOM}</p>
        <h1 className="text-2xl font-black mt-1">Prisoner's Dilemma</h1>
        <p className="text-sm text-slate-300 mt-2">One shared round at a time. Choose Cooperate or Defect; your choice stays private until the instructor reveals the class totals.</p>
      </div>

      {!user && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
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
          <button onClick={() => run(() => signOut(auth))} className="rounded-lg bg-slate-700 px-4 py-2">Sign out</button>
        </div>
      )}

      {user && (user.isAnonymous || instructor) && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-3 items-center">
            <p className="text-sm text-slate-300">{instructor ? 'Instructor' : `Student: ${alias.trim() || ownChoice?.alias || 'Guest'}`}</p>
            <button onClick={() => run(() => signOut(auth))} className="text-sm underline text-slate-300">Leave</button>
          </div>
          {instructor ? (
            <>
              <p className="font-semibold">{config ? `Round ${config.round} · ${config.revealed ? 'Results revealed' : config.open ? 'Collecting choices' : 'Closed'}` : 'No active round'}</p>
              {!config && <button disabled={busy} onClick={() => run(() => set(ref(db, ROOT), { config: { round: 1, open: true, revealed: false } }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Start class</button>}
              {config && <>
                <p>{currentSubmissions.length} choices received</p>
                <p className="text-lg font-bold">Cooperate: {counts.cooperate} · Defect: {counts.defect}</p>
                {config.open && <button disabled={busy} onClick={() => run(() => update(ref(db, ROOT), { results: counts, 'config/open': false, 'config/revealed': true }))} className="rounded-lg bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50">Reveal class totals</button>}
                {config.revealed && <button disabled={busy} onClick={() => run(() => update(ref(db, ROOT), { choices: null, results: null, 'config/round': config.round + 1, 'config/open': true, 'config/revealed': false }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Start next round</button>}
                <button disabled={busy} onClick={() => run(() => remove(ref(db, ROOT)))} className="block text-sm text-red-300 underline disabled:opacity-50">End class and clear room</button>
              </>}
            </>
          ) : !config ? (
            <p>Waiting for the instructor to start the class.</p>
          ) : config.revealed ? (
            <div className="space-y-2">
              <p className="font-bold">Round {config.round} results</p>
              <p>Your choice: {ownChoice?.choice || 'No choice submitted'}</p>
              <p>Cooperate: {results?.cooperate ?? 0} · Defect: {results?.defect ?? 0}</p>
            </div>
          ) : ownChoice ? (
            <p>Your {ownChoice.choice} choice is locked for round {config.round}. Waiting for the instructor to reveal the totals.</p>
          ) : config.open ? (
            <div className="space-y-3">
              <p className="font-bold">Round {config.round}: make your choice</p>
              <fieldset className="flex gap-5">
                <legend className="sr-only">Your choice</legend>
                {(['Cooperate', 'Defect'] as Choice[]).map(option => <label key={option} className="flex gap-2 items-center"><input type="radio" name="live-choice" checked={choice === option} onChange={() => setChoice(option)} />{option}</label>)}
              </fieldset>
              <button disabled={busy || !alias.trim()} onClick={() => run(() => set(ref(db, `${ROOT}/choices/${user.uid}`), { alias: alias.trim(), choice, round: config.round }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Lock choice</button>
              {!alias.trim() && <p className="text-sm text-amber-300">If you reloaded the page, leave and rejoin with your alias.</p>}
            </div>
          ) : <p>Waiting for the next round.</p>}
        </div>
      )}
      {error && <p role="alert" className="rounded-lg border border-red-600 bg-red-950 p-3 text-red-200">{error}</p>}
    </section>
  );
}

