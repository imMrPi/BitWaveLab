import type { AlgorithmTestVector } from "../../core/types";

const a = 1 / Math.SQRT2;
export const test: AlgorithmTestVector = {
  bits: [0, 0, 0, 1, 1, 0, 1, 1],
  expectedBitsPerSymbol: 2,
  expectedFirstSymbols: [{ re: a, im: a }, { re: -a, im: a }, { re: a, im: -a }, { re: -a, im: -a }],
  tolerance: 1e-12,
};
