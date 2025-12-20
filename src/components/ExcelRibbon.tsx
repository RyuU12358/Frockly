import { useEffect, useMemo, useRef, useState } from "react";
import { Wand2, Search } from "lucide-react";
import { BlockPalette } from "./BlockPalette";
import { STR_ALL, STR, tr } from "../i18n/strings";
import { loadFnText, type FnTextMap } from "../blocks/gen/fnTextLoader";

export type RibbonTab = "functions";

export interface ExcelRibbonProps {
  selectedTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  onBlockClick?: (blockType: string) => void;

  uiLang: "en" | "ja";
  onUiLangChange: (lang: "en" | "ja") => void;
  onWorkspaceApi?: { insertFromFormula?: (formula: string) => void };
}

function FrogIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="6"
        y="12"
        width="20"
        height="14"
        rx="2"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1.5"
      />
      <rect
        x="8"
        y="6"
        width="16"
        height="10"
        rx="2"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1.5"
      />
      <circle
        cx="13"
        cy="10"
        r="2.5"
        fill="white"
        stroke="#16a34a"
        strokeWidth="1"
      />
      <circle
        cx="19"
        cy="10"
        r="2.5"
        fill="white"
        stroke="#16a34a"
        strokeWidth="1"
      />
      <circle cx="13" cy="10" r="1" fill="#16a34a" />
      <circle cx="19" cy="10" r="1" fill="#16a34a" />
      <path
        d="M 14 14 Q 16 15 18 14"
        stroke="#16a34a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="24"
        width="5"
        height="4"
        rx="1"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1"
      />
      <rect
        x="19"
        y="24"
        width="5"
        height="4"
        rx="1"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1"
      />
    </svg>
  );
}

export function ExcelRibbon({
  selectedTab,
  onTabChange,
  onBlockClick,
  uiLang,
  onUiLangChange,
  onWorkspaceApi,
}: ExcelRibbonProps) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const t = tr(uiLang);
  const tabs = useMemo(
    () => [{ id: "functions" as const, label: t(STR.FUNCTIONS), icon: Wand2 }],
    [uiLang] // or [t]
  );
  const [openImport, setOpenImport] = useState(false);
  const [importText, setImportText] = useState("");

  const isComposingRef = useRef(false);
  const [hoverFn, setHoverFn] = useState<string | null>(null);
  const [selectedFn, setSelectedFn] = useState<string | null>(null);

  const activeFn = hoverFn ?? selectedFn; // ★ホバー優先
  const [fnText, setFnText] = useState<FnTextMap>({});
  const [fnTextErr, setFnTextErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setFnTextErr("");
    (async () => {
      try {
        const m = await loadFnText(uiLang);
        if (!cancelled) setFnText(m);
      } catch (e: any) {
        if (!cancelled) setFnText({});
        if (!cancelled)
          setFnTextErr(String(e?.message ?? e ?? "fn_text load error"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uiLang]);

  useEffect(() => {
    const onCompStart = () => {
      isComposingRef.current = true;
    };
    const onCompEnd = () => {
      isComposingRef.current = false;
    };

    window.addEventListener("compositionstart", onCompStart, true);
    window.addEventListener("compositionend", onCompEnd, true);

    return () => {
      window.removeEventListener("compositionstart", onCompStart, true);
      window.removeEventListener("compositionend", onCompEnd, true);
    };
  }, []);
  useEffect(() => {
    const focusSearch = (opts?: { clear?: boolean; selectAll?: boolean }) => {
      const el = searchRef.current;
      if (!el) return;

      if (opts?.clear) setSearch("");
      el.focus();

      // 次フレームで選択（focus直後は反映されへん環境がある）
      if (opts?.selectAll) {
        requestAnimationFrame(() => el.select());
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // ★ Ctrl+K / Ctrl+F：検索へ
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const k = e.key.toLowerCase();

        if (k === "k") {
          e.preventDefault();
          // Ctrl+K は「検索起動」っぽく：クリアして全選択
          focusSearch({ clear: true, selectAll: true });
          return;
        }

        if (k === "f") {
          e.preventDefault();
          // Ctrl+F は「検索」：現状の検索語を全選択
          focusSearch({ clear: false, selectAll: true });
          return;
        }
      }

      // 既に入力中なら奪わない
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (t as any)?.isContentEditable;
      if (isTyping) return;

      if (e.key === "Escape") {
        setSearch("");
        return;
      }

      // ★ どこでも入力 → 検索へ（1打目は捨てる方針）
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        searchRef.current?.focus();
        e.preventDefault();
        return;
      }

      // / で明示検索（任意）
      if (e.key === "/") {
        searchRef.current?.focus();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, {
        capture: true,
      } as any);
  }, []);

  // 文字入力で検索へ（フォーカス無くてもOK）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // 既に入力中なら奪わない
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (t as any)?.isContentEditable;
      if (isTyping) return;

      if (e.key === "Escape") {
        setSearch("");
        return;
      }

      // ここが肝：printable は「フォーカス移動だけ」して、1打目は捨てる
      if (e.key.length === 1) {
        searchRef.current?.focus();
        e.preventDefault(); // ★ これで 1打目の "a" が入らん
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, {
        capture: true,
      } as any);
  }, []);

  return (
    <div className="bg-gradient-to-b from-emerald-600 to-emerald-700 border-b shadow-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-emerald-800 flex items-center gap-3">
        <FrogIcon />
        <div>
          <h1 className="text-white text-xl">Frockly</h1>
          <p className="text-emerald-100 text-xs">
            Formula Renderer with Blockly
          </p>
        </div>

        {/* 右上：言語＋検索 */}
        <div className="ml-auto flex items-center gap-2">
          <select
            className="
              text-xs
              border border-emerald-300/40
              bg-emerald-700
              text-white
              rounded
              px-2 py-1
              focus:text-emerald-900
              focus:bg-white
            "
            value={uiLang}
            onChange={(e) => onUiLangChange(e.target.value as any)}
          >
            <option value="ja">JP</option>
            <option value="en">EN</option>
          </select>

          <div className="flex items-center gap-1 bg-white rounded px-2 py-1 shadow-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                // Enterは何もしない（送信事故防止）
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder={t(STR.SEARCH)}
              className="text-xs outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabs（関数だけ） */}
      <div className="flex gap-1 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t transition-colors
                ${
                  isSelected
                    ? "bg-white text-emerald-700 shadow-md"
                    : "bg-emerald-500 text-white hover:bg-emerald-400"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="px-4 pb-2 flex items-center gap-3">
        <button
          className="
      flex items-center gap-2
      px-4 py-1.5
      rounded-lg
      bg-emerald-100
      border-2 border-emerald-400
      text-emerald-800
      shadow-sm
      hover:bg-emerald-200
      transition
    "
          onClick={() => {
            setImportText("");
            setOpenImport(true);
          }}
        >
          {t(STR_ALL.IMPORT_FROM_FORMULA)}
        </button>

        {/* ★ 常時表示の説明欄 */}
        <div
          className="
      flex-1 min-w-0
      rounded-lg
      border border-emerald-200
      bg-emerald-50
      px-3 py-1.5
      text-xs text-emerald-900
      overflow-hidden whitespace-nowrap text-ellipsis
    "
        >
          {fnTextErr
            ? `fn_text load failed`
            : activeFn
            ? fnText[activeFn] ??
              (uiLang === "ja" ? "（説明準備中）" : "(description coming soon)")
            : uiLang === "ja"
            ? "関数にマウスを乗せると簡単な説明が表示されます。"
            : "Hover a function to see a short description."}
        </div>
      </div>

      {openImport && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-[640px] max-w-[90vw] p-4">
            <div className="text-lg font-semibold mb-2">
              {t(STR_ALL.PASTE_FORMULA)}
            </div>

            <textarea
              className="w-full h-32 border rounded p-2 font-mono"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t(STR_ALL.FORMULA_PLACEHOLDER)}
            />

            <div className="flex gap-2 justify-end mt-3">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setOpenImport(false)}
              >
                {t(STR_ALL.CANCEL)}
              </button>

              <button
                className="px-3 py-1 rounded bg-emerald-600 text-white"
                onClick={() => {
                  const text = importText.trim();
                  if (!text) return;

                  const fn = onWorkspaceApi?.insertFromFormula;
                  if (!fn) {
                    alert(t(STR_ALL.IMPORT_API_NOT_READY));
                    return;
                  }

                  try {
                    fn(text);
                    setOpenImport(false);
                  } catch (e) {
                    console.error("[IMPORT] insertFromFormula crashed", e);
                    alert(t(STR_ALL.IMPORT_FAILED));
                  }
                }}
              >
                {t(STR_ALL.BLOCKIFY)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ribbon Content */}
      <div className="bg-white px-4 py-2 border-b border-gray-200">
        <div className="mt-2">
          <BlockPalette
            search={search}
            uiLang={uiLang}
            onBlockClick={onBlockClick}
            onHoverFn={setHoverFn}
            onSelectFn={(fn) => setSelectedFn(fn)}
          />
        </div>
      </div>
    </div>
  );
}
