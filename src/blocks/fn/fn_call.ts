// src/blockly/blocks/fn/fn_call.ts
import * as Blockly from "blockly";

export type NamedFnLite = {
  id: string;
  name: string;
  params: string[];
};

/**
 * 単一の呼び出しブロック
 * - fnId を内部保持（field: FN_ID）
 * - params.length に応じて入力スロットを mutation で可変
 */
export function registerFnCallBlock() {
  if (Blockly.Blocks["fn_call"]) return;

  Blockly.Blocks["fn_call"] = {
    init: function () {
      this.appendDummyInput("HEAD")
        .appendField("call")
        .appendField(new Blockly.FieldLabelSerializable("???"), "FN_NAME");

      this.setInputsInline(true);
      this.setOutput(true);

      // 内部参照
      (this as any).fnId_ = "";
      (this as any).argCount_ = 0;

      this.setColour(210);
      this.setTooltip("名前付き関数の呼び出し");
      this.setHelpUrl("");

      // 初期：引数0
      rebuildArgs(this, 0);
    },

    mutationToDom: function () {
      const m = Blockly.utils.xml.createElement("mutation");
      m.setAttribute("fnId", String((this as any).fnId_ ?? ""));
      m.setAttribute("argCount", String((this as any).argCount_ ?? 0));
      return m;
    },

    domToMutation: function (xmlElement: Element) {
      const fnId = xmlElement.getAttribute("fnId") ?? "";
      const argCount = parseInt(xmlElement.getAttribute("argCount") ?? "0", 10);

      (this as any).fnId_ = fnId;
      (this as any).argCount_ = Number.isFinite(argCount) ? argCount : 0;

      rebuildArgs(this, (this as any).argCount_);
    },
  };
}

function rebuildArgs(block: Blockly.Block, argCount: number) {
  // 既存の ARGi input を全消し
  for (let i = 0; i < 50; i++) {
    const name = `ARG${i}`;
    if (block.getInput(name)) block.removeInput(name);
  }

  // 新しく追加
  for (let i = 0; i < argCount; i++) {
    block.appendValueInput(`ARG${i}`).appendField(i === 0 ? "(" : "");
  }
  if (argCount > 0) {
    block.appendDummyInput("TAIL").appendField(")");
  } else {
    if (block.getInput("TAIL")) block.removeInput("TAIL");
  }
}

export function setCallFnMeta(
  b: Blockly.Block,
  fn: NamedFnLite | null | undefined
) {
  if (b.type !== "fn_call") return;

  const fnId = fn?.id ?? "";
  const fnName = fn?.name ?? "???";
  const argCount = fn?.params?.length ?? 0;

  (b as any).fnId_ = fnId;
  (b as any).argCount_ = argCount;

  const f = b.getField("FN_NAME");
  if (f) f.setValue(fnName);

  rebuildArgs(b, argCount);
}

export function getCallFnId(b: Blockly.Block): string {
  return String((b as any).fnId_ ?? "");
}
