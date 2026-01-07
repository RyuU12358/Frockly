import type { CellRange } from "../components/excelGrid/types";

export function parseRefToRange(refText: string): CellRange | null {
  // Sheet名を捨てる
  const t = refText.includes("!") ? refText.split("!").pop()! : refText;

  // ★ $ と # を除去（スピルは今は無視）
  const s = t.replace(/[$#]/g, "").trim();

  // A1 or A1:B2
  const m = s.match(/^([A-Z]+[0-9]+)(?::([A-Z]+[0-9]+))?$/i);
  if (!m) return null;

  const a = m[1].toUpperCase();
  const b = (m[2] ?? m[1]).toUpperCase();
  return { a, b };
}
