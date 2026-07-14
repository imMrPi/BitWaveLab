import type { AlgorithmTestVector } from "../../core/types";

export const test: AlgorithmTestVector = {
  bits: [0, 0, 0, 0, 0, 1],
  expectedBitsPerSymbol: 3,
  expectedFirstSymbols: [
    { re: Math.cos(Math.PI / 8), im: Math.sin(Math.PI / 8) },
    { re: Math.cos(3 * Math.PI / 8), im: Math.sin(3 * Math.PI / 8) },
  ],
  tolerance: 1e-12,
};
