export const JA = {
  STR_COMMON: {
    FUNCTIONS: "関数",
    SEARCH: "検索",

    NUMBER: "数値",
    TEXT: "文字列",
    CELL: "セル",
    CELL_REF: "セル参照",
    RANGE: "レンジ",

    ARITH: "四則演算",
    CMP: "比較",
    PAREN: "括弧",
    NAME: "変数",

    CANCEL: "キャンセル",
  },
  STR_STATUS: {
    LOADING_FUNCS: "関数一覧を読み込み中…",
    LOAD_FAILED: "関数一覧の読み込みに失敗しました",
    NO_BLOCKS_FOUND: "ブロックが見つかりません",

    GENERATED_FORMULA: "生成された数式",
    COPY_DONE: "コピー完了",

    BASIC: "基本",
    HISTORY: "履歴",
    NO_HISTORY: "履歴なし",
    FORMULA_PLACEHOLDER: "=SUM(A1,B1*2)",

    STATUS_READY: "準備完了",
    STATUS_WORKING: "処理中",
    STATUS_SAVED: "保存しました",
    STATUS_LOADED: "読み込みました",
    NO_SEARCH_RESULTS: "検索結果なし",
  },
  STR_TOOLTIP: {
    TOOLTIP_START: "Excel式の開始（先頭に = を付ける）",
    TOOLTIP_NUMBER: "数値リテラル",
    TOOLTIP_STRING: '文字列リテラル（"..." として出力）',
    TOOLTIP_CELL: "セル参照（例: A1, $B$2, Sheet1!C3）",
    TOOLTIP_RANGE: "レンジ参照（例: A1:B2, Sheet1!A:A）",
    TOOLTIP_ARITH: "四則演算",
    TOOLTIP_CMP: "比較演算",
    TOOLTIP_PAREN: "括弧でグルーピング",
    TOOLTIP_BOOL: "TRUE / FALSE",
  },
  STR_ACTION: {
    COPY: "コピー",
    PASTE: "貼り付け",
    BLOCKIFY: "ブロック化",

    IMPORT_FROM_FORMULA: "数式から作成",
    PASTE_FORMULA: "数式を貼り付け",
  },
  STR_DIALOG: {
    SELECT_BLOCK_PROMPT: "ブロックを選択すると数式がここに表示されます",

    IMPORT_API_NOT_READY: "ワークスペースがまだ準備できてへん。",
    IMPORT_FAILED: "数式の取り込みに失敗した。console見て！",
  },
  STR_MENU: {
    COPY_REF: "参照をコピー",
    COPY_VALUE: "値をコピー",
    COPY_TSV: "範囲をTSVでコピー",
    PASTE: "貼り付け",
    ADD_REF_BLOCK: "参照ブロックを追加",
    CLEAR_VALUE: "値をクリア",
    CLEAR_STYLE: "書式をクリア",
    CLEAR_ALL: "全部クリア",
  },
  STR_BLOCKLY_ACTION: {
    UNDO: "戻す",
    REDO: "進む",
    UNDO_LONG: "元に戻す",
    REDO_LONG: "やり直し",

    DUPLICATE: "複製",
    DELETE: "削除",
    SELECT_ALL: "すべて選択",

    ADD_COMMENT: "コメントを追加",
    REMOVE_COMMENT: "コメントを削除",

    COLLAPSE_BLOCK: "ブロックを折りたたむ",
    EXPAND_BLOCK: "ブロックを展開",
  },
  STR_COLLAPSE: {
    EXPAND_ALL: "すべて展開",
    COLLAPSE_ALL: "すべて折りたたむ",

    COLLAPSE_LEVEL: "この階層を折りたたむ",
    EXPAND_LEVEL: "この階層を展開",

    COLLAPSE_DEEPEST: "最下層を折りたたむ",
    EXPAND_DEEPEST: "最下層を展開",

    COLLAPSE_UPPER: "上位階層を折りたたむ",
    EXPAND_UPPER: "上位階層を展開",

    COLLAPSE_SELECTED: "選択中のみ折りたたむ",
    EXPAND_SELECTED: "選択中のみ展開",

    COLLAPSE_EXCEPT_SELECTED: "選択中以外を折りたたむ",
    EXPAND_EXCEPT_SELECTED: "選択中以外を展開",

    COLLAPSE_BY_DEPTH: "深さで折りたたむ",
    EXPAND_BY_DEPTH: "深さで展開",

    COLLAPSE_TO_LEVEL: "指定階層まで折りたたむ",
    EXPAND_TO_LEVEL: "指定階層まで展開",

    COLLAPSE_TEMP: "一時的に折りたたむ",
    EXPAND_TEMP: "一時的に展開",
  },
  STR_RIBBON: {
    TAB_FILE: "ファイル",
    TAB_FUNCTIONS: "関数",
    TAB_NAMED_FUNCTIONS: "名前付き関数",
    TAB_CHECK: "チェック",

    TOOLTIP_FILE: "ファイル操作",
    TOOLTIP_FUNCTIONS: "関数操作",
    TOOLTIP_NAMED_FUNCTIONS: "名前付き関数操作",
    TOOLTIP_CHECK: "チェック操作",
    HOVER_DESC_HINT: "関数にマウスを乗せると簡単な説明が表示されます。",
  },
  STR_FILETAB: {
    IMPORT: "インポート",
    EXPORT: "エクスポート",
    SAVE: "保存",
    LOAD: "読み込み",

    CONFIRM_OVERWRITE: "上書きしますか？",
    CONFIRM_IMPORT: "インポートしますか？",

    ALERT_NO_FILE: "ファイルが選択されていません",
    ALERT_IMPORT_FAILED: "インポートに失敗しました",
    ALERT_EXPORT_FAILED: "エクスポートに失敗しました",
  },
  STR_NAMED_FN: {
    CREATE_NEW: "新規作成",
    RENAME: "名前を変更",
    SAVE: "保存",
    OPEN: "開く",
    WORKSPACE_ACTIVE_TOOLTIP: "開いているワークスペース",
    INSERT_TO_MAIN: "メインに挿入",
    INSERT: "挿入",
    INSERT_FUNCTION: "関数を挿入",
    INSERT_CURRENT_PARAM: "現在のパラメータを挿入",
    NAMED_MANAGE: "管理…",
    NAMED_ADD_PARAM: "＋param",
    NAMED_TOOLTIP_INSERT_PARAM_BLOCK: "param ブロックを現在のWSに挿入",
    NAMED_TOOLTIP_INSERT_TO_CURRENT_WS: "を現在のWSに挿入",
  },
  STR_WORKSPACE_MODAL: {
    WORKSPACE_MANAGER: "ワークスペース管理",
    CLOSE: "閉じる",

    WORKSPACE_MAIN: "メイン",
    WORKSPACE_FUNCTION: "関数",
    WORKSPACE_LIST: "ワークスペース一覧",
    TOOLTIP_CREATE_NAMED_FN: "新しい名前付き関数を作成",
    MAIN_WORKSPACE: "メインワークスペース",
    ERROR_MAIN_WORKSPACE_NOT_FOUND:
      "メインワークスペースが見つかりません（異常）",
    NO_NAMED_FUNCTIONS: "まだ名前付き関数がありません",
    CONFIRM_DELETE_NAMED_FN:
      "「{name}」を削除しますか？\n呼び出しブロックは未定義状態になります。",
    EDIT: "編集",
    UNSAVED: "未保存",

    MAIN_WORKSPACE_HELP:
      "メインはここでは編集しません。「開く」で切り替えて編集してください。",

    LABEL_FUNCTION_NAME: "関数名",
    PLACEHOLDER_FUNCTION_NAME: "関数名",

    LABEL_DESCRIPTION: "説明",
    PLACEHOLDER_DESCRIPTION: "説明（検索・ホバーで表示されます）",

    SAVE: "保存",

    WARN_ON_UPDATE_META_MISSING_TITLE: "onUpdateFnMeta が未接続です",
    WARN_ON_UPDATE_META_MISSING_NOTE:
      "※ onUpdateFnMeta が未接続のため、現状は保存できません",

    HOW_TO_EDIT_TITLE: "編集の使い方",
    HOW_TO_EDIT_BODY:
      "左の一覧で関数を選んで「編集」を押すと、ここに編集フォームが出ます。",
  },
  STR_WORKSPACE_UI: {
    CONFIRM_DISCARD_CHANGES: "変更を破棄しますか？",
    CONFIRM_OK: "はい",
    CONFIRM_CANCEL: "いいえ",

    ALERT_NO_SELECTION: "選択されていません",
    ALERT_INVALID_OPERATION: "無効な操作です",

    STATUS_READY: "準備完了",
    STATUS_WORKING: "処理中",
    STATUS_SAVED: "保存しました",
    STATUS_LOADED: "読み込みました",
    STATUS_IMPORTED: "インポートしました",
    STATUS_EXPORTED: "エクスポートしました",

    ERROR_WS_API_NOT_READY: "ワークスペース API が未初期化です",
    ERROR_INIT_FAILED: "初期化に失敗しました",
    ERROR_CODEGEN_FAILED: "コード生成に失敗しました",
  },
  STR_XLSX_IMPORT: {
    ERROR_UNSUPPORTED_FORMAT: "対応していない形式です",
    ERROR_SHEET_NOT_FOUND: "シートが見つかりません",

    ERROR_EMPTY_BOOK: "ブックが空です",
    ERROR_INVALID_CELL: "不正なセルです",
    ERROR_INVALID_RANGE: "不正な範囲です",

    ERROR_PARSE_FAILED: "解析に失敗しました",
    ERROR_TOO_LARGE: "サイズが大きすぎます",
    ERROR_UNSUPPORTED_CELL: "未対応のセルです",
  },
  STR_PROJECT_OPS: {
    ERROR_WORKSPACE_NOT_FOUND: "ワークスペースが見つかりません",
    ERROR_INVALID_WORKSPACE_KIND: "不正なワークスペース種別です",

    ERROR_UNSUPPORTED_SCHEMA_VERSION: "未対応の schemaVersion です",

    ALERT_SAVE_FAILED: "保存に失敗しました",
    ALERT_LOAD_FAILED: "読み込みに失敗しました",
    STATUS_UPDATED: "更新しました",
  },
  STR_MISC: {
    BLOCK_COUNT_SUFFIX: "個のブロック",
    TEMP_DISPLAY: "一時表示",

    ALL: "すべて",
    NONE: "なし",
    UNKNOWN: "不明",
  },
  STR_VIEW: {
    VIEW: "表示",
    EXPAND: "展開",
    COLLAPSE: "全閉じ",
    FOCUS: "フォーカス",
    PATH: "ルート",
    ON: "ON",
    OFF: "OFF",
  },
  STR_MOBILE: {
    MOBILE_TAB_WORKSPACE: "ワークスペース",
    MOBILE_TAB_CELLS: "セル",
    MOBILE_TAB_FORMULA: "式",
  },
  STR_FILETAB_UI: {
    IMPORT_XLSX: "xlsx読込",
    IMPORT_NAMED_FNS: "名前付き関数 読込",
    EXPORT_NAMED_FNS: "名前付き関数 書出",
    SHEET_SWITCH: "シート",

    TOOLTIP_IMPORT_XLSX: "Excel (.xlsx) を読み込む",
    TOOLTIP_SHEET_SWITCH: "シート切替",
    TOOLTIP_IMPORT_NAMED_FNS: "名前付き関数 JSON を読み込む",
    TOOLTIP_EXPORT_NAMED_FNS: "名前付き関数 JSON を書き出す",
  },
} as const;
