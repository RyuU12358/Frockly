import type { CellMap, CellRef, CellState } from "./types";
import { offsetCellRef } from "./cellRef";

/**
 * Apply text/plain clipboard (TSV) into cells starting from anchor (default A1).
 * - Values only (displayText)
 * - Overwrite existing cells in the pasted rectangle
 */
export function applyPlainPaste(
  prev: CellMap,
  plainText: string,
  anchor: CellRef = "A1"
): CellMap {
  const rows = splitTsv(plainText);
  if (rows.length === 0) return prev;

  const next: CellMap = { ...prev };

  for (let r = 0; r < rows.length; r++) {
    const cols = rows[r];
    for (let c = 0; c < cols.length; c++) {
      const ref = offsetCellRef(anchor, c, r);
      if (!ref) continue;

      const text = cols[c] ?? "";
      const existing = next[ref];

      const cell: CellState = existing
        ? { ...existing, displayText: text }
        : { displayText: text };

      next[ref] = cell;
    }
  }
  return next;
}

function splitTsv(text: string): string[][] {
  // Excel plain is typically \t separated, rows separated by \r\n or \n
  const trimmed = text.replace(/\s+$/g, ""); // drop trailing whitespace/newlines
  if (!trimmed) return [];

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.split("\t"));
}
