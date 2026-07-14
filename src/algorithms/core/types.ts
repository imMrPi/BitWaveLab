import type { AlgorithmDefinition, ComplexPoint, LabData, ParameterValue } from "../../domain/signal/signal.types";

export type AlgorithmRole = "modulator" | "source" | "transform" | "channel" | "receiver" | "decoder" | "measurement";
export type SignalView = "time" | "spectrum" | "constellation" | "bits" | "metrics" | "logs";

export interface AlgorithmInfo {
  version: number;
  definition: AlgorithmDefinition;
  role: AlgorithmRole;
  inverse?: string;
  views: SignalView[];
  docs: {
    fa: { summary: string; theory: string };
    en: { summary: string; theory: string };
  };
  equations: Record<string, string>;
}

export interface AlgorithmProcessContext {
  seed: number;
  executeOperation?: (
    definition: AlgorithmDefinition,
    input: LabData | undefined,
    params: Record<string, ParameterValue>,
    seed: number,
  ) => LabData;
}

export interface AlgorithmProcessArgs {
  input?: LabData;
  params: Record<string, ParameterValue>;
  context: AlgorithmProcessContext;
}

export type AlgorithmProcess = (args: AlgorithmProcessArgs) => LabData;

export interface AlgorithmPlugin {
  info: AlgorithmInfo;
  process: AlgorithmProcess;
}

export interface AlgorithmTestVector {
  bits: number[];
  expectedBitsPerSymbol: number;
  expectedFirstSymbols: ComplexPoint[];
  tolerance?: number;
}

export interface AlgorithmSmokeVector {
  algorithmId: string;
  inputKind: AlgorithmDefinition["input"];
  expectedKind: AlgorithmDefinition["output"];
  fidelity: AlgorithmDefinition["fidelity"];
}
