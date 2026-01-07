export const FR = {
  STR_COMMON: {
    FUNCTIONS: "Fonctions",
    SEARCH: "Recherche",

    NUMBER: "Nombre",
    TEXT: "Texte",
    CELL: "Cellule",
    CELL_REF: "Référence",
    RANGE: "Plage",

    ARITH: "Arithmétique",
    CMP: "Comparer",
    PAREN: "Parenthèses",
    NAME: "var",

    CANCEL: "Annuler",
  },
  STR_STATUS: {
    LOADING_FUNCS: "Chargement des fonctions…",
    LOAD_FAILED: "Échec du chargement",
    NO_BLOCKS_FOUND: "Aucun bloc trouvé",

    GENERATED_FORMULA: "Formule générée",
    COPY_DONE: "Copié",

    BASIC: "Basique",
    HISTORY: "Historique",
    NO_HISTORY: "Aucun historique",
    FORMULA_PLACEHOLDER: "=SOMME(A1;B1*2)",

    STATUS_READY: "Prêt",
    STATUS_WORKING: "Traitement",
    STATUS_SAVED: "Enregistré",
    STATUS_LOADED: "Chargé",
    NO_SEARCH_RESULTS: "Aucun résultat",
  },
  STR_TOOLTIP: {
    TOOLTIP_START: "Début de formule (ajouter =)",
    TOOLTIP_NUMBER: "Nombre littéral",
    TOOLTIP_STRING: 'Chaîne littérale (sortie comme "...")',
    TOOLTIP_CELL: "Référence de cellule (ex. A1, $B$2)",
    TOOLTIP_RANGE: "Référence de plage (ex. A1:B2)",
    TOOLTIP_ARITH: "Opérations arithmétiques",
    TOOLTIP_CMP: "Opérateurs de comparaison",
    TOOLTIP_PAREN: "Grouper avec parenthèses",
    TOOLTIP_BOOL: "VRAI / FAUX",
  },
  STR_ACTION: {
    COPY: "Copier",
    PASTE: "Coller",
    BLOCKIFY: "Blocifier",

    IMPORT_FROM_FORMULA: "Depuis formule",
    PASTE_FORMULA: "Coller une formule",
  },
  STR_DIALOG: {
    SELECT_BLOCK_PROMPT: "Sélectionnez un bloc pour voir la formule",

    IMPORT_API_NOT_READY: "L'espace de travail n'est pas prêt.",
    IMPORT_FAILED: "Échec de l'importation.",
  },
  STR_MENU: {
    COPY_REF: "Copier référence",
    COPY_VALUE: "Copier valeur",
    COPY_TSV: "Copier plage (TSV)",
    PASTE: "Coller",
    ADD_REF_BLOCK: "Ajouter bloc référence",
    CLEAR_VALUE: "Effacer valeur",
    CLEAR_STYLE: "Effacer format",
    CLEAR_ALL: "Tout effacer",
  },
  STR_BLOCKLY_ACTION: {
    UNDO: "Annuler",
    REDO: "Rétablir",
    UNDO_LONG: "Annuler",
    REDO_LONG: "Rétablir",

    DUPLICATE: "Dupliquer",
    DELETE: "Supprimer",
    SELECT_ALL: "Tout sélectionner",

    ADD_COMMENT: "Ajouter commentaire",
    REMOVE_COMMENT: "Supprimer commentaire",

    COLLAPSE_BLOCK: "Réduire le bloc",
    EXPAND_BLOCK: "Étendre le bloc",
  },
  STR_COLLAPSE: {
    EXPAND_ALL: "Tout étendre",
    COLLAPSE_ALL: "Tout réduire",

    COLLAPSE_LEVEL: "Réduire ce niveau",
    EXPAND_LEVEL: "Étendre ce niveau",

    COLLAPSE_DEEPEST: "Réduire le plus profond",
    EXPAND_DEEPEST: "Étendre le plus profond",

    COLLAPSE_UPPER: "Réduire niveau sup.",
    EXPAND_UPPER: "Étendre niveau sup.",

    COLLAPSE_SELECTED: "Réduire la sélection",
    EXPAND_SELECTED: "Étendre la sélection",

    COLLAPSE_EXCEPT_SELECTED: "Réduire sauf sélection",
    EXPAND_EXCEPT_SELECTED: "Étendre sauf sélection",

    COLLAPSE_BY_DEPTH: "Réduire par prof.",
    EXPAND_BY_DEPTH: "Étendre par prof.",

    COLLAPSE_TO_LEVEL: "Réduire au niveau",
    EXPAND_TO_LEVEL: "Étendre au niveau",

    COLLAPSE_TEMP: "Réduire temporairement",
    EXPAND_TEMP: "Étendre temporairement",
  },
  STR_RIBBON: {
    TAB_FILE: "Fichier",
    TAB_FUNCTIONS: "Fonctions",
    TAB_NAMED_FUNCTIONS: "Fonctions nommées",
    TAB_CHECK: "Vérifier",

    TOOLTIP_FILE: "Fichier",
    TOOLTIP_FUNCTIONS: "Fonctions",
    TOOLTIP_NAMED_FUNCTIONS: "Fonctions nommées",
    TOOLTIP_CHECK: "Vérifier",
    HOVER_DESC_HINT: "Survolez une fonction pour voir une brève description.",
  },
  STR_FILETAB: {
    IMPORT: "Importer",
    EXPORT: "Exporter",
    SAVE: "Enregistrer",
    LOAD: "Charger",

    CONFIRM_OVERWRITE: "Écraser ?",
    CONFIRM_IMPORT: "Importer ?",

    ALERT_NO_FILE: "Aucun fichier sélectionné",
    ALERT_IMPORT_FAILED: "Échec import",
    ALERT_EXPORT_FAILED: "Échec export",
  },
  STR_NAMED_FN: {
    CREATE_NEW: "Créer nouveau",
    RENAME: "Renommer",
    SAVE: "Sauver",
    OPEN: "Ouvrir",
    WORKSPACE_ACTIVE_TOOLTIP: "Info-bulle active",
    INSERT_TO_MAIN: "Insérer au principal",
    INSERT: "Insérer",
    INSERT_FUNCTION: "Insérer fonction",
    INSERT_CURRENT_PARAM: "Insérer paramètre",
    NAMED_MANAGE: "Gérer…",
    NAMED_ADD_PARAM: "+param",
    NAMED_TOOLTIP_INSERT_PARAM_BLOCK: "Insérer bloc paramètre",
    NAMED_TOOLTIP_INSERT_TO_CURRENT_WS: "Insérer dans espace actuel",
  },
  STR_WORKSPACE_MODAL: {
    WORKSPACE_MANAGER: "Gestionnaire",
    CLOSE: "Fermer",

    WORKSPACE_MAIN: "Principal",
    WORKSPACE_FUNCTION: "Fonction",
    WORKSPACE_LIST: "Espaces",
    TOOLTIP_CREATE_NAMED_FN: "Créer fonction nommée",
    MAIN_WORKSPACE: "Espace principal",
    ERROR_MAIN_WORKSPACE_NOT_FOUND: "Principal non trouvé",
    NO_NAMED_FUNCTIONS: "Aucune fonction",
    CONFIRM_DELETE_NAMED_FN: 'Supprimer "{name}" ?',
    EDIT: "Éditer",
    UNSAVED: "Non sauvegardé",

    MAIN_WORKSPACE_HELP: "Non éditable ici. Ouvrez pour éditer.",

    LABEL_FUNCTION_NAME: "Nom fonction",
    PLACEHOLDER_FUNCTION_NAME: "Nom",

    LABEL_DESCRIPTION: "Description",
    PLACEHOLDER_DESCRIPTION: "Description",

    SAVE: "Sauver",

    WARN_ON_UPDATE_META_MISSING_TITLE: "onUpdateFnMeta manquant",
    WARN_ON_UPDATE_META_MISSING_NOTE: "Sauvegarde indisponible.",

    HOW_TO_EDIT_TITLE: "Comment éditer",
    HOW_TO_EDIT_BODY: "Sélectionnez et cliquez sur Éditer.",
  },
  STR_WORKSPACE_UI: {
    CONFIRM_DISCARD_CHANGES: "Annuler les changements ?",
    CONFIRM_OK: "Oui",
    CONFIRM_CANCEL: "Non",

    ALERT_NO_SELECTION: "Rien sélectionné",
    ALERT_INVALID_OPERATION: "Opération invalide",

    STATUS_READY: "Prêt",
    STATUS_WORKING: "...",
    STATUS_SAVED: "Sauvé",
    STATUS_LOADED: "Chargé",
    STATUS_IMPORTED: "Importé",
    STATUS_EXPORTED: "Exporté",

    ERROR_WS_API_NOT_READY: "API non prête",
    ERROR_INIT_FAILED: "Échec init",
    ERROR_CODEGEN_FAILED: "Échec génération",
  },
  STR_XLSX_IMPORT: {
    ERROR_UNSUPPORTED_FORMAT: "Format non supporté",
    ERROR_SHEET_NOT_FOUND: "Feuille non trouvée",

    ERROR_EMPTY_BOOK: "Classeur vide",
    ERROR_INVALID_CELL: "Cellule invalide",
    ERROR_INVALID_RANGE: "Plage invalide",

    ERROR_PARSE_FAILED: "Échec analyse",
    ERROR_TOO_LARGE: "Trop grand",
    ERROR_UNSUPPORTED_CELL: "Cellule non supportée",
  },
  STR_PROJECT_OPS: {
    ERROR_WORKSPACE_NOT_FOUND: "Espace non trouvé",
    ERROR_INVALID_WORKSPACE_KIND: "Type invalide",

    ERROR_UNSUPPORTED_SCHEMA_VERSION: "Version non supportée",

    ALERT_SAVE_FAILED: "Échec sauvegarde",
    ALERT_LOAD_FAILED: "Échec chargement",
    STATUS_UPDATED: "Mis à jour",
  },
  STR_MISC: {
    BLOCK_COUNT_SUFFIX: "blocs",
    TEMP_DISPLAY: "Temporaire",

    ALL: "Tout",
    NONE: "Aucun",
    UNKNOWN: "Inconnu",
  },
  STR_VIEW: {
    VIEW: "Vue",
    EXPAND: "Étendre",
    COLLAPSE: "Réduire",
    FOCUS: "Focus",
    PATH: "Chemin",
    ON: "ON",
    OFF: "OFF",
  },
  STR_MOBILE: {
    MOBILE_TAB_WORKSPACE: "Espace",
    MOBILE_TAB_CELLS: "Cellules",
    MOBILE_TAB_FORMULA: "Formule",
  },
  STR_FILETAB_UI: {
    IMPORT_XLSX: "Import .xlsx",
    IMPORT_NAMED_FNS: "Import fns nommées",
    EXPORT_NAMED_FNS: "Export fns nommées",
    SHEET_SWITCH: "Feuille",

    TOOLTIP_IMPORT_XLSX: "Importer Excel (.xlsx)",
    TOOLTIP_SHEET_SWITCH: "Changer feuille",
    TOOLTIP_IMPORT_NAMED_FNS: "Importer JSON",
    TOOLTIP_EXPORT_NAMED_FNS: "Exporter JSON",
  },
} as const;
