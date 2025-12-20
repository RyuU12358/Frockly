// src/search/jp/loadIndex.ts
export type FnEmbedMeta = {
  dim: number;
  count: number;
  fns: string[];
  model?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[HTTP ${res.status}] ${url}\n${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[HTTP ${res.status}] ${url}\n${text.slice(0, 200)}`);
  }
  return await res.arrayBuffer();
}

/**
 * baseUrl はアプリのルート（例: import.meta.env.BASE_URL）を渡す想定
 * 何も渡さなければ BASE_URL を使う
 */
export async function loadFnIndex(baseUrl?: string) {
  const root = (baseUrl ?? import.meta.env.BASE_URL).replace(/\/?$/, "/"); // 末尾/保証
  const base = `${root}embed/jp`;

  const metaUrl = `${base}/fn_embed.meta.json`;
  const f32Url = `${base}/fn_embed.f32`;

  const meta = await fetchJson<FnEmbedMeta>(metaUrl);
  const buf = await fetchArrayBuffer(f32Url);
  const vecs = new Float32Array(buf); // count * dim

  if (vecs.length !== meta.count * meta.dim) {
    throw new Error(
      `embed size mismatch: vecs=${vecs.length}, expected=${meta.count * meta.dim}`
    );
  }
  return { meta, vecs };
}
