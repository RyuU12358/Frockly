import type { FnEmbedMeta } from "./loadIndex";

function dotRow(vecs: Float32Array, rowOffset: number, q: Float32Array) {
  let s = 0;
  for (let i = 0; i < q.length; i++) s += vecs[rowOffset + i] * q[i];
  return s; // normalize済みならcosine
}

export function searchTopN(
  meta: FnEmbedMeta,
  vecs: Float32Array,
  q: Float32Array,
  n = 7
) {
  const { dim, count, fns } = meta;

  const scored = new Array<{ fn: string; score: number }>(count);
  for (let i = 0; i < count; i++) {
    const score = dotRow(vecs, i * dim, q);
    scored[i] = { fn: fns[i], score };
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}
