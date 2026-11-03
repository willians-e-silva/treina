# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Supabase

The database lives in [`supabase/`](supabase/): versioned migrations in `migrations/`, the
trainer catalog in `seed.sql` and Row Level Security checks in `tests/rls.sql`.

1. Copy `.env.example` to `.env.local` and fill in `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API Keys). Only the publishable
   key goes in the app; the service role key bypasses RLS and must never be used here.
2. Log in and link the project once:

   ```bash
   npx supabase@latest login
   npx supabase@latest link --project-ref <project-ref>
   ```

3. Apply the migrations and the catalog:

   ```bash
   npx supabase@latest db push --remote --include-seed
   ```

4. Check the policies. The script creates two throwaway accounts inside a transaction that is
   rolled back, and stops at the first `FAIL: …`:

   ```bash
   npx supabase@latest db query --remote --file supabase/tests/rls.sql
   ```

   It checks that each account reads and writes only its own rows, cannot write rows in another
   account's name or attach rows to another account's workout, cannot send chat messages as the
   trainer or change the catalog, and that signed out only the catalog is readable.

5. Regenerate the app's types after changing the schema:

   ```bash
   npx supabase@latest gen types --remote > src/data/database.types.ts
   ```

To change the catalog, edit `src/lib/trainers.ts` and run `npx tsx scripts/generate-seed.ts`.

### Data

With `EXPO_PUBLIC_DATA_SOURCE=supabase` the app reads and writes the account's data through the
repositories in `src/data/supabase/` (one per domain, typed by `src/data/database.types.ts`).
Changes show at once and are saved in the background, in order; when a save fails (e.g. no
connection), a banner offers "Tentar novamente" and nothing on screen is lost.

`scripts/check-supabase-repos.ts` checks those repositories against the project: it saves one
change of each kind as a test account, reads it all back from a second sign-in (like another
device) and undoes what it can. Use an account made only for this:

```bash
set -a; . ./.env.local; set +a
TREINA_TEST_EMAIL=… TREINA_TEST_PASSWORD=…   npx tsx --tsconfig scripts/check/tsconfig.json scripts/check-supabase-repos.ts
```

### Auth

The app signs in with Supabase Auth (`src/context/session.tsx`); the session is kept on the device
with `expo-sqlite/localStorage`, so it needs a development build. Confirming an account and
resetting the password use Supabase's default emails: their link opens the app
(`treina://auth/callback` and `treina://forgot-password/new-password`), which exchanges its
`code` for a session (PKCE). The link must be opened on the phone that asked for it. Those
addresses must be allowed in `auth.additional_redirect_urls`; apply it (and any other change to
`supabase/config.toml`) with:

```bash
npx supabase@latest config diff   # check that only what you meant to change differs
npx supabase@latest config push
```

Custom email templates need your own SMTP provider on the free plan.
Supabase's built-in email service only delivers to the project team's addresses, a few times
per hour. Set up your own SMTP (Authentication → Emails → SMTP Settings) before other people
sign up. Signing in with Google also needs the Google provider enabled in the dashboard with
the app's client IDs.

## Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
