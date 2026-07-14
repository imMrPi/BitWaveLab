import type { AlgorithmInfo, AlgorithmProcess } from "./types";

export function createOperationProcess(info: AlgorithmInfo): AlgorithmProcess {
  return ({ input, params, context }) => {
    if (!context.executeOperation) {
      throw new Error(`Algorithm operation kernel is unavailable for ${info.definition.id}`);
    }
    return context.executeOperation(info.definition, input, params, context.seed);
  };
}
