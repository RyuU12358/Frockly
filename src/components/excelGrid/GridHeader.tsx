import type { CellMap, CellRef } from "./types";
import { STR_ALL, tr } from "../../i18n/strings";

interface GridHeaderProps {
  selectedRefText: string; // "A1" or "A1:B3"
  selectedCell: CellRef; // 代表セル（fx表示用）
  cells: CellMap;
  uiLang?: "en" | "ja";
}

export function GridHeader({
  selectedRefText,
  selectedCell,
  cells,
  uiLang = "en",
}: GridHeaderProps) {
  const t = tr(uiLang);
  const cell = cells[selectedCell];
  const display = cell?.displayText ?? "";
  const formula = cell?.formula ?? "";

  const copyFormula = async () => {
    if (!formula) return;
    try {
      await navigator.clipboard.writeText(formula);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = formula;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="bg-gray-100 border-b border-gray-300 px-3 py-2">
      <div className="flex items-center gap-3">
        {/* 選択セル / 範囲 */}
        <div className="bg-white border border-emerald-300 px-3 py-1 text-sm text-emerald-700 shrink-0">
          {selectedRefText}
        </div>

        {/* 表示値 */}
        <div
          className="flex-1 min-w-[120px] bg-white border border-gray-300 px-2 py-1 text-xs text-gray-800 overflow-hidden whitespace-nowrap text-ellipsis"
          title={display}
        >
          {display}
        </div>

        {/* fx */}
        <span className="text-xs text-gray-500 shrink-0">fx</span>

        {/* 数式 */}
        <div
          className="flex-[2] min-w-[200px] bg-white border border-gray-300 px-2 py-1 text-xs text-gray-700 overflow-hidden whitespace-nowrap text-ellipsis"
          title={formula}
        >
          {formula}
        </div>

        {/* コピー */}
        <button
          className="px-2 py-1 text-xs border border-gray-300 bg-white hover:bg-gray-50"
          onClick={copyFormula}
          disabled={!formula}
          title={uiLang === "ja" ? "数式をコピー" : "Copy formula"}
        >
          📋
        </button>
      </div>
    </div>
  );
}
