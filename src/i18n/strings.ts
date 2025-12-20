export type UiLang = "en" | "ja";

export const STR = {
  FUNCTIONS: { en: "Functions", ja: "関数" },
  SEARCH: { en: "Search", ja: "検索" },

  NUMBER: { en: "Number", ja: "数値" },
  TEXT: { en: "Text", ja: "文字列" },
  CELL: { en: "Cell", ja: "セル" },
  CELL_REF: { en: "Cell reference", ja: "セル参照" },
  RANGE: { en: "Range", ja: "レンジ" },
  ARITH: { en: "Arithmetic", ja: "四則演算" },
  CMP: { en: "Compare", ja: "比較" },
  PAREN: { en: "Parentheses", ja: "括弧" },

  LOADING_FUNCS: { en: "Loading function list…", ja: "関数一覧を読み込み中…" },
  LOAD_FAILED: {
    en: "Failed to load function list",
    ja: "関数一覧の読み込みに失敗しました",
  },
  NO_BLOCKS_FOUND: { en: "No blocks found", ja: "ブロックが見つかりません" },

  TOOLTIP_START: {
    en: "Start of Excel formula (prepend =)",
    ja: "Excel式の開始（先頭に = を付ける）",
  },
  TOOLTIP_NUMBER: { en: "Number literal", ja: "数値リテラル" },
  TOOLTIP_STRING: {
    en: 'String literal (output as "...")',
    ja: '文字列リテラル（"..." として出力）',
  },
  TOOLTIP_CELL: {
    en: "Cell reference (e.g., A1, $B$2, Sheet1!C3)",
    ja: "セル参照（例: A1, $B$2, Sheet1!C3）",
  },
  TOOLTIP_RANGE: {
    en: "Range reference (e.g., A1:B2, Sheet1!A:A)",
    ja: "レンジ参照（例: A1:B2, Sheet1!A:A）",
  },
  TOOLTIP_ARITH: { en: "Arithmetic operations", ja: "四則演算" },
  TOOLTIP_CMP: { en: "Comparison operators", ja: "比較演算" },
  TOOLTIP_PAREN: { en: "Grouping with parentheses", ja: "括弧でグルーピング" },
  TOOLTIP_BOOL: { en: "TRUE / FALSE", ja: "TRUE / FALSE" },
} as const;

export function tr(lang: UiLang) {
  return (k: { en: string; ja: string }) => k[lang];
}

// Additional UI keys added below
export const STR_ADDITIONAL = {
  GENERATED_FORMULA: { en: "Generated Formula", ja: "生成された数式" },
  COPY: { en: "Copy", ja: "コピー" },
  COPY_DONE: { en: "Copied", ja: "コピー完了" },
  SELECT_BLOCK_PROMPT: {
    en: "Select a block to see the formula here",
    ja: "ブロックを選択すると数式がここに表示されます",
  },
  SELECTED_REF: { en: "Selected reference", ja: "選択中の参照" },

  BASIC: { en: "Basic", ja: "基本" },
  HISTORY: { en: "History", ja: "履歴" },
  NO_HISTORY: { en: "No history", ja: "履歴なし" },
  IMPORT_FROM_FORMULA: { en: "From formula", ja: "数式から作成" },
  PASTE_FORMULA: { en: "Paste a formula", ja: "数式を貼り付け" },
  FORMULA_PLACEHOLDER: { en: "=SUM(A1,B1*2)", ja: "=SUM(A1,B1*2)" },
  CANCEL: { en: "Cancel", ja: "キャンセル" },
  BLOCKIFY: { en: "Blockify", ja: "ブロック化" },
  IMPORT_API_NOT_READY: {
    en: "Workspace is not ready yet.",
    ja: "ワークスペースがまだ準備できてへん。",
  },
  IMPORT_FAILED: {
    en: "Failed to import formula. Check console.",
    ja: "数式の取り込みに失敗した。console見て！",
  },
} as const;

// Helper to merge STR and STR_ADDITIONAL when needed
export const STR_ALL = {
  ...STR,
  ...STR_ADDITIONAL,
} as const;

// Context menu labels
export const STR_MENU = {
  COPY_REF: { en: "Copy reference", ja: "参照をコピー" },
  COPY_VALUE: { en: "Copy value", ja: "値をコピー" },
  COPY_TSV: { en: "Copy range (TSV)", ja: "範囲をTSVでコピー" },
  PASTE: { en: "Paste", ja: "貼り付け" },
  ADD_REF_BLOCK: { en: "Add reference block", ja: "参照ブロックを追加" },
  CLEAR_VALUE: { en: "Clear value", ja: "値をクリア" },
  CLEAR_STYLE: { en: "Clear formatting", ja: "書式をクリア" },
  CLEAR_ALL: { en: "Clear all", ja: "全部クリア" },
} as const;

export const STR_ALL_MERGED = {
  ...STR_ALL,
  ...STR_MENU,
} as const;
