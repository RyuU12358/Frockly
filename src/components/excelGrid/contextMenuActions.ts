import type { CellMap, CellRange, CellRef } from "./types";
import { formatRange, normalizeRange } from "./cellRef";
import { writeClipboardText } from "./clipboard";
import { rangeToTsv, clearAllInRange, clearStyleInRange, clearValueInRange } from "./rangeOps";
import { tr, STR_ALL_MERGED } from "../../i18n/strings";

export type MenuAction =
  | { id: "copy_ref"; label: string }
  | { id: "copy_value"; label: string; enabled?: boolean }
  | { id: "copy_tsv"; label: string; enabled?: boolean }
  | { id: "paste"; label: string }
  | { id: "add_ref_block"; label: string }
  | { id: "clear_value"; label: string }
  | { id: "clear_style"; label: string }
  | { id: "clear_all"; label: string };

export function buildMenuActions(opts: {
  selectedCell: CellRef;
  range: CellRange | null;
  inRangeContext: boolean;
  uiLang?: "en" | "ja";
}): MenuAction[] {
  const t = tr(opts.uiLang ?? "en");
  const hasRange = !!opts.range && opts.inRangeContext;

  return [
    { id: "copy_ref", label: t(STR_ALL_MERGED.COPY_REF) },
    { id: "copy_value", label: t(STR_ALL_MERGED.COPY_VALUE), enabled: !hasRange },
    { id: "copy_tsv", label: t(STR_ALL_MERGED.COPY_TSV), enabled: hasRange },

    { id: "paste", label: t(STR_ALL_MERGED.PASTE) },
    { id: "add_ref_block", label: t(STR_ALL_MERGED.ADD_REF_BLOCK) },

    { id: "clear_value", label: t(STR_ALL_MERGED.CLEAR_VALUE) },
    { id: "clear_style", label: t(STR_ALL_MERGED.CLEAR_STYLE) },
    { id: "clear_all", label: t(STR_ALL_MERGED.CLEAR_ALL) },
  ];
}

export async function runMenuAction(args: {
  action: MenuAction["id"];
  cells: CellMap;
  selectedCell: CellRef;
  range: CellRange | null;
  inRangeContext: boolean;

  // 実行結果で state 更新したい時用
  setCells: (updater: (prev: CellMap) => CellMap) => void;

  // 参照ブロック追加は外側に委譲（Frockly側）
  onAddRefBlock?: (refText: string) => void;

  // pasteは外側に委譲（Clipboard読む必要あるので）
  onPasteRequest?: () => void;
}) {
  const hasRange = !!args.range && args.inRangeContext;
  const refText = (() => {
    if (hasRange && args.range) {
      const nr = normalizeRange(args.range.a, args.range.b);
      return nr ? formatRange(nr) : args.range.a;
    }
    return args.selectedCell;
  })();

  switch (args.action) {
    case "copy_ref":
      await writeClipboardText(refText);
      return;

    case "copy_value":
      if (hasRange) return;
      await writeClipboardText(args.cells[args.selectedCell]?.displayText ?? "");
      return;

    case "copy_tsv":
      if (!hasRange || !args.range) return;
      await writeClipboardText(rangeToTsv(args.cells, args.range));
      return;

    case "paste":
      args.onPasteRequest?.();
      return;

    case "add_ref_block":
      args.onAddRefBlock?.(refText);
      return;

    case "clear_value":
      args.setCells((prev) => {
        const r = hasRange && args.range ? args.range : { a: args.selectedCell, b: args.selectedCell };
        return clearValueInRange(prev, r);
      });
      return;

    case "clear_style":
      args.setCells((prev) => {
        const r = hasRange && args.range ? args.range : { a: args.selectedCell, b: args.selectedCell };
        return clearStyleInRange(prev, r);
      });
      return;

    case "clear_all":
      args.setCells((prev) => {
        const r = hasRange && args.range ? args.range : { a: args.selectedCell, b: args.selectedCell };
        return clearAllInRange(prev, r);
      });
      return;
  }
}
