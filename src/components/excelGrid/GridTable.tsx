import { useMemo } from "react";
import type { CellMap, CellRef, CellRange } from "./types";
import { CELL_H_PX, CELL_W_PX, FONT_SIZE_PX } from "./constants";
import { toCellRef, colToIndex, isInRange, isRangeEdge } from "./cellRef";
import { buildCoveredSet } from "./mergeUtils";

interface GridTableProps {
  columns: string[];
  rows: number[];
  selectedCell: CellRef;
  cells: CellMap;
  onCellClick: (cell: CellRef) => void;

  onScrollNearEdge?: (dir: { bottom?: boolean; right?: boolean }) => void;

  // 範囲選択（既存）
  range?: CellRange | null;

  // ★追加：参照ハイライト
  highlightRange?: CellRange | null;

  dragging?: boolean;
  onCellMouseDown?: (cell: CellRef) => void;
  onCellMouseEnter?: (cell: CellRef) => void;
  onMouseUpAnywhere?: () => void;
  onCellContextMenu?: (cell: CellRef, x: number, y: number) => void;

  usedRange?: { maxRow: number; maxColIndex: number };
}

export function GridTable({
  columns,
  rows,
  selectedCell,
  cells,
  onCellClick,
  onScrollNearEdge,
  range,
  highlightRange,
  dragging,
  onCellMouseDown,
  onCellMouseEnter,
  onMouseUpAnywhere,
  usedRange,
  onCellContextMenu,
}: GridTableProps) {
  const covered = useMemo(() => buildCoveredSet(cells), [cells]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onScrollNearEdge) return;
    const el = e.currentTarget;

    const threshold = 200; // px
    const nearBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    const nearRight =
      el.scrollLeft + el.clientWidth >= el.scrollWidth - threshold;

    if (nearBottom || nearRight)
      onScrollNearEdge({ bottom: nearBottom, right: nearRight });
  };

  const rangeBorder = "2px solid rgba(16,185,129,0.8)"; // 緑（選択）
  const hiBorder = "2px solid rgba(59,130,246,0.55)"; // ★青（参照）
  const usedBorder = "1px solid rgba(0,0,0,0.25)";

  return (
    <div
      className="flex-1 overflow-auto"
      tabIndex={0}
      onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).focus()}
      onScroll={handleScroll}
      onMouseUp={onMouseUpAnywhere}
      onMouseLeave={onMouseUpAnywhere}
    >
      <table
        className="w-full border-collapse"
        style={{ fontSize: FONT_SIZE_PX }}
      >
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr>
            <th className="w-12 border border-gray-300 bg-gray-200 text-xs p-1" />
            {columns.map((col) => (
              <th
                key={col}
                className="border border-gray-300 bg-gray-200 text-xs p-1"
                style={{ minWidth: CELL_W_PX }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row} style={{ height: CELL_H_PX }}>
              <td className="border border-gray-300 bg-gray-200 text-xs text-center p-1">
                {row}
              </td>

              {columns.map((col) => {
                const cellRef = toCellRef(col, row);

                if (covered.has(cellRef)) return null;

                const isSelected = cellRef === selectedCell;
                const state = cells[cellRef];
                const text = state?.displayText ?? "";

                const rs = state?.merge?.rowspan ?? 1;
                const cs = state?.merge?.colspan ?? 1;

                const bg = state?.style?.bg;
                const fg = state?.style?.fg;
                const fontWeight = state?.style?.bold ? "700" : "400";
                const fontStyle = state?.style?.italic ? "italic" : "normal";
                const textDecoration = state?.style?.underline
                  ? "underline"
                  : "none";

                const bt = state?.style?.borderTop;
                const br = state?.style?.borderRight;
                const bb = state?.style?.borderBottom;
                const bl = state?.style?.borderLeft;

                // ===== 選択 range（既存） =====
                const inSel = range ? isInRange(cellRef, range) : false;
                const edgeSel = range
                  ? isRangeEdge(cellRef, range)
                  : { top: false, bottom: false, left: false, right: false };

                // ===== 参照 highlightRange（追加） =====
                const inHi = highlightRange
                  ? isInRange(cellRef, highlightRange)
                  : false;
                const edgeHi = highlightRange
                  ? isRangeEdge(cellRef, highlightRange)
                  : { top: false, bottom: false, left: false, right: false };

                // 背景：選択 > 参照 > used > セルbg
                const selBg =
                  inSel && !isSelected ? "rgba(16,185,129,0.12)" : undefined;
                const hiBg =
                  inHi && !isSelected && !inSel
                    ? "rgba(59,130,246,0.08)"
                    : undefined;

                // used range
                const colIndex = colToIndex(col);
                const ur = usedRange;
                const inUsed =
                  !!ur && row <= ur.maxRow && colIndex <= ur.maxColIndex;

                const usedTop = !!ur && row === 1 && colIndex <= ur.maxColIndex;
                const usedLeft = !!ur && colIndex === 0 && row <= ur.maxRow;
                const usedBottom =
                  !!ur && row === ur.maxRow && colIndex <= ur.maxColIndex;
                const usedRight =
                  !!ur && colIndex === ur.maxColIndex && row <= ur.maxRow;

                const usedBg =
                  inUsed && !isSelected && !inSel && !inHi
                    ? "rgba(0,0,0,0.02)"
                    : undefined;

                // border priority:
                // selected(クラス) > selection green > highlight blue > html border > usedBorder
                const topBorder = isSelected
                  ? undefined
                  : edgeSel.top
                  ? rangeBorder
                  : edgeHi.top
                  ? hiBorder
                  : bt ?? (usedTop ? usedBorder : undefined);

                const bottomBorder = isSelected
                  ? undefined
                  : edgeSel.bottom
                  ? rangeBorder
                  : edgeHi.bottom
                  ? hiBorder
                  : bb ?? (usedBottom ? usedBorder : undefined);

                const leftBorder = isSelected
                  ? undefined
                  : edgeSel.left
                  ? rangeBorder
                  : edgeHi.left
                  ? hiBorder
                  : bl ?? (usedLeft ? usedBorder : undefined);

                const rightBorder = isSelected
                  ? undefined
                  : edgeSel.right
                  ? rangeBorder
                  : edgeHi.right
                  ? hiBorder
                  : br ?? (usedRight ? usedBorder : undefined);

                return (
                  <td
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onCellContextMenu?.(cellRef, e.clientX, e.clientY);
                    }}
                    key={cellRef}
                    rowSpan={rs > 1 ? rs : undefined}
                    colSpan={cs > 1 ? cs : undefined}
                    onClick={() => onCellClick(cellRef)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onCellMouseDown?.(cellRef);
                    }}
                    onMouseEnter={() => {
                      if (dragging) onCellMouseEnter?.(cellRef);
                    }}
                    className={[
                      "border border-gray-300 px-1 cursor-pointer",
                      "transition-colors",
                      isSelected
                        ? "bg-emerald-100 border-emerald-500 border-2"
                        : "bg-white hover:bg-gray-50",
                    ].join(" ")}
                    style={{
                      height: CELL_H_PX,
                      minWidth: CELL_W_PX,

                      backgroundColor: isSelected
                        ? undefined
                        : selBg ?? hiBg ?? usedBg ?? bg,

                      color: fg,
                      fontWeight,
                      fontStyle,
                      textDecoration,

                      borderTop: topBorder,
                      borderRight: rightBorder,
                      borderBottom: bottomBorder,
                      borderLeft: leftBorder,

                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={text}
                  >
                    {text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
