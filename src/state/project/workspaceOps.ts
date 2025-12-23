// src/state/project/workspaceOps.ts
import type { FunctionEntity, ProjectState, WorkspaceEntity } from "./types";
import {
  initProjectState,
  getProjectState,
  updateProjectState,
} from "./projectStore";
const FN_ROOT_XML = (fnId: string, name: string) =>
  `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="fn_root" x="40" y="40">
    <field name="FN_ID">${fnId}</field>
    <field name="FN_NAME">${escapeXml(name)}</field>
  </block>
</xml>
`.trim();
export function setActiveWorkspaceId(id: string) {
  updateProjectState((s) => ({
    ...s,
    activeWorkspaceId: id,
  }));
}
function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function replaceFnNameInXml(xml: string, newName: string) {
  if (!xml) return xml;
  const escaped = escapeXml(newName);
  return xml.replace(
    /<field name="FN_NAME">[\s\S]*?<\/field>/,
    `<field name="FN_NAME">${escaped}</field>`
  );
}
export function saveWorkspaceXml(wsId: string, xml: string) {
  updateProjectState((s) => ({
    ...s,
    workspaces: s.workspaces.map((w) => (w.id === wsId ? { ...w, xml } : w)),
  }));
}

// 便利：今のactiveを保存
export function saveActiveWorkspaceXml(xml: string) {
  const s = getProjectState();
  saveWorkspaceXml(s.activeWorkspaceId, xml);
}

function uid(prefix: string) {
  return `${prefix}_${Math.random()
    .toString(16)
    .slice(2)}_${Date.now().toString(16)}`;
}

export function ensureProjectInitialized() {
  try {
    getProjectState();
    return;
  } catch {
    // no-op
  }

  const mainId = "ws_main";
  const initial: ProjectState = {
    version: 1,
    activeWorkspaceId: mainId,
    workspaces: [
      {
        id: mainId,
        kind: "main",
        title: "メイン",
        xml: "", // 初回は空
      },
    ],
    functions: [],
  };

  initProjectState(initial);
}

export function getMainWorkspaceId(s: ProjectState): string {
  const main = s.workspaces.find((w) => w.kind === "main");
  if (!main) throw new Error("main workspace missing");
  return main.id;
}

export function findWorkspace(
  s: ProjectState,
  wsId: string
): WorkspaceEntity | undefined {
  return s.workspaces.find((w) => w.id === wsId);
}

export function findFn(
  s: ProjectState,
  fnId: string
): FunctionEntity | undefined {
  return s.functions.find((f) => f.id === fnId);
}

export function listFnItems(s: ProjectState) {
  return s.functions.map((f) => ({
    id: f.id,
    name: f.name,
    params: f.params,
    workspaceId: f.workspaceId,
  }));
}

export function setWorkspaceXml(wsId: string, xml: string) {
  updateProjectState((s) => ({
    ...s,
    workspaces: s.workspaces.map((w) => (w.id === wsId ? { ...w, xml } : w)),
  }));
}

export function switchWorkspace(wsId: string) {
  updateProjectState((s) => ({
    ...s,
    activeWorkspaceId: wsId,
  }));
}

export function createNamedFunction(name = "A", params: string[] = []) {
  const fnId = uid("fn");
  const wsId = uid("ws_fn");

  updateProjectState((s) => {
    const fn: FunctionEntity = {
      id: fnId,
      name,
      params,
      workspaceId: wsId,
    };

    const ws: WorkspaceEntity = {
      id: wsId,
      kind: "fn",
      title: name,
      xml: FN_ROOT_XML(fnId, name),
    };

    return {
      ...s,
      functions: [...s.functions, fn],
      workspaces: [...s.workspaces, ws],
      activeWorkspaceId: wsId,
    };
  });

  return { fnId, wsId }; // ★追加
}

export function renameNamedFunction(fnId: string, newName: string) {
  updateProjectState((s) => {
    const fn = findFn(s, fnId);
    if (!fn) return s;

    return {
      ...s,
      functions: s.functions.map((f) =>
        f.id === fnId ? { ...f, name: newName } : f
      ),
      workspaces: s.workspaces.map((w) =>
        w.id === fn.workspaceId
          ? { ...w, title: newName, xml: replaceFnNameInXml(w.xml, newName) }
          : w
      ),
    };
  });
}

export function duplicateNamedFunction(fnId: string) {
  updateProjectState((s) => {
    const src = findFn(s, fnId);
    if (!src) return s;

    const newFnId = uid("fn");
    const newWsId = uid("ws_fn");

    const newName = `${src.name} (copy)`;

    const copiedFn: FunctionEntity = {
      ...src,
      id: newFnId,
      name: newName,
      workspaceId: newWsId,
    };
    const copiedWs: WorkspaceEntity = {
      id: newWsId,
      kind: "fn",
      title: newName,
      xml: FN_ROOT_XML(newFnId, newName), // ★これ
    };

    return {
      ...s,
      functions: [...s.functions, copiedFn],
      workspaces: [...s.workspaces, copiedWs],
      activeWorkspaceId: newWsId,
    };
  });
}

export function deleteNamedFunction(fnId: string) {
  updateProjectState((s) => {
    const fn = findFn(s, fnId);
    if (!fn) return s;

    const nextFunctions = s.functions.filter((f) => f.id !== fnId);
    const nextWorkspaces = s.workspaces.filter((w) => w.id !== fn.workspaceId);

    // active が消えるならメインへ
    let active = s.activeWorkspaceId;
    if (active === fn.workspaceId) active = getMainWorkspaceId(s);

    return {
      ...s,
      functions: nextFunctions,
      workspaces: nextWorkspaces,
      activeWorkspaceId: active,
    };
  });
}
