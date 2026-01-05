import React from "react";
import { tr, STR } from "../i18n/strings";

export function ImportFromFormulaModal(props: {
  open: boolean;
  uiLang: "en" | "ja";
  text: string;
  setText: (v: string) => void;

  onClose: () => void;
  onSubmit: (formula: string) => void;

  titleKey?: any; // いらんかったら削除でOK
}) {
  const t = tr(props.uiLang);
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl w-[640px] max-w-[90vw] p-4">
        <div className="text-lg font-semibold mb-2">{t(STR.PASTE_FORMULA)}</div>

        <textarea
          className="w-full h-32 border rounded p-2 font-mono"
          value={props.text}
          onChange={(e) => props.setText(e.target.value)}
          placeholder={t(STR.FORMULA_PLACEHOLDER)}
        />

        <div className="flex gap-2 justify-end mt-3">
          <button className="px-3 py-1 rounded border" onClick={props.onClose}>
            {t(STR.CANCEL)}
          </button>

          <button
            className="px-3 py-1 rounded bg-emerald-600 text-white"
            onClick={() => {
              const text = props.text.trim();
              if (!text) return;
              props.onSubmit(text);
            }}
          >
            {t(STR.BLOCKIFY)}
          </button>
        </div>
      </div>
    </div>
  );
}
