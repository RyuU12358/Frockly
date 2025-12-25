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
      (this as any).params_ = [] as string[];

      // 初期：引数0（※1回だけ）
      rebuildArgs(this, []);

      this.setColour(210);
      this.setTooltip("名前付き関数の呼び出し");
      this.setHelpUrl("");
    },

    mutationToDom: function () {
      const m = Blockly.utils.xml.createElement("mutation");
      m.setAttribute("fnId", String((this as any).fnId_ ?? ""));
      const params: string[] = (this as any).params_ ?? [];
      m.setAttribute("params", JSON.stringify(params));
      return m;
    },

    domToMutation: function (xmlElement: Element) {
      const fnId = xmlElement.getAttribute("fnId") ?? "";
      const raw = xmlElement.getAttribute("params") ?? "[]";

      let params: string[] = [];
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) params = p.map((x) => String(x));
      } catch {
        params = [];
      }

      (this as any).fnId_ = fnId;
      (this as any).params_ = params;

      rebuildArgs(this, params);
    },
  };
}

function rebuildArgs(block: Blockly.Block, params: string[]) {


  for (let i = 0; i < 50; i++) {
    const name = `ARG${i}`;
    if (block.getInput(name)) {
      block.removeInput(name, true);
    }
  }
  if (block.getInput("TAIL")) {
    block.removeInput("TAIL", true);
  }

  for (let i = 0; i < params.length; i++) {
    block
      .appendValueInput(`ARG${i}`)
      .appendField(i === 0 ? "(" : ",")
      .appendField(params[i] ? `${params[i]}=` : "");
  }

  if (params.length > 0) {
    block.appendDummyInput("TAIL").appendField(")");
  }
}

export function setCallFnMeta(
  b: Blockly.Block,
  fn: NamedFnLite | null | undefined
) {

  const fnId = fn?.id ?? "";
  const fnName = fn?.name ?? "???";
  const params = fn?.params ?? [];

  (b as any).fnId_ = fnId;
  (b as any).params_ = params;

  const f = b.getField("FN_NAME");

  if (f) f.setValue(fnName);

  rebuildArgs(b, params);

}

export function getCallFnId(b: Blockly.Block): string {
  return String((b as any).fnId_ ?? "");
}
