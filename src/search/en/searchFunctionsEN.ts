// src/search/en/searchFunctionsEN.ts
import { loadFnIndex } from "./loadIndex";
import { embedQuery } from "./embed";
import { searchTopN } from "./searchFn";

const indexPromise = loadFnIndex();

export async function searchFunctionsEN(query: string, limit = 7) {
  const { meta, vecs } = await indexPromise;
  const q = await embedQuery(query);

  if (q.length !== meta.dim) {
    throw new Error(`dim mismatch: query=${q.length}, index=${meta.dim}`);
  }
  return searchTopN(meta, vecs, q, limit);
}
