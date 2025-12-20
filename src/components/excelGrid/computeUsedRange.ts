import type { CellMap } from "./types";
import { parseCellRef, colToIndex } from "./cellRef";

export function computeUsedRange(cells: CellMap): { maxRow: number; maxColIndex: number } {
  let maxRow = 1;
  let maxColIndex = 0;

  for (const [ref, cell] of Object.entries(cells)) {
    const txt = (cell?.displayText ?? "").trim();
    if (txt === "") continue; // 空は未使用扱い

    const p = parseCellRef(ref);
    if (!p) continue;

    maxRow = Math.max(maxRow, p.row);
    maxColIndex = Math.max(maxColIndex, colToIndex(p.col));
  }

  return { maxRow, maxColIndex };
}
