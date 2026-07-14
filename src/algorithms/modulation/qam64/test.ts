import type { AlgorithmTestVector } from "../../core/types";

const n = Math.sqrt(42);
export const test: AlgorithmTestVector = {
  bits: [0, 0, 0, 0, 0, 0],
  expectedBitsPerSymbol: 6,
  expectedFirstSymbols: [{ re: -7 / n, im: -7 / n }],
  tolerance: 1e-12,
};
