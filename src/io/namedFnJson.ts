// src/io/namedFnJson.ts
import type { NamedFnItem } from "../components/ribbon/tabs/NamedFunctionsTab";

/**
 * JSONに保存する1関数分
 * workspaceId は import 時に再発行するので含めない
 */
export type ExportedNamedFn = Omit<NamedFnItem, "workspaceId"> & {
  workspaceXml: string;
};

export type NamedFnLibraryJson = {
  schemaVersion: number;
  exportedAt: string;
  fns: Array<{
    id: string;
    name: string;
    params: string[];
    description?: string;
    workspaceXml: string;
  }>;
};
export type ExportNamedFnPayload = {
  version: 1;
  exportedAt: string;
  functions: {
    name: string;
    params: string[];
    description?: string;
    workspaceXml: string;
  }[];
};

export type ImportedNamedFn = {
  fn: NamedFnItem;
  workspaceXml: string;
};

import type { ProjectState } from "../state/project/types";

export function exportNamedFunctions(project: ProjectState) {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    fns: project.functions.map((fn) => {
      const ws = project.workspaces.find((w) => w.id === fn.workspaceId);
      return {
        name: fn.name,
        params: fn.params ?? [],
        description: fn.description ?? "",
        workspaceXml: ws?.xml ?? "",
      };
    }),
  };
}

export function downloadNamedFunctionsJson(
  data: NamedFnLibraryJson,
  fileName = "named-functions.json"
) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

//---import--

export function importNamedFunctions(
  json: any,
  opts?: { renameOnConflict?: boolean }
) {
  const schema = json?.schemaVersion ?? json?.version; // ★互換
  if (schema !== 1) {
    throw new Error(`Unsupported schemaVersion: ${schema}`);
  }

  const list = json?.fns ?? json?.functions ?? []; // ★互換
  if (!Array.isArray(list)) {
    throw new Error("Invalid named function JSON: fns/functions is not array");
  }

  const rename = opts?.renameOnConflict ?? true;

  const usedNames = new Set<string>();
  const result: ImportedNamedFn[] = [];

  for (const src of list) {
    let name = String(src?.name ?? "Unnamed");

    if (rename) {
      let i = 2;
      while (usedNames.has(name))
        name = `${String(src?.name ?? "Unnamed")} (${i++})`;
    }
    usedNames.add(name);

    const fnId = crypto.randomUUID();
    const workspaceId = crypto.randomUUID();

    result.push({
      fn: {
        id: fnId,
        name,
        params: Array.isArray(src?.params) ? src.params : [],
        description: src?.description ?? "",
        workspaceId,
      },
      workspaceXml: String(src?.workspaceXml ?? ""),
    });
  }

  return result;
}
