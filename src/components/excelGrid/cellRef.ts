import type { CellCoord, CellRange, CellRef } from "./types";

export function toCoord(ref: CellRef): CellCoord | null {
  const p = parseCellRef(ref);
  if (!p) return null;
  return { colIndex: colToIndex(p.col), row: p.row };
}

export function coordToRef(coord: CellCoord): CellRef {
  return `${indexToCol(coord.colIndex)}${coord.row}`;
}

export function normalizeRange(a: CellRef, b: CellRef): CellRange | null {
  const ca = toCoord(a);
  const cb = toCoord(b);
  if (!ca || !cb) return null;

  const left = Math.min(ca.colIndex, cb.colIndex);
  const right = Math.max(ca.colIndex, cb.colIndex);
  const top = Math.min(ca.row, cb.row);
  const bottom = Math.max(ca.row, cb.row);

  return {
    a: coordToRef({ colIndex: left, row: top }),
    b: coordToRef({ colIndex: right, row: bottom }),
  };
}

export function formatRange(r: CellRange): string {
  if (r.a === r.b) return r.a;
  return `${r.a}:${r.b}`;
}

export function isInRange(cell: CellRef, r: CellRange): boolean {
  const cc = toCoord(cell);
  const ca = toCoord(r.a);
  const cb = toCoord(r.b);
  if (!cc || !ca || !cb) return false;

  const left = Math.min(ca.colIndex, cb.colIndex);
  const right = Math.max(ca.colIndex, cb.colIndex);
  const top = Math.min(ca.row, cb.row);
  const bottom = Math.max(ca.row, cb.row);

  return left <= cc.colIndex && cc.colIndex <= right && top <= cc.row && cc.row <= bottom;
}

export function isRangeEdge(cell: CellRef, r: CellRange): { top: boolean; bottom: boolean; left: boolean; right: boolean } {
  const cc = toCoord(cell);
  const ca = toCoord(r.a);
  const cb = toCoord(r.b);
  if (!cc || !ca || !cb) return { top: false, bottom: false, left: false, right: false };

  const left = Math.min(ca.colIndex, cb.colIndex);
  const right = Math.max(ca.colIndex, cb.colIndex);
  const top = Math.min(ca.row, cb.row);
  const bottom = Math.max(ca.row, cb.row);

  const inR = left <= cc.colIndex && cc.colIndex <= right && top <= cc.row && cc.row <= bottom;
  if (!inR) return { top: false, bottom: false, left: false, right: false };

  return {
    top: cc.row === top,
    bottom: cc.row === bottom,
    left: cc.colIndex === left,
    right: cc.colIndex === right,
  };
}


export function toCellRef(col: string, row: number): CellRef {
  return `${col}${row}`;
}

export function colToIndex(col: string): number {
  // A->0, Z->25, AA->26
  let n = 0;
  for (let i = 0; i < col.length; i++) {
    const c = col.charCodeAt(i);
    if (c < 65 || c > 90) throw new Error(`Invalid column: ${col}`);
    n = n * 26 + (c - 64);
  }
  return n - 1;
}

export function indexToCol(idx: number): string {
  if (idx < 0) throw new Error(`Invalid col index: ${idx}`);
  let x = idx;
  let s = "";
  while (x >= 0) {
    s = String.fromCharCode(65 + (x % 26)) + s;
    x = Math.floor(x / 26) - 1;
  }
  return s;
}

export function parseCellRef(ref: CellRef): { col: string; row: number } | null {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) return null;
  const col = m[1];
  const row = Number(m[2]);
  if (!Number.isFinite(row) || row <= 0) return null;
  return { col, row };
}

export function offsetCellRef(base: CellRef, dCol: number, dRow: number): CellRef | null {
  const p = parseCellRef(base);
  if (!p) return null;
  const ci = colToIndex(p.col) + dCol;
  const r = p.row + dRow;
  if (ci < 0 || r <= 0) return null;
  return `${indexToCol(ci)}${r}`;
}
