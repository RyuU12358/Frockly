import * as Blockly from "blockly";
import type { ProjectState } from "../../state/project/types";

export function ensureFnRoot(
  ws: Blockly.WorkspaceSvg,
  project: ProjectState,
  wsId: string
) {
  const wsInfo = project.workspaces.find((w) => w.id === wsId);
  if (!wsInfo || wsInfo.kind !== "fn") return;

  // ブロック登録前に来たら何もできん
  if (!Blockly.Blocks["fn_root"]) return;

  const roots = ws.getAllBlocks(false).filter((b) => b.type === "fn_root");

  if (roots.length === 0) {
    const b = ws.newBlock("fn_root");
    b.initSvg();
    (b as any).render?.();
    b.moveBy(40, 40);
  } else {
    for (let i = 1; i < roots.length; i++) roots[i].dispose(true);
  }
}

export function ensureFnParamsCount(
  ws: Blockly.WorkspaceSvg,
  project: ProjectState,
  wsId: string
) {
  const wsInfo = project.workspaces.find((w) => w.id === wsId);
  if (!wsInfo || wsInfo.kind !== "fn") return;

  const fnId = wsInfo.fnId;
  if (!fnId) return;

  const fn = project.functions.find((f) => f.id === fnId);
  const want = fn?.params?.length ?? 0;

  const roots = ws.getAllBlocks(false).filter((b) => b.type === "fn_root");
  if (roots.length !== 1) return;
  const root = roots[0];

  // ★ fn_root の statement input 名は "PARAMS"
  const stackConn = root.getInput("PARAMS")?.connection;
  if (!stackConn) return;

  // いま繋がってる param チェーンを辿る
  const chain: Blockly.Block[] = [];
  let cur = stackConn.targetBlock();
  while (cur && cur.type === "fn_param") {
    chain.push(cur);
    cur = cur.getNextBlock();
  }

  // 多い分は末尾から消す
  while (chain.length > want) {
    chain.pop()!.dispose(true);
  }

  // 末尾に繋ぐ補助
  const connectTail = (b: Blockly.Block) => {
    if (chain.length === 0) {
      stackConn.connect((b as any).previousConnection);
    } else {
      const tail = chain[chain.length - 1];
      (tail as any).nextConnection.connect((b as any).previousConnection);
    }
  };

  // 足りない分は追加して繋ぐ
  while (chain.length < want) {
    const b = ws.newBlock("fn_param");
    b.initSvg();
    (b as any).render?.();
    connectTail(b);
    chain.push(b);
  }

  // 名前反映（params配列をUIに出す）
  for (let i = 0; i < chain.length; i++) {
    chain[i].setFieldValue(fn?.params?.[i] ?? `p${i + 1}`, "NAME");
  }

  // Note: render needs to be triggered by caller usually, but explicit render here is fine if safe
  // ws.render(); -> Caller should handle refresh if needed, but safe to call
}

export function readFnParamsFromWorkspace(
  ws: Blockly.WorkspaceSvg,
  project: ProjectState,
  wsId: string
): string[] {
  const wsInfo = project.workspaces.find((w) => w.id === wsId);
  if (!wsInfo || wsInfo.kind !== "fn") return [];

  const root = ws.getAllBlocks(false).find((b) => b.type === "fn_root");
  if (!root) return [];

  const conn = root.getInput("PARAMS")?.connection;
  if (!conn) return [];

  const FIELD = "NAME";

  const out: string[] = [];
  let cur = conn.targetBlock(); // 先頭の fn_param
  while (cur && cur.type === "fn_param") {
    const name = String((cur as any).getFieldValue?.(FIELD) ?? "").trim();
    if (name) out.push(name);
    cur = cur.getNextBlock();
  }
  return out;
}
