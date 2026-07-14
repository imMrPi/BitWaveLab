import type { AlgorithmDefinition } from "../../../domain/signal/signal.types";
import { createAlgorithmInfo } from "../../core/create-algorithm-info";

export function createReceiverInfo(definition: AlgorithmDefinition) {
  return createAlgorithmInfo({
    definition,
    role: "receiver",
    views: ["time","constellation","bits","metrics"],
  });
}
