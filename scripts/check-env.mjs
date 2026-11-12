// Fails when a variable the app needs is missing, so a build or OTA update
// never ships without its keys. Reads the process environment (EAS sets it
// from the environment on expo.dev) and, locally, `.env.local` and `.env`.
//
//   npm run check-env
import { existsSync, readFileSync } from 'node:fs';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    // Real environment variables win over the files, like Expo's own loading.
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}

const value = (name) => process.env[name]?.trim() ?? '';
const demo = value('EXPO_PUBLIC_AUTH_MODE') === 'demo';

/** Without these the app cannot sign in or save anything. */
const required = demo
  ? []
  : [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      // Android needs the web client id for Google to return an idToken.
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    ];
/** Missing ones disable a feature, without blocking the app. */
const optional = ['EXPO_PUBLIC_FITEXERCISEDB_API_KEY', 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'];

const missing = required.filter((name) => !value(name));
for (const name of optional.filter((name) => !value(name))) {
  console.warn(`aviso: ${name} não está definida.`);
}

const source = value('EXPO_PUBLIC_DATA_SOURCE');
if (source && source !== 'local' && source !== 'supabase') {
  missing.push(`EXPO_PUBLIC_DATA_SOURCE (valor inválido "${source}"; use local ou supabase)`);
}

if (missing.length > 0) {
  console.error(
    'Faltam variáveis de ambiente obrigatórias:\n' +
      missing.map((name) => `  - ${name}`).join('\n') +
      '\nDefina em .env.local (local) ou no ambiente do EAS em expo.dev (builds e updates).',
  );
  process.exit(1);
}
console.log(demo ? 'Variáveis ok (modo demo).' : 'Variáveis ok.');
