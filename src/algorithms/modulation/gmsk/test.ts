import type { AlgorithmTestVector } from "../../core/types";

export const test: AlgorithmTestVector = {
  bits: [0, 1],
  expectedBitsPerSymbol: 1,
  expectedFirstSymbols: [{ re: 1, im: 0 }, { re: 0, im: 1 }],
};
