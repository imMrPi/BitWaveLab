import assert from "node:assert/strict";
import test from "node:test";
import { computeComplexDFT, evaluateEpicycles, normalizePath, pathLength, prepareFourierPath, reconstructionError, resamplePath, selectHarmonics } from "../src/lib/fourier-epicycles.ts";

test("polyline resampling produces stable near-uniform arc-length samples", () => {
  const source = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 1 }];
  const sampled = resamplePath(source, 12);
  assert.equal(sampled.length, 12);
  const distances = sampled.slice(1).map((point, index) => Math.hypot(point.x - sampled[index].x, point.y - sampled[index].y));
  assert.ok(Math.max(...distances) - Math.min(...distances) < .42);
  assert.ok(Math.abs(pathLength(sampled) - 11) < .3);
});

test("normalization centers and bounds a free-form path", () => {
  const result = normalizePath([{ x: 100, y: 20 }, { x: 120, y: 40 }, { x: 140, y: 20 }]);
  const meanX = result.points.reduce((sum, point) => sum + point.x, 0) / result.points.length;
  const meanY = result.points.reduce((sum, point) => sum + point.y, 0) / result.points.length;
  assert.ok(Math.abs(meanX) < 1e-12);
  assert.ok(Math.abs(meanY) < 1e-12);
  assert.ok(Math.max(...result.points.flatMap((point) => [Math.abs(point.x), Math.abs(point.y)])) <= .8800001);
});

test("complex DFT exactly reconstructs a sampled circle with its full coefficient set", () => {
  const circle = Array.from({ length: 64 }, (_, index) => ({ x: Math.cos(index / 64 * Math.PI * 2), y: Math.sin(index / 64 * Math.PI * 2) }));
  const coefficients = computeComplexDFT(circle);
  const dominant = coefficients.find((item) => item.frequency === 1);
  assert.ok(dominant);
  assert.ok(Math.abs(dominant.amplitude - 1) < 1e-10);
  assert.ok(reconstructionError(circle, coefficients) < 1e-20);
  const quarter = evaluateEpicycles(coefficients, .25).endpoint;
  assert.ok(Math.abs(quarter.x) < 1e-10);
  assert.ok(Math.abs(quarter.y - 1) < 1e-10);
});

test("amplitude-ranked harmonic selection retains the strongest path energy first", () => {
  const path = prepareFourierPath(Array.from({ length: 80 }, (_, index) => ({ x: index, y: Math.sin(index / 8) * 20 })), 128);
  const coefficients = computeComplexDFT(path);
  const small = selectHarmonics(coefficients, 8);
  const large = selectHarmonics(coefficients, 48);
  assert.equal(small[0].frequency, 0);
  assert.ok(reconstructionError(path, large) < reconstructionError(path, small));
});
