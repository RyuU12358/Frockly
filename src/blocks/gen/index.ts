import { loadFnList } from "./fnListLoader";
import { setFnSpecs } from "./registry";
import { registerFnDynargsMutator } from "./mutatorFactory";
import { registerFnBlocks } from "./blockFactory";

import { registerFnGenerator } from "./registerFnGenerator";
import { registerFnUiExtension } from "../extensions/fnUi";

export async function initDynamicFnBlocks() {
  registerFnDynargsMutator();
  registerFnUiExtension();
  const specs = await loadFnList();

  setFnSpecs(specs);

  registerFnBlocks(specs);

  const EXCLUDE = new Set(["LET", "LAMBDA"]);

  for (const spec of specs) {
    const fn = spec.name.toUpperCase();
    if (EXCLUDE.has(fn)) continue;

    const type = `frockly_${fn}`;
    registerFnGenerator(type, fn);
  }
}

export async function updateDynamicFnLocales(lang: string) {
  const specs = await loadFnList(lang);
  setFnSpecs(specs);
}
