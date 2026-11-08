# Live classroom setup

The site stays on GitHub Pages and uses the Firebase Spark no-cost plan. The first paired activity is Prisoner's Dilemma in room `DOTE-3090`.

## How the class works

1. Anyone can use **Bot practice** without joining a room. The bot randomly chooses Cooperate or Defect, and the result is private and not recorded.
2. The instructor signs in with the configured Google account and clicks **Start class**. Students enter an alias and click **Join as student**. No student ID is requested.
3. Once students have joined, the instructor clicks **Pair students and start round**. Students are shuffled into pairs. An odd student gets a bot. A student who joins after pairing also gets a bot.
4. Each student locks one choice. The instructor sees how many choices arrived, then clicks **Reveal match results**. If a human partner did not choose, a random bot takes their place for the result.
5. **Start next round** reshuffles the same students. **End class and clear room** removes the room data.

The current published version uses `rooms/DOTE-3090`. The pairing version uses `rooms/DOTE-3090-pairs`. `database.rules.json` includes both rule sets so the current site keeps working while the pairing version is tested and deployed.

## Before merging the pairing version

1. Confirm **Authentication → Sign-in method** has **Google** and **Anonymous** enabled, and **Authentication → Settings → Authorized domains** includes `kochiuyu.github.io`.
2. In **Realtime Database → Rules**, publish the contents of `database.rules.json`. Do not use public test rules.
3. Test the pairing version with separate instructor and student browsers. Check an even pair, an odd bot match, a late student, a missing partner, a locked choice, a revealed result, a second round, and room cleanup.

The instructor's **End class and clear room** action removes classroom data. Firebase still creates anonymous Authentication accounts for students; those accounts are separate from room data and can be removed in Firebase Console if desired.

The Firebase web configuration in `src/firebase.ts` is public project identification, not a password. Access is controlled by the published database rules. Never put a Firebase service-account private key in this repository.

