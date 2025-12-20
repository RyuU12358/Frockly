import type { CellMap, CellRef } from "./types";
import { STR_ALL, tr } from "../../i18n/strings";

interface GridHeaderProps {
  selectedRefText: string;  // "A1" or "A1:B3"
  selectedCell: CellRef;    // 代表セル（fx表示用）
  cells: CellMap;
  uiLang?: "en" | "ja";
}


export function GridHeader({ selectedRefText, selectedCell, cells, uiLang = "en" }: GridHeaderProps) {
  const t = tr(uiLang);
  const cell = cells[selectedCell];
  const formula = cell?.formula;

  return (
    <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white border border-emerald-300 px-3 py-1 rounded text-sm text-emerald-700">
          {selectedRefText}
        </div>
        <span className="text-sm text-gray-600">{t(STR_ALL.SELECTED_REF)}</span>

        <div className="ml-auto flex items-center gap-2 min-w-[240px]">
          <span className="text-xs text-gray-500">fx</span>
          <div className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 overflow-hidden whitespace-nowrap text-ellipsis">
            {formula ?? ""}
          </div>
        </div>
      </div>
    </div>
  );
}
