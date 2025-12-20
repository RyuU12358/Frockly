import { registerBasicBlocks } from "./blocks";
import { registerBasicGenerators } from "./generators";
import type { UiLang } from "../../i18n/strings";
export function registerBasic(uiLang :UiLang) {



  registerBasicBlocks(uiLang);



  registerBasicGenerators();



}

export { registerBasicBlocks, registerBasicGenerators };
