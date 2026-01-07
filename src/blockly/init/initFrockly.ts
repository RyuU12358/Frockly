import * as Blockly from "blockly";
import * as ja from "blockly/msg/ja";
import * as en from "blockly/msg/en";
import { initDynamicFnBlocks, updateDynamicFnLocales } from "../../blocks/gen";
import { registerBasic } from "../../blocks/basic";
import type { UiLang } from "../../i18n/strings";
import { registerFnRootBlock } from "../../blocks/fn/fn_root";
import { registerFnParamBlock } from "../../blocks/fn/fn_param";
import { registerFnCallBlock } from "../../blocks/fn/fn_call";
import { patchBlocklyCollapsedSummary } from "../../blocks/patch/patchBlocklyCollapsedSummary";
import { patchTempCollapsedField } from "../../blocks/patch/patchTempCollapsedField";
import { initSyntaxBlocks } from "../../blocks/syntax/initSyntax";
import { registerLetDynpairsMutator } from "../../blocks/gen/letMutator";

let dynamicInited = false;

export async function initFrockly(uiLang: UiLang) {
  patchBlocklyCollapsedSummary();
  patchTempCollapsedField();
  // ===== ブロック形状をExcel寄りに =====
  // ===== Blockly 見た目（Excel寄り）: TS型が無いので any で叩く =====
  const BS = Blockly.BlockSvg as any;

  // 角丸を消す
  BS.CORNER_RADIUS = 0;

  // ノッチを低く・細く（好みで微調整）
  BS.NOTCH_HEIGHT = 4;
  BS.NOTCH_WIDTH = 15;
  BS.NOTCH_OFFSET_LEFT = 6;

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

  // ★言語切り替え時は必ず辞書を更新する
  await updateDynamicFnLocales(uiLang);

  registerLetDynpairsMutator();
  // fn ワークスペース系
  registerFnRootBlock();
  registerFnParamBlock();
  registerFnCallBlock();

  // 基本ブロック（VAR含む・言語依存）
  registerBasic(uiLang);

  // 構文ブロック（LET / LAMBDA）
  initSyntaxBlocks();
}
