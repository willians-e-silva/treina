/**
 * Search over TACO (Tabela Brasileira de Composição de Alimentos).
 *
 * There is no public hosted TACO API, so the table (597 foods, ~37 KB) ships
 * with the app in `taco-data.ts`: search is instant and works offline. Names
 * are in Portuguese and describe generic foods ("Arroz, integral, cozido").
 */
import type { Food } from './foods';
import { TACO_CATEGORIES, TACO_FOODS, type TacoRow } from './taco-data';

const MAX_RESULTS = 30;

type IndexedFood = { food: Food; words: string[]; normalized: string };

let index: Map<number, IndexedFood> | undefined;

/** Built on first use, so app startup does not pay for it. */
function getIndex() {
  if (!index) {
    index = new Map(
      TACO_FOODS.map((row) => {
        const food = toFood(row);
        const normalized = normalizeText(food.name);
        return [row[0], { food, normalized, words: normalized.split(/[^a-z0-9]+/).filter(Boolean) }];
      }),
    );
  }
  return index;
}

export function getTacoFood(id: number) {
  return getIndex().get(id)?.food;
}

/**
 * Foods whose name has a word starting with each word of the query, so
 * "feij cozi" finds "Feijão, carioca, cozido". Foods named after the first
 * word come first, then simpler names (fewer qualifiers).
 */
export function searchTaco(query: string): Food[] {
  const terms = normalizeText(query).split(/[^a-z0-9]+/).filter(Boolean);
  if (terms.length === 0) return [];

  const matches: { food: Food; score: number }[] = [];
  for (const { food, words, normalized } of getIndex().values()) {
    if (!terms.every((term) => words.some((word) => word.startsWith(term)))) continue;
    const score =
      (words[0].startsWith(terms[0]) ? 0 : 1000) +
      normalized.split(',').length * 100 +
      normalized.length;
    matches.push({ food, score });
  }
  return matches
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_RESULTS)
    .map(({ food }) => food);
}

function toFood([id, categoryId, name, kcal, protein, carbs, fat, fiber]: TacoRow): Food {
  return {
    id: `taco:${id}`,
    source: 'taco',
    name,
    detail: TACO_CATEGORIES[categoryId],
    // TACO leaves a value empty when it was not measured or only traces were found.
    per100g: {
      kcal: kcal ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      fiber: fiber ?? undefined,
    },
  };
}

/** Lowercase without accents, so "feijao" matches "Feijão". */
export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
