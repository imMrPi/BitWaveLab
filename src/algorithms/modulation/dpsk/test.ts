import type { AlgorithmTestVector } from "../../core/types";

export const test: AlgorithmTestVector = {
  bits: [0, 1, 0, 1],
  expectedBitsPerSymbol: 1,
  expectedFirstSymbols: [{ re: 1, im: 0 }, { re: -1, im: 0 }, { re: -1, im: 0 }, { re: 1, im: 0 }],
  tolerance: 1e-12,
};
