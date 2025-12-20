// src/search/jp/embed.ts

let extractorPromise: Promise<any> | null = null;

const MODEL = "sirasagi62/ruri-v3-30m-ONNX";
const REVISION = "main"; // 固定でOK
const DTYPE: "fp32" | "fp16" | "q8" = "fp32";

// デバッグしたい時だけ true
const DEBUG_FETCH = false;

function installNetHooksOnce() {
  if (!DEBUG_FETCH) return;

  const origFetch = globalThis.fetch?.bind(globalThis);
  if (origFetch && !(globalThis as any).__fetchHooked) {
    (globalThis as any).__fetchHooked = true;
    globalThis.fetch = async (input: any, init?: any) => {
      const res = await origFetch(input, init);
      return res;
    };
  }
}

export async function embedQuery(text: string): Promise<Float32Array> {
  if (!extractorPromise) {
    installNetHooksOnce();

    extractorPromise = (async () => {
      const mod = await import("@xenova/transformers");
      const { pipeline, env } = mod as any;

      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.remoteHost = "https://huggingface.co/";
      env.remotePathTemplate = "{model}/resolve/{revision}/";
      env.useBrowserCache = true;

      return pipeline("feature-extraction", MODEL, { revision: REVISION, dtype: DTYPE });
    })();
  }

  const extractor = await extractorPromise;
  const out = await extractor(text, { pooling: "mean", normalize: true });
  return ((out as any).data ?? out) as Float32Array;
}
