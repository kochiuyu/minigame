# Live classroom setup

The site stays on GitHub Pages and uses Firebase Realtime Database on the Spark plan. The instructor selects one of five live games: Prisoner's Dilemma, Stag Hunt, Hawk–Dove, Matching Pennies, or Battle of the Sexes.

## How the class works

1. Anyone can practice against a random bot without joining a room. Practice is private and is not recorded.
2. The instructor signs in with the configured Google account, selects a game and a total of 1–20 rounds, and starts a class. Students can type an alias or generate a fun alias with a random emoji icon before joining anonymously. The alias and icon are stored together as one short nickname.
3. The instructor can change the game while students are waiting in the lobby. Pairing locks the game for that round. Students are shuffled into pairs; an odd or late student gets a random bot.
4. Matching Pennies gives one student the Matcher role and the other the Mismatcher role. Battle of the Sexes assigns Opera fan and Football fan roles. Students see their role and the payoffs before choosing.
5. Students lock one choice. During play, the instructor sees joined aliases and who has submitted, but not the choices. When all joined students have submitted, the dashboard prompts the instructor to end the round. A random bot replaces a missing partner if the instructor ends a round early.
6. For each non-final round, the instructor can reveal a chart and tables to the class or continue without revealing. Revealed rounds remain available in an "Earlier revealed rounds" section. Skipped round results remain private until the class ends.
7. At the end of the final round, the site publishes a class report to the instructor and students, even for rounds skipped earlier. It shows an all-round participation chart, aggregate choice charts by game, results tables by game and round, and per-round choice charts and pair outcomes. Each student sees their own all-round analysis, including points by round, choices and average scores within each game, and every personal result. The instructor can expand the same analysis for each student alias. Scores are averaged within each game because payoff scales differ.
8. The next round reshuffles the same students and returns to the lobby, where the instructor can select a different game. Ending the class clears the room data and the report. Classes started before round limits were added keep their earlier flow and cannot recover prior rounds.

The live classroom uses `rooms/DOTE-3090-pairs`. Round archives stay under instructor-only room data. Only released summaries in `config/summaries` and each student's released results under `results/{uid}` are readable by students. The earlier `rooms/DOTE-3090` rules remain for compatibility.

## Firebase configuration

1. In **Authentication → Sign-in method**, enable **Google** and **Anonymous**. In **Authentication → Settings → Authorized domains**, include `kochiuyu.github.io`.
2. In **Realtime Database → Rules**, publish the contents of `database.rules.json`. The rules allow only choices for the selected game and keep each student's assignment, choice, and result private.
3. Test an even pair, an odd bot match, a late student, a missing partner, both role assignments in the asymmetric games, a hidden round, a revealed round, final release, and room cleanup.

Ending a class removes classroom data. Firebase may retain anonymous Authentication accounts separately; remove those in Firebase Console if needed.

The Firebase web configuration in `src/firebase.ts` is public project identification. Access is controlled by the published database rules. Never put a Firebase service-account private key in this repository.
