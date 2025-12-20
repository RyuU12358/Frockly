import * as Blockly from "blockly";
import { tokenizeFormula } from "./tokenize";
import { parseAst } from "./parser";
import { astToBlockly } from "./astToBlockly";

export function blockFromFormula(workspace: Blockly.WorkspaceSvg, formulaText: string) {
  const { src, toks } = tokenizeFormula(formulaText);
  const ast = parseAst(src, toks);

  // ルート (= start)
  const start = workspace.newBlock("basic_start");
  start.initSvg();
  (start as any).render?.();

  const built = astToBlockly(workspace, ast);

  // start.EXPR ← built
  const exprConn = start.getInput("EXPR")?.connection;
  if (exprConn && built.outConn) exprConn.connect(built.outConn);

  start.moveBy(40, 40);

  // 選択（workspace.setSelectedは使わん）
  (start as any).select?.();

  // 最後にレイアウト更新（君の流儀）
  workspace.resize();

  return start;
}
