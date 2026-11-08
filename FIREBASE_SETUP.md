# Live classroom setup

The site stays on GitHub Pages and uses Firebase Realtime Database on the Spark plan. The instructor selects one of five live games: Prisoner's Dilemma, Stag Hunt, Hawk–Dove, Matching Pennies, or Battle of the Sexes.

## How the class works

1. Anyone can practice against a random bot without joining a room. Practice is private and is not recorded.
2. The instructor signs in with the configured Google account, selects a game, and starts a class. Students enter an alias and join anonymously.
3. The instructor can change the game while students are waiting in the lobby. Pairing locks the game for that round. Students are shuffled into pairs; an odd or late student gets a random bot.
4. Matching Pennies gives one student the Matcher role and the other the Mismatcher role. Battle of the Sexes assigns Opera fan and Football fan roles. Students see their role and the payoffs before choosing.
5. Students lock one choice. During play, the instructor sees joined aliases and who has submitted, but not the choices. When all joined students have submitted, the dashboard prompts the instructor to reveal results. The instructor can also reveal early if someone cannot submit; a random bot then replaces a missing partner.
6. After reveal, the instructor sees choice counts, completed student-pair outcomes, bot matches, and the average student score. Students can read their private results. The instructor then starts the next round, which reshuffles students and returns to the lobby, where a different game can be selected. Ending the class clears the room data.

The live classroom uses `rooms/DOTE-3090-pairs`. The earlier `rooms/DOTE-3090` rules remain for compatibility.

## Firebase configuration

1. In **Authentication → Sign-in method**, enable **Google** and **Anonymous**. In **Authentication → Settings → Authorized domains**, include `kochiuyu.github.io`.
2. In **Realtime Database → Rules**, publish the contents of `database.rules.json`. The rules allow only choices for the selected game and keep each student's assignment, choice, and result private.
3. Test an even pair, an odd bot match, a late student, a missing partner, both role assignments in the asymmetric games, a second game in a new round, and room cleanup.

Ending a class removes classroom data. Firebase may retain anonymous Authentication accounts separately; remove those in Firebase Console if needed.

The Firebase web configuration in `src/firebase.ts` is public project identification. Access is controlled by the published database rules. Never put a Firebase service-account private key in this repository.
