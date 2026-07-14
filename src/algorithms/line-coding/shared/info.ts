import type { AlgorithmDefinition } from "../../../domain/signal/signal.types";
import { createAlgorithmInfo } from "../../core/create-algorithm-info";

export function createLineCodingInfo(definition: AlgorithmDefinition) {
  return createAlgorithmInfo({
    definition,
    role: "transform",
    views: ["time","spectrum","bits","metrics"],
  });
}
