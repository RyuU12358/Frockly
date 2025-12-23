import * as Blockly from "blockly";
import { ExcelGen } from "../basic/generators";

function fnNameOf(block: Blockly.Block) {
  return block.type.startsWith("frockly_")
    ? block.type.slice("frockly_".length)
    : block.type;
}

function oneLine(s: string) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}
function clamp(s: string, n = 90) {
  const t = oneLine(s);
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function computePreview(block: Blockly.Block) {
  const out = (ExcelGen as any).blockToCode(block);
  const code = Array.isArray(out) ? out[0] : out;
  return String(code ?? "");
}

export function registerFnUiExtension() {
  const extAny = Blockly.Extensions as any;
  if (extAny?.extensions_?.["frockly_fn_ui"]) return;

  Blockly.Extensions.register("frockly_fn_ui", function (this: Blockly.Block) {
    const header =
      this.getInput("FN_HEADER") ?? this.appendDummyInput("FN_HEADER");

    if (!this.getField("FN_NAME")) {
      header.insertFieldAt(0, fnNameOf(this), "FN_NAME");
    }

    // ← PREVIEW_TEXT はもう不要（折りたたみ本体に出るから）
    // もし「展開中だけプレビュー欲しい」なら別用途で残してOK

    const refreshCollapsedText = () => {
      let code = "";
      try {
        code = computePreview(this);
      } catch {
        code = "(preview error)";
      }
      (this as any).__frocklyCollapsedText = "=" + clamp(code);
    };

    this.setOnChange((e: any) => {
      if (!e || e.blockId !== this.id) return;

      if (e.type === Blockly.Events.BLOCK_CHANGE && e.element === "collapsed") {
        const collapsed =
          (this as any).isCollapsed?.() ?? (this as any).collapsed ?? false;
        if (collapsed) refreshCollapsedText();
        else (this as any).__frocklyCollapsedText = undefined;

        setTimeout(() => (this.workspace as any)?.render?.(), 0);
        return;
      }

      const collapsed =
        (this as any).isCollapsed?.() ?? (this as any).collapsed ?? false;
      if (!collapsed) return;

      // 折りたたみ中に中身が変わったら更新
      const structural =
        e.type === Blockly.Events.BLOCK_MOVE ||
        e.type === Blockly.Events.BLOCK_CREATE ||
        e.type === Blockly.Events.BLOCK_DELETE ||
        (e.type === Blockly.Events.BLOCK_CHANGE && e.element !== "field");

      if (structural) {
        refreshCollapsedText();
        setTimeout(() => (this.workspace as any)?.render?.(), 0);
      }
    });
  });
}
