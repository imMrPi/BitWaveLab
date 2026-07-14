import type { AlgorithmDefinition } from "../../../domain/signal/signal.types";
import { createAlgorithmInfo } from "../../core/create-algorithm-info";

export function createAnalysisInfo(definition: AlgorithmDefinition) {
  return createAlgorithmInfo({
    definition,
    role: "measurement",
    views: ["time","spectrum","constellation","bits","metrics"],
  });
}
