// src/search/jp/searchFunctionsJP.ts
import { loadFnIndex } from "./loadIndex";
import { embedQuery } from "./embed";
import { searchTopN } from "../en/searchFn";

const indexPromise = loadFnIndex(); // ← ここ！引数消す

export async function searchFunctionsJP(query: string, limit = 7) {
  const { meta, vecs } = await indexPromise;
  const q = await embedQuery(query);

  if (q.length !== meta.dim) {
    throw new Error(`dim mismatch: query=${q.length}, index=${meta.dim}`);
  }
  return searchTopN(meta, vecs, q, limit);
}
