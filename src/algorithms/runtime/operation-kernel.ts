import type { AlgorithmDefinition, ComplexPoint, LabData, ParameterValue } from "../../domain/signal/signal.types";
import { getAlgorithmPlugin } from "../registry";
import { constellationReference as modulationConstellationReference, modulateBits } from "../modulation/shared/constellation";
import type { ModulationScheme } from "../modulation/shared/bit-mapping";

function emptyData(): LabData {
  return { kind: "none", sampleRate: 1, metrics: {}, metadata: {}, stages: [] };
}

function copyData(input?: LabData): LabData {
  if (!input) return emptyData();
  return {
    ...input,
    bits: input.bits ? [...input.bits] : undefined,
    samples: input.samples ? [...input.samples] : undefined,
    symbols: input.symbols ? input.symbols.map((point) => ({ ...point })) : undefined,
    metrics: { ...input.metrics },
    metadata: { ...input.metadata },
    stages: [...input.stages],
  };
}

function value(params: Record<string, ParameterValue>, key: string, fallback: number): number {
  const raw = params[key];
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function gaussianRandom(seed: number) {
  let state = seed >>> 0;
  const uniform = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 1) / 4294967297;
  };
  return () => Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform());
}

function rms(samples: number[]) {
  return samples.length ? Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length) : 0;
}

function mean(samples: number[]) {
  return samples.length ? samples.reduce((sum, sample) => sum + sample, 0) / samples.length : 0;
}

function base64ToBytes(value: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = value.replace(/[^A-Za-z0-9+/=]/g, "");
  const output: number[] = [];
  for (let index = 0; index < clean.length; index += 4) {
    const a = alphabet.indexOf(clean[index] ?? "A");
    const b = alphabet.indexOf(clean[index + 1] ?? "A");
    const c = clean[index + 2] === "=" ? -1 : alphabet.indexOf(clean[index + 2] ?? "A");
    const d = clean[index + 3] === "=" ? -1 : alphabet.indexOf(clean[index + 3] ?? "A");
    output.push((a << 2) | (b >> 4));
    if (c >= 0) output.push(((b & 15) << 4) | (c >> 2));
    if (d >= 0) output.push(((c & 3) << 6) | d);
  }
  return output;
}

function bytesToBase64(bytes: number[]) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index] ?? 0;
    const b = bytes[index + 1];
    const c = bytes[index + 2];
    output += alphabet[a >> 2];
    output += alphabet[((a & 3) << 4) | ((b ?? 0) >> 4)];
    output += b === undefined ? "=" : alphabet[((b & 15) << 2) | ((c ?? 0) >> 6)];
    output += c === undefined ? "=" : alphabet[c & 63];
  }
  return output;
}

function bytesFromDataUrl(payload: string) {
  const comma = payload.indexOf(",");
  if (comma < 0) return [];
  const header = payload.slice(0, comma);
  const body = payload.slice(comma + 1);
  return header.includes(";base64") ? base64ToBytes(body) : [...new TextEncoder().encode(decodeURIComponent(body))];
}

function bytesToBits(bytes: number[]) {
  const output = new Array<number>(bytes.length * 8);
  let cursor = 0;
  for (const byte of bytes) for (let bit = 7; bit >= 0; bit -= 1) output[cursor++] = (byte >> bit) & 1;
  return output;
}

function bitsToBytes(bits: number[], byteLength: number) {
  const output = new Array<number>(Math.max(0, byteLength));
  for (let byte = 0; byte < output.length; byte += 1) {
    let value = 0;
    for (let bit = 0; bit < 8; bit += 1) value = (value << 1) | (bits[byte * 8 + bit] ?? 0);
    output[byte] = value;
  }
  return output;
}

function byteDigest(bytes: number[]) {
  let hash = 2166136261;
  for (const byte of bytes) { hash ^= byte; hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function movingAverage(samples: number[], window: number) {
  const half = Math.floor(window / 2);
  return samples.map((_, index) => {
    let total = 0;
    let count = 0;
    for (let offset = -half; offset <= half; offset += 1) {
      const target = index + offset;
      if (target >= 0 && target < samples.length) {
        total += samples[target];
        count += 1;
      }
    }
    return count ? total / count : 0;
  });
}

function lineCode(bits: number[], scheme: string, sps: number) {
  const samples: number[] = [];
  let previous = -1;
  let ami = -1;
  let mltIndex = 0;
  const mlt = [0, 1, 0, -1];

  bits.forEach((bit) => {
    let levels: number[];
    if (scheme === "unipolar") levels = [bit];
    else if (scheme === "nrzl") levels = [bit ? 1 : -1];
    else if (scheme === "nrzi") {
      if (bit) previous *= -1;
      levels = [previous];
    } else if (scheme === "rz") levels = [bit ? 1 : -1, 0];
    else if (scheme === "manchester") levels = bit ? [-1, 1] : [1, -1];
    else if (scheme === "diffmanchester") {
      if (!bit) previous *= -1;
      const first = previous;
      previous *= -1;
      levels = [first, previous];
    } else if (scheme === "ami") {
      if (bit) ami *= -1;
      levels = [bit ? ami : 0];
    } else if (scheme === "pseudoternary") {
      if (!bit) ami *= -1;
      levels = [bit ? 0 : ami];
    } else {
      if (bit) mltIndex = (mltIndex + 1) % mlt.length;
      levels = [mlt[mltIndex]];
    }
    for (let index = 0; index < sps; index += 1) {
      const part = Math.min(levels.length - 1, Math.floor((index / sps) * levels.length));
      samples.push(levels[part]);
    }
  });
  return samples;
}

export function constellationReference(scheme: string): ComplexPoint[] {
  return modulationConstellationReference(scheme as ModulationScheme);
}

function hamming74(bits: number[]) {
  const padded = [...bits];
  while (padded.length % 4) padded.push(0);
  const output: number[] = [];
  for (let index = 0; index < padded.length; index += 4) {
    const [d1, d2, d3, d4] = padded.slice(index, index + 4);
    const p1 = d1 ^ d2 ^ d4;
    const p2 = d1 ^ d3 ^ d4;
    const p4 = d2 ^ d3 ^ d4;
    output.push(p1, p2, d1, p4, d2, d3, d4);
  }
  return output;
}

function hammingDecode(bits: number[]) {
  const output: number[] = [];
  let corrected = 0;
  for (let index = 0; index + 6 < bits.length; index += 7) {
    const block = bits.slice(index, index + 7);
    const s1 = block[0] ^ block[2] ^ block[4] ^ block[6];
    const s2 = block[1] ^ block[2] ^ block[5] ^ block[6];
    const s4 = block[3] ^ block[4] ^ block[5] ^ block[6];
    const syndrome = s1 + 2 * s2 + 4 * s4;
    if (syndrome > 0 && syndrome <= 7) {
      block[syndrome - 1] ^= 1;
      corrected += 1;
    }
    output.push(block[2], block[4], block[5], block[6]);
  }
  return { bits: output, corrected };
}

function crcRemainder(bits: number[], polynomial = [1, 0, 0, 0, 0, 0, 1, 1, 1]) {
  const work = [...bits];
  for (let index = 0; index <= work.length - polynomial.length; index += 1) {
    if (!work[index]) continue;
    for (let offset = 0; offset < polynomial.length; offset += 1) work[index + offset] ^= polynomial[offset];
  }
  return work.slice(-(polynomial.length - 1));
}

function quantify(samples: number[], levels: number) {
  const max = Math.max(1e-9, ...samples.map(Math.abs));
  const step = (2 * max) / Math.max(1, levels - 1);
  return samples.map((sample) => Math.max(-max, Math.min(max, Math.round((sample + max) / step) * step - max)));
}

function shaped(samples: number[], operation: string, sps: number, rolloff: number) {
  if (operation === "shape-rect") return samples;
  const window = Math.max(3, Math.round(sps * (operation === "shape-gaussian" ? 0.65 : 0.45 + rolloff * 0.35)) | 1);
  const center = (window - 1) / 2;
  const kernel = Array.from({ length: window }, (_, index) => {
    const x = (index - center) / Math.max(1, center);
    if (operation === "shape-gaussian") return Math.exp(-4.5 * x * x);
    const sinc = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
    const taper = 0.5 + 0.5 * Math.cos(Math.PI * x);
    return sinc * taper * (1 + rolloff * 0.2);
  });
  const total = kernel.reduce((sum, item) => sum + item, 0) || 1;
  return samples.map((_, index) => kernel.reduce((sum, coefficient, offset) => sum + coefficient * (samples[index - offset + Math.floor(window / 2)] ?? 0), 0) / total);
}

function detectBits(input: LabData, threshold: number) {
  const samples = input.samples ?? [];
  const sps = Math.max(1, input.samplesPerSymbol ?? 1);
  const bits: number[] = [];
  for (let index = 0; index < samples.length; index += sps) {
    const segment = samples.slice(index, index + sps);
    const decision = mean(segment);
    bits.push(decision > threshold ? 1 : 0);
  }
  return bits;
}

function demapSymbols(input: LabData) {
  const symbols = input.symbols ?? [];
  const scheme = String(input.metadata.constellationScheme ?? "bpsk");
  if (!symbols.length) return [];
  const reference = constellationReference(scheme);
  const bitsPerSymbol = Math.max(1, Math.round(Math.log2(Math.max(2, reference.length))));
  return symbols.flatMap((symbol) => {
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    reference.forEach((point, index) => {
      const candidate = (symbol.re - point.re) ** 2 + (symbol.im - point.im) ** 2;
      if (candidate < distance) { distance = candidate; nearest = index; }
    });
    return Array.from({ length: bitsPerSymbol }, (_, index) => (nearest >> (bitsPerSymbol - index - 1)) & 1);
  });
}

function withStage(data: LabData, algorithm: AlgorithmDefinition) {
  data.stages.push(algorithm.id);
  data.metadata.lastStage = algorithm.name;
  return data;
}

function executeOperationKernel(
  algorithm: AlgorithmDefinition,
  input: LabData | undefined,
  params: Record<string, ParameterValue>,
  runSeed = 1,
): LabData {
  let data = copyData(input);
  const op = algorithm.operation;
  const samples = data.samples ?? [];
  const bits = data.bits ?? data.originalBits ?? [];
  const sps = Math.round(value(params, "sps", data.samplesPerSymbol ?? 16));

  if (op.startsWith("media-source-")) {
    const mediaKind = op.replace("media-source-", "");
    const text = String(params.text ?? "");
    const payload = String(params.payload ?? "");
    const bytes = mediaKind === "text" ? [...new TextEncoder().encode(text)] : bytesFromDataUrl(payload);
    const outputBits = bytesToBits(bytes);
    const mimeType = mediaKind === "text" ? "text/plain;charset=utf-8" : String(params.mimeType ?? (mediaKind === "image" ? "image/jpeg" : "audio/webm"));
    data = {
      kind: "bits",
      bits: outputBits,
      originalBits: [...outputBits],
      sampleRate: 1,
      bitRate: 1000,
      metrics: { payloadBytes: bytes.length, payloadBits: outputBits.length },
      metadata: {
        mediaKind,
        mediaMimeType: mimeType,
        mediaFileName: String(params.fileName ?? `bitwave-${mediaKind}`),
        mediaByteLength: bytes.length,
        mediaDigest: byteDigest(bytes),
        mediaReady: bytes.length > 0,
        mediaWidth: Number(params.width ?? 0),
        mediaHeight: Number(params.height ?? 0),
        mediaDuration: Number(params.duration ?? 0),
        representation: "MSB-first media bytes",
      },
      stages: [],
    };
  } else if (op.startsWith("media-sink-")) {
    const expectedKind = op.replace("media-sink-", "");
    const mediaKind = String(data.metadata.mediaKind ?? "");
    if (mediaKind && mediaKind !== expectedKind) throw new Error(`Media type mismatch: ${mediaKind} cannot enter ${expectedKind} output`);
    const byteLength = Math.max(0, Number(data.metadata.mediaByteLength ?? Math.floor(bits.length / 8)));
    const received = bits.slice(0, byteLength * 8);
    const bytes = bitsToBytes(received, byteLength);
    const reference = data.originalBits ?? [];
    const compared = Math.min(reference.length, byteLength * 8);
    let errors = Math.abs(byteLength * 8 - received.length);
    for (let index = 0; index < compared; index += 1) if (reference[index] !== received[index]) errors += 1;
    const mimeType = String(data.metadata.mediaMimeType ?? (expectedKind === "image" ? "image/jpeg" : expectedKind === "audio" ? "audio/webm" : "text/plain;charset=utf-8"));
    data.metrics.mediaBitErrors = errors;
    data.metrics.mediaIntegrity = byteLength ? Math.max(0, 1 - errors / (byteLength * 8)) : 0;
    data.metrics.reconstructedBytes = bytes.length;
    data.metadata.reconstructedDigest = byteDigest(bytes);
    data.metadata.reconstructedFrom = `${received.length} received bits`;
    data.metadata.mediaReady = bytes.length > 0;
    if (expectedKind === "text") data.metadata.reconstructedText = new TextDecoder().decode(new Uint8Array(bytes));
    else if (bytes.length) data.metadata.reconstructedDataUrl = `data:${mimeType};base64,${bytesToBase64(bytes)}`;
  } else if (op === "source-bits") {
    const raw = String(params.bits ?? "1011001010110010").replace(/[^01]/g, "");
    const outputBits = raw.split("").map(Number);
    data = { kind: "bits", bits: outputBits, originalBits: outputBits, sampleRate: 1, bitRate: 1000, metrics: { bitCount: outputBits.length }, metadata: { representation: "binary" }, stages: [] };
  } else if (op.startsWith("source-") || op === "embedded-sensor") {
    const sampleRate = value(params, "sampleRate", 8000);
    const frequency = value(params, "frequency", 440);
    const amplitude = value(params, "amplitude", 1);
    const count = 512;
    const random = gaussianRandom(runSeed + 29);
    const output = Array.from({ length: count }, (_, index) => {
      const t = index / sampleRate;
      if (op === "embedded-sensor") return amplitude * (0.55 + 0.28 * Math.sin(2 * Math.PI * 3 * t) + 0.06 * random());
      if (op === "source-square") return Math.sin(2 * Math.PI * frequency * t) >= 0 ? amplitude : -amplitude;
      if (op === "source-chirp") return amplitude * Math.sin(2 * Math.PI * (frequency * t + 0.5 * frequency * 5 * t * t));
      if (op === "source-noise") return amplitude * random();
      return amplitude * Math.sin(2 * Math.PI * frequency * t);
    });
    data = { kind: "samples", samples: output, sampleRate, metrics: { frequency, rms: rms(output) }, metadata: { waveform: op.replace("source-", ""), source: op === "embedded-sensor" ? "physical sensor model" : "signal generator" }, stages: [] };
  } else if (op.startsWith("analysis-")) {
    const output = samples;
    const peak = output.length ? Math.max(...output.map(Math.abs)) : 0;
    data.metrics = { ...data.metrics, mean: mean(output), rms: rms(output), peak, crestFactor: rms(output) ? peak / rms(output) : 0, dc: mean(output) };
    if (op === "analysis-correlation" && output.length) {
      const lag = Math.max(1, Math.floor(output.length / 16));
      data.metrics.autocorrelation = output.slice(lag).reduce((sum, sample, index) => sum + sample * output[index], 0) / (output.length - lag);
    }
  } else if (op === "sampling-uniform") {
    const target = value(params, "sampleRate", data.sampleRate);
    const ratio = Math.max(1, Math.round(data.sampleRate / target));
    data.samples = samples.filter((_, index) => index % ratio === 0);
    data.sampleRate = data.sampleRate / ratio;
    data.metrics.nyquist = data.sampleRate / 2;
    data.metadata.aliasingRisk = ratio > 1 ? "نیازمند بررسی باند ورودی" : "کم";
  } else if (op === "sampling-decimate") {
    const factor = Math.round(value(params, "factor", 2));
    data.samples = samples.filter((_, index) => index % factor === 0);
    data.sampleRate /= factor;
    data.metrics.rateFactor = 1 / factor;
  } else if (op === "sampling-interpolate") {
    const factor = Math.round(value(params, "factor", 2));
    const output: number[] = [];
    samples.forEach((sample, index) => {
      const next = samples[index + 1] ?? sample;
      for (let step = 0; step < factor; step += 1) output.push(sample + ((next - sample) * step) / factor);
    });
    data.samples = output;
    data.sampleRate *= factor;
    data.metrics.rateFactor = factor;
  } else if (op.startsWith("quant-")) {
    const levels = Number(params.levels ?? 16);
    let companded = samples;
    if (op === "quant-mulaw") companded = samples.map((sample) => Math.sign(sample) * Math.log1p(255 * Math.abs(sample)) / Math.log(256));
    if (op === "quant-alaw") companded = samples.map((sample) => Math.sign(sample) * Math.log1p(87.6 * Math.abs(sample)) / Math.log(88.6));
    data.samples = quantify(companded, levels);
    const error = samples.map((sample, index) => sample - (data.samples?.[index] ?? 0));
    data.metrics.quantizationLevels = levels;
    data.metrics.quantizationNoiseRms = rms(error);
  } else if (op === "pcm") {
    const width = Math.round(value(params, "bitsPerSample", 8));
    const levels = 2 ** width;
    const max = Math.max(1e-9, ...samples.map(Math.abs));
    const output: number[] = [];
    samples.forEach((sample) => {
      const code = Math.max(0, Math.min(levels - 1, Math.round(((sample / max + 1) / 2) * (levels - 1))));
      for (let bit = width - 1; bit >= 0; bit -= 1) output.push((code >> bit) & 1);
    });
    data.kind = "bits";
    data.bits = output;
    delete data.samples;
    data.bitRate = data.sampleRate * width;
    data.metrics.bitsPerSample = width;
  } else if (op === "dpcm") {
    const differences = samples.map((sample, index) => sample - (samples[index - 1] ?? 0));
    data.samples = quantify(differences, Number(params.levels ?? 16));
    data.metrics.predictiveGain = rms(samples) / Math.max(1e-9, rms(differences));
  } else if (op === "embedded-adc") {
    const resolution = Number(params.resolution ?? 12);
    const targetRate = value(params, "sampleRate", data.sampleRate);
    const ratio = Math.max(1, Math.round(data.sampleRate / targetRate));
    const sampled = samples.filter((_, index) => index % ratio === 0);
    data.samples = quantify(sampled, 2 ** resolution);
    data.sampleRate = data.sampleRate / ratio;
    data.metrics.resolutionBits = resolution;
    data.metrics.lsbLevels = 2 ** resolution;
    data.metrics.conversionRate = data.sampleRate;
    data.metadata.peripheral = "ADC";
  } else if (op === "embedded-pwm") {
    const carrier = value(params, "carrier", 500);
    const period = Math.max(2, Math.round(data.sampleRate / carrier));
    const max = Math.max(1e-9, ...samples.map(Math.abs));
    data.samples = samples.map((sample, index) => {
      const duty = Math.max(0.03, Math.min(0.97, (sample / max + 1) / 2));
      return index % period < period * duty ? 1 : 0;
    });
    data.metrics.pwmFrequency = carrier;
    data.metrics.averageDuty = mean(data.samples);
    data.metadata.peripheral = "Timer/PWM";
  } else if (["embedded-uart", "embedded-spi", "embedded-i2c"].includes(op)) {
    const framed = op === "embedded-uart" ? [0, ...bits, 1, 1] : op === "embedded-i2c" ? [1, 0, ...bits, 0, 1] : bits;
    data.kind = "samples";
    data.samplesPerSymbol = sps;
    data.samples = lineCode(framed, op === "embedded-uart" ? "unipolar" : "nrzl", sps);
    data.sampleRate = op === "embedded-uart" ? value(params, "baud", 9600) * sps : (data.bitRate ?? 1000) * sps;
    data.metrics.frameBits = framed.length;
    data.metadata.bus = op.replace("embedded-", "").toUpperCase();
  } else if (op === "embedded-dma") {
    data.metrics.bufferLength = data.samples?.length ?? data.bits?.length ?? 0;
    data.metrics.cpuInterventions = 0;
    data.metadata.transfer = "peripheral → circular buffer";
  } else if (op === "rle") {
    const output: number[] = [];
    for (let index = 0; index < bits.length; ) {
      let count = 1;
      while (index + count < bits.length && bits[index + count] === bits[index] && count < 15) count += 1;
      output.push(bits[index], ...count.toString(2).padStart(4, "0").split("").map(Number));
      index += count;
    }
    data.bits = output;
    data.metrics.compressionRatio = output.length ? bits.length / output.length : 0;
  } else if (["huffman", "compression-model"].includes(op)) {
    const ones = bits.filter(Boolean).length;
    const probability = bits.length ? ones / bits.length : 0;
    const entropy = probability > 0 && probability < 1 ? -probability * Math.log2(probability) - (1 - probability) * Math.log2(1 - probability) : 0;
    data.metrics.entropy = entropy;
    data.metrics.estimatedCompressionRatio = entropy ? Math.min(8, 1 / entropy) : bits.length;
    data.metadata.model = algorithm.fidelity === "exact" ? "bit-exact" : "educational estimate";
  } else if (op === "parity") {
    const parity = bits.reduce((acc, bit) => acc ^ bit, 0);
    data.bits = [...bits, parity];
    data.metrics.redundancy = 1;
  } else if (op === "hamming74") {
    data.bits = hamming74(bits);
    data.metrics.codeRate = 4 / 7;
    data.metadata.code = "Hamming(7,4)";
  } else if (op === "crc8") {
    const payload = [...bits, ...Array(8).fill(0)];
    const remainder = crcRemainder(payload);
    data.bits = [...bits, ...remainder];
    data.metrics.crcBits = 8;
  } else if (op === "convolutional") {
    let state = 0;
    const output: number[] = [];
    bits.forEach((bit) => {
      const b1 = (state >> 1) & 1;
      const b0 = state & 1;
      output.push(bit ^ b0 ^ b1, bit ^ b1);
      state = ((state << 1) | bit) & 3;
    });
    data.bits = output;
    data.metrics.codeRate = 0.5;
  } else if (op === "fec-model") {
    const rate = algorithm.id.includes("ldpc") ? 0.75 : algorithm.id.includes("turbo") ? 1 / 3 : 0.67;
    const target = Math.ceil(bits.length / rate);
    data.bits = [...bits, ...Array.from({ length: target - bits.length }, (_, index) => bits[index % Math.max(1, bits.length)] ?? 0)];
    data.metrics.codeRate = rate;
    data.metadata.fecPayloadLength = bits.length;
    data.metadata.model = "educational redundancy model";
  } else if (op === "interleave") {
    const width = Math.max(2, Math.floor(Math.sqrt(bits.length)));
    const output: number[] = [];
    for (let column = 0; column < width; column += 1) for (let index = column; index < bits.length; index += width) output.push(bits[index]);
    data.bits = output;
  } else if (op.startsWith("line-")) {
    const scheme = op.replace("line-", "");
    data.kind = "samples";
    data.samples = lineCode(bits, scheme, sps);
    data.samplesPerSymbol = sps;
    data.sampleRate = (data.bitRate ?? 1000) * sps;
    data.metrics.transitions = data.samples.slice(1).filter((sample, index) => sample !== data.samples?.[index]).length;
    data.metrics.dc = mean(data.samples);
    data.metadata.encoding = algorithm.shortName;
  } else if (op === "lfsr" || op === "cdma") {
    let state = 0b1011011;
    data.bits = bits.map((bit) => {
      const feedback = ((state >> 6) ^ (state >> 5)) & 1;
      state = ((state << 1) | feedback) & 0x7f;
      return bit ^ feedback;
    });
    data.metrics.runLengthBefore = longestRun(bits);
    data.metrics.runLengthAfter = longestRun(data.bits);
  } else if (op.startsWith("mux-")) {
    if (op === "mux-fdm" && samples.length) {
      const offset = value(params, "offset", 800);
      data.samples = samples.map((sample, index) => sample * Math.cos((2 * Math.PI * offset * index) / data.sampleRate));
      data.metadata.frequencyOffset = offset;
    } else data.metadata.multiplexing = algorithm.shortName;
  } else if (op.startsWith("mod-")) {
    const scheme = op.replace("mod-", "") as ModulationScheme;
    const sampleRate = Math.max(8000, (data.bitRate ?? 1000) * sps);
    const result = modulateBits(bits, scheme, sps, value(params, "frequency", 1000), sampleRate);
    data.kind = "samples";
    data.samples = result.samples;
    data.symbols = result.symbols;
    data.samplesPerSymbol = sps;
    data.sampleRate = sampleRate;
    data.symbolRate = (data.bitRate ?? 1000) / result.bitsPerSymbol;
    data.metrics.bitsPerSymbol = result.bitsPerSymbol;
    data.metrics.averageSymbolEnergy = mean(result.symbols.map((point) => point.re * point.re + point.im * point.im));
    data.metadata.modulation = algorithm.shortName;
    data.metadata.constellationScheme = scheme;
    data.metadata.symbolMapping = ["qpsk", "8psk", "qam16", "qam64"].includes(scheme) ? "Gray-coded" : scheme === "fsk" || scheme === "gmsk" ? "Orthogonal basis" : "Binary";
  } else if (op.startsWith("shape-")) {
    data.samples = shaped(samples, op, sps, value(params, "rolloff", 0.35));
    data.metrics.rolloff = value(params, "rolloff", 0.35);
  } else if (op === "channel-awgn") {
    const targetSnr = value(params, "snr", 12);
    const signalPower = rms(samples) ** 2;
    const noisePower = signalPower / 10 ** (targetSnr / 10);
    const random = gaussianRandom(runSeed + algorithm.id.length * 97);
    data.samples = samples.map((sample) => sample + Math.sqrt(noisePower) * random());
    if (data.symbols) {
      const symbolSigma = Math.sqrt(1 / (2 * 10 ** (targetSnr / 10)));
      data.symbols = data.symbols.map((point) => ({ re: point.re + symbolSigma * random(), im: point.im + symbolSigma * random() }));
    }
    data.metrics.snr = targetSnr;
    data.metrics.noiseRms = Math.sqrt(noisePower);
  } else if (op === "channel-attenuation") {
    const loss = value(params, "loss", 6);
    const gain = 10 ** (-loss / 20);
    data.samples = samples.map((sample) => sample * gain);
    if (data.symbols) data.symbols = data.symbols.map((point) => ({ re: point.re * gain, im: point.im * gain }));
    data.metrics.pathLoss = loss;
  } else if (op === "channel-multipath") {
    const echo = value(params, "echo", 0.45);
    const delay = Math.max(1, Math.floor((data.samplesPerSymbol ?? 8) * 0.55));
    data.samples = samples.map((sample, index) => sample + echo * (samples[index - delay] ?? 0));
    if (data.symbols) data.symbols = data.symbols.map((point, index, points) => ({ re: point.re + echo * .45 * (points[index - 1]?.re ?? 0), im: point.im + echo * .45 * (points[index - 1]?.im ?? 0) }));
    data.metrics.delaySpreadSamples = delay;
  } else if (op === "channel-rayleigh" || op === "channel-rician") {
    const random = gaussianRandom(runSeed + 211);
    const k = op === "channel-rician" ? 3 : 0;
    data.samples = samples.map((sample, index) => {
      const slow = index % 24 === 0 ? random() : 0;
      const scatter = 0.72 + 0.18 * Math.sin(index / 41) + 0.08 * slow;
      const gain = k ? (Math.sqrt(k / (k + 1)) + scatter / Math.sqrt(k + 1)) : Math.abs(scatter);
      return sample * gain;
    });
    if (data.symbols) data.symbols = data.symbols.map((point, index) => { const scatter = .72 + .18 * Math.sin(index / 7); const gain = k ? Math.sqrt(k / (k + 1)) + scatter / Math.sqrt(k + 1) : Math.abs(scatter); return { re: point.re * gain, im: point.im * gain }; });
    data.metadata.fading = op.replace("channel-", "");
  } else if (op === "channel-cfo") {
    const offset = value(params, "offset", 30);
    data.samples = samples.map((sample, index) => sample * Math.cos((2 * Math.PI * offset * index) / data.sampleRate));
    if (data.symbols) data.symbols = data.symbols.map((point, index) => {
      const angle = (2 * Math.PI * offset * index) / Math.max(1, data.symbolRate ?? 1000);
      return { re: point.re * Math.cos(angle) - point.im * Math.sin(angle), im: point.re * Math.sin(angle) + point.im * Math.cos(angle) };
    });
    data.metrics.frequencyOffset = offset;
  } else if (op === "channel-clipping") {
    const limit = value(params, "limit", 0.8);
    data.samples = samples.map((sample) => Math.max(-limit, Math.min(limit, sample)));
    if (data.symbols) data.symbols = data.symbols.map((point) => ({ re: Math.max(-limit, Math.min(limit, point.re)), im: Math.max(-limit, Math.min(limit, point.im)) }));
    data.metrics.clippedSamples = samples.filter((sample) => Math.abs(sample) > limit).length;
  } else if (op === "sync-agc") {
    const level = rms(samples) || 1;
    data.samples = samples.map((sample) => sample / level);
    if (data.symbols) { const symbolLevel = Math.sqrt(mean(data.symbols.map((point) => point.re * point.re + point.im * point.im))) || 1; data.symbols = data.symbols.map((point) => ({ re: point.re / symbolLevel, im: point.im / symbolLevel })); }
    data.metrics.agcGain = 1 / level;
  } else if (op.startsWith("sync-")) {
    data.metadata.synchronization = algorithm.shortName;
    data.metrics.locked = true;
  } else if (op === "rx-matched") {
    data.samples = movingAverage(samples, Math.max(3, Math.floor((data.samplesPerSymbol ?? sps) / 2) | 1));
    data.metrics.processingGain = Math.sqrt(data.samplesPerSymbol ?? sps);
  } else if (op === "rx-equalizer") {
    const output = [...samples];
    for (let index = 1; index < output.length; index += 1) output[index] -= 0.25 * output[index - 1];
    data.samples = output;
    data.metadata.equalizer = algorithm.shortName;
  } else if (op === "envelope") {
    data.samples = movingAverage(samples.map(Math.abs), Math.max(3, Math.floor((data.samplesPerSymbol ?? 8) / 2) | 1));
  } else if (op === "rx-threshold") {
    const outputBits = data.symbols?.length ? demapSymbols(data) : detectBits(data, value(params, "threshold", 0));
    data.kind = "bits";
    data.bits = outputBits;
    delete data.samples;
    data.metrics.detectedBits = outputBits.length;
    data.metadata.detector = data.symbols?.length ? "nearest constellation point" : "time-domain threshold";
  } else if (op === "rx-ber") {
    const reference = data.originalBits ?? [];
    const count = Math.min(reference.length, bits.length);
    const errors = Array.from({ length: count }, (_, index) => Number(reference[index] !== bits[index])).reduce((sum, error) => sum + error, 0);
    data.kind = "metrics";
    data.metrics.bitErrors = errors;
    data.metrics.comparedBits = count;
    data.metrics.ber = count ? errors / count : 0;
  } else if (op === "decode-hamming") {
    const decoded = hammingDecode(bits);
    data.bits = decoded.bits;
    data.metrics.correctedWords = decoded.corrected;
  } else if (op === "decode-crc") {
    const remainder = crcRemainder(bits);
    const valid = remainder.every((bit) => bit === 0);
    data.metrics.crcValid = valid;
    data.bits = bits.slice(0, -8);
  } else if (op === "decode-viterbi") {
    data.bits = bits.filter((_, index) => index % 2 === 0);
    data.metadata.decoder = "hard-decision educational path";
  } else if (op === "decode-deinterleave") {
    const width = Math.max(2, Math.floor(Math.sqrt(bits.length)));
    const restored = Array(bits.length).fill(0);
    let cursor = 0;
    for (let column = 0; column < width; column += 1) {
      for (let index = column; index < bits.length; index += width) restored[index] = bits[cursor++] ?? 0;
    }
    data.bits = restored;
    data.metadata.decoder = "inverse block permutation";
  } else if (op === "decode-descramble") {
    let state = 0b1011011;
    data.bits = bits.map((bit) => {
      const feedback = ((state >> 6) ^ (state >> 5)) & 1;
      state = ((state << 1) | feedback) & 0x7f;
      return bit ^ feedback;
    });
    data.metrics.runLengthAfterDescramble = longestRun(data.bits);
  } else if (op === "decode-parity") {
    const payload = bits.slice(0, -1);
    const receivedParity = bits.at(-1) ?? 0;
    data.bits = payload;
    data.metrics.parityValid = payload.reduce((acc, bit) => acc ^ bit, 0) === receivedParity;
  } else if (op === "decode-fecmodel") {
    const payloadLength = Number(data.metadata.fecPayloadLength ?? bits.length);
    data.bits = bits.slice(0, Math.max(0, payloadLength));
    data.metadata.decoder = `${algorithm.shortName} educational recovery`;
  } else if (op === "decode-rle") {
    const restored: number[] = [];
    for (let index = 0; index + 4 < bits.length; index += 5) {
      const symbol = bits[index];
      const count = Number.parseInt(bits.slice(index + 1, index + 5).join(""), 2) || 1;
      restored.push(...Array(count).fill(symbol));
    }
    data.bits = restored;
    data.metrics.decompressedBits = restored.length;
  } else if (op === "recon-hold") {
    const factor = Math.round(value(params, "factor", 4));
    data.samples = samples.flatMap((sample) => Array(factor).fill(sample));
    data.sampleRate *= factor;
  } else if (op === "recon-lowpass") {
    data.samples = movingAverage(samples, Math.round(value(params, "window", 7)) | 1);
  } else {
    data.metadata.model = "educational pass-through";
  }

  data.kind = algorithm.output === "same" ? data.kind : algorithm.output;
  return data;
}

export function runAlgorithm(
  algorithm: AlgorithmDefinition,
  input: LabData | undefined,
  params: Record<string, ParameterValue>,
  runSeed = 1,
): LabData {
  const plugin = getAlgorithmPlugin(algorithm.id);
  const result = plugin
    ? plugin.process({
        input,
        params,
        context: { seed: runSeed, executeOperation: executeOperationKernel },
      })
    : executeOperationKernel(algorithm, input, params, runSeed);
  result.kind = algorithm.output === "same" ? result.kind : algorithm.output;
  return withStage(result, algorithm);
}

function longestRun(bits: number[]) {
  let longest = 0;
  let current = 0;
  let previous = -1;
  bits.forEach((bit) => {
    current = bit === previous ? current + 1 : 1;
    previous = bit;
    longest = Math.max(longest, current);
  });
  return longest;
}
