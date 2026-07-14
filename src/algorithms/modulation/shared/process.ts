import type { AlgorithmInfo, AlgorithmProcess } from "../../core/types";
import type { LabData, ParameterValue } from "../../../domain/signal/signal.types";
import { modulateBits } from "./constellation";
import type { ModulationScheme } from "./bit-mapping";

function numberParam(params: Record<string, ParameterValue>, key: string, fallback: number) {
  const raw = params[key];
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function copyInput(input?: LabData): LabData {
  if (!input) return { kind: "none", sampleRate: 1, metrics: {}, metadata: {}, stages: [] };
  return {
    ...input,
    bits: input.bits ? [...input.bits] : undefined,
    samples: input.samples ? [...input.samples] : undefined,
    symbols: input.symbols ? input.symbols.map((point) => ({ ...point })) : undefined,
    metrics: { ...input.metrics }, metadata: { ...input.metadata }, stages: [...input.stages],
  };
}

export function createModulationProcess(info: AlgorithmInfo, scheme: ModulationScheme): AlgorithmProcess {
  return ({ input, params }) => {
    const data = copyInput(input);
    const bits = data.bits ?? data.originalBits ?? [];
    const samplesPerSymbol = Math.max(1, Math.round(numberParam(params, "sps", data.samplesPerSymbol ?? 16)));
    const sampleRate = Math.max(8000, (data.bitRate ?? 1000) * samplesPerSymbol);
    const result = modulateBits(bits, scheme, samplesPerSymbol, numberParam(params, "frequency", 1000), sampleRate);
    const averageEnergy = result.symbols.length
      ? result.symbols.reduce((sum, point) => sum + point.re * point.re + point.im * point.im, 0) / result.symbols.length
      : 0;
    return {
      ...data,
      kind: "samples",
      samples: result.samples,
      symbols: result.symbols,
      samplesPerSymbol,
      sampleRate,
      symbolRate: (data.bitRate ?? 1000) / result.bitsPerSymbol,
      metrics: { ...data.metrics, bitsPerSymbol: result.bitsPerSymbol, averageSymbolEnergy: averageEnergy },
      metadata: {
        ...data.metadata,
        executionEngine: "algorithm-plugin-v1",
        modulation: info.definition.shortName,
        constellationScheme: scheme,
        symbolMapping: ["qpsk", "8psk", "qam16", "qam64"].includes(scheme) ? "Gray-coded" : scheme === "fsk" || scheme === "gmsk" ? "Orthogonal basis" : "Binary",
      },
    };
  };
}
