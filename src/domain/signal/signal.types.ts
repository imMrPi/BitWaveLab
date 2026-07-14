export type DataKind =
  | "none"
  | "bits"
  | "samples"
  | "symbols"
  | "frames"
  | "metrics";

export type AlgorithmCategory =
  | "sources"
  | "analysis"
  | "sampling"
  | "quantization"
  | "source-coding"
  | "channel-coding"
  | "line-coding"
  | "scrambling"
  | "multiplexing"
  | "modulation"
  | "pulse-shaping"
  | "channel"
  | "synchronization"
  | "receiver"
  | "decoding"
  | "reconstruction"
  | "embedded";

export type ParameterValue = string | number | boolean;

export interface ComplexPoint {
  re: number;
  im: number;
}

export interface LabData {
  kind: DataKind;
  bits?: number[];
  samples?: number[];
  symbols?: ComplexPoint[];
  sampleRate: number;
  bitRate?: number;
  symbolRate?: number;
  samplesPerSymbol?: number;
  originalBits?: number[];
  metrics: Record<string, number | string | boolean>;
  metadata: Record<string, number | string | boolean>;
  stages: string[];
}

export interface ParameterDefinition {
  key: string;
  label: string;
  type: "range" | "number" | "select" | "text" | "toggle";
  default: ParameterValue;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string }>;
  hidden?: boolean;
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  shortName: string;
  category: AlgorithmCategory;
  summary: string;
  theory: string;
  input: DataKind | "any";
  output: DataKind | "same";
  operation: string;
  fidelity: "exact" | "educational";
  params: ParameterDefinition[];
  tags: string[];
}
