// src\components\ribbon\tabs\BlockPalette.tsx
import { useEffect, useMemo, useState } from "react";
import type { FnSpec } from "../../../blocks/gen/types";
import { STR, tr } from "../../../i18n/strings";
import { searchFunctionsEN } from "../../../search/en/searchFunctionsEN";
import { searchFunctionsJP } from "../../../search/jp";
import { loadFnList } from "../../../blocks/gen/fnListLoader";
import { RibbonButton } from "./RibbonButton";
import { RibbonSeparator } from "./RibbonSeparator";

function isAsciiOnly(s: string) {
  return /^[\x00-\x7F]*$/.test(s);
}

interface BlockDef {
  type: string;
  label: string;
  haystack?: string;
}

interface BlockPaletteProps {
  search?: string;
  uiLang: "en" | "ja";
  onBlockClick?: (blockType: string) => void;

  // ★追加
  onHoverFn?: (key: string | null) => void; // ★ "excel:SUM" を渡す

  onSelectFn?: (fn: string) => void; // クリック固定したいなら
}

const PINNED_EXCEL = [
  "SUM",
  "AVERAGE",
  "MIN",
  "MAX",
  "IF",
  "AND",
  "OR",
  "COUNT",
  "COUNTIF",
  "COUNTIFS",
  "SUMIF",
  "SUMIFS",
  "VLOOKUP",
  "XLOOKUP",
];

const MAX_RESULTS = 7;
const PINNED_MAX = 10;

const MIN_SCORE = 0.35;
const RELATIVE = 0.75; // 1位の75%以上だけ残す

function fnToBlockType(fn: string) {
  return `frockly_${fn.toUpperCase()}`;
}

export function BlockPalette({
  search = "",
  uiLang,
  onBlockClick,
  onHoverFn,
  onSelectFn,
}: BlockPaletteProps) {
  
  const t = useMemo(() => tr(uiLang), [uiLang]);
  useEffect(() => {
    console.log("[PATH] Palette uiLang =", uiLang);
  }, [uiLang]);

  const BASE_BLOCKS: BlockDef[] = useMemo(
    () => [
      { type: "basic_start", label: "=", haystack: "= start" },

      { type: "basic_number", label: t(STR.NUMBER), haystack: "number 数値" },
      { type: "basic_string", label: t(STR.TEXT), haystack: "text 文字列" },

      {
        type: "basic_cell",
        label: t(STR.CELL_REF),
        haystack: "cell ref セル参照",
      },
      { type: "basic_range", label: t(STR.RANGE), haystack: "range レンジ" },

      {
        type: "basic_arith",
        label: t(STR.ARITH),
        haystack: "arith 四則 + - * /",
      },
      {
        type: "basic_cmp",
        label: t(STR.CMP),
        haystack: "compare 比較 = <> < <= > >=",
      },

      { type: "basic_paren", label: t(STR.PAREN), haystack: "paren 括弧 ()" },
      { type: "basic_name", label: t(STR.NAME), haystack: "name 名前" },
    ],
    [t]
  );

  const q = search.trim().toLowerCase();

  const [specs, setSpecs] = useState<FnSpec[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string>("");

  const [semantic, setSemantic] = useState<
    { fn: string; score: number }[] | null
  >(null);
  const [, setSemErr] = useState<string>("");
  const [, setIsSearching] = useState(false);

  const langMode = useMemo(() => {
    if (uiLang === "en") return "en";
    return isAsciiOnly(q) ? "en" : "ja";
  }, [uiLang, q]);

  useEffect(() => {
    let cancelled = false;

    setSemantic(null);
    setSemErr("");
    setIsSearching(false);

    if (!loaded || err) return;
    if (!q) return;
    if (q.length < 2) return;

    setIsSearching(true);

    const t = window.setTimeout(() => {
      (async () => {
        try {
          const hits =
            langMode === "en"
              ? await searchFunctionsEN(q, MAX_RESULTS)
              : await searchFunctionsJP(q, MAX_RESULTS);

          if (!cancelled) setSemantic(hits);
        } catch (e: any) {
          if (!cancelled) {
            setSemantic(null);
            setSemErr(String(e?.message ?? e ?? "semantic search error"));
          }
        } finally {
          if (!cancelled) setIsSearching(false);
        }
      })();
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q, loaded, err, langMode]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setErr("");
        const s = await loadFnList();

        if (cancelled) return;
        setSpecs(s);
        setLoaded(true);
      } catch (e: any) {
        if (cancelled) return;
        setErr(String(e?.message ?? e ?? "load error"));
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const excelBlocks: BlockDef[] = useMemo(() => {
    return specs.map((s) => {
      const name = s.name.toUpperCase();
      const vari = s.variadic ? "variadic" : "fixed";
      const info = s.variadic
        ? `min=${s.min} step=${s.step ?? 1} max=${s.max ?? 0} ${vari}`
        : `args=${s.min} ${vari}`;

      return {
        type: fnToBlockType(name),
        label: name,
        haystack: `${name} ${info}`.toLowerCase(),
      };
    });
  }, [specs]);

  const excelByFn = useMemo(() => {
    const m = new Map<string, BlockDef>();
    for (const b of excelBlocks) m.set(b.label.toUpperCase(), b);
    return m;
  }, [excelBlocks]);

  const semanticBlocks: BlockDef[] = useMemo(() => {
    if (!semantic) return [];

    const best = semantic[0]?.score ?? 0;
    const out: BlockDef[] = [];

    for (const h of semantic) {
      if (h.score < MIN_SCORE) continue;
      if (best > 0 && h.score < best * RELATIVE) continue;

      const b = excelByFn.get(h.fn.toUpperCase());
      if (b) out.push(b);
      if (out.length >= MAX_RESULTS) break;
    }
    return out;
  }, [semantic, excelByFn]);

  const pinnedBlocks: BlockDef[] = useMemo(() => {
    const map = new Map(excelBlocks.map((b) => [b.label, b]));

    const pinnedOrdered: BlockDef[] = [];
    for (const fn of PINNED_EXCEL) {
      const b = map.get(fn.toUpperCase());
      if (b) pinnedOrdered.push(b);
    }

    const seen = new Set<string>();
    return pinnedOrdered
      .filter((b) => (seen.has(b.type) ? false : (seen.add(b.type), true)))
      .slice(0, PINNED_MAX); // ★ ここで10個に制限
  }, [excelBlocks]);

  // ★ 右側に出すやつだけ作る（左は常に BASE_BLOCKS）
  const rightBlocks: BlockDef[] = useMemo(() => {
    if (!loaded || err) return [];
    if (q.length === 0) return pinnedBlocks;

    const qUpper = q.toUpperCase();
    const seen = new Set<string>();
    const out: BlockDef[] = [];

    // ① 完全一致
    const exact = excelBlocks.find((b) => b.label === qUpper);
    if (exact) {
      out.push(exact);
      seen.add(exact.type);
    }

    // ② 前方一致
    for (const b of excelBlocks) {
      if (b.label.startsWith(qUpper) && !seen.has(b.type)) {
        out.push(b);
        seen.add(b.type);
      }
      if (out.length >= MAX_RESULTS) break;
    }

    // ③ embedding（semanticBlocks を合流）
    for (const b of semanticBlocks) {
      if (!seen.has(b.type)) {
        out.push(b);
        seen.add(b.type);
      }
      if (out.length >= MAX_RESULTS) break;
    }

    // ④ フォールバック（保険）
    for (const b of excelBlocks) {
      if (
        out.length < MAX_RESULTS &&
        !seen.has(b.type) &&
        (b.label.toLowerCase().includes(q) || b.haystack?.includes(q))
      ) {
        out.push(b);
        seen.add(b.type);
      }
      if (out.length >= MAX_RESULTS) break;
    }

    return out.slice(0, MAX_RESULTS);
  }, [q, loaded, err, excelBlocks, pinnedBlocks, semanticBlocks]);

  return (
    <div className="py-1">
      {!loaded && (
        <div className="text-xs text-gray-500 py-1">{t(STR.LOADING_FUNCS)}</div>
      )}

      {loaded && err && (
        <div className="text-xs text-red-600 py-1">
          {t(STR.LOAD_FAILED)}: {err}
        </div>
      )}

      {/* ★ リボン本体：高さ固定 */}
      <div className="h-[36px] flex items-stretch px-2 overflow-hidden">
        {/* 左：基本ブロック（横スクロールのみ） */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden py-1">
          {BASE_BLOCKS.map((b) => (
            <RibbonButton
              key={b.type}
              title={b.label}
              onClick={() => onBlockClick?.(b.type)}
            >
              {b.label}
            </RibbonButton>
          ))}
        </div>

        {/* 区切り線（常に固定） */}
        {rightBlocks.length > 0 && <RibbonSeparator />}

        {/* 右：Pinned or 検索結果（横スクロールのみ） */}
        {rightBlocks.length > 0 && (
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden py-1">
            {rightBlocks.map((b) => (
              <RibbonButton
                key={b.type}
                title={b.label}
                onClick={() => {
                  onBlockClick?.(b.type);
                  onSelectFn?.(b.label.toUpperCase());
                }}
                onMouseEnter={() =>
                  onHoverFn?.(`excel:${b.label.toUpperCase()}`)
                }
                onMouseLeave={() => onHoverFn?.(null)}
              >
                {b.label}
              </RibbonButton>
            ))}
          </div>
        )}
      </div>

      {/* ★ リボン外に出す：固定高さを壊さない */}
      {loaded && !err && q.length > 0 && rightBlocks.length === 0 && (
        <div className="text-xs text-gray-500 py-1">
          {t(STR.NO_BLOCKS_FOUND)}
        </div>
      )}
    </div>
  );
}
