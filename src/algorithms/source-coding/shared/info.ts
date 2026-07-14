import type { AlgorithmDefinition } from "../../../domain/signal/signal.types";
import { createAlgorithmInfo } from "../../core/create-algorithm-info";

export function createSourceCodingInfo(definition: AlgorithmDefinition) {
  return createAlgorithmInfo({
    definition,
    role: "transform",
    views: ["bits","metrics"],
  });
}
