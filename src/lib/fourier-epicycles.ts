export type Point2D = { x: number; y: number };

export type FourierVector = {
  frequency: number;
  re: number;
  im: number;
  amplitude: number;
  phase: number;
};

export type EpicycleSegment = FourierVector & {
  start: Point2D;
  end: Point2D;
};

const TAU = Math.PI * 2;

export function pathLength(points: Point2D[]) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  return length;
}

export function resamplePath(points: Point2D[], sampleCount = 512) {
  if (points.length < 2) return points.slice();
  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulative.push(cumulative[index - 1] + Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y));
  }
  const total = cumulative.at(-1) ?? 0;
  if (total < 1e-9) return Array.from({ length: sampleCount }, () => ({ ...points[0] }));
  const output: Point2D[] = [];
  let segment = 1;
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const target = (sample / Math.max(1, sampleCount - 1)) * total;
    while (segment < cumulative.length - 1 && cumulative[segment] < target) segment += 1;
    const before = points[segment - 1];
    const after = points[segment];
    const span = Math.max(1e-9, cumulative[segment] - cumulative[segment - 1]);
    const ratio = (target - cumulative[segment - 1]) / span;
    output.push({ x: before.x + (after.x - before.x) * ratio, y: before.y + (after.y - before.y) * ratio });
  }
  return output;
}

export function normalizePath(points: Point2D[]) {
  if (!points.length) return { points: [], center: { x: 0, y: 0 }, scale: 1 };
  const center = points.reduce((sum, point) => ({ x: sum.x + point.x / points.length, y: sum.y + point.y / points.length }), { x: 0, y: 0 });
  const centered = points.map((point) => ({ x: point.x - center.x, y: point.y - center.y }));
  const extent = Math.max(1e-9, ...centered.flatMap((point) => [Math.abs(point.x), Math.abs(point.y)]));
  const scale = 0.88 / extent;
  return { points: centered.map((point) => ({ x: point.x * scale, y: point.y * scale })), center, scale };
}

export function prepareFourierPath(points: Point2D[], sampleCount = 512) {
  return normalizePath(resamplePath(points, sampleCount)).points;
}

export function computeComplexDFT(points: Point2D[]) {
  const count = points.length;
  if (!count) return [];
  const coefficients: FourierVector[] = [];
  for (let bin = 0; bin < count; bin += 1) {
    let re = 0;
    let im = 0;
    for (let sample = 0; sample < count; sample += 1) {
      const angle = -TAU * bin * sample / count;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      re += points[sample].x * cosine - points[sample].y * sine;
      im += points[sample].x * sine + points[sample].y * cosine;
    }
    re /= count;
    im /= count;
    re = Math.abs(re) < 1e-12 ? 0 : Number(re.toFixed(12));
    im = Math.abs(im) < 1e-12 ? 0 : Number(im.toFixed(12));
    const frequency = bin <= count / 2 ? bin : bin - count;
    const amplitude = Number(Math.hypot(re, im).toFixed(12));
    const phase = amplitude === 0 ? 0 : Number(Math.atan2(im, re).toFixed(12));
    coefficients.push({ frequency, re, im, amplitude, phase });
  }
  return coefficients.sort((left, right) => {
    if (left.frequency === 0) return -1;
    if (right.frequency === 0) return 1;
    return right.amplitude - left.amplitude || Math.abs(left.frequency) - Math.abs(right.frequency) || left.frequency - right.frequency;
  });
}

export function selectHarmonics(coefficients: FourierVector[], count: number) {
  return coefficients.slice(0, Math.max(1, Math.min(count, coefficients.length)));
}

export function evaluateEpicycles(coefficients: FourierVector[], progress: number, origin: Point2D = { x: 0, y: 0 }) {
  let cursor = { ...origin };
  const segments: EpicycleSegment[] = [];
  for (const coefficient of coefficients) {
    const angle = TAU * coefficient.frequency * progress + coefficient.phase;
    const end = { x: cursor.x + coefficient.amplitude * Math.cos(angle), y: cursor.y + coefficient.amplitude * Math.sin(angle) };
    segments.push({ ...coefficient, start: cursor, end });
    cursor = end;
  }
  return { endpoint: cursor, segments };
}

export function reconstructPath(coefficients: FourierVector[], sampleCount = 512, progress = 1) {
  const last = Math.max(1, Math.round(sampleCount * Math.max(0, Math.min(1, progress))));
  return Array.from({ length: last }, (_, index) => evaluateEpicycles(coefficients, index / sampleCount).endpoint);
}

export function reconstructionError(original: Point2D[], coefficients: FourierVector[]) {
  if (!original.length || !coefficients.length) return 0;
  return original.reduce((sum, point, index) => {
    const rebuilt = evaluateEpicycles(coefficients, index / original.length).endpoint;
    return sum + (point.x - rebuilt.x) ** 2 + (point.y - rebuilt.y) ** 2;
  }, 0) / original.length;
}
