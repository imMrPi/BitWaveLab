import type { LabData } from "../../../domain/signal/signal.types";

export function formatSignalNumber(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1000) return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1, notation: "compact" }).format(value);
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(2);
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 }).format(value);
}

export function formatSignalMetric(value: number | string | boolean) {
  if (typeof value === "number") return formatSignalNumber(value);
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  return value;
}

export function waveformFor(data?: LabData) {
  if (!data) return [];
  if (data.kind === "metrics") return [];
  if (data.kind === "bits" || data.kind === "frames") return data.bits?.flatMap((bit) => Array(16).fill(bit ? 1 : -1)) ?? [];
  if (data.kind === "symbols") return data.symbols?.flatMap((point) => [point.re, point.im]) ?? [];
  if (data.samples?.length) return data.samples;
  if (data.bits?.length) return data.bits.flatMap((bit) => Array(16).fill(bit ? 1 : -1));
  if (data.symbols?.length) return data.symbols.flatMap((point) => [point.re, point.im]);
  return [];
}

export function bitStreamFor(data?: LabData) {
  if (!data?.bits?.length) return [];
  if (data.kind === "bits" || data.kind === "frames") return data.bits;
  if (data.kind === "samples" && data.metadata.constellationScheme) return data.bits;
  return [];
}

export function constellationFor(data?: LabData) {
  if (!data?.symbols?.length || data.kind === "metrics") return [];
  if (data.kind === "symbols") return data.symbols;
  if (data.kind === "samples" && data.metadata.constellationScheme) return data.symbols;
  return [];
}

export function effectiveSampleRateFor(data?: LabData) {
  if (!data) return 1;
  if (data.kind === "bits" || data.kind === "frames") return Math.max(1, data.bitRate ?? data.sampleRate ?? 1) * 16;
  if (data.kind === "symbols") return Math.max(1, data.symbolRate ?? 1) * 2;
  return Math.max(1, data.sampleRate || 1);
}

export function signalDataLength(data?: LabData) {
  if (!data) return 0;
  if (data.kind === "metrics") return Object.keys(data.metrics).length;
  if (data.kind === "bits" || data.kind === "frames") return data.bits?.length ?? 0;
  if (data.kind === "symbols") return data.symbols?.length ?? 0;
  return data.samples?.length ?? data.bits?.length ?? data.symbols?.length ?? 0;
}

export function pathFromSamples(samples: number[], width = 1000, height = 210) {
  if (!samples.length) return "";
  const visible = samples.slice(0, 900);
  const max = Math.max(1e-6, ...visible.map(Math.abs));
  return visible
    .map((sample, index) => {
      const x = (index / Math.max(1, visible.length - 1)) * width;
      const y = height / 2 - (sample / max) * (height * 0.38);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function getSignalStats(data?: LabData) {
  const values = waveformFor(data);
  const peak = values.length ? Math.max(...values.map(Math.abs)) : 0;
  const rms = values.length ? Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length) : 0;
  const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  return { values, peak, rms, mean };
}
