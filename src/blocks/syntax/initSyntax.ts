import { registerSyntaxBlocks } from "./syntax";
import { registerSyntaxGenerators } from "./syntaxgen";

export function initSyntaxBlocks() {
  registerSyntaxBlocks();
  registerSyntaxGenerators();
}
