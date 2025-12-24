export function clampOneLine(s: string, max = 80) {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

export function joinSig(params?: string[]) {
  if (!params || params.length === 0) return "(引数なし)";
  return `(${params.join(", ")})`;
}
