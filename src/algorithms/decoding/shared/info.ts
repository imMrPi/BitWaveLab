import type { AlgorithmDefinition } from "../../../domain/signal/signal.types";
import { createAlgorithmInfo } from "../../core/create-algorithm-info";

export function createDecodingInfo(definition: AlgorithmDefinition) {
  return createAlgorithmInfo({
    definition,
    role: "decoder",
    views: ["bits","metrics"],
  });
}
