import * as Blockly from "blockly";
import { ExcelGen } from "../basic/generators"; // パスは構成に合わせて

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

export function registerSyntaxUiExtension() {
  try {
    Blockly.Extensions.register(
      "frockly_syntax_ui",
      function (this: Blockly.Block) {
        const refresh = () => {
          let code = "";
          try {
            code = computePreview(this);
          } catch {
            code = "(preview error)";
          }

          // LET/LAMBDA は “式” なので "=" 付けたい派ならここで付ける
          // 例： LET(...) / LAMBDA(...) は Excel では先頭 "=" で使うから
          (this as any).__frocklyCollapsedText = "=" + clamp(code);
        };

        this.setOnChange((e: any) => {
          if (!e || e.blockId !== this.id) return;

          if (
            e.type === Blockly.Events.BLOCK_CHANGE &&
            e.element === "collapsed"
          ) {
            const collapsed =
              (this as any).isCollapsed?.() ?? (this as any).collapsed ?? false;

            if (collapsed) refresh();
            else (this as any).__frocklyCollapsedText = undefined;

            setTimeout(() => (this.workspace as any)?.render?.(), 0);
            return;
          }

          const collapsed =
            (this as any).isCollapsed?.() ?? (this as any).collapsed ?? false;
          if (!collapsed) return;

          const structural =
            e.type === Blockly.Events.BLOCK_MOVE ||
            e.type === Blockly.Events.BLOCK_CREATE ||
            e.type === Blockly.Events.BLOCK_DELETE ||
            (e.type === Blockly.Events.BLOCK_CHANGE && e.element !== "field");

          if (structural) {
            refresh();
            setTimeout(() => (this.workspace as any)?.render?.(), 0);
          }
        });
      }
    );
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes("already registered")) return;
    throw e;
  }
}
