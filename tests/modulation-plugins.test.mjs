import test from "node:test";
import assert from "node:assert/strict";
import { bitsPerSymbolFor, mapBitChunk } from "../src/algorithms/modulation/shared/bit-mapping.ts";
import { carrierSample } from "../src/algorithms/modulation/shared/carrier.ts";
import { test as ask } from "../src/algorithms/modulation/ask/test.ts";
import { test as fsk } from "../src/algorithms/modulation/fsk/test.ts";
import { test as bpsk } from "../src/algorithms/modulation/bpsk/test.ts";
import { test as qpsk } from "../src/algorithms/modulation/qpsk/test.ts";
import { test as psk8 } from "../src/algorithms/modulation/psk8/test.ts";
import { test as qam16 } from "../src/algorithms/modulation/qam16/test.ts";
import { test as qam64 } from "../src/algorithms/modulation/qam64/test.ts";
import { test as dpsk } from "../src/algorithms/modulation/dpsk/test.ts";
import { test as gmsk } from "../src/algorithms/modulation/gmsk/test.ts";

const vectors = { ask, fsk, bpsk, qpsk, "8psk": psk8, qam16, qam64, dpsk, gmsk };

function assertPoint(actual, expected, tolerance) {
  assert.ok(Math.abs(actual.re - expected.re) <= tolerance, `I: expected ${expected.re}, received ${actual.re}`);
  assert.ok(Math.abs(actual.im - expected.im) <= tolerance, `Q: expected ${expected.im}, received ${actual.im}`);
}

test("all migrated modulation schemes match their golden symbol vectors", () => {
  for (const [scheme, vector] of Object.entries(vectors)) {
    const bitsPerSymbol = bitsPerSymbolFor(scheme);
    assert.equal(bitsPerSymbol, vector.expectedBitsPerSymbol, `${scheme} bits per symbol`);
    let differentialPhase = 0;
    for (let index = 0; index < vector.expectedFirstSymbols.length; index += 1) {
      const chunk = vector.bits.slice(index * bitsPerSymbol, (index + 1) * bitsPerSymbol);
      const mapped = mapBitChunk(scheme, chunk, differentialPhase);
      differentialPhase = mapped.differentialPhase;
      assertPoint(mapped.point, vector.expectedFirstSymbols[index], vector.tolerance ?? 0);
    }
  }
});

test("PSK and QAM constellations use unit average symbol energy", () => {
  for (const scheme of ["bpsk", "qpsk", "8psk", "qam16", "qam64"]) {
    const bitsPerSymbol = bitsPerSymbolFor(scheme);
    let energy = 0;
    const count = 2 ** bitsPerSymbol;
    for (let symbol = 0; symbol < count; symbol += 1) {
      const chunk = Array.from({ length: bitsPerSymbol }, (_, bit) => (symbol >> (bitsPerSymbol - bit - 1)) & 1);
      const point = mapBitChunk(scheme, chunk, 0).point;
      energy += point.re ** 2 + point.im ** 2;
    }
    assert.ok(Math.abs(energy / count - 1) < 1e-12, `${scheme} average energy`);
  }
});

test("carrier generation preserves BPSK phase and separates FSK tones", () => {
  assert.equal(carrierSample({ re: 1, im: 0 }, 1, "bpsk", 0, 1000), 1);
  assert.equal(carrierSample({ re: -1, im: 0 }, 0, "bpsk", 0, 1000), -1);
  const t = 1 / 8000;
  assert.notEqual(carrierSample({ re: 1, im: 0 }, 0, "fsk", t, 1000), carrierSample({ re: 0, im: 1 }, 1, "fsk", t, 1000));
});
