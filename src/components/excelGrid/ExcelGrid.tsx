import { useRef ,useCallback, useMemo, useState } from "react";
import type { CellMap, CellRef, CellRange } from "./types";
import { makeColumns, makeRows } from "./constants";
import { GridHeader } from "./GridHeader";
import { GridTable } from "./GridTable";
import { applyPlainPaste } from "./pastePlain";
import { applyHtmlPaste } from "./pasteHtml";
import { computeUsedRange } from "./computeUsedRange";
import { isInRange, normalizeRange, formatRange } from "./cellRef";
import { ContextMenu } from "./ContextMenu";
import { buildMenuActions, runMenuAction } from "./contextMenuActions";

const MIN_COLS = 8;   // A..H
const MIN_ROWS = 20;  // 1..20

// 「普段見せる余白」
const BUFFER_COLS = 10;
const BUFFER_ROWS = 30;

// スクロールで増やす量
const GROW_COLS = 10;
const GROW_ROWS = 50;

// 無限っぽく見せつつ、暴走防止の上限（お好みで調整）
const MAX_COLS = 200;
const MAX_ROWS = 2000;

interface ExcelGridProps {
  selectedCell: CellRef;
  onCellSelect: (cell: CellRef) => void;

  // 追加：範囲選択したとき "A1:B3" みたいなの返す（単セルなら "A1"）
  onRangeSelect?: (range: string) => void;
  onAddRefBlock?: (refText: string) => void;
  uiLang: "en" | "ja";

}

export function ExcelGrid({ selectedCell, onCellSelect, onRangeSelect , onAddRefBlock, uiLang}: ExcelGridProps) {
  const [colCount, setColCount] = useState(MIN_COLS);
  const [rowCount, setRowCount] = useState(MIN_ROWS);
  const [ctx, setCtx] = useState<null | { open: true; x: number; y: number; cell: CellRef; inRange: boolean }>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const columns = useMemo(() => makeColumns(colCount), [colCount]);
  const rows = useMemo(() => makeRows(rowCount), [rowCount]);

  const [cells, setCells] = useState<CellMap>({
    A1: { displayText: "100" },
    A2: { displayText: "200" },
    A3: { displayText: "300" },
    B1: { displayText: "50" },
    B2: { displayText: "75" },
    B3: { displayText: "25" },
  });

  // --- Range drag state ---
  const [dragging, setDragging] = useState(false);
  const [range, setRange] = useState<CellRange | null>(null);
  const [dragStart, setDragStart] = useState<CellRef | null>(null);
  const usedRange = useMemo(() => computeUsedRange(cells), [cells]);
  const currentRefText = useMemo(() => {
    if (range) {
      const nr = normalizeRange(range.a, range.b);
      return nr ? formatRange(nr) : range.a;
    }
    return selectedCell;
  }, [range, selectedCell]);
  const onCellContextMenu = useCallback((cell: CellRef, x: number, y: number) => {
    
    const inR = !!range && isInRange(cell, range);

    if (!inR) {
      // 範囲外右クリック → そのセルに切り替え
      setRange(null);
      onCellSelect(cell);
    }

    setCtx({ open: true, x, y, cell, inRange: inR });
  }, [range, onCellSelect]);
  const menuActions = useMemo(() => {
    if (!ctx?.open) return [];
    return buildMenuActions({
      selectedCell,
      range,
      inRangeContext: ctx.inRange,
      uiLang: uiLang,
    });
  }, [ctx, selectedCell, range, uiLang]);

  const expandToUsedRangeWithBuffer = useCallback((nextCells: CellMap) => {
    const used = computeUsedRange(nextCells);

    const needCols = Math.min(
      MAX_COLS,
      Math.max(MIN_COLS, used.maxColIndex + 1 + BUFFER_COLS)
    );
    const needRows = Math.min(
      MAX_ROWS,
      Math.max(MIN_ROWS, used.maxRow + BUFFER_ROWS)
    );

    // 縮めるとスクロールが暴れるから「増やすだけ」
    setColCount((prev) => Math.max(prev, needCols));
    setRowCount((prev) => Math.max(prev, needRows));
  }, []);
  const onMenuAction = useCallback(async (id: any) => {
    await runMenuAction({
      action: id,
      cells,
      selectedCell,
      range,
      inRangeContext: !!ctx?.inRange,
      setCells: (updater) => setCells((prev) => updater(prev)),

      // ここは後でFrocklyに接続
      onAddRefBlock: (refText) => {

        onAddRefBlock?.(refText);
      },


      // 貼り付けは既存 handlePaste を使うのが楽：
      onPasteRequest: async () => {
        // “右クリック→貼り付け”は paste event が来ないので、Clipboard APIで読む
        try {
          const t = await navigator.clipboard.readText();
          setCells((prev) => {
            const next = applyPlainPaste(prev, t, "A1"); // v1: A1固定（必要なら ctx.cell 起点にもできる）
            expandToUsedRangeWithBuffer(next);
            return next;
          });
        } catch {
          // 失敗する環境もあるから、その時は「Ctrl+Vして」って運用でもOK
          console.warn("clipboard.readText failed");
        }
      },
    });
  }, [cells, selectedCell, range, ctx, expandToUsedRangeWithBuffer]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const html = e.clipboardData.getData("text/html");
      const plain = e.clipboardData.getData("text/plain");

      const hasTable = !!html && html.toLowerCase().includes("<table");
      if (!hasTable && !plain) return;

      e.preventDefault();

      setCells((prev) => {
        const next = hasTable
          ? applyHtmlPaste(prev, html, "A1") // v1: A1固定
          : applyPlainPaste(prev, plain, "A1");

        expandToUsedRangeWithBuffer(next);
        return next;
      });
    },
    [expandToUsedRangeWithBuffer]
  );

  const handleScrollNearEdge = useCallback((dir: { bottom?: boolean; right?: boolean }) => {
    if (dir.bottom) setRowCount((prev) => Math.min(MAX_ROWS, prev + GROW_ROWS));
    if (dir.right) setColCount((prev) => Math.min(MAX_COLS, prev + GROW_COLS));
  }, []);

  const handleCellClick = useCallback(
    (cell: CellRef) => {
      onCellSelect(cell);
      // 単セルクリックならrangeは一旦単セル扱いに戻す（好みで外してもOK）
      setRange({ a: cell, b: cell });
      onRangeSelect?.(cell);
    },
    [onCellSelect, onRangeSelect]
  );

  // --- Drag range selection ---
  const handleCellMouseDown = useCallback(
    (cell: CellRef) => {
      setDragging(true);
      setDragStart(cell);
      setRange({ a: cell, b: cell });
      onCellSelect(cell); // 代表セルとして扱う
    },
    [onCellSelect]
  );

  const handleCellMouseEnter = useCallback(
    (cell: CellRef) => {
      setRange((prev) => {
        if (!dragStart) return prev;
        return { a: dragStart, b: cell };
      });
    },
    [dragStart]
  );

  const finalizeDrag = useCallback(() => {
    if (!dragging) return;

    setDragging(false);
    setDragStart(null);

    setRange((prev) => {
      if (!prev) return prev;

      const nr = normalizeRange(prev.a, prev.b);
      if (!nr) {
        onRangeSelect?.(prev.a);
        return prev;
      }

      onRangeSelect?.(formatRange(nr));
      return nr;
    });
  }, [dragging, onRangeSelect]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

  if (!ctrlOrCmd) return;

  // Copy
  if (e.key.toLowerCase() === "c") {
    const text = (() => {
      if (range) {
        const nr = normalizeRange(range.a, range.b);
        return nr ? formatRange(nr) : range.a;
      }
      return currentRefText;
    })();

    // Clipboard API（HTTPS/許可必要な環境あり）
    // 失敗したら execCommand fallback
    e.preventDefault();

    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        fallbackCopy(text);
      }
    };
    void doCopy();
  }
  }, [range, selectedCell]);

  return (
      <div
        ref={rootRef}
        className="h-full flex flex-col"
        tabIndex={0}
        onClick={() => rootRef.current?.focus()}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      >
      <ContextMenu
        open={!!ctx?.open}
        x={ctx?.x ?? 0}
        y={ctx?.y ?? 0}
        actions={menuActions}
        onClose={() => setCtx(null)}
        onAction={onMenuAction}
      />


      <GridHeader
        selectedRefText={currentRefText}
        selectedCell={selectedCell}
        cells={cells}
        uiLang={uiLang}
      />

      <GridTable
        columns={columns}
        rows={rows}
        selectedCell={selectedCell}
        cells={cells}
        onCellClick={handleCellClick}
        onScrollNearEdge={handleScrollNearEdge}
        range={range}
        dragging={dragging}
        onCellMouseDown={handleCellMouseDown}
        onCellMouseEnter={handleCellMouseEnter}
        onMouseUpAnywhere={finalizeDrag}
        usedRange={usedRange}
        onCellContextMenu={onCellContextMenu}
      />
    </div>
  );
}
function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}
