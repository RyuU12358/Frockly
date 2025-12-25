import * as Blockly from "blockly";

export function patchTempCollapsedField() {
  const proto: any = (Blockly as any).FieldLabel?.prototype;
  if (!proto || proto.__frocklyPatchedTempField) return;
  proto.__frocklyPatchedTempField = true;

  const orig = proto.setValue;
  if (typeof orig !== "function") return;

  proto.setValue = function (v: any) {
    // TEMPフィールドだけ対象
    if (this?.name === "_TEMP_COLLAPSED_FIELD") {
      const srcBlock: any =
        (this as any).sourceBlock_ ?? (this as any).getSourceBlock?.();
      const want = srcBlock?.__frocklyCollapsedText;

      if (typeof want === "string" && want.length) {
        // ★Blocklyが書こうとした内容を、ここで強制的に差し替える
        v = want;
      }
    }
    return orig.call(this, v);
  };

}
