// src/blocks/gen/ensureArgs.ts
import * as Blockly from "blockly";
import type { FnSpec } from "./types";

const ARG_PREFIX = "ARG";

function inputName(i: number) {
  return `${ARG_PREFIX}${i}`;
}

/**
 * block の引数 input を argc 個に揃える
 * - input 名は ARG_0..ARG_{argc-1}
 * - 既存接続は極力保持（外れる場合もあるけどベター）
 * - variadic=false の関数でも argc を min に固定する前提なら安全
 */
export function ensureArgs(block: Blockly.Block, argc: number, spec: FnSpec) {
  const min = Math.max(0, spec.min ?? 0);

  // 固定引数なら min に寄せる（仕様：argc変えない運用でもOK）
  if (!spec.variadic) argc = min;
  else argc = Math.max(min, argc);

  // max（0 = 無制限）
  const max = spec.variadic ? (spec.max ?? 0) : min;
  if (spec.variadic && max > 0) argc = Math.min(argc, max);

  // 既存接続を覚える（ARG_i の targetConnection）
  const prevTargets: Array<Blockly.Connection | null> = [];
  for (let i = 0; i < 512; i++) {
    const inp = block.getInput(inputName(i));
    if (!inp) break;
    prevTargets[i] = inp.connection?.targetConnection ?? null;
  }

  // いったん全部 ARG_ を消して作り直すのが一番事故らん
  // （順序ズレ・途中挿入・フィールド残骸を避ける）
  // ただし他の入力（例: 先頭ラベル）には触らない
  for (let i = 0; i < 512; i++) {
    const name = inputName(i);
    if (!block.getInput(name)) break;
    block.removeInput(name, /*quiet*/ true);
  }

  // 作り直し

  for (let i = 0; i < argc; i++) {
    block.appendValueInput(inputName(i));
    // カンマ表示はしない（邪魔）
  }


  // 接続を戻す（できる範囲で）
  for (let i = 0; i < argc; i++) {
    const target = prevTargets[i];
    if (!target) continue;

    const inp = block.getInput(inputName(i));
    const conn = inp?.connection;
    if (!conn) continue;

    try {
      // 既に接続されてたら一旦外す
      if (conn.isConnected()) conn.disconnect();
      conn.connect(target);
    } catch {
      // 型不一致などで失敗する可能性はあるので握りつぶし
    }
  }

  // ついでにブロック見た目更新
  // block.render() は型的に怒られることがあるので any で叩く
  const ws = (block.workspace as any);
  if (ws?.render) ws.render();
}
