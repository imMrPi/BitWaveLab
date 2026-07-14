import type { AlgorithmInfo } from "../../core/types";
import type { ModulationScheme } from "./bit-mapping";

const parameters = [
  { key: "sps", label: "نمونه در هر سمبل", type: "range" as const, default: 16, min: 4, max: 48, step: 1, unit: "sps" },
  { key: "frequency", label: "فرکانس", type: "range" as const, default: 1000, min: 10, max: 3000, step: 10, unit: "Hz" },
];

interface ModulationInfoOptions {
  scheme: ModulationScheme;
  id?: string;
  name: string;
  summaryFa: string;
  theoryFa: string;
  summaryEn: string;
  theoryEn: string;
  inverse: string;
  fidelity?: "exact" | "educational";
  equations: Record<string, string>;
}

export function createModulationInfo(options: ModulationInfoOptions): AlgorithmInfo {
  return {
    version: 1,
    role: "modulator",
    inverse: options.inverse,
    views: ["time", "spectrum", "constellation", "bits", "metrics"],
    definition: {
      id: options.id ?? `mod.${options.scheme}`,
      name: options.name,
      shortName: options.name,
      category: "modulation",
      summary: options.summaryFa,
      theory: options.theoryFa,
      input: "bits",
      output: "samples",
      operation: `mod-${options.scheme}`,
      fidelity: options.fidelity ?? "exact",
      params: parameters.map((parameter) => ({ ...parameter })),
      tags: ["digital-modulation", options.scheme],
    },
    docs: {
      fa: { summary: options.summaryFa, theory: options.theoryFa },
      en: { summary: options.summaryEn, theory: options.theoryEn },
    },
    equations: options.equations,
  };
}
