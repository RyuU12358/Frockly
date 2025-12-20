// src/i18n/strings.ts
export type UiLang = "ja" | "en";

export const STR = {
  ribbon: {
    file: { ja: "ファイル", en: "File" },
    view: { ja: "表示", en: "View" },
    actions: { ja: "操作", en: "Actions" },
    check: { ja: "チェック", en: "Check" },
    history: { ja: "履歴", en: "History" },
    noHistory: { ja: "履歴なし", en: "No history" },
  },
  blocks: {
    cell: { ja: "セル", en: "Cell" },
    range: { ja: "レンジ", en: "Range" },
    number: { ja: "数値", en: "Number" },
    text: { ja: "文字列", en: "Text" },
  },
} as const;

export function t(lang: UiLang) {
  return (node: { ja: string; en: string }) => node[lang];
}
