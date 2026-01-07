export const EN = {
  STR_COMMON: {
    FUNCTIONS: "Functions",
    SEARCH: "Search",

    NUMBER: "Number",
    TEXT: "Text",
    CELL: "Cell",
    CELL_REF: "Cell reference",
    RANGE: "Range",

    ARITH: "Arithmetic",
    CMP: "Compare",
    PAREN: "Parentheses",
    NAME: "var",

    CANCEL: "Cancel",
  },
  STR_STATUS: {
    LOADING_FUNCS: "Loading function list…",
    LOAD_FAILED: "Failed to load function list",
    NO_BLOCKS_FOUND: "No blocks found",

    GENERATED_FORMULA: "Generated Formula",
    COPY_DONE: "Copied",

    BASIC: "Basic",
    HISTORY: "History",
    NO_HISTORY: "No history",
    FORMULA_PLACEHOLDER: "=SUM(A1,B1*2)",

    STATUS_READY: "Ready",
    STATUS_WORKING: "Working",
    STATUS_SAVED: "Saved",
    STATUS_LOADED: "Loaded",
    NO_SEARCH_RESULTS: "No results found",
  },
  STR_TOOLTIP: {
    TOOLTIP_START: "Start of Excel formula (prepend =)",
    TOOLTIP_NUMBER: "Number literal",
    TOOLTIP_STRING: 'String literal (output as "...")',
    TOOLTIP_CELL: "Cell reference (e.g., A1, $B$2, Sheet1!C3)",
    TOOLTIP_RANGE: "Range reference (e.g., A1:B2, Sheet1!A:A)",
    TOOLTIP_ARITH: "Arithmetic operations",
    TOOLTIP_CMP: "Comparison operators",
    TOOLTIP_PAREN: "Grouping with parentheses",
    TOOLTIP_BOOL: "TRUE / FALSE",
  },
  STR_ACTION: {
    COPY: "Copy",
    PASTE: "Paste",
    BLOCKIFY: "Blockify",

    IMPORT_FROM_FORMULA: "From formula",
    PASTE_FORMULA: "Paste a formula",
  },
  STR_DIALOG: {
    SELECT_BLOCK_PROMPT: "Select a block to see the formula here",

    IMPORT_API_NOT_READY: "Workspace is not ready yet.",
    IMPORT_FAILED: "Failed to import formula. Check console.",
  },
  STR_MENU: {
    COPY_REF: "Copy reference",
    COPY_VALUE: "Copy value",
    COPY_TSV: "Copy range (TSV)",
    PASTE: "Paste",
    ADD_REF_BLOCK: "Add reference block",
    CLEAR_VALUE: "Clear value",
    CLEAR_STYLE: "Clear formatting",
    CLEAR_ALL: "Clear all",
  },
  STR_BLOCKLY_ACTION: {
    UNDO: "Undo",
    REDO: "Redo",
    UNDO_LONG: "Undo",
    REDO_LONG: "Redo",

    DUPLICATE: "Duplicate",
    DELETE: "Delete",
    SELECT_ALL: "Select all",

    ADD_COMMENT: "Add comment",
    REMOVE_COMMENT: "Remove comment",

    COLLAPSE_BLOCK: "Collapse block",
    EXPAND_BLOCK: "Expand block",
  },
  STR_COLLAPSE: {
    EXPAND_ALL: "Expand all",
    COLLAPSE_ALL: "Collapse all",

    COLLAPSE_LEVEL: "Collapse this level",
    EXPAND_LEVEL: "Expand this level",

    COLLAPSE_DEEPEST: "Collapse deepest level",
    EXPAND_DEEPEST: "Expand deepest level",

    COLLAPSE_UPPER: "Collapse upper level",
    EXPAND_UPPER: "Expand upper level",

    COLLAPSE_SELECTED: "Collapse selected",
    EXPAND_SELECTED: "Expand selected",

    COLLAPSE_EXCEPT_SELECTED: "Collapse except selected",
    EXPAND_EXCEPT_SELECTED: "Expand except selected",

    COLLAPSE_BY_DEPTH: "Collapse by depth",
    EXPAND_BY_DEPTH: "Expand by depth",

    COLLAPSE_TO_LEVEL: "Collapse to level",
    EXPAND_TO_LEVEL: "Expand to level",

    COLLAPSE_TEMP: "Collapse temporarily",
    EXPAND_TEMP: "Expand temporarily",
  },
  STR_RIBBON: {
    TAB_FILE: "File",
    TAB_FUNCTIONS: "Functions",
    TAB_NAMED_FUNCTIONS: "Named functions",
    TAB_CHECK: "Check",

    TOOLTIP_FILE: "File actions",
    TOOLTIP_FUNCTIONS: "Function actions",
    TOOLTIP_NAMED_FUNCTIONS: "Named function actions",
    TOOLTIP_CHECK: "Check actions",
    HOVER_DESC_HINT: "Hover a function to see a short description.",
  },
  STR_FILETAB: {
    IMPORT: "Import",
    EXPORT: "Export",
    SAVE: "Save",
    LOAD: "Load",

    CONFIRM_OVERWRITE: "Overwrite?",
    CONFIRM_IMPORT: "Import?",

    ALERT_NO_FILE: "No file selected",
    ALERT_IMPORT_FAILED: "Import failed",
    ALERT_EXPORT_FAILED: "Export failed",
  },
  STR_NAMED_FN: {
    CREATE_NEW: "Create new",
    RENAME: "Rename",
    SAVE: "Save",
    OPEN: "Open",
    WORKSPACE_ACTIVE_TOOLTIP: "Workspace active tooltip",
    INSERT_TO_MAIN: "Insert to main",
    INSERT: "Insert",
    INSERT_FUNCTION: "Insert function",
    INSERT_CURRENT_PARAM: "Insert current param",
    NAMED_MANAGE: "Manage…",
    NAMED_ADD_PARAM: "+param",
    NAMED_TOOLTIP_INSERT_PARAM_BLOCK:
      "Insert param block into current workspace",
    NAMED_TOOLTIP_INSERT_TO_CURRENT_WS: "Insert into current workspace",
  },
  STR_WORKSPACE_MODAL: {
    WORKSPACE_MANAGER: "Workspace manager",
    CLOSE: "Close",

    WORKSPACE_MAIN: "Main",
    WORKSPACE_FUNCTION: "Function",
    WORKSPACE_LIST: "Workspaces",
    TOOLTIP_CREATE_NAMED_FN: "Create a new named function",
    MAIN_WORKSPACE: "Main workspace",
    ERROR_MAIN_WORKSPACE_NOT_FOUND: "Main workspace not found (unexpected)",
    NO_NAMED_FUNCTIONS: "No named functions yet",
    CONFIRM_DELETE_NAMED_FN:
      'Delete "{name}"?\nCall blocks will become undefined.',
    EDIT: "Edit",
    UNSAVED: "Unsaved",

    MAIN_WORKSPACE_HELP:
      'Main is not edited here. Switch workspace with "Open" to edit.',

    LABEL_FUNCTION_NAME: "Function name",
    PLACEHOLDER_FUNCTION_NAME: "Function name",

    LABEL_DESCRIPTION: "Description",
    PLACEHOLDER_DESCRIPTION: "Description (shown in search/hover)",

    SAVE: "Save",

    WARN_ON_UPDATE_META_MISSING_TITLE: "onUpdateFnMeta is not connected",
    WARN_ON_UPDATE_META_MISSING_NOTE:
      "onUpdateFnMeta is not connected, so saving is currently unavailable.",

    HOW_TO_EDIT_TITLE: "How to edit",
    HOW_TO_EDIT_BODY:
      'Select a function on the left and press "Edit" to show the form here.',
  },
  STR_WORKSPACE_UI: {
    CONFIRM_DISCARD_CHANGES: "Discard changes?",
    CONFIRM_OK: "Yes",
    CONFIRM_CANCEL: "No",

    ALERT_NO_SELECTION: "Nothing selected",
    ALERT_INVALID_OPERATION: "Invalid operation",

    STATUS_READY: "Ready",
    STATUS_WORKING: "Working",
    STATUS_SAVED: "Saved",
    STATUS_LOADED: "Loaded",
    STATUS_IMPORTED: "Imported",
    STATUS_EXPORTED: "Exported",

    ERROR_WS_API_NOT_READY: "Workspace API not ready",
    ERROR_INIT_FAILED: "Initialization failed",
    ERROR_CODEGEN_FAILED: "Code generation failed",
  },
  STR_XLSX_IMPORT: {
    ERROR_UNSUPPORTED_FORMAT: "Unsupported format",
    ERROR_SHEET_NOT_FOUND: "Sheet not found",

    ERROR_EMPTY_BOOK: "Workbook is empty",
    ERROR_INVALID_CELL: "Invalid cell",
    ERROR_INVALID_RANGE: "Invalid range",

    ERROR_PARSE_FAILED: "Failed to parse",
    ERROR_TOO_LARGE: "Too large",
    ERROR_UNSUPPORTED_CELL: "Unsupported cell",
  },
  STR_PROJECT_OPS: {
    ERROR_WORKSPACE_NOT_FOUND: "Workspace not found",
    ERROR_INVALID_WORKSPACE_KIND: "Invalid workspace kind",

    ERROR_UNSUPPORTED_SCHEMA_VERSION: "Unsupported schemaVersion",

    ALERT_SAVE_FAILED: "Save failed",
    ALERT_LOAD_FAILED: "Load failed",
    STATUS_UPDATED: "Updated",
  },
  STR_MISC: {
    BLOCK_COUNT_SUFFIX: "blocks",
    TEMP_DISPLAY: "Temporary",

    ALL: "All",
    NONE: "None",
    UNKNOWN: "Unknown",
  },
  STR_VIEW: {
    VIEW: "View",
    EXPAND: "Expand",
    COLLAPSE: "Collapse",
    FOCUS: "Focus",
    PATH: "Path",
    ON: "ON",
    OFF: "OFF",
  },
  STR_MOBILE: {
    MOBILE_TAB_WORKSPACE: "Workspace",
    MOBILE_TAB_CELLS: "Cells",
    MOBILE_TAB_FORMULA: "Formula",
  },
  STR_FILETAB_UI: {
    IMPORT_XLSX: "Import .xlsx",
    IMPORT_NAMED_FNS: "Import named functions",
    EXPORT_NAMED_FNS: "Export named functions",
    SHEET_SWITCH: "Sheet",

    TOOLTIP_IMPORT_XLSX: "Import Excel (.xlsx)",
    TOOLTIP_SHEET_SWITCH: "Switch sheet",
    TOOLTIP_IMPORT_NAMED_FNS: "Import named functions JSON",
    TOOLTIP_EXPORT_NAMED_FNS: "Export named functions JSON",
  },
} as const;
