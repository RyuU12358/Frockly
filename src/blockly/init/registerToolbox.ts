// src/blockly/init/registerToolbox.ts
import * as Blockly from "blockly";
import {
  xmlButton,
  xmlLabel,
  xmlSep,
} from "../../components/workspaceSwitcher/WsFlyoutUI";

export type WorkspaceListItem = {
  id: string;
  title: string;
};

export type NamedFnItem = {
  id: string;
  name: string;
  params: string[];
  workspaceId: string;
};

export type RegisterToolboxDeps = {
  // WS一覧
  getMainWorkspace: () => WorkspaceListItem; // {id:"main", title:"メイン"}
  getFnWorkspaces: () => NamedFnItem[];

  // 操作
  onSwitchWorkspace: (wsId: string) => void;
  onCreateFn: () => void;
  onDuplicateFn: (fnId: string) => void;
  onDeleteFn: (fnId: string) => void;
  onRenameFn?: (fnId: string) => void; // v0.1 では未使用でもOK

  // 重要：メインへ自動切替して挿入（確定仕様）
  onInsertFnToMain: (fnId: string) => void;
};

/**
 * toolbox XML（基本/履歴は既存のままでOK）
 * ここでは WS スイッチャ用 category を足すだけのサンプル。
 */
export function buildToolboxXml(): string {
  // 既存XMLがあるなら concat してもOK
  return `
    <xml id="toolbox" style="display: none">
      <category name="Workspaces" colour="#666" custom="FROCKLY_WS"></category>
      <sep gap="12"></sep>

      <!-- ここは既存のまま -->
      <category name="Basic" colour="#4C97FF">
        <block type="basic_start"></block>
      </category>

      <category name="History" colour="#888" custom="FROCKLY_HISTORY"></category>
    </xml>
  `;
}

export function registerToolbox(
  workspace: Blockly.WorkspaceSvg,
  deps: RegisterToolboxDeps
) {
  // --- Flyout callback: Workspaces
  workspace.registerToolboxCategoryCallback("FROCKLY_WS", () => {
    const out: Element[] = [];

    // メイン
    out.push(xmlLabel("▶ メインワークスペース"));
    {
      const main = deps.getMainWorkspace();
      // 切替ボタン
      out.push(xmlButton(`開く: ${main.title}`, `WS_OPEN__${main.id}`));
    }

    out.push(xmlSep(12));

    // 名前付き関数
    out.push(xmlLabel("▶ 名前付き関数"));
    out.push(xmlButton("＋ 新規作成", "FN_CREATE"));

    const fns = deps.getFnWorkspaces();
    for (const fn of fns) {
      out.push(xmlSep(6));
      out.push(xmlButton(`開く: ${fn.name}`, `WS_OPEN__${fn.workspaceId}`));
      out.push(
        xmlButton(`メインに挿入: ${fn.name}`, `FN_INSERT_MAIN__${fn.id}`)
      );
      out.push(xmlButton(`複製: ${fn.name}`, `FN_DUP__${fn.id}`));
      out.push(xmlButton(`削除: ${fn.name}`, `FN_DEL__${fn.id}`));
    }

    return out;
  });

  // --- Button callbacks
  workspace.registerButtonCallback("FN_CREATE", () => deps.onCreateFn());

  // open workspace / fn actions are dynamic keys → まとめて拾う
  workspace.registerButtonCallback("DUMMY", () => {
    /* unused */
  });

  // Blocklyは callbackKey が一致したときだけ呼ぶ仕組みなので、
  // 動的callbackKeyを拾うために、workspace側の click をフックする。
  // ただし v0.1 は簡単にするため、キーを全部登録する（数が少ない前提）。
  const main = deps.getMainWorkspace();
  workspace.registerButtonCallback(`WS_OPEN__${main.id}`, () =>
    deps.onSwitchWorkspace(main.id)
  );

  for (const fn of deps.getFnWorkspaces()) {
    workspace.registerButtonCallback(`WS_OPEN__${fn.workspaceId}`, () =>
      deps.onSwitchWorkspace(fn.workspaceId)
    );
    workspace.registerButtonCallback(`FN_INSERT_MAIN__${fn.id}`, () =>
      deps.onInsertFnToMain(fn.id)
    );
    workspace.registerButtonCallback(`FN_DUP__${fn.id}`, () =>
      deps.onDuplicateFn(fn.id)
    );
    workspace.registerButtonCallback(`FN_DEL__${fn.id}`, () =>
      deps.onDeleteFn(fn.id)
    );
  }
}
