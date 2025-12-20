import * as Blockly from "blockly";
import { ExcelGen } from "./basic/generators"; // パスは実際に合わせて

function extractCode(out: any): string {
  if (!out) return "";
  if (Array.isArray(out)) return String(out[0] ?? "");
  return String(out);
}

export function attachWorkspaceListener(
  ws: Blockly.WorkspaceSvg,
  onFormulaChange: (code: string) => void
) {
  let lastCode = "";

  ws.addChangeListener((e) => {
    // UI操作（ズーム・スクロール等）は無視
    if (e.isUiEvent) return;

    // move / create / delete / change だけ拾う
    switch (e.type) {
      case Blockly.Events.BLOCK_CREATE:
      case Blockly.Events.BLOCK_DELETE:
      case Blockly.Events.BLOCK_MOVE:
      case Blockly.Events.BLOCK_CHANGE:
        break;
      default:
        return;
    }

    // start ブロックを探す
    const starts = ws
      .getAllBlocks(false)
      .filter((b) => b.type === "basic_start");

    if (starts.length === 0) {
      if (lastCode !== "") {
        lastCode = "";
        onFormulaChange("");
      }
      return;
    }

    // 複数あっても、とりあえず先頭だけ使う（学習用UX）
    const start = starts[0];

    let code = "";
    try {
      const out = ExcelGen.blockToCode(start);
      code = extractCode(out).trim();
    } catch (err) {
      console.error("[GEN] blockToCode failed", err);
      // 壊れた状態では更新しない
      return;
    }

    // 変化が無ければ通知しない（無限ループ防止）
    if (code === lastCode) return;

    lastCode = code;
    onFormulaChange(code);
  });
}
