import type { AlgorithmDefinition } from "../../domain/signal/signal.types";
import type { AlgorithmInfo, AlgorithmRole, SignalView } from "./types";

interface CreateAlgorithmInfoOptions {
  definition: AlgorithmDefinition;
  role: AlgorithmRole;
  views: SignalView[];
  inverse?: string;
  englishSummary?: string;
  englishTheory?: string;
  equations?: Record<string, string>;
}

export function createAlgorithmInfo(options: CreateAlgorithmInfoOptions): AlgorithmInfo {
  const { definition } = options;
  return {
    version: 1,
    definition,
    role: options.role,
    inverse: options.inverse,
    views: [...options.views],
    docs: {
      fa: { summary: definition.summary, theory: definition.theory },
      en: {
        summary: options.englishSummary ?? `${definition.shortName} in the ${definition.category} stage.`,
        theory: options.englishTheory ?? `This plugin executes ${definition.name} through the shared ${definition.category} processing kernel.`,
      },
    },
    equations: { ...options.equations },
  };
}
