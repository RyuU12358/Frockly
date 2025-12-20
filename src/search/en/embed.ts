// embed.ts 先頭にこれ（importより上が理想。無理なら dynamic import 方式で）

// --- fetch hook ---
const origFetch = globalThis.fetch?.bind(globalThis);
if (origFetch) {
  globalThis.fetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : input?.url;

    const res = await origFetch(input, init);

    return res;
  };
}

// --- XHR hook ---
const OrigXHR = globalThis.XMLHttpRequest;
if (OrigXHR) {
  class XHR extends OrigXHR {
    open(method: string, url: string, async?: boolean, user?: string | null, password?: string | null) {
      (this as any).__url = url;

      // @ts-ignore
      return super.open(method, url, async ?? true, user ?? null, password ?? null);
    }
    send(body?: Document | BodyInit | null) {
      const url = (this as any).__url;
      this.addEventListener("loadend", () => {

      });
      // @ts-ignore
      return super.send(body ?? null);
    }
  }
  // @ts-ignore
  globalThis.XMLHttpRequest = XHR;
}
let extractorPromise: Promise<any> | null = null;

export async function embedQuery(text: string): Promise<Float32Array> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const mod = await import("@xenova/transformers");
      const { pipeline, env } = mod as any;

      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.remoteHost = "https://huggingface.co/";
      env.remotePathTemplate = "{model}/resolve/{revision}/"; 
      env.useBrowserCache = true;

      return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })();
  }

  const extractor = await extractorPromise;
  const out = await extractor(text, { pooling: "mean" });
  return (out as any).data as Float32Array;
}
