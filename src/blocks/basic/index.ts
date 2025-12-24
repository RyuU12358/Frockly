import { registerBasicBlocks } from "./blocks";
import { registerBasicGenerators } from "./generators";
import type { UiLang } from "../../i18n/strings";
import { registerFnGenerators } from "../fn/generators";
import { registerBasicUiExtension } from "./basicUi";
export function registerBasic(uiLang: UiLang) {
  registerBasicUiExtension();
  registerBasicBlocks(uiLang);
  registerFnGenerators();
  registerBasicGenerators();
}

export { registerBasicBlocks, registerBasicGenerators };
