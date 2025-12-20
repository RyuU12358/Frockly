export const DEFAULT_COLS = 8;   // A..H
export const DEFAULT_ROWS = 20;  // 1..20

// Excel-ish look (v1 fixed)
export const CELL_W_PX = 80;
export const CELL_H_PX = 22;
export const FONT_SIZE_PX = 11;

export function makeColumns(n = DEFAULT_COLS): string[] {
  // 0->A, 25->Z, 26->AA...
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(indexToCol(i));
  return out;

  function indexToCol(idx: number) {
    let x = idx;
    let s = "";
    while (x >= 0) {
      s = String.fromCharCode(65 + (x % 26)) + s;
      x = Math.floor(x / 26) - 1;
    }
    return s;
  }
}

export function makeRows(n = DEFAULT_ROWS): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}
