// src/blocks/fn/fn_root.ts
import * as Blockly from "blockly";

const C_FN = 150;

export function registerFnRootBlock() {
  Blockly.Blocks["fn_root"] = {
    init: function () {
      // 見出し（関数名）
      this.appendDummyInput()
        .appendField("FUNC")
        .appendField(new Blockly.FieldTextInput("A"), "NAME");

      // パラメータ列（statement）
      this.appendStatementInput("PARAMS")
        .setCheck("FN_PARAM")
        .appendField("params");

      // 本体（value）
      this.appendValueInput("BODY").setCheck(null).appendField("body");

      this.setColour(C_FN);

      // 入口ブロックとして固定（UX補助）
      this.setDeletable(false);
      this.setMovable(false);

      // 「トップ専用」っぽく（害なし）
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setOutput(false);

      // @ts-ignore
      if (typeof this.setHat === "function") this.setHat("cap");
    },
  };
}
