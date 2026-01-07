import { EN } from "./locales/en";
import { JA } from "./locales/ja";
import { FR } from "./locales/fr";

export type UiLang = "en" | "ja" | "fr";

function merge<T extends Record<string, any>>(
  en: T,
  ja: Record<string, any>,
  fr: Record<string, any>
): any {
  const out: any = {};
  for (const k of Object.keys(en)) {
    const val = en[k];
    if (typeof val === "string") {
      out[k] = { en: val, ja: ja[k] ?? val, fr: fr[k] ?? val };
    } else if (typeof val === "object" && val !== null) {
      out[k] = merge(val, ja[k] ?? {}, fr[k] ?? {});
    }
  }
  return out;
}

type LangMap = { en: string; ja: string; fr: string };

export const STR_COMMON = merge(
  EN.STR_COMMON,
  JA.STR_COMMON,
  FR.STR_COMMON
) as {
  [K in keyof typeof EN.STR_COMMON]: LangMap;
};
export const STR_STATUS = merge(
  EN.STR_STATUS,
  JA.STR_STATUS,
  FR.STR_STATUS
) as {
  [K in keyof typeof EN.STR_STATUS]: LangMap;
};
export const STR_TOOLTIP = merge(
  EN.STR_TOOLTIP,
  JA.STR_TOOLTIP,
  FR.STR_TOOLTIP
) as {
  [K in keyof typeof EN.STR_TOOLTIP]: LangMap;
};
export const STR_ACTION = merge(
  EN.STR_ACTION,
  JA.STR_ACTION,
  FR.STR_ACTION
) as {
  [K in keyof typeof EN.STR_ACTION]: LangMap;
};
export const STR_DIALOG = merge(
  EN.STR_DIALOG,
  JA.STR_DIALOG,
  FR.STR_DIALOG
) as {
  [K in keyof typeof EN.STR_DIALOG]: LangMap;
};
export const STR_MENU = merge(EN.STR_MENU, JA.STR_MENU, FR.STR_MENU) as {
  [K in keyof typeof EN.STR_MENU]: LangMap;
};
export const STR_BLOCKLY_ACTION = merge(
  EN.STR_BLOCKLY_ACTION,
  JA.STR_BLOCKLY_ACTION,
  FR.STR_BLOCKLY_ACTION
) as {
  [K in keyof typeof EN.STR_BLOCKLY_ACTION]: LangMap;
};
export const STR_COLLAPSE = merge(
  EN.STR_COLLAPSE,
  JA.STR_COLLAPSE,
  FR.STR_COLLAPSE
) as {
  [K in keyof typeof EN.STR_COLLAPSE]: LangMap;
};
export const STR_RIBBON = merge(
  EN.STR_RIBBON,
  JA.STR_RIBBON,
  FR.STR_RIBBON
) as {
  [K in keyof typeof EN.STR_RIBBON]: LangMap;
};
export const STR_FILETAB = merge(
  EN.STR_FILETAB,
  JA.STR_FILETAB,
  FR.STR_FILETAB
) as {
  [K in keyof typeof EN.STR_FILETAB]: LangMap;
};
export const STR_NAMED_FN = merge(
  EN.STR_NAMED_FN,
  JA.STR_NAMED_FN,
  FR.STR_NAMED_FN
) as {
  [K in keyof typeof EN.STR_NAMED_FN]: LangMap;
};
export const STR_WORKSPACE_MODAL = merge(
  EN.STR_WORKSPACE_MODAL,
  JA.STR_WORKSPACE_MODAL,
  FR.STR_WORKSPACE_MODAL
) as {
  [K in keyof typeof EN.STR_WORKSPACE_MODAL]: LangMap;
};
export const STR_WORKSPACE_UI = merge(
  EN.STR_WORKSPACE_UI,
  JA.STR_WORKSPACE_UI,
  FR.STR_WORKSPACE_UI
) as {
  [K in keyof typeof EN.STR_WORKSPACE_UI]: LangMap;
};
export const STR_XLSX_IMPORT = merge(
  EN.STR_XLSX_IMPORT,
  JA.STR_XLSX_IMPORT,
  FR.STR_XLSX_IMPORT
) as {
  [K in keyof typeof EN.STR_XLSX_IMPORT]: LangMap;
};
export const STR_PROJECT_OPS = merge(
  EN.STR_PROJECT_OPS,
  JA.STR_PROJECT_OPS,
  FR.STR_PROJECT_OPS
) as {
  [K in keyof typeof EN.STR_PROJECT_OPS]: LangMap;
};
export const STR_MISC = merge(EN.STR_MISC, JA.STR_MISC, FR.STR_MISC) as {
  [K in keyof typeof EN.STR_MISC]: LangMap;
};
export const STR_VIEW = merge(EN.STR_VIEW, JA.STR_VIEW, FR.STR_VIEW) as {
  [K in keyof typeof EN.STR_VIEW]: LangMap;
};
export const STR_MOBILE = merge(
  EN.STR_MOBILE,
  JA.STR_MOBILE,
  FR.STR_MOBILE
) as {
  [K in keyof typeof EN.STR_MOBILE]: LangMap;
};
export const STR_FILETAB_UI = merge(
  EN.STR_FILETAB_UI,
  JA.STR_FILETAB_UI,
  FR.STR_FILETAB_UI
) as {
  [K in keyof typeof EN.STR_FILETAB_UI]: LangMap;
};

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
  return (k: StrKey | { en: string; ja: string; fr: string }) =>
    // @ts-ignore
    typeof k === "string" ? STR[k][lang] : k[lang];
}
