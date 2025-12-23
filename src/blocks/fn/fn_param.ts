// src/blocks/fn/fn_param.ts
import * as Blockly from "blockly";

const C_FN = 150;

export function registerFnParamBlock() {
  Blockly.Blocks["fn_param"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("param")
        .appendField(new Blockly.FieldTextInput("x"), "NAME");

      // params列にしか並ばない“文（statement）”ブロックにする
      this.setPreviousStatement(true, "FN_PARAM");
      this.setNextStatement(true, "FN_PARAM");

      this.setColour(C_FN);
      this.setTooltip("Function parameter");
    },
  };
}
