import type { AlgorithmPlugin } from "./types";

export function defineAlgorithm(plugin: AlgorithmPlugin): AlgorithmPlugin {
  if (!plugin.info.definition.id.includes(".")) throw new Error(`Algorithm id must be namespaced: ${plugin.info.definition.id}`);
  if (!plugin.info.views.length) throw new Error(`Algorithm must declare at least one compatible view: ${plugin.info.definition.id}`);
  return Object.freeze(plugin);
}
