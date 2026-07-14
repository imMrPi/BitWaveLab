import type { AlgorithmTestVector } from "../../core/types";

const n = Math.sqrt(10);
export const test: AlgorithmTestVector = {
  bits: [0, 0, 0, 0, 0, 0, 0, 1],
  expectedBitsPerSymbol: 4,
  expectedFirstSymbols: [{ re: -3 / n, im: -3 / n }, { re: -3 / n, im: -1 / n }],
  tolerance: 1e-12,
};
