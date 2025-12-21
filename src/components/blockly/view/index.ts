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
      console.log("[VIEW] focus next=", next);
      if (next) path.setEnabled(false);
      focus.setEnabled(next);
      console.log(
        "[VIEW] now focus=",
        focus.isEnabled(),
        "path=",
        path.isEnabled()
      );
    },
    focusStep: focus.focusStep, // ★これを入れる（必須）

    // path
    togglePath: () => {
      const next = !path.isEnabled();
      console.log("[VIEW] path next=", next);
      if (next) focus.setEnabled(false);
      path.setEnabled(next);
      console.log(
        "[VIEW] now focus=",
        focus.isEnabled(),
        "path=",
        path.isEnabled()
      );
    },
    pathStep: path.pathStep, // （ViewApiに必須なら）
  };
};
