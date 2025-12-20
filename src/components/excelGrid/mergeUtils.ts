import type { CellMap, CellRef } from "./types";
import { offsetCellRef } from "./cellRef";

/**
 * Representative cell (top-left) having merge={rowspan,colspan} defines a rectangle.
 * All other cells in that rectangle are "covered" and should NOT be rendered.
 */
export function buildCoveredSet(cells: CellMap): Set<CellRef> {
  const covered = new Set<CellRef>();

  for (const [ref, cell] of Object.entries(cells)) {
    const m = cell.merge;
    if (!m) continue;

    const rs = Math.max(1, m.rowspan);
    const cs = Math.max(1, m.colspan);
    if (rs === 1 && cs === 1) continue;

    for (let dr = 0; dr < rs; dr++) {
      for (let dc = 0; dc < cs; dc++) {
        if (dr === 0 && dc === 0) continue; // representative itself
        const r2 = offsetCellRef(ref, dc, dr);
        if (r2) covered.add(r2);
      }
    }
  }
  return covered;
}
