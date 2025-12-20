import * as Blockly from "blockly";
import { loadFnList } from "./fnListLoader";
import { setFnSpecs, getAllFnSpecs } from "./registry";
import { registerFnDynargsMutator } from "./mutatorFactory";
import { registerFnBlocks } from "./blockFactory";

import { registerFnGenerator } from "./registerFnGenerator";

export async function initDynamicFnBlocks() {


  registerFnDynargsMutator();


  const specs = await loadFnList();


  setFnSpecs(specs);


  registerFnBlocks(specs);


  // ★ここ
  for (const spec of specs) {
    const fn = spec.name.toUpperCase();
    const type = `frockly_${fn}`;
    registerFnGenerator(type, fn);
  }
}
