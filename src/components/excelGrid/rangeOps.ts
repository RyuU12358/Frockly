import type { CellMap, CellRange, CellRef } from "./types";
import { normalizeRange, toCoord, coordToRef } from "./cellRef";

export function rangeToTsv(cells: CellMap, range: CellRange): string {
  const nr = normalizeRange(range.a, range.b);
  if (!nr) return "";

  const ca = toCoord(nr.a)!;
  const cb = toCoord(nr.b)!;

  const rows: string[] = [];
  for (let r = ca.row; r <= cb.row; r++) {
    const cols: string[] = [];
    for (let c = ca.colIndex; c <= cb.colIndex; c++) {
      const ref = coordToRef({ colIndex: c, row: r }) as CellRef;
      const v = cells[ref]?.displayText ?? "";
      cols.push(v);
    }
    rows.push(cols.join("\t"));
  }
  return rows.join("\n");
}

export function clearValueInRange(prev: CellMap, range: CellRange): CellMap {
  return mapRange(prev, range, (cell) => ({
    ...cell,
    displayText: "",
  }));
}

export function clearStyleInRange(prev: CellMap, range: CellRange): CellMap {
  return mapRange(prev, range, (cell) => ({
    ...cell,
    style: undefined,
    merge: undefined,
  }));
}

export function clearAllInRange(prev: CellMap, range: CellRange): CellMap {
  return mapRange(prev, range, (cell) => ({
    ...cell,
    displayText: "",
    style: undefined,
    merge: undefined,
    formula: undefined,
  }));
}

function mapRange(
  prev: CellMap,
  range: CellRange,
  fn: (cell: any) => any
): CellMap {
  const nr = normalizeRange(range.a, range.b);
  if (!nr) return prev;

  const ca = toCoord(nr.a)!;
  const cb = toCoord(nr.b)!;

  const next: CellMap = { ...prev };

  for (let r = ca.row; r <= cb.row; r++) {
    for (let c = ca.colIndex; c <= cb.colIndex; c++) {
      const ref = coordToRef({ colIndex: c, row: r }) as CellRef;
      const cur = next[ref] ?? { displayText: "" };

      const updated = fn(cur);

      // 完全に空なら消す（軽量化したいなら）
      const txt = (updated.displayText ?? "").trim();
      const hasStyle = !!updated.style;
      const hasMerge = !!updated.merge;
      const hasFormula = !!updated.formula;

      if (!txt && !hasStyle && !hasMerge && !hasFormula) {
        delete next[ref];
      } else {
        next[ref] = updated;
      }
    }
  }

  return next;
}
