# Live classroom setup

The website stays on GitHub Pages. Student and instructor browsers connect directly to Firebase Realtime Database. The first live activity is a single shared Prisoner's Dilemma room (`DOTE-3090`). It stores only aliases and choices until the instructor ends the class.

Before merging the live-room change:

1. In Firebase Console, confirm **Authentication → Sign-in method** has **Google** and **Anonymous** enabled.
2. Under **Authentication → Settings → Authorized domains**, add `kochiuyu.github.io`.
3. In **Realtime Database → Rules**, replace the locked starter rules with the contents of `database.rules.json`, then click **Publish**. Do not use public test rules. The rules grant instructor controls only to the configured, verified Google account; students can write only their own one-time choice for an open round.
4. Open the published site in two separate browser profiles. Sign in as instructor in one, start a class, then join as an anonymous student in the other. Lock a choice, reveal totals, start another round, and end the class. Confirm the room disappears after ending.

The instructor's **End class and clear room** action removes the classroom data. Firebase still creates anonymous Authentication accounts for students; those accounts are separate from the room data and can be removed in the Firebase Console if desired.

The Firebase web configuration in `src/firebase.ts` is public project identification, not a password. Access is controlled by the published database rules. Never put a Firebase service-account private key in the repository.

