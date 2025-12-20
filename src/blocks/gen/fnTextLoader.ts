export type FnTextMap = Record<string, string>;

function parseFnText(text: string): FnTextMap {
  const out: FnTextMap = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    // 形式: (ZTEST,"test","Runs a z-test and returns the p-value")
    // ざっくりパース（カンマ入りは想定薄い前提で簡易）
    const m = line.match(
      /^\(\s*([A-Za-z0-9_.]+)\s*,\s*"[^"]*"\s*,\s*"([^"]*)"\s*\)\s*$/
    );
    if (!m) continue;
    const fn = m[1].toUpperCase();
    const desc = m[2].trim();
    if (fn && desc) out[fn] = desc;
  }
  return out;
}

export async function loadFnText(lang: "en" | "ja"): Promise<FnTextMap> {
  // ★ パス全部小文字に合わせる
  const base = import.meta.env.BASE_URL; // devでは "/", pagesでは "/Frockly/"
  const path =
    lang === "en"
      ? `${base}meta/en/fn_text_en.txt`
      : `${base}meta/jp/fn_text_jp.txt`;

  const res = await fetch(path);

  if (!res.ok) throw new Error(`fn_text fetch failed: ${res.status} ${path}`);
  const text = await res.text();
  return parseFnText(text);
}
