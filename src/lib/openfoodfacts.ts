/**
 * Client for the Open Food Facts search API (search-a-licious,
 * https://search.openfoodfacts.org/docs).
 *
 * No key is needed. Results are limited to products sold in Brazil and
 * names come in Portuguese when available. Values are crowd-sourced, so
 * products without energy or with impossible values per 100 g are dropped.
 * Every response is cached in memory for the session.
 *
 * Error messages do not name the source: the app shows foods from every
 * source as one list.
 */
import type { Food } from './foods';

const BASE_URL = 'https://search.openfoodfacts.org';

/** Open Food Facts asks apps to identify themselves. */
const USER_AGENT = 'Treina/1.0 (Expo app)';

const PAGE_SIZE = 25;

const FIELDS = [
  'code',
  'product_name',
  'brands',
  'serving_quantity',
  'nutriments',
].join(',');

type ApiProduct = {
  code: string;
  product_name?: string;
  brands?: string[];
  /** Grams (or ml) per serving; sometimes sent as a string. */
  serving_quantity?: number | string;
  nutriments?: Partial<
    Record<
      | 'energy-kcal_100g'
      | 'energy-kj_100g'
      | 'carbohydrates_100g'
      | 'proteins_100g'
      | 'fat_100g'
      | 'fiber_100g',
      number
    >
  >;
};

type ApiSearch = { hits: ApiProduct[] };

export class OpenFoodFactsError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'OpenFoodFactsError';
  }
}

const foodCache = new Map<string, Food>();
const searchCache = new Map<string, Promise<Food[]>>();

/** Product previously returned by a search, by barcode. */
export function getCachedOpenFoodFactsFood(code: string) {
  return foodCache.get(code);
}

/** Searches Brazilian products by name or brand. */
export function searchOpenFoodFacts(query: string): Promise<Food[]> {
  // Characters with a meaning in the Lucene query syntax are dropped.
  const terms = query.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, ' ').trim().replace(/\s+/g, ' ');
  const key = terms.toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: `${terms} countries_tags:"en:brazil"`,
    langs: 'pt',
    page_size: String(PAGE_SIZE),
    fields: FIELDS,
  });
  const request = fetchJson<ApiSearch>(`/search?${params}`).then(({ hits }) =>
    hits.flatMap((product) => {
      const food = toFood(product);
      if (food) foodCache.set(food.id.slice('off:'.length), food);
      return food ? [food] : [];
    }),
  );
  // Failed requests are not cached, so the user can retry.
  request.catch(() => searchCache.delete(key));
  searchCache.set(key, request);
  return request;
}

async function fetchJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    });
  } catch {
    throw new OpenFoodFactsError('Sem conexão para buscar mais alimentos.');
  }

  if (response.status === 429) {
    throw new OpenFoodFactsError('Muitas buscas seguidas. Aguarde alguns segundos.', 429);
  }
  if (!response.ok) {
    throw new OpenFoodFactsError(`Não foi possível buscar mais alimentos (${response.status}).`, response.status);
  }
  return response.json();
}

/** kcal per kJ. */
const KJ_TO_KCAL = 1 / 4.184;
/** Pure fat has ~900 kcal per 100 g; anything above is a data entry error. */
const MAX_KCAL_100G = 900;

function toFood(product: ApiProduct): Food | undefined {
  const name = product.product_name?.trim();
  const n = product.nutriments ?? {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy-kj_100g'] ?? NaN) * KJ_TO_KCAL;
  if (!name || !(kcal >= 0) || kcal > MAX_KCAL_100G) return undefined;

  const per100g = {
    kcal,
    carbs: n.carbohydrates_100g ?? 0,
    protein: n.proteins_100g ?? 0,
    fat: n.fat_100g ?? 0,
    fiber: n.fiber_100g,
  };
  if (per100g.carbs + per100g.protein + per100g.fat > 100) return undefined;

  const serving = Number(product.serving_quantity);
  return {
    id: `off:${product.code}`,
    source: 'off',
    name,
    detail: product.brands?.join(', ') || undefined,
    per100g,
    servingGrams: serving > 0 ? serving : undefined,
  };
}
