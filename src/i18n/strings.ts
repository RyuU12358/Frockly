export type UiLang = "en" | "ja";
export const STR_COMMON = {
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
  NAME: { en: "var", ja: "変数" },

  CANCEL: { en: "Cancel", ja: "キャンセル" },
} as const;
export const STR_STATUS = {
  LOADING_FUNCS: { en: "Loading function list…", ja: "関数一覧を読み込み中…" },
  LOAD_FAILED: {
    en: "Failed to load function list",
    ja: "関数一覧の読み込みに失敗しました",
  },
  NO_BLOCKS_FOUND: { en: "No blocks found", ja: "ブロックが見つかりません" },

  GENERATED_FORMULA: { en: "Generated Formula", ja: "生成された数式" },
  COPY_DONE: { en: "Copied", ja: "コピー完了" },

  // ★ここ追加（不足分）
  BASIC: { en: "Basic", ja: "基本" },
  HISTORY: { en: "History", ja: "履歴" },
  NO_HISTORY: { en: "No history", ja: "履歴なし" },
  FORMULA_PLACEHOLDER: { en: "=SUM(A1,B1*2)", ja: "=SUM(A1,B1*2)" },

  STATUS_READY: { en: "Ready", ja: "準備完了" },
  STATUS_WORKING: { en: "Working", ja: "処理中" },
  STATUS_SAVED: { en: "Saved", ja: "保存しました" },
  STATUS_LOADED: { en: "Loaded", ja: "読み込みました" },
  NO_SEARCH_RESULTS: { en: "No results found", ja: "検索結果なし" },
} as const;

export const STR_TOOLTIP = {
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
export const STR_ACTION = {
  COPY: { en: "Copy", ja: "コピー" },
  PASTE: { en: "Paste", ja: "貼り付け" },
  BLOCKIFY: { en: "Blockify", ja: "ブロック化" },

  IMPORT_FROM_FORMULA: { en: "From formula", ja: "数式から作成" },
  PASTE_FORMULA: { en: "Paste a formula", ja: "数式を貼り付け" },
} as const;
export const STR_DIALOG = {
  SELECT_BLOCK_PROMPT: {
    en: "Select a block to see the formula here",
    ja: "ブロックを選択すると数式がここに表示されます",
  },

  IMPORT_API_NOT_READY: {
    en: "Workspace is not ready yet.",
    ja: "ワークスペースがまだ準備できてへん。",
  },
  IMPORT_FAILED: {
    en: "Failed to import formula. Check console.",
    ja: "数式の取り込みに失敗した。console見て！",
  },
} as const;
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
export const STR_BLOCKLY_ACTION = {
  UNDO: { en: "Undo", ja: "戻す" },
  REDO: { en: "Redo", ja: "進む" },
  UNDO_LONG: { en: "Undo", ja: "元に戻す" },
  REDO_LONG: { en: "Redo", ja: "やり直し" },

  DUPLICATE: { en: "Duplicate", ja: "複製" },
  DELETE: { en: "Delete", ja: "削除" },
  SELECT_ALL: { en: "Select all", ja: "すべて選択" },

  ADD_COMMENT: { en: "Add comment", ja: "コメントを追加" },
  REMOVE_COMMENT: { en: "Remove comment", ja: "コメントを削除" },

  COLLAPSE_BLOCK: { en: "Collapse block", ja: "ブロックを折りたたむ" },
  EXPAND_BLOCK: { en: "Expand block", ja: "ブロックを展開" },
} as const;
export const STR_COLLAPSE = {
  EXPAND_ALL: { en: "Expand all", ja: "すべて展開" },
  COLLAPSE_ALL: { en: "Collapse all", ja: "すべて折りたたむ" },

  COLLAPSE_LEVEL: { en: "Collapse this level", ja: "この階層を折りたたむ" },
  EXPAND_LEVEL: { en: "Expand this level", ja: "この階層を展開" },

  COLLAPSE_DEEPEST: { en: "Collapse deepest level", ja: "最下層を折りたたむ" },
  EXPAND_DEEPEST: { en: "Expand deepest level", ja: "最下層を展開" },

  COLLAPSE_UPPER: { en: "Collapse upper level", ja: "上位階層を折りたたむ" },
  EXPAND_UPPER: { en: "Expand upper level", ja: "上位階層を展開" },

  COLLAPSE_SELECTED: { en: "Collapse selected", ja: "選択中のみ折りたたむ" },
  EXPAND_SELECTED: { en: "Expand selected", ja: "選択中のみ展開" },

  COLLAPSE_EXCEPT_SELECTED: {
    en: "Collapse except selected",
    ja: "選択中以外を折りたたむ",
  },
  EXPAND_EXCEPT_SELECTED: {
    en: "Expand except selected",
    ja: "選択中以外を展開",
  },

  COLLAPSE_BY_DEPTH: { en: "Collapse by depth", ja: "深さで折りたたむ" },
  EXPAND_BY_DEPTH: { en: "Expand by depth", ja: "深さで展開" },

  COLLAPSE_TO_LEVEL: { en: "Collapse to level", ja: "指定階層まで折りたたむ" },
  EXPAND_TO_LEVEL: { en: "Expand to level", ja: "指定階層まで展開" },

  COLLAPSE_TEMP: { en: "Collapse temporarily", ja: "一時的に折りたたむ" },
  EXPAND_TEMP: { en: "Expand temporarily", ja: "一時的に展開" },
} as const;
export const STR_RIBBON = {
  TAB_FILE: { en: "File", ja: "ファイル" },
  TAB_FUNCTIONS: { en: "Functions", ja: "関数" },
  TAB_NAMED_FUNCTIONS: { en: "Named functions", ja: "名前付き関数" },
  TAB_CHECK: { en: "Check", ja: "チェック" },

  TOOLTIP_FILE: { en: "File actions", ja: "ファイル操作" },
  TOOLTIP_FUNCTIONS: { en: "Function actions", ja: "関数操作" },
  TOOLTIP_NAMED_FUNCTIONS: {
    en: "Named function actions",
    ja: "名前付き関数操作",
  },
  TOOLTIP_CHECK: { en: "Check actions", ja: "チェック操作" },
} as const;
export const STR_FILETAB = {
  IMPORT: { en: "Import", ja: "インポート" },
  EXPORT: { en: "Export", ja: "エクスポート" },
  SAVE: { en: "Save", ja: "保存" },
  LOAD: { en: "Load", ja: "読み込み" },

  CONFIRM_OVERWRITE: { en: "Overwrite?", ja: "上書きしますか？" },
  CONFIRM_IMPORT: { en: "Import?", ja: "インポートしますか？" },

  ALERT_NO_FILE: { en: "No file selected", ja: "ファイルが選択されていません" },
  ALERT_IMPORT_FAILED: { en: "Import failed", ja: "インポートに失敗しました" },
  ALERT_EXPORT_FAILED: {
    en: "Export failed",
    ja: "エクスポートに失敗しました",
  },
} as const;
export const STR_NAMED_FN = {
  CREATE_NEW: { en: "Create new", ja: "新規作成" },
  RENAME: { en: "Rename", ja: "名前を変更" },
  SAVE: { en: "Save", ja: "保存" },
  OPEN: { en: "Open", ja: "開く" },
  WORKSPACE_ACTIVE_TOOLTIP: {
    en: "Workspace active tooltip",
    ja: "開いているワークスペース",
  },
  INSERT_TO_MAIN: { en: "Insert to main", ja: "メインに挿入" },
  INSERT: { en: "Insert", ja: "挿入" },
  INSERT_FUNCTION: { en: "Insert function", ja: "関数を挿入" },
  INSERT_CURRENT_PARAM: {
    en: "Insert current param",
    ja: "現在のパラメータを挿入",
  },
  NAMED_MANAGE: { en: "Manage…", ja: "管理…" },
  NAMED_ADD_PARAM: { en: "+param", ja: "＋param" },
  NAMED_TOOLTIP_INSERT_PARAM_BLOCK: {
    en: "Insert param block into current workspace",
    ja: "param ブロックを現在のWSに挿入",
  },
  NAMED_TOOLTIP_INSERT_TO_CURRENT_WS: {
    en: "Insert into current workspace",
    ja: "を現在のWSに挿入",
  },
} as const;
export const STR_WORKSPACE_MODAL = {
  WORKSPACE_MANAGER: { en: "Workspace manager", ja: "ワークスペース管理" },
  CLOSE: { en: "Close", ja: "閉じる" },

  WORKSPACE_MAIN: { en: "Main", ja: "メイン" },
  WORKSPACE_FUNCTION: { en: "Function", ja: "関数" },
  WORKSPACE_LIST: { en: "Workspaces", ja: "ワークスペース一覧" },
  TOOLTIP_CREATE_NAMED_FN: {
    en: "Create a new named function",
    ja: "新しい名前付き関数を作成",
  },
  MAIN_WORKSPACE: { en: "Main workspace", ja: "メインワークスペース" },
  ERROR_MAIN_WORKSPACE_NOT_FOUND: {
    en: "Main workspace not found (unexpected)",
    ja: "メインワークスペースが見つかりません（異常）",
  },
  NO_NAMED_FUNCTIONS: {
    en: "No named functions yet",
    ja: "まだ名前付き関数がありません",
  },
  CONFIRM_DELETE_NAMED_FN: {
    en: 'Delete "{name}"?\nCall blocks will become undefined.',
    ja: "「{name}」を削除しますか？\n呼び出しブロックは未定義状態になります。",
  },
  EDIT: { en: "Edit", ja: "編集" },
  UNSAVED: { en: "Unsaved", ja: "未保存" },

  MAIN_WORKSPACE_HELP: {
    en: 'Main is not edited here. Switch workspace with "Open" to edit.',
    ja: "メインはここでは編集しません。「開く」で切り替えて編集してください。",
  },

  LABEL_FUNCTION_NAME: { en: "Function name", ja: "関数名" },
  PLACEHOLDER_FUNCTION_NAME: { en: "Function name", ja: "関数名" },

  LABEL_DESCRIPTION: { en: "Description", ja: "説明" },
  PLACEHOLDER_DESCRIPTION: {
    en: "Description (shown in search/hover)",
    ja: "説明（検索・ホバーで表示されます）",
  },

  SAVE: { en: "Save", ja: "保存" },

  WARN_ON_UPDATE_META_MISSING_TITLE: {
    en: "onUpdateFnMeta is not connected",
    ja: "onUpdateFnMeta が未接続です",
  },
  WARN_ON_UPDATE_META_MISSING_NOTE: {
    en: "onUpdateFnMeta is not connected, so saving is currently unavailable.",
    ja: "※ onUpdateFnMeta が未接続のため、現状は保存できません",
  },

  HOW_TO_EDIT_TITLE: { en: "How to edit", ja: "編集の使い方" },
  HOW_TO_EDIT_BODY: {
    en: 'Select a function on the left and press "Edit" to show the form here.',
    ja: "左の一覧で関数を選んで「編集」を押すと、ここに編集フォームが出ます。",
  },
} as const;
export const STR_WORKSPACE_UI = {
  // confirm
  CONFIRM_DISCARD_CHANGES: {
    en: "Discard changes?",
    ja: "変更を破棄しますか？",
  },
  CONFIRM_OK: { en: "Yes", ja: "はい" },
  CONFIRM_CANCEL: { en: "No", ja: "いいえ" },

  // alert
  ALERT_NO_SELECTION: { en: "Nothing selected", ja: "選択されていません" },
  ALERT_INVALID_OPERATION: { en: "Invalid operation", ja: "無効な操作です" },

  // status
  STATUS_READY: { en: "Ready", ja: "準備完了" },
  STATUS_WORKING: { en: "Working", ja: "処理中" },
  STATUS_SAVED: { en: "Saved", ja: "保存しました" },
  STATUS_LOADED: { en: "Loaded", ja: "読み込みました" },
  STATUS_IMPORTED: { en: "Imported", ja: "インポートしました" },
  STATUS_EXPORTED: { en: "Exported", ja: "エクスポートしました" },

  // errors (WS)
  ERROR_WS_API_NOT_READY: {
    en: "Workspace API not ready",
    ja: "ワークスペース API が未初期化です",
  },
  ERROR_INIT_FAILED: {
    en: "Initialization failed",
    ja: "初期化に失敗しました",
  },
  ERROR_CODEGEN_FAILED: {
    en: "Code generation failed",
    ja: "コード生成に失敗しました",
  },
} as const;
export const STR_XLSX_IMPORT = {
  ERROR_UNSUPPORTED_FORMAT: {
    en: "Unsupported format",
    ja: "対応していない形式です",
  },
  ERROR_SHEET_NOT_FOUND: {
    en: "Sheet not found",
    ja: "シートが見つかりません",
  },

  ERROR_EMPTY_BOOK: { en: "Workbook is empty", ja: "ブックが空です" },
  ERROR_INVALID_CELL: { en: "Invalid cell", ja: "不正なセルです" },
  ERROR_INVALID_RANGE: { en: "Invalid range", ja: "不正な範囲です" },

  ERROR_PARSE_FAILED: { en: "Failed to parse", ja: "解析に失敗しました" },
  ERROR_TOO_LARGE: { en: "Too large", ja: "サイズが大きすぎます" },
  ERROR_UNSUPPORTED_CELL: { en: "Unsupported cell", ja: "未対応のセルです" },
} as const;
export const STR_PROJECT_OPS = {
  ERROR_WORKSPACE_NOT_FOUND: {
    en: "Workspace not found",
    ja: "ワークスペースが見つかりません",
  },
  ERROR_INVALID_WORKSPACE_KIND: {
    en: "Invalid workspace kind",
    ja: "不正なワークスペース種別です",
  },

  ERROR_UNSUPPORTED_SCHEMA_VERSION: {
    en: "Unsupported schemaVersion",
    ja: "未対応の schemaVersion です",
  },

  ALERT_SAVE_FAILED: { en: "Save failed", ja: "保存に失敗しました" },
  ALERT_LOAD_FAILED: { en: "Load failed", ja: "読み込みに失敗しました" },
  STATUS_UPDATED: { en: "Updated", ja: "更新しました" },
} as const;
export const STR_MISC = {
  BLOCK_COUNT_SUFFIX: { en: "blocks", ja: "個のブロック" },
  TEMP_DISPLAY: { en: "Temporary", ja: "一時表示" },

  ALL: { en: "All", ja: "すべて" },
  NONE: { en: "None", ja: "なし" },
  UNKNOWN: { en: "Unknown", ja: "不明" },
} as const;
export const STR_VIEW = {
  VIEW: { en: "View", ja: "表示" },
  EXPAND: { en: "Expand", ja: "展開" },
  COLLAPSE: { en: "Collapse", ja: "全閉じ" },
  FOCUS: { en: "Focus", ja: "フォーカス" },
  PATH: { en: "Path", ja: "ルート" },
  ON: { en: "ON", ja: "ON" },
  OFF: { en: "OFF", ja: "OFF" },
} as const;
export const STR_MOBILE = {
  MOBILE_TAB_WORKSPACE: { en: "Workspace", ja: "ワークスペース" },
  MOBILE_TAB_CELLS: { en: "Cells", ja: "セル" },
  MOBILE_TAB_FORMULA: { en: "Formula", ja: "式" },
} as const;
export const STR_FILETAB_UI = {
  IMPORT_XLSX: { en: "Import .xlsx", ja: "xlsx読込" },
  IMPORT_NAMED_FNS: { en: "Import named functions", ja: "名前付き関数 読込" },
  EXPORT_NAMED_FNS: { en: "Export named functions", ja: "名前付き関数 書出" },
  SHEET_SWITCH: { en: "Sheet", ja: "シート" },

  TOOLTIP_IMPORT_XLSX: {
    en: "Import Excel (.xlsx)",
    ja: "Excel (.xlsx) を読み込む",
  },
  TOOLTIP_SHEET_SWITCH: { en: "Switch sheet", ja: "シート切替" },
  TOOLTIP_IMPORT_NAMED_FNS: {
    en: "Import named functions JSON",
    ja: "名前付き関数 JSON を読み込む",
  },
  TOOLTIP_EXPORT_NAMED_FNS: {
    en: "Export named functions JSON",
    ja: "名前付き関数 JSON を書き出す",
  },
} as const;
export const STR = {
  ...STR_COMMON,
  ...STR_STATUS,
  ...STR_TOOLTIP,
  ...STR_ACTION,
  ...STR_DIALOG,
  ...STR_MENU,
  ...STR_BLOCKLY_ACTION,
  ...STR_COLLAPSE,
  ...STR_RIBBON,
  ...STR_FILETAB,
  ...STR_NAMED_FN,
  ...STR_WORKSPACE_MODAL,
  ...STR_WORKSPACE_UI,
  ...STR_XLSX_IMPORT,
  ...STR_PROJECT_OPS,
  ...STR_MISC,
  ...STR_VIEW,
  ...STR_MOBILE,
  ...STR_FILETAB_UI,
} as const;

export type StrKey = keyof typeof STR;

export function tr(lang: UiLang) {
  return (k: StrKey | { en: string; ja: string }) =>
    typeof k === "string" ? STR[k][lang] : k[lang];
}
