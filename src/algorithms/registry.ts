import type { AlgorithmDefinition } from "../domain/signal/signal.types";
import type { AlgorithmPlugin } from "./core/types";
import { catalogAlgorithmPlugins } from "./catalog-plugins";
import { ask } from "./modulation/ask";
import { bpsk } from "./modulation/bpsk";
import { dpsk } from "./modulation/dpsk";
import { fsk } from "./modulation/fsk";
import { gmsk } from "./modulation/gmsk";
import { psk8 } from "./modulation/psk8";
import { qam16 } from "./modulation/qam16";
import { qam64 } from "./modulation/qam64";
import { qpsk } from "./modulation/qpsk";

export const algorithmPlugins: readonly AlgorithmPlugin[] = Object.freeze([
  ...catalogAlgorithmPlugins,
  ask, fsk, bpsk, qpsk, psk8, qam16, qam64, dpsk, gmsk,
]);

const pluginsById = new Map<string, AlgorithmPlugin>();
for (const plugin of algorithmPlugins) {
  const id = plugin.info.definition.id;
  if (pluginsById.has(id)) throw new Error(`Duplicate algorithm id: ${id}`);
  pluginsById.set(id, plugin);
}

export const registeredAlgorithmDefinitions: AlgorithmDefinition[] = algorithmPlugins.map(
  (plugin) => plugin.info.definition,
);

export function getAlgorithmPlugin(id: string) {
  return pluginsById.get(id);
}
