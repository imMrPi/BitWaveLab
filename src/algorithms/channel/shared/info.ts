import type { AlgorithmDefinition } from "../../../domain/signal/signal.types";
import { createAlgorithmInfo } from "../../core/create-algorithm-info";

export function createChannelInfo(definition: AlgorithmDefinition) {
  return createAlgorithmInfo({
    definition,
    role: "channel",
    views: ["time","spectrum","constellation","metrics"],
  });
}
