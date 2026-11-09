import test from 'node:test';
import assert from 'node:assert/strict';
import { ALIAS_ICONS, BLOTTO_DEPLOYMENTS, CENTIPEDE_FIRST, CENTIPEDE_SECOND, LIVE_GAMES, ULTIMATUM_OFFERS, advanceCentipede, advancePracticeCentipede, advanceRepeated, auctionBid, auctionPayoff, firstPriceAuctionPayoff, beautyContest, bertrandPoints, bertrandPrice, blottoAllocation, centipedeExitNode, centipedePayoff, classParticipants, commonValueBid, commonValueOutcome, contributionAmount, cournotPoints, cournotQuantity, dollarAuctionBid, dollarAuctionPoints, hotellingLocation, hotellingShares, demandAmount, finishRound, fisheryPoints, groupParticipants, guessAmount, investAmount, lemonsOffer, lemonsPayoff, offerAmount, pairParticipants, pointsFor, practiceCentipedePoints, prepareEntryResponses, prepareLemonsResponses, prepareSignalingResponses, prepareTrustResponses, prepareUltimatumResponses, publicGoodsPoints, randomChoice, randomStudentAlias, repeatedTurnResults, resolveResults, returnAmount, signalingPoints, shuffleAliasIcon, submissionProgress, summarizeClass, summarizePeople, summarizePerson, summarizeRound, travelerClaim, travelerPoints, trawlerAmount } from '../src/liveMatch.ts';

test('Lemons Market gives the seller private quality and sequential sale choices', () => {
  assert.equal(lemonsOffer('Offer 1000'), 1000);
  assert.equal(lemonsOffer('Offer 9000'), 9000);
  assert.equal(lemonsOffer('Offer 1100'), null);
  assert.deepEqual(lemonsPayoff(5000, 'Low', true), [0, 2000]);
  assert.deepEqual(lemonsPayoff(7500, 'High', true), [1500, 500]);
  assert.deepEqual(lemonsPayoff(5000, 'High', false), [0, 0]);
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second', quality: 'Low' } };
  const buyer = { a: { round: 1, choice: 'Offer 5000' } };
  const offers = prepareLemonsResponses(assignments, buyer, 1);
  assert.deepEqual(offers.b, { round: 1, choice: 'Offer 5000', fromBot: false });
  const choices = { ...buyer, b: { round: 1, choice: 'Accept' } };
  const results = resolveResults(assignments, choices, 1, 28, offers);
  assert.deepEqual([results.a.ownPoints, results.b.ownPoints], [0, 2000]);
  assert.equal(results.a.lemons.quality, 'Low');
  assert.equal(results.a.opponentKind, 'student');
  const summary = summarizeRound(assignments, choices, results, 1, 28);
  assert.equal(summary.outcomes[1].count, 1);
  assert.equal(summary.choiceCounts.reduce((n, item) => n + item.count, 0), 2);
  const csv = buildReportCsv(() => 'Lemons Market', [summary], { 1: { summary, aliases: { a: 'A', b: 'B' }, results } });
  assert.match(csv, /"Car quality","Purchase offer","Sale accepted"/);
  assert.match(csv, /"Low","5000","Yes"/);
  const missedSeller = resolveResults(assignments, buyer, 1, 28, offers).a;
  assert.equal(missedSeller.opponentKind, 'bot');
  assert.equal(missedSeller.ownPoints, 0);
  const rejected = resolveResults(assignments, { ...buyer, b: { round: 1, choice: 'Reject' } }, 1, 28, offers);
  assert.deepEqual([rejected.a.ownPoints, rejected.b.ownPoints], [0, 0]);
  assert.equal(rejected.a.lemons.accepted, false);
  const loneBuyer = pairParticipants({ a: { alias: 'A' } }, 1, 28).a;
  assert.equal(loneBuyer.kind, 'bot');
  assert.equal(loneBuyer.quality, undefined);
  assert.equal(resolveResults({ a: loneBuyer }, buyer, 1, 28).a.opponentKind, 'bot');
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 28, step: 'respond' },
    participants: { a: { alias: 'A' }, b: { alias: 'B' } }, assignments, choices, offers }, true);
  assert.equal(finished.config.phase, 'finished');
  assert.equal(finished.results.a[1].lemons.quality, 'Low');
  assert.equal(finished.config.summaries[1].outcomes[1].count, 1);
  assert.equal(randomChoice(28).startsWith('Offer '), true);
});

test('Traveler claims score ties, lower-claim bonus, pair results, fallback, and CSV', () => {
  assert.equal(LIVE_GAMES.find(game => game.id === 26)?.options.length, 99);
  assert.equal(travelerClaim('Claim 2'), 2);
  assert.equal(travelerClaim('Claim 100'), 100);
  assert.equal(travelerClaim('Claim 1'), null);
  assert.equal(travelerClaim('Claim 101'), null);
  assert.deepEqual(travelerPoints(80, 80), [80, 80]);
  assert.deepEqual(travelerPoints(80, 100), [82, 78]);
  assert.deepEqual(travelerPoints(100, 80), [78, 82]);
  assert.deepEqual(travelerPoints(2, 100), [4, 0]);
  assert.throws(() => pointsFor(26, 'Claim 101', 'Claim 90'));
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Claim 80' }, b: { round: 1, choice: 'Claim 100' } };
  const results = resolveResults(assignments, choices, 1, 26);
  assert.deepEqual([results.a.ownPoints, results.b.ownPoints], [82, 78]);
  const summary = summarizeRound(assignments, choices, results, 1, 26);
  assert.equal(summary.outcomes[1].count, 1);
  assert.equal(summary.choiceCounts.reduce((sum, band) => sum + band.count, 0), 2);
  const csv = buildReportCsv(() => "Traveler's Dilemma", [summary], { 1: { summary, aliases: { a: 'A', b: 'B' }, results } });
  assert.match(csv, /"Own traveler claim","Rival traveler claim","Lower claim","Claim adjustment"/);
  assert.match(csv, /"80","100","80","2"/);
  const fallback = resolveResults(assignments, { a: choices.a }, 1, 26).a;
  assert.equal(fallback.opponentKind, 'bot');
  assert.equal(fallback.ownPoints, travelerPoints(80, travelerClaim(fallback.opponentChoice))[0]);
  assert.equal(randomChoice(26).startsWith('Claim '), true);
});

test('dollar auction charges both bidders and breaks ties by pairing role', () => {
  assert.equal(dollarAuctionBid('Bid 2.5'), 2.5);
  assert.equal(dollarAuctionBid('Bid 0.0'), null);
  assert.deepEqual(dollarAuctionPoints(0.8, 0.7), [0.2, -0.7]);
  assert.deepEqual(dollarAuctionPoints(1.5, 1.2), [-0.5, -1.2]);
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Bid 1.2' }, b: { round: 1, choice: 'Bid 1.2' } };
  const results = resolveResults(assignments, choices, 1, 25);
  assert.equal(results.a.ownPoints, -0.2);
  assert.equal(results.b.ownPoints, -1.2);
  const summary = summarizeRound(assignments, choices, results, 1, 25);
  assert.equal(summary.outcomes[2].count, 1);
  const csv = buildReportCsv(() => 'Escalating Dollar Auction', [summary], { 1: { summary, aliases: { a: 'A', b: 'B' }, results } });
  assert.match(csv, /"Own dollar bid","Rival dollar bid","Won dollar auction"/);
  assert.match(csv, /"1.2","1.2","Yes"/);
});

test('common-value auction shares one true value and handles ties and losses', () => {
  assert.equal(commonValueBid('Bid 10'), 10);
  assert.equal(commonValueBid('Bid 90'), 90);
  assert.equal(commonValueBid('Bid 9'), null);
  assert.deepEqual(commonValueOutcome(60, 50, 40, 60, true), { value: 50, won: true, ownPoints: -10, otherPoints: 0 });
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first', valuation: 40 },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second', valuation: 60 } };
  const choices = { a: { round: 1, choice: 'Bid 45' }, b: { round: 1, choice: 'Bid 45' } };
  const results = resolveResults(assignments, choices, 1, 24);
  assert.equal(results.a.ownPoints, 5);
  assert.equal(results.b.ownPoints, 0);
  assert.equal(results.a.commonValue.trueValue, results.b.commonValue.trueValue);
  const summary = summarizeRound(assignments, choices, results, 1, 24);
  assert.equal(summary.outcomes[0].count, 1);
  const csv = buildReportCsv(() => 'Common-Value Auction', [summary], { 1: { summary, aliases: { a: 'A', b: 'B' }, results } });
  assert.match(csv, /"Private survey signal","Rival survey signal","Common true value","Won common-value auction"/);
  assert.match(csv, /"40","60","50","Yes"/);
});

test('Hotelling locations score pairs, bot fallbacks, outcomes, and CSV shares', () => {
  assert.equal(LIVE_GAMES.find(game => game.id === 22)?.options.length, 101);
  assert.equal(hotellingLocation('Location 0'), 0);
  assert.equal(hotellingLocation('Location 100'), 100);
  assert.equal(hotellingLocation('Location 101'), null);
  assert.deepEqual(hotellingShares(0, 100), [50, 50]);
  assert.deepEqual(hotellingShares(20, 60), [40, 60]);
  assert.deepEqual(hotellingShares(60, 20), [60, 40]);
  assert.deepEqual(hotellingShares(50, 50), [50, 50]);
  assert.throws(() => pointsFor(22, 'Location 101', 'Location 50'));
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' }, b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Location 20' }, b: { round: 1, choice: 'Location 60' } };
  const results = resolveResults(assignments, choices, 1, 22);
  assert.equal(results.a.ownPoints, 40);
  assert.equal(results.b.ownPoints, 60);
  const summary = summarizeRound(assignments, choices, results, 1, 22);
  assert.equal(summary.outcomes[1].count, 1);
  const csv = buildReportCsv(() => 'Hotelling Beach', [summary], { 1: { aliases: { a: 'A', b: 'B' }, results } });
  assert.match(csv, /"Own beach location","Rival beach location","Beach market share"/);
  assert.match(csv, /"Student result","1","Hotelling Beach","A".*"20","60","40"/);
  assert.equal(randomChoice(22).startsWith('Location '), true);
  const fallback = resolveResults(assignments, { a: choices.a }, 1, 22).a;
  assert.equal(fallback.opponentKind, 'bot');
  assert.equal(fallback.ownPoints + fallback.opponentPoints, 100);
});

test('Cournot quantities score paired and random bot rounds and export market data', () => {
  assert.equal(LIVE_GAMES.find(game => game.id === 21)?.options.length, 36);
  assert.equal(cournotQuantity('Quantity 10'), 10);
  assert.equal(cournotQuantity('Quantity 45'), 45);
  assert.equal(cournotQuantity('Quantity 46'), null);
  assert.deepEqual(cournotPoints(30, 30), [9, 9]);
  assert.deepEqual(cournotPoints(45, 45), [0, 0]);
  assert.deepEqual(cournotPoints(10, 45), [3.5, 15.75]);
  assert.throws(() => pointsFor(21, 'Quantity 46', 'Quantity 30'));
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' }, b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Quantity 30' }, b: { round: 1, choice: 'Quantity 30' } };
  const results = resolveResults(assignments, choices, 1, 21);
  assert.equal(results.a.ownPoints, 9);
  assert.equal(results.b.ownPoints, 9);
  assert.equal(summarizeRound(assignments, choices, results, 1, 21).outcomes[1].count, 1);
  const csv = buildReportCsv(() => 'Cournot Duopoly', [summarizeRound(assignments, choices, results, 1, 21)], { 1: { aliases: { a: 'A', b: 'B' }, results } });
  assert.match(csv, /"Market price","Combined output"/);
  assert.match(csv, /"Student result","1","Cournot Duopoly","A".*"40","60"/);
  assert.equal(randomChoice(21).startsWith('Quantity '), true);
});

test('Bertrand Duopoly scores lower price, ties, bot fallbacks, and class outcomes', () => {
  assert.equal(LIVE_GAMES.find(game => game.id === 14)?.options.length, 41);
  assert.equal(bertrandPrice('Price 10'), 10);
  assert.equal(bertrandPrice('Price 50'), 50);
  assert.equal(bertrandPrice('Price 51'), null);
  assert.deepEqual(bertrandPoints(20, 21), [800, 0]);
  assert.deepEqual(bertrandPoints(21, 20), [0, 800]);
  assert.deepEqual(bertrandPoints(20, 20), [400, 400]);
  assert.deepEqual(bertrandPoints(10, 10), [0, 0]);
  assert.throws(() => pointsFor(14, 'Price 51', 'Price 20'));
  const assignments = {
    a: { round: 1, kind: 'student', role: 'first', opponentUid: 'b', opponentAlias: 'B' },
    b: { round: 1, kind: 'student', role: 'second', opponentUid: 'a', opponentAlias: 'A' },
  };
  const choices = { a: { round: 1, choice: 'Price 20' }, b: { round: 1, choice: 'Price 21' } };
  const results = resolveResults(assignments, choices, 1, 14);
  assert.equal(results.a.ownPoints, 800);
  assert.equal(results.b.ownPoints, 0);
  const summary = summarizeRound(assignments, choices, results, 1, 14);
  assert.equal(summary.studentPairs, 1);
  assert.equal(summary.outcomes.find(item => item.label === 'Different prices: one firm wins')?.count, 1);
  assert.equal(randomChoice(14).startsWith('Price '), true);
});

test('Costly Signaling stages a hidden quality and scores both roles', () => {
  assert.ok(LIVE_GAMES.some(game => game.id === 10));
  assert.deepEqual(signalingPoints('High', 'Signal', 'Trust'), [3, 3]);
  assert.deepEqual(signalingPoints('Low', 'Signal', 'Trust'), [1, -3]);
  assert.deepEqual(signalingPoints('Low', 'Signal', 'Do Not Trust'), [-3, 0]);
  const assignments = {
    seller: { round: 1, kind: 'student', role: 'first', opponentUid: 'buyer', opponentAlias: 'Buyer', quality: 'Low' },
    buyer: { round: 1, kind: 'student', role: 'second', opponentUid: 'seller', opponentAlias: 'Seller' },
  };
  const choices = { seller: { round: 1, choice: 'Signal' }, buyer: { round: 1, choice: 'Trust' } };
  const offers = prepareSignalingResponses(assignments, choices, 1);
  assert.deepEqual(offers.buyer, { round: 1, choice: 'Signal', fromBot: false });
  assert.equal(JSON.stringify(offers).includes('Low'), false);
  const results = resolveResults(assignments, choices, 1, 10, offers);
  assert.equal(results.seller.ownPoints, 1);
  assert.equal(results.buyer.ownPoints, -3);
  assert.equal(results.buyer.signaling.quality, 'Low');
  assert.equal(summarizeRound(assignments, choices, results, 1, 10).outcomes[0].count, 1);
});

test('split the pie scores deals, failed deals, bot fallbacks, and reports', () => {
  assert.equal(demandAmount('Demand 10'), 10);
  assert.equal(demandAmount('Demand 11'), null);
  assert.equal(demandAmount('Demand 2.5'), null);
  assert.deepEqual(pointsFor(9, 'Demand 6', 'Demand 4'), [6, 4]);
  assert.deepEqual(pointsFor(9, 'Demand 7', 'Demand 4'), [1, 1]);
  assert.throws(() => pointsFor(9, 'Demand 11', 'Demand 0'));
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Demand 7' }, b: { round: 1, choice: 'Demand 4' } };
  const results = resolveResults(assignments, choices, 1, 9);
  assert.deepEqual([results.a.ownPoints, results.b.ownPoints], [1, 1]);
  const summary = summarizeRound(assignments, choices, results, 1, 9);
  assert.equal(summary.outcomes.find(item => item.label === 'Deal failed').count, 1);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 9 }, participants: { a: { alias: 'A' }, b: { alias: 'B' } }, assignments, choices }, true);
  assert.equal(finished.archive[1].results.a.opponentChoice, 'Demand 4');
  assert.match(buildReportCsv(() => 'Split the Pie Bargaining', [finished.config.summaries[1]], finished.archive), /"Deal failed","1"/);
  const oldRandom = Math.random; Math.random = () => 0;
  try { assert.equal(resolveResults(assignments, { a: choices.a }, 1, 9).a.fallback, true); }
  finally { Math.random = oldRandom; }
});
import { buildReportCsv } from '../src/reportExport.ts';

test('second-price auction uses private values, other bid as price, and reciprocal results', () => {
  assert.equal(auctionBid('Bid 12'), 12);
  assert.equal(auctionBid('Bid 12.5'), null);
  assert.deepEqual(auctionPayoff(9, 6, 8), { points: 2, won: true, price: 6 });
  assert.deepEqual(auctionPayoff(11, 9, 7), { points: -2, won: true, price: 9 });
  assert.deepEqual(auctionPayoff(7, 7, 8, false), { points: 0, won: false, price: 0 });
  assert.deepEqual(auctionPayoff(7, 7, 8, true), { points: 1, won: true, price: 7 });
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first', valuation: 8 },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second', valuation: 10 },
    c: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first', valuation: 4 } };
  const choices = { a: { round: 1, choice: 'Bid 9' }, b: { round: 1, choice: 'Bid 6' }, c: { round: 1, choice: 'Bid 0' } };
  const oldRandom = Math.random; Math.random = () => 0;
  try {
    const paired = pairParticipants({ a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' } }, 1, 7);
    assert.deepEqual(Object.values(paired).map(item => item.valuation), [1, 1, 1]);
    const results = resolveResults(assignments, choices, 1, 7);
    assert.equal(results.a.ownPoints, 2);
    assert.equal(results.b.ownPoints, 0);
    assert.equal(results.a.auction.price, 6);
    assert.equal(results.b.auction.valuation, 10);
    assert.equal(results.c.auction.won, true);
    const summary = summarizeRound(assignments, choices, results, 1, 7);
    assert.equal(summary.outcomes.find(item => item.label === 'Winner gains points').count, 1);
    const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 7 }, participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' } }, assignments, choices }, true);
    assert.equal(finished.archive[1].results.a.auction.valuation, 8);
    const csv = buildReportCsv(() => 'Second-Price Auction', [finished.config.summaries[1]], finished.archive);
    assert.match(csv, /"Private value".*"Won auction".*"Winning bid".*"Price paid"/);
    assert.match(csv, /"Student result","1","Second-Price Auction","A".*"8","Yes","9","6"/);
    const tied = resolveResults({ a: { ...assignments.a, valuation: 6 }, b: { ...assignments.b, valuation: 9 } },
      { a: { round: 1, choice: 'Bid 7' }, b: { round: 1, choice: 'Bid 7' } }, 1, 7);
    assert.deepEqual([tied.a.ownPoints, tied.b.ownPoints], [-1, 0]);
    const fallback = resolveResults({ a: assignments.a, b: assignments.b }, { a: { round: 1, choice: 'Bid 2' } }, 1, 7);
    assert.equal(fallback.a.fallback, true);
    assert.equal(fallback.a.opponentKind, 'bot');
  } finally { Math.random = oldRandom; }
});

test('first-price auction charges the winner their own bid across pair, tie, bot, and report', () => {
  assert.deepEqual(firstPriceAuctionPayoff(7, 6, 9), { points: 2, won: true, price: 7 });
  assert.deepEqual(firstPriceAuctionPayoff(11, 9, 8), { points: -3, won: true, price: 11 });
  assert.deepEqual(firstPriceAuctionPayoff(7, 7, 9, false), { points: 0, won: false, price: 0 });
  assert.deepEqual(firstPriceAuctionPayoff(7, 7, 9, true), { points: 2, won: true, price: 7 });
  const participants = { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' } };
  const oldRandom = Math.random; Math.random = () => 0;
  try {
    const drawn = pairParticipants(participants, 1, 8);
    assert.deepEqual(Object.values(drawn).map(item => item.valuation), [1, 1, 1]);
    const assignments = {
      a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first', valuation: 9 },
      b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second', valuation: 10 },
      c: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first', valuation: 8 },
    };
    const choices = { a: { round: 1, choice: 'Bid 7' }, b: { round: 1, choice: 'Bid 6' }, c: { round: 1, choice: 'Bid 2' } };
    const results = resolveResults(assignments, choices, 1, 8);
    assert.deepEqual([results.a.ownPoints, results.b.ownPoints, results.a.auction.price], [2, 0, 7]);
    assert.equal(results.b.auction.price, 7);
    assert.equal(results.c.opponentKind, 'bot');
    const summary = summarizeRound(assignments, choices, results, 1, 8);
    assert.equal(summary.outcomes.find(item => item.label === 'Winner gains points').count, 1);
    const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 8 }, participants, assignments, choices }, true);
    const csv = buildReportCsv(() => 'First-Price Auction', [finished.config.summaries[1]], finished.archive);
    assert.match(csv, /"Student result","1","First-Price Auction","A".*"9","Yes","7","7"/);
    const tied = resolveResults({ a: assignments.a, b: assignments.b }, { a: { round: 1, choice: 'Bid 7' }, b: { round: 1, choice: 'Bid 7' } }, 1, 8);
    assert.deepEqual([tied.a.ownPoints, tied.b.ownPoints], [2, 0]);
    const fallback = resolveResults({ a: assignments.a, b: assignments.b }, { a: { round: 1, choice: 'Bid 2' } }, 1, 8);
    assert.equal(fallback.a.fallback, true);
    assert.equal(fallback.a.auction.price, 2);
  } finally { Math.random = oldRandom; }
});

test('Beauty Contest uses all submitted guesses, exact ties, classwide charts, and report export', () => {
  assert.equal(guessAmount('Guess 33.3'), 33.3);
  assert.equal(guessAmount('Guess 100.1'), null);
  assert.equal(guessAmount('Guess 1.23'), null);
  assert.throws(() => beautyContest([]));
  const participants = { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' }, d: { alias: 'D' } };
  const assignments = classParticipants(participants, 1);
  assert.deepEqual(Object.values(assignments).map(item => item.kind), ['class', 'class', 'class', 'class']);
  const choices = { a: { round: 1, choice: 'Guess 0' }, b: { round: 1, choice: 'Guess 30' }, c: { round: 1, choice: 'Guess 60' } };
  const results = resolveResults(assignments, choices, 1, 11);
  assert.deepEqual([results.a.ownPoints, results.b.ownPoints, results.c.ownPoints], [1, 5, 1]);
  assert.equal(results.d, undefined);
  assert.equal(results.b.beauty.average, 30);
  assert.equal(results.b.beauty.target, 20);
  const summary = summarizeRound(assignments, choices, results, 1, 11);
  assert.deepEqual(summary.choiceCounts.map(item => item.count), [1, 1, 0, 1, 0]);
  assert.deepEqual(summary.outcomes.map(item => item.count), [1, 2]);
  assert.equal(summary.studentPairs, 0);
  const tied = resolveResults(assignments, { a: { round: 1, choice: 'Guess 20' }, b: { round: 1, choice: 'Guess 20' }, c: { round: 1, choice: 'Guess 100' } }, 1, 11);
  assert.deepEqual([tied.a.ownPoints, tied.b.ownPoints, tied.c.ownPoints], [5, 5, 1]);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 11 }, participants, assignments, choices }, true);
  assert.equal(finished.archive[1].results.b.beauty.target, 20);
  assert.equal(summarizeClass([finished.config.summaries[1]]).byGame.find(item => item.gameId === 11).choiceCounts[1].count, 1);
  const csv = buildReportCsv(() => 'Beauty Contest', [finished.config.summaries[1]], finished.archive);
  assert.match(csv, /"Class average","Beauty target","Distance to target","Closest guess"/);
  assert.match(csv, /"Student result","1","Beauty Contest","B".*"30","20","10","Yes"/);
});

test('Highway Gas War scores, pairs, bot fallback, and class outcomes', () => {
  assert.deepEqual(pointsFor(3, 'High Price', 'High Price'), [2, 2]);
  assert.deepEqual(pointsFor(3, 'Low Price', 'Low Price'), [1, 1]);
  assert.deepEqual(pointsFor(3, 'Low Price', 'High Price'), [3, 0]);
  assert.deepEqual(pointsFor(3, 'High Price', 'Low Price'), [0, 3]);
  assert.throws(() => pointsFor(3, 'Defect', 'High Price'));
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' },
  };
  const choices = { a: { round: 1, choice: 'Low Price' }, b: { round: 1, choice: 'High Price' }, c: { round: 1, choice: 'High Price' } };
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const results = resolveResults(assignments, choices, 1, 3);
    assert.deepEqual([results.a.ownPoints, results.b.ownPoints], [3, 0]);
    assert.equal(results.c.opponentChoice, 'High Price');
    const summary = summarizeRound(assignments, choices, results, 1, 3);
    assert.equal(summary.studentPairs, 1);
    assert.equal(summary.botMatches, 1);
    assert.equal(summary.outcomes.find(item => item.label === 'One station undercuts').count, 1);
  } finally { Math.random = originalRandom; }
});

test('Repeated Prisoner’s Dilemma keeps partners for five turns and reports the sequence', () => {
  assert.deepEqual(pointsFor(6, 'Cooperate', 'Defect'), [0, 3]);
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const first = ['Cooperate', 'Defect', 'Cooperate', 'Defect', 'Cooperate'];
  const second = ['Cooperate', 'Cooperate', 'Defect', 'Defect', 'Cooperate'];
  const repeatedDecisions = { a: {}, b: {} };
  for (let i = 0; i < 5; i++) {
    repeatedDecisions.a[`t${i + 1}`] = { round: 1, choice: first[i] };
    repeatedDecisions.b[`t${i + 1}`] = { round: 1, choice: second[i] };
  }
  let room = { config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 6, repeatedTurn: 1 }, assignments,
    participants: { a: { alias: 'A' }, b: { alias: 'B' } }, repeatedDecisions };
  assert.equal(finishRound(room, true), null);
  for (let i = 0; i < 5; i++) room = advanceRepeated(room, () => 'Defect');
  assert.equal(room.config.repeatedTurn, 6);
  assert.deepEqual(Object.values(room.repeatedPaths.a.turns).map(item => item.own), first);
  assert.deepEqual(Object.values(room.repeatedPaths.b.turns).map(item => item.own), second);
  const result = repeatedTurnResults(room);
  assert.deepEqual([result.a.ownPoints, result.b.ownPoints], [8, 8]);
  const finished = finishRound(room, true);
  assert.equal(finished.config.summaries[1].studentPairs, 1);
  assert.equal(finished.config.summaries[1].choiceCounts[0].count, 6);
  assert.equal(finished.config.summaries[1].outcomes.reduce((sum, item) => sum + item.count, 0), 5);
  assert.equal(finished.archive[1].results.a.repeatedTurns[5].other, 'Cooperate');
  const csv = buildReportCsv(id => id === 6 ? "Repeated Prisoner's Dilemma" : 'Other', [finished.config.summaries[1]], finished.archive);
  assert.equal(csv.split('"Match turn"').length - 1, 10);
});

test('Repeated Prisoner’s Dilemma fills a missing turn with a bot', () => {
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  let room = { config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 6, repeatedTurn: 1 }, assignments,
    repeatedDecisions: { a: { t1: { round: 1, choice: 'Cooperate' } } } };
  room = advanceRepeated(room, () => 'Defect');
  assert.deepEqual([room.repeatedPaths.a.turns[1].ownPoints, room.repeatedPaths.b.turns[1].ownPoints], [0, 3]);
  for (let i = 1; i < 5; i++) room = advanceRepeated(room, () => 'Defect');
  const finished = finishRound(room, true);
  assert.equal(finished.archive[1].results.a.fallback, true);
  assert.equal(finished.config.summaries[1].botMatches, 2);
  assert.equal(finished.config.summaries[1].choiceCounts.find(item => item.label === 'Cooperate').count, 1);
});

test('live Centipede advances each node, waits for the correct player, and scores the exit', () => {
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' },
  };
  let room = { config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 20, centipedeNode: 1 }, assignments,
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' } },
    centipedeDecisions: { a: { n1: { round: 1, choice: 'Pass' }, n3: { round: 1, choice: 'Take' } },
      b: { n2: { round: 1, choice: 'Pass' } }, c: { n1: { round: 1, choice: 'Take' } } } };
  assert.equal(finishRound(room, true), null);
  room = advanceCentipede(room, () => 'Pass');
  assert.equal(room.config.centipedeNode, 2);
  assert.equal(room.centipedePaths.c.exitNode, 1);
  room = advanceCentipede(room, () => 'Take');
  assert.equal(room.centipedePaths.a.moves[2], 'Pass');
  room = advanceCentipede(room, () => 'Pass');
  assert.equal(room.centipedePaths.a.exitNode, 3);
  for (let node = 4; node <= 6; node++) room = advanceCentipede(room, () => 'Pass');
  assert.equal(room.config.centipedeNode, 7);
  const finished = finishRound(room, true);
  assert.deepEqual([finished.archive[1].results.a.ownPoints, finished.archive[1].results.b.ownPoints], [4, 2]);
  assert.equal(finished.archive[1].results.c.ownPoints, 2);
  assert.equal(finished.config.summaries[1].outcomes[2].count, 1);
});

test('live Centipede substitutes a bot for a missed student turn', () => {
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  let room = { config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 20, centipedeNode: 1 }, assignments,
    centipedeDecisions: { a: { n1: { round: 1, choice: 'Pass' } } } };
  room = advanceCentipede(room, () => 'Pass');
  room = advanceCentipede(room, () => 'Take');
  assert.equal(room.centipedePaths.a.exitNode, 2);
  assert.equal(room.centipedePaths.a.fallback, true);
  for (let node = 3; node <= 6; node++) room = advanceCentipede(room, () => 'Pass');
  const finished = finishRound(room, true);
  assert.deepEqual([finished.archive[1].results.a.ownPoints, finished.archive[1].results.b.ownPoints], [1, 3]);
  assert.equal(finished.archive[1].results.a.opponentKind, 'bot');
});

test('Centipede bot practice alternates moves and scores the reached branch', () => {
  let path = { node: 1, moves: {} };
  path = advancePracticeCentipede(path, 'first', 'Pass', () => 'Pass');
  assert.deepEqual(path, { node: 3, moves: { 1: 'Pass', 2: 'Pass' } });
  path = advancePracticeCentipede(path, 'first', 'Take', () => { throw Error('Bot should not move after Take'); });
  assert.equal(path.exitNode, 3);
  assert.deepEqual(practiceCentipedePoints(3, 'first'), [4, 2]);
  assert.deepEqual(practiceCentipedePoints(3, 'second'), [2, 4]);
  assert.deepEqual(advancePracticeCentipede(path, 'first', 'Pass'), path);

  const secondStarts = advancePracticeCentipede({ node: 1, moves: {} }, 'second', undefined, () => 'Pass');
  assert.deepEqual(secondStarts, { node: 2, moves: { 1: 'Pass' } });
  const botTakes = advancePracticeCentipede({ node: 1, moves: {} }, 'second', undefined, () => 'Take');
  assert.equal(botTakes.exitNode, 1);
  assert.deepEqual(practiceCentipedePoints(1, 'second'), [0, 2]);
});

test('Centipede plans resolve the first Take, score both roles, and archive the exit', () => {
  const payoffs = [[2, 0], [1, 3], [4, 2], [3, 5], [6, 4], [5, 7], [6, 6]];
  for (let node = 1; node <= 6; node++) {
    const earned = node - 1;
    const score = centipedePayoff(node);
    assert.equal(score[node % 2 ? 0 : 1], earned + 2);
    assert.equal(score[node % 2 ? 1 : 0], earned);
    assert.ok(score[node % 2 ? 0 : 1] > centipedePayoff(node + 1)[node % 2 ? 0 : 1]);
  }
  assert.deepEqual(centipedePayoff(7), [6, 6]);
  assert.throws(() => centipedePayoff(0));
  for (const first of CENTIPEDE_FIRST) for (const second of CENTIPEDE_SECOND) {
    const node = centipedeExitNode(first, second);
    assert.deepEqual(pointsFor(20, first, second), payoffs[node - 1]);
    assert.deepEqual(pointsFor(20, second, first, 'second'), [...payoffs[node - 1]].reverse());
  }
  assert.equal(centipedeExitNode('Pass All', 'Pass All'), 7);
  assert.throws(() => centipedeExitNode('Take at Node 2', 'Pass All'));
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' },
  };
  const choices = { a: { round: 1, choice: 'Take at Node 5' }, b: { round: 1, choice: 'Take at Node 4' },
    c: { round: 1, choice: 'Pass All' } };
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 20 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' } }, assignments, choices }, true);
  assert.deepEqual([finished.archive[1].results.a.ownPoints, finished.archive[1].results.b.ownPoints], [3, 5]);
  assert.deepEqual([finished.archive[1].results.a.exitNode, finished.archive[1].results.b.exitNode], [4, 4]);
  assert.equal(finished.config.summaries[1].outcomes[3].count, 1);
  assert.equal(finished.config.summaries[1].botMatches, 1);
  assert.ok([2, 4, 6, 7].includes(finished.archive[1].results.c.exitNode));
  const fallback = resolveResults(assignments, { a: choices.a }, 1, 20);
  assert.equal(fallback.a.opponentKind, 'bot');
  assert.equal(fallback.b, undefined);
});

test('Sequential Entry reveals the first move and scores both roles', () => {
  const payoffs = [
    ['Launch', 'Enter', 2, 2], ['Launch', 'Stay Out', 4, 1],
    ['Wait', 'Enter', 1, 4], ['Wait', 'Stay Out', 0, 0],
  ];
  for (const [first, second, a, b] of payoffs) {
    assert.deepEqual(pointsFor(2, first, second), [a, b]);
    assert.deepEqual(pointsFor(2, second, first, 'second'), [b, a]);
  }
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D', role: 'first' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C', role: 'second' },
  };
  const choices = { a: { round: 1, choice: 'Launch' }, b: { round: 1, choice: 'Stay Out' },
    c: { round: 1, choice: 'Wait' }, d: { round: 1, choice: 'Enter' } };
  const offers = prepareEntryResponses(assignments, choices, 1);
  assert.deepEqual(offers.b, { round: 1, choice: 'Launch', fromBot: false });
  assert.deepEqual(offers.d, { round: 1, choice: 'Wait', fromBot: false });
  assert.equal(finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'offer', gameId: 2 }, assignments, choices, offers }, true), null);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'respond', gameId: 2 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' }, d: { alias: 'D' } }, assignments, choices, offers }, true);
  assert.deepEqual(['a', 'b', 'c', 'd'].map(uid => finished.archive[1].results[uid].ownPoints), [4, 1, 1, 4]);
  assert.deepEqual(finished.config.summaries[1].outcomes, [
    { label: 'Launch + Enter', count: 0 }, { label: 'Launch + Stay Out', count: 1 },
    { label: 'Wait + Enter', count: 1 }, { label: 'Wait + Stay Out', count: 0 },
  ]);
  const missing = prepareEntryResponses(assignments, { b: choices.b }, 1);
  assert.equal(missing.b.fromBot, true);
  assert.equal(['Launch', 'Wait'].includes(missing.b.choice), true);
  const fallback = resolveResults(assignments, { b: choices.b }, 1, 2, missing);
  assert.equal(fallback.b.opponentKind, 'bot');
  assert.equal(fallback.a, undefined);
});

test('Entry Deterrence uses observed commitments, scores both roles, and reports outcomes', () => {
  const payoffs = [
    ['Commit', 'Enter', -2, -2], ['Commit', 'Stay Out', 4, 0],
    ['Stay Flexible', 'Enter', 2, 2], ['Stay Flexible', 'Stay Out', 4, 0],
  ];
  for (const [first, second, a, b] of payoffs) {
    assert.deepEqual(pointsFor(5, first, second), [a, b]);
    assert.deepEqual(pointsFor(5, second, first, 'second'), [b, a]);
  }
  assert.deepEqual(LIVE_GAMES.find(game => game.id === 5).roles, ['Incumbent', 'Rival']);
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D', role: 'first' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C', role: 'second' },
  };
  const choices = { a: { round: 1, choice: 'Commit' }, b: { round: 1, choice: 'Stay Out' },
    c: { round: 1, choice: 'Stay Flexible' }, d: { round: 1, choice: 'Enter' } };
  const offers = prepareEntryResponses(assignments, choices, 1, 5);
  assert.deepEqual(offers.b, { round: 1, choice: 'Commit', fromBot: false });
  assert.deepEqual(offers.d, { round: 1, choice: 'Stay Flexible', fromBot: false });
  assert.equal(finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'offer', gameId: 5 }, assignments, choices, offers }, true), null);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'respond', gameId: 5 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' }, d: { alias: 'D' } }, assignments, choices, offers }, true);
  assert.deepEqual(['a', 'b', 'c', 'd'].map(uid => finished.archive[1].results[uid].ownPoints), [4, 0, 2, 2]);
  assert.deepEqual(finished.config.summaries[1].outcomes, [
    { label: 'Commit + Enter', count: 0 }, { label: 'Commit + Stay Out', count: 1 },
    { label: 'Stay Flexible + Enter', count: 1 }, { label: 'Stay Flexible + Stay Out', count: 0 },
  ]);
  const missing = prepareEntryResponses(assignments, { b: choices.b }, 1, 5);
  assert.equal(missing.b.fromBot, true);
  assert.equal(['Commit', 'Stay Flexible'].includes(missing.b.choice), true);
  const fallback = resolveResults(assignments, { b: choices.b }, 1, 5, missing);
  assert.equal(fallback.b.opponentKind, 'bot');
  assert.equal(fallback.a, undefined);
});

test('Trust Game invests, triples, returns, and archives reciprocal results', () => {
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Invest 6' }, b: { round: 1, choice: 'Return 8' } };
  const offers = prepareTrustResponses(assignments, choices, 1);
  assert.deepEqual(offers.b, { round: 1, choice: 'Invest 6', fromBot: false });
  assert.equal(investAmount('Invest 6'), 6);
  assert.equal(returnAmount('Return 8'), 8);
  assert.deepEqual(pointsFor(19, 'Invest 6', 'Return 8'), [12, 10]);
  assert.deepEqual(pointsFor(19, 'Return 8', 'Invest 6', 'second'), [10, 12]);
  const room = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'respond', gameId: 19 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' } }, assignments, choices, offers }, true);
  assert.deepEqual([room.results.a[1].ownPoints, room.results.b[1].ownPoints], [12, 10]);
  assert.equal(room.config.summaries[1].averageReturn, 8);
  assert.deepEqual(room.config.summaries[1].outcomes, [{ label: 'Nothing returned', count: 0 }, { label: 'Some returned', count: 1 }, { label: 'All returned', count: 0 }]);
});

test('Trust Game uses random bots when a partner does not act', () => {
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D', role: 'first' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Invest 4' }, d: { round: 1, choice: 'Return 0' } };
  const offers = prepareTrustResponses(assignments, choices, 1);
  assert.equal(offers.b.fromBot, false);
  assert.equal(offers.d.fromBot, true);
  assert.equal(returnAmount(choices.d.choice) <= 3 * investAmount(offers.d.choice), true);
  const results = resolveResults(assignments, choices, 1, 19, offers);
  assert.equal(results.a.fallback, true);
  assert.equal(results.d.fallback, true);
  assert.equal(results.a.opponentKind, 'bot');
  assert.equal(results.d.opponentKind, 'bot');
  assert.equal(results.b, undefined);
  assert.equal(results.c, undefined);
  assert.equal(results.a.ownPoints + results.a.opponentPoints, 10 + 2 * 4);
  const invalid = resolveResults(assignments, { a: choices.a, b: { round: 1, choice: 'Return 30' } }, 1, 19, offers);
  assert.equal(invalid.a.fallback, true);
  assert.equal(invalid.b, undefined);
  const planned = resolveResults({ solo: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' } },
    { solo: { round: 1, choice: 'Invest 5' } }, 1, 19);
  assert.equal(planned.solo.opponentKind, 'bot');
  assert.equal(planned.solo.fallback, false);
});

test('ultimatum offers, acceptance and rejection score both roles', () => {
  assert.equal(ULTIMATUM_OFFERS.length, 21);
  for (let amount = 0; amount <= 10; amount += 0.5) {
    assert.equal(offerAmount(`Offer ${amount}`), amount);
    assert.deepEqual(pointsFor(30, `Offer ${amount}`, 'Accept', 'first'), [10 - amount, amount]);
    assert.deepEqual(pointsFor(30, 'Accept', `Offer ${amount}`, 'second'), [amount, 10 - amount]);
    assert.deepEqual(pointsFor(30, `Offer ${amount}`, 'Reject', 'first'), [0, 0]);
  }
  assert.equal(offerAmount('Offer 10.5'), null);
  assert.equal(offerAmount('Offer 3.7'), null);
});

test('ultimatum response step shares the offer, handles missing players, and archives results', () => {
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D', role: 'first' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C', role: 'second' },
  };
  const choices = { a: { round: 1, choice: 'Offer 3' }, b: { round: 1, choice: 'Accept' }, d: { round: 1, choice: 'Reject' } };
  const offers = prepareUltimatumResponses(assignments, choices, 1);
  assert.deepEqual(offers.b, { round: 1, choice: 'Offer 3', fromBot: false });
  assert.equal(offers.d.fromBot, true);
  const results = resolveResults(assignments, choices, 1, 30, offers);
  assert.deepEqual([results.a.ownPoints, results.b.ownPoints], [7, 3]);
  assert.equal(results.d.fallback, true);
  assert.equal(results.c, undefined);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'respond', gameId: 30 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' }, d: { alias: 'D' } }, assignments, choices, offers }, true);
  assert.equal(finished.config.phase, 'finished');
  assert.equal(finished.offers, null);
  assert.deepEqual(finished.config.summaries[1].outcomes, [{ label: 'Accepted', count: 1 }, { label: 'Rejected', count: 0 }]);
  assert.equal(finished.results.b[1].ownPoints, 3);
});

test('Ultimatum Bargaining follows curriculum rules for both roles and reports', () => {
  const game = LIVE_GAMES.find(item => item.id === 16);
  assert.equal(game.title, 'Ultimatum Bargaining');
  assert.equal(randomChoice(16).startsWith('Offer '), true);
  assert.deepEqual(pointsFor(16, 'Offer 2.5', 'Accept', 'first'), [7.5, 2.5]);
  assert.deepEqual(pointsFor(16, 'Reject', 'Offer 2.5', 'second'), [0, 0]);
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
  };
  const choices = { a: { round: 1, choice: 'Offer 2.5' }, b: { round: 1, choice: 'Accept' } };
  const offers = prepareUltimatumResponses(assignments, choices, 1);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'respond', gameId: 16 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' } }, assignments, choices, offers }, true);
  assert.deepEqual([finished.results.a[1].ownPoints, finished.results.b[1].ownPoints], [7.5, 2.5]);
  assert.deepEqual(finished.config.summaries[1].outcomes, [{ label: 'Accepted', count: 1 }, { label: 'Rejected', count: 0 }]);
});

const cases = [
  [1, [[2, 2], [0, 3], [3, 0], [1, 1]]],
  [13, [[10, 10], [0, 4], [4, 0], [4, 4]]],
  [15, [[3, 3], [0, 6], [6, 0], [-10, -10]]],
  [17, [[2, 0], [0, 2], [0, 2], [2, 0]]],
  [18, [[3, 2], [0, 0], [0, 0], [2, 3]]],
];

test('two-choice live games use their published payoff matrices for both roles', () => {
  for (const [gameId, expected] of cases) {
    const [first, second] = LIVE_GAMES.find(game => game.id === gameId).options;
    const moves = [[first, first], [first, second], [second, first], [second, second]];
    moves.forEach(([own, other], index) => {
      assert.deepEqual(pointsFor(gameId, own, other, 'first'), expected[index]);
      const reverse = pointsFor(gameId, other, own, 'second');
      assert.deepEqual(reverse, [expected[index][1], expected[index][0]]);
    });
  }
});

test('Promotion Timing scores clashes and different days across a live round', () => {
  assert.deepEqual(LIVE_GAMES.find(game => game.id === 4).options, ['Monday', 'Wednesday', 'Friday']);
  for (const own of ['Monday', 'Wednesday', 'Friday']) {
    for (const other of ['Monday', 'Wednesday', 'Friday'])
      assert.deepEqual(pointsFor(4, own, other), own === other ? [0, 0] : [1, 1]);
  }
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D', role: 'first' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C', role: 'second' },
  };
  const choices = { a: { round: 1, choice: 'Monday' }, b: { round: 1, choice: 'Monday' },
    c: { round: 1, choice: 'Wednesday' }, d: { round: 1, choice: 'Friday' } };
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 4 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' }, d: { alias: 'D' } }, assignments, choices }, true);
  assert.equal(finished.config.phase, 'finished');
  assert.deepEqual(Object.values(finished.archive[1].results).map(item => item.ownPoints), [0, 0, 1, 1]);
  assert.deepEqual(finished.config.summaries[1].outcomes, [
    { label: 'Same day clash', count: 1 }, { label: 'Different days', count: 1 },
  ]);
});

test('Colonel Blotto deployments score, pair, and summarize using Solo Lab rules', () => {
  assert.deepEqual(LIVE_GAMES.find(game => game.id === 23).options, BLOTTO_DEPLOYMENTS);
  for (const own of BLOTTO_DEPLOYMENTS) {
    assert.equal(blottoAllocation(own).reduce((sum, troops) => sum + troops, 0), 100);
    for (const other of BLOTTO_DEPLOYMENTS) {
      const [ownScore, otherScore] = pointsFor(23, own, other);
      assert.equal(ownScore + otherScore, 0);
      assert.deepEqual(pointsFor(23, other, own), [otherScore, ownScore]);
    }
  }
  assert.equal(blottoAllocation('Deploy 1/1/98'), null);
  assert.throws(() => pointsFor(23, 'Deploy 1/1/98', BLOTTO_DEPLOYMENTS[0]), /Invalid Colonel Blotto/);
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D', role: 'first' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C', role: 'second' },
  };
  const choices = { a: { round: 1, choice: 'Deploy 34/33/33' }, b: { round: 1, choice: 'Deploy 50/50/0' },
    c: { round: 1, choice: 'Deploy 50/50/0' }, d: { round: 1, choice: 'Deploy 50/0/50' } };
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 23 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' }, d: { alias: 'D' } }, assignments, choices }, true);
  assert.deepEqual(['a', 'b', 'c', 'd'].map(uid => finished.archive[1].results[uid].ownPoints), [-1, 1, 0, 0]);
  assert.deepEqual(finished.config.summaries[1].outcomes, [
    { label: 'One student wins', count: 1 }, { label: 'Tie', count: 1 },
  ]);
  assert.equal(finished.config.summaries[1].choiceCounts.find(item => item.label === 'Deploy 50/50/0').count, 2);
  const botResult = resolveResults({ solo: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' } },
    { solo: { round: 1, choice: BLOTTO_DEPLOYMENTS[0] } }, 1, 23).solo;
  assert.equal(BLOTTO_DEPLOYMENTS.includes(botResult.opponentChoice), true);
  assert.equal(botResult.ownPoints + botResult.opponentPoints, 0);
});

test('Rock–Paper–Scissors scores every move and the bot can choose all three', () => {
  const moves = ['Rock', 'Paper', 'Scissors'];
  const expected = [
    [[1, 1], [0, 2], [2, 0]],
    [[2, 0], [1, 1], [0, 2]],
    [[0, 2], [2, 0], [1, 1]],
  ];
  assert.deepEqual(LIVE_GAMES.find(game => game.id === 29).options, moves);
  moves.forEach((own, i) => moves.forEach((other, j) => {
    assert.deepEqual(pointsFor(29, own, other), expected[i][j]);
    assert.deepEqual(pointsFor(29, other, own), [...expected[i][j]].reverse());
  }));
  const originalRandom = Math.random;
  try {
    assert.deepEqual([0, 0.34, 0.67].map(value => {
      Math.random = () => value;
      return randomChoice(29);
    }), moves);
  } finally {
    Math.random = originalRandom;
  }
});

test('Rock–Paper–Scissors round results count each pair outcome once', () => {
  const pairs = [['a', 'b', 'Rock', 'Rock'], ['c', 'd', 'Rock', 'Scissors'], ['e', 'f', 'Paper', 'Rock'], ['g', 'h', 'Scissors', 'Paper']];
  const assignments = {};
  const choices = {};
  for (const [first, second, firstChoice, secondChoice] of pairs) {
    assignments[first] = { round: 1, kind: 'student', opponentUid: second, opponentAlias: second, role: 'first' };
    assignments[second] = { round: 1, kind: 'student', opponentUid: first, opponentAlias: first, role: 'second' };
    choices[first] = { round: 1, choice: firstChoice };
    choices[second] = { round: 1, choice: secondChoice };
  }
  const results = resolveResults(assignments, choices, 1, 29);
  const summary = summarizeRound(assignments, choices, results, 1, 29);
  assert.deepEqual(summary.choiceCounts, [{ label: 'Rock', count: 4 }, { label: 'Paper', count: 2 }, { label: 'Scissors', count: 2 }]);
  assert.deepEqual(summary.outcomes, [
    { label: 'Tie', count: 1 },
    { label: 'Rock beats Scissors', count: 1 },
    { label: 'Paper beats Rock', count: 1 },
    { label: 'Scissors beats Paper', count: 1 },
  ]);
  assert.equal(summary.studentPairs, 4);
  assert.equal(summary.averagePoints, 1);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 29 },
    participants: Object.fromEntries(Object.keys(assignments).map(uid => [uid, { alias: uid }])), assignments, choices }, false);
  assert.equal(finished.config.phase, 'finished');
  assert.equal(finished.config.summaries[1].outcomes.length, 4);
  assert.equal(finished.results.c[1].ownPoints, 2);
});

test('random bot chooses only options in the selected game', () => {
  for (const game of LIVE_GAMES) {
    for (let i = 0; i < 20; i++) assert.ok(game.options.includes(randomChoice(game.id)));
  }
});

test('Renewable Fishery matches the Solo Lab fleet profit bands and reports stock health', () => {
  assert.equal(trawlerAmount('Trawlers 10'), 10);
  assert.equal(trawlerAmount('Trawlers 11'), null);
  assert.deepEqual(fisheryPoints(4, 4), [8, 8]);
  assert.deepEqual(fisheryPoints(5, 5), [4.5, 4.5]);
  assert.deepEqual(fisheryPoints(7, 7), [-3.5, -3.5]);
  assert.throws(() => pointsFor(27, 'Trawlers 11', 'Trawlers 3'));
  const assignments = { a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' } };
  const choices = { a: { round: 1, choice: 'Trawlers 7' }, b: { round: 1, choice: 'Trawlers 7' } };
  const results = resolveResults(assignments, choices, 1, 27);
  assert.equal(results.a.ownPoints, -3.5);
  assert.equal(results.b.opponentKind, 'student');
  const summary = summarizeRound(assignments, choices, results, 1, 27);
  assert.equal(summary.studentPairs, 1);
  assert.equal(summary.outcomes[2].count, 1);
});

test('Public Goods uses four-player groups and the Solo Lab scoring rule', () => {
  const participants = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`student-${i}`, { alias: `Student ${i}` }]));
  const assignments = groupParticipants(participants, 2);
  assert.equal(Object.keys(assignments).length, 9);
  const sizes = Object.values(assignments).reduce((map, item) => map.set(item.groupId, item.groupSize), new Map());
  assert.deepEqual([...sizes.values()].sort(), [1, 4, 4]);
  assert.ok(Object.values(assignments).every(item => item.kind === 'group' && item.round === 2));
  assert.equal(contributionAmount('Contribute 10'), 10);
  assert.equal(contributionAmount('Contribute 10.5'), null);
  assert.equal(publicGoodsPoints(5, 25), 15);
  assert.throws(() => pointsFor(12, 'Contribute 5', 'Contribute 10'));

  const group = Object.fromEntries(['a', 'b', 'c', 'd'].map(uid => [uid,
    { round: 1, kind: 'group', groupId: 'one', groupSize: 4, opponentAlias: 'Public goods group', role: 'first' }]));
  const choices = Object.fromEntries(['a', 'b', 'c', 'd'].map((uid, index) => [uid,
    { round: 1, choice: `Contribute ${[0, 5, 10, 10][index]}` }]));
  const results = resolveResults(group, choices, 1, 12);
  assert.deepEqual(['a', 'b', 'c', 'd'].map(uid => results[uid].ownPoints), [20, 15, 10, 10]);
  assert.ok(Object.values(results).every(item => item.group.totalContribution === 25 && item.group.bots === 0));
  const summary = summarizeRound(group, choices, results, 1, 12);
  assert.deepEqual([summary.studentGroups, summary.botSeats, summary.averageContribution, summary.averagePool], [1, 0, 6.25, 25]);
  assert.deepEqual(summary.outcomes.map(item => item.count), [0, 0, 1, 0]);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 12 },
    participants: Object.fromEntries(Object.keys(group).map(uid => [uid, { alias: uid }])), assignments: group, choices }, true);
  assert.equal(finished.config.phase, 'finished');
  assert.equal(finished.results.a[1].group.totalContribution, 25);
});

test('Public Goods fills partial, late, and missing-player seats with shared bot contributions', () => {
  const assignments = {
    a: { round: 1, kind: 'group', groupId: 'one', groupSize: 3 },
    b: { round: 1, kind: 'group', groupId: 'one', groupSize: 3 },
    c: { round: 1, kind: 'group', groupId: 'one', groupSize: 3 },
    late: { round: 1, kind: 'group', groupId: 'late', groupSize: 1 },
  };
  const choices = { a: { round: 1, choice: 'Contribute 4' }, b: { round: 1, choice: 'Contribute 6' },
    late: { round: 1, choice: 'Contribute 10' } };
  const originalRandom = Math.random;
  let results;
  try {
    Math.random = () => 0;
    results = resolveResults(assignments, choices, 1, 12);
  } finally {
    Math.random = originalRandom;
  }
  assert.deepEqual([results.a.ownPoints, results.b.ownPoints, results.late.ownPoints], [10, 8, 4]);
  assert.equal(results.a.group.totalContribution, results.b.group.totalContribution);
  assert.deepEqual([results.a.group.bots, results.a.group.missing, results.late.group.bots], [2, 1, 3]);
  assert.equal(results.a.fallback, true);
  assert.equal(results.late.fallback, false);
  const summary = summarizeRound(assignments, choices, results, 1, 12);
  assert.deepEqual([summary.studentGroups, summary.botSeats, summary.fallbacks], [2, 5, 1]);
});

test('odd student gets bot; human pair roles and aliases are reciprocal', () => {
  const participants = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`student-${i}`, { alias: `Student ${i}` }]));
  const assignments = pairParticipants(participants, 2);
  assert.equal(Object.keys(assignments).length, 9);
  assert.equal(Object.values(assignments).filter(item => item.kind === 'bot').length, 1);
  for (const [uid, assignment] of Object.entries(assignments)) {
    assert.equal(assignment.round, 2);
    if (assignment.kind === 'bot') {
      assert.equal(assignment.role, 'first');
    } else {
      const other = assignments[assignment.opponentUid];
      assert.equal(other.opponentUid, uid);
      assert.equal(assignment.opponentAlias, participants[assignment.opponentUid].alias);
      assert.notEqual(assignment.role, other.role);
    }
  }
});

test('reveal gives reciprocal results and substitutes a bot for a missing partner', () => {
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' },
  };
  const results = resolveResults(assignments, {
    a: { round: 1, choice: 'Opera' },
    b: { round: 1, choice: 'Opera' },
    c: { round: 1, choice: 'Football' },
  }, 1, 18);
  assert.deepEqual([results.a.ownPoints, results.a.opponentPoints], [3, 2]);
  assert.deepEqual([results.b.ownPoints, results.b.opponentPoints], [2, 3]);
  assert.equal(results.c.opponentKind, 'bot');
  assert.equal(results.c.fallback, false);

  const fallback = resolveResults(assignments, { a: { round: 1, choice: 'Opera' } }, 1, 18);
  assert.equal(fallback.a.fallback, true);
  assert.equal(fallback.a.opponentAlias, 'Random bot');
  assert.equal(fallback.b, undefined);
});

test('submission progress waits for every joined student, including a late arrival', () => {
  const participants = { a: { alias: 'A' }, b: { alias: 'B' } };
  const assignments = { a: { round: 2, kind: 'bot', opponentAlias: 'Random bot' } };
  const choices = { a: { round: 2, choice: 'Cooperate' } };
  assert.deepEqual(submissionProgress(participants, assignments, choices, 2), { joined: 2, submitted: 1, allSubmitted: false });
  assignments.b = { round: 2, kind: 'bot', opponentAlias: 'Random bot' };
  choices.b = { round: 2, choice: 'Defect' };
  assert.deepEqual(submissionProgress(participants, assignments, choices, 2), { joined: 2, submitted: 2, allSubmitted: true });
  assert.equal(submissionProgress(participants, assignments, choices, 3).allSubmitted, false);
});

test('post-reveal summary counts student pairs once and separates bot fallbacks', () => {
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C' },
    e: { round: 1, kind: 'bot', opponentAlias: 'Random bot' },
  };
  const choices = Object.fromEntries(['a', 'b', 'c', 'e'].map(uid => [uid, { round: 1, choice: uid === 'c' ? 'Defect' : 'Cooperate' }]));
  const results = {
    a: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false },
    b: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false },
    c: { round: 1, ownChoice: 'Defect', ownPoints: 3, opponentKind: 'bot', fallback: true },
    e: { round: 1, ownChoice: 'Cooperate', ownPoints: 0, opponentKind: 'bot', fallback: false },
  };
  const summary = summarizeRound(assignments, choices, results, 1, 1);
  assert.deepEqual(summary.choiceCounts, [{ label: 'Cooperate', count: 3 }, { label: 'Defect', count: 1 }]);
  assert.deepEqual(summary.outcomes, [{ label: 'Both cooperate', count: 1 }, { label: 'Both defect', count: 0 }, { label: 'Different choices', count: 0 }]);
  assert.equal(summary.studentPairs, 1);
  assert.equal(summary.botMatches, 2);
  assert.equal(summary.fallbacks, 1);
  assert.equal(summary.averagePoints, 1.75);

  const pennies = summarizeRound(assignments, { a: { round: 1, choice: 'Heads' }, b: { round: 1, choice: 'Tails' } },
    { a: { round: 1, ownChoice: 'Heads', ownPoints: 0, opponentKind: 'student' }, b: { round: 1, ownChoice: 'Tails', ownPoints: 2, opponentKind: 'student' } }, 1, 17);
  assert.deepEqual(pennies.outcomes, [{ label: 'Matching choices', count: 0 }, { label: 'Different choices', count: 1 }]);
});

test('hidden rounds stay private until the final round publishes every result', () => {
  const students = { a: { alias: 'A' }, b: { alias: 'B' } };
  const first = {
    config: { round: 1, totalRounds: 2, phase: 'playing', gameId: 1 },
    participants: students,
    assignments: {
      a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
      b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    },
    choices: { a: { round: 1, choice: 'Cooperate' }, b: { round: 1, choice: 'Defect' } },
  };
  const hidden = finishRound(first, false);
  assert.equal(hidden.config.phase, 'lobby');
  assert.equal(hidden.config.round, 2);
  assert.equal(hidden.config.summaries[1], undefined);
  assert.equal(hidden.results.a, undefined);
  assert.equal(hidden.archive[1].summary.submitted, 2);
  assert.equal(hidden.assignments, null);
  assert.equal(hidden.choices, null);

  const second = finishRound({ ...hidden,
    config: { ...hidden.config, phase: 'playing', gameId: 13 },
    assignments: {
      a: { round: 2, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
      b: { round: 2, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    },
    choices: { a: { round: 2, choice: 'Hunt Stag' }, b: { round: 2, choice: 'Hunt Stag' } },
  }, false);
  assert.equal(second.config.phase, 'finished');
  assert.deepEqual(Object.keys(second.config.summaries).sort(), ['1', '2']);
  assert.deepEqual(Object.keys(second.results.a).sort(), ['1', '2']);
  assert.equal(second.results.a[1].ownPoints, 0);
  assert.equal(second.results.a[2].ownPoints, 10);
  assert.equal(second.archive[1].aliases.a, 'A');
});

test('a revealed round publishes only that round before class completion', () => {
  const room = {
    config: { round: 1, totalRounds: 3, phase: 'playing', gameId: 17 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' } },
    assignments: {
      a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
      b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    },
    choices: { a: { round: 1, choice: 'Heads' }, b: { round: 1, choice: 'Tails' } },
  };
  const revealed = finishRound(room, true);
  assert.equal(revealed.config.phase, 'revealed');
  assert.equal(revealed.config.round, 1);
  assert.equal(revealed.config.summaries[1].outcomes[1].count, 1);
  assert.equal(revealed.results.a[1].ownPoints, 0);
  assert.equal(revealed.results.b[1].ownPoints, 2);
  assert.equal(finishRound(revealed, true), null);
  assert.equal(finishRound({ ...room, config: { round: 1, phase: 'playing', gameId: 17 } }, true), null);
});

test('final analysis groups games and weights scores by submitted results', () => {
  const rounds = [
    { gameId: 1, submitted: 2, studentPairs: 1, botMatches: 0, scoredStudents: 2, totalPoints: 4, choiceCounts: [{ label: 'Cooperate', count: 2 }, { label: 'Defect', count: 0 }] },
    { gameId: 1, submitted: 1, studentPairs: 0, botMatches: 1, scoredStudents: 1, totalPoints: 3, choiceCounts: [{ label: 'Cooperate', count: 0 }, { label: 'Defect', count: 1 }] },
    { gameId: 13, submitted: 2, studentPairs: 1, botMatches: 0, scoredStudents: 2, totalPoints: 20, choiceCounts: [{ label: 'Hunt Stag', count: 2 }, { label: 'Hunt Hare', count: 0 }] },
  ];
  const total = summarizeClass(rounds);
  assert.deepEqual([total.rounds, total.submitted, total.studentPairs, total.botMatches], [3, 5, 2, 1]);
  assert.deepEqual(total.byGame.map(item => [item.gameId, item.averagePoints]), [[1, 7 / 3], [13, 10]]);
  assert.deepEqual(total.byGame[0].choiceCounts, [{ label: 'Cooperate', count: 2 }, { label: 'Defect', count: 1 }]);
});

test('personal analysis keeps game scores separate and includes missed rounds', () => {
  const summaries = [
    { round: 1, gameId: 1 },
    { round: 2, gameId: 1 },
    { round: 3, gameId: 15 },
    { round: 4, gameId: 15 },
  ];
  const analysis = summarizePerson(summaries, {
    1: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false },
    2: { round: 2, ownChoice: 'Defect', ownPoints: 3, opponentKind: 'bot', fallback: true },
    3: { round: 3, ownChoice: 'Hawk', ownPoints: -10, opponentKind: 'student', fallback: false },
  });
  assert.deepEqual([analysis.played, analysis.studentMatches, analysis.botMatches, analysis.fallbacks], [3, 2, 1, 1]);
  assert.equal(analysis.rounds[3].result, null);
  assert.deepEqual(analysis.byGame.map(item => [item.gameId, item.played, item.averagePoints]), [[1, 2, 2.5], [15, 1, -10]]);
  assert.deepEqual(analysis.byGame[0].choices.map(item => [item.label, item.count, item.averagePoints]), [['Cooperate', 1, 2], ['Defect', 1, 3]]);
  assert.deepEqual(analysis.byGame[1].choices.map(item => [item.label, item.count, item.averagePoints]), [['Dove', 0, null], ['Hawk', 1, -10]]);
});

test('instructor analysis joins students across rounds by uid even when aliases change', () => {
  const summaries = [{ round: 1, gameId: 1 }, { round: 2, gameId: 13 }];
  const archives = {
    1: {
      aliases: { a: 'Fox', b: 'Bee' },
      results: { a: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false } },
    },
    2: {
      aliases: { a: 'Otter', c: 'Cat' },
      results: { a: { round: 2, ownChoice: 'Hunt Stag', ownPoints: 10, opponentKind: 'bot', fallback: false } },
    },
  };
  const people = summarizePeople(summaries, archives);
  assert.deepEqual(people.map(item => [item.alias, item.analysis.played]), [['Bee', 0], ['Cat', 0], ['Otter', 2]]);
  assert.deepEqual(people.find(item => item.uid === 'a').analysis.rounds.map(item => item.result?.ownPoints), [2, 10]);
});

test('a round with no choices can be skipped and does not break final release', () => {
  const empty = finishRound({
    config: { round: 1, totalRounds: 2, phase: 'playing', gameId: 1 },
    participants: { a: { alias: 'A' } },
    assignments: { a: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' } },
  }, false);
  assert.equal(empty.archive[1].summary.averagePoints, null);
  const saved = { ...empty.archive[1] };
  delete saved.results; // Empty objects are omitted when Firebase reads the archive back.
  const done = finishRound({
    ...empty,
    archive: { 1: saved },
    config: { ...empty.config, phase: 'playing' },
    assignments: { a: { round: 2, kind: 'bot', opponentAlias: 'Random bot', role: 'first' } },
    choices: { a: { round: 2, choice: 'Defect' } },
  }, true);
  assert.equal(done.config.phase, 'finished');
  assert.equal(done.config.summaries[1].submitted, 0);
  assert.equal(done.results.a[2].round, 2);
});

test('students can generate a short emoji alias and change its icon before joining', () => {
  for (let i = 0; i < 100; i++) {
    const alias = randomStudentAlias();
    const originalIcon = ALIAS_ICONS.find(icon => alias.startsWith(`${icon} `));
    assert.ok(originalIcon);
    assert.ok(alias.length <= 30);
    assert.match(alias, /^\S+ [A-Za-z]+[1-9][0-9]{2}$/);
    const changed = shuffleAliasIcon(alias);
    assert.ok(changed.length <= 30);
    assert.notEqual(changed.split(' ')[0], originalIcon);
    assert.equal(changed.slice(changed.indexOf(' ') + 1), alias.slice(alias.indexOf(' ') + 1));
  }
  assert.ok(shuffleAliasIcon('A'.repeat(30)).length <= 30);
});
