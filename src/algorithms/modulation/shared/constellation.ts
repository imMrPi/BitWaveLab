import type { ComplexPoint } from "../../../domain/signal/signal.types";
import { bitsPerSymbolFor, mapBitChunk, type ModulationScheme } from "./bit-mapping";
import { carrierSample } from "./carrier";

export interface ModulationResult {
  samples: number[];
  symbols: ComplexPoint[];
  bitsPerSymbol: number;
}

export function modulateBits(bits: number[], scheme: ModulationScheme, samplesPerSymbol: number, carrierFrequency: number, sampleRate: number): ModulationResult {
  const bitsPerSymbol = bitsPerSymbolFor(scheme);
  const padded = [...bits];
  const samples: number[] = [];
  const symbols: ComplexPoint[] = [];
  let differentialPhase = 0;
  while (padded.length % bitsPerSymbol) padded.push(0);

  for (let index = 0; index < padded.length; index += bitsPerSymbol) {
    const chunk = padded.slice(index, index + bitsPerSymbol);
    const mapped = mapBitChunk(scheme, chunk, differentialPhase);
    differentialPhase = mapped.differentialPhase;
    symbols.push(mapped.point);
    for (let sample = 0; sample < samplesPerSymbol; sample += 1) {
      samples.push(carrierSample(mapped.point, chunk[0], scheme, samples.length / sampleRate, carrierFrequency));
    }
  }
  return { samples, symbols, bitsPerSymbol };
}

export function constellationReference(scheme: ModulationScheme) {
  const bitsPerSymbol = bitsPerSymbolFor(scheme);
  const count = 2 ** bitsPerSymbol;
  const bits = Array.from({ length: count }, (_, symbol) => Array.from({ length: bitsPerSymbol }, (__, index) => (symbol >> (bitsPerSymbol - index - 1)) & 1)).flat();
  return modulateBits(bits, scheme, 4, 1000, 8000).symbols;
}
