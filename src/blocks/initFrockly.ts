import * as Blockly from "blockly";
import * as ja from "blockly/msg/ja";
import * as en from "blockly/msg/en";
import { initDynamicFnBlocks } from "./gen";
import { registerBasic } from "./basic";
import type { UiLang } from "../i18n/strings";

let dynamicInited = false;

export async function initFrockly(uiLang: UiLang) {
  // Blockly 標準UIは uiLang に合わせて毎回設定する（コンテキストメニュー等を切り替えるため）
  if (uiLang === "ja") {
    Blockly.setLocale(ja as any);
    Blockly.Msg["UNDO"] = "戻す";
    Blockly.Msg["REDO"] = "進む";
    Blockly.Msg["COPY"] = "コピー";
    Blockly.Msg["PASTE"] = "貼り付け";
    Blockly.Msg["DUPLICATE_BLOCK"] = "複製";
    Blockly.Msg["DELETE_BLOCK"] = "削除";
    Blockly.Msg["CUT"] = "切り取り";
  } else {
    // デフォルトは英語
    Blockly.setLocale(en as any);
    // 明示的に英語語句を上書きしておく
    Blockly.Msg["UNDO"] = (en as any).UNDO ?? "Undo";
    Blockly.Msg["REDO"] = (en as any).REDO ?? "Redo";
    Blockly.Msg["COPY"] = (en as any).COPY ?? "Copy";
    Blockly.Msg["PASTE"] = (en as any).PASTE ?? "Paste";
    Blockly.Msg["DUPLICATE_BLOCK"] = (en as any).DUPLICATE_BLOCK ?? "Duplicate";
    Blockly.Msg["DELETE_BLOCK"] = (en as any).DELETE_BLOCK ?? "Delete";
    Blockly.Msg["CUT"] = (en as any).CUT ?? "Cut";
  }

  // 動的に生成する関数ブロックは初回のみ作成
  if (!dynamicInited) {
    dynamicInited = true;
    await initDynamicFnBlocks();
  }

  // 言語に依存する基本ブロックは毎回登録し直す（ラベル/ツールチップ反映のため）
  registerBasic(uiLang);
}
