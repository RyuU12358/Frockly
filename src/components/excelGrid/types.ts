export type CellRef = string;

export interface CellStyle {
  bg?: string;      // "#ffffff" etc
  fg?: string;      // "#000000" etc
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;

  // 追加：Excelコピペの罫線をそのままCSSとして保持
  borderTop?: string;    // e.g. "1px solid #d4d4d4"
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
}
export interface CellCoord {
  colIndex: number; // A=0
  row: number;      // 1-based
}

export interface CellRange {
  a: CellRef; // start
  b: CellRef; // end
}

export interface CellMerge {
  // representative (top-left) cell stores merge info
  rowspan: number;
  colspan: number;
}

export interface CellState {
  displayText: string;
  style?: CellStyle;
  merge?: CellMerge;

  // read-only meta (optional)
  formula?: string;
  rawValue?: unknown;
}
export interface UsedRange {
  maxRow: number;        // 1-based
  maxColIndex: number;   // A=0
}

export type CellMap = Record<CellRef, CellState>;
