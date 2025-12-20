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

export async function loadFnIndex(baseUrl?: string) {
  const root = (baseUrl ?? import.meta.env.BASE_URL).replace(/\/?$/, "/"); // 必ず末尾/
  const base = `${root}embed/en`; // ★ここで embed/en を足す

  const metaUrl = `${base}/fn_embed.meta.json`;
  const f32Url  = `${base}/fn_embed.f32`;

  const meta = await fetchJson<FnEmbedMeta>(metaUrl);
  const buf = await fetchArrayBuffer(f32Url);
  const vecs = new Float32Array(buf);

  if (vecs.length !== meta.count * meta.dim) {
    throw new Error(
      `embed size mismatch: vecs=${vecs.length}, expected=${meta.count * meta.dim}`
    );
  }
  return { meta, vecs };
}
