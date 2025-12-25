// src/components/blockly/view/index.ts
import type { ViewApi, ViewDeps } from "./types";
import { createCollapseController } from "./collapse";
import { createFocusController } from "./focus";
import { createPathController } from "./path";

export const createViewApi = (deps: ViewDeps): ViewApi => {
  const collapse = createCollapseController(deps);
  const focus = createFocusController(deps);
  const path = createPathController(deps);

  return {
    // collapse
    collapseAll: collapse.collapseAll,
    expandAll: collapse.expandAll,
    expandStep: collapse.expandStep,

    // focus
    toggleFocus: () => {
      const next = !focus.isEnabled();
      if (next) path.setEnabled(false);
      focus.setEnabled(next);
    },
    focusStep: focus.focusStep, // ★これを入れる（必須）

    // path
    togglePath: () => {
      const next = !path.isEnabled();
      if (next) focus.setEnabled(false);
      path.setEnabled(next);

    },
    pathStep: path.pathStep, // （ViewApiに必須なら）
  };
};
