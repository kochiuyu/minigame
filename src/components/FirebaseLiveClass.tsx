import { useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { onValue, ref, remove, runTransaction, serverTimestamp, set, update } from 'firebase/database';
import { auth, db } from '../firebase';
import {
  BOT_ALIAS, CENTIPEDE_FIRST, CENTIPEDE_SECOND, PUBLIC_GOODS_GROUP_SIZE, advanceCentipede, advancePracticeCentipede, advanceRepeated, auctionBid, auctionPayoff, firstPriceAuctionPayoff, beautyContest, bertrandPrice, commonValueBid, commonValueOutcome, dollarAuctionBid, cournotQuantity, hotellingLocation, centipedeTurnResults, classParticipants, contributionAmount, demandAmount, finishRound, gameFor, groupParticipants, guessAmount, investAmount, lemonsOffer, lemonsPayoff, offerAmount, pairParticipants, pointsFor, practiceCentipedePoints, prepareEntryResponses, prepareLemonsResponses, prepareSignalingResponses, prepareTrustResponses, prepareUltimatumResponses, publicGoodsPoints, randomAuctionValue, randomLemonsQuality, randomSurveySignal, randomBeautyGuess, randomChoice, randomReturn, returnAmount, randomStudentAlias, rankClassScores, repeatedTurnResults, resolveResults, signalingPoints, shuffleAliasIcon, submissionProgress, summarizeRound, travelerClaim, trawlerAmount,
} from '../liveMatch';
import type { Assignment, CentipedeDecision, CentipedePath, Choice, GameId, LiveRoom, MatchResult, Participant, PracticeCentipedePath, RepeatedPath, RepeatedTurn, RoomConfig, RoundArchive, Submission, VisibleOffer } from '../liveMatch';
import { PracticeGameDiagram } from './PracticeGameDiagram';
import { LiveGamePicker } from './LiveGamePicker';
import { ClassJoinQr } from './ClassJoinQr';
import { CentipedeTree } from './CentipedeTree';
import { FinalAnalysis, RoundAnalysis } from './RoundAnalysis';

const ROOM = 'DOTE-3090';
const ROOT = `rooms/${ROOM}-pairs`;
const INSTRUCTOR_EMAIL = 'kochiuyu@gmail.com';
function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not connect. Please try again.';
}

export function FirebaseLiveClass() {
  const leavingRef = useRef(false);
  const practiceResultRef = useRef<HTMLDivElement>(null);
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
  const [centipedeDecisions, setCentipedeDecisions] = useState<Record<string, Record<string, CentipedeDecision>>>({});
  const [centipedePaths, setCentipedePaths] = useState<Record<string, CentipedePath>>({});
  const [myCentipedeDecisions, setMyCentipedeDecisions] = useState<Record<string, CentipedeDecision>>({});
  const [myCentipedePath, setMyCentipedePath] = useState<CentipedePath | null>(null);
  const [repeatedDecisions, setRepeatedDecisions] = useState<Record<string, Record<string, Submission>>>({});
  const [myRepeatedDecisions, setMyRepeatedDecisions] = useState<Record<string, Submission>>({});
  const [myRepeatedPath, setMyRepeatedPath] = useState<RepeatedPath | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<GameId>(1);
  const [selectedTotalRounds, setSelectedTotalRounds] = useState(5);
  const [selectedTimerMinutes, setSelectedTimerMinutes] = useState(2);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [practiceGameId, setPracticeGameId] = useState<GameId>(1);
  const [choice, setChoice] = useState<Choice>('Cooperate');
  const [practiceChoice, setPracticeChoice] = useState<Choice>('Cooperate');
  const [practiceRole, setPracticeRole] = useState<'first' | 'second'>('first');
  const [practiceBotOffer, setPracticeBotOffer] = useState<Choice>(() => randomChoice(30));
  const [practiceResult, setPracticeResult] = useState<{ ownChoice: Choice; botChoice: Choice | null; points: number; groupTotal?: number; botContributions?: number[]; beauty?: { botGuesses: number[]; average: number; target: number; distance: number; winner: boolean }; signaling?: { quality: 'High' | 'Low'; signal: boolean; trusted: boolean }; lemons?: { quality: 'High' | 'Low'; accepted: boolean; offer: number }; commonValue?: { signal: number; otherSignal: number; trueValue: number; won: boolean } } | null>(null);
  const [practiceRepeatedTurns, setPracticeRepeatedTurns] = useState<RepeatedTurn[]>([]);
  const [practiceCentipede, setPracticeCentipede] = useState<PracticeCentipedePath>({ node: 1, moves: {} });
  const [practiceValuation, setPracticeValuation] = useState(() => randomAuctionValue());
  const [practiceSurvey, setPracticeSurvey] = useState(() => randomSurveySignal());
  const [practiceQuality, setPracticeQuality] = useState<'High' | 'Low'>(() => Math.random() < 0.5 ? 'High' : 'Low');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const instructor = Boolean(user?.email === INSTRUCTOR_EMAIL && user.emailVerified);
  const game = gameFor(config?.gameId);
  const practiceGame = gameFor(practiceGameId);
  const practiceCentipedeScore = practiceCentipede.exitNode ? practiceCentipedePoints(practiceCentipede.exitNode, practiceRole) : null;

  useEffect(() => {
    if (practiceResult) practiceResultRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }, [practiceResult]);

  useEffect(() => setChoice(game.options[0]), [game.id]);
  useEffect(() => {
    if ((game.id === 2 || game.id === 5) && assignment?.role) setChoice(assignment.role === 'second' ? 'Enter' : game.id === 2 ? 'Launch' : 'Commit');
    if (game.id === 10 && assignment?.role) setChoice(assignment.role === 'second' ? 'Trust' : 'Signal');
    if (game.id === 28 && assignment?.role) setChoice(assignment.role === 'second' ? 'Reject' : 'Offer 5000');
    if ((game.id === 16 || game.id === 30) && assignment?.role) setChoice(assignment.role === 'second' ? 'Accept' : 'Offer 5');
    if (game.id === 19 && assignment?.role) setChoice(assignment.role === 'second' ? 'Return 0' : 'Invest 5');
    if (game.id === 20 && assignment?.role) setChoice(assignment.role === 'second' ? CENTIPEDE_SECOND[0] : CENTIPEDE_FIRST[0]);
  }, [game.id, assignment?.role]);
  useEffect(() => {
    if (game.id !== 19 || !assignment || assignment.round !== config?.round) return;
    if (assignment.role === 'first' || (config.step === 'respond' && visibleOffer?.round === config.round))
      setChoice(assignment.role === 'first' ? 'Invest 5' : 'Return 0');
  }, [game.id, config?.round, config?.step, assignment?.round, assignment?.role, visibleOffer?.round, visibleOffer?.choice]);
  useEffect(() => {
    if (!config?.gameId) return;
    setPracticeGameId(config.gameId);
    setPracticeChoice(gameFor(config.gameId).options[0]);
    setPracticeRole('first');
    setPracticeBotOffer(randomChoice(config.gameId === 19 ? 19 : 30));
    setPracticeResult(null);
    setPracticeRepeatedTurns([]);
    setPracticeCentipede({ node: 1, moves: {} });
    setPracticeValuation(randomAuctionValue());
    setPracticeSurvey(randomSurveySignal());
    setPracticeQuality(Math.random() < 0.5 ? 'High' : 'Low');
  }, [config?.gameId]);

  useEffect(() => onAuthStateChanged(auth, next => {
    if (!next) leavingRef.current = false;
    setUser(next);
  }), []);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, '.info/serverTimeOffset'), snapshot => setServerTimeOffset(snapshot.val() || 0));
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => { unsubscribe(); window.clearInterval(interval); };
  }, []);

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
    setCentipedeDecisions({});
    setCentipedePaths({});
    setMyCentipedeDecisions({});
    setMyCentipedePath(null);
    setRepeatedDecisions({});
    setMyRepeatedDecisions({});
    setMyRepeatedPath(null);
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
        setCentipedeDecisions(room?.centipedeDecisions || {});
        setCentipedePaths(room?.centipedePaths || {});
        setRepeatedDecisions(room?.repeatedDecisions || {});
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
      unsubs.push(onValue(ref(db, `${ROOT}/centipedeDecisions/${user.uid}`), snapshot => setMyCentipedeDecisions(snapshot.val() || {}), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/centipedePaths/${user.uid}`), snapshot => setMyCentipedePath(snapshot.val()), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/repeatedDecisions/${user.uid}`), snapshot => setMyRepeatedDecisions(snapshot.val() || {}), fail));
      unsubs.push(onValue(ref(db, `${ROOT}/repeatedPaths/${user.uid}`), snapshot => setMyRepeatedPath(snapshot.val()), fail));
    }
    return () => unsubs.forEach(unsub => unsub());
  }, [user, instructor]);

  useEffect(() => {
    if (leavingRef.current || !user?.isAnonymous || !config || config.phase === 'finished' || participant !== null || !alias.trim()) return;
    set(ref(db, `${ROOT}/participants/${user.uid}`), { alias: alias.trim() })
      .catch(err => setError(errorText(err)));
  }, [user, config, participant, alias]);

  useEffect(() => {
    if (!user?.isAnonymous || config?.phase !== 'playing' || !participant || assignment !== null || ([2, 5, 10, 16, 19, 28, 30].includes(config.gameId) && config.step === 'respond') || (config.gameId === 6 && (config.repeatedTurn || 1) > 1)) return;
    const fallback: Assignment = config.gameId === 11
      ? { round: config.round, kind: 'class', opponentAlias: 'Class', role: 'first' }
      : config.gameId === 12
      ? { round: config.round, kind: 'group', groupId: user.uid, groupSize: 1, opponentAlias: 'Public goods group', role: 'first' }
      : { round: config.round, kind: 'bot', opponentAlias: BOT_ALIAS, role: 'first', ...([7, 8].includes(config.gameId) ? { valuation: randomAuctionValue() } : {}), ...(config.gameId === 24 ? { valuation: randomSurveySignal() } : {}), ...(config.gameId === 10 ? { quality: randomLemonsQuality() } : {}) };
    set(ref(db, `${ROOT}/assignments/${user.uid}`), fallback).catch(() => {
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
    const pairs = config.gameId === 11 ? classParticipants(participants, config.round)
      : config.gameId === 12 ? groupParticipants(participants, config.round) : pairParticipants(participants, config.round, config.gameId);
    await run(() => update(ref(db, ROOT), {
      assignments: pairs,
      choices: null,
      offers: null,
      centipedeDecisions: null,
      centipedePaths: null,
      repeatedDecisions: null,
      repeatedPaths: null,
      ...(!config.totalRounds ? { results: null } : {}),
      'config/phase': 'playing',
      'config/timerStartedAt': serverTimestamp(),
      'config/timerExtraSeconds': 0,
      'config/step': [2, 5, 10, 16, 19, 28, 30].includes(config.gameId) ? 'offer' : null,
      'config/centipedeNode': config.gameId === 20 ? 1 : null,
      'config/repeatedTurn': config.gameId === 6 ? 1 : null,
    }));
  }

  async function startResponses() {
    await run(async () => {
      await runTransaction(ref(db, ROOT), current => {
        const room = current as LiveRoom | null;
        if (!room?.config || room.config.phase !== 'playing' || ![2, 5, 10, 16, 19, 28, 30].includes(room.config.gameId) || room.config.step !== 'offer') return;
        return { ...room, offers: room.config.gameId === 2 || room.config.gameId === 5
          ? prepareEntryResponses(room.assignments || {}, room.choices || {}, room.config.round, room.config.gameId)
          : room.config.gameId === 10
          ? prepareSignalingResponses(room.assignments || {}, room.choices || {}, room.config.round)
          : room.config.gameId === 28
          ? prepareLemonsResponses(room.assignments || {}, room.choices || {}, room.config.round)
          : room.config.gameId === 19
          ? prepareTrustResponses(room.assignments || {}, room.choices || {}, room.config.round)
          : prepareUltimatumResponses(room.assignments || {}, room.choices || {}, room.config.round),
          config: { ...room.config, step: 'respond' } };
      }, { applyLocally: false });
    });
  }

  async function advanceCentipedeNode() {
    await run(() => runTransaction(ref(db, ROOT), current => current ? advanceCentipede(current as LiveRoom) || undefined : undefined,
      { applyLocally: false }));
  }

  async function advanceRepeatedTurn() {
    await run(() => runTransaction(ref(db, ROOT), current => current ? advanceRepeated(current as LiveRoom) || undefined : undefined,
      { applyLocally: false }));
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
          results: room.config.gameId === 6 && room.config.repeatedTurn === 6 ? repeatedTurnResults(room)
            : room.config.gameId === 20 && room.config.centipedeNode === 7
            ? centipedeTurnResults(room).results
            : resolveResults(room.assignments || {}, room.choices || {}, room.config.round, room.config.gameId || 1, room.offers || {}),
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
      centipedeDecisions: null,
      centipedePaths: null,
      repeatedDecisions: null,
      repeatedPaths: null,
      ...(!config.totalRounds ? { results: null } : {}),
      'config/round': config.round + 1,
      'config/phase': 'lobby',
      'config/timerStartedAt': null,
      'config/timerExtraSeconds': null,
      'config/centipedeNode': null,
      'config/repeatedTurn': null,
    }));
  }

  function playBot() {
    if (practiceGameId === 24) {
      const botBid = randomSurveySignal();
      const botSignal = randomSurveySignal();
      const outcome = commonValueOutcome(commonValueBid(practiceChoice) ?? 10, botBid, practiceSurvey, botSignal, true);
      setPracticeResult({ ownChoice: practiceChoice, botChoice: `Bid ${botBid}`, points: outcome.ownPoints,
        commonValue: { signal: practiceSurvey, otherSignal: botSignal, trueValue: outcome.value, won: outcome.won } });
      return;
    }
    if (practiceGameId === 11) {
      const botGuesses = Array.from({ length: 3 }, () => randomBeautyGuess());
      const outcome = beautyContest([guessAmount(practiceChoice) ?? 0, ...botGuesses]);
      setPracticeResult({ ownChoice: practiceChoice, botChoice: null, points: outcome.scores[0],
        beauty: { botGuesses, average: outcome.average, target: outcome.target, distance: outcome.distances[0], winner: outcome.winners[0] } });
      return;
    }
    if (practiceGameId === 7 || practiceGameId === 8) {
      const ownBid = auctionBid(practiceChoice) ?? 0;
      const botBid = Math.floor(Math.random() * 13);
      const result = (practiceGameId === 8 ? firstPriceAuctionPayoff : auctionPayoff)(ownBid, botBid, practiceValuation, true);
      setPracticeResult({ ownChoice: practiceChoice, botChoice: `Bid ${botBid}`, points: result.points });
      return;
    }
    if (practiceGameId === 6) {
      if (practiceRepeatedTurns.length >= 5) return;
      const botChoice = randomChoice(6) as 'Cooperate' | 'Defect';
      const own = practiceChoice as 'Cooperate' | 'Defect';
      const [ownPoints, otherPoints] = pointsFor(6, own, botChoice);
      setPracticeRepeatedTurns([...practiceRepeatedTurns, { own, other: botChoice, ownPoints, otherPoints, bot: true }]);
      setPracticeResult({ ownChoice: own, botChoice, points: ownPoints });
      return;
    }
    if (practiceGameId === 10) {
      const seller = practiceRole === 'first';
      const quality = seller ? practiceQuality : Math.random() < 0.5 ? 'High' : 'Low';
      const signal = seller ? practiceChoice : practiceBotOffer;
      const response = seller ? Math.random() < 0.5 ? 'Trust' : 'Do Not Trust' : practiceChoice;
      const [sellerPoints, buyerPoints] = signalingPoints(quality, signal, response);
      setPracticeResult({ ownChoice: practiceChoice, botChoice: seller ? response : signal, points: seller ? sellerPoints : buyerPoints,
        signaling: { quality, signal: signal === 'Signal', trusted: response === 'Trust' } });
      return;
    }
    if (practiceGameId === 28) {
      const buyer = practiceRole === 'first';
      const quality = buyer ? randomLemonsQuality() : practiceQuality;
      const offered = buyer ? practiceChoice : practiceBotOffer;
      const amount = lemonsOffer(offered) ?? 1000;
      const response: Choice = buyer ? amount >= (quality === 'High' ? 7000 : 3000) ? 'Accept' : 'Reject' : practiceChoice;
      const [buyerPoints, sellerPoints] = lemonsPayoff(amount, quality, response === 'Accept');
      setPracticeResult({ ownChoice: practiceChoice, botChoice: buyer ? response : offered, points: buyer ? buyerPoints : sellerPoints,
        lemons: { quality, accepted: response === 'Accept', offer: amount } });
      return;
    }
    if (practiceGameId === 2 || practiceGameId === 5) {
      const botChoice = practiceRole === 'first' ? Math.random() < 0.5 ? 'Enter' : 'Stay Out' : practiceBotOffer;
      const [points] = pointsFor(practiceGameId, practiceChoice, botChoice, practiceRole);
      setPracticeResult({ ownChoice: practiceChoice, botChoice, points });
      return;
    }
    if (practiceGameId === 12) {
      const botContributions = Array.from({ length: PUBLIC_GOODS_GROUP_SIZE - 1 }, () => contributionAmount(randomChoice(12)) ?? 0);
      const ownContribution = contributionAmount(practiceChoice) ?? 0;
      const groupTotal = ownContribution + botContributions.reduce((sum, amount) => sum + amount, 0);
      setPracticeResult({ ownChoice: practiceChoice, botChoice: null,
        points: publicGoodsPoints(ownContribution, groupTotal), groupTotal, botContributions });
      return;
    }
    if (practiceGameId === 19) {
      const investment = practiceRole === 'first' ? practiceChoice : practiceBotOffer;
      const amount = investAmount(investment) ?? 0;
      const returned = practiceRole === 'first' ? randomReturn(amount) : practiceChoice;
      const [points] = pointsFor(19, practiceRole === 'first' ? investment : returned,
        practiceRole === 'first' ? returned : investment, practiceRole);
      setPracticeResult({ ownChoice: practiceChoice, botChoice: practiceRole === 'first' ? returned : investment, points });
      return;
    }
    const actualBotChoice = (practiceGameId === 16 || practiceGameId === 30)
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
  const finalLeaderboard = config?.leaderboard || (instructor && config?.phase === 'finished' ? rankClassScores(archive, participants) : undefined);
  useEffect(() => {
    if (!instructor || config?.phase !== 'finished' || config.leaderboard !== undefined ||
        !config.totalRounds || Object.keys(archive).length < config.totalRounds) return;
    runTransaction(ref(db, `${ROOT}/config/leaderboard`), current => current || rankClassScores(archive, participants),
      { applyLocally: false }).catch(err => setError(errorText(err)));
  }, [instructor, config?.phase, config?.leaderboard, config?.totalRounds, archive, participants]);
  const lastRound = Boolean(config?.totalRounds && round >= config.totalRounds);
  const roleLabel = currentAssignment && game.roles ? game.roles[currentAssignment.role === 'second' ? 1 : 0] : null;
  const publicGoods = game.id === 12;
  const classwide = game.id === 11;
  const groupSizes = new Map(roundAssignments.filter(item => item.kind === 'group' && item.groupId).map(item => [item.groupId, item.groupSize || 1]));
  const plannedBotSeats = Array.from(groupSizes.values()).reduce((sum, size) => sum + PUBLIC_GOODS_GROUP_SIZE - size, 0);
  const ultimatum = (game.id === 16 || game.id === 30);
  const entry = game.id === 2 || game.id === 5;
  const deterrence = game.id === 5;
  const trust = game.id === 19;
  const centipede = game.id === 20;
  const centipedeNode = config?.centipedeNode || 1;
  const centipedeTurn = centipede && config?.phase === 'playing' && centipedeNode <= 6;
  const centipedeActorRole = centipedeNode % 2 === 1 ? 'first' : 'second';
  const centipedeActors = Object.entries(assignments).filter(([uid, item]) => item.round === round && item.role === centipedeActorRole && centipedePaths[uid]?.exitNode === undefined);
  const centipedeReady = centipedeActors.filter(([uid]) => centipedeDecisions[uid]?.[`n${centipedeNode}`]?.round === round).length;
  const myCentipedeMove = myCentipedeDecisions[`n${centipedeNode}`]?.round === round ? myCentipedeDecisions[`n${centipedeNode}`] : null;
  const myCentipedeFinished = myCentipedePath?.round === round && Boolean(myCentipedePath.exitNode);
  const repeated = game.id === 6;
  const repeatedTurn = config?.repeatedTurn || 1;
  const repeatedActors = Object.entries(assignments).filter(([, item]) => item.round === round);
  const repeatedReady = repeatedActors.filter(([uid]) => repeatedDecisions[uid]?.[`t${repeatedTurn}`]?.round === round).length;
  const myRepeatedMove = myRepeatedDecisions[`t${repeatedTurn}`]?.round === round ? myRepeatedDecisions[`t${repeatedTurn}`] : null;
  const signaling = game.id === 10;
  const lemons = game.id === 28;
  const staged = entry || ultimatum || trust || signaling || lemons;
  const isResponder = currentAssignment?.role === 'second';
  const isMyStep = !staged || (config?.step === 'offer' ? !isResponder : isResponder);
  const stepStudents = Object.keys(participants).filter(uid => assignments[uid]?.round === round && (config?.step === 'offer' ? assignments[uid].role !== 'second' : assignments[uid].role === 'second'));
  const stepSubmitted = stepStudents.filter(uid => submissions[uid]?.round === round).length;
  const progressTotal = repeated ? repeatedActors.length : centipede ? centipedeActors.length : staged ? stepStudents.length : progress.joined;
  const progressDone = repeated ? repeatedReady : centipede ? centipedeReady : staged ? stepSubmitted : progress.submitted;
  const timerSeconds = config?.timerMinutes && config.timerStartedAt
    ? Math.max(0, Math.ceil((config.timerStartedAt + (config.timerMinutes * 60 + (config.timerExtraSeconds || 0)) * 1000 - clockNow - serverTimeOffset) / 1000))
    : null;
  const timerLabel = timerSeconds === null ? '' : `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, '0')}`;
  const timerTotalSeconds = (config?.timerMinutes || 0) * 60 + (config?.timerExtraSeconds || 0);
  const timerPercent = timerSeconds === null || timerTotalSeconds === 0 ? 0 : Math.min(100, timerSeconds / timerTotalSeconds * 100);
  const clearControls = config && <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 space-y-3">
    <h3 className="font-bold">Clear class data</h3>
    <p className="text-sm text-slate-300">This erases the class report, student aliases, choices, and scores from Firebase. Students will lose access to their reports. You can then start a new class.</p>
    {confirmClear ? <div className="space-y-3" role="group" aria-label="Confirm clearing class data">
      <p className="font-semibold text-red-200">Clear this class permanently?</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => run(async () => { await remove(ref(db, ROOT)); setConfirmClear(false); })} className="rounded-lg bg-red-700 px-4 py-2 font-bold disabled:opacity-50">Yes, clear class data</button>
        <button type="button" disabled={busy} onClick={() => setConfirmClear(false)} className="rounded-lg border border-slate-500 px-4 py-2 disabled:opacity-50">Cancel</button>
      </div>
    </div> : <button type="button" disabled={busy} onClick={() => setConfirmClear(true)} className="rounded-lg border border-red-500 px-4 py-2 font-bold text-red-100 disabled:opacity-50">{config.phase === 'finished' ? 'Clear finished class' : 'End class and clear data'}</button>}
  </div>;

  return (
    <section className="mx-auto mt-6 max-w-4xl space-y-5 text-slate-100">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
        <p className="text-sm font-bold text-blue-300">Live Class</p>
        <h1 className="mt-1 text-2xl font-black">{config?.phase === 'finished' ? 'Class complete' : config ? game.title : 'Live Class'}</h1>
        <p className="mt-2 text-sm text-slate-300">{config ? `Round ${round}${config.totalRounds ? ` of ${config.totalRounds}` : ''} · ${config.phase === 'lobby' ? 'Waiting for students' : config.phase === 'playing' ? 'In progress' : config.phase === 'revealed' ? 'Results ready' : 'Final report ready'}` : 'Join a class round or practice privately against a random bot.'}</p>
        {config && <details className="mt-3 rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-semibold text-blue-200">Game rules and scoring</summary>
          <p className="mt-2 text-slate-300">{game.rules}</p>
          {!(game.id === 20 && config.phase === 'playing') && <p className="mt-2 text-slate-300">{game.payoffs}</p>}
        </details>}
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-600 bg-red-950 p-3 text-red-200">{error}</p>}

      {user?.isAnonymous && config?.phase === 'playing' && timerSeconds !== null && <div className={`space-y-2 rounded-xl border p-4 ${timerSeconds === 0 ? 'border-amber-500 bg-amber-950/40 text-amber-100' : 'border-blue-700 bg-blue-950/40 text-blue-100'}`} role="timer">
        <p className="text-sm font-semibold">Time remaining</p>
        <p className="text-3xl font-black tabular-nums">{timerLabel}{timerSeconds === 0 ? ' · Time is up' : ''}</p>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700" aria-hidden="true"><div className="h-full bg-current transition-[width] duration-1000" style={{ width: `${timerPercent}%` }} /></div>
        <p className="text-sm">The instructor decides when to advance or reveal. You can still submit while this round is open.</p>
      </div>}

      {!user && (
        <div className="space-y-3 rounded-2xl border border-blue-700 bg-slate-900 p-5">
          <h2 className="text-lg font-bold">Join a class round</h2>
          <label htmlFor="live-alias" className="block text-sm font-bold">Classroom alias</label>
          <input id="live-alias" value={alias} maxLength={30} onChange={event => saveAlias(event.target.value)} aria-describedby="alias-help" placeholder="Choose an alias (no student ID)" className="w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => saveAlias(randomStudentAlias())} className="rounded-lg bg-slate-700 px-4 py-2 font-semibold">🎲 Random alias</button>
            <button type="button" disabled={!alias.trim()} onClick={() => saveAlias(shuffleAliasIcon(alias))} className="rounded-lg bg-slate-700 px-4 py-2 font-semibold disabled:opacity-50">✨ New icon</button>
          </div>
          <p id="alias-help" className="text-sm text-slate-300">Get an icon and one-word name, shuffle again, or type your own before joining.</p>
          <button disabled={busy || !alias.trim()} onClick={() => run(() => signInAnonymously(auth))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Join as student</button>
          <div className="border-t border-slate-700 pt-3">
            <button disabled={busy} onClick={() => run(() => signInWithPopup(auth, new GoogleAuthProvider()))} className="rounded-lg bg-purple-600 px-4 py-3 font-bold disabled:opacity-50">Instructor: sign in with Google</button>
          </div>
        </div>
      )}

      {user && !instructor && !user.isAnonymous && (
        <div className="space-y-3 rounded-2xl border border-amber-700 bg-amber-950/30 p-5">
          <p>This Google account is not the instructor account.</p>
          <button onClick={leave} className="rounded-lg bg-slate-700 px-4 py-2">Sign out</button>
        </div>
      )}

      {user && (user.isAnonymous || instructor) && (
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <div className="flex flex-wrap justify-between gap-3 items-center">
            <p className="text-sm text-slate-300">{instructor ? 'Instructor' : `Student: ${participant?.alias || alias.trim() || 'Guest'}`}</p>
            <button onClick={leave} disabled={busy} className="text-sm underline text-slate-300 disabled:opacity-50">Leave</button>
          </div>

          {instructor ? (
            <>
              <p className="font-semibold">{config ? config.phase === 'finished' ? `All ${config.totalRounds} rounds complete` : `Round ${round}${config.totalRounds ? ` of ${config.totalRounds}` : ''} · ${config.phase === 'lobby' ? 'Waiting for students' : config.phase === 'playing' ? 'Collecting choices' : 'Results revealed'}` : 'No active class'}</p>
              {config && config.phase !== 'finished' && <ClassJoinQr key={config.phase} defaultOpen={config.phase === 'lobby'} />}
              {legacyClass && <p className="text-sm text-amber-200">This class began before round limits were added. It can continue as before; start a new class to set a round limit and save a final report.</p>}
              {!config && <>
                <LiveGamePicker id="new-class-game" label="First-round game" value={selectedGameId} onChange={setSelectedGameId} showFormat />
                <label htmlFor="total-rounds" className="block text-sm font-bold">Total rounds (1–20)</label>
                <input id="total-rounds" type="number" min="1" max="20" step="1" value={selectedTotalRounds} onChange={event => setSelectedTotalRounds(Number(event.target.value))} className="w-32 rounded-lg bg-slate-950 border border-slate-600 p-3 text-white" />
                <label htmlFor="new-class-timer" className="block text-sm font-bold">Time per round</label>
                <select id="new-class-timer" value={selectedTimerMinutes} onChange={event => setSelectedTimerMinutes(Number(event.target.value))} className="rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
                  {[0, 1, 2, 3, 5, 10].map(minutes => <option key={minutes} value={minutes}>{minutes === 0 ? 'No timer' : `${minutes} minute${minutes === 1 ? '' : 's'}`}</option>)}
                </select>
                <button disabled={busy || !Number.isInteger(selectedTotalRounds) || selectedTotalRounds < 1 || selectedTotalRounds > 20} onClick={() => run(() => set(ref(db, ROOT), { config: { round: 1, totalRounds: selectedTotalRounds, timerMinutes: selectedTimerMinutes, phase: 'lobby', gameId: selectedGameId } }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Start class</button>
              </>}
              {config?.phase === 'lobby' && <>
                <LiveGamePicker id="class-game" label="Game for this round" value={game.id} onChange={id => run(() => update(ref(db, `${ROOT}/config`), { gameId: id }))} disabled={busy} showFormat />
                <label htmlFor="round-timer" className="block text-sm font-bold">Time per round</label>
                <select id="round-timer" value={config.timerMinutes || 0} onChange={event => run(() => update(ref(db, `${ROOT}/config`), { timerMinutes: Number(event.target.value) }))} disabled={busy} className="rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
                  {[0, 1, 2, 3, 5, 10].map(minutes => <option key={minutes} value={minutes}>{minutes === 0 ? 'No timer' : `${minutes} minute${minutes === 1 ? '' : 's'}`}</option>)}
                </select>
                <p>{joinedStudents.length} students joined</p>
                <p className="text-sm text-slate-300">{classwide ? 'All students submit one private guess. Late students can join this round; only submitted guesses count toward the target.' : publicGoods
                  ? 'Students are randomly grouped in fours. Bots fill empty seats, and late students play with three bots.'
                  : 'Pairing is random each round. An odd student gets a bot; students who join later get a bot too.'}</p>
                <button disabled={busy || joinedStudents.length === 0} onClick={startPairing} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">{classwide ? 'Start classwide round' : publicGoods ? 'Make groups and start round' : 'Pair students and start round'}</button>
              </>}
              {config?.phase === 'playing' && <>
                {timerSeconds !== null && <div className={`space-y-2 rounded-xl border p-3 ${timerSeconds === 0 ? 'border-amber-500 bg-amber-950/40 text-amber-100' : 'border-blue-700 bg-blue-950/40 text-blue-100'}`}>
                  <p className="text-sm font-semibold">Time remaining</p>
                  <p className="text-3xl font-black tabular-nums" role="timer">{timerLabel}{timerSeconds === 0 ? ' · Time is up' : ''}</p>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700" aria-hidden="true"><div className="h-full bg-current transition-[width] duration-1000" style={{ width: `${timerPercent}%` }} /></div>
                  <button type="button" disabled={busy} onClick={() => run(() => update(ref(db, `${ROOT}/config`), { timerExtraSeconds: (config.timerExtraSeconds || 0) + 60 }))} className="rounded-lg border border-current px-3 py-2 text-sm font-semibold disabled:opacity-50">Add 1 minute</button>
                </div>}
                <p>{classwide ? `${roundAssignments.length} students in the classwide contest` : publicGoods ? `${groupSizes.size} groups of four · ${plannedBotSeats} planned bot seats`
                  : `${roundAssignments.filter(item => item.kind === 'student').length / 2} student pairs · ${roundAssignments.filter(item => item.kind === 'bot').length} bot matches`}</p>
              <p role="status" className="font-semibold">{repeated ? repeatedTurn <= 5 ? `Turn ${repeatedTurn} of 5 · ${repeatedReady} of ${repeatedActors.length} students decided` : 'All five turns complete' : centipede ? centipedeNode <= 6 ? `Node ${centipedeNode} of 6 · ${centipedeReady} of ${centipedeActors.length} active students decided` : 'All Centipede chains have ended' : staged ? `${stepSubmitted} of ${stepStudents.length} ${config.step === 'offer' ? entry ? 'first movers decided' : trust ? 'investors invested' : signaling ? 'sellers signaled' : lemons ? 'buyers offered' : 'proposers offered' : entry ? 'second movers decided' : trust ? 'trustees returned' : signaling ? 'buyers decided' : lemons ? 'sellers decided' : 'responders decided'}` : `${progress.submitted} of ${progress.joined} joined students submitted`}</p>
              {progressTotal > 0 && <div className="h-2 overflow-hidden rounded-full bg-slate-700" role="progressbar" aria-label="Student decisions submitted" aria-valuenow={progressDone} aria-valuemin={0} aria-valuemax={progressTotal}>
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, progressDone / progressTotal * 100)}%` }} />
              </div>}
                {centipede && <CentipedeTree currentNode={centipedeNode <= 6 ? centipedeNode : undefined} />}
                {repeated ? <p className="text-sm text-slate-300">Advance after students decide. Any missing decision is played by a random bot for that turn. Partners stay the same across all five turns; each pair sees its previous choices after advancement.</p>
                  : centipede ? <p className="text-sm text-slate-300">Advance each node after students decide. Any missing move is played by a random bot. Pairs that have already taken stop moving; scores stay hidden until the round ends.</p>
                  : (staged ? stepStudents.length > 0 && stepSubmitted === stepStudents.length : progress.allSubmitted) ? <p className="rounded-lg border border-emerald-600 bg-emerald-950/50 p-3 text-emerald-200">Everyone in this step has submitted. {staged && config.step === 'offer' ? entry ? 'Let second movers see the first choices.' : trust ? 'Let trustees see the investments.' : lemons ? 'Let sellers see the purchase offers.' : 'Let responders see their offers.' : lastRound ? 'Finish the class to show the full report.' : 'Choose whether to reveal this round before continuing.'}</p>
                  : <p className="text-sm text-slate-300">Choices stay hidden until you reveal them. You can end the round early; {classwide ? 'students without a guess are excluded from the average.' : `a bot will fill ${publicGoods ? 'each missing group seat' : 'a missing partner'} in the results.`}</p>}
                {repeated && repeatedTurn <= 5 ? <button disabled={busy} onClick={advanceRepeatedTurn} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Reveal turn {repeatedTurn} and advance{repeatedReady < repeatedActors.length ? ' (bot fills missing choices)' : ''}</button>
                : centipede && centipedeNode <= 6 ? <button disabled={busy} onClick={advanceCentipedeNode} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Advance from node {centipedeNode}{centipedeReady < centipedeActors.length ? ' (bot fills missing moves)' : ''}</button>
                : staged && config.step === 'offer' ? <button disabled={busy} onClick={startResponses} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">{entry ? 'Show first choices to second movers' : trust ? 'Show investments to trustees' : signaling ? 'Show signals to buyers' : lemons ? 'Show offers to sellers' : 'Show offers to responders'}</button>
                : legacyClass ? <button disabled={busy || (repeated ? repeatedTurn !== 6 : legacySummary.submitted === 0)} onClick={revealLegacy} className="rounded-lg bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50">Reveal results</button>
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
                <FinalAnalysis summaries={publishedSummaries} archives={archive} leaderboard={finalLeaderboard} />
                <p className="text-sm text-slate-300">Students can view this report until you clear the class data.</p>
                {clearControls}
              </>}
              {config && config.phase !== 'finished' && <div className="border-t border-slate-700 pt-4 space-y-2">
                <h3 className="font-bold">Joined students ({joinedStudents.length})</h3>
                {joinedStudents.length === 0 ? <p className="text-sm text-slate-300">No students have joined yet.</p> :
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {joinedStudents.map(([uid, student]) => {
                      const status = config.phase === 'lobby' ? 'Waiting for round'
                        : repeated && config.phase === 'playing' ? repeatedTurn > 5 ? 'Five turns complete' : assignments[uid]?.round !== round ? 'Joining round' : repeatedDecisions[uid]?.[`t${repeatedTurn}`]?.round === round ? 'Decided' : 'Waiting for choice'
                        : centipede && config.phase === 'playing' ? centipedePaths[uid]?.exitNode ? `Ended at node ${centipedePaths[uid].exitNode}` : assignments[uid]?.round !== round ? 'Joining round' : assignments[uid].role === centipedeActorRole && centipedeNode <= 6 ? centipedeDecisions[uid]?.[`n${centipedeNode}`]?.round === round ? 'Decided' : 'Waiting for move' : 'Waiting for partner'
                        : submissions[uid]?.round === round ? 'Submitted'
                        : config.phase === 'revealed' ? 'No choice'
                        : assignments[uid]?.round === round ? staged && config.step === 'offer' && assignments[uid].role === 'second' ? entry ? 'Waiting for first move' : trust ? 'Waiting for investment' : 'Waiting for offer'
                          : staged && config.step === 'respond' && assignments[uid].role !== 'second' ? entry ? 'Waiting for second move' : trust ? 'Waiting for return' : 'Waiting for response' : 'Waiting for choice' : 'Joining round';
                      return <li key={uid} className="flex justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm">
                        <span className="truncate" title={student.alias}>{student.alias}</span>
                        <span className={status === 'Submitted' ? 'shrink-0 text-emerald-300' : 'shrink-0 text-amber-200'}>{status}</span>
                      </li>;
                    })}
                  </ul>}
              </div>}
              {config?.phase !== 'finished' && clearControls}
            </>
          ) : !config ? (
            <p>Waiting for the instructor to start the class. You can open bot practice below.</p>
          ) : config.phase === 'finished' ? (
            <FinalAnalysis summaries={publishedSummaries} personalResults={personalResults} alias={participant?.alias || alias.trim()} leaderboard={finalLeaderboard} viewerUid={user?.uid} studentView />
          ) : !participant ? (
            <p>{alias.trim() ? 'Joining classroom…' : 'Your alias is missing. Leave and rejoin with an alias.'}</p>
          ) : config.phase === 'lobby' ? (
            <div className="space-y-2">
              <p>Waiting for the instructor to pair students in round {round}{config.totalRounds ? ` of ${config.totalRounds}` : ''} ({game.title}). You can open bot practice below.</p>
              {config.totalRounds && round > 1 && !config.summaries?.[round - 1] && <p className="text-sm text-blue-200">The previous round's results will appear when the class ends.</p>}
            </div>
          ) : config.phase === 'revealed' ? (
            !legacyClass ? currentSummary ? currentSubmission && !currentResult ? <p>Loading your result…</p>
              : <RoundAnalysis summary={currentSummary} personal={currentResult || undefined} studentView /> : <p>Loading round results…</p>
            : currentResult ? <div className="space-y-2" role="status">
              <p className="font-bold">Round {round} result</p>
              {currentResult.group ? <p>You contributed {contributionAmount(currentResult.ownChoice)} points. Your group pool was {currentResult.group.totalContribution}, including {currentResult.group.bots} bot contributions. You earned {currentResult.ownPoints} points.</p> : <>
                <p>{currentResult.beauty ? `You chose ${currentResult.ownChoice}.` : `You chose ${currentResult.ownChoice}; ${currentResult.opponentAlias} chose ${currentResult.opponentChoice}.`}</p>
                {currentResult.auction && <p>Your value was {currentResult.auction.valuation}. {currentResult.auction.won ? `You won and paid ${currentResult.auction.price}.` : `${currentResult.opponentAlias} won and paid ${currentResult.auction.price}.`}</p>}
                {currentResult.commonValue && <p>Your survey signal was ${currentResult.commonValue.signal}; the rival signal was ${currentResult.commonValue.otherSignal}. True lease value was ${currentResult.commonValue.trueValue}. {currentResult.commonValue.won ? 'You won the lease.' : `${currentResult.opponentAlias} won the lease.`}</p>}
                {currentResult.beauty && <p>Average {currentResult.beauty.average.toFixed(2)}; target {currentResult.beauty.target.toFixed(2)}; your distance {currentResult.beauty.distance.toFixed(2)}.</p>}
                <p>You earned {currentResult.ownPoints} {currentResult.ownPoints === 1 ? 'point' : 'points'}{currentResult.beauty ? '.' : `; your opponent earned ${currentResult.opponentPoints}.`}</p>
              </>}
              {currentResult.fallback && <p className="text-amber-300">{currentResult.group ? 'A random bot filled each missing group seat.' : 'Your partner did not submit, so a random bot took their place.'}</p>}
            </div> : <p>{currentSubmission ? 'Calculating your result…' : 'No choice submitted this round.'}</p>
          ) : !currentAssignment ? (
            <div className="space-y-2">
              <p>{repeated && repeatedTurn > 1 ? 'This five-turn match has started. You can join the next class round.' : staged && config.step === 'respond' ? entry ? `${deterrence ? 'Incumbents' : 'First movers'} have already chosen. You can join the next round.` : trust ? 'Investments are already with trustees. You can join the next round.' : 'Offers are already with responders. You can join the next round.'
                : classwide ? 'Joining the classwide contest. Late guesses can still count before reveal.'
                  : publicGoods ? 'Finding your group. If you joined late, three random bots will fill the other seats.'
                  : 'Finding your match. If you joined after pairing, a bot will take the other seat.'}</p>
              {!(staged && config.step === 'respond') && !(repeated && repeatedTurn > 1) && <button disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/assignments/${user.uid}`),
                classwide ? { round, kind: 'class', opponentAlias: 'Class', role: 'first' }
                  : publicGoods ? { round, kind: 'group', groupId: user.uid, groupSize: 1, opponentAlias: 'Public goods group', role: 'first' }
                  : { round, kind: 'bot', opponentAlias: BOT_ALIAS, role: 'first', ...([7, 8].includes(game.id) ? { valuation: randomAuctionValue() } : {}), ...(game.id === 24 ? { valuation: randomSurveySignal() } : {}), ...(game.id === 10 ? { quality: randomLemonsQuality() } : {}) }))} className="text-sm underline">{classwide ? 'Try joining contest' : 'Try bot fallback'}</button>}
            </div>
          ) : repeated ? (
            <div className="space-y-3">
              <p className="font-bold">Round {round}: five turns with {currentAssignment.opponentAlias}</p>
              <p>Both choose Cooperate or Defect each turn. Your choices stay hidden until the instructor advances. You keep the same partner for all five turns.</p>
              <p className="text-sm text-slate-300">{game.payoffs}</p>
              {myRepeatedPath?.round === round && <div className="overflow-x-auto"><table className="w-full text-sm text-left"><caption className="text-left font-semibold mb-1">Completed turns</caption><thead><tr><th>Turn</th><th>You</th><th>Opponent</th><th>Points</th></tr></thead><tbody>{Object.entries(myRepeatedPath.turns).map(([turn, item]) => <tr key={turn}><td>{turn}</td><td>{item.own}</td><td>{item.other}{item.bot ? ' (bot filled a choice)' : ''}</td><td>{item.ownPoints} / {item.otherPoints}</td></tr>)}</tbody></table></div>}
              {myRepeatedPath?.round === round && <p>Your total so far: {Object.values(myRepeatedPath.turns).reduce((sum, item) => sum + item.ownPoints, 0)} points</p>}
              {repeatedTurn > 5 ? <p role="status">All five turns are complete. Waiting for the instructor to end the round.</p>
                : myRepeatedMove ? <p role="status">Your {myRepeatedMove.choice} choice is locked for turn {repeatedTurn}. Waiting for the instructor to advance.</p>
                : <div className="space-y-3"><p className="font-semibold">Turn {repeatedTurn} of 5: choose secretly</p><div className="flex gap-3">
                  {(['Cooperate', 'Defect'] as const).map(move => <button key={move} disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/repeatedDecisions/${user.uid}/t${repeatedTurn}`), { round, choice: move }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">{move}</button>)}
                </div></div>}
            </div>
          ) : centipede ? (
            <div className="space-y-3">
              <p className="font-bold">Round {round}: Centipede with {currentAssignment.opponentAlias}</p>
              <p>Your role: {roleLabel}. Players alternate Take or Pass. Taking ends the chain; passing gives the other player the next turn.</p>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px]">
              <CentipedeTree currentNode={centipedeTurn ? centipedeNode : undefined} moves={myCentipedePath?.round === round ? myCentipedePath.moves : {}} exitNode={myCentipedePath?.round === round ? myCentipedePath.exitNode : undefined} />
              <div className="space-y-2">
              {myCentipedeFinished ? <p role="status">The chain ended at node {myCentipedePath?.exitNode}. Scores will appear when the instructor ends the round.</p>
                : !centipedeTurn ? <p role="status">All chains have ended. Waiting for the instructor to end the round.</p>
                : currentAssignment.role !== centipedeActorRole ? <p role="status">Node {centipedeNode}: waiting for {currentAssignment.opponentAlias} to move.</p>
                : myCentipedeMove ? <p role="status">Your {myCentipedeMove.choice} at node {centipedeNode} is locked. Waiting for the instructor to advance.</p>
                : <div className="space-y-3"><p className="font-semibold">Node {centipedeNode}: your turn</p>
                  <div className="flex gap-3">
                    {(['Take', 'Pass'] as const).map(move => <button key={move} disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/centipedeDecisions/${user.uid}/n${centipedeNode}`), { round, choice: move }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">{move}</button>)}
                  </div>
                </div>}
              </div>
              </div>
            </div>
          ) : staged && !isMyStep ? (
            <p>{currentSubmission ? `Your ${currentSubmission.choice} is locked. Waiting for the second step to finish.` : isResponder ? entry ? deterrence ? 'Waiting for the Incumbent to choose Commit or Stay Flexible.' : 'Waiting for the First Mover to choose Launch or Wait.' : trust ? 'Waiting for the investor to choose an amount.' : signaling ? 'Waiting for the seller to choose a signal.' : 'Waiting for the proposer to make an offer.' : 'Your turn has passed. Waiting for the other student.'}</p>
          ) : staged && isResponder && (!visibleOffer || visibleOffer.round !== round) ? (
            <p>Loading {entry ? 'the first move' : trust ? 'your investment' : signaling ? 'the seller signal' : 'your offer'}…</p>
          ) : currentSubmission ? (
            <p>Your {currentSubmission.choice} choice is locked for round {round}{classwide ? ' in the classwide contest' : publicGoods ? ' in your group' : ` against ${currentAssignment.opponentAlias}`}. Waiting for the instructor to reveal results.</p>
          ) : (
            <div className="space-y-3">
              <p className="font-bold">Round {round}{config.totalRounds ? ` of ${config.totalRounds}` : ''}: {classwide ? 'classwide Beauty Contest' : publicGoods ? 'your group of four' : `you play ${currentAssignment.opponentAlias}`}</p>
              {publicGoods && <p className="text-sm text-blue-200">{(currentAssignment.groupSize || 1) - 1} classmates and {PUBLIC_GOODS_GROUP_SIZE - (currentAssignment.groupSize || 1)} random bots share your pool. A bot fills any seat whose student does not contribute.</p>}
              {roleLabel && <p className="text-sm text-blue-200">Your role: {roleLabel}</p>}
              {signaling && !isResponder && <p className="rounded-lg bg-blue-950 p-3">Your private product quality: <strong>{currentAssignment.quality || 'High'}</strong>. The buyer sees only your signal.</p>}
              {lemons && isResponder && <p className="rounded-lg bg-blue-950 p-3">Your private car quality: <strong>{currentAssignment.quality}</strong>. Your value is ${currentAssignment.quality === 'High' ? 7000 : 3000}; the buyer does not know it.</p>}
              {(game.id === 7 || game.id === 8) && <p className="rounded-lg bg-blue-950 p-3">Your private artwork value this round: <strong>{currentAssignment.valuation} points</strong>. Bid any whole amount from 0 to 12.</p>}
              {game.id === 24 && <p className="rounded-lg bg-blue-950 p-3">Your private seismic survey signal: <strong>${currentAssignment.valuation}</strong>. The true lease value is revealed after bidding.</p>}
              {centipede && <p className="rounded-lg bg-blue-950 p-3 text-sm">Choose your complete plan before seeing your partner's plan. You will Pass until the Take node you select; Pass All means you never take. The first Take ends the chain.</p>}
              {ultimatum && isResponder && visibleOffer && <p className="rounded-lg bg-blue-950 p-3">{visibleOffer.fromBot ? 'Random bot' : currentAssignment.opponentAlias} offered you {visibleOffer.choice.slice(6)} of 10 points. Accept to take those points, or reject so both get 0.</p>}
              {entry && isResponder && visibleOffer && <p className="rounded-lg bg-blue-950 p-3">{visibleOffer.fromBot ? 'Random bot' : currentAssignment.opponentAlias} chose {visibleOffer.choice}. Now decide whether to Enter or Stay Out.</p>}
              {signaling && isResponder && visibleOffer && <p className="rounded-lg bg-blue-950 p-3">{visibleOffer.fromBot ? 'Random bot' : currentAssignment.opponentAlias} chose {visibleOffer.choice}. Product quality is hidden. Decide whether to trust.</p>}
              {lemons && isResponder && visibleOffer && <p className="rounded-lg bg-blue-950 p-3">{visibleOffer.fromBot ? 'Random bot' : currentAssignment.opponentAlias} offered ${lemonsOffer(visibleOffer.choice)}. Accept to sell the car at that price, or reject to keep it. Your value is ${currentAssignment.quality === 'High' ? 7000 : 3000}.</p>}
              {trust && isResponder && visibleOffer && <p className="rounded-lg bg-blue-950 p-3">{visibleOffer.fromBot ? 'Random bot' : currentAssignment.opponentAlias} invested {investAmount(visibleOffer.choice)} points. You received {(investAmount(visibleOffer.choice) ?? 0) * 3} points and can return any whole amount from 0 to that total.</p>}
              <p className="text-sm text-slate-300">{game.payoffs}</p>
              {classwide ? <div className="space-y-2">
                <label htmlFor="live-guess" className="block font-semibold">Your private guess: {guessAmount(choice) ?? 0}</label>
                <input id="live-guess" type="range" min="0" max="100" step="0.1" value={guessAmount(choice) ?? 0} onChange={event => setChoice(`Guess ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <input aria-label="Enter a precise class guess" type="number" min="0" max="100" step="0.1" value={guessAmount(choice) ?? 0} onChange={event => { const value = Number(event.target.value); if (event.target.value && value >= 0 && value <= 100) setChoice(`Guess ${Number(value.toFixed(1))}`); }} className="w-32 rounded-lg border border-slate-600 bg-slate-950 p-2 text-white" />
              </div> : lemons && !isResponder ? <div className="space-y-2">
                <label htmlFor="live-lemons-offer" className="block font-semibold">Your private purchase offer: ${lemonsOffer(choice) ?? 1000}</label>
                <input id="live-lemons-offer" type="range" min="1000" max="9000" step="250" value={lemonsOffer(choice) ?? 1000} onChange={event => setChoice(`Offer ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">The seller will see your offer but their car quality stays hidden until results are revealed.</p>
              </div> : game.id === 9 ? <div className="space-y-2">
                <label htmlFor="live-demand" className="block font-semibold">Your demand: {demandAmount(choice) ?? 0} of 10 points</label>
                <input id="live-demand" type="range" min="0" max="10" step="1" value={demandAmount(choice) ?? 0} onChange={event => setChoice(`Demand ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">Negotiate for up to 60 seconds, then lock your demand. Both demands stay hidden until the instructor reveals the result.</p>
              </div> : game.id === 7 || game.id === 8 ? <div className="space-y-2">
                <label htmlFor="live-bid" className="block font-semibold">Your sealed bid: {auctionBid(choice) ?? 0}</label>
                <input id="live-bid" type="range" min="0" max="12" step="1" value={auctionBid(choice) ?? 0} onChange={event => setChoice(`Bid ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
              </div> : game.id === 24 ? <div className="space-y-2">
                <label htmlFor="live-common-bid" className="block font-semibold">Your private bid: ${commonValueBid(choice) ?? 10}</label>
                <input id="live-common-bid" type="range" min="10" max="90" step="1" value={commonValueBid(choice) ?? 10} onChange={event => setChoice(`Bid ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
              </div> : game.id === 25 ? <div className="space-y-2">
                <label htmlFor="live-dollar-bid" className="block font-semibold">Your private bid: ${(dollarAuctionBid(choice) ?? 0.1).toFixed(2)}</label>
                <input id="live-dollar-bid" type="range" min="1" max="25" step="1" value={Math.round((dollarAuctionBid(choice) ?? 0.1) * 10)} onChange={event => setChoice(`Bid ${(Number(event.target.value) / 10).toFixed(1)}` as Choice)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">Your rival's bid stays hidden. Both bidders pay their bids.</p>
              </div> : game.id === 26 ? <div className="space-y-2">
                <label htmlFor="live-traveler-claim" className="block font-semibold">Your private claim: ${travelerClaim(choice) ?? 2}</label>
                <input id="live-traveler-claim" type="range" min="2" max="100" step="1" value={travelerClaim(choice) ?? 2} onChange={event => setChoice(`Claim ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">Your partner's claim stays hidden until results are revealed.</p>
              </div> : game.id === 14 ? <div className="space-y-2">
                <label htmlFor="live-price" className="block font-semibold">Your private price: ${bertrandPrice(choice) ?? 10}</label>
                <input id="live-price" type="range" min="10" max="50" step="1" value={bertrandPrice(choice) ?? 10} onChange={event => setChoice(`Price ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">Your rival's price stays hidden until results are revealed.</p>
              </div> : game.id === 21 ? <div className="space-y-2">
                <label htmlFor="live-quantity" className="block font-semibold">Your private output: {cournotQuantity(choice) ?? 10} units</label>
                <input id="live-quantity" type="range" min="10" max="45" step="1" value={cournotQuantity(choice) ?? 10} onChange={event => setChoice(`Quantity ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">Your rival's output stays hidden until results are revealed.</p>
              </div> : game.id === 22 ? <div className="space-y-2">
                <label htmlFor="live-location" className="block font-semibold">Your private stand: mile {hotellingLocation(choice) ?? 0}</label>
                <input id="live-location" type="range" min="0" max="100" step="1" value={hotellingLocation(choice) ?? 0} onChange={event => setChoice(`Location ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">Your rival's location stays hidden until results are revealed.</p>
              </div> : game.id === 27 ? <div className="space-y-2">
                <label htmlFor="live-trawlers" className="block font-semibold">Deploy {trawlerAmount(choice) ?? 0} trawlers</label>
                <input id="live-trawlers" type="range" min="0" max="10" step="1" value={trawlerAmount(choice) ?? 0} onChange={event => setChoice(`Trawlers ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">The combined fleet determines the health of your shared fishery.</p>
              </div> : publicGoods ? <div className="space-y-2">
                <label htmlFor="live-contribution" className="block font-semibold">Contribute {contributionAmount(choice) ?? 0} of 10 points</label>
                <input id="live-contribution" type="range" min="0" max="10" step="1" value={contributionAmount(choice) ?? 0} onChange={event => setChoice(`Contribute ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">You keep {10 - (contributionAmount(choice) ?? 0)} points before the shared pool pays out.</p>
              </div> : trust ? <div className="space-y-2">
                <label htmlFor="live-trust" className="block font-semibold">{isResponder ? `Return ${returnAmount(choice) ?? 0} of ${(investAmount(visibleOffer?.choice || 'Invest 0') ?? 0) * 3} points` : `Invest ${investAmount(choice) ?? 0} of 10 points`}</label>
                <input id="live-trust" type="range" min="0" max={isResponder ? (investAmount(visibleOffer?.choice || 'Invest 0') ?? 0) * 3 : 10} step="1" value={isResponder ? returnAmount(choice) ?? 0 : investAmount(choice) ?? 0} onChange={event => setChoice(isResponder ? `Return ${Number(event.target.value)}` : `Invest ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
              </div> : ultimatum && !isResponder ? <div className="space-y-2">
                <label htmlFor="live-offer" className="block font-semibold">Offer to responder: {offerAmount(choice) ?? 5} of 10 points</label>
                <input id="live-offer" type="range" min="0" max="10" step="0.5" value={offerAmount(choice) ?? 5} onChange={event => setChoice(`Offer ${Number(event.target.value)}`)} className="w-full accent-blue-500" />
                <p className="text-sm text-slate-300">If accepted, you keep {10 - (offerAmount(choice) ?? 5)} points.</p>
              </div> : <fieldset className="flex flex-wrap gap-5">
                <legend className="sr-only">Your class choice</legend>
                {(entry ? isResponder ? ['Enter', 'Stay Out'] as const : deterrence ? ['Commit', 'Stay Flexible'] as const : ['Launch', 'Wait'] as const : signaling ? isResponder ? ['Trust', 'Do Not Trust'] as const : ['Signal', 'No Signal'] as const : centipede ? isResponder ? CENTIPEDE_SECOND : CENTIPEDE_FIRST : ultimatum || lemons ? ['Accept', 'Reject'] as const : game.options).map(option => <label key={option} className="flex gap-2 items-center"><input type="radio" name="live-choice" checked={choice === option} onChange={() => setChoice(option)} />{option}</label>)}
              </fieldset>}
              <button disabled={busy} onClick={() => run(() => set(ref(db, `${ROOT}/choices/${user.uid}`), { choice: entry ? isResponder ? choice === 'Stay Out' ? 'Stay Out' : 'Enter' : deterrence ? choice === 'Stay Flexible' ? 'Stay Flexible' : 'Commit' : choice === 'Wait' ? 'Wait' : 'Launch' : trust ? isResponder ? choice.startsWith('Return ') ? choice : 'Return 0' : choice.startsWith('Invest ') ? choice : 'Invest 5' : ultimatum ? isResponder ? choice === 'Reject' ? 'Reject' : 'Accept' : choice.startsWith('Offer ') ? choice : 'Offer 5' : choice, round }))} className="rounded-lg bg-blue-600 px-4 py-3 font-bold disabled:opacity-50">Lock {publicGoods ? 'contribution' : entry ? 'decision' : trust ? isResponder ? 'return' : 'investment' : ultimatum ? isResponder ? 'response' : 'offer' : 'choice'}</button>
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
      {!instructor && <details className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <summary className="cursor-pointer text-lg font-bold">Practice with a random bot <span className="ml-2 text-sm font-normal text-slate-300">Private · does not count toward class</span></summary>
        <div className="mt-5 space-y-4">
        <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-blue-300">1 · Choose a game</h3>
        <LiveGamePicker id="practice-game" label="Practice game" value={practiceGameId} searchable onChange={id => {
          setPracticeGameId(id);
          setPracticeChoice(gameFor(id).options[0]);
          setPracticeRole('first');
          setPracticeBotOffer(randomChoice(id === 2 || id === 5 || id === 10 || id === 20 || id === 28 ? id : id === 19 ? 19 : 30));
          setPracticeResult(null);
          setPracticeRepeatedTurns([]);
          setPracticeCentipede({ node: 1, moves: {} });
          setPracticeValuation(randomAuctionValue());
          setPracticeSurvey(randomSurveySignal());
          setPracticeQuality(Math.random() < 0.5 ? 'High' : 'Low');
        }} />
        <details className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-blue-200">How to play {practiceGame.title}</summary>
          <div className="mt-3 space-y-2 text-slate-300">
            <p>{practiceGame.rules}</p>
            {practiceGameId !== 20 && <p><strong className="text-slate-100">Points:</strong> {practiceGame.payoffs}</p>}
            <p><strong className="text-slate-100">Random bot:</strong> {practiceGameId === 11 ? 'Three bots each guess a random number from 0 to 100. Your guess and theirs set the target.' : practiceGameId === 9 ? 'The bot makes a random whole-point demand from 0 to 10.' : practiceGameId === 7 || practiceGameId === 8 ? 'The bot bids a random whole amount from 0 to 12. You win a tied bid.' : practiceGameId === 28 ? 'Bot buyers offer a random price. Bot sellers have randomly drawn private quality and accept offers at or above their own value.' : practiceGameId === 10 ? 'The bot chooses a signal or a trust response at random; seller quality is drawn privately.' : practiceGameId === 2 || practiceGameId === 5
              ? `As ${practiceGameId === 5 ? 'Incumbent' : 'First Mover'}, the bot randomly enters or stays out. As ${practiceGameId === 5 ? 'Rival' : 'Second Mover'}, it randomly chooses its first move before you decide.`
              : practiceGameId === 19
              ? 'When you invest, the bot returns a random whole amount from 0 to three times your investment. When you are the Trustee, the bot invests a random whole amount from 0 to 10.'
              : (practiceGameId === 16 || practiceGameId === 30)
              ? 'As Proposer, the bot accepts or rejects with equal chance. As Responder, it offers a random amount from 0 to 10 in half-point steps.'
              : practiceGameId === 20
              ? 'The bot chooses Take or Pass at each of its turns, with equal chance. You see each move before your next turn.'
              : 'The bot picks each available choice with equal chance.'}</p>
            {practiceGameId !== 20 && <PracticeGameDiagram gameId={practiceGameId} choice={practiceChoice} role={practiceRole} botOffer={practiceBotOffer} result={practiceResult} centipedePath={practiceCentipede} valuation={practiceValuation} />}
          </div>
        </details>
        </div>
        <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-950/50 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-blue-300">2 · Make your move</h3>
        {([2, 5, 10, 16, 19, 20, 28, 30] as number[]).includes(practiceGameId) ? <label className="block text-sm font-bold">Practice role
          <select value={practiceRole} onChange={event => { const role = event.target.value as 'first' | 'second'; setPracticeRole(role); setPracticeChoice(practiceGameId === 2 ? role === 'first' ? 'Launch' : 'Enter' : practiceGameId === 5 ? role === 'first' ? 'Commit' : 'Enter' : practiceGameId === 10 ? role === 'first' ? 'Signal' : 'Trust' : practiceGameId === 28 ? role === 'first' ? 'Offer 5000' : 'Reject' : practiceGameId === 19 ? role === 'first' ? 'Invest 5' : 'Return 0' : practiceGameId === 20 ? role === 'first' ? CENTIPEDE_FIRST[0] : CENTIPEDE_SECOND[0] : role === 'first' ? 'Offer 5' : 'Accept'); setPracticeBotOffer(randomChoice(practiceGameId)); setPracticeResult(null); if (practiceGameId === 20) setPracticeCentipede(advancePracticeCentipede({ node: 1, moves: {} }, role)); }} className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-600 p-3 text-white">
            <option value="first">{practiceGameId === 28 ? 'Buyer' : practiceGameId === 2 ? 'First Mover' : practiceGameId === 5 ? 'Incumbent' : practiceGameId === 10 ? 'Seller' : practiceGameId === 19 ? 'Investor' : practiceGameId === 20 ? 'Player 1' : 'Proposer'}</option><option value="second">{practiceGameId === 28 ? 'Seller' : practiceGameId === 2 ? 'Second Mover' : practiceGameId === 5 ? 'Rival' : practiceGameId === 10 ? 'Buyer' : practiceGameId === 19 ? 'Trustee' : practiceGameId === 20 ? 'Player 2' : 'Responder'}</option>
          </select>
        </label> : practiceGame.roles && <p className="text-sm text-slate-300">Your role: {practiceGame.roles[0]}</p>}
        {(practiceGameId === 16 || practiceGameId === 30) && practiceRole === 'second' && <p className="rounded-lg bg-blue-950 p-3">The random bot offered you {practiceBotOffer.slice(6)} of 10 points. <button type="button" onClick={() => { setPracticeBotOffer(randomChoice(30)); setPracticeResult(null); }} className="ml-2 underline">New offer</button></p>}
        {(practiceGameId === 2 || practiceGameId === 5) && practiceRole === 'second' && <p className="rounded-lg bg-blue-950 p-3">The random bot chose {practiceBotOffer}. <button type="button" onClick={() => { setPracticeBotOffer(randomChoice(practiceGameId)); setPracticeResult(null); }} className="ml-2 underline">New first move</button></p>}
        {practiceGameId === 10 && practiceRole === 'second' && <p className="rounded-lg bg-blue-950 p-3">The bot chose {practiceBotOffer}. Its quality is hidden. <button type="button" onClick={() => { setPracticeBotOffer(randomChoice(10)); setPracticeResult(null); }} className="ml-2 underline">New signal</button></p>}
        {practiceGameId === 10 && practiceRole === 'first' && <p className="rounded-lg bg-blue-950 p-3">Your private product quality: <strong>{practiceQuality}</strong>. <button type="button" onClick={() => { setPracticeQuality(Math.random() < 0.5 ? 'High' : 'Low'); setPracticeResult(null); }} className="ml-2 underline">Draw new quality</button></p>}
        {practiceGameId === 28 && practiceRole === 'second' && <p className="rounded-lg bg-blue-950 p-3">Your private car quality: <strong>{practiceQuality}</strong>. Your value is ${practiceQuality === 'High' ? 7000 : 3000}. The bot offered ${lemonsOffer(practiceBotOffer)}. <button type="button" onClick={() => { setPracticeQuality(randomLemonsQuality()); setPracticeBotOffer(randomChoice(28)); setPracticeResult(null); }} className="ml-2 underline">New car and offer</button></p>}
        {practiceGameId === 19 && practiceRole === 'second' && <p className="rounded-lg bg-blue-950 p-3">The random bot invested {investAmount(practiceBotOffer)} points, tripled to {(investAmount(practiceBotOffer) ?? 0) * 3}. <button type="button" onClick={() => { setPracticeBotOffer(randomChoice(19)); setPracticeChoice('Return 0'); setPracticeResult(null); }} className="ml-2 underline">New investment</button></p>}
        {(practiceGameId === 7 || practiceGameId === 8) && <p className="rounded-lg border border-blue-700 bg-blue-950/50 p-3">Your private artwork value: <strong>{practiceValuation} points</strong>. The bot cannot see it. <button type="button" onClick={() => { setPracticeValuation(randomAuctionValue()); setPracticeResult(null); }} className="ml-2 underline">Draw new value</button></p>}
        {practiceGameId === 24 && <p className="rounded-lg border border-blue-700 bg-blue-950/50 p-3">Your private seismic survey signal: <strong>${practiceSurvey}</strong>. The bot cannot see it. <button type="button" onClick={() => { setPracticeSurvey(randomSurveySignal()); setPracticeResult(null); }} className="ml-2 underline">New survey</button></p>}
        {practiceGameId === 20 ? <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px]">
          <PracticeGameDiagram gameId={practiceGameId} choice={practiceChoice} role={practiceRole} botOffer={practiceBotOffer} result={practiceResult} centipedePath={practiceCentipede} valuation={practiceValuation} />
          <div className="space-y-3" role="status">
          {practiceCentipede.exitNode ? <>
            <p>The chain ended {practiceCentipede.exitNode === 7 ? 'after both players passed all six nodes' : `at Node ${practiceCentipede.exitNode}`}. Your score: {practiceCentipedeScore?.[0]} {practiceCentipedeScore?.[0] === 1 ? 'point' : 'points'}; bot score: {practiceCentipedeScore?.[1]} {practiceCentipedeScore?.[1] === 1 ? 'point' : 'points'}.</p>
            <button type="button" onClick={() => setPracticeCentipede(advancePracticeCentipede({ node: 1, moves: {} }, practiceRole))} className="rounded-lg bg-slate-700 px-4 py-2 font-bold">New Centipede match</button>
          </> : <>
            <p>Node {practiceCentipede.node}: your turn as Player {practiceRole === 'first' ? 1 : 2}.</p>
            <div className="flex gap-3">{(['Take', 'Pass'] as const).map(move => <button key={move} type="button" onClick={() => setPracticeCentipede(advancePracticeCentipede(practiceCentipede, practiceRole, move))} className="rounded-lg bg-blue-600 px-4 py-2 font-bold">{move}</button>)}</div>
          </>}
          </div>
        </div> : practiceGameId === 11 ? <div className="space-y-2">
          <label htmlFor="practice-guess" className="block font-semibold">Your guess: {guessAmount(practiceChoice) ?? 0}</label>
          <input id="practice-guess" type="range" min="0" max="100" step="0.1" value={guessAmount(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(`Guess ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <input aria-label="Enter a precise practice guess" type="number" min="0" max="100" step="0.1" value={guessAmount(practiceChoice) ?? 0} onChange={event => { const value = Number(event.target.value); if (event.target.value && value >= 0 && value <= 100) { setPracticeChoice(`Guess ${Number(value.toFixed(1))}`); setPracticeResult(null); } }} className="w-32 rounded-lg border border-slate-600 bg-slate-950 p-2 text-white" />
        </div> : practiceGameId === 9 ? <div className="space-y-2">
          <label htmlFor="practice-demand" className="block font-semibold">Your demand: {demandAmount(practiceChoice) ?? 0} of 10 points</label>
          <input id="practice-demand" type="range" min="0" max="10" step="1" value={demandAmount(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(`Demand ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
        </div> : practiceGameId === 7 || practiceGameId === 8 ? <div className="space-y-2">
          <label htmlFor="practice-bid" className="block font-semibold">Your sealed bid: {auctionBid(practiceChoice) ?? 0}</label>
          <input id="practice-bid" type="range" min="0" max="12" step="1" value={auctionBid(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(`Bid ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
        </div> : practiceGameId === 24 ? <div className="space-y-2">
          <label htmlFor="practice-common-bid" className="block font-semibold">Your sealed bid: ${commonValueBid(practiceChoice) ?? 10}</label>
          <input id="practice-common-bid" type="range" min="10" max="90" step="1" value={commonValueBid(practiceChoice) ?? 10} onChange={event => { setPracticeChoice(`Bid ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
        </div> : practiceGameId === 25 ? <div className="space-y-2">
          <label htmlFor="practice-dollar-bid" className="block font-semibold">Your sealed bid: ${(dollarAuctionBid(practiceChoice) ?? 0.1).toFixed(2)}</label>
          <input id="practice-dollar-bid" type="range" min="1" max="25" step="1" value={Math.round((dollarAuctionBid(practiceChoice) ?? 0.1) * 10)} onChange={event => { setPracticeChoice(`Bid ${(Number(event.target.value) / 10).toFixed(1)}` as Choice); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">Both bidders pay their bids, including the loser.</p>
        </div> : practiceGameId === 26 ? <div className="space-y-2">
          <label htmlFor="practice-traveler-claim" className="block font-semibold">Your private claim: ${travelerClaim(practiceChoice) ?? 2}</label>
          <input id="practice-traveler-claim" type="range" min="2" max="100" step="1" value={travelerClaim(practiceChoice) ?? 2} onChange={event => { setPracticeChoice(`Claim ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">The bot independently chooses a claim from $2 to $100.</p>
        </div> : practiceGameId === 28 && practiceRole === 'first' ? <div className="space-y-2">
          <label htmlFor="practice-lemons-offer" className="block font-semibold">Your purchase offer: ${lemonsOffer(practiceChoice) ?? 1000}</label>
          <input id="practice-lemons-offer" type="range" min="1000" max="9000" step="250" value={lemonsOffer(practiceChoice) ?? 1000} onChange={event => { setPracticeChoice(`Offer ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">The bot's car quality is hidden until you play.</p>
        </div> : practiceGameId === 14 ? <div className="space-y-2">
          <label htmlFor="practice-price" className="block font-semibold">Your price: ${bertrandPrice(practiceChoice) ?? 10}</label>
          <input id="practice-price" type="range" min="10" max="50" step="1" value={bertrandPrice(practiceChoice) ?? 10} onChange={event => { setPracticeChoice(`Price ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">The random bot also sets a price from $10 to $50.</p>
        </div> : practiceGameId === 21 ? <div className="space-y-2">
          <label htmlFor="practice-quantity" className="block font-semibold">Your output: {cournotQuantity(practiceChoice) ?? 10} units</label>
          <input id="practice-quantity" type="range" min="10" max="45" step="1" value={cournotQuantity(practiceChoice) ?? 10} onChange={event => { setPracticeChoice(`Quantity ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">The bot secretly produces 10–45 units. Combined output sets the market price.</p>
        </div> : practiceGameId === 22 ? <div className="space-y-2">
          <label htmlFor="practice-location" className="block font-semibold">Your stand: mile {hotellingLocation(practiceChoice) ?? 0}</label>
          <input id="practice-location" type="range" min="0" max="100" step="1" value={hotellingLocation(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(`Location ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">The bot secretly chooses a stand from mile 0 to 100.</p>
        </div> : practiceGameId === 27 ? <div className="space-y-2">
          <label htmlFor="practice-trawlers" className="block font-semibold">Deploy {trawlerAmount(practiceChoice) ?? 0} trawlers</label>
          <input id="practice-trawlers" type="range" min="0" max="10" step="1" value={trawlerAmount(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(`Trawlers ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">The bot also deploys 0–10 trawlers. Together, your fleets determine fishery health.</p>
        </div> : practiceGameId === 12 ? <div className="space-y-2">
          <label htmlFor="practice-contribution" className="block font-semibold">Contribute {contributionAmount(practiceChoice) ?? 0} of 10 points</label>
          <input id="practice-contribution" type="range" min="0" max="10" step="1" value={contributionAmount(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(`Contribute ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">You keep {10 - (contributionAmount(practiceChoice) ?? 0)} points before the group pool pays out.</p>
        </div> : practiceGameId === 19 ? <div className="space-y-2">
          <label htmlFor="practice-trust" className="block font-semibold">{practiceRole === 'first' ? `Invest ${investAmount(practiceChoice) ?? 0} of 10 points` : `Return ${returnAmount(practiceChoice) ?? 0} of ${(investAmount(practiceBotOffer) ?? 0) * 3} points`}</label>
          <input id="practice-trust" type="range" min="0" max={practiceRole === 'first' ? 10 : (investAmount(practiceBotOffer) ?? 0) * 3} step="1" value={practiceRole === 'first' ? investAmount(practiceChoice) ?? 0 : returnAmount(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(practiceRole === 'first' ? `Invest ${Number(event.target.value)}` : `Return ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
        </div> : (practiceGameId === 16 || practiceGameId === 30) && practiceRole === 'first' ? <div className="space-y-2">
          <label htmlFor="practice-offer" className="block font-semibold">Offer to bot: {offerAmount(practiceChoice) ?? 0} of 10 points</label>
          <input id="practice-offer" type="range" min="0" max="10" step="0.5" value={offerAmount(practiceChoice) ?? 0} onChange={event => { setPracticeChoice(`Offer ${Number(event.target.value)}`); setPracticeResult(null); }} className="w-full accent-blue-500" />
          <p className="text-sm text-slate-300">If accepted, you keep {10 - (offerAmount(practiceChoice) ?? 0)} points.</p>
        </div> : <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold">Your choice</legend>
          {(practiceGameId === 2 || practiceGameId === 5 ? practiceRole === 'first' ? practiceGameId === 2 ? ['Launch', 'Wait'] as const : ['Commit', 'Stay Flexible'] as const : ['Enter', 'Stay Out'] as const : practiceGameId === 10 ? practiceRole === 'first' ? ['Signal', 'No Signal'] as const : ['Trust', 'Do Not Trust'] as const : (practiceGameId === 16 || practiceGameId === 30 || practiceGameId === 28) ? ['Accept', 'Reject'] as const : practiceGame.options).map(option => (
            <label key={option} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 font-semibold transition-colors ${practiceChoice === option ? 'border-blue-400 bg-blue-950/70 text-white' : 'border-slate-600 bg-slate-900 text-slate-200 hover:border-slate-400'}`}>
              <input type="radio" name="practice-choice" checked={practiceChoice === option} onChange={() => { setPracticeChoice(option); setPracticeResult(null); }} className="accent-blue-500" />{option}
            </label>
          ))}
        </fieldset>}
        {practiceGameId === 6 && practiceRepeatedTurns.length > 0 && <div className="text-sm space-y-1"><p>Turn {practiceRepeatedTurns.length} of 5 · Your total {practiceRepeatedTurns.reduce((sum, item) => sum + item.ownPoints, 0)} · Bot total {practiceRepeatedTurns.reduce((sum, item) => sum + item.otherPoints, 0)}</p>
          <ol>{practiceRepeatedTurns.map((item, index) => <li key={index}>Turn {index + 1}: You {item.own}, bot {item.other} · {item.ownPoints} / {item.otherPoints}</li>)}</ol></div>}
        {practiceGameId === 20 ? null : practiceGameId === 6 && practiceRepeatedTurns.length === 5 ? <button onClick={() => { setPracticeRepeatedTurns([]); setPracticeResult(null); }} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 sm:w-auto">New five-turn match</button>
          : <button onClick={playBot} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 sm:w-auto">{practiceGameId === 6 ? `Play turn ${practiceRepeatedTurns.length + 1} of 5` : practiceResult ? 'Play another bot round' : 'Play bot round'}</button>}
        </div>
        {practiceResult && <div id="practice-result" ref={practiceResultRef} role="status" className="space-y-2 rounded-xl border border-emerald-700 bg-emerald-950/40 p-4">
          <h3 className="font-bold text-emerald-200">3 · {practiceGameId === 6 ? 'Turn result' : 'Practice result'}</h3>
        {practiceResult && (practiceGameId === 7 || practiceGameId === 8) && <p>You bid {auctionBid(practiceResult.ownChoice)}; the bot bid {auctionBid(practiceResult.botChoice || 'Bid 0')}. {((practiceGameId === 8 ? firstPriceAuctionPayoff : auctionPayoff)(auctionBid(practiceResult.ownChoice) ?? 0, auctionBid(practiceResult.botChoice || 'Bid 0') ?? 0, practiceValuation, true)).won ? `You won and paid ${practiceGameId === 8 ? auctionBid(practiceResult.ownChoice) : auctionBid(practiceResult.botChoice || 'Bid 0')}.` : 'The bot won.'} Your score: {practiceResult.points} {practiceResult.points === 1 ? 'point' : 'points'}.</p>}
        {practiceResult?.commonValue && <p>Your signal was {practiceResult.commonValue.signal}; the bot's signal was {practiceResult.commonValue.otherSignal}. You bid {commonValueBid(practiceResult.ownChoice)}; the bot bid {commonValueBid(practiceResult.botChoice || 'Bid 10')}. True value was {practiceResult.commonValue.trueValue}. {practiceResult.commonValue.won ? 'You won.' : 'The bot won.'} Your profit: ${practiceResult.points}.</p>}
        {practiceResult && practiceGameId === 25 && <p>You bid ${(dollarAuctionBid(practiceResult.ownChoice) ?? 0).toFixed(2)}; the bot bid ${(dollarAuctionBid(practiceResult.botChoice || 'Bid 0.1') ?? 0).toFixed(2)}. {dollarAuctionBid(practiceResult.ownChoice)! >= dollarAuctionBid(practiceResult.botChoice || 'Bid 0.1')! ? 'You won the $1 bill.' : 'The bot won the $1 bill.'} Your net score: ${practiceResult.points.toFixed(2)}.</p>}
        {practiceResult && practiceGameId === 26 && <p>You claimed ${travelerClaim(practiceResult.ownChoice)}; the bot claimed ${travelerClaim(practiceResult.botChoice || 'Claim 2')}. {practiceResult.ownChoice === practiceResult.botChoice ? 'Claims matched.' : (travelerClaim(practiceResult.ownChoice) ?? 2) < (travelerClaim(practiceResult.botChoice || 'Claim 2') ?? 2) ? 'Your lower claim earned the $2 bonus.' : 'Your higher claim incurred the $2 penalty.'} You received ${practiceResult.points}.</p>}
        {practiceResult?.lemons && <p>{practiceRole === 'first' ? `You offered $${practiceResult.lemons.offer}; the bot seller's car was ${practiceResult.lemons.quality} quality.` : `The bot offered $${practiceResult.lemons.offer} for your ${practiceResult.lemons.quality}-quality car.`} {practiceResult.lemons.accepted ? 'Sale accepted.' : 'No sale.'} Your profit: ${practiceResult.points}.</p>}
        {practiceResult?.beauty && <p>You guessed {guessAmount(practiceResult.ownChoice)}; bots guessed {practiceResult.beauty.botGuesses.join(', ')}. Class average {practiceResult.beauty.average.toFixed(2)}; target {practiceResult.beauty.target.toFixed(2)}. You were {practiceResult.beauty.winner ? 'closest' : 'not closest'} and earned {practiceResult.points} {practiceResult.points === 1 ? 'point' : 'points'}.</p>}
        {practiceResult && practiceGameId !== 7 && practiceGameId !== 8 && practiceGameId !== 11 && practiceGameId !== 24 && practiceGameId !== 25 && practiceGameId !== 26 && practiceGameId !== 28 && <p>{practiceGameId === 10
          ? `Product quality was ${practiceResult.signaling?.quality}. Seller chose ${practiceResult.signaling?.signal ? 'Signal' : 'No Signal'}; buyer chose ${practiceResult.signaling?.trusted ? 'Trust' : 'Do Not Trust'}. You earned ${practiceResult.points} ${practiceResult.points === 1 ? 'point' : 'points'}.`
          : practiceGameId === 9
          ? `You demanded ${demandAmount(practiceResult.ownChoice)}; the bot demanded ${demandAmount(practiceResult.botChoice || 'Demand 0')}. ${((demandAmount(practiceResult.ownChoice) ?? 0) + (demandAmount(practiceResult.botChoice || 'Demand 0') ?? 0)) <= 10 ? 'Deal reached.' : 'Deal failed; both take the 1-point outside option.'} You earned ${practiceResult.points} ${practiceResult.points === 1 ? 'point' : 'points'}.`
          : practiceGameId === 14
          ? `You priced at $${bertrandPrice(practiceResult.ownChoice)}; the bot priced at $${bertrandPrice(practiceResult.botChoice || 'Price 10')}. ${practiceResult.ownChoice === practiceResult.botChoice ? 'You split the market.' : (bertrandPrice(practiceResult.ownChoice) ?? 10) < (bertrandPrice(practiceResult.botChoice || 'Price 10') ?? 10) ? 'You captured the market.' : 'The bot undercut you.'} Your profit: ${practiceResult.points}.`
          : practiceGameId === 21
          ? `You produced ${cournotQuantity(practiceResult.ownChoice)} units; the bot produced ${cournotQuantity(practiceResult.botChoice || 'Quantity 10')}. Market price was $${Math.max(0, 100 - (cournotQuantity(practiceResult.ownChoice) ?? 0) - (cournotQuantity(practiceResult.botChoice || 'Quantity 10') ?? 0))}. Your profit: $${practiceResult.points.toFixed(2)}.`
          : practiceGameId === 22
          ? `You chose mile ${hotellingLocation(practiceResult.ownChoice)}; the bot chose mile ${hotellingLocation(practiceResult.botChoice || 'Location 0')}. Your market share: ${practiceResult.points.toFixed(1)}% (${practiceResult.points.toFixed(1)} points).`
          : practiceGameId === 19
          ? `You chose ${practiceResult.ownChoice}; the bot chose ${practiceResult.botChoice}. You earned ${practiceResult.points} ${practiceResult.points === 1 ? 'point' : 'points'}.`
          : practiceGameId === 12
          ? `You contributed ${contributionAmount(practiceResult.ownChoice) ?? 0}; the three bots contributed ${practiceResult.botContributions?.join(', ')}. The group pool was ${practiceResult.groupTotal}. You earned ${practiceResult.points} ${practiceResult.points === 1 ? 'point' : 'points'}.`
          : `You chose ${practiceResult.ownChoice}; the bot chose ${practiceResult.botChoice}. You earned ${practiceResult.points} ${practiceResult.points === 1 ? 'point' : 'points'}.`}</p>}
        </div>}
        </div>
      </details>}

    </section>
  );
}
