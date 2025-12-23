import * as Blockly from "blockly";

export function registerFnCallBlock() {
  Blockly.Blocks["fn_call"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("CALL")
        .appendField(new Blockly.FieldTextInput("A"), "FN"); // ★ここに名前入る
      this.setOutput(true);
      this.setColour(120);
      this.setTooltip("Call named function");
    },
  };

  // generator（ExcelGen 方式に合わせるならここは後で統合）
  (Blockly as any).JavaScript["fn_call"] = function (block: any) {
    const name = block.getFieldValue("FN") || "A";
    return [`${name}()`, (Blockly as any).JavaScript.ORDER_FUNCTION_CALL];
  };
}
