/**
 * Client for the free ExerciseDB v1 API, now run by AscendAPI
 * (https://oss.exercisedb.dev).
 *
 * No key is needed and it sends CORS headers, so it also works on web. It
 * throttles bursts (429 with `Retry-After`), so searches still run on submit,
 * more catalog pages load only on request, and every response is cached in
 * memory for the session.
 *
 * Names and muscles come in English only, and there is no MET: it is estimated
 * from the name (see `estimateMet`).
 */
import type { Exercise, ExerciseCategory } from './exercises';

const BASE_URL = 'https://oss.exercisedb.dev/api/v1';

type ApiExercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  /** e.g. `["cardio"]`, `["upper legs"]`. */
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
};

type ApiList<T> = {
  data: T[];
  meta: { total: number; hasNextPage: boolean; nextCursor?: string };
};

export class ExerciseDBError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ExerciseDBError';
  }
}

/** Largest page the API returns. */
const PAGE_SIZE = 25;

const exerciseCache = new Map<string, Exercise>();
const searchCache = new Map<string, Promise<Exercise[]>>();
const listCache = new Map<string, Promise<ExercisePage>>();

/** `nextCursor` is passed back to `listExercises` for the following page. */
export type ExercisePage = { exercises: Exercise[]; nextCursor?: string };

/**
 * One page of the catalog for a diary section, starting after `cursor`.
 * Cardio filters by the `cardio` body part; strength lists everything and
 * drops the cardio ones.
 */
export function listExercises(category: ExerciseCategory, cursor?: string): Promise<ExercisePage> {
  const key = `${category}:${cursor ?? ''}`;
  const cached = listCache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (category === 'cardio') params.set('bodyParts', 'cardio');
  if (cursor) params.set('after', cursor);
  const request = fetchJson<ApiList<ApiExercise>>(`/exercises?${params}`).then(({ data, meta }) => ({
    exercises: cacheExercises(data).filter((exercise) => exercise.category === category),
    nextCursor: meta.hasNextPage ? meta.nextCursor : undefined,
  }));
  request.catch(() => listCache.delete(key));
  listCache.set(key, request);
  return request;
}

function cacheExercises(data: ApiExercise[]) {
  const exercises = data.map(toExercise);
  exercises.forEach((exercise) => exerciseCache.set(exercise.id, exercise));
  return exercises;
}

/** Exercise previously returned by a list or search, if any. */
export function getCachedExercise(id: string) {
  return exerciseCache.get(id);
}

/**
 * Searches exercises of a diary section by name. The API only matches English
 * words, so common Portuguese terms are translated. It matches any of the
 * words, so results with the most of them come first.
 */
export function searchExercises(query: string, category: ExerciseCategory): Promise<Exercise[]> {
  const q = translateQuery(query);
  const key = `${category}:${q}`;
  const cached = searchCache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({ name: q, limit: String(PAGE_SIZE) });
  if (category === 'cardio') params.set('bodyParts', 'cardio');
  const words = q.split(' ');
  const score = (exercise: Exercise) => {
    const name = exercise.name.toLowerCase();
    return words.filter((word) => name.includes(word)).length;
  };
  const request = fetchJson<ApiList<ApiExercise>>(`/exercises?${params}`).then(({ data }) =>
    cacheExercises(data)
      .filter((exercise) => exercise.category === category)
      .sort((a, b) => score(b) - score(a)),
  );
  // Failed requests are not cached, so the user can retry.
  request.catch(() => searchCache.delete(key));
  searchCache.set(key, request);
  return request;
}

async function fetchJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new ExerciseDBError('Sem conexão com a ExerciseDB.');
  }

  if (response.status === 429) {
    throw new ExerciseDBError('Muitas buscas seguidas na ExerciseDB. Aguarde alguns segundos.', 429);
  }
  if (!response.ok) {
    throw new ExerciseDBError(`Erro da ExerciseDB (${response.status}).`, response.status);
  }
  return response.json();
}

function toExercise(api: ApiExercise): Exercise {
  const category: ExerciseCategory = api.bodyParts.includes('cardio') ? 'cardio' : 'strength';
  // Some names come in lowercase, others in Title Case.
  const name = api.name.charAt(0).toUpperCase() + api.name.slice(1);
  return {
    id: api.exerciseId,
    name,
    category,
    met: estimateMet(api.name, category),
    target: api.targetMuscles[0],
    equipment: api.equipments[0],
    gifUrl: api.gifUrl,
  };
}

/**
 * Approximate MET by activity, from the Compendium of Physical Activities.
 * First match wins, so specific terms come before generic ones.
 */
const CARDIO_METS: [RegExp, number][] = [
  [/jump rope|skip/, 11],
  [/stepmill|stair/, 9],
  [/burpee|mountain climber/, 8],
  [/run|sprint/, 8],
  [/jump|jack/, 8],
  [/swim/, 6],
  [/row/, 7],
  [/bike|cycl/, 7],
  [/elliptical/, 5],
  [/walk/, 3.5],
];
const DEFAULT_CARDIO_MET = 7;
/** Resistance training, moderate to vigorous effort. */
const STRENGTH_MET = 5;

function estimateMet(name: string, category: ExerciseCategory) {
  if (category === 'strength') return STRENGTH_MET;
  const lower = name.toLowerCase();
  return CARDIO_METS.find(([pattern]) => pattern.test(lower))?.[1] ?? DEFAULT_CARDIO_MET;
}

/** Portuguese → English search terms, longest first so phrases win. */
const TERMS: [string, string][] = (
  [
    ['levantamento terra', 'deadlift'],
    ['elevacao lateral', 'lateral raise'],
    ['pular corda', 'jump rope'],
    ['barra fixa', 'pull up'],
    ['leg press', 'leg press'],
    ['agachamento', 'squat'],
    ['abdominal', 'crunch'],
    ['afundo', 'lunge'],
    ['avanco', 'lunge'],
    ['bicicleta', 'bike'],
    ['caminhada', 'walk'],
    ['ciclismo', 'bike'],
    ['corrida', 'run'],
    ['desenvolvimento', 'shoulder press'],
    ['eliptico', 'elliptical'],
    ['extensora', 'leg extension'],
    ['flexao', 'push up'],
    ['flexora', 'leg curl'],
    ['natacao', 'swim'],
    ['panturrilha', 'calf'],
    ['polichinelo', 'jumping jack'],
    ['prancha', 'plank'],
    ['puxada', 'pulldown'],
    ['remada', 'row'],
    ['rosca', 'curl'],
    ['supino', 'bench press'],
    ['triceps', 'triceps'],
    ['biceps', 'biceps'],
    ['ombro', 'shoulder'],
    ['peito', 'chest'],
    ['costas', 'back'],
    ['perna', 'leg'],
    ['gluteo', 'glute'],
    ['halter', 'dumbbell'],
    ['barra', 'barbell'],
    ['polia', 'cable'],
    ['maquina', 'machine'],
  ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

function translateQuery(query: string) {
  let q = query
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  for (const [pt, en] of TERMS) {
    q = q.replace(new RegExp(`\\b${pt}\\b`, 'g'), en);
  }
  return q.replace(/\s+/g, ' ');
}
