import type { ComplexPoint } from "../../../domain/signal/signal.types";

export type ModulationScheme = "ask" | "fsk" | "bpsk" | "qpsk" | "8psk" | "qam16" | "qam64" | "dpsk" | "gmsk";

export function bitsPerSymbolFor(scheme: ModulationScheme) {
  if (scheme === "qpsk") return 2;
  if (scheme === "8psk") return 3;
  if (scheme === "qam16") return 4;
  if (scheme === "qam64") return 6;
  return 1;
}

function grayToBinary(gray: number) {
  let binary = gray;
  for (let shifted = gray >> 1; shifted; shifted >>= 1) binary ^= shifted;
  return binary;
}

export function mapBitChunk(
  scheme: ModulationScheme,
  chunk: number[],
  differentialPhase: number,
): { point: ComplexPoint; differentialPhase: number } {
  if (scheme === "qpsk") {
    const map = [{ re: 1, im: 1 }, { re: -1, im: 1 }, { re: 1, im: -1 }, { re: -1, im: -1 }];
    const point = map[chunk[0] * 2 + chunk[1]];
    return { point: { re: point.re / Math.SQRT2, im: point.im / Math.SQRT2 }, differentialPhase };
  }
  if (scheme === "8psk") {
    const gray = chunk.reduce((acc, bit) => acc * 2 + bit, 0);
    const angle = Math.PI / 8 + (2 * Math.PI * grayToBinary(gray)) / 8;
    return { point: { re: Math.cos(angle), im: Math.sin(angle) }, differentialPhase };
  }
  if (scheme === "qam16" || scheme === "qam64") {
    const side = scheme === "qam16" ? 4 : 8;
    const axisBits = bitsPerSymbolFor(scheme) / 2;
    const grayI = chunk.slice(0, axisBits).reduce((acc, bit) => acc * 2 + bit, 0);
    const grayQ = chunk.slice(axisBits).reduce((acc, bit) => acc * 2 + bit, 0);
    const norm = Math.sqrt((2 / 3) * (side * side - 1));
    return { point: { re: (2 * grayToBinary(grayI) - (side - 1)) / norm, im: (2 * grayToBinary(grayQ) - (side - 1)) / norm }, differentialPhase };
  }
  if (scheme === "dpsk") {
    const nextPhase = chunk[0] ? (differentialPhase + Math.PI) % (2 * Math.PI) : differentialPhase;
    return { point: { re: Math.cos(nextPhase), im: Math.sin(nextPhase) }, differentialPhase: nextPhase };
  }
  if (scheme === "ask") return { point: { re: chunk[0], im: 0 }, differentialPhase };
  if (scheme === "fsk" || scheme === "gmsk") return { point: chunk[0] ? { re: 0, im: 1 } : { re: 1, im: 0 }, differentialPhase };
  return { point: { re: chunk[0] ? 1 : -1, im: 0 }, differentialPhase };
}
