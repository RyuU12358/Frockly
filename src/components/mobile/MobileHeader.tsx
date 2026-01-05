// components/mobile/MobileHeader.tsx
import { FrogIcon } from "../ui/FrogIcon";
import { Search } from "lucide-react";
import { STR, tr, type StrKey } from "../../i18n/strings";

export function MobileHeader(props: {
  title?: string;
  subtitle?: string;
  uiLang: "en" | "ja";
  onChangeLang: (lang: "en" | "ja") => void;

  search: string;
  onChangeSearch: (v: string) => void;
  placeholderKey?: StrKey; // 今はこれだけで十分
  onImportFromFormula?: () => void;
}) {
  const t = tr(props.uiLang);

  return (
    <div className="shrink-0 bg-emerald-600 border-b border-emerald-700 px-3 pt-2 pb-2">
      {/* 上段 */}
      <div className="flex items-center gap-2">
        <FrogIcon size={26} />

        <div className="min-w-0 flex-1">
          <div className="font-bold text-[13px] leading-tight text-white truncate">
            {props.title ?? "Frockly"}
          </div>
          <div className="text-[11px] leading-tight text-emerald-100 truncate">
            {props.subtitle ?? ""}
          </div>
        </div>

        {/* ★ 数式から作成（モーダル開く） */}
        {props.onImportFromFormula && (
          <button
            onClick={props.onImportFromFormula}
            className="
      h-8 px-2
      text-[11px] font-medium
      rounded-md
      bg-emerald-100 text-emerald-800
      border border-emerald-300
      hover:bg-emerald-200
      active:bg-emerald-300
      whitespace-nowrap
    "
          >
            {t(STR.IMPORT_FROM_FORMULA)}
          </button>
        )}

        <select
          className="
      h-8 text-[12px] rounded-md
      border border-emerald-300/40 bg-emerald-700 text-white px-2
      focus:outline-none focus:bg-white focus:text-emerald-900
    "
          value={props.uiLang}
          onChange={(e) => props.onChangeLang(e.target.value as "en" | "ja")}
        >
          <option value="ja">JP</option>
          <option value="en">EN</option>
        </select>
      </div>

      {/* 下段：検索 */}
      <div className="mt-2 flex items-center gap-1 bg-white rounded px-2 py-1">
        <Search className="w-4 h-4 text-gray-500 shrink-0" />
        <input
          type="text"
          value={props.search}
          onChange={(e) => props.onChangeSearch(e.target.value)}
          placeholder={t(props.placeholderKey ?? "SEARCH")}
          className="text-sm outline-none w-full"
        />
      </div>
    </div>
  );
}
