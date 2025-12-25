import * as XLSX from "xlsx";
import type { CellMap } from "./types";

export type ImportedSheet = {
  name: string;
  cells: CellMap;
};

export type ImportedBook = {
  sheets: ImportedSheet[];
};

export function importXlsxBook(buf: ArrayBuffer): ImportedBook {
  const wb = XLSX.read(buf, {
    type: "array",
    cellFormula: true,
    cellText: true, // ★ w を安定させる（表示テキスト欲しいならtrue推奨）
    cellNF: false,
  });

  const sheets: ImportedSheet[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const cellMap: CellMap = {};

    for (const a1 of Object.keys(ws)) {
      if (a1.startsWith("!")) continue;

      const c: any = ws[a1];

      const rawF: string | undefined = c.f;
      const formula = rawF
        ? rawF.startsWith("=")
          ? rawF
          : `=${rawF}`
        : undefined;

      cellMap[a1] = {
        displayText: c.w ?? String(c.v ?? ""),
        rawValue: c.v,
        formula,
      };
    }

    sheets.push({ name: sheetName, cells: cellMap });
  }

  return { sheets };
}
