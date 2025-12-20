import type { CellMap, CellRef, CellState, CellStyle } from "./types";
import { offsetCellRef } from "./cellRef";

export function applyHtmlPaste(
  prev: CellMap,
  html: string,
  anchor: CellRef = "A1"
): CellMap {
  const parsed = extractTable(html);
  if (!parsed) return prev;

  const { table } = parsed;
  const next: CellMap = { ...prev };

  // occupied[r][c] = true みたいな感じで「結合により埋まってる座標」を管理
  const occupied = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  const trList = Array.from(table.querySelectorAll("tr"));
  for (let r = 0; r < trList.length; r++) {
    const tr = trList[r];
    const tds = Array.from(tr.querySelectorAll("td,th")) as HTMLElement[];

    let c = 0;

    for (const el of tds) {
      // 次に空いてる列へ
      while (occupied.has(key(r, c))) c++;

      const colspan = Math.max(1, parseInt(el.getAttribute("colspan") ?? "1", 10) || 1);
      const rowspan = Math.max(1, parseInt(el.getAttribute("rowspan") ?? "1", 10) || 1);

      const ref = offsetCellRef(anchor, c, r);
      if (ref) {
        const displayText = normalizeCellText(el.textContent ?? "");
        const style = parseInlineStyle(el.getAttribute("style") ?? "");

        const existing = next[ref];
        const cell: CellState = existing
          ? {
              ...existing,
              displayText,
              style: mergeStyle(existing.style, style),
              merge: (rowspan > 1 || colspan > 1) ? { rowspan, colspan } : existing.merge,
            }
          : {
              displayText,
              style,
              merge: (rowspan > 1 || colspan > 1) ? { rowspan, colspan } : undefined,
            };

        next[ref] = cell;
      }

      // このセルが覆う範囲を occupied に入れる（代表セル含めて）
      for (let dr = 0; dr < rowspan; dr++) {
        for (let dc = 0; dc < colspan; dc++) {
          occupied.add(key(r + dr, c + dc));
        }
      }

      // 次のセルへ（colspanぶん進める）
      c += colspan;
    }
  }

  return next;
}

function extractTable(html: string): { doc: Document; table: HTMLTableElement } | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return null;
  return { doc, table: table as HTMLTableElement };
}

function normalizeCellText(t: string): string {
  const s = t.replace(/\u00a0/g, " ");
  return s.trim();
}

function mergeStyle(a?: CellStyle, b?: CellStyle): CellStyle | undefined {
  if (!a) return b;
  if (!b) return a;
  return { ...a, ...b };
}

function parseInlineStyle(styleAttr: string): CellStyle | undefined {
  const m = parseStyleMap(styleAttr);
  if (Object.keys(m).length === 0) return undefined;

  const out: CellStyle = {};

  const bg = pick(m, ["background-color", "background"]);
  if (bg) out.bg = bg;

  const fg = pick(m, ["color"]);
  if (fg) out.fg = fg;

  const fw = pick(m, ["font-weight"]);
  if (fw) out.bold = isBold(fw);

  const fs = pick(m, ["font-style"]);
  if (fs) out.italic = fs.toLowerCase().includes("italic");

  const td = pick(m, ["text-decoration", "text-decoration-line"]);
  if (td) out.underline = td.toLowerCase().includes("underline");

  const bAll = pick(m, ["border"]);
  const bt = pick(m, ["border-top"]) ?? bAll;
  const br = pick(m, ["border-right"]) ?? bAll;
  const bb = pick(m, ["border-bottom"]) ?? bAll;
  const bl = pick(m, ["border-left"]) ?? bAll;

  if (bt) out.borderTop = bt;
  if (br) out.borderRight = br;
  if (bb) out.borderBottom = bb;
  if (bl) out.borderLeft = bl;

  return Object.keys(out).length ? out : undefined;
}

function parseStyleMap(styleAttr: string): Record<string, string> {
  const out: Record<string, string> = {};
  styleAttr
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean)
    .forEach((decl) => {
      const i = decl.indexOf(":");
      if (i < 0) return;
      const k = decl.slice(0, i).trim().toLowerCase();
      const v = decl.slice(i + 1).trim();
      if (!k || !v) return;
      out[k] = v;
    });
  return out;
}

function pick(map: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = map[k];
    if (v) return v;
  }
  return undefined;
}

function isBold(fontWeight: string): boolean {
  const fw = fontWeight.trim().toLowerCase();
  if (fw === "bold" || fw === "bolder") return true;
  const n = Number(fw);
  return Number.isFinite(n) && n >= 600;
}
