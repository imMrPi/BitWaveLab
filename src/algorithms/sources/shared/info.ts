import type { AlgorithmDefinition } from "../../../domain/signal/signal.types";
import { createAlgorithmInfo } from "../../core/create-algorithm-info";

export function createSourcesInfo(definition: AlgorithmDefinition) {
  return createAlgorithmInfo({
    definition,
    role: "source",
    views: ["time","spectrum","bits","metrics"],
  });
}
